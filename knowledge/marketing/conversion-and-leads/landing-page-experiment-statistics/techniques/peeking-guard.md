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

1. **Bind significance to status.** A result carries the experiment's status. For a
   *running* test, `significant` is true only when the winner clears the corrected
   confidence bar and every arm has reached its required sample. For a *done* test,
   it is confidence alone, and the surface labels the read as "at stop".
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
month and the badge does not appear until the sample does. When it does appear it is
a single look at a predetermined sample, which is what the fixed-horizon test
promised. This is the same shape as
[a gate before money and copy](../../../_laws.md#a-gate-before-money-and-copy): the
predicate, not the instruction, is what holds under pressure.

## Decision rules

- When a running test clears confidence but not sample, render "leading, collecting",
  because the crossing is one of many the null would produce over the test's life.
- When an operator stops a test before its horizon, keep the stop as a labelled read
  and never let a later sync promote it to a winner, because the decision to stop was
  informed by the numbers and the numbers are therefore biased.
- When the business needs daily reads, adopt a sequential method up front and say so
  on the surface, because a fixed-horizon threshold read daily is not a threshold.
- When a downstream surface mines a lesson or drafts challengers from a test, it
  reads the `significant` predicate and never the raw confidence, because the raw
  confidence is exactly the number the guard exists to discount.

## When NOT to use

- A stopped test: it is read at the stop, labelled, and the guard does not apply
  retroactively. The dishonesty to avoid is the *promotion* of a stopped test, not
  its read.
- A sequential design with always-valid thresholds is its own guard; stacking a fixed
  sample gate on it withholds a valid early stop for no gain.
- Monitoring for harm - a challenger with a collapsing rate, a broken form - is not
  peeking. Stopping a test because an arm is broken is an operational decision and
  the result is labelled stopped; the guard governs *declaring a winner*, not
  ending a failure.
