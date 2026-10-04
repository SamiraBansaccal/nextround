"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { aiErrorMessage, AiError } from "@/lib/ai/errors";
import { resolvePageReader } from "@/lib/ai/config";
import { consumeInstanceQuota } from "@/lib/ai/usage";
import { getAccount, requireUserId } from "@/lib/server/auth";
import { listFacts } from "@/lib/data/facts";
import { OFFERS_COPY } from "@/lib/i18n/offers";
import { getUiLang } from "@/lib/i18n/server";
import { fill } from "@/lib/interview/copy";
import { createOffer, getOfferDetail, markApplied, setOfferStatus, setRequirementFacts } from "@/lib/data/offers";
import { extractOffer } from "@/lib/offers/extract";
import { fetchPageText, firecrawlPageText, looksBlocked, MAX_PAGE_TEXT, PageFetchError, sourceSiteFor } from "@/lib/offers/fetch-page";
import { matchRequirements } from "@/lib/offers/match";

export type AddOfferResult = { ok: true; offerId: string; dropped: number } | { ok: false; error: string; needText?: boolean };

const addSchema = z.object({
  url: z.string().trim().max(2000).optional(),
  text: z.string().trim().max(MAX_PAGE_TEXT * 2).optional(),
});

/** Add an offer by URL (main flow) or by pasted text; the AI scans it and the code verifies every quote. */
export async function addOfferAction(input: unknown): Promise<AddOfferResult> {
  const account = await getAccount();
  const lang = await getUiLang(); // messages in the site's language
  const t = OFFERS_COPY[lang];
  const parsed = addSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: t.checkLinkOrText };
  const url = parsed.data.url || null;
  let text = parsed.data.text ?? "";

  if (!text) {
    if (!url) return { ok: false, error: t.pasteLinkOrText };
    try {
      // The instance's Firecrawl key serves the owner only (quota); other accounts use their own key or the free reader.
      const reader = await resolvePageReader(account.userId, account.isOwner);
      if (reader.provider === "firecrawl") {
        if (reader.source === "instance") await consumeInstanceQuota(account.userId, "scrape");
        text = await firecrawlPageText(url, reader.apiKey).catch(() => fetchPageText(url));
      } else {
        text = await fetchPageText(url);
      }
    } catch (error) {
      if (error instanceof PageFetchError && (error.reason === "invalid_url" || error.reason === "blocked_address")) {
        return { ok: false, error: t.publicLinksOnly };
      }
      if (error instanceof AiError) {
        const message = error.code === "rate_limited" ? t.tooManyPages : t.dailyPageLimit;
        return { ok: false, error: message, needText: true };
      }
      return { ok: false, error: t.needText, needText: true };
    }
    if (looksBlocked(text)) return { ok: false, error: t.needText, needText: true };
  } else if (text.length < 200) {
    return { ok: false, error: t.tooShort };
  }
  text = text.slice(0, MAX_PAGE_TEXT);

  const facts = (await listFacts(account.userId)).filter((f) => f.validated);
  try {
    const extraction = await extractOffer({ userId: account.userId, isOwner: account.isOwner }, text, facts);
    if (extraction.requirements.length === 0) {
      return { ok: false, error: t.noRequirement };
    }
    const offer = await createOffer(account.userId, { sourceUrl: url, sourceSite: sourceSiteFor(url), rawText: text, extraction });
    revalidatePath("/", "layout");
    return { ok: true, offerId: offer.id, dropped: extraction.dropped };
  } catch (error) {
    return { ok: false, error: aiErrorMessage(error, lang) };
  }
}

export async function markAppliedAction(offerId: unknown): Promise<{ ok: boolean }> {
  const userId = await requireUserId();
  const ok = typeof offerId === "string" && (await markApplied(userId, offerId));
  revalidatePath("/", "layout");
  return { ok };
}

export async function setOfferStatusAction(input: unknown): Promise<{ ok: boolean }> {
  const userId = await requireUserId();
  const parsed = z.object({ offerId: z.string().uuid(), status: z.enum(["saved", "applied", "interview", "offer", "rejected"]) }).safeParse(input);
  if (!parsed.success) return { ok: false };
  const ok = await setOfferStatus(userId, parsed.data.offerId, parsed.data.status);
  revalidatePath("/", "layout");
  return { ok };
}

/**
 * Matches an offer's requirements again with the CURRENT validated facts (one AI call): for offers saved
 * before the facts were validated, or after the profile changed.
 */
export async function rematchOfferAction(offerId: unknown): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  const account = await getAccount();
  const lang = await getUiLang();
  const t = OFFERS_COPY[lang];
  if (typeof offerId !== "string") return { ok: false, error: t.offerNotFound };
  const detail = await getOfferDetail(account.userId, offerId);
  if (!detail) return { ok: false, error: t.offerNotFound };
  const facts = await listFacts(account.userId);
  if (!facts.some((f) => f.validated)) return { ok: false, error: t.validateFirst };
  try {
    const links = await matchRequirements({ userId: account.userId, isOwner: account.isOwner }, detail.requirements, facts);
    await setRequirementFacts(account.userId, detail.offer.id, links);
    revalidatePath("/", "layout");
    const covered = [...links.values()].filter((ids) => ids.length > 0).length;
    return { ok: true, message: fill(t.rematchDone, { covered, total: links.size }) };
  } catch (error) {
    return { ok: false, error: aiErrorMessage(error, lang) };
  }
}
