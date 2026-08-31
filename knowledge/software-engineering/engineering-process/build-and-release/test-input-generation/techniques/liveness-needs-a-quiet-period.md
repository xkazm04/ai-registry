---
layer: technique
type: technique
subject: test-input-generation
technique: liveness-needs-a-quiet-period
status: forged
laws: [failure-not-empty-success, gate-sees-target]
shared_with: []
use_when: [testing that a system recovers rather than that it stays correct, a fault-injecting suite that has never reported a hang, deciding what a randomized run asserts at the end]
---

# Liveness needs a quiet period

A fault-injecting generator answers one question well and a second question not
at all. **Safety** — nothing bad happens, no invariant is violated, no wrong
answer is returned — is checkable at every instant, so continuous perturbation
is exactly the right regime for it. **Liveness** — something good eventually
happens, the queue drains, the replica catches up, the repair completes — has
no instant at which it is checkable, because "not yet" and "never" look
identical while the faults are still arriving.

That is the whole problem, and it has a specific consequence that makes it
worse than a gap: **a suite that only injects faults does not merely fail to
test liveness, it actively hides liveness defects.**

## Why continuous fault injection conceals a hang

Under a generator that keeps perturbing, a stuck system is repeatedly rescued
by the perturbation itself. A partition that would have deadlocked two
components heals on the next random draw; a retry counter that had phase-locked
resets when the process is randomly restarted; a component starved by a
scheduling pattern is handed a different pattern a moment later. The defect is
real, it is reachable, and it is erased before anything observes it.

So the run ends green, and green here carries no information: a system that
recovered because it is correct and a system that recovered because the test
stopped hurting it produce the same result
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
The check also never observed the property it claims to cover — it watched a
system under continuous disturbance and reported on a system expected to make
progress, which are different targets
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## The technique: run in two phases, and stop the faults in the second

The generator gets a **phase change**, not a second suite.

1. **Chaos phase.** Inject faults freely — partitions, delays, restarts,
   storage errors, message loss — and assert safety continuously. This is the
   regime the suite already has.
2. **Quiet phase.** At some point in the run, **freeze the fault set**:
   - choose the subset of components that *should* be able to make progress —
     a quorum, a healthy pair, whatever the system's own availability
     contract names;
   - **heal every fault among that subset**, permanently, for the rest of the
     run;
   - **make the remaining faults permanent too** rather than removing them.
     The components outside the chosen subset stay down. This is what
     distinguishes the technique from simply ending the chaos: the system must
     make progress *while degraded*, which is the actual claim, rather than
     after a full recovery.
3. **Assert progress against a bound.** Within a stated time or step budget,
   the healthy subset must complete the outstanding work — every submitted
   operation applied, every log entry present, the backlog at zero. Exceeding
   the bound is the failure, and it is now a real one, because nothing is
   perturbing the system any more.

The quiet phase is what converts "eventually" into a checkable predicate. It
does so by removing the excuse: once no new fault can arrive, a system that has
not progressed is stuck, and there is no other reading available.

## Stating progress so it can fail

"It finished" is a weak assertion because a run that has not finished is
indistinguishable from a run that needs another second. Define progress as a
**monotone quantity that must strictly increase** while work remains — entries
applied, items drained, bytes repaired, operations acknowledged — and assert
that it does, per interval, not only at the end. That turns one late timeout
into an early, localised failure and tells you *where* progress stopped rather
than only that it did.

The bound itself should be derived from the system's own stated obligation — a
repair timeout, a re-election interval, a retry schedule — and be generous. The
purpose is to separate stuck from slow, not to measure performance; a tight
bound imports flakiness into a lane whose whole value is that its failures are
real.

## The failure class this finds: two correct policies that phase-lock

The defects that survive a safety-only suite have a characteristic shape, and
recognising it is most of the technique's value. They are rarely a single
component being wrong. They are usually **two independently reasonable policies
that resonate** — each defensible alone, jointly incapable of converging.

The paid-for instance: a component repairing missing entries selected its peer
round-robin, while its retry policy was aggressive. The two composed so that
every request for one entry went to the peer that lacked it and every request
for the other went to the other peer — a stable pattern, repeated indefinitely,
with both policies behaving exactly as designed. No invariant was violated at
any point, so safety was satisfied throughout. Only a period in which nothing
else was allowed to change could show that the system was not converging.

Resonance is worth naming because it is invisible to component-level testing by
construction: neither policy has a bug, and the pair is not a unit anybody
wrote a test for.

## When not to use it

- **Where the system makes no progress guarantee.** A component that is allowed
  to give up, shed load, or refuse has no liveness obligation to assert, and a
  progress bound would encode a promise the design never made. Check that it
  refuses *correctly* instead — that is safety.
- **Where the healthy subset cannot be defined.** The quiet phase needs an
  answer to "who should be able to finish this"; if the availability contract
  does not say, the technique has nothing to heal toward, and writing the
  contract is the prerequisite work.
- **On a fast lane.** The quiet phase costs the bound, and the bound is
  deliberately generous. This belongs where long runs already live.
- **As a replacement for the chaos phase.** The two assert different things and
  the quiet phase depends on the chaos phase having produced an interesting
  state to recover *from*. A run that starts quiet tests nothing.
