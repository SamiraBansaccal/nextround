// Job offers from Actiris (actiris.brussels), saved as text files ready for `npm run owner:import-offers`.
//   npm run offers:actiris -- search [keywords…]     IT offers in the Brussels region (prints reference:type)
//   npm run offers:actiris -- fetch 5949141:Hrxml …  saves each offer's text to .local/offers/<ref>.txt
// Uses the public JSON endpoint behind the site's search page, and a headless browser for offer pages
// (rendered by JavaScript). Gentle: one page at a time, with a pause.
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const SEARCH = "https://www.actiris.brussels/Umbraco/api/OffersApi/GetAllOffers";
const DETAIL = "https://www.actiris.brussels/fr/citoyens/detail-offre-d-emploi/";
const DEFAULT_KEYWORDS = ["développeur", "developer", "junior", "devops", "C++", "java", "python", "javascript", "react", "node", "full stack", "linux", "software engineer", "web", "php", "cloud", "docker"];

interface ActirisOffer {
  reference: string;
  typeOffre: string;
  titreFr: string | null;
  titreNl: string | null;
  codePostal: string | null;
  codeDomaineImt: string;
  employeur: { nomFr: string } | null;
  typeContratLibelle: string | null;
  dateCreation: string;
}

async function search(keywords: string[]) {
  const found = new Map<string, ActirisOffer>();
  for (const texte of keywords) {
    for (let page = 1; page <= 3; page++) {
      const body = {
        offreFilter: { texte, codesPostal: [], codesContrat: [], domainesImt: [], secteursPanorama: [], references: null, localisation: "Tout", keywordSearchType: "Partout", isOffreActiris: false, isOffreVdabForem: false, isOfferPartner: false, isOffreHandicap: false },
        pageOption: { page, from: 0, pageSize: 50 },
      };
      const response = await fetch(SEARCH, { method: "POST", headers: { "Content-Type": "application/json", "Accept-Language": "fr" }, body: JSON.stringify(body) });
      const items: ActirisOffer[] = response.ok ? ((await response.json()).items ?? []) : [];
      for (const item of items) found.set(item.reference, item);
      if (items.length < 50) break;
    }
  }
  const brussels = (o: ActirisOffer) => Number(o.codePostal) >= 1000 && Number(o.codePostal) < 1300;
  const it = (o: ActirisOffer) => o.codeDomaineImt.startsWith("Q"); // Actiris job family "Q": IT
  const offers = [...found.values()].filter((o) => brussels(o) && it(o)).sort((a, b) => b.dateCreation.localeCompare(a.dateCreation));
  for (const o of offers) {
    const title = (o.titreFr ?? o.titreNl ?? "").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/\s+/g, " ").trim();
    console.log(`${o.reference}:${o.typeOffre}\t${o.dateCreation.slice(0, 10)}\t${title}\t${o.employeur?.nomFr ?? "?"}\t${o.typeContratLibelle ?? ""}`);
  }
  console.error(`${offers.length} IT offers in Brussels (${found.size} found).`);
}

async function fetchOffers(refs: string[]) {
  mkdirSync(".local/offers", { recursive: true });
  // In a Claude cloud session the browser must go through the sandbox proxy, which re-signs TLS.
  const proxy = process.env.HTTPS_PROXY;
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: proxy ? [`--proxy-server=${proxy}`] : [],
  });
  const context = await browser.newContext({ ignoreHTTPSErrors: Boolean(proxy) });
  for (const ref of refs) {
    const [reference, type = "Hrxml"] = ref.split(":");
    const url = `${DETAIL}?reference=${reference}&type=${type}`;
    let saved = false;
    for (let attempt = 0; attempt < 3 && !saved; attempt++) {
      const page = await context.newPage();
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
        await page.getByText("Référence").first().waitFor({ timeout: 30_000 });
        const text = (await page.evaluate(() => document.querySelector("main")?.innerText ?? "")).replace(/\n{3,}/g, "\n\n");
        const start = text.indexOf("OFFRES D'EMPLOI");
        const body = text.slice(Math.max(start, 0)).split(/\nPostuler|\nPartager cette offre|\nOffres similaires/)[0].trim();
        writeFileSync(`.local/offers/${reference}.txt`, `URL: ${url}\n\n${body}\n`);
        console.log(`${reference}: ${body.split("\n")[1] ?? ""}`);
        saved = true;
      } catch {
        // retried below
      } finally {
        await page.close();
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
    if (!saved) console.log(`${reference}: could not be read.`);
  }
  await browser.close();
}

const [command, ...args] = process.argv.slice(2);
if (command === "search") await search(args.length ? args : DEFAULT_KEYWORDS);
else if (command === "fetch" && args.length) await fetchOffers(args);
else console.error("Usage: npm run offers:actiris -- search [keywords…] | fetch <reference:type> …");
