---
layer: technique
type: technique
subject: engine-integration-safety
technique: pid-scoped-teardown
status: forged
laws: [refuse-rather-than-destroy, one-authority-per-quantity]
shared_with: []
use_when: [cleaning up after a spawned application, writing a watchdog that must stop a run, a cleanup step is killing more than it started]
---

# Process-identity-scoped teardown

The concern: bounding what a cleanup step is allowed to end. The bound is exact and it
admits no interpretation — **the set of things you spawned, identified by the handle you
obtained at spawn time.** Not what matches your target's name. Not what looks like a
leftover from a previous run. Not what is holding the lock you want.

The failure this prevents is silent and machine-wide. A cleanup that sweeps by executable
name ends the operator's interactive session, ends any concurrent automated run using the
same application, and — the part that surprises people — makes the concurrent run
misdiagnose. From inside that run, its child simply died; it has no way to attribute the
death to a stranger, so it reports its own launch as broken. One sweep, two failures, and
the second one sends an engineer to debug innocent code.

## Procedure

**1. Capture identity at spawn, before anything can go wrong.** The launch call returns a
handle. Record it immediately, in a structure that outlives the happy path — a ledger the
teardown reads. If your launch abstraction does not surface an identity, fix the
abstraction; a spawn you cannot name is a spawn you cannot clean up.

**2. Terminate the tree, not the leaf.** Heavyweight applications spawn helpers —
compilers, shader workers, crash reporters — and killing only the parent leaves them
holding the very locks you are trying to release. Use the platform's tree-scoped
termination against your recorded identity. This is the entire reason a class-wide sweep
ever looked necessary: people reach for it because the parent-only kill left orphans. The
tree kill solves that without touching anything of anyone else's.

**3. Escalate politely, with a stated grace window.** Request a clean shutdown first, wait
a declared interval, then force. State the interval; it belongs to the same family of
derived numbers as the call timeout, and an undeclared grace period is a hidden variable
in every teardown report.

**4. Make teardown idempotent and failure-tolerant.** A target that is already gone is a
no-op and a debug-level note, never an error, and never an escalation to something
broader. The single most dangerous line in any teardown is the fallback after a failed
kill — that is where class-wide sweeps get reintroduced, always with the comment "just in
case".

**5. Run teardown on every exit path.** Success, failure, timeout, watchdog fire, thrown
exception, aborted call. One cleanup implementation reached from all of them; the same
path both self-exit and watchdog use, so the two cannot diverge in what they clean.

**6. Keep one implementation of the kill.** Two subsystems that each hand-roll teardown
will not both stay correct — one of them will grow a fallback sweep. The kill argument
builder and the spawn-and-wait lifecycle are a single shared unit that everything reuses.
One law, one implementation, one place to test it.

**7. Make the injectable seam a proof, not a convenience.** Route spawn and kill through a
substitutable seam so tests can observe every command the subsystem issues, and assert
against the command list that nothing names a class. That test is the durable form of this
technique; the comment above the function is not.

## Decision rules

- If you cannot prove you spawned it, you may not end it. Proof means a recorded identity
  from a launch you performed in this run.
- If a recorded identity is stale — the process is gone and its identifier may have been
  reused — verify before signalling, or accept the no-op. Identifier reuse is rare but its
  failure mode is ending an unrelated process, which is the exact harm this technique
  exists to prevent.
- If a tree kill is unavailable on the platform, enumerate children from your own recorded
  parent identity and end them individually. Do not substitute a class match.
- If teardown fails and something of yours is still running, report it as a leaked
  resource in the run record and refuse subsequent runs that need exclusivity. Leaking
  loudly beats sweeping quietly.
- If a watchdog fires, the run's outcome is *terminated by watchdog*, which is a distinct
  outcome from a failure. What the run did before the watchdog fired may still be
  evidence; do not discard it.

## When not to use this

In a **disposable isolated environment** — a container or VM created for this run and
destroyed after — the whole environment is your spawn, and tearing it down wholesale is
both correct and simpler. Identity-scoped teardown is for shared machines, which is to say
any developer workstation and most build agents.

For **long-lived services you connect to but did not launch**, teardown is not yours at
all; you disconnect. The distinction between a resource you own and a resource you are
borrowing is the same distinction that governs the refusal technique, and confusing the
two is the root of both failures.
