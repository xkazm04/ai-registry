---
layer: application
type: application
subject: small-sample-honesty-in-hiring-analytics
technique: state-the-accrual-horizon
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# The accrual horizon — a pure module, a published floor, and age-matched periods

kp applies this technique in two places, six weeks after it was written and citing
it by name in both: a module that turns a refusal into a plan, and a cohort fold
that keeps two periods equally mature. Citations resolve against the kp tree at
`775c5d02e` (2026-09-29).

## A refusal with a date, or with its reason

`app/_lib/accrual-horizon.ts` opens by quoting step 5 of the technique — *"a
refusal with a date attached is a plan; without one it is an excuse"* — and then
makes the second half stricter than the technique first was. `accrualHorizon`
(`:37`) returns the shortfall (`more`), whole weeks at the recent pace rounded
**up**, and the date, or `null` with one of three named reasons (`:21`):

- `no-pace` (`:52`) — nothing has accrued recently, or no pace is measured for the
  row's unit, *"so any date would be invented"*.
- `window-too-narrow` (`:56`) — a sliding window's count is bounded by pace times
  window, so at this pace it never holds the floor and the only honest advice is to
  widen it.
- `not-accruing` (`:50`) — a point-in-time figure; waiting is not the remedy.

A fractional week rounds up because *"a date that arrives early is a promise
broken"* (`accrual-horizon.test.ts:47`), and a float slack keeps 3 / 1.5 at two
weeks rather than three. The technique's own decision rule for this case is the
one written down here, after the module had shown it was needed.

## The pack applies it per row, in the row's own unit

`app/_lib/metric-pack.ts:307-336` builds the horizon for every blocking metric. The
unit matters more than the arithmetic: hires have a measured pace (the momentum
series, `paceFromMomentum` at `:125`, an empty series is 0 and 0 means *no date*);
assisted actions and survey responses have none today, so those rows say `no-pace`
rather than borrow the hire pace; recruiter capacity is a snapshot and says
`not-accruing`, with `windowDays` withheld because a window cannot bound a
snapshot (`:328-329`). The floors it counts against are the row's own
(`MIN_SAMPLE`, five times that in actions, `MIN_OPEN_ROLES`, the response minimum).

The result travels: `need` on every blocking row (`:57-61`) with a sentence
resolved at build time, appended verbatim to the Markdown caveat so the file and the
in-app preview say the same thing (`:339-348`). "Four of the eight needed, about
five weeks, by this date" replaces a bare "only 5 observations" — which is the
published-floor rule and the horizon rule meeting in one field.

## Periods are equally mature

`app/_lib/analytics-cohort.ts:20-33` is the technique's decision rule *"when a
figure is compared across periods, the periods must be equally mature"* enforced in
the fold that feeds both sides of every period-over-period delta. A cohort is
judged **as of its window's end**: a terminal row counts as hired, and joins the
time-to-hire sample, only when its terminal transition landed before `asOfMs`
(`:101`, `:108-114`). The live read passes infinity; the prior window passes its own
end, so both have had the same 0..N days to mature. The comment records what the
mismatch used to do: a 30-day view compared a cohort with at most 30 days to hire
against one with up to 60, so *"the hire-rate delta read as a decline and the
time-to-hire delta as an improvement, every time, with no change in behaviour."*
The two windows also come from one clock and tile half-open, so the boundary row
belongs to exactly one.

The limit is stated in the same comment (`:31-36`): only the terminal leg is
age-matched; earlier columns keep a current-stage basis because a stage-as-of read
needs the event ledger. Every rate is still gated on both sides' n
(`app/_lib/analytics-deltas.ts:111`), so the un-matched legs cannot turn into
alarms on thin cohorts.

## Deviations

- **The pace is not counted in the sample's unit.** `time_to_hire` is sampled on the
  narrower set of hires with complete timestamps (the fix recorded under the
  named-minimum application), but its accrual pace is hires per week from the
  momentum series, which counts every hire. On the shipped corpus that is nine
  hires against five usable, so the date is about 1.8 times too near.
  The technique's rule is that a horizon is computed from the count needed and the
  rate of accrual *of that count*; the module states it for the unit and the
  caller does not yet hold it for the subset. Not yet measured on a live workspace.
- **Actions and responses have no pace**, so their thin rows can only say
  *no-pace*. That is honest, and it leaves the three-quarters of the pack that is
  not hire-denominated without the plan the technique calls for.
- **The forecast band's floor refusal** is named in the module header as the next
  consumer (`accrual-horizon.ts:18-19`); it does not read the module yet.
