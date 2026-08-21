---
layer: golden-path
type: golden-path
subject: beneficial-ownership-resolution
status: forged
use_when:
  - linking a named person to a company through official registers
  - deciding whether two records describe the same person or the same firm
  - tracing who owns or controls an entity through holding layers
  - a company has vanished from the live register and a tie still needs checking
techniques:
  - identifier-checksum-validation
  - name-to-identifier-discipline
  - officer-record-reading
  - role-period-reconciliation
  - ownership-chain-traversal
  - struck-off-entity-archives
---

# Beneficial-ownership resolution

Beneficial-ownership resolution is the discipline of connecting a named human
being to a legal entity — as owner, officer, or controller — using official
registers, without ever fabricating identity along the way. It sits one step
before attribution: attribution asks how much money a person's entities
received; resolution asks the prior and harder question of whether those are
in fact *that person's* entities at all. Every downstream figure inherits the
quality of this step, and every error it makes is an error about a real, named
individual. The subject therefore has one governing asymmetry: a link dropped
for lack of evidence weakens a story; a link invented from a lookalike name
accuses an innocent person. All defaults resolve toward the drop.

## The identifier is the hinge; the name is only a lead

Every mature corporate register assigns each entity an authoritative
identifier at formation — a registration number that never changes, is unique
within the register, and usually carries a check digit. That identifier is the
only reliable join key in the entire domain. Names are everything an
identifier is not: they vary by punctuation, abbreviation, legal-form suffix,
and historical renaming; they collide across unrelated entities; and in
free-text sources they arrive dirty — the same firm spelled three ways in
three records, or worse, a category label ("self-employed") stored where a
name should be. The published standards for beneficial-ownership data converge
on the same rule: an identity claim travels as a scheme-plus-identifier pair,
and where only a name exists, the record must say so rather than dress the
name up as an identifier.

This yields the two ground rules of the subject. First, an identifier is
validated before it is trusted — structurally, by its check digit, against the
one canonical implementation of that check ([identifier-checksum-validation](./techniques/identifier-checksum-validation.md)).
Second, a name is never converted into an identifier by guesswork. A name goes
to the register's own search, the result is verified, and when no confident
resolution comes back, the link is dropped and the drop is counted — never
papered over with the nearest-looking match
([name-to-identifier-discipline](./techniques/name-to-identifier-discipline.md)).
The costliest incident class in practice is precisely the shortcut: an exact
string match on a junk name field once welded dozens of unrelated politicians
to a single irrelevant entity, and every one of those edges was a false
accusation waiting to render.

## Identity of the person is proved, not assumed

Resolving the entity is half the problem; the other half is proving that the
person in the officer record is the person in your roster and not a namesake.
Common names are genuinely shared — the same first-and-last combination will
appear across unrelated firms, and among sole traders a namesake carries the
person's exact name as the business name itself. The discipline is a strict
key hierarchy: match on a strong disambiguator the register itself records —
date of birth is the usual one — and treat a name-only coincidence as a lead
requiring human judgment, never as a resolved identity. Where old records
predate the register's collection of the strong key, a name-based fallback may
be used, but gated to exactly those records and labeled as the weaker evidence
it is. The three-way outcome vocabulary matters as much as the matching: the
register *confirmed* the person, the register *conflicts* with the claim (the
entity exists but this person is not identifiable among its officers), or the
check *could not be attempted*. Collapsing the last two into one "no" destroys
information both directions — a conflict is evidence against the tie, an
unattempted check is no evidence at all
([officer-record-reading](./techniques/officer-record-reading.md)).

## Time is part of the claim

A role is not a bit; it is an interval. Secondary sources round periods to
years and default the end to "ongoing"; the register records the day a role
began and the day it ended. Reconciling the two routinely reverses a story's
meaning: money that looked like it flowed to a sitting officer turns out to
postdate the role's registered end, and a tie that looked current turns out to
have been stale for a decade. The register's dated record wins over the
source's rounded one, the disagreement itself is surfaced as a flag rather
than silently repaired, and every money-versus-tenure comparison distinguishes
"inside the period", "after the period", and "undated — cannot be placed"
as three different facts ([role-period-reconciliation](./techniques/role-period-reconciliation.md)).

## Ownership is a graph, and death is not absence

Direct officer seats are the shallow layer. Real exposure runs through
company-to-company shareholding: a person controls a holding entity that
controls the operating firms, and a register that only relates people to
companies misses the entire structure. The register's own records carry the
company-shareholder layer — dated, identifier-keyed entity-to-entity stakes —
and traversing them is its own technique, with its own honesty requirements:
every hop dated and sourced, traversal depth and any scope cap declared, and
no exposure *inference* drawn by the machine — the chain is evidence for a
human to narrate ([ownership-chain-traversal](./techniques/ownership-chain-traversal.md)).

Finally, live registers forget. A struck-off or dissolved entity often returns
nothing from the live lookup endpoint — not a tombstone, nothing — and a
pipeline that reads that absence as "entity never existed" or "tie
unverifiable, case closed" has confused a source's window with the world. The
authoritative archive layer — the register-keeper's own bulk historical
exports, scoped by year — recovers exactly what the live snapshot cannot show,
including the officer history of dead entities, and consulting it is mandatory
before any tie is declared uncheckable
([struck-off-entity-archives](./techniques/struck-off-entity-archives.md)).

## The state of a check is a published fact

Because every one of these techniques can end in "could not determine", the
system must carry check states as first-class, human-readable facts. A
machine-readable flag vocabulary — one definition, imported by every surface —
records what each registry check proved, what it could not prove, and *why*
it could not: no strong-key match found; record too old to carry the key;
entity absent from the archive year consulted; download did not finish;
the register structurally cannot hold this entity type. Two properties are
non-negotiable. Every flag distinguishes machine review from human review in
its own copy — a model's pass or a deterministic sweep raises reviewer
confidence and never promotes a tie to verified. And an unknown flag token is
never hidden: a surface that receives a token it does not recognize renders
the literal token and says so, because a silently dropped caveat is a claim
strengthened by accident.

## What a principal practitioner holds true

- The identifier is the join key; the name is a lead. No identifier is ever
  minted from a name by similarity, and a failed resolution is a counted drop,
  not a guess.
- Checksum-validate identifiers at the boundary, from one imported
  implementation — a second copy of the check-digit rule is a future
  divergence, and check-digit wrap cases are where hand-rewrites break.
- Person identity is closed on a strong key the register itself records.
  Name-only matches are leads, gated and labeled.
- Corroboration is three-state — confirmed, conflicting, could-not-attempt —
  and the three are never collapsed.
- The register's dated periods override the source's rounded ones; the
  override is disclosed, not silent.
- Ownership is traversed as a dated, sourced graph; depth and caps ship with
  the result; the machine surfaces chains, humans assert exposure.
- A live-register miss is a fact about the live register. Dead entities live
  in the archive, and the archive is consulted before "unverifiable" is said.
- Every check leaves a machine-readable state; machine review never
  impersonates human review; unknown states render loudly.

Held together, these rules let a small team assert "this person, this
company, this period" about powerful people and have every assertion survive
hostile scrutiny. Each rule dropped produces more links, faster — and the
extra links are exactly the false ones.
