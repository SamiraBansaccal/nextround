"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { aiErrorMessage, AiError } from "@/lib/ai/errors";
import { consumeInstanceQuota } from "@/lib/ai/usage";
import { getAccount, requireUserId } from "@/lib/auth";
import { listFacts } from "@/lib/data/facts";
import { createOffer, markApplied } from "@/lib/data/offers";
import { serverEnv } from "@/lib/env";
import { extractOffer } from "@/lib/offers/extract";
import { fetchPageText, firecrawlPageText, looksBlocked, MAX_PAGE_TEXT, PageFetchError, sourceSiteFor } from "@/lib/offers/fetch-page";

export type AddOfferResult = { ok: true; offerId: string; dropped: number } | { ok: false; error: string; needText?: boolean };

const addSchema = z.object({
  url: z.string().trim().max(2000).optional(),
  text: z.string().trim().max(MAX_PAGE_TEXT * 2).optional(),
});

const NEED_TEXT = "This page blocks access or needs a login. Paste the offer text instead.";

/** Add an offer by URL (main flow) or by pasted text; the AI scans it and the code verifies every quote. */
export async function addOfferAction(input: unknown): Promise<AddOfferResult> {
  const account = await getAccount();
  const parsed = addSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the link or the text." };
  const url = parsed.data.url || null;
  let text = parsed.data.text ?? "";

  if (!text) {
    if (!url) return { ok: false, error: "Paste a link to the offer, or its text." };
    try {
      const firecrawlKey = serverEnv().FIRECRAWL_API_API_KEY;
      if (firecrawlKey) {
        await consumeInstanceQuota(account.userId, "scrape");
        text = await firecrawlPageText(url, firecrawlKey).catch(() => fetchPageText(url));
      } else {
        text = await fetchPageText(url);
      }
    } catch (error) {
      if (error instanceof PageFetchError && (error.reason === "invalid_url" || error.reason === "blocked_address")) {
        return { ok: false, error: "Only public http(s) links are accepted." };
      }
      if (error instanceof AiError) return { ok: false, error: "Daily page-reading limit reached. Paste the offer text instead.", needText: true };
      return { ok: false, error: NEED_TEXT, needText: true };
    }
    if (looksBlocked(text)) return { ok: false, error: NEED_TEXT, needText: true };
  } else if (text.length < 200) {
    return { ok: false, error: "This text is too short to be a job offer." };
  }
  text = text.slice(0, MAX_PAGE_TEXT);

  const facts = (await listFacts(account.userId)).filter((f) => f.validated);
  try {
    const extraction = await extractOffer({ userId: account.userId, isOwner: account.isOwner }, text, facts);
    if (extraction.requirements.length === 0) {
      return { ok: false, error: "No requirement could be verified in this text. Try pasting the full offer text." };
    }
    const offer = await createOffer(account.userId, { sourceUrl: url, sourceSite: sourceSiteFor(url), rawText: text, extraction });
    revalidatePath("/", "layout");
    return { ok: true, offerId: offer.id, dropped: extraction.dropped };
  } catch (error) {
    return { ok: false, error: aiErrorMessage(error) };
  }
}

export async function markAppliedAction(offerId: unknown): Promise<{ ok: boolean }> {
  const userId = await requireUserId();
  const ok = typeof offerId === "string" && (await markApplied(userId, offerId));
  revalidatePath("/", "layout");
  return { ok };
}
