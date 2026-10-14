---
layer: application
type: application
subject: background-jobs
technique: timeout-is-a-status-not-a-consumption
stack: cpp
status: forged
verified_on: 2026-10-14
verified_against: cpp@17
---

# A physics SDK's operation wait: timeout leaves the step pending

Checked against a pinned read-only clone of the `ovphysx` tree (product version
0.6.4 in `ovphysx/VERSION`; the C++ version witness is
`ovphysx/CMakeLists.txt:51` "set(CMAKE_CXX_STANDARD 17)", which applies when the project is top level). The C API starts a simulation step as a tracked
operation and collects it later with a wait call taking a nanosecond budget.
Every clause of the technique is present, and the requirement document states
them as acceptance criteria rather than leaving them to the code.

## The contract is written down

`ovphysx/plc/requirements/capi/REQ-CAPI-ASYNC-001.md:24-26` "UINT64_MAX"
defines the budget's vocabulary: poll is zero and infinite is the unsigned
maximum. Poll and finite waits both end the same way when the operation is
still pending: `ovphysx/plc/requirements/capi/REQ-CAPI-ASYNC-001.md:33` "leaves that operation unconsumed", with a timeout status and the pending
operation's index. The tests assert the consequence, not just the status:
after a poll and a finite wait both time out,
`ovphysx/tests/c_unittests/test_physx_async.cpp:386` "lowest_pending_op_index, pending_step.op_index"
checks the reported index, and
`ovphysx/tests/c_unittests/test_physx_async.cpp:393` "final_status, OVPHYSX_API_SUCCESS"
checks that the step then completes normally.

## Forever is decided before any arithmetic

The wait decides `wait_forever` by comparing the raw value to the named
sentinel (`ovphysx/src/ovphysx/ovphysx.cpp:1451` "timeout_ns == OVPHYSX_TIMEOUT_INFINITE"),
under a comment that records the hazard
(`ovphysx/src/ovphysx/ovphysx.cpp:1449` "Preserve the max-value sentinel").
The next line converts the budget with `clamp_timeout_ns`, which maps any value
at or above the signed nanosecond maximum to the duration type's maximum
(`ovphysx/src/ovphysx/ovphysx.cpp:1292` "timeout_ns >= ns_max"). That clamp is
the conversion the comment guards against: its result is a very long finite
wait, not forever. The code keeps the literal flag and uses the clamped
duration only on the finite branch
(`ovphysx/src/ovphysx/ovphysx.cpp:1477` "if (!wait_forever)").

## The readiness helper checks first and last

`ovphysx/src/include/internal/sdk/ovphysxAsyncWait.hpp:25` "bool ready = checkReady();"
runs before the clock is read, so an operation already ready succeeds with any
finite budget. The loop gives up only on no-wait or an elapsed budget
(`ovphysx/src/include/internal/sdk/ovphysxAsyncWait.hpp:29` "noWait || elapsed >= timeout"),
and sleeps for the smaller of the remaining time and 100 microseconds
(`ovphysx/src/include/internal/sdk/ovphysxAsyncWait.hpp:34` "remaining < pollInterval ? remaining : pollInterval")
before checking again, so a check always follows the last sleep. The clock, the
sleep and the readiness check are injected, which makes the boundary testable:
`ovphysx/tests/c_unittests/test_physx_async.cpp:255` "ReadinessObservedAtDeadlineWins"
drives a fake clock with a one-nanosecond budget and readiness that appears on
the second check, and asserts the wait reports ready after exactly two checks
(`ovphysx/tests/c_unittests/test_physx_async.cpp:272-273` "EXPECT_EQ(readiness_checks, 2u)").
The overhead case is pinned separately:
`ovphysx/tests/c_unittests/test_physx_async.cpp:521-522` "An operation already ready on entry succeeds"
is followed by a one-nanosecond wait that returns success
(`ovphysx/tests/c_unittests/test_physx_async.cpp:525` "OVPHYSX_API_SUCCESS").

Finalization is outside the budget on purpose. The requirement says an
operation seen ready at the last check
(`ovphysx/plc/requirements/capi/REQ-CAPI-ASYNC-001.md:38-40` "beyond the readiness budget")
reports its terminal result even if the blocking completion step runs past the
budget.

## The fast path is infinite-only and claims first

Hot loops step, wait, read and write, so infinite waits on a single tracked
operation skip the generic machinery. The code gates the path on the operation
and the sentinel (`ovphysx/src/ovphysx/ovphysx.cpp:3544` "timeout_ns == OVPHYSX_TIMEOUT_INFINITE")
and says why poll and finite stay off it
(`ovphysx/src/ovphysx/ovphysx.cpp:3542` "Poll and finite waits stay on the").
Inside, it erases the operation from the tracking map under the lock before it
blocks (`ovphysx/src/ovphysx/ovphysx.cpp:3556` "Claim the single-use index before blocking"),
so a competing waiter sees not-found instead of consuming it twice.

## One budget across several operations

When the wait covers every pending operation, the code computes elapsed time
from one start (`ovphysx/src/ovphysx/ovphysx.cpp:3686` "now() - start_time")
and, once the budget is spent, passes poll for the rest
(`ovphysx/src/ovphysx/ovphysx.cpp:3690` "remaining_timeout_ns = OVPHYSX_TIMEOUT_POLL",
under the comment at `ovphysx/src/ovphysx/ovphysx.cpp:3684` "allow zero to still poll once").
The first operation that returns a timeout is recorded and the loop stops
(`ovphysx/src/ovphysx/ovphysx.cpp:3701` "lowest_pending = pending_op"). The name
is accurate only if the pending list is walked in operation-index order; this
loop does not sort it, so the claim rests on how the list is produced.

## Barrier scope is part of the contract

The log flush uses the same poll, finite and infinite vocabulary and declares
its coverage: `ovphysx/plc/requirements/capi/REQ-CAPI-LOG-001.md:39` "records already accepted by the ovphysx callback dispatcher",
and `ovphysx/plc/requirements/capi/REQ-CAPI-LOG-001.md:40` "outside that finite-time barrier".
A caller reading the definition knows what a successful flush does not promise.

## Deviation

None found in the wait path. The one softness is the ordering assumption above;
the technique's wording ("only if the list is ordered") is the standard here.
