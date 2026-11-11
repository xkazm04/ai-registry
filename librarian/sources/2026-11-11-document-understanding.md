---
source: batch
kind: batch
url: "https://research.google/blog/analyzing-technical-documents-with-deep-review, https://github.com/run-llama/liteparse"
urls:
  - https://research.google/blog/analyzing-technical-documents-with-deep-review
  - https://arxiv.org/abs/2606.28277
  - https://github.com/run-llama/liteparse
title: "Document understanding, /shift batch of 1 web article (with its preprint) and 1 repository"
author: "2 vendors: Google Research; LlamaIndex (run-llama)"
words: 9616
extracted: 23
accepted: 2
declined: 1
leads: 7
already_covered: 7
untriaged: 3
currency: 3
dispatched: 0
applied: 2
shipped: 1
run_id: shift-document-understanding
siblings: 1
fetches: 5
licence: "Apache-2.0 (repository); design restated in our own words, no code copied"
commit: 64fee560cbd74eeb50a88c53d4c83853a3a6f30e
rescan_when: "liteparse tags a release after 1.5.x that changes its garbled-text thresholds or per-font scope; or 8 weeks elapse (2027-01-06)"
---

# Document understanding, mined under /shift, 2026-11-11

Plan `plan-web-20261110`, cluster `document-understanding`, board run `shift-document-understanding`. The
question: does a parser or a long-document review pattern belong in a wired project's ingest, and what
proves a review is right? Two sources from two authors. R = a vendor research blog on a long-document
reviewer and the preprint it links (arXiv 2606.28277 v1). L = a vendor's open local PDF parser
repository at commit `64fee560`, Apache-2.0, read and never executed. The R miner spent 3 fetches, all
returned as summaries. The L miner read a shallow clone (deleted by name). The lander spent 2 raw reads
through `research-ingest`: the preprint's full HTML (5,753 words) and L's `ocr_merge.rs` at the pinned
commit. Every number below was re-read verbatim from the first; every design claim about L's detector
from the second. No GPU, no model call, no install, no clone by the lander. Phase 7.7: gate=skipped.
`words` is the preprint plus L's README; L's 59.8k doc-comment words are the operating text and are not
counted.

**Expected yield, stated first:** R is a vendor announcement over a first-party preprint with one
measurement, so one boundary amendment, currency and leads. L is a vendor repository against a mature
`document-text-extraction` subject, so catches, one detection amendment and a "no parser" answer. That
held, except that R's amendment did not survive the lander's score.

**Voices:** two authors on adjacent stages (review, parsing). Convergence only where both say the same
thing: R names PDF parsing as one of its three most reported pilot failures, and L is a parse-quality
system. Both are further voices for the `document-text-extraction` golden path's opening, which already
holds the rule. No other point converges.

## What landed

- **Amendment, `document-text-extraction/techniques/extraction-yield-bands` § "Corrupt is the band teams
  do not build".** The section assumed a reader *detects* a broken character map. A font with no table
  or a wrong table maps every code, so the unmapped-glyph count the technique names reads zero and a
  non-text-character check passes. The amendment adds detection from the decoded text: letter statistics
  (vowel share, control characters, malformed tokens), judged per font as well as per page, with a
  per-font floor, run before cleanup, and unknown (never clean) where a script has no letters to judge.
  Score 3/0/1 under the +3 bar: boundary 1, +1 refutes the detect-from-the-mapping premise, +1
  convergence with this registry's own 2026-08-31 reader lesson (the display face fails while the body
  decodes), recorded independently in the reader's header. RISK 0: L's detector re-read verbatim at the
  pinned commit (vowel floor, per-font scope with a minimum font share, minimum letter count, a page-wide
  check first, named tests for a mixed-font page flagging only the bad font and a stray unmapped glyph
  not flagging the page); append, as the section's existing sentences stay true. L's thresholds are not
  cited as a standard.
- **Amendment (rewrite), `codebase-scanning/techniques/llm-assisted-scanning` § "The failure worth
  naming: eloquent agreement", landed 2026-11-11 on the operator's acceptance** (R1, below). The quote
  check bounds fabrication, not judgment: a pass is measured against planted defects and against
  known-correct material of the same kind before it is relied on.

## Applied (Phase 7.5)

One row, `experiment`, verdict `unmeasurable`. Seam chosen to falsify: this registry's own PDF reader,
the one wired reader that already decodes per font. A scratch harness built three one-page PDFs with the
test file's shape: a mapped body face (about 90 % of letters) and a 38-character heading in a second face
with no translation table. Arm A is the reader and ingest check as they stand; arm B is the amended
statistic computed on the raw heading string (a proxy, since the reader returns only cleaned text). n=1
per case.

| case | ingest non-text share | ingest flags | page vowel share | heading's own vowel share |
| --- | --- | --- | --- | --- |
| control, clean heading | 0.000 | no | 0.39 | 0.44 |
| (a) heading codes in 0x01-0x1f | 0.000 | no | 0.39 | 0.00 |
| (b) heading Caesar-shifted ASCII | 0.000 | no | 0.36 | 0.16 |

Case (a): the cleanup deletes the heading entirely (61 words to 54) before the check counts anything.
Case (b): the cipher heading passes at 0 % and dilutes the page share to a natural 0.36, while the
font's own share is 0.16. Both defects are confirmed in arm A; the finding held. Target: both bad cases
named; floor: the clean control not flagged. Unmeasurable because arm B is not in the reader. Return
when the reader lead below is built: the same four fixtures in `scripts/tests/pdf-text.test.mjs` measure
it.

**Second row, `code`, verdict `better` (2026-11-11, operator milestone verdict `pdftext: fix`).** Lead 2
built in this registry. `scripts/lib/pdf-text.mjs` now keeps each page's decoded runs per font before
the cleanup and returns `corruption` (`clean` / `corrupt` / `unknown`, the condemned fonts or pages
with their statistics, and the condemned glyph share). A segment is judged page-wide first, then per
font on its page, then per font across the document, with floors of 20 glyphs, 20 Latin letters and 5 %
of the page; it is condemned by control/replacement/private-use glyphs above 30 %, a vowel share below
0.2, or a share of the letters e a i o n r s t below 0.35. Too few letters is `unknown`. The second floor
was added during the build: a shift by one sends t, h, n, d onto vowels, and the fixture body so shifted
keeps a vowel share of 0.245 (above the floor) while its common-letter share falls to 0.313; the
common-letter share of natural prose measured 0.50 to 0.70 on one paragraph each of English, German,
French, Czech, Polish and Finnish, a line of code and two URLs. `scripts/research-ingest.mjs` records
the band as `meta.pdf_corruption`, names condemned regions on stderr, and exits 2 when half or more of
the glyphs are condemned. Same fixtures, after: (a) control-code heading named (`control-glyphs`), its
text still deleted by the cleanup as before; (b) shifted heading named (`vowel-share`, 0.09) while the
page-wide share stays natural; the clean mixed-font control is `clean`; a 10-letter acronym run in an
odd face is below the floor and not flagged. Two more: a whole page under a vowel-preserving shift is
named by `letter-profile` and fails ingest; a page of only numbers is `unknown`. Cleaned text is
byte-identical to the previous reader on all fixtures and on 23 local invoice PDFs (which carry no text
layer this reader can open, so they are `unknown`; no real text-bearing PDF was on the box to
measure false positives). Limit stated in the reader: a substitution that keeps both shares natural
still reads clean, more likely in short runs and in languages near the floors.

**False-positive pass, same day, after that landing.** 18 distinct text-bearing PDFs were then found on
the box (about 1,500 pages: a 1,306-page user guide, tax forms, papers and fetched reports). Cleaned
text byte-identical on all 18; 17 read `clean`. One, a Czech bank's SEPA XML format guide, read
`corrupt` at 15.8 % of glyphs: a false positive from two causes, a `cs-CZ` marked-content language tag
before every line (the cleanup strips only `en-US`) and pages of vowel-dropped ISO 20022 element names
(`<Ccy>`, `CdtTrfTxInf`, `SvcLvl`). Fixed in the statistics only, text untouched: a run that is wholly a
language tag is not a glyph run, and markup element names, camelCase identifiers and all-caps tokens of
five letters or fewer are left out of the letter shares (still counted as glyphs). Each font's segment
now keeps the whitespace between its runs, so a kerned word stays one token. After: 18 of 18 `clean`,
the guide included, and every fixture unchanged; a seventh test holds that page's shape. Not measured:
a real broken-map PDF, none on the box.

## Triage

| # | src | Row | Outcome | Rule | G/R/C |
| --- | --- | --- | --- | --- | --- |
| R1 | R | Quote checks miss a wrong judgment about real evidence | **accepted, landed** by the operator 2026-11-11 (banked with draft; rewrite) | score | 3/2/2 |
| R2 | R | Recall on planted errors certifies nothing about precision | already covered (`recall-passes-with-a-declared-cap`, positive control in `llm-assisted-scanning`) | - | - |
| R3 | R | Each section owner sees the whole document | lead | lead | - |
| R4 | R | Spend review compute by section density | already covered (`recall-passes-with-a-declared-cap`) | - | - |
| R5 | R | Synthesis grounds citations externally | already covered (`result-harvest`, `graded-span-grounding`) | - | - |
| R6 | R | Parsing is upstream of review | already covered (`document-text-extraction` golden path opening); L is a further voice | - | - |
| R7 | R | The reviewer is public (2026-10-14) | currency, note only (no application names it) | table | - |
| R8 | R | Pilot volume 4,700 (preprint) to more than 16,000 (blog) | currency, note only | table | - |
| R9 | R | Repeated sampling trades precision for recall | already covered (`recall-passes-with-a-declared-cap`) | - | - |
| R10 | R | Four-role AI-in-review taxonomy | untriaged (framework, no consumer) | - | - |
| L1 | L | Corrupt text detected per font, by letter statistics | **accepted, landed** | score | 3/0/1 |
| L2 | L | This registry's PDF reader cannot raise its own corrupt verdict | lead, **built** 2026-11-11 (operator verdict `pdftext: fix`; second Applied row) | lead | - |
| L3 | L | A fleet KB chunker banks corrupt pages at full confidence | lead (build-lane apply of L1) | lead | - |
| L4 | L | Adopt this parser in a wired ingest | **declined** | decision | - |
| L5 | L | Layout risk is a separate verdict from readability | lead | lead | - |
| L6 | L | Over-fire the screen, let dedupe absorb it | already covered (`screen-then-confirm-detection`) | - | - |
| L7 | L | Scope recognition by masking trusted text out of the render | lead | lead | - |
| L8 | L | Strip running chrome, guard letterheads | lead | lead | - |
| L9 | L | Pipeline as public stages with an equivalence test | untriaged (no consumer) | - | - |
| L10 | L | Office formats via an external converter | untriaged (no consumer) | - | - |
| L11 | L | Parser quality measured with the reader held fixed | folded into the review-canary lead as its third arm | lead | - |
| L12 | L | The vendor's QA harness hazards | already covered (catch, laws `failure-not-empty-success`, `verdict-survives-boundary`) | - | - |
| L13 | L | Rust core over pdfium at 1.5.x | currency, note only | table | - |

Admission: two scored rows, `auto=1/1/0`, `fp=1` (R1 was a miner's accept that died at the lander's
read).

### R1, banked: why a miner's 3/0/2 became 3/2/2

The claim is right and re-read verbatim. Preprint §3.2 lists the three most reported pilot challenges as
date hallucination, PDF parsing issues, and "falsely claiming a proof or argument is incorrect due to
failures in reasoning or model misunderstandings", and calls the third open. Table 2: 26 papers with 29
equation or proof errors, model-graded for logical equivalence with every grade audited by an author;
prior best 21.1 %, zero-shot single call 55.2 %, the pipeline 89.7 %. The headline "34 % improvement" is
34.5 points (about 62 % relative); the preprint does not say which it means. No precision or false-flag
rate is reported. Table 3: "feedback mostly or all grounded" 55.8 % and 64.8 % in the two surveyed
programmes.

The score: GAIN 3 (boundary 1, +1 it refutes "the false positive - verification catches those", +1 the
corpus already says existence is not support in two other techniques). RISK 2: the landing **rewrites**,
because that standing sentence becomes false. A rewrite tops out below the +3 bar by construction, so it
is the operator's. The row is also narrower than the miner read it: the technique already sends verified
findings through per-rule rejection tracking and says model precision drifts and must be re-measured, so
false flags on real evidence are watched in production. What is missing is the **negative control before
reliance**: known-correct material of the same kind, where every flag is a false positive until a person
adjudicates it, beside the planted-defect control the section already demands. Draft for the operator,
to replace the section's first sentence clause and add one paragraph:

> The quote check bounds fabrication, not judgment. A finding whose quoted evidence exists has proved the
> reviewer read the target, not that it read it correctly. A false positive that is a judgment about real
> content (an argument is invalid, a condition is unreachable) survives the comparison intact. So a model
> pass is measured by two controls: planted defects it must find, and known-correct material where every
> flag is a false positive until adjudicated.

Return: the operator accepts the rewrite, or a second source measures false flags of a quote-verified
reviewer.

**Accepted by the operator, 2026-11-11** (milestone verdict `deepreview: accept`), and landed in
`codebase-scanning/techniques/llm-assisted-scanning` § "The failure worth naming: eloquent agreement".
The section's first sentence now reads "not the finding about code that does not exist - verification
catches those, and only those"; the draft paragraph follows the positive-control sentence, with two
words the draft left implicit restored from the score above: the two controls are run "before it is
relied on", and the known-correct material is "of the same kind" and its flags stand "until a person
adjudicates" them. No other sentence of the technique changed; "Candidates, never verdicts" still says
the quote check eliminates findings about hallucinated code, which stays true.

### L4, declined: no parser in any wired ingest

The one fleet PDF ingest on the mining box reads a pure text layer, and its manifest refuses a native
PDF-engine dependency by name (miner's read, not re-opened by the lander). L is bound to such an engine
and converts office formats through an external suite. This registry's tooling is dependency-free. Two
projects whose extractors were not on the box were not evaluated. What belongs is the detection
discipline, which landed as L1.

## Leads (each with its return condition)

1. **Review canary for this registry's subject review (R2 + L11).** Seam: `docs/semantic-review.md`,
   which says a valid record proves neither sound reasoning nor source truth, and nothing measures the
   reviewer; the record's `counterexamples` field read by `scripts/review-coverage.mjs` could carry the
   result per reviewer and method version. Instrument, to build, not run: take a subject whose latest
   review is `keep` at current bytes. Arm 1, recall: a scratch copy with K planted defects in four
   classes the registry pays for (a stale number against its primary, an anchor quote that no longer
   matches, a technique contradicting its golden path, an unsourced claim). Arm 2, false-flag rate: an
   untouched `keep` subject of similar size, every flag adjudicated by a person. Arm 3, from L's
   evaluation design (hold the reading model and questions fixed, vary only the parser): the same subject
   fed through a deliberately damaged extraction (one section's display face cipher-shifted, the L2
   fixture), recording whether the reviewer flags the damage or reviews cipher as content. Report recall
   and false-flag rate with the run count. Judgment lane, no GPU. Return: when a filler or build-lane
   seat picks it up.
2. **This registry's PDF reader (L2). Built 2026-11-11 on the operator's verdict; see the second
   Applied row for what differs from the proposal below (a second letter statistic; fatal at half the
   glyphs).** As proposed: `scripts/lib/pdf-text.mjs` strips
   control characters in its final cleanup, before `scripts/research-ingest.mjs` counts suspect
   characters, and that count admits all printable ASCII, so letter substitution passes; the check is a
   whole-document 5 % share with no per-font split, though the reader knows the font at every `Tf`.
   Change: attribute decoded runs to their font, compute control, vowel-share and malformed-token counts
   per font on the raw runs, return a per-font verdict, and have ingest record the corrupt fonts as a
   band in meta, fatal only when the corrupt share is document-wide. Tests in
   `scripts/tests/pdf-text.test.mjs`: (a) a font with no table and codes in 0x01-0x1f; (b) the same font
   with codes in 0x21-0x7e beside a mapped body face holding about 90 % of letters; a clean mixed-font
   control; a stray 10-letter acronym run in an odd face. Before: (a) and (b) pass (measured above).
   After: both named; both controls clean. Return: a seat with the T lane open.
3. **Page-level L1 at a fleet KB chunker (L3).** Its extractor yields page strings with no font, so only
   the page half applies: a corrupt page goes to a list beside its unreadable pages instead of being
   chunked at full confidence. Instrument: the project's own chunker tests (a shifted page, a 30 %
   control-code page, a clean page, a short acronym page) and a read-only count over pages already
   ingested. Build-class: `seat builder --key build:<repo>`. Return: when `free.build` is above 0.
4. **Layout risk as a separate routing verdict (L5).** Return: when a consumer routes on reading order.
5. **Mask trusted text out of the page render instead of cropping regions for recognition (L7).**
   Return: when a fleet project renders PDF pages for recognition.
6. **Letterhead-guarded chrome strip (L8).** Return: with a before/after retrieval measure at a fleet KB
   chunker.
7. **Full-document context per section owner (R3).** Return: when an ablation compares full-context
   owners against chunk-only on a fixed defect set.

## Catches

L's evaluation package scores a judge that does not answer as a pass and an extraction exception as an
empty document, and as read pairs multi-page documents with no ground truth. Its QA pass rates are not a
parser-accuracy figure; do not cite them. R's survey has no response rate and no per-finding validity
rate.

## Currency

R's reviewer is public as of 2026-10-14; pilot volume over 4,700 submissions in the preprint (June)
became more than 16,000 manuscripts in the blog (October). L is a Rust core over a native PDF engine at
1.5.x; its changelog still narrates the earlier line. No corpus application names either, so no clock
moves.
