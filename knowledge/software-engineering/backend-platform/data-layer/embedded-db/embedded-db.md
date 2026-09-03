---
layer: golden-path
type: golden-path
subject: embedded-db
status: reconciled
techniques:
  - connection-pooling
  - quiet-window-maintenance
  - journal-and-durability-modes
  - extension-lifecycle
  - storage-accounting-and-pruning
  - db-self-instrumentation
  - single-writer-holder-discipline
  - analytical-reads-off-the-serving-store
  - corruption-class-response
  - derived-capacity-limits
---

# Embedded database operations

An embedded database runs inside the application process, against a file the
application owns, on a machine the application does not. There is no server to
administer — which is routinely misread as "there is no administration." The
truth is the opposite: every operational duty a database team performs for a
server — capacity planning, maintenance scheduling, durability configuration,
backup scope, connection management, performance triage — still exists, and
all of it lands on the application code, running unattended, on hardware
chosen by someone else, next to a user who is trying to get work done. The
subject of this document is that transfer of duty: **the application is the
database operator**, and operator work that is not written as code simply
does not happen.

Two clarifications before the duties, because the opening sentence is a
description of the commonest case rather than a definition, and reading it as
one costs a decision later.

The first is that *embedded* names a **placement, not a location**. What the
form factor buys is the absence of a wire — the engine is a library linked
into a process, and which process that is remains a free choice. The usual
placement is the end-user application above, but the same engine is equally at
home as an accelerator inside a server, as a step in a command-line pipeline,
or compiled into a sandboxed runtime with no filesystem to own at all. The
operational duties below are the end-user placement's, which is the hardest
one; a placement with an operator present relaxes them, and none of them
disappear because the engine moved.

The second is that the form factor is **independent of the engine's workload
shape**, and that every duty enumerated below belongs to the *transactional*
shape — the journal contract, the pool, the single-writer directory, the
maintenance window. There is a second in-process quadrant, organised for scans
rather than transactions, whose operating contract is largely the complement
of this one: no durability contract to sign, because its data is a
reproducible copy; no writer to exclude; and a different, cheaper set of
things that can go wrong. Which quadrant a given read belongs in is a decision
most applications inherit rather than make, and
[analytical-reads-off-the-serving-store](./techniques/analytical-reads-off-the-serving-store.md)
is the one place in this subject where that inheritance is challenged.

Boundaries, so the neighbors stay crisp: how the schema evolves across
releases is [migrations](../migrations/migrations.md); how queries are
built, mapped, and layered is [data-access](../data-access/data-access.md);
how the application measures itself in general is
[perf-instrumentation](../../../operations/service-operations/perf-instrumentation/perf-instrumentation.md) —
this subject's self-measurement is the database specialization of that
discipline. What remains here is operating the engine: the pool, the
durability contract, maintenance, extension boot ordering, and the storage
lifecycle.

## The database competes with the user for the machine

On a server, maintenance windows are negotiated with a calendar. In a
user-facing process, the negotiation partner is the user's attention, and it
is renegotiated every second. A compaction pass, a journal checkpoint, an
index rebuild — each is a burst of I/O and page-cache pressure on the same
spindle, the same cores, and often the same database lock that the user's
next click needs. Maintenance scheduled by wall clock **will** eventually
fire mid-interaction, because a timer knows nothing about interactions; the
janky stall it causes is then misattributed to whatever feature the user was
touching, and the actual culprit never appears in any profile because it ran
in a different subsystem.

The standard is therefore: **maintenance runs in quiet windows detected from
real activity signals, never on a bare timer.** The application already knows
whether it is busy — requests in flight, an interaction happening, work
queued. That knowledge must be piped to a gauge the maintenance scheduler
reads at the moment it would start, and re-reads between chunks so a long
pass yields when the user returns. The full discipline — which signals count
as activity, deferral policy, chunking, and what to record about every pass —
is [quiet-window-maintenance](./techniques/quiet-window-maintenance.md).

## Durability is a contract you signed, whether you read it or not

Every embedded engine offers a matrix of journal modes and synchronization
levels, and shipping a configuration means signing that contract: what
survives a process kill, what survives a power cut, how readers and writers
block each other, and — least remembered — **which files on disk are now part
of the database**. Write-ahead journaling, the usual choice for interactive
apps because readers stop blocking the writer, moves recent commits into
sidecar files next to the main store. From that moment, "the database" is a
*set* of files whose consistency is joint: a backup, a file-sync tool, or a
support-bundle exporter that copies the main file alone captures a store
missing its most recent commits — a corruption you manufactured out of a
healthy database, discovered only at restore time, which is the one moment
you cannot afford discovery.

The contract must be chosen once, written down with its reasons, asserted at
boot (engines silently fall back when a mode cannot be honored on a given
filesystem), and honored by every consumer of the files — backup scope,
export, sync, "reveal in file manager" affordances. The mode matrix, the
sidecar inventory, checkpoint interaction, and the crash-consistency
expectations worth testing are
[journal-and-durability-modes](./techniques/journal-and-durability-modes.md).

## The pool is the front door, and an unwatched front door hides every queue

An in-process engine tempts with "connections are cheap, just open one" —
and then the application grows threads, background jobs, and a UI that all
want the store at once, and a pool appears. The pool is now the single choke
point every data operation passes through, which makes it simultaneously the
best instrumentation point in the entire system and the worst place to be
blind. Uninstrumented, pool contention is invisible by construction: callers
experience it as "the query was slow," the query itself measures fast, and
the wait happened in the gap between the two that nobody timed.

The standard: **every acquisition is timed and attributed.** Who asked, how
long they waited, against what timeout policy — cheap to record, and the
only data that can distinguish "the engine is slow" from "the pool is
sized wrong" from "one caller is hoarding." Sizing for an embedded engine is
its own doctrine — the engine typically rewards few writers and tolerates
many readers, so the server-derived instinct of "more connections = more
throughput" is exactly backwards — covered with acquisition instrumentation
and leak discipline in
[connection-pooling](./techniques/connection-pooling.md).

## Boot order is part of the schema

Engines are extended in-process: loadable modules, registered functions,
custom collations, virtual table implementations. Every one of these is a
**per-connection or per-process capability that must exist before the first
statement that depends on it** — and the pool multiplies the hazard, because
a pool manufactures connections on demand, later, on whatever thread hits it
first. Registration that happens "at startup, around the same time as the
pool" is a race that usually wins in development (one connection, warm
timing) and loses in the field. The failure is a boot failure or, worse, a
mid-session failure on the pool's second connection — either way an ordering
bug wearing a database error's costume.

The standard: extension registration is sequenced *strictly before* pool
creation, through one registration door, with an explicit policy for load
failure — refuse to boot, or degrade with the capability marked absent, but
never limp into a session where some connections have the capability and
some do not. The ordering proof, feature-gating, and failure policy are
[extension-lifecycle](./techniques/extension-lifecycle.md).

## Storage grows forever unless something owns pruning

A server database has a capacity dashboard and a human who reads it. An
embedded store has neither — it sits in a hidden application-data directory,
growing monotonically, on disks that are smaller and fuller than developers
assume. Every table that records events, executions, logs, messages, or
metrics is an unbounded accumulator unless code says otherwise, and
[creation-names-reaper](../../../_laws.md#creation-names-reaper) applies to tables
exactly as it applies to temp files: **a table whose rows are born without a
named reaper is a slow-motion incident.**

Ownership means two artifacts. First, **accounting**: a per-table usage
report — rows, bytes, share of total — cheap enough to run on demand,
because "the database is 2 GB" is not actionable and "one table is 1.7 GB of
it" is. Second, **pruning with the safety rails of a destructive operation
run unattended on the only copy of the user's data**: dry-run by default
(report what *would* be deleted; deleting requires the explicit flag), age
floors (never touch rows younger than a stated horizon), and terminal-state
allowlists (only rows in completed/failed/expired states are ever
candidates — in-flight work is never prunable regardless of age). Reclaiming
file space afterwards is a separate, heavier operation that belongs in a
quiet window. All of it is
[storage-accounting-and-pruning](./techniques/storage-accounting-and-pruning.md).

## The engine is instrumented from inside or it is folklore

There is no external monitoring agent watching an embedded store; either the
application measures its own database behavior or every performance
conversation about it is folklore. The economical standard is per-operation
latency records in bounded rings, keyed by the closed vocabulary of tables or
operation families, with derived percentiles and slow-operation counts
surfaced on demand — the database specialization of
[ring-buffer-metrics](../../../operations/service-operations/perf-instrumentation/techniques/ring-buffer-metrics.md),
inheriting its whole discipline: bounded memory by construction, raw records
with statistics derived at read time, and an instrument whose own cost is
budgeted and asserted. What is database-specific — what to key by, which
thresholds mean "slow" for a local store, and how the instrument feeds the
quiet-window gauge and the pruning report — is
[db-self-instrumentation](./techniques/db-self-instrumentation.md).

## The store is a directory, and the machine is full of processes

Everything above reasons about one process and its own store: the pool it
builds, the durability contract it signs, the maintenance it schedules, the
rows it reaps. That framing is complete right up until the store is a
directory that admits one writer and sits somewhere any process on the machine
can open — at which point a whole second failure surface appears, and none of
the in-process instruments can see any of it. A pool reports which pooled
caller is hoarding a connection; it cannot report that a development server
another session started an hour ago is holding the directory.

The signature of that class is a diagnosis that looks finished and is wrong.
The store panics on every open, so it is corrupt; it reproduces on a copy, so
it is definitely the data; the restore begins, and the restore destroys a
healthy store whose only defect was having an owner. Every step of that
reasoning is a normal engineering step, and the corrective is a single habit
placed ahead of all of them: **the first question of any "the database is
broken" report is who else has this open.** From that question the rest
follows — that a copy of a held store is torn by construction and therefore
proves nothing, that a permission error moving the directory is the check
succeeding rather than an obstacle, that held and damaged are not exclusive
and only an at-rest re-test decides, that a backup is a checkpoint you take
while holding the connection yourself rather than a copy of a live directory,
that test files booting the store contend instead of failing, and that every
script and every runtime which opens the store names the event that closes it.
The full cross-process discipline, including the lock-marker trap in copies
and the lockstep rule for layered handle memos, is
[single-writer-holder-discipline](./techniques/single-writer-holder-discipline.md).

## The query that should not have come here

Everything above operates the store the application has. There is one read
class that is better served by not sending it here at all, and it arrives too
late to be caught by the reasoning that chose the engine.

The store was acquired for the transactional job. Later, a question that is
not transactional shows up — a tally over the whole history, a rollup, a
self-join of the largest table against itself — and the store *answers* it.
The numbers are right; the only symptom is that it takes a while. So it stays,
and the serving store silently becomes the analysis store. No decision record
will show this, because the decision was never made: it was inherited from the
fact that the engine was already a dependency, which is not one of the axes
that settles the question.

The standard: **analytical reads over a large table leave the transactional
store once they are frequent or need to feel interactive** — not to a service,
but to an exported canonical copy read by a column-oriented engine in the same
process, which keeps every reason the store was embedded. The threshold is
query *shape* rather than row count, and the condition that usually decides it
is the one no latency comparison shows: a long scan through a single-writer
directory buys the whole contention surface of
[single-writer-holder-discipline](./techniques/single-writer-holder-discipline.md)
for a workload that never needed it. An analysis script carrying an
instruction to run against a copy of the store is that bill arriving. The
three conditions, the reconciliation rules that keep one authority while two
engines read it, and which of this subject's duties the second quadrant
retires are
[analytical-reads-off-the-serving-store](./techniques/analytical-reads-off-the-serving-store.md).

## Every limit the store exposes was derived from another one

The pruner above bounds growth; a different family of numbers bounds *shape*
— the largest entry the store accepts, the largest transaction, the cache a
transaction is granted, the page an enumerator gets back, the operations a
key may perform before it rotates. They arrive as configuration beside each
other and read as independent knobs. They are not: each is a measured
property of the environment (a transport's chunk, a memory target, a
cipher's published ceiling) or a fixed function of another limit, and the
operator who raises one without the derivation revokes a property held two
limits away — an entry that no longer fits the transaction meant to migrate
it, a transaction cache that no longer sums to the shared one. The standard
is that **the derivation is written beside the number and the branch's
default is computed from its leaf as configured**; the case the discipline
exists for is a control-plane structure stored as one entry that outgrows
the entry limit, where the answer is to split the structure one record per
entry, not to raise a limit that was never free to move. That tree, its
margins, and the split are
[derived-capacity-limits](./techniques/derived-capacity-limits.md).

Two neighbours share the word *limit* and neither shares the ground. The
resilience subject's [limit-derivation](../../resilience/rate-limiting/techniques/limit-derivation.md)
derives a *rate* — how fast callers may arrive, priced from what one
admission spends and floored by legitimate cadence; this subject derives the
store's own *capacity* — how large a thing it accepts or holds, from its own
engine's leaves. The rule for picking: if the number bounds arrivals per
window, it is theirs; if it bounds bytes, entries or operations the store
itself carries, it is here. And
[bounded-enumeration](../bounded-enumeration/bounded-enumeration.md) owns
enumeration as a governed operation, including the page-size arithmetic;
this subject owns the fact that the page size is one branch of a tree whose
other branches are entries, transactions, caches and keys, and what happens
when one of them binds.

## The second database is the forgotten one

Applications that embed one database eventually embed two: a vector sidecar,
a cache store, a plugin's private file, an analytics buffer. Every discipline
above was adopted for the first store because incidents taught it — and the
second store arrives quietly, through a library default or a feature branch,
with none of it: no snapshot before its schema changes, no journal-mode
decision, no backup scope entry, no usage accounting, no pruning, no
instrumentation. The asymmetry is not carelessness; it is that the first
database's discipline lives in code *specific to the first database* rather
than in a checklist applied to "any store this application opens." The
observable signature: the disciplines that do reach the second store are
exactly the ones that were factored into shared machinery — a common
connection-configuration batch, a common pool builder — while the ones
written inline against the first store's filename (its snapshot ritual, its
migration runner) never travel. Discipline packaged as a shared function
propagates by default; discipline written as first-store code has to be
remembered, and is not.

The standard is an **inventory obligation**: the application maintains one
authoritative list of every persistent store it opens
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)
applied to stores), and every entry answers the same questions — who
migrates it, who backs it up (including its sidecars), who prunes it, who
measures it, what happens if it is deleted. A store that cannot answer is
not "lightweight"; it is the next incident, filed under a feature name
instead of a database name. This repository's own ledger records exactly
this gap against its second store (see `deviations:` above) — the finding
that motivated elevating the rule from advice to standard.

## The techniques

- [connection-pooling](./techniques/connection-pooling.md) — sizing for an
  in-process engine, reader/writer asymmetry, instrumented acquisition,
  timeout policy, leak discipline.
- [quiet-window-maintenance](./techniques/quiet-window-maintenance.md) —
  activity gauges over timers, deferral and chunking, yielding to the user,
  recording every pass.
- [journal-and-durability-modes](./techniques/journal-and-durability-modes.md) —
  the mode matrix as a signed contract, sidecar files in every copy path,
  boot-time assertion, crash-consistency testing.
- [extension-lifecycle](./techniques/extension-lifecycle.md) — registration
  strictly before pool creation, one registration door, feature gating,
  load-failure policy.
- [storage-accounting-and-pruning](./techniques/storage-accounting-and-pruning.md) —
  per-table usage reports, dry-run-by-default pruning, age floors,
  terminal-state allowlists, space reclamation as a separate act.
- [db-self-instrumentation](./techniques/db-self-instrumentation.md) —
  per-table latency rings, slow-operation counting, thresholds for a local
  store, the instrument's own budget.
- [single-writer-holder-discipline](./techniques/single-writer-holder-discipline.md) —
  the cross-process axis: holder-before-corruption diagnosis, checkpointed
  backups that strip the lock marker, contention as the default explanation
  for parallel test flakiness, explicit exit for every store-opening process,
  layered handle memos closing in lockstep.
- [analytical-reads-off-the-serving-store](./techniques/analytical-reads-off-the-serving-store.md) —
  form factor and workload shape as independent axes, the three conditions
  that move an analytical read out, contention as the uncounted cost, the
  derived copy's reconciliation rules, and which duties the second quadrant
  retires.
- [corruption-class-response](./techniques/corruption-class-response.md) — what
  a handle may do after damage is already present: derived structures detach
  and keep canonical writes flowing, canonical structure quarantines the handle
  and stops writing, the checkpoint that must be skipped on close, and where
  pending work goes instead.
- [derived-capacity-limits](./techniques/derived-capacity-limits.md) — the
  store's limits as a tree of leaves and branches, the derivation written
  beside the number and computed from the leaf as configured, margins sized
  to tracking loss, constants pinned by tests, and the one-way split when a
  limit binds a control-plane structure.
