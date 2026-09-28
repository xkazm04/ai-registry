---
domain: agent-operations
last_swept: 2026-09-28
layout: nested
demand_known: false
---

# Agent operations

Coverage note for the `agent-operations` bundle. Part of [[index]]; graded against
[[standard]]. First written by `/deepen` on 2026-09-27; no librarian sweep has run here.

## Shape after the 2026-09-28 run

| | |
| --- | --- |
| Subjects | 9 |
| Techniques | 39 |
| Applications | 26 |
| `use_when` written | 39/39 |
| Fleet map pairs | none. No project's `registry-map.json` joins a context to this bundle |

These are a record of this run, not an input to the next one. Recompute with
`node scripts/librarian-scan.mjs --domain agent-operations`.

## What is owed

- Demand is UNKNOWN, not zero. The fleet runs agents unattended every day, but no
  project declares this bundle's domain in its scope, so the map cannot see a consumer.
- Three stacks: `process`, `node` since the blind-judging run, and `rust` since the
  model-and-effort-selection run (the personas fleet lane). The benchmark harnesses
  the subjects were distilled from are not in a tracked fleet tree. The personas
  memory-year harness is the one tracked benchmark; the registry's own contest skill is
  the one tracked judging panel. Applies land in those two, and in the loop's integrity
  guard in ascent since the deterministic-run-verification run.
- Owed in the contest skill (blind-judging run): opaque per-seat staging roots, per-seat
  label rotation, a panel-completeness check before ranking and refusal of an invalid
  verdict. Deferred because another session held uncommitted work in those scripts.
- No fleet runner has an operating-system boundary (unattended-run-isolation run): the
  agent runner's sandbox is not supported natively on the fleet's OS, so every isolation
  measure here is an arrangement. Owed: a container, VM, Linux subsystem or separate
  account for dispatched runs, and the known-bad probe before the first queue there.

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

## 2026-09-27 - deepen: engine-behaviour-profiles

Dispatched by the Curator lane on "3 techniques (design floor is 4)". Landed (55bd8787):
- **New technique, harness-crossed-attribution.** Converged on all four lanes: blind,
  counter-evidence, harness-source landscape and a local harness read.
- **Three flips.**
  - The resolution of an authority conflict belongs to the engine and the wording, not
    the family.
  - Dispositions expire like capabilities; the harness version is a stamp and a trigger.
  - Golden path: the unit profiled is the engine; routing keeps the mechanical stop.
- **One conditioned technique.** Family-diversity-as-a-control: a shared failure points
  at what was shared, harness included; a second-family judge reduces self-preference
  and does not remove it.
- **Both older applications corrected.**

Two `applied.md` rows `better` (experiment, simulation) and one `unapplied`. A scan of
13,920 session transcripts found the engine the benchmark recorded as deferring
force-adding ignored paths in 4 sessions across 3 repositories. The personas Codex lane
now runs a model outside the profiled set under an unrecorded harness version. Both are
banked as leads, not patched. Impact: no fleet map pairs the subject. Scan points 9 -> 2;
"single stack" remains. Yield high, dry_streak 0. See [[engine-behaviour-profiles]].

Source classes, this run. Kept:
- harness source code read raw, over the harness's own prose;
- vendor docs for the vendor's own product;
- the fleet's session transcripts, read row by row after a regex.

Declined: withdrawn preprints; search-summary-only numbers.

## 2026-09-27 - deepen: deterministic-run-verification

Dispatched by the Curator lane on "3 techniques (design floor is 4)". Landed (e3612ff2):
- **New technique, grade-with-checks-the-run-could-not-touch.** Converged on all four
  lanes: blind, counter-evidence, primary grader source and landscape. It is the
  verifier's half of quality-gates' in-task freeze.
- **Three flips.**
  - The baseline's passing set is half the contract; a vanished test is a failure.
  - The ignore check answers "not ignored" for every tracked file unless asked with the
    index disregarded.
  - Golden path: a citation that resolves only on the machine that made it is
    unverified.
- **One conditioned technique.** Recompute-facts-at-report-time: derive, do not
  re-execute; stamp the grader's code revision and keep the verdict it replaced.

Four `applied.md` rows `better` (code, two experiments, simulation) and one `unapplied`.
The code row is in ascent's lane integrity guard: 3/19 -> 19/19 of the fleet's real
gate-config files. It is committed locally and NOT pushed, because the project's master
is 105 ahead of origin. The citation experiment ran over this registry's own ledgers:
19 of 241 project commits cited in `applied.md` resolve nowhere. Impact: no fleet map
pairs the subject. Scan points 9 -> 5; "single stack" remains. Yield high, dry_streak 0.
See [[deterministic-run-verification]].

Source classes, this run. Kept:
- graders' source read at a pinned commit;
- version-control and test-runner reference docs;
- flaky-test studies with rerun statistics;
- fleet trees and registry ledgers, read row by row.

Declined as sole support: practitioner posts read only through a summarizer.

## 2026-09-27 - deepen: unattended-run-isolation

Dispatched by the Curator lane on "3 techniques (design floor is 4)". Landed (0ea31221):
- **New technique, os-enforced-run-boundary.** Converged on all three lanes: blind,
  counter-evidence and primary-source practice.
- **New technique, hermetic-inherited-configuration.** Runner-up on two lanes, then
  measured in the fleet.
- **Two golden-path flips.**
  - Removing the remote stops an accident, not a publish.
  - Credentials live in files, keyrings, helpers and sockets, not only the environment.
- **One corrected technique.** disposable-run-environments: a linked worktree shares
  configuration, refs, stash and hooks, and a borrowing clone decays when the source prunes.
- **One conditioned technique.** no-links-into-live-trees: the rules for a cache
  exception, and a recursive delete can follow a junction.

Three `applied.md` rows `better` (code, simulation, experiment). personas' memory-year
harness called the model with "no tools" from an empty directory, and each call still
loaded 25 tools, 30 skills and 3 user hooks: 23,296 input tokens against 497 isolated. Now
isolated, with the profile in the cache key and a positively controlled check
(ef9aead69, pushed). A repository with no remote still authenticated to a private forge
repository through the system credential helper. Four fleet incidents walked under an
enforced boundary: 0 of 4 prevented as run, all stopped or narrowed under the boundary,
with shared references as the gap. Impact: no fleet map pairs the subject. Scan points
9 -> 5; "single stack" and "never swept" remain. Yield high, dry_streak 0. See
[[unattended-run-isolation]].

Source classes, this run. Kept:
- vendors' own sandbox and CLI documentation, read raw;
- a tool's own manual for its semantics;
- advisories and postmortems from the affected maintainers.

Declined as sole support: fetch-tool summaries, and figures quoted outside what they measure.

## 2026-09-28 - deepen: model-and-effort-selection

Dispatched by the Curator lane on "single stack (process)". A never-deepened subject with
three events behind it: a lead banked for it, two sibling flips its text contradicted,
and an open personas task on its seam. Landed (45af95e0):
- **New technique, pin-the-resolved-configuration.** Converged on three of four lanes:
  blind, vendor primary docs and the fleet's own code.
- **Two flips.**
  - Golden path: effort is not neutral on obedience; it is not a fix for it.
  - tier-risk-inversion: a report task has its own inversion, and read-only is a property
    of the side effects.
- **Three conditioned techniques.**
  - instruction-defect: a perturbation before a wording verdict, and engine not family.
  - cheapest-sufficient-tier: sweep effort per model. This closes the banked 21-of-36 lead
    with a second source.
  - task-shape: a tier is a pair mapped per model, shape per role, a length cap is not a
    stuck verdict.

Three `applied.md` rows `better` (code, two simulations) and one `unapplied`. The personas
fleet wake dropped a plan's model and effort. On the installed CLI a bare resume keeps
the model and loses the effort: 11,295 and 6,157 cache-creation tokens, against 55 and 55
carried. Fixed and pushed (cc97afa6e, fe7ad01cb). The curator dispatch lane passes
neither value and is banked for the owner. Impact: no fleet map pairs the subject. Scan
points 5 -> 0, recomputed: both findings are cleared by the second stack and this note. Yield
high, dry_streak 0. See [[model-and-effort-selection]].

Source classes, this run. Kept:
- vendor docs for the vendor's own product, read raw;
- arXiv body text over its abstract;
- the fleet's code comments and persisted rows;
- a paired probe on the installed harness.

Declined as sole support: search-snippet numbers, and an abstract that rounds its body up.
