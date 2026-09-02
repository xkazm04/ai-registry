---
layer: golden-path
type: golden-path
subject: quorum-and-recovery-procedures
status: forged
use_when: [rotating a cluster's own root material by threshold shares, a cluster cannot form a quorum and must be operated anyway, moving a store's contents offline between backends, restoring a snapshot into a peer set]
techniques:
  - nonce-progress-verify
  - cancel-leaves-prior-state-valid
  - migration-lock-in-source
  - single-node-recovery-resize
  - pick-highest-applied-index
  - unauthenticated-ritual-is-a-vulnerability
---

# Quorum and recovery procedures

A stateful cluster that takes its own security seriously ends up with two kinds of
state it cannot change by itself. The first is its root material - the key that wraps
everything else - which is deliberately split into shares across several people so
that no process and no single person can reconstruct it; the key-management standards
call the arrangement *split knowledge* under *dual control*, and its whole point is
that the machine does not hold the key. The second is its replicated state under a
consensus log, which stays writable only while enough peers agree; when they cannot,
the cluster is correct and unavailable at the same time, and nothing inside it can vote
its way out. Both kinds of state are changed by **procedures run by humans**: several
share-holders submitting their shares over minutes or days; one operator, on one node,
with the cluster stopped, copying a store or installing a snapshot or issuing
themselves an emergency credential. This subject is those procedures - how they are
designed so that people can start them, pause them, abandon them and finish them
without ever putting the system into a state that neither the old material nor the
new can open.

The stance a principal engineer takes is that **a ritual is a transaction whose
participants are people and whose commit is a verification round.** The naive reading
treats it as a script: a sequence of commands, each applied as it arrives, done when the
last one returns. Scripts are fine when one process runs them in one sitting. A ritual
is run by k of n humans in different time zones, with an interruption budget the
designer does not control, against material that, if it is lost, is lost with the
whole cluster. So every step of the procedure is designed backwards from the question
*what is true if this is the last step that ever runs?* - and the only acceptable
answer, at every step but the verified commit, is *exactly what was true before it
started.*

## The commitments

**Progress is a named attempt, reported in the ritual's own unit.** Initiating a ritual
mints a nonce; every subsequent contribution carries it; progress is *shares submitted
of threshold required*, never a percentage or a boolean. The nonce is what makes the
procedure resumable and makes a stale contribution rejectable: a share offered against
an attempt that was cancelled last week is refused by construction, not by a human
noticing. The [nonce-progress-verify](./techniques/nonce-progress-verify.md) technique
carries the state machine, including its most important edge - the new material is not
valid until a verification round has been completed *with the new shares*, and the old
material stays valid until then.

**Abandoning is free at every step.** Cancel discards all partial progress. Sealing the
system mid-ritual discards it. Restarting the process discards it. A stale in-progress
lock left by a crashed run is cleared by an explicit reset, not by hand-editing
storage. The failure mode of the naive design is the half-committed ritual: two shares
of three accepted and persisted, the operator on leave, and nobody able to say whether
the system is running on the old key or the new one
([cancel-leaves-prior-state-valid](./techniques/cancel-leaves-prior-state-valid.md)).

**Offline repair takes its lock in the thing it reads, and the online server refuses to
run beside it.** A migration between stores is a single-writer copy; two migrators are
a corrupted destination. The lock lives in the *source* because the source is the one
store both migrators are guaranteed to open; reserved keys that describe the source's
own state are never copied; and the serving process, seeing the lock at boot, refuses
to start rather than serve a store that is being drained
([migration-lock-in-source](./techniques/migration-lock-in-source.md)).

**Recovery shrinks the cluster to one node, and growing it back is part of the
procedure.** When no quorum can form, the operator runs one node in a mode that reads
raw storage and serves nothing but repair endpoints. The credential for that mode is
minted like a root credential - by the same threshold ritual - but never persisted:
restarting the recovery process means regenerating it. Exit is not "restart normally";
exit is reforming the peer set from the repaired node
([single-node-recovery-resize](./techniques/single-node-recovery-resize.md)).

**Repair starts from the peer that applied the most, read while nothing can move.** The
source of truth for a repair is the node with the highest *applied* log index - the
number that carries the predicate "durably applied to the state machine", not
"accepted into the log" or "the highest anyone has heard of" - and it is read while
every node is sealed so that no election can advance it between the reading and the
decision. A snapshot cut under a different sealing configuration is refused without an
explicit override, because installing it produces a store nobody present can open
([pick-highest-applied-index](./techniques/pick-highest-applied-index.md)).

**The ritual is an attack surface.** Every endpoint that mutates a ritual - init,
submit, cancel, verify - is authenticated and policy-gated, and the variant that
needs no shares at all carries the highest privilege the system has. An unauthenticated cancel is a denial of service against rotation: the
attacker needs no share, only the ability to reach the endpoint between two
submissions. And because bootstrap must not leave a long-lived privileged secret in a
provisioner's hands, initialisation may mint *zero* recovery shares where an external
custody makes them unnecessary
([unauthenticated-ritual-is-a-vulnerability](./techniques/unauthenticated-ritual-is-a-vulnerability.md)).

## What the subject owns, and what its neighbours own

[Self-healing](../../../backend-platform/resilience/self-healing/self-healing.md) owns
recovery the machine performs on its own diagnosis: a leader election, a wedged
session cleared, a rolled-back change. That subject's epistemic ladder ends where the
machine cannot decide alone - and this subject begins exactly there. The rule a reader
uses to pick: if the system holds the authority to make the change and the only
question is whether it should, it is self-healing; if the change needs k people to
consent, or a cluster that cannot vote, or a process that reads storage the barrier
would normally hide, it is a procedure and belongs here. The two compose: a
self-healing layer that has exhausted its ladder promotes to a human, and what the
human runs is one of these rituals.

[Versioning and snapshots](../../governance-and-records/versioning-snapshots/versioning-snapshots.md)
owns what a snapshot *is*: its declared scope, its minted identity, forward-only
restore, retention. This subject owns the *act* of installing one into a live peer
set: choosing the source by applied index, refusing a snapshot from another sealing
configuration, restoring while sealed, and reforming the peers afterwards. The rule:
the snapshot as an artifact - cut, named, kept - is theirs; the snapshot as an
operation against a cluster that must survive it is ours. The forward-only rule
transplants intact - a restore here never rewrites the log's history, it installs a
state and the log continues from it.

[Rotation and remediation](../../../security/credential-vault/techniques/rotation-and-remediation.md)
owns rotating a credential the vault holds *on behalf of a consumer* - mint the
successor, validate it live, cut consumers over, retire the incumbent. This subject
owns rotating the vault's *own* root material, which differs in the one respect that
breaks the four-step overlap: nobody, including the system, can mint the successor
alone. The overlap window survives - the old material stays valid until the new is
verified - but the minting step is a threshold ritual with a nonce, and the
"validate the successor live" step is a verification round submitted by the new
share-holders, not a probe the system runs. When the credential is one the system can
mint by itself, use that technique; when the credential is the one that opens the
system, use this subject.

## The shape every ritual shares

Init returns an attempt identity and the parameters the attempt is bound to (how many
shares, what threshold, whether verification is required). Submit takes one share and
the attempt identity, returns *k of threshold*, and does nothing else until the
threshold is met. At threshold the system computes the new material but does not
install it; it returns verification shares or a verification nonce. Verify takes the
*new* shares against the verification nonce, and only its success installs the new
material and retires the old. Cancel, at any point before install, discards the
attempt; a new init mints a new nonce. Status reports the attempt identity, the
progress, and whether an attempt is in flight at all - and reports *no attempt* as a
distinct value from *zero shares of an attempt*, because the two are answered by
different operators doing different things.

Offline procedures share a smaller shape: acquire a lock in the source, refuse if
held, do the copy or the install as one resumable pass, release the lock, and leave a
record that names what was done and from which source. The serving process checks the
lock at boot. The procedure's exit reforms whatever the procedure shrank.

## What "done" looks like

A cluster meets the bar when every ritual can be abandoned at every step with nothing
lost; every contribution names the attempt it belongs to and is refused against any
other; the new material is never valid before the old material is still valid, and
never valid without a verification round performed with the new shares; every
mutating ritual endpoint is authenticated and privilege-gated; offline migration
cannot run twice and cannot run beside the server; recovery mode issues a credential
that dies with the process and ends with the peer set reformed; and a restore names
the source it chose, the index it chose it by, and the sealing configuration it was
checked against. An operator who has never seen the system should be able to read the
status endpoint mid-ritual and answer: what is in progress, how far along, who has
contributed, and what happens if I cancel - with the last answer always being
*nothing changes*.
