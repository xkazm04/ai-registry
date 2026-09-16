---
source: https://github.com/google/langextract
kind: repository
url: https://github.com/google/langextract
title: "LangExtract"
author: google (first-party; a vendor's open-source library over any hosted or local model)
commit: 70cfb988cc25f15d8b04a1e57bd52a777207c0c6
commit_date: 2026-09-13
words: 2,457 README / ~14,050 in-tree markdown / ~9,000 library lines / ~22,000 test lines; 0 of 3 fetches
extracted: 13 (7 design + 6 claim)
accepted: 2
declined: 0
leads: 3
already_covered: 3
untriaged: 5
dispatched: 0
applied: 2
shipped: 1
run_id: intake-langextract
siblings: 0
rescan_when: "a release after 70cfb988 removes the deprecated legacy fuzzy aligner or changes _merge_non_overlapping_extractions in langextract/annotation.py; or 8 weeks elapse (2026-11-11)"
---

# LangExtract - intake 2026-09-16

**Class:** vendor repository, library form. A company's open-source extraction library
over any model provider: chunk, prompt with few-shot examples, parse, **align each
extracted string back to the source**, visualize. Mined from a clone (Phase 2b), not from
the README. **Expected yield, stated before the table:** the alignment step as one or two
design candidates, since the corpus has a byte-exact quote gate (`summary-evidence-gate`)
but nothing on locating spans; the multi-pass recall option as a boundary against
`recall-passes-with-a-declared-cap`; provider plumbing and batch APIs as catches or leads.
No forge count expected, because the library is one pipeline, not a system of subsystems.

**Board:** 0 siblings live at claim or at any check. Claimed
`software-engineering/.../structured-output` and `.../llm-extracted-entity-graph` at Phase 7.

**Swept, in yield order:** `langextract/resolver.py` (the instrument: exact DP, LCS fuzzy,
gates), `langextract/annotation.py` (chunk loop, pass loop, merge),
`langextract/prompt_validation.py` and its call in `langextract/extraction.py`,
`benchmarks/fuzzy_benchmark.py` (planted-span timing and correctness),
`tests/fuzzy_alignment_cases_test.py`, `tests/annotation_test.py` (the merge fixtures),
`langextract/core/output_schema.py`, `langextract/chunking.py`, `langextract/core/data.py`
(the grade enum), then the README. No ADR directory and no CHANGELOG; design reasons live
in docstrings and in deprecation warnings.

**Scorecard focus read at Phase 1:** `ship` stays the focus, and the Test cell records
`anchors=N held=H`. It applied: this row ships one fleet commit and carries the anchor count.

## Design record

Anchors are root-relative to the clone; every quoted one held under
`scripts/check-anchors.mjs`.

**D1 - The model returns text; the library computes positions, with a closed grade**
- decision: extractions come back without offsets and are aligned to the chunk the model saw; every item carries exact / lesser / fuzzy / none, and unplaced items are kept.
- forces: a generator cannot count characters; dropping unplaced items hides where the model invented; one global search binds a phrase to the wrong window.
- buys: every extraction is locatable and labelled with how confidently.
- rejects: asking the model for offsets; binary found/not-found.
- where: `langextract/annotation.py:424 "text_chunk.chunk_text,"`, `langextract/resolver.py:182 "- None: No alignment found"`, `langextract/core/data.py:47 "MATCH_FUZZY"`
- stage: after parse, before merge.
- corpus: NONE. Nearest is `prompt-assembly/summary-evidence-gate` (quote-only form), which admits byte-exact quotes and never locates or grades. HOME IF NEW: `structured-output`.

**D2 - Repeated mentions go to successive occurrences**
- decision: exact alignment is an order-preserving occurrence DP instead of greedy matching.
- forces: substring search binds every repeat to the first occurrence.
- buys: the third mention of a drug lands on the third occurrence.
- rejects: greedy difflib blocks (kept as a legacy option).
- where: `langextract/resolver.py:836 "an order-preserving occurrence DP, so repeated mentions map to"`
- stage: the exact phase of D1.
- corpus: NONE, part of D1's step. HOME IF NEW: `structured-output`.

**D3 - Fuzzy acceptance needs coverage and density, searched across match counts**
- decision: LCS DP keeps the tightest span per match count; accept only above both gates.
- forces: coverage alone accepted scattered matches (the deprecated sliding-window aligner).
- buys: a dense partial match beats a sparse complete one.
- rejects: `legacy`, deprecated with a warning.
- where: `langextract/resolver.py:759 "# Try spans by decreasing match count: a sparse max-match span may fail"`, `langextract/resolver.py:868 "is deprecated and will be"`
- stage: the fuzzy phase of D1.
- corpus: NONE, part of D1's step. HOME IF NEW: `structured-output`.

**D4 - Few-shot examples pass the production aligner before the first call**
- decision: every example extraction is aligned against its own text under the policy built from the caller's resolver parameters.
- forces: a paraphrased example teaches paraphrase, which production alignment then rejects.
- buys: the prompt cannot contradict the validator.
- rejects: trusting hand-written examples.
- where: `langextract/extraction.py:220 "for field in dataclasses.fields(pv.AlignmentPolicy):"`, `langextract/prompt_validation.py:157 "# Defensive copy so validation never mutates user examples."`
- stage: before chunking.
- corpus: NONE in this bundle. The nearest is a spec-authoring technique in another bundle (rule executed against its own worked example), a cousin across a bundle line and not linkable. HOME IF NEW: `structured-output`.

**D5 - Recall passes are blind re-samples merged by span overlap, first pass wins**
- decision: each pass re-runs the identical prompt; a later item survives only if it overlaps no kept item.
- forces: a conversational further pass grows its prompt; a positional merge is cheap once items have spans.
- buys: bounded prompts and a merge with no model call.
- rejects: showing a pass the prior answer.
- where: `langextract/annotation.py:487 "debug=(debug and pass_num == 0),"`, `langextract/annotation.py:52 "the extraction from the earlier pass is kept (first-pass wins strategy)."`, `langextract/annotation.py:74 "if extraction.char_interval is not None:"`
- stage: after alignment, per document.
- corpus: partial - `llm-extracted-entity-graph/recall-passes-with-a-declared-cap` owns passes and says "adds, does not replace"; blind passes and positional merges are boundary cases it does not state.

**D6 - The tail of the previous chunk rides along as context**
- decision: `context_window_chars` prepends trailing characters of the previous chunk for coreference.
- forces: small chunks cut pronouns from their antecedents.
- where: `langextract/prompting.py:211 "Number of trailing characters from previous chunk to include."`
- stage: prompt build per chunk.
- corpus: not checked beyond the map (prompt-assembly and retrieval chunking are the neighbours). Untriaged.

**D7 - A user output schema forces the parser's envelope settings, rejected at config time**
- decision: fenced or non-JSON resolver settings raise before any call when a schema is active.
- where: `langextract/core/output_schema.py:51 "Rejects resolver output settings that conflict with output_schema."`
- corpus: catch - `structured-output` golden path, "the schema is the contract - and it is written twice" and the envelope rule.

**Routing count.** One system (the extraction pipeline). NONE: D1, D2, D3, D4 (4), all
sharing HOME IF NEW `structured-output`, an existing subject. That fires the "technique
triple inside that subject" branch rather than a forge. **Decision:** D2 and D3 are not
separate decisions. They are the exact and fuzzy phases of D1's one step, so D1-D4
landed as **one** technique with D2-D4 as sections. A triple of techniques would have
split one decision point across three files. No handoff.

## Triage (v2.5 gate)

Upper-layer rows scored; currency and leads under the corroboration table.

| # | Shape | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D1-D4 | technique | Ground spans by alignment, graded, only exact admits | summary-evidence-gate (quote-only) | new-technique | real gap | 3/0/2 | **accept** (G 2 new technique + 1 convergence: the quote-only receipt source run of 2026-09-16 reached byte-exact admission independently; R 0, director read the tree) |
| D5 | amendment | Blind passes and positional merge | recall-passes-with-a-declared-cap | corrects-claim | partial -> real gap | 2/0/1 | **accept** (G 1 boundary + 1 refutes a merge the corpus would read as dedup; promoting question "does the technique state a positional merge?" answered no by opening it) |
| D6 | technique? | Previous-chunk context window | prompt-assembly / retrieval | none? | thin | 2/2/2 | untriaged (anchors kept) |
| D7 | - | Schema forces envelope | structured-output | none | likely catch | - | already covered |
| C1 | - | Parse failure skips the chunk and returns empty (`langextract/resolver.py:311 "Skipping chunk: parse error: %s"`) | law failure-not-empty-success; extraction-strategies | none | catch | - | already covered - a live instance of the law: with `suppress_parse_errors` a failed chunk is indistinguishable from a chunk with no entities |
| C2 | - | Provider plugins by entry point, community registry | plugin/registry subjects | none | likely catch | 1/2/2 | untriaged |
| C3 | - | Batch APIs with caching for large corpora | inference/batch subjects | none | thin | 1/2/2 | untriaged |
| C4 | lead | Small chunks improve extraction recall (README advice, default 1000 chars) | llm-extracted-entity-graph | none | thin | 1/2/2 | lead; return: a measured chunk-size vs recall table on a labelled sample |
| C5 | script | Planted-span benchmark for an aligner (`benchmarks/fuzzy_benchmark.py:16 "Benchmark for fuzzy alignment in the resolver."`) | none | fills-stack-gap | partial | 1/1/2 | untriaged; return: when a registry script aligns spans |
| C6 | lead | The vendor ships an agent skill for its own library in-tree (`skills/langextract-usage/SKILL.md`) | agent-instruction-files | resets-clock? | thin | - | lead; return: a second vendor library shipping an in-repo skill (convergence) |

`auto=2/4/0`, `fp=0`: both accepted rows survived Phase 6.

## Landings

- **Technique** `software-engineering/llm-agent/prompt-and-context/structured-output/techniques/graded-span-grounding.md`,
  appended to the golden path's `techniques:` list and techniques section.
- **Amendment** in `llm-extracted-entity-graph/techniques/recall-passes-with-a-declared-cap.md`:
  section "When the passes cannot see each other". **Rewritten once by its own
  experiment:** the first draft said "key the merge on type and span". Run on the
  library's own fixture, that repair kept a relabel, so the landed rule is declared
  nesting plus recorded conflicts.
- **Applications:** `structured-output/applications/python--graded-span-grounding.md`
  (source tree, 28 anchors), `structured-output/applications/node--graded-span-grounding.md`
  (fleet, applied), `llm-extracted-entity-graph/applications/python--recall-passes-with-a-declared-cap.md`
  (source tree, applied). Anchors: 50 of 50 held.

## Apply (Phase 7.5)

- **graded-span-grounding -> ascent, experiment, better, shipped.** Seam chosen to
  falsify: an admission gate where a fuzzy grade would inflate a score. The exact gate
  checked raw history and files while the prompt showed a bulleted, fence-defused view.
  Battery over ten bench snapshots: faithful copies 0/147 -> 147/147; fabrications 0/267
  admitted in both arms. Model arm: 11 producer runs, 13 claims, verified 10 -> 10. The
  one live bullet copy is under the length floor either way. The fuzzy alternative was
  run and rejected: it accepted a span straddling two commits (coverage 0.8, density
  0.36, 3 of 4 matched tokens punctuation). Commit on ascent's active branch, not pushed.
- **recall-passes-with-a-declared-cap (amendment) -> source tree, experiment, better.**
  The library's own merge function against type-and-span keying and declared nesting,
  on four pass sets (one from the library's tests, three built to isolate each branch of
  the merge code). Wrong outcomes 2/4, 1/4 and 0/4. No fleet project runs multi-pass
  extraction. Return: when one does.

## Leads

- **kp: a scorecard module comments on evidence rendered "as if it were a verbatim
  quote".** Found by the D1 seam hunt and not read further. It may be the
  locating-vs-admitting split in a second fleet tree, or a note on an already-fixed
  case. Return: next `/intake apply graded-span-grounding --project kp`.
- C4 and C6 above, with their return conditions.

## Directions not proposed

- **politicas** is a `candidate` absence for `structured-output` in the fleet map, and its
  civic claim pipeline may face the admitting half's forces (a model-cited quote that
  becomes a published claim). Not proposed: the run's cap went to shipping the coverage
  change in ascent, and whether its scope admits the forces was not read. Pick it up from
  the fleet map.
- `gate=skipped` - no proposals written this run.

## Untriaged (nobody verified these)

D6, C2, C3, C5 - anchors above. A later run should not re-derive them.
