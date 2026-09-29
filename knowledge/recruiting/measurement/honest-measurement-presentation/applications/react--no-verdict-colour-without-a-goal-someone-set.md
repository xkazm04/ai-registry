---
layer: application
type: application
subject: honest-measurement-presentation
technique: no-verdict-colour-without-a-goal-someone-set
stack: react
status: forged
verified_on: 2026-09-29
verified_against: react@19
---

# The funnel band's verdict states, resolved as a value

The analytics funnel in this repo used to judge every stage against
`targets.conversion[stage] ?? 50` and paint the row coral when it fell short.
The incident comment at `app/features/insights/analytics/analyticsFunnelEmptyState.ts:70`
states the fix and the reason in the same breath:

> Nobody in the org ever agreed to that 50 %, and no surface disclosed it: the
> reader saw a red row and read it as *their* number failing *their* target. A
> colour is a judgement, and a judgement needs a benchmark somebody actually
> set — otherwise the honest output is a reading with no colour at all.
>
> `"none"` is therefore not an error state. It is the correct answer whenever
> the org has not said what good looks like, and it is what a stage wears until
> somebody opens the goals editor.

## The three states

`StageVerdict = "met" | "missed" | "none"` (`analyticsFunnelEmptyState.ts:86`)
and `stageVerdict(conversionPct, goal)` (`:98`) return `none` when **either**
input is missing: a null conversion (the first stage, or a stage whose
predecessor never had anybody) has nothing to judge, and a missing goal has
nothing to judge it against. Goals arrive as `ConversionGoals` — the
`targets.conversion` map the payload ships from the `analytics_targets` table,
which is explicitly recruiter-set (see `docs/features/analytics/README.md`'s
data model). A recruiter-set row is the goal record the technique demands; the
`?? 50` was not, and it was duplicated at three call sites, which is how it
drifted out of the one place that could have disclosed it.

`sections/PerformanceBriefing.tsx:295` is the whole render rule: `stageVerdict` picks
between `bg-coral` (missed), `bg-moss` (met) and `bg-stone-400` (none), and the
number itself renders in every case — the comment there says it exactly, "the
number is still shown, the judgement is withheld."

## Partial coverage is detected, not left to the reader

`hasUngoaledStage()` (`:109`) — true while at least one stage with a real
conversion number has no goal to be judged by — drives `showNoGoalNote`
(`PerformanceBriefing.tsx:138`), gated off the two branches where the note
would be noise (`no-data`, `no-movement`). This is the technique's rule 4:
grey rows on a partly-goaled funnel read as broken unless one sentence says
the withholding is deliberate.

## The weakest link refuses to be the lowest number

`pickWeakestLink()` (`:124`) returns null when no goal is set, and the doc
comment gives the reason in the technique's own terms: "without a goal there
is no weakest *link*, only a lowest *number*, and the brief must not promote
the second into the first." It only considers stages where **both** a
conversion and a goal exist, filters to `gap > 0`, and sorts by the gap
against **that stage's own** goal — not by raw conversion, which would rank
stages whose natural rates differ by an order of magnitude against each other.

## The entitlement is a value, and that is why it survives

`funnelBandState()` (`:171`) resolves the whole ladder into one tagged union —
`no-data → no-movement → stalled → weakest → no-goal → healthy` — and the doc
comment states that "the order is the argument": movement licenses a
conversion number at all, dwell keeps its precedence over conversion, and an
org-set goal is the last gate before the band may call a stage weak. The
component (`PerformanceBriefing.tsx:129`) does nothing but map the branch to
JSX.

That structure exists because of the *other* incident recorded in the same
file. `hasNoStageTransitions` and its guide copy "were written, translated into
four locales, and then quietly left off the render path, where nothing failed
because nothing pinned which branch the band takes." Resolving the branch as a
value lets a `node:test` assert it against a real analytics payload, so
orphaning the rule again fails the suite. This is the golden path's structural
rule realized: an honesty rule expressed only as a conditional inside a
component is a guard nothing can see.

## Confirmed elsewhere, and one honest gap

`docs/features/analytics/README.md:1210` lists "no verdict colour without a goal
the org set" among the honesty rules the surface keeps, under a heading that
calls them **load-bearing, not stylistic** — the framing this subject argues
for. `docs/product/uat-insights/2026-08-17-analytics-sections.md:77` carries
the guardrail set the rules were extracted from, including G1's demand that an
under-data verdict stay *the headline, never a caveat*.

The gap the repo names itself: a candidate *filed* at a stage is
indistinguishable from one *moved* there, because the payload carries
reached/current counts but no transition count. On a workspace whose
candidates all arrive already-screened, `hasNoStageTransitions()` reads
movement that never happened, and the first gate in the ladder opens too
early. It is pinned as a `KNOWN GAP` test in `analyticsFunnelGuard.test.ts`
(`:336`, still open at kp `24006b85e`) rather than papered over — which is the right handling, but the gate is
currently weaker than the technique requires.

## A verdict on a thin sample, beside the benchmark

`app/features/insights/analytics/AnalyticsOrgBenchmarkPanel.tsx` compares the
team against the org-wide aggregate and colours the difference "ahead" (moss)
or "behind" (coral) by a declared polarity. Its comment records one fix
already: an empty team used to arrive as rates of 0 and read as "behind" on
its first visit, so rates are now read only when `team.totalEntries > 0`
(`:114`). The floor stops at one. A team with two entries and no hire is
painted "behind" on hire rate against the whole company, a verdict on a sample
the rest of the analytics refuses to call a movement on
(`MIN_RATE_DELTA_N = 5` in `analytics-deltas.ts`). The technique's rule is that
a goal, or here a benchmark, does not license a claim the sample cannot carry:
the figure stays, the verdict chip is withheld below the floor.
