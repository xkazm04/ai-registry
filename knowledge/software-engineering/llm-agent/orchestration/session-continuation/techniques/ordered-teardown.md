---
layer: technique
type: technique
subject: session-continuation
technique: ordered-teardown
status: forged
laws: [creation-names-reaper, one-validation-door]
shared_with: []
use_when: [a session keeps refusing to stop after the operator cancelled, adding a new guard that can block a stop, a mode handoff is being disarmed by a cancel it did not ask for, cancel and the loop's re-arm fire on the same turn]
---

# Ordered teardown

Every technique in this subject adds something that can refuse a stop: a
continuation record, a mode flag, a plan anchor, a pending-verification
marker, a stage descriptor. Each was added for a reason and each is a guard.
The failure this technique prevents is the one that arrives with the fifth
guard: a cancel command written when there were four, which clears four, and
a session that keeps blocking the operator's stop for as long as the fifth
guard's lease runs. Harnesses that have shipped this measure the cost in
minutes of an operator typing "stop" at a session that will not — and the
operator does not know which of twenty hooks is refusing, because from inside
the session they all look the same.

## One path clears every guard

The rule is structural: **there is one cancel path, and it knows every
stop-blocking guard the harness can set.** Adding a guard means adding it to
the cancel path in the same change, and the gate that admits a new guard
checks that the teardown names it. This is the reaper law applied to control
state ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)):
the code that arms a guard states what disarms it, and "the operator will
cancel" is not an answer unless cancel actually reaches it. It is also the
one-door law for the control store
([one-validation-door](../../../../_laws.md#one-validation-door)) — a second
cancel path, a per-mode "deactivate everything" that grew up beside the
first, is the path that will be missing the guard added next quarter.

A cheap invariant enforces this without trusting anyone's memory: the set of
guards the teardown clears is derived from the same registry that lists the
guards, so a guard cannot exist without being in the set. Where the harness
cannot derive it, a test enumerates every guard-writing site and asserts the
cancel path clears each one.

## Dependency order, and abort on primary failure

Guards depend on each other. The continuation record is primary: while it
exists, the stop hook will re-read it and re-arm every dependent mode on the
next turn. Mode flags, the plan anchor, job handles and stage descriptors are
dependents: they matter only while the primary says a loop is active. So the
teardown is **ordered — primary first, then dependents** — because clearing
dependents first opens a window in which the stop hook reads the primary,
finds it active, and re-creates what was just cleared.

If the primary write fails — the file is locked, the row is held by a
concurrent writer — the teardown **aborts and leaves the group resumable**.
It does not proceed to clear the dependents and report partial success. A
half-erased group is worse than an intact one: the primary is still armed,
the dependents it needs are gone, and the next turn re-arms them from
defaults that may not match what the operator had. Intact and resumable means
the operator can cancel again and get the same outcome; half-erased means the
next cancel starts from a state nobody designed.

## Deactivate is not cancel

Two operations look alike and are not. **Deactivating a mode** is a narrow
write: this one mode is done, its flag is cleared, the authority is released
if it held it, and everything else in the session is untouched. **Cancel** is
a global signal: every guard is cleared, every loop is released, the session
may stop. The confusion costs at a specific moment — a **handoff**. A planning
mode completes and hands to an execution mode; the planner's exit deactivates
itself and, in the naive implementation, emits the global cancel because that
is the only teardown the harness has. The executor, armed a moment ago, is
disarmed for its whole first window by a signal aimed at its predecessor. The
rule is that a mode ending on its own terms emits deactivate, never cancel,
and cancel is issued only by the operator or by a policy that names the whole
session.

## Cancel wins the re-arm race

The loop re-arms itself: the stop hook, finding the record active, renews the
lease and blocks. Cancel clears the record. On the same turn, both can run —
the hook reads the record before the cancel's write lands, renews, and the
record is alive again after cancel reported success. The design must make
**cancel win**: the cancel writes a tombstone the stop hook checks before
renewing, or the record carries a generation the cancel bumps and the hook
refuses to renew a generation older than the one it read at turn start, or
the hook's renewal is compare-and-swap against the record it read and a
cancelled record fails the compare. Whichever mechanism, the test is the
race: arm a loop, issue cancel and a stop on the same turn in both orders, and
assert the session stops in both. A harness that passes only one order has
not fixed the race; it has chosen the order its test happens to run.

The tombstone is itself a guard, and it carries its own short expiry — tens
of seconds, long enough to cover the turn on which cancel and re-arm collide
and no longer. A cancel signal that persisted would be the next stale record:
it would suppress enforcement for every mode armed after it, which is exactly
the handoff failure the deactivate-versus-cancel rule exists to prevent. The
stop hook should also recognise the operator's explicit cancel command in the
incoming message and decline to renew on that turn; the message is a
courtesy channel, the tombstone is the authority, and the race test covers
both.

## Decision rules

- One cancel path; it clears every guard the harness can set, derived from
  the guard registry or asserted by a test that enumerates writers.
- Primary record first, then dependents. If the primary write fails, abort
  and leave the group intact and resumable.
- A mode ending on its own emits deactivate — a narrow write. Cancel is the
  global signal, issued by the operator or a session-wide policy, never by a
  mode's own exit.
- Cancel wins the same-turn race against re-arm, and the race is tested in
  both orders.

## When not to use this

A single-guard harness needs no order — the record is the whole group. What
it does need, from the first guard, is the discipline that the cancel path
exists and the guard is in it, because every harness that has paid for the
fifth guard once had one.
