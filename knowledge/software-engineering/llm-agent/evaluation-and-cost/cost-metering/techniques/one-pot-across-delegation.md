---
layer: technique
type: technique
subject: cost-metering
technique: one-pot-across-delegation
status: forged
laws: [gate-sees-target, limits-are-derived]
shared_with: []
use_when: [an agent delegates to sub-agents that each run their own loop, a per-run ceiling that a fan-out could multiply, naming a ceiling that several actors reference, a nested run started to do housekeeping for its parent]
---

# One pot across delegation

[budget-enforcement](./budget-enforcement.md) says a per-run ceiling is "checked
between steps of the same run, against the run's own accumulated spend". That
sentence is true while a run is one loop. It stops being true the moment a run
can start other runs: a coordinator that hands a task to three sub-agents has
become four loops, and whether the ceiling is *one* number or *four copies of
one number* is a decision the enumeration of spend paths never asks about.

The failure is quiet and arithmetic. If each delegated run constructs its own
tracker from the same configured ceiling, a run with a ceiling of C can spend
N x C by fanning out to N children, and the ceiling is weakest exactly where
the workload is most expensive. Every individual gate passes. The
[gate sees its target](../../../../_laws.md#gate-sees-target) in each child and
not in the thing the operator actually bounded, which was the *run*.

## The rule: a ceiling belongs to the run, not to the loop

A child run is charged against the **parent's tracker, by reference**. It does
not receive a copy, a share, or a fresh allowance derived from the parent's
remaining balance.

- **The root run constructs the tracker; a delegated run never does.** Tracker
  construction is tied to the entry point that a human or an API call started,
  and a delegated run skips it on purpose. A nested run that builds its own
  tracker is the bug, even when it is built from the same configuration.
- **Charge lands where the call is made, and the pot is found by walking up.**
  The code that records a model call's cost looks the tracker up from the root
  context. It does not take a tracker as an argument that each caller must
  remember to pass, because the caller that forgets is the overrun.
- **The same holds for named ceilings.** When several actors reference one
  ceiling by name, they draw from the same pot. A name is an identity, and two
  actors holding the same name and each owning a private balance have a name
  that means nothing. Independent allowances are expressed by distinct names,
  which makes the choice visible in the configuration instead of an accident of
  construction order.
- **A reference to a name that does not exist is a load-time error.** An actor
  that cites a ceiling nobody defined has no ceiling, and the absence reads
  identically to "unbudgeted". Fail when the configuration is read, not when
  the first overrun is invoiced.

## Why not divide the ceiling among the children

Splitting C into C/N per child feels safer and is wrong in both directions. It
under-spends when one child needs most of the budget and the others finish
cheaply, and it still lets a recursive delegator multiply spend if each child
may split again. A shared pot has one failure mode, the first caller to
exhaust it stops everyone, and that is the failure mode a ceiling is *for*. If
fairness between children matters, give them distinct named ceilings in
addition to the shared one; both apply, and the first to be exhausted stops
the run.

## Nested runs that are not delegation

The same rule covers a run started *for* a run: a summarizer, a compactor, an
evaluator, a retry wrapper. Those are nested loops that exist because the
parent needed something done, and they spend. Construct the nested run with the
parent's tracker injected, and make the injection the only way a nested run can
obtain one. See [housekeeping-calls-obey-the-ceiling](./housekeeping-calls-obey-the-ceiling.md)
for what happens at the boundary.

## What the shared pot does not do

- **It does not survive reconstruction.** A pot held in memory by a runtime
  object resets when the object is rebuilt, even if the conversation history
  and its cost totals are restored from storage. State the scope plainly:
  a per-session ceiling is not a lifetime quota, and a restarted server starts
  a fresh counter. If a lifetime bound is needed it belongs in the ledger-backed
  period budgets of [budget-enforcement](./budget-enforcement.md), which read
  durable spend.
- **It does not make attribution free.** One pot with many spenders still needs
  per-spender figures in the snapshot, or the operator who sees "ceiling
  reached" cannot tell which delegate spent it. Keep a per-actor breakdown
  beside the single total; see [spend-attribution](./spend-attribution.md).
- **It does not interrupt a call in flight.** See
  [time-ceilings-count-working-time](./time-ceilings-count-working-time.md) for
  the overshoot bound.

## Smells

- A delegate that builds its own tracker "from the same config".
- A ceiling documented as "per agent" in a system where agents start agents.
- Two actors that reference one ceiling name and report different remaining
  balances.
- A budget test that exercises one loop and never a parent with children.
- The ceiling is enforced on the root loop only, with children invisible to it.
