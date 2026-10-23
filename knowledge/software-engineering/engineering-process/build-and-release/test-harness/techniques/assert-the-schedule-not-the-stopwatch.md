---
layer: technique
type: technique
subject: test-harness
technique: assert-the-schedule-not-the-stopwatch
status: forged
laws: [count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [a test claims work runs concurrently or is cut off at a deadline, a timing assertion fails only when the machine is busy, deciding how a runner's parallelism or timeout option is proved, a flake register keeps listing a test whose bound is a number of milliseconds]
---

# Assert the schedule, not the stopwatch

## The concern

A test that claims work runs at the same time, or that a budget cuts it off, is making a
claim about the **schedule**: which units were in flight together, and which one ended
because the budget ended. A stopwatch measures the schedule only on an idle machine. On a
loaded runner every timer stretches, so "finished under N ms" turns red with no defect
present, and a wall-time ratio between a serial arm and a parallel arm stops separating the
two arms at all. Both land in the flake register for a cause that lives in the test, not in
the product, and the usual repair - raise the bound - quietly lets the serial version pass.

The measured shape is lopsided. One elapsed-time bound over four short concurrent stubs
failed most of its runs under parallel load; the same claim asserted as a count of units in
flight failed none, and still went red against a deliberately serialised version.

## Procedure

1. **Name the claim before choosing the instrument**: overlap (these ran together), cap (no
   more than N at once), or cutoff (this one was stopped by its budget).
2. **Prove overlap and caps by observation.** Count units in flight and assert the peak, or
   hold every stub at a barrier that opens only once all of them have started, so an
   implementation that asks one at a time can never get through. Ordering is a fact load
   cannot change.
3. **Prove a cutoff from the fixture's own clock.** Each fixture records its own start and
   end. Read "these overlapped" from the recorded spans and "this one was cut off" from its
   own end against its own start, never from the list's total.
4. **Protect the innocent sibling.** Where one bound applies to every member of a list, an
   innocent member is judged by it too. Give it a deterministic start with headroom above
   the slowest start observed on a loaded machine, and set the bound from that loaded
   observation, never from an idle one.
5. **Keep any remaining time bound loose and one-sided**, as a hang guard rather than the
   verdict.
6. **Prove the test can fail**: run it against a serial or unbounded variant and watch it go
   red, then green on the real implementation.

## Decision rules

- When the assertion would still pass with the concurrency removed on a fast machine, it is
  a stopwatch; rewrite it.
- When two arms are compared by wall time, the comparison is unreadable under load; compare
  the recorded spans.
- When a bound was raised to stop a flake, check that the serial variant still fails it.

## When not to use it

When the standard itself is a duration - a latency budget a user experiences, a cost
ceiling - the clock is the claim and this rule does not apply. Measure it on a controlled
host or gate it on a host-independent proxy, which is the metric-gates subject's job.
