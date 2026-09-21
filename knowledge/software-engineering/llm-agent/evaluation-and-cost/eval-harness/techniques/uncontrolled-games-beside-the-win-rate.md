---
layer: technique
type: technique
subject: eval-harness
technique: uncontrolled-games-beside-the-win-rate
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
applied: code
ab_verdict: better
use_when: [a pairwise round-robin reports a win-rate ranking, one order of a swapped pair failed or never ran, a candidate failed to generate on some cases and its games were skipped, ties forced by an order flip are tallied with ties the judge agreed on, a ranking's leader played fewer games than the field]
---

# Uncontrolled games sit beside the win rate

[comparison-modes](./comparison-modes.md) scores every pair in both orders and
records a flip as a tie. That rule assumes both orders came back. In a real run
some do not: a candidate fails to generate on a case, a judge call times out on
one order, a verdict does not parse. What happens to those games decides whether
the win rate means what it says, and the obvious implementation gets it wrong in
two opposite ways.

> **A win rate is computed only over games whose position control completed.
> Every game that did not complete it is counted per candidate beside the rate,
> never inside it and never dropped without a label.**

## The two defaults, both wrong

- **Admit the half-controlled verdict at face value.** The order that returned is
  tallied as a win or a loss. The swap was the control, and a verdict without its
  mirror carries the position bias the swap exists to cancel. One tally now mixes
  controlled and uncontrolled observations, and nothing in the number says in
  what proportion.
- **Drop the game silently.** The controlled tally stays clean, and the exclusion
  moves into the denominator unseen. Failures are not random: a candidate that
  fails to generate on hard cases plays only its easy ones, a long answer is the
  one that times the judge out. In a round-robin every candidate was scheduled for
  the same games, so a leader at 2-0 over 2 of its 8 games renders exactly like a
  leader at 8-0, and a global error count does not say whose games were lost
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## The procedure

1. **List what was scheduled before anything runs**, and keep the list. The
   exclusions are defined against it, and a list rebuilt from what actually
   returned has none.
2. **A game enters the tally only if both orders returned a parsed verdict.** A
   single returned order is an exclusion, not a win.
3. **Charge every excluded game to both participants**, by cause where the cause
   is known: no candidate, judge failure, unparsed verdict.
4. **Count ties the control forced apart from ties the judge agreed on.** Both
   stay a half-win in the rate; a flip is honestly a tie. A standing made mostly
   of forced ties rests on few decisive observations, and only the split shows it.
5. **Print the split in the same row as the rate**, and store it in the same
   record. A number published without it is the rate over a selected subset
   presented as the rate over the schedule
   ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

Measured on a round-robin of three candidates over four cases, with one candidate
failing to generate on three of them: before, the ranking printed that candidate
first at a perfect record and nothing else; after, the same row carried six
excluded games for it against three for each rival, and the forced ties apart.
Every win rate and the rank order were unchanged, which is the floor this change
must hold - the split informs the reading of the number, it does not move it.

## Decision rules

- **When adding the split would change a win rate or the order, stop.** The
  uncontrolled games were already driving the headline, and the first question is
  why, not how to label them.
- **When a candidate's excluded share is large, do not rank it with the field.**
  Report it separately, or refuse the ranking view for it, as
  [pairing-schedule](./pairing-schedule.md) refuses one below its exposure floor.
  The exclusion is the finding.
- **When one order fails intermittently, retry that order, not the game.**
  Re-drawing both orders can land a different pair of verdicts and quietly
  replaces an observation instead of completing it.
- **Never impute the missing order from the one that returned.** It removes the
  only thing the swap measures.

## When not to use this

A single absolute-scored comparison has no order control and no schedule; there
the flag that says whether the test was paired or unpaired, carried on the result
itself, is what governs honest reading. A bracket that is meant to find a winner
rather than rank a field already reports only its path.
