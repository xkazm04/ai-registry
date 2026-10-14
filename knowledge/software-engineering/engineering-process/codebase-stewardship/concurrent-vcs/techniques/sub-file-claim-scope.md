---
layer: technique
type: technique
subject: concurrent-vcs
technique: sub-file-claim-scope
status: forged
laws: [identity-survives-reuse, gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [several sessions are assigned different functions of one file and path claims serialize them, choosing the unit a claim names, a claim on a class and a claim on one of its methods were both granted, two sessions with disjoint claims both edited the import block, a session must claim a function that does not exist yet, claiming several units at once while other sessions wait in a queue, deciding whether claims should block or only inform]
---

# Sub-file claim scope

[Intent ledgers](./intent-ledgers.md) declare scope as paths and tell the
declarer to use the coarsest honest granularity, because a scope declared too
narrowly is a false all-clear for the sibling who checks it. That rule is right
for the arrangement it was written for: a handful of sessions, a human who reads
the conflict, and work that rarely shares a file. A claim scheme for many
autonomous sessions on one tree meets a different force. Hand ten sessions ten
different functions of one module and a path claim serializes all ten behind
the module's name, even though the line-level merge would have combined their
work without a conflict. Going below the file buys that parallelism back.

It also opens five holes the path scheme never had, and every one of them reads
as "no conflict" at claim time and as a failed merge at integration. This
technique is the price list, and it starts with the question of whether to pay
it at all.

## First, decide whether the force is present

Sub-file claims are worth their cost only where sessions actually contend
inside files. Measure it before building it: count the claims refused for
overlap, and for each refused pair compare what the two sessions ended up
changing. If refusals are common and the changed regions were disjoint, the
coarse unit is costing you parallelism. If refusals are rare, stay at path
scope; everything below is cost with no return.

The negative case has been measured. A fleet loop that recorded 1,167 builder
runs across eleven repositories in eight days, at most two at a time per
repository and only on disjoint declared directories, queued 179 dispatches in
that week and refused **none** of them for path overlap: 195 queue entries, of
which 136 waited on the global cap, 45 on free memory, 12 on the per-project cap
and 2 on a repository lane. Finer claims there would have admitted nothing,
because the dispatcher already carved disjoint work and the machine, not the
claim unit, was the constraint.

## Hole one: the unit's identity

A unit named by its file and its bare name collides. A type and its
implementation block share a name; two classes in one file each define a method
with the same name; an overload set is one name with several bodies. In the
repository this technique was drawn from, units were keyed exactly that way, so a
type and its implementation block became one row, and two same-named methods in
different classes became one lock: a claim on either covered both. Name equality
is not identity ([identity survives
reuse](../../../../_laws.md#identity-survives-reuse)). Mint the identity from the
syntax tree as the unit's container path, file then module or class then member,
and carry it.

## Hole two: containment

A container and its members are separate units, and a flat claim table treats
them as unrelated. One session claims the class, another claims one of its
methods, both are granted, and both edit the same lines. Lock granularity in
databases settled this long ago: a claim on a member places an intention mark on
every ancestor, and a claim on a container conflicts with any intention beneath
it. Where a full intention scheme is more than the system needs, fold the unit
identity so containment is a prefix relation and test overlap by prefix in both
directions.

The same defect has been measured at a coarser grain. A coordination board whose
claims named a subject while its checks named the files under that subject
reported a clear path in three of four realistic pairs, silently, for its whole
life; the repair folded both spellings to one address and restored the prefix
relation, and it deliberately over-matches, because a false conflict costs one
wait and is visible while a false clear costs a lost write and announces
nothing.

## Hole three: the remainder

Every file holds text that no unit owns: the import block, a file header, module
registrations, an export list. It is also where the most common incidental edit
lands, because a session that changes a function body very often adds an
import. A scheme that claims only units leaves the remainder unclaimed, so two
sessions with perfectly disjoint claims both edit the top of the same file and
conflict at merge.

The source repository demonstrated this without noticing. Its own benchmark
workload prepends a header line to every file a session touches, which is a
remainder edit by construction, and the counter it used for its own arm could
not see the resulting failures: it counted unresolved conflict markers after the
tool had already aborted the merge. A remainder needs an owner. Either make it a
claimable unit per file, held briefly for the one edit the way a shared index
line is edited under a short exclusive, or reconcile it mechanically at
integration, where a set of imports merges as a set. "Nobody owns it" is the one
option that does not work.

## Hole four: units that do not exist yet

Claims are checked against an index of the units the tree contains, and new code
is the commonest thing a session produces. In the source repository a claim on a
function that was not in the index failed a reference check, so a session
adding a function could not claim it at all. Claim new units through their
container (an intention on the class or module, recorded as "adds a member"), or
through the remainder of the file they will land in.

## Hole five: the index goes stale

Unit boundaries come from a parse of the tree at index time, and every
integration moves them: lines shift, units are renamed, members are added. A
claim checked against the index built when the system started is a check over a
proxy ([the gate must see its target](../../../../_laws.md#gate-sees-target)).
Re-derive the units at claim time from the revision the session will branch
from, and again at the [integration door](./integration-door.md), which is the
one place where the claimed units and the changed lines can be compared against
the same parse.

## Dependents: disjoint text is not disjoint behaviour

A session that changes a function's contract breaks its callers, and no claim on
the callers was ever taken. The source's answer, optional, was to take shared
claims on everything the claimed unit calls, transitively, so nobody else may
change a dependency while you rely on it. The direction is right: protect what
you depend on. The resolution was not: its call graph linked callees by bare
name, so every same-named function anywhere was claimed (over-claiming), and
dynamic dispatch was invisible (under-claiming). Treat dependency claims as
advisory marks that the integration door reports, and run the dependents' tests
there; do not let them stand in for those tests.

## Claiming several units: all or nothing, in one order

A session that needs a set of units must hold all of them or none. Holding some
while waiting for the rest is hold-and-wait, and two sessions each holding what
the other needs, each queued for the other's, wait forever. In the source,
all-or-nothing applied only inside its timed retry loop: without a wait, or once
the wait expired, the session kept what it had been granted and, if asked, also
queued for the rest. Acquire the set in a canonical order (sorted unit
identities), release everything you were granted before you sleep or queue, and
queue the set as one request rather than its members one by one.

## Blocking claims answer the ledger's objection with a lease

The ledger technique treats proposals to harden a ledger into a lock with
suspicion, because a lock held by a crashed session blocks honest ones. That
objection is to a lock without expiry, and the remedy is a lease: a claim that
blocks carries a time to live and is renewed by its holder's heartbeat, so a
crashed holder's claim lapses on its own. With that in place the question of
blocking versus informing is answered by who reads the refusal. Where an
operator reads it, a ledger that surfaces the overlap is enough. Where an
autonomous session reads it, there is nobody to surface it to, so the refusal
has to block and has to carry the alternative: the source returned the free
units in the same file beside every refusal, which turns a dead end into a
redirect. A refusal and a failure of the claim system itself are spelled
differently ([failure is not empty
success](../../../../_laws.md#failure-not-empty-success)).

## Decision rules

- Measure overlap refusals against what the refused sessions actually changed
  before going below the file; where caps or a disjoint-work dispatcher dominate,
  stay at path scope.
- Key a unit by its container path from the syntax tree, never by file plus bare
  name.
- Make containment real: an intention mark on every ancestor, or a prefix fold
  checked in both directions.
- Give each file's remainder an owner: a short-held claimable unit, or a
  mechanical set-merge at integration.
- Claim units that do not exist yet through their container or the file's
  remainder.
- Re-derive unit boundaries at claim time and at the integration door, never
  only at startup.
- Dependency claims are advisory marks reported at integration, resolved by
  identity, and backed by the dependents' tests.
- Acquire a set of units all or nothing, in canonical order, and release before
  waiting or queueing.
- A blocking claim is a lease with a heartbeat, and its refusal names the free
  alternatives.
