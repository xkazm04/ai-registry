---
layer: technique
type: technique
subject: landing-page-experiment-statistics
technique: peeking-guard
status: forged
laws: [statistical-honesty-before-a-verdict, a-gate-before-money-and-copy]
shared_with: []
use_when: [a test is running and someone wants to call it, designing when a surface may show significance, distinguishing a stopped test from a finished one]
---

# Peeking guard

A fixed-horizon significance test promises its false-positive rate for *one* look at
a *predetermined* sample. A surface that recomputes confidence every time it is opened,
and an operator who stops the test the first morning it clears the bar, have replaced
one look with dozens and the promise is void. Published derivations put continuous
monitoring with stop-at-first-crossing at roughly a quarter false positives for a
nominal one in twenty, and the limiting case - keep looking until it crosses - has no
error control at all: with enough looks a null test crosses eventually.

The guard is a rule about *what state a running test may be read in*, and it turns on
one distinction: a test the operator deliberately stopped is read on its confidence at
the stop; a test still running may show significance only when the confidence bar
*and* the sample gate are both cleared. The gate removes the reward for looking - the
badge cannot appear before the horizon whatever the confidence says - and the
runtime convention removes the second reward, the partial-week sample.

## Procedure

1. **Bind significance to the gate, and the label to status.** `significant` is true
   only when the winner clears the corrected confidence bar and every arm has reached
   its required sample - for a running test and a closed one alike. Closing a test is
   not a way past the gate: a test closed below it is *stopped early*, shown with its
   confidence "at stop" and its progress, and `significant` stays false. A closed
   test past the gate is a winner or a no-difference read like any other. A status
   flag cannot tell a deliberate stop from a stop on a good morning, because both set
   the same flag; reading a closed test on confidence alone turns every morning
   check into a promoted winner the moment someone presses close.
2. **Do not stop on a good morning.** The horizon is the required per-arm sample and
   the runtime convention, whichever is later. An operator may stop early for a
   reason outside the numbers - a broken arm, a changed offer, a business decision -
   and the result is then labelled stopped, never promoted to a winner it did not
   earn.
3. **Show progress, not a flickering verdict.** While collecting, the surface shows
   the leader as leading with its counts, the progress bar against the smallest arm,
   and the estimated completion date. It may show the current confidence as an
   observation with its sample beside it; it does not colour it as a verdict.
4. **If looks are wanted, change the method, not the rule.** A sequential design - a
   mixture sequential probability ratio test or another always-valid procedure -
   raises the bar per look so that stopping at any look keeps the agreed rate. It
   costs a modest premium in sample for the same power and is the honest answer to a
   business that genuinely needs to read daily. Choose it before the test starts; a
   fixed-horizon test cannot be retrofitted into a sequential one after the first
   look.
5. **Never read a partial week as a verdict.** Even at full sample, a test ended on a
   Tuesday afternoon has a weekday-skewed population; the runtime convention is two
   full weeks ended on the starting weekday, and low-traffic pages run longer.

## Why the sample gate is the guard

The intuitive guard - "do not look" - is unenforceable on a surface people open every
day. The enforceable guard is structural: the winner badge is computed from a
predicate that includes the gate, so the confidence can cross and recross the bar all
month and the badge does not appear until the sample does. This is the same shape as
[a gate before money and copy](../../../_laws.md#a-gate-before-money-and-copy): the
predicate, not the instruction, is what holds under pressure.

## What the gate does not close

The gate removes the looks *before* the horizon. It does not make the badge a single
look, and two things leak past it. First, the predicate must hold for closed tests
too, or the close button is a side door: a paired replay of a production evaluator
that read closed tests on confidence alone gave a null test closed on its first
crossing a false winner about one time in five, against about one in thirty-five for
a test closed the day the gate opened, and the same evaluator with the gate applied
to closed tests cut the first figure to about one in twenty-two without moving the
second. Second, the looks continue *after* the gate opens. A running test the
operator keeps open until the badge appears is read every day past its horizon, and
when the requirement is sized on the observed control rate the horizon itself moves
with the data; in the same replay, waiting for the badge up to three horizons gave
null false winners about one time in ten in both arms - roughly four times the single
read at the gate. So the horizon is fixed when the test starts, from a baseline taken
before it, and the test is read once there: if the bar is not cleared at the horizon
the read is "sized but not significant" and the control stays, rather than another
week of waiting for a badge.

## Decision rules

- When a running test clears confidence but not sample, render "leading, collecting",
  because the crossing is one of many the null would produce over the test's life.
- When an operator stops a test before its horizon, keep the stop as a labelled read
  and never let a later sync promote it to a winner, because the decision to stop was
  informed by the numbers and the numbers are therefore biased.
- When a surface computes `significant` per status, check the closed branch carries
  the sample gate too, because a closed test read on confidence alone is the morning
  check with a close button on it.
- When a running test reaches its horizon without clearing the bar, read it as sized
  but not significant and close it, because every day it stays open past the horizon
  is another look the fixed-horizon promise did not cover.
- When the business needs daily reads, adopt a sequential method up front and say so
  on the surface, because a fixed-horizon threshold read daily is not a threshold.
- When a downstream surface mines a lesson or drafts challengers from a test, it
  reads the `significant` predicate and never the raw confidence, because the raw
  confidence is exactly the number the guard exists to discount.

## When NOT to use

- A stopped test: it is read at the stop and labelled, and the guard does not forbid
  that read. The dishonesty to avoid is the *promotion* of a stopped test below its
  gate, not its read.
- A sequential design with always-valid thresholds is its own guard; stacking a fixed
  sample gate on it withholds a valid early stop for no gain.
- Monitoring for harm - a challenger with a collapsing rate, a broken form - is not
  peeking. Stopping a test because an arm is broken is an operational decision and
  the result is labelled stopped; the guard governs *declaring a winner*, not
  ending a failure.
