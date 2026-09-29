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
Re-read 2026-09-29 at kp `ca3d48934`, then again the same day at `7340988e2`
with the pure functions executed against constructed axes (the cited files did
not change between the two). Line numbers are the `7340988e2` ones unless a
sentence says they are after the fix. That second read found the screening set
and the permission table wrong in ways the first read had recorded as fine; the
fix landed as kp `5f990d590` on the local main branch (unpublished), and the
sections below say which side of it each line describes.

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

At `7340988e2`, `screeningStageIds` (`:213-218`) was
`axis.slice(0, screeningGateIndex(axis))` minus every `homework` stage, and
`isScreeningStage` (`:220-223`) was `i < screeningGateIndex(axis)` with the same
exclusion. The comment at `:196-205` names the property the standard asks for:
the pre-gate set and the past-gate predicate are "in exact lockstep BY
CONSTRUCTION now — both read `screeningGateIndex`, so *screening stage* and *not
yet past screening* cannot drift apart", with a test pinning the pair.

Executed over constructed axes, "the range minus homework" was too wide. A
`custom`, a `scoring` or an early `offer` column placed before the first
interview was in the set (`[New, Scr, Cust:custom, Int, ...]` gave
`New, Scr, Cust`), so it was offered "Screen with AI" and could be named as the
place an already-screened candidate lands. The golden path says a custom stage is
"never counted as screening"; the code counted it. Since `5f990d590` the set is
the `entry` and `screening` roles **intersected** with the ordinal gate
(`pipeline-stages.ts:218-227` after the fix). It still reads the one gate number,
so the lockstep with `hasAdvancedPastScreening` holds, and the default board
answers byte-for-byte as before.

The mirror derivation is `screenedLandingStage` (`:164-168`): the last stage
before the gate, "so this always names a real place to put somebody". It exists
because two paths file an already-assessed candidate — a rematch redirect and an
applicant-tracking import carrying a screened status — and both used to hardcode
`"Screened"`, "which is only that stage's name on the default axis". Executed, it
returned the homework column (`[New, Scr, HW, Int]` gave `HW`), the custom column
and, on the enterprise preset, `Homework`: an already-assessed person filed into
the case step. It now takes the last entry or screening stage before the gate. Its
docstring promised an entry-stage fallback the code never had
(`before[last] ?? axis[0]`); the two agree on every valid axis, where the entry is
first.

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
nothing triages a CV there, so the set has to be narrower than the range
(the `StageRole` comment at `:40-53`): "a 'Screen with AI' run at a homework
column would advance a candidate past the assignment the column exists to give
them." `hasAdvancedPastScreening` stays purely ordinal, so the metric and the
automation permission still share one boundary number. What the first fix got
wrong was the direction of the narrowing: it subtracted the one role it had met,
and the executed axes above show four more (`custom`, `scoring`, an early `offer`,
and a `screening`-role column that sits *after* the gate). Intersecting with the
roles that triage is one rule where the subtraction was a list that grows with
each new role.

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

**The protection ends where the stage does.** "Position alone is the honest
answer" holds while the kept stage is still on the axis. Migration deliberately
skips closed candidates (all four terminal statuses), so a candidate rejected
after an interview keeps the id of an `Interview` column the workspace later
removes. The cohort loop resolves rows against the live axis only
(`analytics.ts:533`, `axis` is the workspace's current one), and no metric file
reads the retired list (`retired` appears in none of `analytics.ts`,
`analytics-cohort.ts`, `org-benchmarks.ts`). `stageIndex` is -1 for that row, so
`hasAdvancedPastScreening` answers false: a person who was interviewed counts as
not having advanced, in the denominator and out of the numerator. The tombstone
resolves the row's *label* and nothing that measures. Executed for the pure half
(an unresolvable id returns false everywhere); the analytics loop was read, not
run, because the tree has no dependencies installed here.

## Where this falls short of the standard

At `7340988e2` `screenStageOutcome` (`:249-256`) was not axis-aware. Its only
caller (`automation-run.ts:569`) passed the entry's stage and the route and no
axis, so `isScreeningStage` resolved against the shipped default axis, and the
entry branch was the literal `stage === "Accepted"`. Executed, in both directions:

| Axis | Stage | Before | After `5f990d590` |
| --- | --- | --- | --- |
| renamed (`Inbox, Triage, Talk, Deal, Won`) | `Inbox`, `Triage` | `advisory`, `advisory` | `advanced`, `advanced` |
| `[New, Scr, Cust, Int, ...]` | `New`, `Scr` | `advisory` | `advanced` |
| enterprise preset (`Accepted, Homework, Interview, Screened, Human interview, ...`) | `Screened` (screening role, after the first interview) | `advanced` | `advisory` |
| shipped default | all five | unchanged | unchanged |

So on any board whose ids differ from the shipped names the automated screen did
nothing at all (the earlier reading of this page saw only that direction), and on
the shipped enterprise preset the one screening column that sits behind a human
interview *moved* a candidate on a clean verdict, where the comment in
`stage-ai-actions.ts:50-51` promises "a late screen informs and moves nobody".
That is the standard's silent failure sitting in the permission table. The fix
threads the workspace axis in from `automation-run.ts` (default kept for callers
without one) and asks the role, not the name, at the entry branch. Two new tests in
`pipeline-stage-roles.test.ts` fail on the old module and pass on the new one;
that file plus `pipeline-screening.test.ts` ran 22/22. Not run: the type-check
(the detached tree has no `node_modules`) and the full unit suite.

The path that follows a clean verdict on a board with no interview or offer stage
is code-read, not run: the gate is then the terminal stage, a clean screen at the
last screening column would ask `actOnPipelineEntry` to advance onto it, and the
"cannot reach the terminal without an offer" guard (`acceptWouldReachTerminal`)
sits in `pipeline-entry-action.ts`, not in the store call the automation uses.
The validator does accept such an axis.

`SCREENING_STAGES` (`:206`) still exists as a literal `["Accepted",
"Screened"]` and is still re-exported from `db/pipeline.ts:91`; only tests read
it. It is correct only on the shipped axis.

**The length fallback is unreachable on a valid board.** The standard, and the
`screeningGateIndex` comment, present "nothing is past the gate" (`axis.length`) as
a live outcome. The validator requires exactly one terminal stage, so a validated
axis always has a gate at or before it; executed, an axis with no terminal is
refused. The test at `pipeline-stage-roles.test.ts:182-195` uses an axis the
product would refuse. The case that does occur is an axis with an entry, a
screening step and a terminal and nothing between: the gate is the terminal, so
only a hired candidate has "advanced past screening".

**Name-coupled read sites outside the README's list.** The README triage says the
leftovers degrade to *filing the candidate in the wrong column, not a wrong
number*. Read at `7340988e2`: `interview-recording.ts:132` starts the audio
retention clock on `entryStage === "Hired"`, `journey/project.ts:1019` sets a
cohort outcome on `entry.stage === "Hired"`, `floor-move-preview.ts:156` filters
its cohort on `stage === "Screened"`, `db/core.ts:3731` checks `Accepted` /
`Screened`, and `features/shared/decisionsTypes.ts:92` holds a literal stage list.
They bite only when a workspace drops or replaces a shipped id, since a rename
keeps the frozen id, and at least the first two change a retention clock and an
outcome, not a filing.

**Two definitions of "screening stage" coexisted.** The TypeScript manual screen
and `batch_screen` used the range minus homework; the Python policy pass
(`pipeline/jobfit/automation.py:194-235`) is role-driven from a `stageRole` the
TypeScript side stamps, and rejects only on `screening`-role columns
(`StageRoleSyncTest` pins the two role tables). They differed on exactly the
custom, scoring and late-screening cases above. After the fix they agree on the
pre-gate case; the Python side was read, not run.

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
