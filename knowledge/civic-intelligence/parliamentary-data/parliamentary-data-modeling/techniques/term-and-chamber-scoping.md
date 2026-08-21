---
layer: technique
type: technique
subject: parliamentary-data-modeling
technique: term-and-chamber-scoping
status: forged
laws: [one-definition-one-import, missing-is-not-zero]
shared_with: []
use_when: [designing keys for a multi-term store, stamping term codes at ingest, scoping a metric to one legislature]
---

# Term and chamber scoping

A legislative term is not a filter you apply at query time; it is the
institutional boundary inside which almost every parliamentary fact is
defined. Seats, clubs, committees, roll calls, session numbers — all of them
exist *within* a term and are meaningless, or worse misleading, outside it.
The technique is to make the term a first-class scoping key stamped onto rows
at ingest, so that no consumer ever reconstructs "which term was this?" from
dates.

## The term is an organization

Model the chamber-in-term as a row in the bodies registry, exactly like a
committee or a club: it has an id, a validity window, and children. This buys
three things at once:

- **One parent for everything.** Mandates point at the term body; clubs and
  committees carry the term body as ancestor; roll calls carry its id.
  "Everything in term N" is a foreign-key scan, not a date-range guess.
- **Terms can overlap in wall-clock time.** Dissolutions, constitutive
  sessions and transition periods mean date-range scoping mis-assigns facts
  near boundaries; institutional-id scoping cannot.
- **Bicameral and multi-chamber legislatures fall out for free.** A chamber
  is just another body; a person with simultaneous or sequential mandates in
  two chambers is two mandate rows under two term bodies, no special case.

## Derive the term code once, at ingest

Publishers identify terms by an internal organization id; humans identify
them by a short code (a chamber abbreviation plus an ordinal). Derive the
human-facing code from the registry **once, in the ingest pass**, and
denormalize it onto every scoped row — mandates, roll calls, absences. Per
[one-definition-one-import](../../../_laws.md#one-definition-one-import), the
mapping from internal term id to term code lives in exactly one function; a
consumer that re-derives it from a date or an abbreviation regex is a future
drift, and in this domain drift means facts filed under the wrong
legislature.

Decision rules:

- When a row carries the publisher's term id, stamp both the id and the
  derived code; the id joins, the code displays and groups.
- When the registry names a term body you cannot resolve to a code, emit a
  deterministic fallback token that is *visibly* synthetic — never guess a
  real code, never drop the row.
- When a fact carries no term id at all (some publishers' historical tables
  do not), resolve it through the mandate it references, not through its
  date; the mandate knows its term.

## Metrics inherit the scope

Any per-person number is a per-mandate-per-term number until proven
otherwise. A participation rate computed over one term must render as that
term's rate; presenting it as the person's career rate is a fabrication by
scope widening. Conversely, per
[missing-is-not-zero](../../../_laws.md#missing-is-not-zero), a person with no
mandate in the scoped term has *no value* for the metric — they are outside
the population, not at zero. The population line of every published table
("all N members of term X") is the check that the scope held.

## When not to term-scope

The person registry and the body registry themselves are cross-term by
nature and must not be partitioned per term — a person is one row across
their whole career, and a body from a past term is still a live join target
(regions and lists especially). Scope facts and relationships; never scope
identity. The companion technique
[cross-term-registry-loading](./cross-term-registry-loading.md) covers the
loading consequences.
