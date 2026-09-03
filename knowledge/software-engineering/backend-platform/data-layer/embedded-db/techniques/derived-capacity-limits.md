---
layer: technique
type: technique
subject: embedded-db
technique: derived-capacity-limits
status: forged
laws: [derivation-names-recomputation, count-carries-predicate]
shared_with: []
use_when: [choosing or raising a maximum entry or transaction size, sizing a per-transaction cache against a shared one, a record stored as one entry is approaching the entry limit, a counter-bounded key or cipher needs a rotation ceiling, an operator asks why a limit is the number it is]
---

# Derived capacity limits

An embedded store exposes a short list of numbers that look like tunables: the
largest entry it accepts, the largest transaction, the size of a page it hands
back to an enumerator, the cache it grants a transaction, the number of
operations a key may perform before it rotates. Each arrives in a configuration
struct beside the others, each has a default, and each can be raised. The
naive reading is that they are independent knobs, chosen by feel and adjusted
when something complains. They are not. **Every capacity limit an embedded
store exposes is either a measured property of the engine's environment or a
fixed function of another limit, and the derivation is written beside the
number.** A limit chosen by feel is the failure mode; a limit whose derivation
is not written is one that will be raised without its consequences, because the
consequences live in the other limits it was silently a function of.

This is the storage form of
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation):
a default is a stored derived value, and when the input moves — a transport's
chunk size, a memory target, a cipher's published ceiling — the number is
recomputed by substitution into a formula that already exists, not re-guessed
in a review thread.

## Leaves and branches

The limits form a small tree. The **leaves** are measurements, not choices:
the chunk size the replication or journaling transport moves in one unit; the
memory the server is willing to spend on one enumeration; the longest key the
store can hold; the number of operations after which an authenticated cipher's
guarantees degrade, as published by the standard that defines it. None of
these is picked; each is read off the environment or the specification and
recorded with where it was read from, per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate) — a
figure that travels into a config default carries what it measures.

Every other limit is a **branch**: a fixed multiple, quotient or difference of
a leaf or of another branch. The maximum entry size is a small fixed multiple
of the transport chunk, so an entry never spans more chunks than the transport
was designed to reassemble. The maximum transaction size is a fixed multiple
of the entry size, so a transaction that touches many ordinary entries fits
and one that carries a single oversized value does not slip through under a
different name. A per-transaction cache is the shared cache divided by the
number of transactions the store admits in parallel, so the worst case — every
permit held, every holder at its cap — is exactly the shared budget and never
more. A default enumeration page is the memory target divided by the
worst-case key length, so the largest page the default can produce fits the
budget when every key is as long as keys can be — that branch's arithmetic
belongs to
[page-size-from-memory-budget](../../bounded-enumeration/techniques/page-size-from-memory-budget.md),
and it sits in this tree as one branch among the others, with the same
leaf-and-formula obligations. A rotation ceiling is the cipher's published
limit minus a margin.

Written as a tree, two things become visible that a flat list of tunables
hides. First, **raising a leaf raises everything above it**: a larger chunk
size is also a larger entry, a larger transaction, and a larger apply-time
buffer on every replica, whether or not anyone intended those. Second,
**raising a branch without its leaf breaks the property the derivation
encoded**: an entry limit raised past its chunk multiple produces entries the
transport fragments in ways the reassembly path was never tested against, and
the failure surfaces far from the number that caused it.

## The margin is for what the counter cannot see

The rotation ceiling deserves its own sentence because its derivation has a
term the others lack. The cipher's limit is a hard number; the store's count
of operations against the key is not, because a count persisted on every
operation would double the write load, so it is persisted periodically and
reconstructed from the last persisted value after a crash. Between the last
persistence and the crash, operations happened that the restored count does
not know about. The margin subtracted from the cipher's limit is sized to that
loss — the persistence interval times the peak operation rate, with headroom —
and it is written as that product, not as a round number that looked safe.
A margin that is not derived from the tracking loss is either too small,
which is a cryptographic failure nobody will observe until it is exploited,
or so large that the key rotates constantly and the rotation machinery becomes
the store's dominant write.

Two details of the counter itself belong in the same derivation. The write
that persists the count is an operation against the key, so it counts: a
persistence step that zeroes the unrecorded tally and does not add one for
itself under-counts by one per interval, forever. And the ceiling is enforced
at the point an operator can set it — a configured maximum larger than the
derived ceiling is clamped down to it, silently or loudly but never accepted,
because the cipher's limit is not the operator's to raise.

The general rule: **when a limit is enforced against a counter that can lose
progress, the enforced limit is the true limit minus the maximum loss, the
maximum loss is derived from how the counter is persisted, and the
persistence itself is counted.**

## Derivations carry constants, and constants are pinned

A branch is rarely a clean multiple. The entry limit is enforced against an
encoded size, and a value written inside a transaction carries framing a bare
write does not — a handful of bytes of overhead per entry, plus the key. The
check that keeps a transaction's entries under the limit subtracts that
overhead, which means the overhead is a constant in the derivation, and a
constant in a derivation is a claim that drifts the moment the encoding
changes. The rule: **every constant a derivation depends on is pinned by a
test that measures it**, so an encoding change fails the test that names the
constant rather than producing entries that are a few bytes over a limit the
transport enforces elsewhere.

Limits also move downward, and the tree has an opinion there too. Lowering a
branch does not shrink the data already stored under the old value; a read
that returns an entry larger than the current limit is the store discovering
that an operator reduced a limit below its own contents. That discovery is
loud — a diagnostic naming the size and the limit — because the alternative
is a store that accepts nothing it already holds and says nothing about why.

## When a limit binds a data structure

The derivations above are cheap to write and cheap to keep. The expensive case
is the one they exist to make visible in advance: a limit that binds not a
value but a **data structure the store's own control plane depends on**.

The pattern is a catalogue — a table of mounts, a registry of tenants, an
index of policies — stored as a single serialised entry because it was small
when the store was young and a single entry is the simplest thing that
survives a crash atomically. It grows one record per unit of adoption, and one
day it approaches the entry limit. The observable symptom is a capacity
statement nobody meant to make: the store supports "about N" of the thing,
where N is the entry limit divided by the average serialised record size, and
the number was never in any design document because nobody derived it. The
first instinct is to raise the entry limit, and the tree above says why that
is wrong: the entry limit is a branch of the transport chunk, and raising it
alone breaks reassembly, while raising the chunk raises every limit on every
replica to accommodate one table.

The correct move is to **split the structure so that the entry limit binds a
record, not the catalogue**: one entry per record under a common prefix, read
by enumeration, written under a transaction so a multi-record change stays
atomic. Three consequences follow and each is derived, not chosen. The
catalogue's capacity is now bounded by memory and enumeration speed rather
than by one entry's size, and the new bound must be computed and written down
in place of the old accidental one. The migration from one entry to many is
**one-way** — a build that expects the single entry cannot read the split
form, so the split form is the floor for every later version, and the
migration records that it ran. And the migration is itself a transaction, so
it is capped by the transaction limit: the old catalogue fit in one entry, the
transaction limit is a fixed multiple of the entry limit, so the whole
migration fits in one transaction *because of the derivation* — a fact worth
stating in the migration's own comment, since it is the reason the migration
can be atomic at all, and it stops being true the day someone raises the
entry limit without raising the transaction multiple.

Reading a catalogue by enumeration also changes what the store owes the reader:
a page of records has a size, and that size is derived from the memory budget
above. A control plane that split its catalogue and then reads it back with an
unbounded list has moved the limit from one entry to one response and derived
nothing.

## Decision rules

When choosing a limit's default, derive it from a leaf or a branch, write the
formula beside the number, and name the leaf's source, because a default with
no formula will be raised by the first operator who hits it and the
consequence will land in a limit two branches away.

When an operator asks to raise a limit, raise the leaf it derives from and let
the branches follow, or state which branch is being detached from its
derivation and why; a branch raised alone is a property silently revoked.

When a branch is configurable, compute its default from the leaf *as
configured*, not from the leaf's own default, because a derivation that holds
only while nobody sets anything is a comment, and the operator who raises the
entry size and hits the unchanged transaction limit during the migration that
was meant to escape it is reading that comment for the first time.

When a limit is enforced against a counter that is persisted less often than it
is incremented, subtract the maximum unrecorded progress from the true limit
and write the subtraction as the product it is, because a margin chosen by
feel is either an unobserved cryptographic failure or a rotation storm.

When a control-plane structure stored as one entry approaches the entry limit,
split it one record per entry under a transaction, migrate one-way, record the
migration, and state the new derived capacity; do not raise the entry limit,
because the limit is a branch and the structure is the thing that outgrew it.

When a limit exists for friction rather than capacity — a per-tenant quota
chosen from a plan shape — say so and keep it out of the tree; a product limit
dressed as a derivation invites a reviewer to recompute it from inputs that
were never its inputs.

## When not to use it

A store with one writer, one process and no replication has few leaves — the
transport chunk does not exist, and the transaction limit is whatever memory
allows. Writing a derivation tree for two numbers is ceremony. The technique
starts to pay when a limit's inputs belong to a different component than the
limit itself: a transport, a replica, a cipher standard, a memory budget set
by an operator — which is the moment a limit can be raised by someone who
cannot see what it was derived from.
