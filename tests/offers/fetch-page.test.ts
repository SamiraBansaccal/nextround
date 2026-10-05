import { describe, expect, it, vi } from "vitest";
import type { LookupAddress } from "node:dns";
import { assertPublicHttpUrl, fetchPageText, htmlToText, looksBlocked, publicLookup, sourceSiteFor } from "@/lib/offers/fetch-page";

// SSRF protection and page reading. Literal IP addresses are used so that no DNS is involved.

describe("assertPublicHttpUrl (SSRF protection)", () => {
  const refused = [
    "http://127.0.0.1/",
    "http://localhost:3000/",
    "http://169.254.169.254/latest/meta-data", // cloud metadata
    "http://10.0.0.5/",
    "http://172.16.0.1/",
    "http://192.168.1.1/",
    "http://100.64.0.1/", // carrier-grade NAT
    "http://0.0.0.0/",
    "http://[::1]/",
    "http://[fd00::1]/",
    "http://[::ffff:127.0.0.1]/", // IPv4-mapped IPv6, normalised by URL to [::ffff:7f00:1]
    "http://[::ffff:a9fe:a9fe]/", // = 169.254.169.254 in hex form
    "http://2130706433/", // 127.0.0.1 written as one decimal number
    "http://0177.0.0.1/", // 127.0.0.1 written in octal
    "http://[fe90::1]/", // link-local fe80::/10 does not only start with fe80
    "http://[64:ff9b::a00:1]/", // NAT64 embedding 10.0.0.1
  ];
  for (const url of refused) {
    it(`refuses ${url}`, async () => {
      await expect(assertPublicHttpUrl(url)).rejects.toMatchObject({ reason: "blocked_address" });
    });
  }

  for (const url of ["file:///etc/passwd", "ftp://example.com/", "javascript:alert(1)", "https://user:pass@example.com/", "not a url"]) {
    it(`refuses ${url} as invalid`, async () => {
      await expect(assertPublicHttpUrl(url)).rejects.toMatchObject({ reason: "invalid_url" });
    });
  }

  it("accepts a public IPv4-mapped IPv6 address", async () => {
    await expect(assertPublicHttpUrl("http://[::ffff:5db8:d822]/")).resolves.toBeInstanceOf(URL); // 93.184.216.34
  });

  it("accepts a public address", async () => {
    await expect(assertPublicHttpUrl("http://93.184.216.34/jobs/1")).resolves.toBeInstanceOf(URL);
  });
});

describe("publicLookup (DNS rebinding)", () => {
  // The lookup run when the connection opens: a name that resolves to a private address is refused there
  // too, whatever the first check saw. "localhost" resolves locally (no network needed).
  const resolve = (all: boolean) =>
    new Promise<{ error: Error | null; found: string | LookupAddress[] }>((done) =>
      publicLookup("localhost", { all }, ((error: Error | null, found: string | LookupAddress[]) => done({ error, found })) as never),
    );

  it("refuses a host that resolves to a private address, with or without `all`", async () => {
    expect((await resolve(false)).error).toMatchObject({ reason: "blocked_address" });
    expect((await resolve(true)).error).toMatchObject({ reason: "blocked_address" });
  });
});

describe("htmlToText", () => {
  it("keeps the readable text and drops scripts, styles and navigation", () => {
    const html = `<html><head><style>.x{}</style><script>evil()</script></head><body><nav>Menu</nav>
      <h1>Junior developer</h1><p>We need <b>React</b> &amp; TypeScript.</p><ul><li>Docker</li></ul><footer>©</footer></body></html>`;
    const text = htmlToText(html);
    expect(text).toContain("Junior developer");
    expect(text).toContain("We need React & TypeScript.");
    expect(text).toContain("- Docker");
    expect(text).not.toMatch(/evil|Menu|\.x\{\}/);
  });
});

describe("looksBlocked and sourceSiteFor", () => {
  it("flags login walls and near-empty pages", () => {
    expect(looksBlocked("Sign in to see this job")).toBe(true);
    expect(looksBlocked("x".repeat(3000))).toBe(false);
  });
  it("derives the source site from the domain", () => {
    expect(sourceSiteFor("https://be.indeed.com/viewjob?jk=1")).toBe("indeed");
    expect(sourceSiteFor("https://www.actiris.brussels/fr/citoyens/offres-d-emploi/")).toBe("actiris");
    expect(sourceSiteFor("https://www.leforem.be/recherche-offres/")).toBe("forem");
    expect(sourceSiteFor("https://www.linkedin.com/jobs/view/1")).toBe("linkedin");
    expect(sourceSiteFor("https://careers.example.com/1")).toBe("company");
    expect(sourceSiteFor(null)).toBe("other");
  });
});

describe("page size limit", () => {
  it("stops reading a page past 2 MB, without downloading the rest", async () => {
    let pulled = 0;
    const endless = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulled++;
        controller.enqueue(new Uint8Array(256 * 1024));
      },
    });
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(endless, { status: 200 }));
    try {
      await expect(fetchPageText("http://93.184.216.34/offer")).rejects.toThrow("unreachable");
      expect(pulled).toBeLessThan(12); // ~2 MB, not the whole stream
    } finally {
      spy.mockRestore();
    }
  });
});
