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
| Techniques | 34 |
| Applications | 19 |
| `use_when` written | 34/34 |
| Fleet map pairs | none. No project's `registry-map.json` joins a context to this bundle |

These are a record of this run, not an input to the next one. Recompute with
`node scripts/librarian-scan.mjs --domain agent-operations`.

## What is owed

- Demand is UNKNOWN, not zero. The fleet runs agents unattended every day, but no
  project declares this bundle's domain in its scope, so the map cannot see a consumer.
- Two stacks: `process`, and `node` since the blind-judging run. The benchmark harnesses
  the subjects were distilled from are not in a tracked fleet tree. The personas
  memory-year harness is the one tracked benchmark; the registry's own contest skill is
  the one tracked judging panel. Applies land in those two.
- Owed in the contest skill (blind-judging run): opaque per-seat staging roots, per-seat
  label rotation, a panel-completeness check before ranking and refusal of an invalid
  verdict. Deferred because another session held uncommitted work in those scripts.

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

## 2026-09-27 - deepen: agent-run-budgeting

Dispatched by the Curator lane on "3 techniques (design floor is 4)". Landed (d9382ed7):
- **New technique, termination-cause-record.** Converged on three of four lanes: blind,
  counter-evidence and landscape.
- **Two golden-path flips.**
  - Structured error fields before the text; text only over an errored envelope.
  - Pause the scope the limit belongs to, not the whole queue.
- **One correction.** Quarantine a refused record, never delete it.
- **Three conditioned techniques.** Parallelism is free under a per-minute token bucket
  and capped by the machine too; deferred judging on API keys or an unpinned judge; the
  ceiling's tail is the pooled tail.

Two `applied.md` rows `better` (code) and one `unapplied`. The memory-year wrapper let a
closed judge seat grade a correct reply wrong-old and keep it across resume; a studio
build harness counted session limits as turns and discarded real replies about rate
limiting (2/6 -> 6/6). Both fixed and pushed (personas f3f68dc9c, b281310f7). Impact: no
fleet map pairs the subject. Three leads banked. Scan points 9 -> 5; the finding that
ranked it is cleared, "single stack" and "never swept" remain. Yield high, dry_streak 0.
See [[agent-run-budgeting]].

Source classes, this run. Kept:
- the runner's own SDK reference and issue tracker, read raw;
- the provider's API reference;
- benchmark maintainers' posts on their own timeout policy.

Declined: fetch-tool page summaries as quote sources (one invented an enum).

## 2026-09-27 - deepen: blind-judging-of-agent-runs

Dispatched by the Curator lane on "3 techniques (design floor is 4)". Landed (3063b210):
- **New technique, sealed-judge-workspace.** Converged on the blind lane, the
  primary-source lane and the contest skill's own 1.6.0 incident log.
- **Three golden-path flips.**
  - Order leads the bias list; each judge reads a different order.
  - Family is a proxy for uncorrelated errors; the agent's family never holds the majority.
  - Facts in the packet, never scores; the re-judge never sees the old score.
- **Two conditioned techniques.** provenance-scrubbing (commit metadata, base-commit
  paths, familiarity) and withhold-rather-than-half-judge (the arrived verdict kept,
  labelled, outside the panel's column).

Six `applied.md` rows, five on the contest skill: two `better` by experiment (the staging fix
sealed the key but not the peers; `aggregate()` ranks a partial panel as a full one and
lets a 1-of-7-dimension verdict flip the order), three `unmeasurable`, one `unapplied`.
Impact: no fleet map pairs the subject. Points 9 -> 3. Three leads banked. Yield high,
dry_streak 0. See [[blind-judging-of-agent-runs]].

Source classes, this run. Kept: arXiv abstracts and full text read verbatim through the
export API; a benchmark maintainer's issue thread; an evaluation lab's own measurement post.
Declined as sole support: figures seen only in search summaries.

## 2026-09-27 - deepen: harness-fault-attribution

Dispatched by the Curator lane on "3 techniques (design floor is 4)". Landed (8e0630ef):
- **New technique, re-gate-then-resample.** Converged on all three lanes: blind,
  counter-evidence and primary-source practice.
- **Two flips, golden path and clear-the-environment-first.**
  - A singleton that disappears on rerun is intermittent, not environmental.
  - A cluster is read by its axis: in time points at the environment, on an item points
    at correlated model error or a task defect.
- **Widened.**
  - The Provider check covers a degraded backend behind a success-shaped envelope.
  - Three catalogue entries.
  - An exclusion is reported both ways.

One `applied.md` row `better` (code), one `better` (experiment), one `unmeasurable`. The
memory-year harness had a same-config raw-retrieval pair that split 18 of 194 probes;
re-gated under one judge 0 moved, 17 moved with the served context across a harness
commit landed 15 s before the second run, 1 was the consumer's sample. The header now
stamps the harness revision (personas d980f99cc, pushed). Impact: no fleet map pairs the
subject. Three leads banked. Scan points 9 -> 5; "single stack" and "never swept" remain.
Yield high, dry_streak 0. See [[harness-fault-attribution]].

Source classes, this run. Kept:
- the paper that defines a tool's semantics;
- providers' own postmortems;
- evaluation orgs' reports on their own exclusion policy.

Declined as sole support: search snippets, and password-protected or unloaded pages.
