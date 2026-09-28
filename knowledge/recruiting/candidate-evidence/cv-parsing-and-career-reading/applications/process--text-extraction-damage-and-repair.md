---
layer: application
type: application
subject: cv-parsing-and-career-reading
technique: text-extraction-damage-and-repair
stack: process
verified_on: 2026-09-29
applied: code
ab_verdict: better
---

# The extraction module (Python analysis pipeline)

Re-read at `0235e7a33` (2026-09-29). `pipeline/jobfit/extractors.py` — 402 lines, up from
202 at the first verification — is the entry point of the extraction context. It accepts
`.txt`/`.md`, `.docx` and `.pdf` (`extract_text`, `:118`) and rejects everything else;
the rest of the file is decoding, damage repair, layout repair and hostile-input
defence.

## Decoding: the code page is chosen from a signal that discriminates

Plain-text uploads used to be read as UTF-8 with `errors="ignore"`, which deleted every
non-UTF-8 byte: a Czech CV saved in the Windows code page arrived with all its
diacritics gone. `_decode_text_document` (`:87`) now tries UTF-8 (consuming a BOM), and
otherwise chooses between the two Windows pages from bytes that mean the same thing in
both — `_CENTRAL_EUROPEAN_MARKERS` (`:84`), "Š š Ž ž in cp1250 AND cp1252" — so the choice
is evidence about the document rather than about the guess. The commit that introduced it
(`a5b961444`) records why the obvious alternative is wrong: guessing on "more Czech
letters" was measured to turn "très à l'aise" into "trčs ŕ l'aise". The known limit is
written down: a Czech document with none of the marker letters reads as the Western page,
"a visible mis-mapping rather than the previous silent deletion".

## Mojibake repair as a scored competition, with an audited table

`repair_text_encoding` (`:152`) produces candidate readings and elects one:

1. **Cheap gate.** `:154` checks for the characteristic markers and returns the input
   untouched when none appear, so clean documents never pay for the pass.
2. **Two repairs.** A `MOJIBAKE_REPLACEMENTS` substitution table (`:34`), and a full
   re-encode/re-decode `text.encode("cp1250").decode("utf-8")` (`:161`), wrapped so a
   failure degrades to the substitution reading.
3. **Election.** `:164` — `max((text, replaced, repaired), key=_czech_signal_score)`,
   where `_czech_signal_score` (`:167`) counts the home language's accented letters. The
   original is in the candidate set, so a repair that makes clean text worse loses:
   measured, clean German, Romanian and Hungarian text carrying a marker character came
   back untouched.

`clean_text` (`:142`) then normalises in the correct order — repair first, then NFC,
null-byte scrub, newline canonicalisation, whitespace collapse.

### A/B (code, 2026-09-29): the entry that guessed one letter of five

The table held one key with five preimages. `"Ĺ�"` is what Ł, Ń, ň, Ő and Ř all
become once their second UTF-8 byte is undefined in cp1250 and replaced, and the entry
mapped it to Ř. The election cannot catch it: the wrong reading carries a home-language
letter, so it outscores the original.

- **A** (table as it stood): "Plzeň" → "PlzeŘ"; "Łódź" → "ŘódĹş"; the real Ř in
  "Řevnice" survives. In the tree's own Czech copy (`messages/cs.json` at HEAD) the five
  letters occur 232 times — ň 182, Ř 50 — so the entry was right 21.6% of the time on
  home-language text alone.
- **B** (`0235e7a33`, local): the entry is removed and the sequence passes through as
  visible damage; the comment above the table (`:26-33`) says why.
  `MojibakeTableTest` (`tests/test_extractors.py:169`) pins the rule — every key decodes
  from exactly one character under cp1250 or cp1252 (19 of 19 remaining) — plus the
  visible-damage outcome and an unambiguous Czech repair. With the old entry restored, 2
  of its 3 tests fail; `test_extractors.py` 22/22 after.

Better: a confident wrong letter in a proper noun is replaced by damage a reviewer can
see, at the cost of the 1-in-5 case the guess got right. Falsifier: a real intake where
the damaged sequence is overwhelmingly Ř — the tree's own copy says otherwise.

## Letter-spaced reconstruction, single-sourced with its metric

`collapse_letter_spacing` (`:222`) rejoins `K n o w l e d g e` → `Knowledge`. The repair
and the quality metric share one definition: `_LETTER = r"[^\W\d_]"` (`:200`) feeds both
`_LETTER_SPACED_RUN` (repairs aggressively) and `_LETTER_SPACED_COUNT` (`{3,}`, counts
conservatively), and `pipeline.py:604 _letter_spacing_hits` is a one-line delegation to
`count_letter_spacing` (`:245`) for exactly that reason.

The repair is bounded for availability: the comment at `:212-216` records that it is "an
O(n) pass with a Python callback per match", so a multi-megabyte buffer of "the exact
pathology it "repairs"" pins a worker. `MAX_REPAIR_CHARS = 200_000` and
`MAX_LETTER_SPACED_SUBS = 50_000` (`:218-219`) cap the window and the substitutions,
sized from the real distribution: "A real CV's extracted text is well under ~100 KB." It
also deliberately under-merges: compound terms keep their surrounding spaces "to avoid
over-merging legitimate ``word - word`` separators" (`:229-231`).

## Two-column reading order, repaired only where proven

Since `f6570eaee` (2026-09-25) a sidebar template is read column by column — and only
when the layout proves it. The comment at `:262-269` cites this technique by name: the
repair "is gated on a measured signal … a vertical gutter that NO text fragment crosses,
with real text on both sides. Without that proof the page keeps pypdf's own order,
unchanged." The thresholds are named constants (`:271-274`, e.g.
`_COLUMN_MIN_SIDE_SHARE = 0.12`). The commit measured it on 35 local PDFs: 4 repaired, 31
unchanged. `TwoColumnReadingOrderTest` (`tests/test_extractors.py:204`) pins both the
repair and a single-column CV with right-aligned dates that keeps pypdf's order.

## Hostile-document defences

Four budgets at `:20-23` — `MAX_INPUT_BYTES` 25 MB on disk, `MAX_DOCX_XML_BYTES` 40 MB
decompressed, `MAX_PDF_PAGES` 200, `MAX_TEXT_CHARS` 2 000 000 cumulative — plus
`defusedxml` (`:10-13`) against entity-expansion bombs. `_extract_docx` (`:171`) checks the
declared size of the archive member before decompressing: "a tiny .docx can declare a
multi-GB body" (`:177`). The 25 MB cap is re-asserted at the model boundary
(`gemini.py:801-807`), because the pre-pass degrades an oversize rejection to a note and
lets the analysis continue.

## Where the repo differs from the standard

- **No recovered-text quality floor gates the run.** `compare_extraction_quality`
  (`pipeline.py:582`) still emits a prose recommendation, and a thin model transcription
  is a warning (`pipeline.py:268`, `profile_text_thin`), not a route to the degraded
  queue. A page count and extracted length are now exposed by the extract endpoint, and
  nothing reads them yet.
- **A reorder leaves no trace.** `_page_text` (`:366`) returns text only, so a record
  cannot say its reading order was reconstructed; DOCX tables are not addressed.
- **The election still scores on one language.** The ambiguous entry is gone, but
  `_czech_signal_score` still resolves any residual ambiguity toward Czech: measured,
  Polish, Slovak and French mojibake of the same shape comes back partly repaired and
  partly not.
