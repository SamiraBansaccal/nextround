import type { SourcedSentence } from "@/lib/types";

/** A generated document as plain text, to copy or download: a CV keeps its section titles. */
export function documentPlainText(kind: "cv" | "cover_letter", sentences: (SourcedSentence & { section?: string })[]): string {
  if (kind === "cover_letter") return sentences.map((s) => s.text).join(" ");
  const lines: string[] = [];
  let section: string | undefined;
  for (const s of sentences) {
    if (s.section && s.section !== section) {
      if (lines.length > 0) lines.push("");
      lines.push(s.section.toUpperCase());
      section = s.section;
    }
    lines.push(s.text);
  }
  return lines.join("\n");
}
