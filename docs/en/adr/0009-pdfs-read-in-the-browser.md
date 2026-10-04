# 📄 ADR 0009 — CV PDFs are read in the browser; only their text reaches the server

> 🇫🇷 French version: [FR/adr/0009](../../fr/adr/0009-pdf-lus-dans-le-navigateur.md)

- **Date:** 2026-10-03
- **Status:** ✅ accepted

## 🎯 Context

The spec asks for CV or LinkedIn PDF imports (PDF only, up to 5 MB), and the author wants to add
**as many CVs as they have** — one per job they applied to — so that all of them feed one fact base.
Vercel functions accept **at most 4.5 MB** per request body, which is below the 5 MB limit of the
spec; Next.js server actions default to 1 MB.

## ✅ Decision

- The PDF is opened **in the browser** with `unpdf` (a serverless build of PDF.js), after three
  checks: `.pdf` name / `application/pdf` type, size ≤ 5 MB, and the first bytes are `%PDF-`.
- Only `{ fileName, text }` is sent to the server action `importCvTextAction`, which validates it
  with zod (100 to 60,000 characters, cut to 15,000 for the AI).
- Several files can be selected at once; they are processed one after the other, with a status
  per file. Facts already found in another CV are not proposed again (`factKey`: case,
  punctuation and spacing ignored).
- Each CV is a row of `sources`; its facts point to it with `source_ref = "cv:<source id>"` (two
  CVs may share a file name). Removing a CV removes its **unvalidated** facts and keeps the
  validated ones.

## 📊 Consequences

**Good** 👍

- **The PDF never leaves the user's computer**: a privacy gain worth stating.
- No request-size limit to fight, whatever the PDF weight.
- Measured: a 19 KB PDF gave 408 characters of text and 11 proposed facts, all with a verified quote.

**Bad** 👎

- **Scanned PDFs (images) have no text**: they are refused ("almost no text — is it a scan?").
  No OCR.
- The server cannot prove the text came from a PDF: a user could send any text as their "CV".
  Acceptable — it is the user's own data, they could also type facts by hand.
- Text extraction loses the layout (columns, tables); quotes still have to be verbatim *in the
  extracted text*, which is what the user sees in the quote.
