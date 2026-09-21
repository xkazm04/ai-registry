---
layer: technique
type: technique
subject: goal-pacing-and-forecast
technique: goal-in-force-per-month
status: forged
laws: [not-measured-is-not-zero, one-target-one-threshold]
shared_with: []
use_when: [scoring closed months on a goal-attainment track record, storing a goal that can change, deciding whether a past month was a hit after the goal was raised]
---

# Goal in force per month

A monthly goal is a timeline, not a constant. A track record of closed months scores
each month against the goal that was in force that month, so a goal raised in June
never re-judges January, and a goal lowered in January never turns last autumn's misses
into hits.

## The failure this prevents

The natural first implementation stores one goal and compares every month to it. The
first time the owner raises the goal after a strong quarter, the attainment strip
repaints the previous months red: they were hits against the goal that existed then and
misses against the goal that exists now. The owner learns that the strip cannot be
trusted, and a track record that cannot be trusted is worse than none. The same thing
happens in reverse when a goal is lowered, and it is worse, because past misses become
hits and the narrative tells the owner things improved when only the bar moved.

## Procedure

1. **Store changes, not values.** The goal history is an append-only list of
   `{ effective month, goal }` entries, one per change, effective from a calendar month
   inclusive. Calendar month is the granularity because attainment is scored per month;
   a mid-month change applies to the whole month and the owner is told so.
2. **Resolve per month.** The goal in force for a month is the latest change whose
   effective month is at or before it. Months before the first recorded change fall
   back to the standing goal, so a history with no relevant entry reproduces the
   pre-timeline behaviour exactly - a business that never changed its goal sees what it
   always saw.
3. **Sanitise before use.** Drop entries whose month is malformed or whose goal is not
   a finite positive number; collapse duplicates for one month to the last one (a
   same-month correction wins); sort ascending. One canonical function, used by every
   reader of the raw stored list.
4. **Record idempotently by value.** A save that sets the goal already in force for that
   month adds nothing, so repeated saves never grow the log. A genuine change upserts
   the entry for its month. The caller persists the returned list.
5. **Score only complete months.** A month enters the track record when every
   calendar day of it is present in the series. A partial leading month, the
   in-progress current month, or a month with a hole would otherwise read as a fake
   miss ([not measured is not zero](../../../_laws.md#not-measured-is-not-zero)).
6. **Show the goal beside the month.** Each bar on the strip carries its own goal in
   the hover and the assistive text, so a reader who remembers that the goal changed
   can see that the strip remembers too.

## Decision rules

- When a goal is changed for the current month, the pacing card and the track record
  read the same value, because one target has one threshold and the card must not
  pace against a goal the strip will score against differently
  ([one target, one threshold](../../../_laws.md#one-target-one-threshold)).
- When a goal change is back-dated to a month that has already been scored, the strip
  re-scores that month and later ones and the owner is told which months moved; a
  silent re-score is the failure this technique exists to prevent, and a back-dated
  change is the one legitimate way to cause it.
- When the standing goal itself is changed without an effective month, treat it as a
  change effective this month rather than a change to history.
- When a business has separate goals per scope (paid portfolio, blended business), each
  scope has its own timeline; a change to one never touches the other.
- When the goal is an efficiency ratio rather than a revenue figure, the same timeline
  applies, and "hit" inverts for a lower-is-better target - the number shown never does.

## When NOT to use this

- To store a forecast or a plan line. The timeline records what the business agreed to
  aim at, not what a model projected; mixing the two makes the track record grade the
  model rather than the business.
- To smooth a goal across a month boundary. A goal is in force for whole months; a
  surface that wants weekly goals stores a weekly timeline, it does not interpolate.
- As an audit log. The list holds effective values, not who changed them or when the
  change was made; if the business needs that, it is a separate record, and the
  attainment scorer reads only this canonical shape.
- On sample data: a track record on illustrative months is never scored as a real
  track record.

## Convention, measured, documented

Month granularity, last-per-month collapse and the fallback to the standing goal are
design conventions chosen so that the pre-timeline behaviour is reproduced exactly for
a business that never changed its goal. The failure - a raised goal re-judging earlier
months - is a reproducible incident, not a preference.
