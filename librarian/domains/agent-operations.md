---
domain: agent-operations
last_swept: 2026-09-27
layout: nested
demand_known: false
---

# Agent operations

Coverage note for the `agent-operations` bundle. Part of [[index]]; graded against
[[standard]]. First written by `/deepen` on 2026-09-27; no librarian sweep has run here.

## Shape after the 2026-09-27 run

| | |
| --- | --- |
| Subjects | 9 |
| Techniques | 31 |
| Applications | 16 |
| `use_when` written | 31/31 |
| Fleet map pairs | none. No project's `registry-map.json` joins a context to this bundle |

These are a record of this run, not an input to the next one. Recompute with
`node scripts/librarian-scan.mjs --domain agent-operations`.

## What is owed

- Demand is UNKNOWN, not zero. The fleet runs agents unattended every day, but no
  project declares this bundle's domain in its scope, so the map cannot see a consumer.
- One stack only (`process`). The benchmark harnesses the subjects were distilled from
  are not in a tracked fleet tree. The personas memory-year harness is the one tracked
  benchmark, and it is where applies land.

## 2026-09-27 - deepen: agent-benchmark-design

Dispatched by the Curator lane on "3 techniques (design floor is 4)". Landed (df6f8f4d):
- **New technique, null-and-reference-controls.** Converged on all four lanes: blind,
  counter-evidence, task-validity and landscape.
- **Three flips.**
  - One run per cell supports a paired test.
  - The mechanical bar is necessary, not sufficient.
  - Universal failure is the audit's trigger, not its verdict.
- **One conditioned technique.** Comparable-cell-construction: identical is not neutral,
  the engine as shipped, the resource envelope, a paraphrase rerun.

Three `applied.md` rows `better` and one `unapplied`. The controls found three check
defects in the personas memory-year judge, one false pass and two false fails, all
fixed and pushed (1ba2856b6, 6f963318f). No ranking moved. Impact: no fleet map pairs
the subject. Three leads banked, one of them cross-subject for model-and-effort-selection.
Yield high, dry_streak 0. See [[agent-benchmark-design]].

Source classes, this run. Kept:
- benchmark maintainers' own CI rules and audits;
- empirical patch-correctness studies;
- vendor engineering posts with their own measured p-values.

Declined:
- secondary summaries of scaffold effects;
- vendor pages reachable only through a proxy, as sole support.
