---
layer: technique
type: technique
subject: quorum-and-recovery-procedures
technique: pick-highest-applied-index
status: forged
laws: [count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [choosing which peer to repair a cluster from, restoring a snapshot into a peer set, a snapshot was cut under different root material, the operator asks which node has the latest data]
---

# Pick the highest applied index, while sealed

When a cluster is rebuilt from one of its peers, or a snapshot is installed over all
of them, the first decision is *which state is the truth*. The consensus layer has an
answer - the log index - but it exposes several indices with different meanings, and
the value changes while anyone looks at it. The technique fixes the predicate, fixes
the moment of reading, and adds one refusal for the case where the chosen state
cannot be opened.

## The predicate is "applied", and the number carries it

A consensus peer reports a *last log index* (the highest entry it has received into
its log), a *commit index* (the highest entry the leader has declared durable on a
quorum) and an *applied index* (the highest entry this peer's state machine has
actually executed). They differ during normal operation and diverge badly during the
failure that brought the operator here: a peer that received entries it never
applied, a leader that committed entries a follower never received.

The rule: **when choosing a repair source, compare peers by their applied index,
because the applied index is the only one that names state the peer's storage
actually holds; a peer with the highest last-log index may hold entries it will
never apply, and restoring from it restores a promise, not a state.** The number that
travels into the runbook - "node two, index 41,873" - carries its predicate with it
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)); an index
recorded without saying which index is the specific number that gets reused for a
claim it does not support. The naive design reads whichever index the status endpoint
shows first, usually the last-log index because it is the largest, and its failure
mode is a rebuilt cluster whose state machine is behind what its log claims, which
the next apply pass discovers by crashing on an entry the state was not ready for.

"Applied" is read from the state machine's own record of the last index it durably
persisted, not from the consensus library's counter of entries handed to the state
machine. The two drift by design - the library reports an entry applied when it has
dispatched it, the state machine when it has committed it to disk - and during the
failure the operator is repairing, the gap between them is exactly the set of entries
that may be lost. The status endpoint reports the state machine's number.

Where two peers report the same applied index, the technique prefers the one that
was leader most recently, because its log was the one a quorum agreed on; where that
is unknown, either is acceptable, and the choice is recorded.

## Read while every node is sealed

The rule: **when the applied index is the basis of a decision, read it from every
peer while every peer is sealed, because an unsealed peer can win an election and
advance its index between the reading and the decision, and the decision would then
be made against a state that no longer exists.** Sealing stops the state machine: a
sealed node has closed its barrier, cannot apply entries, and cannot lead. The index
it reports is the index the operator will find when they act on it. The naive design
reads indices from a live cluster "quickly", and its failure mode is the operator
restoring from node two while node three, unsealed and elected during the reading,
has applied forty more entries that the restore now discards.

Sealed does not mean stopped: a sealed node still answers the status endpoint,
which is how the index is read. And the reading is the target, not a proxy
([gate-sees-target](../../../../_laws.md#gate-sees-target)): it is the peer's own
report of its own applied index, not a dashboard's cached view, not a metric
scraped a minute ago, not the leader's opinion of the follower.

## The snapshot from another sealing configuration

A snapshot of the state machine is ciphertext under a keyring wrapped by root
material that a particular sealing configuration protects - a particular share set,
or a particular external custody. Installing a snapshot cut under a different
configuration produces a store whose entries no one present can decrypt: the cluster
comes up, the barrier refuses to unseal, and the snapshot that was supposed to be
the repair is now the outage.

The rule: **when the snapshot's sealing configuration differs from the cluster's,
refuse the restore, and require an explicit override that names the consequence,
because a silent restore of unopenable state is indistinguishable from data loss
until the next unseal.** The check is a decryption, not a metadata comparison: the
snapshot carries a manifest of its contents' hashes, sealed under the configuration
that cut it, and the restore endpoint attempts to open that manifest with the
cluster's current sealing access before it writes anything. A manifest that opens
proves the snapshot's material is the cluster's material and lets every content hash
be verified; one that does not open is the refusal. Comparing recorded configuration
names would pass a snapshot whose custody was renamed and fail one whose custody was
re-registered under a new name; opening the manifest tests the only thing that
matters, whether this cluster can read what it is about to install. The override
exists for the legitimate case: the operator *is* restoring into a cluster they will
re-seal with the snapshot's material, and knows it. The override is a separate
endpoint or a flag whose name says "force", so that no ordinary restore path reaches
it by default; the guard is on unless deliberately lifted.

The restore itself installs the snapshot as the state machine's state and resets the
log to continue from the snapshot's index. It does not rewrite history behind the
snapshot - the forward-only rule from the versioning subject holds - and every peer
that is not the restore target is treated as a peer to be reformed, exactly as after
single-node recovery: their logs diverged from the restored state the moment the
restore committed.

## The record

The decision is recorded where the next operator finds it: which peer or which
snapshot was chosen, the applied index it was chosen at, the indices the other peers
reported, and whether the sealing check passed or was overridden. A repair that
leaves no record of why node two was chosen leaves the next incident's operator
re-deriving the choice from memory - and the choice is one that, made wrong, discards
the entries the cluster had that no other copy holds.
