---
layer: technique
type: technique
subject: local-visibility-and-reputation
technique: sustained-decline-three-runs-three-positions
status: forged
laws: [statistical-honesty-before-a-verdict, label-convention-as-convention, not-measured-is-not-zero]
shared_with: []
use_when: [deciding whether a rank series is in decline, writing a recap that names worsening keywords, importing rank history with irregular dates]
---

# Sustained decline: three runs, three positions

A single worse import is a reading. A decline is a *run* of consecutive worsening
observations that reaches the latest one and clears a magnitude bar. The bundle's
convention is a run of at least three worsening moves losing at least three positions
in total; both threes are chosen, not measured, and are labelled so. What is not a
convention is the shape: a run condition and a magnitude condition, both required, on
a series whose dates were parsed without guessing.

## Procedure

1. **Order the history by date and require dated points.** A history with fewer than
   two dated observations has no span, and a span of zero days has no trend. The span
   is the distance between oldest and newest, computed from the data, never a
   hardcoded window presented as "the last ninety days".
2. **Walk backwards from the latest observation.** Each step compares one observation
   to the previous one. A step counts toward the run if it moves in the worsening
   direction (rank number increasing) by at least the noise floor - one position,
   because ranks are integers and any move of one is a real move. The walk stops at the
   first flat step, the first step in the other direction, or the first step under the
   floor.
3. **Require the run to reach the latest observation.** A run that ended two imports
   ago is history, not a current decline.
4. **Apply the magnitude bar.** Positions lost from the observation just before the
   run to the latest one must be at least three. Three one-position wobbles satisfy
   the run condition and fail this one - which is the point.
5. **Return nothing when the rule does not fire.** A recovering series, a flat series,
   a history too short for a full run: no verdict. Not "stable", not "healthy" -
   *nothing*, because a rule that cannot fire has not cleared the business.
6. **Report worst offenders first,** ordered by positions lost, each with its run
   length and its drop, so a recap can name the two keywords actually sliding rather
   than announce "positions declined".

## Decision rules

- **When a run of three or more worsening moves reaches the latest observation and
  has lost three or more positions, call it a sustained decline, because a single
  blip cannot produce that shape** without something changing - a competitor's
  listing, a page problem, a category change.
- **When only one of the two conditions holds, say nothing about decline.** A long
  run of tiny moves is drift inside the noise; a big single drop is an event worth a
  look on its own line but not a trend.
- **When a keyword was omitted from the latest import, keep its history, mark it
  untracked, and exclude it from the decline walk**, because a frozen position from
  months ago followed by nothing is not a series.
- **When the decline rule fires on single-point observations, keep the *one point,
  one day* label on the finding**; a run on a moving observer is weaker evidence than
  a run on a fixed grid cell.
- **When both a decline and a coverage gap exist, the gap still leads**, because an
  unbuilt page is a larger missed demand than a slipping one; the decline is the
  second line of the diagnosis. This ordering is practitioner convention.

## Dates are parsed, not guessed

The rule stands on an ordered series, and an ordering stands on dates. Three
separator families need three policies. A dashed year-first date is unambiguous. A
dotted date is day-first by European convention and is accepted as such. A slashed
date where both fields are one to twelve and differ is *ambiguous* - day-first and
month-first disagree and both are plausible - and the row is refused rather than
dated, with a count of refusals returned to the importer. A slashed date with one
field over twelve resolves. A review or observation silently dated to the wrong month
poisons every recency figure and every run computed downstream; a refused row is one
line somebody can fix.

## Why a shared detector is the right shape

The walk above - same-direction moves beyond a noise floor, reaching the latest point
- is the same detector a campaign uses to catch a slow bleed in a weekly metric. The
difference is the floor and the bucketing: a metric series is de-seasonalised into
weekly buckets with a floor derived from its own variance; a rank series is irregular,
integer-valued and monthly-ish, so the bucketing is skipped and the floor is one. Using
one walk for both keeps "decline" meaning one thing across the report.

## When NOT to use

- **On a history of fewer than four observations.** A three-move run needs four
  points. The technique returns nothing, and the recap says the ladder is young.
- **On a series that mixes engines or areas.** Split first; a run across two maps or
  two cities is not a run.
- **As the alarm for a suspended listing.** A listing that vanishes drops off the
  pack in one step; that is the status parse's job, and the attention score's, not a
  three-run rule that would take three imports to notice.
- **To declare improvement.** The same walk in the other direction finds a climb, but
  a climb needs no alarm; report it as a climb, without the decline rule's urgency.
