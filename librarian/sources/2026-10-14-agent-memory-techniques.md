---
source: github:NirDiamant/Agent_Memory_Techniques
kind: repository
url: https://github.com/NirDiamant/Agent_Memory_Techniques
title: "Agent_Memory_Techniques: 30 runnable notebooks on agent memory"
author: Nir Diamant
words: 3139 landing page; about 108000 in notebooks; about 18000 other in-tree prose
extracted: 14
accepted: 0
declined: 0
leads: 2
already_covered: 11
untriaged: 1
dispatched: 0
applied: 0
shipped: 0
run_id: hv-se-1014-sea025
siblings: 0
---

# A tutorial cookbook over a mature subject: eleven catches, two leads, no landing

**Class:** app/tutorial aggregator, in its weakest form ("a teaching repository, not a
library", its own `AGENTS.md`). Queue row SEA-025, harvest batch `hv-se-1014`. Expected
yield: catches plus leads; that is what arrived. Commit
`4767c0341ccd8b714147334c5f17c26ff99d8e41` (depth 1, 173 files, deleted by name).
Fetches: 0 of 3. Forge-handoff design count 0.

**Sweep.** Operating documents (`AGENTS.md`, `docs/CONTENT_STANDARDS.md`, `ROADMAP.md`),
the periphery (`.github/workflows/validate.yml`, `utils/validate_cells.py`,
`utils/validate_style.py`, `tests/test_imports.py`), then all 30 notebooks extracted to
text, with the evaluation, benchmark, production, consolidation, forgetting, temporal,
routing, retrieval, multi-agent and compaction notebooks read for failure and tradeoff
sections. The CI gates only prose style, cell shape and import syntax: no eval gate, no
results. The repository publishes no accuracy number, so nothing is priced against the
memory ladder; the LoCoMo notebook's only baseline is whole-history-in-context.
Notebook anchors are cell-substring citations, not line anchors; `check-anchors` was not
run and the clone is gone.

## Triage (catches)

| # | Candidate | Anchor | Home |
| --- | --- | --- | --- |
| 1 | Judge returns 0.5 when its reply does not parse, so a grader failure reads as mediocre | `28_memory_evaluation/memory_evaluation.ipynb` `FaithfulnessJudge.score` "Could not parse judge response" | `eval-harness/outcome-conditioned-cost`, `model-call-outcome-integrity` |
| 2 | Contradiction scan swallows `JSONDecodeError` with `pass`, so an unparsed batch reads as "none" | same notebook `except (json.JSONDecodeError, IndexError): pass` | same, folded into 1 |
| 4 | Prompt tells the detector a supersession IS a contradiction | same notebook, `ContradictionDetector` prompt | `stale-served-versus-stale-answered`, `pending-beliefs-live-apart` |
| 5 | Temporal accuracy checks only that the newer record ranks above the older, not whether the old one reached context | same notebook | `stale-served-versus-stale-answered` (negative instance) |
| 6 | LoCoMo run: 30 questions from one conversation; a "stratified" comment over a plain `random.sample`; adversarial class dropped | `29_memory_benchmarks_LoCoMo/memory_benchmarks_LoCoMo.ipynb` "stratified across categories 1-4" | `baseline-ladder` |
| 8-12 | Misrouting, salience vs importance, decay with pinned exemptions, version-checked shared writes, consolidation conflict strategies | `17_`, `12_`, `19_`, `22_`, `14_` notebooks' tradeoff sections | `scope-before-similarity`, `working-memory`, `decay-and-forgetting`, `owner-and-counterpart-scope`, `lane-reconciliation` |

## Leads and return conditions

- Contradiction rate computed over all possible pairs, so it shrinks quadratically as the
  store grows; the scan also batches, so cross-batch pairs are never compared (the batch
  half is already the memory lane's "a cap that is not a shortlist"). Return when any run
  reports a store-level contradiction rate. Home: `coverage-instrumentation`.
- Erasure that reaches derived stores (embeddings, summaries) while the audit trail keeps
  no user identifier; the source's own audit log keeps `user_id`. Return when a connected
  project with a user-delete path can be read. Home: `decay-and-forgetting`.

## Untriaged

Tier cost multiples ("the 100x cost difference", a round vendor-style number). The
pre-merge notebook lint (60-line cells) has no memory content and is parked.

**Hazard recorded, no landing:** 73 files embed a third-party tracking-pixel URL and a
campaign-tagged link rule. A clone is inert; rendering the repository's markdown would
call out to the tracker.
