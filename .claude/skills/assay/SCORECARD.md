# Assay scorecard

One row per run, appended at Phase 11 lane 0, no exceptions. `dev` is the deviation rate:
the share of finding groups where the operator departed from the recommendation. **It
should fall as `taste.md` fills.** If it does not, the ledger is recording diary entries
rather than rules, and that is the finding.

| version | date | source | class | cand | new | enrich | example | lesson | lead | discard | accepted | dev | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

| 1.0.0 | 2026-09-07 | gbrain | skills library | 24 | 3 | 13 | 0 | 0 | 3 declined | 1 class (10) | 16 | 1/4 | rich |

**Weakest stage after one run: `example`.** Zero landed. The source was a skills library
whose own integration folder turned out to be install configuration for its product, so
the one disposition that carries concrete connector knowledge was never exercised. The
next run should be a source with real connector documentation, or that path stays unproven.

**Deviation rate 1 of 4** is the baseline, not a result. It means something only against
the second run.
