---
layer: technique
type: technique
subject: authorization
technique: read-write-predicate-symmetry
status: forged
laws: [one-validation-door, one-authority-per-vocabulary, gate-sees-target, unknown-is-not-a-value]
shared_with: []
use_when: [a list query filters by owner and the by-id write does not, deciding what a write refusal tells the caller about existence, adding an update or delete path beside an already-scoped read, a shared primitive is safe as a read and unscoped as a write]
---

# Read/write predicate symmetry

A visibility rule is almost always born on the read path. The list query is
the surface that shows a caller what exists, so that is where the owner
predicate lands, and that is where it gets reviewed, tested, and
centralized. The write paths on the same resource arrive later — often by a
different author, in a different quarter — and they do not go through a
list. They go through a by-id primitive that takes a key and mutates the
row it addresses.

The rule this technique states is one sentence: **a visibility rule
enforced on reads must be enforced on writes in the same terms, and the
write's refusal must borrow the read's refusal — same answer, same shape —
so the write path does not disclose existence either.**

Both halves are load-bearing and they fail independently. A write that
skips the predicate is the escalation; a write that applies the predicate
but refuses *differently* is the oracle. A system can close the first and
still hand a caller a reliable way to enumerate the exact identifiers the
read path was built to hide.

## Why the asymmetry is structural, not careless

Nobody decides to leave the write ungated. Three forces produce it, and
each one is individually reasonable:

- **The by-id primitive looks harmless.** A point operation over a
  globally-unique key is routinely exempted from tenancy review on
  read-only reasoning: the caller already holds the identifier, and the row
  it names is one row. That exemption is about *reads*. Reused for a
  mutation it is no longer an exemption, it is a bare address-anything
  write, and the review that granted it was answering a different question.
- **The list is treated as the gate.** The argument arrives as "the surface
  only ever offers identifiers the list returned". That is a statement
  about the client, and the client is not the enforcement point
  ([gate-sees-target](../../../../_laws.md#gate-sees-target): the gate must
  observe the row, not the menu the caller was rendered).
- **The write path is where the interesting work is.** The reviewer's
  attention is on the transaction, the billing unit, the cascade — and the
  missing clause is one line that produces no error and no failing test.
  The read path's coverage is visible; the write path's absence is not.

The consequence is the standard shape of the defect: an object another
owner may not view can nonetheless be updated, retired, republished, or
deleted by naming its identifier.

## Same terms does not mean the same set

The symmetry demanded is one of **vocabulary and derivation**, not of
outcome. Read and write predicates may legitimately differ — a caller who
may read every record in a shared corpus may be permitted to mutate only
its own; a delete may be narrower than an update. What is forbidden is:

- the write predicate being **absent**;
- the write predicate being **re-derived** — a second clause, written by
  hand at the write site, that agrees with the read's clause today and
  drifts the first time either is extended
  ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary));
- the difference being **unstated** — a write narrower or broader than the
  read with no recorded reason is indistinguishable from an oversight, and
  the next author will "fix" it in whichever direction is convenient.

So the predicate is a **named thing**, not a repeated clause: the list
query, the point read, and every write gate resolve it from one definition
([one-validation-door](../../../../_laws.md#one-validation-door) applied to
the visibility rule rather than to the store). Where the write is
deliberately narrower, that narrowing is expressed as a second named
predicate stated *in terms of* the first, and its reasoning — including
what it deliberately leaves shared — lives at the definition, not at the
call site.

## The trap in the "raw fact" helper

The predicate is usually computed from an ownership lookup, and that
lookup often already exists in a form built for a different question —
"where do this record's downstream effects go?" Such a helper typically
**folds unowned and unknown into a default**: a shared record has no single
owner, an unrecognized identifier has no owner at all, and both resolve to
some fallback so the routing question has an answer.

That fold is correct for routing and catastrophic for checking. It erases
the exact distinction an ownership test depends on
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)): the
fallback is one owner among many, so a check written on top of the folded
value either grants every caller access to unowned records or grants the
fallback's owner access to unknown ones. The ownership *fact* — owner,
shared, or unknown, as three distinct outcomes — must be exposed
separately, and the routing helper derived from it rather than the reverse.

## The refusal is borrowed, not invented

If the read path answers "no such thing" for records the caller may not
see, and the write path answers "you may not do that", the write path has
just confirmed the record exists. The caller learns, by the difference
alone, which identifiers are real — and the write path is often the
*better* oracle, because it accepts a bare identifier with no other
context.

So the write's refusal is the read's refusal, copied:

- **The same status**, chosen once for the resource class. Where the
  convention is to answer not-found rather than forbidden for records a
  caller may not know exist, the write inherits that choice rather than
  making its own on the grounds that a write "obviously" refuses
  differently.
- **The same body.** A distinct message, a distinct error identifier, or a
  differently-shaped payload restores the oracle the status code closed.
- **The same timing envelope and the same side effects — none.** A refusal
  that costs a round-trip more than an unknown identifier, or that leaves a
  log entry, a rate-limit decrement or a partially-written row behind, is
  still an answer.

The refusal being uninformative to the caller is *not* a licence to make it
uninformative internally: the audit line records which predicate refused
and why, exactly as
[authorization-audit](./authorization-audit.md) requires. Opacity is a
property of the response, never of the trail.

## Ordering: the gate precedes the expensive and the irreversible

A write path usually does more than write. It spends — an outbound call, a
spawned worker, a metered unit — and it may commit several steps. The gate
runs before all of it:

> resolve the identifier → **apply the visibility predicate → refuse** →
> spend → mutate

Two failures follow from getting this backwards, and both have been paid
for. A gate that runs after the spend lets an unauthorized caller consume a
metered resource by naming identifiers it does not own — a refusal that
costs money is a denial-of-wallet surface. A gate that runs after the first
step of a multi-step mutation leaves the record half-changed by a caller
who was never allowed to touch it, and the compensating cleanup is written
by nobody. This is the same before-everything ordering
[dispatch-chokepoint-gating](./dispatch-chokepoint-gating.md) demands, at
the resource rather than the dispatcher.

## The proof is an enumeration, not a habit

The write paths that address a resource by identifier are a finite, listable
set, which makes this one of the cheap properties to gate structurally
rather than by review. The enumeration to hold:

- every write path that accepts a caller-supplied identifier for the
  resource names the predicate it applies, or carries a written reason it
  does not;
- every shared primitive exempted from scoping states whether the exemption
  is read-only, and the exemption is re-argued the day a write calls it;
- **bulk paths validate every element.** An endpoint taking a list of
  identifiers that checks the first, or checks none because the loop body
  is where the check would have gone, is the standard miss — and it is
  invisible in a single-item test;
- **paths added outside the normal handler pipeline** — export, report,
  print, admin, background reconciliation — are enumerated with the rest.
  They are the ones added late, and they are the ones that reach the store
  by a different route.

The assertion worth automating is ordering, not merely presence: the gate
appears in the source, and it appears *before* the mutating call. That is
checkable without running the system, which is what makes it survive.

## The residual worth naming

Symmetry over a shared record buys less than it looks like. Where a record
is legitimately visible and writable by many owners, the predicate is
satisfied by all of them, and any *shared* state on that record — a
lifecycle status, a counter, a flag — is still one value that any of them
can flip for everyone. The symmetric predicate is not wrong there; it is
simply answering "may this caller write" when the open question is "whose
copy of this state is this". Name that residual where the predicate is
defined, so it is a known boundary rather than a future surprise.

## Decision rules

- Every visibility rule enforced on a read is enforced on the corresponding
  writes, resolved from one named predicate rather than re-derived.
- A write predicate may be narrower than the read's; it may never be absent
  or unstated, and the difference is recorded at the definition.
- Expose the ownership fact as owner / shared / unknown; never build a
  check on a helper that folds unowned and unknown into a default.
- The write's refusal borrows the read's — same status, same body, same
  timing, no side effects — and stays fully informative in the audit trail.
- Gate before the spend and before the first step of a multi-step mutation.
- Enumerate the by-identifier write paths and assert the gate precedes the
  write; check every element of a bulk identifier list, not the first.
- Re-argue any read-only scoping exemption the day a write path calls it.
