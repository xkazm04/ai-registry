---
layer: application
type: application
subject: recruiting-funnel-metrics
technique: stage-pass-through-and-dwell-time
stack: react
status: forged
verified_on: 2026-09-26
verified_against: react@19
---

# A dwell band that shows who is waiting, and a stall claim that prints the statistic it did not rank by

The node side of this subject covers the folds. This application covers the
screen a recruiter reads them on: the dwell band of an analytics briefing,
`app/features/insights/analytics/AnalyticsStageDwellPanel.tsx`. It is a React 19
client component (`:1`) in a Next.js app, with its row rules factored into a pure
module, `stageDwellGate.ts`. Read on 2026-09-26 at one pinned commit.

## The population is right: as of now, whatever window is on screen

The band reads its own population: every active entry, ignoring the page's
window (`app/_lib/db/analytics-stage-dwell.ts:1-14`). The header records why.
The briefing's other figures fold the window's creation cohort, and in a 30-day
view "every active candidate created before the window vanished from the dwell
band … precisely the longest waiters", so "the narrower the reader looked, the
healthier the board seemed". The context line under the band's claim tells the
reader the same thing in the UI: "Median and longest wait for everyone sitting in
each stage right now, whatever period you view" (`:79`). This is the cohort
technique's "do not use creation cohorts for anything a recruiter acts on today",
reached independently by a bug.

## The rows: the technique's surfacing rules, each in pure code

`dwellRowModel()` (`stageDwellGate.ts:119-132`) decides what a row may claim,
and the panel renders it (`AnalyticsStageDwellPanel.tsx:85-102`):

- **A pair, not a mean.** "median {m}d · oldest {o}d · {n} waiting"
  (`:91`). The fold's comment gives the technique's reason: "a mean of 2, 3 and 31
  days reads '12', which describes nobody and hides the one who never exits"
  (`analytics-stage-dwell.ts:23-26`).
- **No median below the floor.** Below `BOTTLENECK_MIN_SAMPLE` occupants the row
  reads "{n} waiting · oldest {o}d · too few for a median" (`:93`,
  `stageDwellGate.ts:120`).
- **Thresholds per stage role, as overridable defaults.** Each row carries a
  cadence from the team's own setting or the role's default, and names which:
  "past team's {d}d" vs "past default {d}d" (`:99`). The team can set it in place
  (`StageCadenceInput`, `:139-145`).
- **A verdict only against a goal someone set.** The bar is coloured over or within
  only when the cadence is the team's (`stageDwellGate.ts:123`). Against the
  shipped default it stays neutral. This is the technique's "a surfacing rule,
  not a verdict", enforced in one line.
- **Actionable.** The past-cadence count links to exactly those cards, and the
  board filter uses the same aging clock the server counted with.

## Deviation 1: the pair has lost its completed half

The technique's pair is the median of *completed* passages (how long the step
takes when it works) plus the age of the current occupants (where the problem
is). This band shows two views of the occupants: their median age and the
oldest. Both are stock. Neither is the step's speed, and no screen on the
surface shows completed dwell. The label is honest about this, since the row says
"waiting" and the band says "right now". The conditioned technique names this
shape: a legitimate as-of-now view of who is waiting, labelled as such. What it
cannot do is separate a slow step from an abandoned card. Snapshot ages are
length-biased toward long stays, and a card nobody closed ages forever.

## Deviation 2: the stall claim prints a statistic the ranking did not use

The briefing's funnel band can claim a stall: "Candidates are stalling at {stage},
{days} days on average" (`sections/PerformanceBriefing.tsx:259`). The stage is
chosen by `pickBottleneck()`, which ranks by the **median** of the occupants' days
(`app/_lib/analytics-bottleneck.ts:22-44`). The number printed is
`avgDaysInStage`, the **mean** of the same array (`:33`, `:40`). On the fold's own
example of 2, 3 and 31 days, the stage is chosen on 3 and announced as 12. The
technique's decision rule applies directly: rank by one thing and say which you
ranked by. The claim sentence also carries no n. The bottleneck type returns
`entryCount` for exactly this, and the older banner string used it.

## Pass-through, for completeness

The surface's stage conversion is `reached[i] / reached[i−1]` over the window's
creation cohort, with reach inferred from each row's current stage
(`app/_lib/analytics-cohort.ts:163-168`). That is the snapshot-reach fallback
the golden path describes. It assumes monotone progression and counts residents
of the upstream stage who have not yet moved. The fold's own header states the
limit: only the terminal leg is age-matched, and earlier columns keep their
current-stage basis (`:32-36`).
