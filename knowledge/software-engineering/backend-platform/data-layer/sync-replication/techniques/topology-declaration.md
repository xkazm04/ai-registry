---
layer: technique
type: technique
subject: sync-replication
technique: topology-declaration
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [picking a shape for a new replicated stream, local edits vanish after each mirror pass, deciding whether one editable field forces a merge]
---

# Topology declaration

Before any code, a sync design answers one question in writing: **for each
replicated stream, which way does data flow, and who is the authority when
copies disagree?** The answer is a declaration — a table the machinery
enforces — not a vibe the code mostly honors. Every corruption class in
this subject traces to a topology that was implemented differently than it
was believed: a mirror that quietly accepts local writes, a merge that
assumes one side is "usually right", a stream that flows both ways but was
only ever tested in one.

## The three shapes and their physics

**One-way mirror.** Source projects into a replica; the replica never
writes back. Conflict is *defined away* — and that definition is a
promise the system must enforce, because the failure mode is not "a
conflict appears" but "a local edit silently exists until the next mirror
pass flattens it". Enforcement means the replica's write paths for
mirrored streams are structurally absent or rejected, not merely
undocumented. The mirror's other obligation: it must be **total within
its projection** — a mirror that skips rows it finds inconvenient is not
a mirror, it is an editorial process nobody reviews.

**Hub and spoke.** N replicas converge through one authority that orders
all writes. Conflicts exist — two spokes edited the same record between
round trips — but adjudication happens in one place, against one
sequence, with one clock worth trusting. The hub's ordering *is* the
authority: spokes submit, the hub decides, spokes converge on the hub's
answer. The demand this shape makes of records: every write a spoke
submits carries what the spoke *believed* was current (a version, a base
hash), so the hub can tell an update from a stale overwrite.

The variant worth naming, because it is reached by accident rather than
chosen: **a hub that only stores.** N replicas belonging to one principal
converge on an endpoint that persists whatever arrives — a blind upsert, a
put — and that endpoint orders writes only in the accidental sense that one
of them landed last. Read one replica at a time the stream looks like a
one-way mirror pointed the other way, which is precisely why the conflict
policy in this shape is the one most often left undeclared: nobody believes
there is a hub to declare it at. There is. It owes both of the shape's
obligations unchanged — a *declared* policy, where last-writer-wins is a
legitimate declaration when every spoke is the same author and an undeclared
default is not, and the base-version demand above, without which the store
cannot distinguish an update from a stale overwrite even under a policy that
says it need not care.

**Peer merge.** Replicas exchange changes with no distinguished
authority. Concurrent edits are structural, not exceptional, so every
record must carry enough to detect them — a version vector, a lineage, or
at minimum a content identity plus a policy that admits what it loses.
This is the most expensive shape; choose it only when disconnected
operation on multiple writable copies is a genuine requirement, not a
flattering one.

## Direction is per stream

A real system carries different streams in different shapes at once:
reference data mirrors down, user work pushes up, a shared workspace
merges. The declaration is therefore a **per-stream table** —
(stream, direction, authority, conflict policy, projection) — and the
sync engine is generic over it, iterating declared streams rather than
hard-coding each one. Two payoffs: adding a stream is a declaration
change the whole pipeline picks up (cursoring, observability, backfill
come free), and the table *is* the audit artifact — the answer to "what
leaves this machine, and who wins on disagreement" is readable in one
place ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary):
the stream set is a closed vocabulary with one definition, and the
engine, the status surface, and the security review all derive from it).

## The undeclared two-way stream

The signature rot: a stream declared one-way grows a write path on the
wrong side — a migration backfills the replica, a feature edits the
mirrored copy "just this field", an import lands on the downstream. Now
the system is running a two-way sync with the conflict machinery of a
one-way one, which is to say none; the next pass from the authority
overwrites the interloping write, and nothing logs that it happened,
because the topology says it cannot happen. The gate for this cannot be
belief — it must observe the thing it gates
([gate-sees-target](../../../../_laws.md#gate-sees-target)): either the
replica's schema physically lacks write affordances for mirrored streams,
or the sync pass detects local drift (the replica's content differs from
what the cursor history says was delivered) and reports it as an
incident instead of silently repaving.

## The mirror's derived state

A one-way mirror's promise is stated for its *records* — the replica never
writes back — and a replica that serves reads keeps a second kind of state
the promise says nothing about: caches, indexes, in-memory tables,
counters, anything **derived** from the mirrored records so that a read
does not touch the store. Derived state is where the read-only promise
breaks from the inside. The replica writes nothing, and still answers with
something the authority no longer says, because the write that changed the
record reached the replica's copy of the record and never reached the
replica's derivation of it.

The failure has a signature worth recognizing: it arrives as a *series* of
unrelated bugs, one per derived cache, each found by a user and fixed by
hand. A secrets server that added read-serving standby nodes paid for it
that way over a year — leases cached on standbys after the active node had
revoked them, a salt cache that outlived a rotation, login-MFA state,
rate-limit quotas, per-tenant policies missing after a failover, a mount
table upgraded by a node that had no business writing — every one a
derived cache with no invalidation path, and none of them visible from the
topology table, which correctly said the standbys never wrote.

Three obligations, and the third is the one that ends the series:

- **Enumerate the derivations, and give each an invalidation keyed by the
  stream that feeds it.** The replica's consumer of the write stream is a
  dispatcher: for every key prefix that can arrive, the derivation it feeds
  is named and dropped or refreshed. A derivation not in the table is not
  "uncached"; it is cached forever.
- **Where bounded staleness is acceptable, declare the bound instead of
  the invalidation — sized against the most sensitive fact the cache can
  hold.** A time-to-live is a legitimate answer for reference data. It is
  not an answer for a revocation: a cache that can hold "this credential
  is valid" past the moment the authority revoked it has turned the mirror
  into a grace period nobody granted. Size the bound to that fact, not to
  the average one, and where the bound is unacceptable for one derivation,
  that derivation needs the first obligation even if its neighbours keep
  the TTL. A per-process cache with an in-process invalidation and a
  time-to-live for every *other* process is the common half-built form:
  the writer's own copy is exact and each sibling's copy is stale up to
  the bound.
- **An invalidation the dispatcher cannot route fails loud, not quiet.**
  An unknown key at the replica means a derivation exists that the table
  does not know about — the next bug in the series, arriving early. The
  honest responses are to drop *all* derived state, or to restart the
  replica, and to log the key either way; the dishonest one is to ignore
  it, which is what every dispatcher does by default because the default
  branch is empty. The same server's dispatcher, after the series, treats an
  unroutable system-level key as fatal and restarts the node.

There is a matching obligation on the request side. A replica that serves
reads must **forward, by default, everything it cannot serve** — the write,
the operation whose effect the authority must order, the request that must
observe the authority's state at this instant — rather than attempt it
locally and fail on a read-only store. The default matters because
operations are added faster than routing tables are audited: the same
server enumerated its forwardable operations one at a time (cluster join,
root-credential generation, key rotation, step-down, lease renewal,
wrapped-response requests), each discovered as a standby answering a
client with a read-only error. The stable posture is the inverse: the
replica's routing table names the operations it may serve locally, and the
unlisted operation goes to the authority. That is
[failure-direction](../../../../security/identity-and-access/authorization/techniques/failure-direction.md)'s
unlisted-case rule with "forward" in place of "refuse".

## Promotion is a redesign, not a flag flip

Topologies get promoted — the mirror everyone reads eventually breeds a
request to edit "just one field" downstream. Honor the request by
redesigning the stream, not by tolerating the write: either carve the
editable fields into their own upstream stream (two one-way streams in
opposite directions over disjoint projections — still conflict-free, by
construction), or promote the stream to merge and pay merge's full cost
(versioning on every record, a declared policy, a conflict lane). The
disciplined question at the boundary: *can the two directions be made to
touch disjoint fields?* If yes, the cheap shape survives. If no, the
stream is a merge stream and pretending otherwise only defers the
corruption to the first concurrent edit.
