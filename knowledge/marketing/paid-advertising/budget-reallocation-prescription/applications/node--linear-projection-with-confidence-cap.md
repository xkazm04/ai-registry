---
layer: application
type: application
subject: budget-reallocation-prescription
technique: linear-projection-with-confidence-cap
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# The projection and its confidence cap in a Czech adtech workspace - the model held, one decision rule did not

At the head of the default branch on 2026-10-14 the simulation is a pure function that
moves spend and conversions at each campaign's own current efficiency and re-derives
the totals with the shared aggregate. A pause is the donor half of a shift, a keyword
move is skipped before the donor lookup so the projection is an exact identity, the
calibration multiplier touches the recipient half only, and a donor-share helper
labels the whole set low-confidence above a half-of-donor cap that sits above the
recommender's own forty percent. Donor spend is stored with each move. Every numbered
step of the procedure has a line, and both display surfaces (the live panel and the
stored change-set) render the label.

## The seam chosen to falsify

The cap was tried first as the seam: could two shifts from one donor each stay under
the cap while together passing it? The recommender uses each donor once, so no. That
arm could not return a result that changed the landing, so it was dropped. The decision
rules were read instead, and one was not honoured: "when the projected gain is zero or
negative, do not compute a lift percentage". The live panel divided the value change by
the live value unconditionally, so a pause-only set showed a signed zero percent, a
ratio against nothing wearing a measurement's clothes.

## The paired proof

Same inputs through the display arithmetic, a pause of a zero-return campaign and a
pause of a converting one.

- A, as it was: both rendered a signed percentage (zero, and a negative one).
- B, with a pure lift helper returning nothing unless the gain is positive: both render
  "no lift"; a shift to a stronger recipient still renders its lift unchanged.

Target: sets with a non-positive gain that display a percentage, 2 of 2 in A, 0 of 2
in B. Floor: all 330 campaign unit tests green (two added), type check and lint clean,
the shift path and the confidence label untouched. Status: ab-paired at n=2 on
constructed rows.

## What it does not show

The recommender only emits pauses for zero-return donors, so a negative gain is
reachable only from manually built sets; the zero-gain pause-only case is the live one.
The second rule, presenting a pause-only set as arithmetic ("spend saved") rather than
an estimate, was not changed: the stored-set surface still captions it as a linear
estimate. How often operators approve pause-only sets was not measured.
