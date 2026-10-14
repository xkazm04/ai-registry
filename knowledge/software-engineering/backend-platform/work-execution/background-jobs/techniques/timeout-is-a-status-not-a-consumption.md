---
layer: technique
type: technique
subject: background-jobs
technique: timeout-is-a-status-not-a-consumption
status: forged
laws: [failure-not-empty-success, identity-survives-reuse, unknown-is-not-a-value]
shared_with: []
use_when: [a bounded wait on a tracked operation gives up and the caller needs to wait again later, a forever timeout turns out to be finite after a unit conversion, a wait on an already-finished operation reports a timeout]
---

# A timeout is a status, not a consumption

A tracked operation is work started now and collected later: the caller holds
a handle, the work proceeds on its own, and a wait call turns "is it done?"
into "give me the result". The wait takes a budget, and the design question
this technique answers is narrow: **what does the call owe the caller when the
budget runs out?** The naive reading treats a timeout as the end of the
operation's story, so the wait releases the handle, discards the slot, or
reports failure. The correct reading is that a timeout is a *report about the
wait*, not an event in the operation's life. The operation is exactly as
pending as it was; the caller learned that it was not ready in time, and may
poll again, wait longer, or wait unbounded.

## The contract

**The give-up status leaves the operation tracked and unconsumed.** The
caller's handle is still valid, the result is still collectable once, and a
second wait on the same handle is an ordinary call. Consuming happens only on
a terminal result, because a single-use handle spent on "not yet" strands the
work: it finishes, nobody can collect it, and nothing is positioned to reap it
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse) — the
handle names the operation for its whole life, not for one wait). The status
is also its own value, distinct from failure and from success: "not ready" is
not an error, and reporting it as one sends the caller to clean up work that
is still running
([failure ≠ empty success](../../../../_laws.md#failure-not-empty-success)).

## Rules

**1. Name the two extremes as literals.** The budget's vocabulary has three
regions: *do not wait* (check once, report), *wait forever*, and a finite
duration between. The first two are named values, not numbers that happen to
be small or large. A common encoding makes "forever" the maximum of the
integer type; that value must be compared by name before any arithmetic is
done to it. Convert it through a unit change, add it to a start time, or
clamp it to a platform duration type, and the overflow handling can quietly
produce a large *finite* wait — correct in every test, and a hang-then-timeout
in production on the one call that was meant never to give up. Decide
"forever" first, branch on it, and let only genuinely finite budgets enter
the arithmetic
([unknown ≠ a value](../../../../_laws.md#unknown-is-not-a-value): a sentinel
is a statement about the budget, not a quantity in it).

**2. Check readiness once more at the deadline.** A wait loop that reads the
clock, finds the budget spent and returns "timed out" without a final
readiness check reports a timeout for an operation that completed during the
last sleep. The order is: check readiness; if not ready and the budget is
spent (or the caller asked not to wait), give up; otherwise sleep for at most
the time remaining and check again. A finite wait on an operation that was
already ready therefore succeeds even when the budget is smaller than the
call's own overhead, and an operation that becomes ready exactly at the
boundary is a success. Pin both with a test that drives a fake clock so
that readiness first appears at the deadline.

**3. The budget bounds the wait for readiness, not the finalization.** Once
the operation is ready, collecting its result may itself take time — a
synchronous completion step, a copy, a handoff. An operation that is ready at
the final check proceeds to finalization and reports its terminal result even
if that overruns the budget. The alternative is worse: abandoning a finished
operation because collecting it was slow throws away a result the caller
asked for and has already waited for. State this in the definition of the
wait, because a caller sizing a deadline needs to know the budget is a bound
on readiness and not on return.

**4. A blocking fast path is for the infinite case only.** Skipping the
readiness machinery and blocking directly on the operation is a legitimate
optimization for a hot loop — but only when the budget is *forever*, since a
direct block cannot honor any finite bound. Poll and finite waits stay on the
path that can check readiness without blocking. The fast path must **claim
the single-use handle before it blocks**, so a competing waiter observes
"not found" rather than consuming the same handle a second time while the
first is parked.

**5. Several operations share one budget.** A wait over a set of pending
operations is given one deadline for the whole call, not one per operation.
Give each its remaining time, computed from a single start. Once the budget is
spent, the remaining operations are *polled*, not timed out: an operation
that is already ready still completes, and only one that is really pending
reports the timeout. The call stops at the first pending operation that gave
up and reports it. That operation is the lowest-numbered pending one only if
the list is walked in order — say which, because a caller will use the
reported handle to decide where to wait next.

**6. State the barrier's scope.** A wait-for-everything call — a flush, a
drain, a barrier — covers a definite population of records, usually those the
dispatcher has already accepted. Records still buffered upstream of the
dispatcher are outside its finite-time guarantee. Say so in the definition:
the scope of a barrier is part of its contract, and a caller who learns it
from an incident was told a promise the call never made.

## Where this does not apply

Waits where **timing out cancels the work** are a different contract: a
request deadline that abandons the operation is cancellation, and its
acknowledgement, cleanup and terminal state are
[job progress and cancellation](./job-progress-and-cancellation.md)'s ground.
This technique is the opposite choice — the wait gives up and the work does
not. It also does not apply to operations with no separable readiness check
(there is nothing to poll, so the only wait is the blocking one), nor to
single-use operations whose result cannot be left pending.

The seams against the neighbouring techniques are by question. The release
guarantees of a guard answer *who reclaims a held entry on every exit path*;
this technique answers *what the waiter is told while the holder is still
running*, and reclamation is not triggered by a give-up status. Grace for the
uninterruptible host call answers *who bounds* a call that cannot be preempted
and lets the begun call finish; here nothing is preempted at all, and the
caller holds the next decision. Cancellation answers *who abandons*. A wait
that gives up is none of the three: it reclaims nothing, bounds only itself,
and abandons nothing.
