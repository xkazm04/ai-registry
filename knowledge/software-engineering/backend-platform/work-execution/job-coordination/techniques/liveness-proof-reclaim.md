---
layer: technique
type: technique
subject: job-coordination
technique: liveness-proof-reclaim
status: forged
laws: [unknown-is-not-a-value, identity-survives-reuse, creation-names-reaper]
shared_with: []
use_when: [no timeout is defensible because legitimate job duration is unbounded, the holder cannot run a renewal loop, deciding between an expiry timer and a death probe as the reclaim trigger]
stage: team
---

# Liveness-proof reclaim

Every reclaim mechanism answers one question — *may I take this holder's
work?* — and there are two families of answer. **Expiry** infers death from
silence: the holder last proved itself at some instant, the tolerated interval
has passed, take it. **Proof** interrogates the holder at reclaim time: ask the
runtime whether that exact process still exists, and act only on a confirmed
*no*.

[lease-renewal](./lease-renewal.md) is the expiry family done properly and the
default for good reason — it decouples the timeout from job duration by
splitting "how long the work runs" from "how recently the executor proved it
exists." That split is available whenever the executor **can** renew. This
technique is for the case where it cannot, and there expiry has no defensible
parameter left.

## The interval that does not exist

Sizing a timeout means picking a number satisfying two inequalities at once:
longer than the longest legitimate silence, shorter than the longest tolerable
recovery delay. A renewal loop collapses the first quantity to the renewal
cadence and the range opens up. Remove the loop and the first quantity becomes
the job's own duration — and when that is genuinely unbounded, the range is
empty. A timeout long enough to be safe is long enough to be useless; one
short enough to be useful duplicates live work.

Three conditions remove the renewal loop. **No spare execution slot** — an hour
inside one blocking call in a single-threaded runtime has nowhere to heartbeat
from, and adding one restructures the work. **The holder is not yours** — an
external process or plug-in can be recorded as owner but not made to report in.
**The work is neither idempotent nor cheap** — a false takeover is damage, not
a retry, so no timeout is cheap enough to be wrong.

If none of these hold, add the renewal loop and stop reading: the renewable
lease detects death in seconds rather than on the next arrival, and it works
across hosts.

## The predicate: confirmed dead, or nothing

The claim writes an owner record carrying an interrogatable identity rather
than a deadline, and reclaim becomes a probe run when somebody wants the slot:

1. **Is there an identity to probe?** If not, this is the undecidable case
   below — never a reclaim.
2. **Does the process still exist?** Gone is confirmed dead, and so is an
   unreaped corpse that executes no code: it can hold no resource, and reading
   it as alive wedges the slot until something else reaps it.
3. **Is it the same process?** A live identifier whose recorded start token
   differs is a *different* process that inherited the handle. Confirmed dead.
4. **Everything else is alive.** No permission to probe, an unreadable answer,
   a sample the platform could not take cleanly, a probe that raced the
   holder's own exit.

Step 4 is the whole discipline
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)): the
probe is *one-sided*, and every uncertainty resolves to alive. The asymmetry
is not close. A false *dead* preempts a live holder mid-work and duplicates the
work that was too expensive to duplicate; a false *alive* costs one more probe
on the next arrival. Build the probe so the only path to *dead* is a positive
answer, and audit it by reading every error branch: each must return alive.

## Identity must survive handle reuse

A process identifier alone is a recycled handle, and reclaim is exactly where
reuse is likely — the old holder died, the platform freed its handle, something
new took it. Pair the identifier with a **start token** that changes on every
start: an equal identifier with an unequal token proves a different process
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
Three rules keep the pairing honest:

- **Degrade in the safe direction.** Where the token cannot be read on this
  platform, existence-only detection still proves death; only reuse detection
  is lost. Say which one is running rather than defaulting the missing token
  to a value that then competes with a real reading.
- **Sample the token where the comparison happens.** A token cached by the
  claimant is inherited by any child it spawns, so a live child publishes its
  own identifier beside its parent's token and reads as reused. Stamp it in
  the arbiter at grant time, or key the cache to the identifier it describes.
- **Probe outside the mutual exclusion; swap inside it.** A liveness query can
  be slow enough to stall every other key, so probe on a snapshot and install
  the new owner only if the slot still carries the exact record probed.

## The payoff: no fencing token

Because a live holder is *never* preempted, no interval exists in which a
predecessor and a successor both believe they hold the slot — which removes the
whole fencing apparatus the expiry family needs: the attempt generation, the
stamp on every write, the store-side rejection of stale generations. The claim
to check before deleting that machinery is exact — *no path reclaims without
proof* — because a timer-based takeover added "as a backstop" is the one thing
that creates two live believers, and it brings the fencing back with it.

## What a death probe cannot see

**Running is not progressing.** A holder that is deadlocked, suspended, or
waiting forever on a connection that will never answer reads as alive at every
probe, permanently, and the slot never frees. That is this technique's real
cost, and it must be stated where operators read it rather than discovered:
liveness proof bounds recovery from *crash* and from nothing else.

Where the work can emit a cheap progress marker, take it: that marker is a
heartbeat, and the renewable lease returns for the stuck case with the death
probe kept for fast crash recovery. Where it cannot, publish the holder's age
and identity on the operator surface and ship an explicit named reset a human
can invoke. What is never acceptable is the default third option — a slot that
wedges forever with no exit but restarting the service.

## The undecidable record fences

A record with no probeable identity — hand-written, truncated, written by a
foreign producer — can never be resolved either way, however often reclaim
runs. Both obvious answers are wrong: reclaiming is a guess against the only
rule this technique has, and leaving it is a wedge with no exit. The third
answer is to **fence the scope**: leave the holder's state as it is, mark the
scope as requiring recovery, refuse later mutations with a reason distinct from
ordinary contention, and name the operator action that clears it
([creation-names-reaper](../../../../_laws.md#creation-names-reaper) — where
the automatic reaper provably cannot act, the record still names who can).
Evaluate this branch *after* the confirmed-dead branch, so provable death is
always a reclaim and never a fence.

## Reclaim is a verdict, not a slot clear

Proof of death says the holder is gone. It says nothing about how far it got.
Classify the held operation at claim time and let the class decide the verdict,
the way [terminal-state-recovery](./terminal-state-recovery.md) classifies at
boot: work whose partial effects are re-runnable — per-item state is durable
and resets to pending — has its slot simply cleared; work that may have
half-committed a destructive change clears its flags but raises the fence
above, because re-running it is unsafe and so is pretending it finished. The
class belongs in the owner record, not inferred later from what reclaim finds.

## Where this does not apply

The probe is **host-local**: a process identity means nothing to a resolver on
another machine. If holders run where the arbiter cannot interrogate them there
is no proof to be had, and the answer is a renewable lease with its fencing —
not a probe that silently returns alive for every remote holder and so never
reclaims anything. Likewise, when one process is both the only holder and the
owner of the coordination state, that state dies with the holder and there is
nothing to reclaim. Enable the layer only in the regime it was built for.
