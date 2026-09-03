---
layer: technique
type: technique
subject: authorization
technique: identity-bearing-keys
status: forged
laws: [identity-survives-reuse, one-authority-per-vocabulary, creation-names-reaper]
shared_with: []
use_when: [a cross-tenant read must be unrepresentable rather than merely refused, a handler that skips the gate still must not see another owner's rows, deciding whether tenancy is a filter or an address]
---

# Identity-bearing keys

Most tenancy is enforced as a **filter**: the record carries an owner
column, every query adds a predicate on it, and a review checks that no
query forgot. That is a gate, and gates are forgettable — the failure mode
is a single read written without the predicate, which returns the wrong
rows and no error.

The stronger construction moves the owner out of the predicate and into the
**address**. Every record's storage location is *composed* from the owner's
identity, so a reference to another tenant's data is not something the
system refuses; it is something a caller cannot write down. Cross-tenant
access stops being a check that can be skipped and becomes a string that
does not exist. This is the strongest available form of the authorization
gate precisely because it **survives a handler that skipped the gate
entirely**: the handler holds a key it composed from its own caller's
identity, and that key addresses nothing but that caller's data.

It is not a replacement for the dispatch gate
([dispatch-chokepoint-gating](./dispatch-chokepoint-gating.md)) — the gate
still answers *may this caller act at all*. It is the layer underneath,
which decides what a mistake at the gate is even capable of reaching.

## When it applies, and when it does not

The construction fits a store addressed by an opaque path or key — a
document tree, a key-value namespace, an object prefix, a per-tenant
partition. It fits badly where the query language is the access path and
cross-tenant reporting is a product requirement: a relational store whose
whole value is joining across owners cannot make the owner unaddressable
without losing the join. There, the owner stays a column and the discipline
stays the predicate.

The honest test is whether **any legitimate read spans owners**. If one
does, the address cannot carry the owner, and pretending otherwise produces
a second, undisciplined access path for the reporting case — which is where
the leak will be.

## The composer is the only door

The whole property rests on one claim: **no key is built anywhere except
the composer**. A key assembled by hand at one call site is a tenancy hole
that produces no error, no log line, and no failing test — it simply
addresses whatever it spells. So the composer is a single, pure,
framework-free function that owns the key vocabulary
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
and every read path, every write path, and every audit or lifecycle sweep
calls it rather than reproducing its format.

Three consequences follow, and each is load-bearing:

- **Purity is a testing decision, not an aesthetic one.** The composer must
  be callable with no store, no request context and no credentials, because
  the keying rules are exactly what has to be unit-tested exhaustively —
  including the components that are empty, absent, or hostile.
- **Read and write must call the same composer, not two that agree today.**
  A key computed one way on the write path and another on the read path
  does not leak; it *orphans*, which is the same defect wearing a friendlier
  costume — the data is unreachable, the surface reports empty, and nothing
  fails.
- **Call sites are enumerable, and that enumeration is worth gating.** The
  proof that no key is hand-built is a static one: search for the key format
  outside the composer's own module. This is the negative-space half of
  [chokepoint-tag-registry](../../../../engineering-process/standards-and-gates/quality-gates/techniques/chokepoint-tag-registry.md)
  applied to addressing.

## Every component is sanitized against the store's own syntax

A composed key is a string built from values the caller influences, so it
inherits every injection the store's own path and pattern syntax allows.
Two distinct sanitizations are needed, and confusing them is the classic
failure:

1. **Against the store's path syntax** — the separator that starts a nested
   collection, a directory, a namespace. A component containing it does not
   corrupt the key, it *relocates* the record, out of the address space the
   composer believes it is in. The fix is a whitelist, not a blacklist: keep
   an explicitly safe character class and replace everything else.
2. **Against the store's pattern syntax** — the characters the query layer
   treats as wildcards. This one bites on the *sweep*, not on the read.
   A prefix scan written with the store's pattern-matching operator, over a
   key whose own separator happens to be that operator's single-character
   wildcard, silently widens from "this tenant" to "any tenant whose key
   differs by one character". A deletion sweep with that bug is a
   cross-tenant delete; an export sweep with that bug is a cross-tenant
   disclosure. Prefix operations therefore use positional string operations
   (substring comparison, index-of) rather than the pattern operator, and
   the reason is written down at the site, because the next author will
   "simplify" it back.

There is a third, subtler containment: a component that could itself
contain the *composer's own* structural markers can make one tenant's key a
prefix of another's. A sweep must therefore assert not just the prefix but
the **shape of what follows it** — that the next character is the expected
separator and that no further structural marker appears in the remainder.

## An identifier from the wire is proved before it is composed

This is the failure the construction invites, and it is not a leak — it is
the opposite, which is why nobody catches it in a security review.

A composed key never refuses. Hand the composer an identifier that is
typo'd, stale, deleted, or belonging to nobody, and it returns a
syntactically perfect address to an **empty tenant that now exists**.
Writes land there. Reads succeed and return nothing. The surface shows a
plausible empty state. And no lifecycle pass will ever reach that data
again, because every enumeration of a user's tenants is derived from the
list of identifiers the user actually owns — which this one is not
([creation-names-reaper](../../../../_laws.md#creation-names-reaper): the key
was created and its reaper cannot see it).

So the rule is ordered, and the order is the whole rule:

> **prove the identifier exists and belongs to this caller → compose the
> key → touch the store**

The proof is an ownership lookup, not a format check, and it is
[fail-closed](./failure-direction.md): an identifier that cannot be
resolved refuses the request rather than proceeding on the base key. The
legitimate keyless paths — an anonymous visitor, a signed-in caller with no
active scope selected — are distinguished by the identifier being *absent*,
which is a different case from being *unverifiable*, and the guard must not
collapse the two.

Adoption of this half is the part that drifts. It lives at the boundary,
one call per entry point, and it is invisible when omitted — so it needs
the same declared-then-proven treatment as any other per-handler
requirement ([declarative-requirements](./declarative-requirements.md)): a
structural test that enumerates the entry points which compose a key and
asserts each one proved first.

## Renaming a key is a migration, not an edit

The key format is a storage contract with all the data ever written under
it. Widening the address — adding a scope component, changing what a
suffix means — makes every historical record unreachable at the new
address, silently, with no error at either end.

The composer therefore owns the historical shapes too:

- **A union-on-read helper** that returns every key shape a reader should
  consult for one logical tenant — the current one plus the legacy ones,
  deduplicated so a tenant with no historical divergence still reads once.
  History is never rewritten; it is unioned.
- **Stable synthetic components in place of volatile external ones.** When
  a key component is an identifier owned by an outside system — an account
  id from a connected provider — the record's address moves whenever that
  external relationship changes, and data written before the change is
  orphaned by an event nobody thought of as a migration. Pin a stable
  synthetic component for that class instead, and let the volatile external
  id live in the record rather than in its address
  ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
- **A documented deprecation end**, because a union-on-read that nobody
  ever retires is a permanent second read per request and a permanently
  larger surface. The union names the date or the backfill that removes it.

## Decision rules

- One composer, pure and framework-free; no key format appears outside it.
- Whitelist-sanitize every component against the store's path syntax at
  composition time, not at the call site.
- Never prefix-sweep with the store's pattern operator over a key whose
  separator is a pattern metacharacter; assert the shape after the prefix.
- Prove a wire-supplied identifier belongs to the caller *before* composing;
  absent and unverifiable are different cases.
- Treat any change to the key format as a migration: union old shapes on
  read, from the composer, with a stated end.
- Prefer a stable synthetic component over a volatile external identifier in
  any position of the address.
