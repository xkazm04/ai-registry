---
layer: technique
type: technique
subject: demo-data-plane
technique: one-interface-many-planes
status: forged
laws: [one-authority-per-vocabulary, failure-not-empty-success]
shared_with: []
use_when: [a demo surface is drifting behind the real client, adding a data source that can only answer some queries, deciding where the fake plane's methods should live, deciding whether a result must carry which plane it came from, seed or sample rows live in the same store as a real tenant's data]
---

# One interface, many planes

The fake plane and the real plane are two implementations of **one declared
interface**, and every consumer holds the interface rather than either
implementation. That single commitment is what converts parity from a habit
into a property the build checks.

## The declaration

The interface names every operation the product's surfaces may perform:
the queries, the mutations, the subscriptions, with their argument shapes and
their result shapes. It is the authoritative statement of what the client can
be asked for
([_laws: one-authority-per-vocabulary_](../../../_laws.md#one-authority-per-vocabulary)),
and it lives on its own — not inside the real implementation, which would make
the fake plane's contract "whatever the real one happens to expose this week."

Three properties make it load-bearing:

1. **Completeness is required, not encouraged.** An implementation either
   satisfies the whole interface or is not an implementation. There is no
   partial plane, no optional method, no "the demo does not do that one."
2. **The shapes are shared.** Both planes return values of the same declared
   types. If the fake plane returns a looser shape, every consumer written
   against it is written against a contract the real plane does not honour, and
   the divergence surfaces only in production.
3. **No consumer names a plane.** A surface that reaches for the fake
   implementation directly — even once, even "just for the demo screen" — has
   opened a hole that the dispatch cannot close and the contract cannot police.

## Why parity must be a build failure

The decay mode of every demo surface is **omission**. Nobody deletes the fake
plane's support for a feature; the real client simply grows a method and the
fake one does not follow. Three months later the demo breaks on precisely the
newest screens, which are the screens most worth showing, and the person who
notices is a prospect.

Making the planes implement one interface converts that from a silent gap into
a build failure at the moment the interface grows. The person adding the
capability is the person who must decide what the fake plane says — which is
the right time to decide it, because they are the only one who currently knows
what the capability means.

The test for whether a codebase actually has this property is mechanical:
**remove one method from the fake plane and see whether anything fails before
the demo is opened in a browser.** If the answer is no, the interface is
decorative and the planes are two independent objects that happen to have
overlapping method names.

## Three planes is the usual steady state

Products that reach this subject usually end up with three implementations, not
two:

- **The live plane** — the full client against the product's own service. Reads
  and writes, authentication, the real error space.
- **The read-mirror** — a reduced client against a secondary store: a
  replica, a cache, an analytics copy, a directly-queried database standing in
  for a service that is not deployed in this configuration. It can answer
  queries and cannot perform writes.
- **The fake plane** — fixtures, no network, no authority.

The read-mirror is the valuable member of the set, because it forces a decision
the two-plane design lets you dodge: **what an implementation does when it
genuinely cannot honour a method.**

The wrong answer is to satisfy the interface by returning an empty success — a
resolved promise, an empty list, a null, a silent no-op. That is the most
expensive lie available here: the user performs an action, sees no error, and
believes the write landed
([_laws: failure-not-empty-success_](../../../_laws.md#failure-not-empty-success)).
The write is gone, and the only evidence is its absence on the next load, which
reads as data loss.

The right answer is that the method **exists and refuses**: it throws or returns
a declared failure naming the operation and the reason this plane cannot serve
it. That keeps the interface complete — a caller cannot fail to notice the
method is missing, because it is not missing — while making the incapacity
loud, attributable, and visible in error reporting. A refusal is a fact the
product can render; an empty success is a fact the product has destroyed.

## What belongs in the interface, and what does not

**In:** the operations, their arguments, their result shapes, and their declared
failure modes.

**Out:** anything that names a transport, a credential, a table, a query
language, or a cache key. Those are properties of one implementation. An
interface that mentions them has forced every other plane to pretend to have
them, which is how a fake plane acquires a fake connection string and a fake
session token that do nothing except make the code look real.

**Out, specifically:** a method that tells the caller which plane is active. It
is tempting — a surface wants to render the marker, or suppress a control — and
it makes every consumer able to branch on the plane, which is exactly the
coupling the interface exists to prevent. The plane's identity is session state
and belongs to whatever renders it, not to the data interface. The one
legitimate exception is a **descriptive** value: a human-readable name for where
the data came from, which the product renders wherever it would name a real
source. That is disclosure, not dispatch, and a consumer must not be able to
compare it against a known constant to change behaviour.

That rule holds on one condition, and the condition is worth stating because
the products that break it are the ones with the most to lose: **a call returns
one plane's data.** The session chose the plane; every value in the result
shares it; identity therefore belongs to the session and not to the value. The
moment that stops being true — fabricated rows stored beside a real tenant's own
(a seed catalog, template content, sample records inserted at onboarding), a
mixed query that reads from several sources at once, a result that will be
re-fed to a ledger or a model as fact — provenance stops being session state
and becomes an **attribute of the value**, and it is then a required field of
every result, not a method on the client. The two shapes are not in tension.
The client still has no "which plane am I" method; the *data* says where each
row came from, the way a payments API stamps every object it returns with
whether it is live, or a query gateway repeats the request's identifier on every
frame so the frame can be joined back to the source that answered. And in this
shape consumers *do* compare the field against a constant — a path that feeds
content to a model must exclude the fabricated rows, and it can only do so by
reading the field. Count that coupling honestly: every consumer of a mixed
result acquires a provenance branch, and the check that no surface branches on
the plane becomes a check that no surface *forgets* to. It is the price of the
guarantee, and it is cheaper than the alternative, which is a source-blind
loader handing a placeholder to a real tenant as their own. The rule for
choosing: if a fabricated value can ever arrive in the same result as a real
one, put the plane on the value; if it never can, keep it off the interface.

## Keeping the implementations honest against each other

Two disciplines catch the divergences the type system cannot see:

- **A shared conformance suite.** One set of tests, parameterized over the
  planes, asserting the properties every implementation must have: a query for
  a known-absent entity resolves to absence rather than throwing; a list result
  is always an array; a rejected write rejects rather than resolving. Run it
  against each plane. The suite is small and it catches the class of bug where
  two implementations agree on types and disagree on meaning.
- **A structural check that no surface imports a plane.** The dispatch point is
  the only module allowed to reference an implementation. This is worth a lint
  rule rather than a review convention, because the violation is a single
  import line that looks harmless in a diff and is invisible thereafter.

## When not to use it

If the product has exactly one data source and no plausible second one, the
interface is ceremony: a wrapper that adds a layer of indirection to a call that
will never dispatch. Introduce it when the second plane appears, not in
anticipation of one.

If the "second plane" is a different *product* — an integration, a third-party
service, a partner API — this is the wrong shape. Those are adapters over
genuinely different vocabularies, and forcing them into one interface produces a
lowest-common-denominator surface that serves neither. This technique is for
several sources of **the same product's own data**, which is what makes one
interface honest rather than aspirational.
