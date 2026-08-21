---
layer: golden-path
type: golden-path
subject: parliamentary-data-modeling
status: forged
use_when: [ingesting a legislature's bulk registry, designing tables for members and mandates, answering "who held what when" questions, debugging misattributed votes or roles]
techniques:
  - term-and-chamber-scoping
  - mandate-vs-person-identity
  - membership-window-modeling
  - party-club-vs-electoral-list
  - office-vs-plain-membership
  - cross-term-registry-loading
---

# Parliamentary data modeling

A legislature publishes itself as a handful of registries: people, bodies
(chambers, committees, commissions, clubs), seats held, and the time-stamped
relationships between them. Every downstream product — vote analysis,
performance scoring, conflict detection, a member's profile page — asks the
same question shape over and over: **who was what, where, when**. The whole
craft of this subject is arranging the registries so that this question is a
single indexed lookup at query time, and so that the answer is never wrong
about a real, named person. In this domain a wrong join is not a bug; it is a
false public claim about an individual.

The naive reading — "there's a members table and a votes table, join them" —
fails on four structural facts of how legislatures actually work, and each
failure attributes something to the wrong person or the wrong period:

1. **A parliament is not one continuous body.** It is a sequence of terms,
   each legally a distinct institution with its own seats, committees and
   clubs. Data that looks term-agnostic almost never is.
2. **A person is not a seat.** The same human holds different mandates in
   different terms, and within one term a seat can pass between humans
   (resignation, death, replacement from the list). Votes, absences and
   offices attach to the seat-in-term, not to the person.
3. **Affiliations are windows, not attributes.** Membership in a club, a
   committee, or an office is a dated interval, opened and closed mid-term
   routinely. "Party" as a column on the person row is wrong the day after a
   defection.
4. **The registries interlock across terms.** A current member's electoral
   region and the list they ran on are rows in the bodies registry from an
   earlier term; loading "just this term" quietly breaks half the joins.

The mature model that survives contact with all four is the one the
open-civic community converged on independently across dozens of parliaments:
**person, organization, post/office, and dated membership** as separate
first-class records, with the term itself modeled as an organization that
scopes everything beneath it. Getting there is not a schema exercise; it is a
set of ingest-time decisions, and this subject's techniques are those
decisions.

## The four-registry spine

- **Persons** — one row per human, ever. Identity outlives any term. Stable
  publisher id; normalized name for matching; explicit handling of the
  registry's sentinel values (a "date unknown" encoded as a fake real date
  must become a null plus a flag, or the corpus grows phantom
  126-year-olds).
- **Bodies** — one row per organization the legislature recognizes: the
  chamber-in-term, committees, commissions, delegations, political clubs,
  electoral regions, electoral lists. One table, typed, with validity dates
  and a parent link — because memberships and offices all point here, and a
  single target table is what makes the membership query uniform.
- **Mandates** — one row per seat-holding: this person, in this term, from
  this region, elected on this list. The mandate id — not the person id — is
  what ballots, absences and contact records reference in most publishers'
  exports. Collapsing it into the person is the single most damaging
  shortcut available (see mandate-vs-person-identity).
- **Memberships and offices** — dated windows linking a person to a body,
  optionally through a named office (chair, vice-chair, speaker). An office
  is a membership with a role and its own window; both must resolve to the
  same body key so one query serves both (see office-vs-plain-membership).

Everything else the legislature publishes — roll calls, speeches, sponsored
bills, excuses — hangs off this spine and inherits its scoping. If the spine
is right, "which club was this member in on the day of vote X" is one indexed
read. If it is wrong, every consumer re-implements the temporal join, each
slightly differently, and the drift always lands on a named person.

## Time is the first-class dimension

Every question worth asking is time-scoped, so time must be resolved at
**write time, not read time**. The disciplines:

- Scope every fact to its term where the publisher does; derive and stamp a
  human-readable term code onto rows at ingest so consumers never re-derive
  it (term-and-chamber-scoping).
- Store affiliation as `[from, to)` windows with open ends for current
  status; never as a mutable current-value column
  (membership-window-modeling).
- Distinguish the affiliation *at election* (the list) from the affiliation
  *in the chamber* (the club), because they diverge mid-term and each is the
  correct answer to a different question (party-club-vs-electoral-list).
- When a fact's window and a metric's window differ — a member who became a
  minister mid-term, a replacement seated for the final months — the
  mismatch is a structural property of the data, not a behavioral finding
  about the person. Score windows must be checked against mandate and office
  windows before any per-person number is published.

## The ingest contract

Bulk parliamentary exports have a characteristic shape that the model must
absorb rather than fight:

- **Full snapshots, not diffs.** Most publishers rewrite the whole dump
  daily. Ingest is therefore a full re-upsert on natural keys, and the
  natural key must be chosen so that re-ingest is idempotent — which forces
  the key to include the window start, because the same person legitimately
  rejoins the same body.
- **Natural keys collide, and the collisions are the publisher's.** Exports
  without unique constraints repeat rows; under-specified keys merge
  distinct facts (two excuse windows on one day are two facts). Count what a
  de-duplicating upsert eats and surface the count; never hide it, never
  "fix" the source.
- **Not every table in a term-labeled dump is term-scoped.** A file inside
  the current term's bundle may carry the institution's entire history;
  ingesting it per-term without filtering writes the same million rows once
  per term (cross-term-registry-loading).
- **Registries load in full; facts load scoped.** Persons and bodies are
  small and referenced across terms — load all of them, always, and let the
  term column scope queries. Event tables are large — scope them at ingest.
- **Provenance on every row.** Source name, source URL, fetch timestamp.
  Beyond being the domain's baseline honesty, it is frequently the literal
  license condition of the data.

## Failure modes this standard exists to prevent

- **The person/seat conflation** — votes of a replacement member credited to
  the person they replaced, or a member's two terms merged into one record.
- **The current-party column** — a defection retroactively repaints every
  historical vote with the new club.
- **Phantom activity zeros** — a mandate that was never seated scoring as a
  lazy member instead of an empty coverage cell; a mid-term minister scored
  as a floor absentee. Missing is not zero, and the window mismatch is
  detectable deterministically.
- **The double-ingested history table** — a non-scoped file loaded per term,
  silently duplicating the largest table in the store.
- **The two-hop affiliation query** — offices pointing at a functions table
  while memberships point at bodies, so every consumer writes a different
  join and some of them are wrong.
- **Sentinel leakage** — publisher placeholder values (fake dates, magic
  codes) surfacing as real facts about real people.

## The techniques

- [term-and-chamber-scoping](./techniques/term-and-chamber-scoping.md) — the
  term as the master scope; deriving and stamping term codes at ingest.
- [mandate-vs-person-identity](./techniques/mandate-vs-person-identity.md) —
  seat-holding as its own entity; phantom and replacement mandates.
- [membership-window-modeling](./techniques/membership-window-modeling.md) —
  dated intervals, natural keys that include the window, rejoin handling.
- [party-club-vs-electoral-list](./techniques/party-club-vs-electoral-list.md)
  — two different affiliations, each right for different questions.
- [office-vs-plain-membership](./techniques/office-vs-plain-membership.md) —
  resolving offices and memberships to one body key at ingest.
- [cross-term-registry-loading](./techniques/cross-term-registry-loading.md) —
  full registries, scoped facts, and the non-scoped-table trap.
