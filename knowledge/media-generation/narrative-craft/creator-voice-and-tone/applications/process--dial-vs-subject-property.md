---
layer: application
type: application
subject: creator-voice-and-tone
technique: dial-vs-subject-property
stack: process
status: forged
applied: simulation
ab_verdict: unmeasurable
verified_on: 2026-10-14
---

# Process: the stat-reel read, no tone dial exists, and the subject properties are protected unevenly

The seam was chosen to falsify "the project is conformant because it exposes no tone
controls" (the technique's own warning: not a dial is necessary, not sufficient). A
caught outcome would be a word-budget path that can remove an epistemic marker; a held
outcome is a structure that keeps the marker out of the budget's reach.

## What the tree does

- There is no creator-facing tone control at all; the only creator-shaped input is a
  use case and its duration band. Nothing to classify as a mis-exposed dial.
- The server computes the length estimate from the narrator's measured words per minute
  and rejects an over-long script with the number of words to cut. The rejection text and
  the draft prompt both say figures and hedges must not be cut to fit.
- Figures are protected mechanically: every displayed number must trace to a warehouse
  fact and match it (sign included), so the budget cannot shave a figure. Hedges are
  protected only by that sentence of prose. No check measures them, and nothing reports
  them as unmeasured.
- The estimate label (the method note on the render props) lives in the props document,
  which the script budget never touches: the compression channel cannot reach it.

## Three cases walked under policy A (as is) and B (measure and report)

1. Over-long first draft of a legacy headline format: the retry instruction asks the
   writer to cut words; the cheapest optional words are the ones that qualify the
   adjusted figure. A passes if the writer obeys the prose; B records hedge count before
   and after the retry and reports "unmeasured" when the use case declares none.
2. A time-evolution format, whose facts are deterministic warehouse values: expected
   hedging is near zero by the technique's own range, so B reports unmeasured/not
   applicable and A is equivalent. The protection only matters for estimate-bearing
   subjects.
3. A modelled value (era-adjusted rank) narrated without its label: A accepts it (the
   figure traces to a fact); B would require the label word in the narration when the
   use case is flagged as an estimate.

Prediction: A and B differ only in case 1 and 3, and only for estimate-bearing use
cases, of which exactly one exists and it is marked legacy and not offered to board
loops. Falsified if a live use case turns out to carry estimates. Not changed in the
project: the new field and check would serve a use case nobody runs.

Return condition: when an estimate-bearing use case is offered to loops, add a declared
estimate marker to the use case and fail the script gate when the marker is absent from
the spoken text; count hedge density before and after the length retry.
