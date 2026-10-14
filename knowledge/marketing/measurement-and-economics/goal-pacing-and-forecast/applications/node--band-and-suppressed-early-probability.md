---
layer: application
type: application
subject: goal-pacing-and-forecast
technique: band-and-suppressed-early-probability
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Band and suppressed early probability - the pacing card complied, two other doors did not

Verified against `systedo-case` at commit `7baeb12a` (2026-10-14), node 24.

## What the tree already did

The pacing module banks the month-to-date, sizes the band on remaining days only
(sample deviation of de-seasonalised daily revenue times the square root of days
remaining, 1.2816 for P10-P90, lower edge floored at the banked amount), and exposes a
`probabilityReliable` flag that the dashboard card obeys: a five-elapsed-day gate, with
"settling" copy while it is closed. The convention is named in the code and on the card.
The technique was implemented, so the seam was chosen to find where it was not.

## The seam chosen to falsify "the technique holds everywhere the probability travels"

Two doors let the number out without the gate:

1. **The AI recap grounding** printed the goal probability from day one of the month,
   with no gate, as a hard percentage the model then narrates as fact.
2. **A flat or all-zero series** has zero remaining noise, and the gate looked only at
   elapsed days, so a month past day five printed "0%" or "100%" - the absence of an
   estimate shown as certainty, which the technique's decision rule forbids.

## A and B

Target: surfaces that print a hard probability without a noise estimate or the
elapsed-day gate. A: 2 of 2 constructed cases leak (flat series mid-month reliable;
recap on day 3 prints a percentage). B: 0 of 2; the recap prints "still settling, do not
quantify" and the flat series is unreliable. Floor: the noisy series past the gate still
quotes its probability (pinned), the committed dataset's mid-month forecast test, the
run-rate prescription tests and typecheck unchanged. The full unit suite showed 4 failures
in install-mode, documentation-loop, embeddings and job-scope tests, none touching pacing.
Four pins in one new test file; the two leak cases fail on the old code.

## Not measured

How often a live account has a literally flat series (rare; mostly a new or unconnected
account), and whether the recap's narration changes in quality when the number is withheld.
