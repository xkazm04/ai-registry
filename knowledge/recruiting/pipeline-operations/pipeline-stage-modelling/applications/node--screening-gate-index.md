---
layer: application
type: application
subject: pipeline-stage-modelling
technique: screening-gate-index
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# One derived index, and everything that used to read a string

`app/_lib/pipeline-stages.ts` is the whole technique in a pure, DB-free module
— deliberately free of the `better-sqlite3` import so the fairness predicate
is unit-testable in isolation and the stage order has one source (`:1-6`).
Re-read 2026-09-29 at kp `ca3d48934`: the module has grown (line numbers below
are the current ones), and three things moved that the first reading recorded
differently.

## The incident comment that justifies the module

`:20-27` states the problem in the form the standard describes. The board's
five columns were about to become workspace-editable, and that is "only
survivable if nothing derives meaning from a stage's NAME, because today
almost everything does": the fairness metric was literally
`indexOf(stage) >= indexOf("Interview")`, the move menu excluded the string
`"Hired"`, org benchmarks indexed off `"Interview"`. "Rename or reorder a
stage under those and they quietly answer a different question." The fix
named in the same comment (`:29`): "A role is the stable half."

`StageRole` (`:57`) is the closed vocabulary — `entry | screening | homework |
interview | scoring | offer | terminal | custom` — and `STAGE_ROLE` (`:95`) is typed
`Record<PipelineStage, StageRole>` specifically so that "adding a stage to the
axis without deciding what it MEANS is a compile error". The standard's
refuse-don't-default rule, enforced by the type checker rather than at
runtime.

## The gate: first real look, not last filter

`screeningGateIndex` (`:170-176`) walks `["interview", "offer", "terminal"]`
and returns the index of the first stage carrying the first role that
appears, falling through to `axis.length`. The comment at `:146-154` gives the
reasoning the standard now carries: expressed as "the first stage of a role"
rather than "after the last screening stage" **on purpose**, because "a
workspace may add several screening-ish stages, or none, and the question the
fairness metric asks is always *did they get a real look*, not *how many
pre-stages were there*". The terminal fallback lands on `axis.length` — "nothing
is past the gate" — "rather than crashing or silently declaring everyone
advanced".

`hasAdvancedPastScreening` (`:191-194`) is then two lines:
`i >= 0 && i >= screeningGateIndex(axis)`. Both halves are load-bearing. The
inclusive comparison is the reach-the-gate event; the `i >= 0` guard is the
off-axis rule — a candidate on a retired column has advanced past nothing
(pinned at `pipeline-stage-roles.test.ts:66`). Its docstring records that on
the default axis the answer is "byte-identical to the old
`indexOf(stage) >= indexOf("Interview")`", which is what made the migration
provable rather than hopeful.

## Both sides of the boundary from one number

`screeningStageIds` (`:213-218`) is `axis.slice(0, screeningGateIndex(axis))`
minus every `homework` stage, and `isScreeningStage` (`:220-223`) is
`i < screeningGateIndex(axis)` with the same exclusion. The comment at `:196-205` names the property the standard asks for: the pre-gate
set and the past-gate predicate are "in exact lockstep BY CONSTRUCTION now —
both read `screeningGateIndex`, so *screening stage* and *not yet past
screening* cannot drift apart", with a test pinning the pair.

The mirror derivation is `screenedLandingStage` (`:164-168`): the last stage
before the gate, falling back to the entry stage and then `axis[0]`, "so this
always names a real place to put somebody". It exists because two paths file
an already-assessed candidate — a rematch redirect and an applicant-tracking
import carrying a screened status — and both used to hardcode `"Screened"`,
"which is only that stage's name on the default axis".

## What an automated screen may do, per position

`screenStageOutcome` (`:249-256`) is the pre/post-gate permission table, pure
so the contract is unit-tested. A non-screening stage returns
`{ advance: false, holdForReview: false, applied: "advisory" }` — past the
gate the screen produces a verdict and nothing moves (`:250`). At the entry
stage the screen **always** advances, and confidence decides only how they
land: cleanly, or into the next stage flagged for human review (`:252-254`).
Deeper in the pre-gate region a clean route advances and anything else holds
in place (`:255`). No branch rejects; the docstring at `:225-234` records that
a weak verdict is already coerced to `hold` upstream, so "a screen NEVER
auto-rejects".

## Cross-team: each row against its own axis

`app/_lib/db/org-benchmarks.ts:76-81` carries the standard's comparability
rule as an incident note: this is "the ONE aggregate that spans teams, and
teams may run DIFFERENT boards — one team's *Onsite* is another's
*Interview*, and neither name means anything to the other." Each row is judged
against its own team's axis, resolved once per team into `axisFor` and reused
per row. Reading one shared axis, as it previously did, "silently counted a
renamed column as *never reached interview*, which is exactly the kind of
quiet wrong number a benchmark must not produce." The count itself
(`:97`) is the same `idx >= screeningGateIndex(axis)` predicate, per team.

The sample obligation sits beside it: `BENCHMARK_MIN_TEAMS = 2` (`:24`) as a
k-anonymity floor — "an org benchmark is never a window onto ONE other team"
— with `available: false` meaning withheld rather than zero (`:67`, `:167`).

## Where the pre-gate set is narrower than the pre-gate range

The homework column is the case the standard's "everything before the gate" rule
had not met. It sits before the gate (a case precedes the first interview) but
nothing triages a CV there, so `screeningStageIds` and `isScreeningStage`
subtract it (`:213-223`, the `StageRole` comment at `:40-53`): "a 'Screen with AI'
run at a homework column would advance a candidate past the assignment the
column exists to give them." `hasAdvancedPastScreening` stays purely ordinal
and is untouched, so the metric and the automation permission still share one
boundary number, but the automation set is now the range minus a role, not the
range. The lockstep the comment at `:196-205` still claims is therefore true of
the gate and no longer of the two sets.

## Where closure lives here: a status beside the stage

The standard's terminal-outcome trap does not occur in this tree, because a
rejection is not a move onto the terminal stage. `pipeline_entries.status` is
`active | rejected | declined | rematched | role_closed`
(`pipeline-status.ts:41-48`); the only terminal *stage* is `Hired`, and "a
hired candidate keeps status='active' (stage='Hired')" (`:1-30`). A candidate
rejected at Screened keeps the stage Screened, so `hasAdvancedPastScreening`
answers false for them by position alone, with no outcome to resolve first.

The obligation sits on the population instead, and this tree meets it in the
places read. The archetype loop (`db/analytics.ts:520-533`) runs the predicate over
every row the cohort read returns, and that read (`:355-368`) filters on date,
workspace, job and the simulation marker, never on status, so the people the
filter removed stay in the denominator. `analytics-cohort.ts:148-150` keeps the
two populations apart on purpose: `reached` counts every row up to its stage,
`current` counts only `status === "active"`. The header of `pipeline-status.ts`
records why four closed statuses exist: folding decline into reject "corrupts
funnel, re-engagement and offer-acceptance reporting". That is the golden path's
"a fourth outcome" hazard, met at four.

Not read: every other consumer of `status`. The claim is that these two
computations are right, not that no in-flight count anywhere forgets the filter.

## Where this falls short of the standard

`screenStageOutcome` (`:249-256`) is not axis-aware. Its only caller
(`automation-run.ts:569`) passes the entry's stage and the route and no axis, so
`isScreeningStage` resolves against the shipped default axis, and the entry
branch is the literal `stage === "Accepted"`. Ids are the frozen shipped names, so a *rename* is safe; the failure needs an id
the default axis does not carry (a screening step the team added, or a shipped
column it removed). There the screen reads as advisory: nothing moves, nothing is
held for review, and no error says so. That is the standard's silent failure
sitting in the permission table, which the technique describes as indexed by
role. It is the one shortfall on this page that changes what an automated
action does.

`SCREENING_STAGES` (`:206`) still exists as a literal `["Accepted",
"Screened"]` and is still re-exported from `db/pipeline.ts:91`. It is correct only
on the shipped axis.

The aging-threshold coupling the first reading recorded is closed.
`slaForStage` (`aging-policy.ts:76-90`) resolves an override, then the team's
`slaDays` on the axis, then `ROLE_SLA_DEFAULTS[role]`, and only for a retired id
the name-keyed `STAGE_SLA_DEFAULTS`, which is now derived from the role table. A
renamed offer column keeps its three-day default. The team number lives on the
`StageDef` (`slaDays`, `pipeline-stages.ts:85-90`), refused on the terminal role
by the validator (`decision-config-schema.ts:471`); the default per
role stays in the aging module, which is where the seam belongs.

`docs/features/pipeline/README.md:131-139` lists the remaining name-coupled sites
and the triage that justifies leaving them: creation defaults or cohort filters
that are correct on the shipped axis and degrade to *files the candidate in the
wrong column* rather than to a wrong number. That triage does not cover
`screenStageOutcome`, which is listed nowhere there and does not degrade to a
misfiled card.
