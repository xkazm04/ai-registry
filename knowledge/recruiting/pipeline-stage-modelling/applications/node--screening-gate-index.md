---
layer: application
type: application
subject: pipeline-stage-modelling
technique: screening-gate-index
stack: node
status: forged
---

# One derived index, and everything that used to read a string

`app/_lib/pipeline-stages.ts` is the whole technique in a pure, DB-free module
— deliberately free of the `better-sqlite3` import so the fairness predicate
is unit-testable in isolation and the stage order has one source (`:1-6`).

## The incident comment that justifies the module

`:20-32` states the problem in the form the standard describes. The board's
five columns were about to become workspace-editable, and that is "only
survivable if nothing derives meaning from a stage's NAME, because today
almost everything does": the fairness metric was literally
`indexOf(stage) >= indexOf("Interview")`, the move menu excluded the string
`"Hired"`, org benchmarks indexed off `"Interview"`. "Rename or reorder a
stage under those and they quietly answer a different question." The fix
named in the same comment: "A role is the stable half."

`StageRole` (`:42`) is the closed vocabulary — `entry | screening | interview
| scoring | offer | terminal | custom` — and `STAGE_ROLE` (`:57`) is typed
`Record<PipelineStage, StageRole>` specifically so that "adding a stage to the
axis without deciding what it MEANS is a compile error". The standard's
refuse-don't-default rule, enforced by the type checker rather than at
runtime.

## The gate: first real look, not last filter

`screeningGateIndex` (`:132-138`) walks `["interview", "offer", "terminal"]`
and returns the index of the first stage carrying the first role that
appears, falling through to `axis.length`. The comment at `:113-118` gives the
reasoning the standard now carries: expressed as "the first stage of a role"
rather than "after the last screening stage" **on purpose**, because "a
workspace may add several screening-ish stages, or none, and the question the
fairness metric asks is always *did they get a real look*, not *how many
pre-stages were there*". The terminal fallback lands on `axis.length` — "nothing
is past the gate" — "rather than crashing or silently declaring everyone
advanced".

`hasAdvancedPastScreening` (`:153-156`) is then two lines:
`i >= 0 && i >= screeningGateIndex(axis)`. Both halves are load-bearing. The
inclusive comparison is the reach-the-gate event; the `i >= 0` guard is the
off-axis rule — a candidate on a retired column has advanced past nothing
(pinned at `pipeline-stage-roles.test.ts:64`). Its docstring records that on
the default axis the answer is "byte-identical to the old
`indexOf(stage) >= indexOf("Interview")`", which is what made the migration
provable rather than hopeful.

## Both sides of the boundary from one number

`screeningStageIds` (`:172-174`) is `axis.slice(0, screeningGateIndex(axis))`
and `isScreeningStage` (`:176-179`) is `i < screeningGateIndex(axis)`. The
comment at `:164-167` names the property the standard asks for: the pre-gate
set and the past-gate predicate are "in exact lockstep BY CONSTRUCTION now —
both read `screeningGateIndex`, so *screening stage* and *not yet past
screening* cannot drift apart", with a test pinning the pair.

The mirror derivation is `screenedLandingStage` (`:126-130`): the last stage
before the gate, falling back to the entry stage and then `axis[0]`, "so this
always names a real place to put somebody". It exists because two paths file
an already-assessed candidate — a rematch redirect and an applicant-tracking
import carrying a screened status — and both used to hardcode `"Screened"`,
"which is only that stage's name on the default axis".

## What an automated screen may do, per position

`screenStageOutcome` (`:205-212`) is the pre/post-gate permission table, pure
so the contract is unit-tested. A non-screening stage returns
`{ advance: false, holdForReview: false, applied: "advisory" }` — past the
gate the screen produces a verdict and nothing moves (`:206`). At the entry
stage the screen **always** advances, and confidence decides only how they
land: cleanly, or into the next stage flagged for human review (`:208-210`).
Deeper in the pre-gate region a clean route advances and anything else holds
in place (`:211`). No branch rejects; the docstring at `:181-185` records that
a weak verdict is already coerced to `hold` upstream, so "a screen NEVER
auto-rejects".

## Cross-team: each row against its own axis

`app/_lib/db/org-benchmarks.ts:44-58` carries the standard's comparability
rule as an incident note: this is "the ONE aggregate that spans teams, and
teams may run DIFFERENT boards — one team's *Onsite* is another's
*Interview*, and neither name means anything to the other." Each row is judged
against its own team's axis, resolved once per team into `axisFor` and reused
per row. Reading one shared axis, as it previously did, "silently counted a
renamed column as *never reached interview*, which is exactly the kind of
quiet wrong number a benchmark must not produce." The count itself
(`:63-65`) is the same `idx >= screeningGateIndex(axis)` predicate, per team.

The sample obligation sits beside it: `BENCHMARK_MIN_TEAMS = 2` (`:24`) as a
k-anonymity floor — "an org benchmark is never a window onto ONE other team"
— with `available: false` meaning withheld rather than zero (`:35`, `:123`).

## Where this falls short of the standard

`SCREENING_STAGES` (`:168`) still exists as a literal `["Accepted",
"Screened"]` alongside the derived `screeningStageIds`, kept for call sites
that have not been converted. It is correct only on the shipped axis.

`app/features/shared/pipelineTypes.ts:112-124` keys the per-stage aging
thresholds (`STAGE_SLA_DEFAULTS`) off stage **names**, not roles — a workspace
that renames its offer column loses its three-day threshold and silently falls
back to the flat ten-day default via `slaForStage` (`:130-135`). Those
thresholds belong to the aging discipline, but the coupling is this
technique's kind, and the standard's rule that thresholds key off role stands
unmet here rather than relaxed.

`docs/features/pipeline/README.md:86-92` lists the remaining name-coupled
sites and the triage that justifies leaving them — all "creation defaults or
cohort filters that are correct on the shipped axis and degrade to *files the
candidate in the wrong column* rather than to a wrong number". That written,
justified remainder is the standard's triage rule, applied honestly.
