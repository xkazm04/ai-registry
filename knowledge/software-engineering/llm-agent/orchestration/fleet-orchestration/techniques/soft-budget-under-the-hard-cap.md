---
layer: technique
type: technique
subject: fleet-orchestration
technique: soft-budget-under-the-hard-cap
status: forged
laws: [limits-are-derived, failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [a dispatcher loop needs a stopping rule, raising an iteration cap changed nothing about how long runs take, a run was cut off mid-plan and the artifact is whatever existed at the cut, deciding where an agent loop's limit is written]
---

# Soft budget under the hard cap

Every loop a model drives needs a number that ends it. The reflex is to write
one: a maximum iteration count, enforced by the machinery, checked each pass.
That loop then has exactly one exit, and it is the bad one.

> **A cap that fires is a failure, not a stop.** The loop is cut mid-plan.
> Work in flight is discarded or half-harvested, the artifact is whatever
> happened to exist at the instant of the cut, and nothing about that instant
> was chosen. A dispatcher that ends its own loop ends it at a boundary it
> picked — after a harvest, before a new fan-out, with the returns in hand.

So the loop carries **two** numbers with two different owners:

- The **hard cap**, in the machinery. Counted by the orchestrator, enforced
  regardless of what the dispatcher says, and its job is to bound cost when
  everything else has failed. It is a backstop.
- The **soft budget**, in the brief. A smaller number the dispatcher is told
  to observe, so that it elects to stop before the backstop is reached. Its
  job is to make the cap never fire.

Setting them equal is the failure this technique exists to prevent, and it is
invisible because the system works: the run ends, the number is respected, an
artifact is produced. What has happened is that the exit path the cap exists
to *bound* has become the ordinary exit path, and every run's output is a
truncation ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
— "the loop ended" must be distinguishable from "the loop finished").

## The soft budget is a count and a set of conditions, never one alone

A count alone gives the dispatcher permission to stop and no reason to stop
early; it will spend the budget because the budget was there. Conditions alone
— *stop when you can answer, stop when the last two returns were similar,
stop when you have enough independent sources* — give it a reason and no
floor, and a dispatcher that never reaches a condition never stops at all.

State both. The conditions are what make the elected stop happen early on the
easy work; the count is what makes it happen at all on the hard work.

## The two numbers must be derived from one source

This is where the technique is actually lost, and the loss is silent.

When the soft budget is a **literal in the brief's text** and the hard cap is
a **configuration field**, they drift the first time anyone tunes the cap.
Raising the configuration moves the backstop and leaves the operating limit
exactly where it was: the fleet is granted more capacity, does not use it, and
nothing reports the discrepancy. Reading the configuration afterwards shows
the new number; the runs still stop at the old one; and the two facts are in
different files.

Observed shape, and it is a common one — a tree carrying two sibling loops,
one whose brief interpolates its soft budget from the same field the machinery
enforces, and one whose brief carries a hardcoded number against a
configurable cap twice its size. Same release, same author, two conventions,
and only the first is tunable. The rule is
[limits-are-derived](../../../../_laws.md#limits-are-derived) applied to a
number that lives in prose: **the brief's budget is interpolated from the
cap, or computed from it, and the derivation is written beside it.** A soft
budget typed by hand next to an enforced cap is a formula in a comment that no
longer tracks its input.

## The ratio is the instrument

The one number worth reporting about a bounded loop is not how many
iterations it ran. It is **what fraction of runs ended at the cap rather than
by election**, over the population of runs that entered the loop
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

- **Rising cap-fired stops** mean the soft budget is too close to the cap, or
  the brief is not being read. Both are cheap to test, and neither is visible
  in any output-quality metric until much later.
- **Zero cap-fired stops, ever** means the cap is not binding, and the cost
  ceiling it represents is imaginary — the run is bounded by the brief alone,
  which is a bound a model may ignore.
- **Cap-fired stops concentrated in one class of brief** is a briefing
  problem, not a budget problem. Widening the cap for everyone buys the
  wrong thing.

## Decision rules

- Give every model-driven loop two limits: an enforced cap and a smaller
  budget stated in the brief. Never one.
- Derive the brief's budget from the cap and write the derivation next to it.
  A literal in prose beside a configurable cap is a drift waiting for the
  first tuning pass.
- State the budget as a count *and* the conditions under which stopping early
  is correct.
- Report the cap-fired fraction over runs that entered the loop, and read it
  before any output-quality metric moves.
- Treat a cap-fired run's artifact as truncated wherever it is consumed. It
  was not finished; it was interrupted.
