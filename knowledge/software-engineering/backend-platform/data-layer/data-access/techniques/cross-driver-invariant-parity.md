---
layer: technique
type: technique
subject: data-access
technique: cross-driver-invariant-parity
status: forged
laws: [one-authority-per-vocabulary, absent-guard-is-loud, gate-sees-target]
shared_with: []
use_when: [putting a second storage backend behind one repository interface, an invariant is declarative in one engine and a convention in the other, deciding what a hand-written driver double must enforce]
---

# Cross-driver invariant parity

One repository interface, two engines behind it. The interface promises the
application a set of behaviours; a compiler can check that both drivers have
the methods, and nothing at all checks that both drivers **mean the same
thing** by them. The gap is not evenly distributed: most operations port
cleanly, and then one or two — usually the ones guarding money, identity, or
an outbox — rest on a guarantee that one engine expresses declaratively and
the other does not express at all. That asymmetric handful is what this
technique is about.

The naive reading is that a shared interface *is* the parity. It is not.
An interface constrains shape; an invariant is a statement about the set of
states the store can reach, and two drivers can satisfy the same signature
while reaching different state sets. The second driver ships, the first
driver's tests stay green, and the invariant is now true in development and
merely likely in production.

## Name the invariants above both drivers, before writing the second one

Before the second driver exists, write down what the *store* guarantees, in
prose, per constrained table: at most one row per reference; this key is
unique per owner; these two writes commit together or not at all; this read
sees its own write. That list is short — a store with fifty tables usually
has under a dozen real invariants — and it is the parity axis. Everything
not on it is a portability detail; everything on it is a property some caller
above the seam has already assumed.

The list belongs above the drivers, not inside either. Written inside the
first driver it reads as an implementation note and gets ported as code
rather than as a requirement, which loses exactly the invariants the second
engine cannot express — because those are the ones with no code to port.

## Constraint substitution: identity does the constraint's job

When the constrained engine has a declarative uniqueness rule and the other
has none, the substitute is **a deterministic key derived from the same
tuple the constraint covers**. The same reference always addresses the same
record, so a duplicate write has nowhere new to go. Uniqueness stops being a
rule the engine enforces and becomes a property of the address space.

The derivation is a closed vocabulary and gets one authoritative definition
that both drivers call — never two spellings of the same format string in
two files ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
A key format duplicated across drivers drifts on the day someone extends it,
and the drift is silent in both directions: the constrained driver keeps
refusing duplicates by index while the substituting driver starts minting a
second address for the same logical row.

Uniqueness is the common case but not the only one, and the substitution move
generalises. **Total ordering** is the other invariant that quietly depends on
an engine feature: a store with a monotonic surrogate sequence hands back a
guaranteed write order for free, and a store without one returns rows whose
relative order under equal timestamps is undefined — so the caller who paginates
"newest first" gets a stable answer on one driver and a reshuffling one on the
other. The substitute is the same shape as the uniqueness substitute: derive a
total order from something the engine does guarantee, tie-break deterministically,
and write down which engine feature the tie-break is standing in for. Any
invariant a caller depends on and only one engine states — ordering, read-your-
write, cascade on delete — belongs on the list and gets the same treatment.
So does the **default isolation level**, which is the invariant nobody
writes down because nobody chose it: engines default to different levels,
and an embedded engine that serializes every transaction makes a
read-modify-write safe that the same code, moved behind a server that
defaults to read-committed, turns into a silent lost update. A parity list
states the isolation each constrained operation assumes, and the driver
requests it rather than inheriting it.

## The substitute is a guard that must engage on its own

A declarative constraint protects the table against writers who never heard
of it. A derived key protects the table only against writers who route
through the code that derives it — which makes constraint substitution an
optional guard, and an optional guard is an absent guard
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). One
handler that writes to the constrained table with a generated id has not
violated a rule the substituting driver can detect; it has simply added a
row, and the invariant is now false in production and true everywhere it is
tested.

So the substituting driver owes the one-door discipline *more* than its
sibling does, not less: exactly one function in the driver may address that
table, the key derivation is unavoidable on the way in, and the escape hatch
that assigns an arbitrary id is either absent or loudly named for the
append-only tables that legitimately need it.

## Substitution changes the shape of the violation — the caller must not learn that

This is the part that is genuinely hard and routinely missed. A declarative
constraint makes the duplicate write **fail**: the engine raises, and the
driver translates the raise into an outcome. A derived key makes the
duplicate write **succeed harmlessly**: the second write lands on the same
address, and there was never an error to translate. Both preserve *at most
one row per reference*. They preserve it by opposite mechanisms — one
refuses, one absorbs — and a caller that has learned to branch on the refusal
is coupled to the engine that refuses.

The rule: the repository's outcome vocabulary is written for the invariant,
not for either engine's failure mode. *Already recorded* is a value the
operation returns, on both drivers, whether it was produced by catching a
constraint violation or by reading the deterministic address and finding it
occupied. A driver that lets an engine-shaped error escape has moved the
invariant's interpretation into every caller.

There is a second-order consequence worth stating: because the substituting
driver must *read* the deterministic address to distinguish a duplicate from
a first write, its constrained operations are read-then-write, and that read
must be inside the same transactional scope as the write or the check is
decoration. On the constrained driver the equivalent read is an optimisation
— the index is the backstop underneath it. The two drivers therefore have
different *worst cases* under concurrency even when their happy paths agree,
which is the first thing the parity suite should be honest about not covering.

## The parity suite is one suite, run twice

Invariant tests are written against the interface and parameterised over
drivers, not copied per driver. The failure mode of copying is entirely
predictable: the second file is written by transcribing the first, the
transcription omits the cases that were awkward on the new engine, and the
omitted cases are precisely the ones where the engines differ. A parity
suite whose two halves are different sets of assertions is not measuring
parity; it is measuring how much the author remembered.

What that suite asserts, beyond ordinary
[repo-testing](./repo-testing.md) round-trips: the duplicate write yields the
same outcome value on both drivers; the refused write leaves *nothing*
behind on both; the deterministic address is the one the other driver's
constraint covers, spelled by the shared derivation rather than by a literal
in the test; and the outcome the invariant's callers branch on is produced by
both mechanisms.

## When the second engine cannot be in the test loop

Sometimes it cannot: the production engine is a hosted service, its emulator
needs credentials or a container the suite refuses to own, and the driver
that runs in production is the one with no tests. A hand-written in-memory
double is the honest answer — and it is honest only under one condition.

A double that records calls and replays canned answers is a gate observing a
proxy ([gate-sees-target](../../../../_laws.md#gate-sees-target)): it passes
exactly when the author's belief about the engine diverges from the engine,
which is the divergence the test existed to catch. What makes a double
trustworthy is that it **enforces the contracts the driver relies on** —
refuses the operation ordering the real engine refuses, discards buffered
writes when the scope aborts, resolves server-side sentinels only at commit.
Enumerate those contracts at the top of the double; everything not on that
list is an untested edge and is named as one, not quietly assumed.

The double's own guards then need proving: a guard that has silently stopped
firing turns the whole suite green for the wrong reason. That proof is
[negative-control-tests](../../../../engineering-process/build-and-release/test-harness/techniques/negative-control-tests.md)
from the test-harness subject applied to a double rather than to production
code — cite it, do not re-derive it here. And note what a double almost never
models: contention. Without an abort-and-retry model, the concurrency half of
the invariant is unpinned on exactly the driver that runs in production, and
that is a deviation to record rather than a hole to paper over.

## Boundary

[repo-testing](./repo-testing.md) owns how a driver is tested at all — real
engine over mocks, schema by the production road, isolation, fixtures through
the front door. This technique owns the *cross-driver* question that only
appears once there are two: which invariant is being held equal, how it is
expressed when one engine has no vocabulary for it, and what a suite must
assert to claim the two agree. The reflex "test against the real engine"
comes from there; the exception carved for a hosted production engine, and
the price of that exception, come from here. Further out,
demo-data-plane's `network-faithful-mocks` is a neighbour rather than a home:
it disciplines a fake plane that *ships* — latency, provocable failure,
validation parity for a running demo — while the double here exists only
inside a suite and is measured against an engine's transactional contract,
not against a user's experience of one.

## When not to reach for this

With one driver there is no parity axis, and inventing a second-driver-shaped
abstraction against a hypothetical future engine buys nothing and costs the
directness of the first. Where the second store is strictly derived — a read
replica, a search index, a cache — the invariant lives upstream and the
question is staleness, not parity. And where the two engines' expressible
guarantees do not overlap on something genuinely load-bearing, parity work is
the wrong answer to the right observation: the answer is that this data does
not go in that engine, and the decision gets written down where the next
person will read it.
