---
layer: application
type: application
subject: cv-parsing-and-career-reading
technique: text-extraction-damage-and-repair
stack: process
verified_on: 2026-08-20
---

# The extraction module (Python analysis pipeline)

`pipeline/jobfit/extractors.py` — 202 lines — is the entry point of the extraction
context. It handles four input types (`extract_text`, `:61`: `.txt`/`.md`, `.docx`,
`.pdf`, everything else rejected by `ValueError`), and everything else in the file is
damage repair or hostile-input defence.

## Mojibake repair as a scored competition

`repair_text_encoding` (`:83`) is the upward lesson the standard now carries. It does not
"fix" anything — it produces candidate readings and elects one:

1. **Cheap gate.** `:85` checks for the characteristic markers (`Ä`, `Ĺ`, `Ĺˇ`, `Ĺľ`,
   `Ĺ™`, `Ă`) and returns the input untouched when none appear, so clean documents never
   pay for the pass.
2. **Two repairs.** A `MOJIBAKE_REPLACEMENTS` substitution table (`:25`), and a full
   re-encode/re-decode `text.encode("cp1250").decode("utf-8")` (`:92`) — the exact
   inverse of the UTF-8-read-as-Windows-1250 corruption seen in Czech exports. The
   re-decode is wrapped in `except UnicodeError` and degrades to the substitution
   reading rather than to nothing.
3. **Election.** `:95` — `max((text, replaced, repaired), key=_czech_signal_score)`,
   where `_czech_signal_score` (`:98`) simply counts occurrences of `áčďéěíňóřšťúůýž`.
   The **original is in the candidate set**, so a repair that makes the text worse
   cannot win, which is what makes the pass safe to run on documents it does not
   understand.

`clean_text` (`:73`) then normalises in the correct order — repair first, then NFC,
null-byte scrub, newline canonicalisation, whitespace collapse — so normalisation never
freezes corruption in place.

## Letter-spaced reconstruction, single-sourced with its metric

`collapse_letter_spacing` (`:153`) rejoins `K n o w l e d g e` → `Knowledge`, the
characteristic output of character-positioned PDF text. Two details are the craft:

- **The repair and the quality metric share one definition.** `_LETTER = r"[^\W\d_]"`
  (`:131`) is the Unicode letter class used by both `_LETTER_SPACED_RUN` (`{2,}`,
  repairs aggressively) and `_LETTER_SPACED_COUNT` (`{3,}`, counts conservatively). The
  comment at `:125-130` states the reason: `pipeline.compare_extraction_quality` consumes
  the count via `count_letter_spacing` (`:176`), and the two views are "kept explicit
  here rather than re-derived in pipeline.py" so the metric and the repair cannot drift.
  `pipeline.py:483 _letter_spacing_hits` is a one-line delegation for exactly that
  reason.
- **The repair is bounded, and not for correctness — for availability.** `:143-151`
  records the incident: the repair is an O(n) pass with a Python callback per match, so a
  crafted multi-megabyte buffer of "a a a a …" — "the exact pathology it *repairs*, at
  extreme length" — pins a worker's CPU on the public extract/apply path.
  `MAX_REPAIR_CHARS = 200_000` and `MAX_LETTER_SPACED_SUBS = 50_000` cap the window and
  the substitution count; the unrepaired tail passes through verbatim. The caps are sized
  from the real distribution: "A real CV's extracted text is well under ~100 KB."

The repair also deliberately under-merges: compound terms become `Knowledge - bases`
with the surrounding spaces preserved, "to avoid over-merging legitimate `word - word`
separators" (`:161-163`) — repair stops where it would become invention.

## Hostile-document defences

Four budgets at `:18-22` — `MAX_INPUT_BYTES` 25 MB on disk, `MAX_DOCX_XML_BYTES` 40 MB
decompressed, `MAX_PDF_PAGES` 200, `MAX_TEXT_CHARS` 2 000 000 cumulative — plus
`defusedxml` (`:9`) to block entity-expansion ("billion laughs") bombs that the standard
library parser resolves. `_extract_docx` (`:102`) checks the declared `file_size` of the
archive member *before* decompressing: "a tiny `.docx` can declare a multi-GB body"
(`:108`). Each limit raises with a message naming the limit, so the refusal is legible to
the recruiter rather than a stack trace.

The 25 MB cap is re-asserted at the model boundary (`gemini.py:610`) because the pre-pass
deliberately *degrades* an oversize rejection to a note and lets the analysis continue —
without the second check "a 200 MB 'CV' would be read whole into memory here."

## Where the repo differs from the standard

Two gaps, and the standard is unchanged by them:

- **No recovered-text quality floor gates the run.** `compare_extraction_quality`
  (`pipeline.py:461`) computes letter-spacing hit counts and text lengths and emits a
  prose *recommendation* ("Prefer Gemini extraction for this document"), but nothing
  routes a low-quality extraction to the degraded queue on that basis. The threshold rule
  is only realised at the coarse "no extractable text at all" boundary.
- **Reading order is not addressed.** Multi-column and table interleaving passes through
  as extracted; there is no de-interleaving pass and no signal that one is needed.
