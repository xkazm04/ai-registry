---
source: youtube:ER1rnHwelbo
kind: first-party practitioner account (a controlled two-arm experiment the creator built and measured)
url: https://www.youtube.com/watch?v=ER1rnHwelbo
title: "\"Code Quality Doesn't Matter Anymore\" Is Wrong. I Measured It"
author: Coding Crash Courses
words: 876
extracted: 11
accepted: 1
declined: 0
leads: 2
already_covered: 4
untriaged: 3
applied: 1
shipped: 0
dispatched: 0
run_id: intake-er1rn
siblings: 0
rescan_when: n/a (not a repository source)
---

# The floor held in both arms, and the whole argument was read off the floor

Intake 2.15.0, run 2026-10-07. A source originates a finding. It never
authorizes one. Zero live siblings on the board at claim. The registry's
`build-index --check` was already stale for the software-engineering bundle at
Phase 1, on a clean working tree — a pre-existing committed state, not this
run's, and noted rather than fixed.

**Class and expected yield, said before the table.** A first-party practitioner
account: the creator built the thing he is describing — a two-arm experiment,
specified once and implemented twice — and reports what he measured. Reliable
for what he did and measured, n=1. The class corroborates corpus-internally and
the fetch budget is usually optional for it. 876 words is the second-thinnest
source this skill has mined (floor 496, 2026-10-04) and, per the class rule,
length is not yield: a thin first-party account needs no help. Expected: one
technique at most, several catches.

**Declared focus from the last source run, applied.** *List the project's
committed registers before choosing an instrument, and name which one can serve
as arm labels.* Executed, and it changed the run. The register reached for first
was the harness's own slash-command label, written by the harness into each
session's first user message — a genuinely committed label. It yielded **n=3**
`/intake` sessions on this machine, because this is the secondary box and most
of this fleet's run history lives on the primary. That register could not serve
as arm labels, which was established before an instrument was built on it rather
than after. The register that did work was the harness's usage blocks keyed by
workspace directory. Both labels are harness-written; neither was invented by
this run.

## What the source is

One API specified once — 15 business domains, 45 resources, 1,355 unit tests
plus hidden tests the agents never saw — built twice. Arm one: a single file,
about 9,000 lines, every endpoint written out by hand with copied auth and SQL.
Arm two: layers plus a shared "resource kit" (metadata mapping, a generic
repository, a layer supertype, a template method, a factory, state machines).
Two frontier coding agents then executed two successive feature releases against
each arm — release one a trash bin, audit log and pagination; release two
per-domain permissions, CSV export and bulk delete — on the same prompts and the
same tests.

Five predictions were registered in advance. Three held (cheaper, faster, the
gap grows per release), one held for one agent only (everything gets pulled into
the context window), and **one was refuted** (messy code blocks parallel work).
Registering five and reporting one refuted is why this source is worth more than
its word count. The caption track mangles both model names and renders "9,000
lines" as "9,000 files"; neither affects the measurement.

## Triage

Expected yield was one technique and several catches. That is what happened.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | technique | M | The change class is the workload | module-design (`scoreable-designs-are-built-not-argued`, `locality-and-leverage`) | new-technique | real gap | 4/1/2 | **accept** |
| 2 | K | amendment | S | Narrow the sibling's long-lag denial | same file | corrects-claim | real gap | 3/2/1 | link discipline of row 1, not an independent admission (see below) |
| 3 | T | script | M | A noise-band instrument for agent cost | — | none | real gap | judgment lane | **accept** |
| 4 | K | currency | S | Dated cost/latency figures for a structural A/B | — | resets-clock | — | corroboration table | **accept** (cited into row 1 with its predicate) |
| 5 | K | catch | — | Build both candidates and measure | `scoreable-designs-are-built-not-argued` | none | likely catch | — | already covered, and better |
| 6 | K | catch | — | Change scatter as the boundary diagnostic (260 places vs the kit) | `locality-and-leverage` | none | likely catch | — | already covered |
| 7 | K | catch | — | Agents erode structure faster than review sees it | the golden path's own section | none | likely catch | — | already covered |
| 8 | K | catch | — | A duplicating codebase grows more for the same feature | `module-depth`, `locality-and-leverage` | none | likely catch | — | already covered |
| 9 | K | partial→folded | S | Test-execution time is a big share of the latency gap | `machine-paced-delivery/verification-throughput-as-constraint` | none | partial | — | promoting question executed; folded into row 1 as discipline 3 |
| 10 | K | lead | — | The agent derives a decomposition and discards it | — | — | real gap | — | lead |
| 11 | K | lead | — | Post-pass spend as a first-class metering unit | `cost-metering/spend-attribution` | — | partial | — | lead |

`auto=3/0/0 fp=0`. Rows admitted under the score: 1 and 3. Row 4 was admitted
under the corroboration table (a source may authorize a currency signal alone),
not scored — per 2.8, scoring a currency row rejects it by construction.

**Row 2, said plainly.** Scored on its own it is GAIN 3 / RISK 2 / COST 1 = +1,
below the +2 threshold, because narrowing the sibling's denial makes a standing
sentence false and takes the rewrite surcharge. It landed anyway, and not as an
override: it is the bidirectional half of row 1, the same way a new technique
must appear in its golden path's `techniques:` list. Row 1 states the
discriminator (the lag belonged to the probe, not the property), the sibling
keeps the two long-lag properties no harness observes, and the edit is one
clause plus a pointer. If this pattern recurs, the method should say that a
consistency edit forced by an accepted row is not separately scored.

**Row 9's promoting question** — *does the corpus own the claim that the arm
which iterates more pays a constant suite more times?* — was answered by opening
`verification-throughput-as-constraint`. It does not: that technique separates
queue time from run duration at fleet scale, a different claim. The finding is a
metering caveat for this comparison, not a landing of its own, so it folded in:
wall-clock is derived and its primitive is iteration count.

## Corroboration

2 of 3 fetches. The first returned the PDF of a controlled study and was unusable
as fetched (binary); it was extracted locally instead of spending a second fetch
on the same document.

**The primary.** *The Best Programming Language for Tokenmaxxing* (arXiv
2607.22807v1, 24 Jul 2026; Wu, Anderson, Guha): 2,000 agent trajectories, 100
tasks, four target languages, five models, one minimal harness. Its contribution
2 is the source's finding in another variable — "at comparable success rates,
lower-resource languages cost significantly more" — with substrate coefficients
of 1.16x–1.69x after fitting task identity as a random effect, p < 0.001 across
every model. Convergence: two independent measurements, opposite protocols,
agreeing on direction and not on size.

**The primary also corrects the source, which is the better half.** Task
identity explains 73%–97% of token-cost variance (ICC), and for the two
proprietary engine families the source actually used it is 0.94 and 0.97. The
source reports 1.21x and 2.7x from **one task and one trajectory per arm**. Its
design is the right shape — it fixed the spec, the tests and the prompts across
arms — and its missing piece is repeats, which the paper does not have either:
100 problems per cell, but one trajectory per cell. **Neither measurement in
this lane carries a within-cell variance estimate**, and that is now written into
the technique as the lane's missing instrument.

Two further gifts from the primary, both folded into the technique: the
trajectory splits at the first passing state, and the two halves move
independently (one model, 1,743–2,454 tokens to a pass against 1,173–7,311
after it, with post-pass spend *lowest* on the hardest substrate because it
rarely reached a pass to second-guess); and of the steps changing no test
outcome on the easiest substrate, 34% were cosmetic refactoring and 22%
micro-optimization — work the task never asked for.

## Landed

- **Technique** `change-class-is-the-workload` in
  `software-engineering/engineering-process/codebase-stewardship/module-design`
  — extensibility is scoreable because the lag belonged to the probe; four
  disciplines without which the ratio attributes nothing; the engineer still
  states the change class; paired with change scatter at the other end of the
  clock.
- **Golden-path section and index entry** in `module-design`, plus the
  one-clause narrowing of `scoreable-designs-are-built-not-argued`'s long-lag
  denial from three properties to two.
- **Instrument** `agent-cost-band.mjs` in the tooling lane: measures the band,
  derives the arm count, and `--validate` scores the one-per-arm protocol
  against a bootstrapped ground truth. Dependency-free, root passed as an
  argument, asserts its input before reporting.
- **Application** `process--change-class-is-the-workload`, `applied: experiment`,
  `ab_verdict: better`.

## Applied

Mode `experiment`, verdict `better`. The arms were **protocols**, not codebases:
A read the ratio from one observation per arm (what both published measurements
do); B measured the band first and declared only what the derived arm count
supports. Target: how often A recovers the correct *direction* of a known cost
difference. Floor: the ground-truth ordering must itself be bootstrap-stable at
0.90, because a protocol cannot be scored against an unsettled ordering.

Corpus: 445 transcripts across 44 workspaces, 292 usable (≥3 model turns,
non-zero output tokens), 118 in the five workspaces with n≥8. Band: within-workspace
geometric SD **5.91x**, per-workspace CV 0.52–3.09, within-workspace max/min
61–3,279. Derived: ~1,363 replays per arm to resolve 1.21x, ~51 to resolve 2.7x.

Validation over all ten pairs: of the eight with an established ordering, every
one had a true ratio ≥3.4x, and there one observation per arm recovers the
direction **84%** of the time against 98% at ten. **No pair with an established
ordering had a true ratio below 3x** — and the absence is the result. The one
pair in the range these studies report (1.5x) is exactly the pair whose ordering
the bootstrap could not settle from 43 and 11 sessions (0.86), with one per arm
at chance (~55%).

**The seam was chosen to falsify.** Had one observation per arm recovered small
effects reliably, discipline 1 would have narrowed to wide bands only and the
source's protocol would have been defensible as published. It did not — and the
test still returned something the drafted rule did not claim: above a 3x true
ratio, one replay per arm is mostly sufficient. That boundary is now in the
technique, and it is what keeps the rule from reading as a demand for a thousand
replays in every case.

**What the row cannot do**, stated rather than implied: the band is
*uncontrolled* — these sessions did different work, so task-identity variance is
mixed into the run-to-run term and the arm counts are an upper bound, not an
estimate. The number a planner wants is the within-cell band, and nothing in
this corpus repeats a task. Instrument named: one fixed change class replayed
several times against one fixed structure. Nobody in this lane has run it.

`ship: 0`. The finding is a measurement method; no managed project has code that
makes the decision it governs, and the registry's own tooling lane is where the
instrument belongs. Not a project commit, and not pretended to be one.

## Leads

- **The derived decomposition is discarded.** The agent split the undivided
  9,000-line file into sixteen modules, partitioned five workers across them, and
  threw the partition away at the end of the run — paying for it again on the
  next one. Return: when a harness can persist a derived module map across runs,
  or when a fleet project grows a file large enough that an agent partitions it
  (measure the partition's stability across two runs first — an unstable
  partition is worse than none).
- **Post-pass spend as a metering unit.** `cost-metering/spend-attribution`
  names the axes every call must carry; "before or after the first passing
  state" is not among them, and the primary shows that half can be the larger
  one. Return: a second independent measurement splitting a trajectory at first
  pass, or a fleet harness that can emit the split.

## Untriaged

Recorded with anchors so a later run does not re-derive them. Nobody verified
these.

| Candidate | Anchor | Why it stopped here |
| --- | --- | --- |
| The gap grows per release, so a one-change measurement understates structural cost by 2–3x | `[00:03:50]` "for Codex it was 11 to 36% for Sonnet it was 51 to 77%" | The compounding slope is the source's strongest unreplicated claim and it is n=1 over two releases. It is cited in the technique as a reported figure, but the rule "report the slope, not the ratio" needs a second sighting before it is a discipline of its own. |
| Hidden tests the agent never sees as a standard arm of a structural comparison | `[00:01:43]` "some hidden tests that the agent never sees" | A held-out set guards against the agent tuning to the visible suite. Plausibly belongs in `test-harness`, which owns `negative-control-tests` and `tuning-corpus-disjointness`; not checked against either. |
| Agents may prefer a search-and-patch strategy over reading a large file, and that choice is not operator-visible | `[00:03:00]` "Codex actually didn't do that. It searched the big file and patched it with more scripts instead reading all of it" | Cited in the technique as an engine-signature caveat. Whether the strategy is steerable — and whether steering it changes cost — is unexamined and would need a harness this run did not build. |

## Catches

Four, and two are worth a sentence. The source's own method is
`scoreable-designs-are-built-not-argued` performed without having read it, down
to the one-harness-over-substitutable-candidates discipline — and the corpus
states the hazard (a number on an unscoreable decision wins the argument) that
the source walks past. Its scatter count (260 places touched versus "almost only
the kit") is `locality-and-leverage`'s change-scatter diagnostic, measured
prospectively instead of from history, which is the seam row 1 occupies.

## Notes for the next run

The declared focus paid, and it paid by *failing* cheaply: the first committed
register returned n=3 and was abandoned before an instrument was built on it.
That is the register check working. The second lesson is the one worth carrying:
`--validate` on the instrument was not in the plan, and it changed the landing —
the drafted rule would have demanded a thousand replays in every case, and the
validation found the 3x boundary above which one replay per arm is mostly
enough. An instrument that scores its own formula is cheap and it corrected the
technique before the technique was committed.
