---
layer: technique
type: technique
subject: llm-forensic-gating
technique: entity-id-membership-gates
status: forged
laws: [provenance-or-nothing, lead-not-finding]
shared_with: []
use_when:
  - a model output carries identifier slots (entity ids, record refs)
  - grounding model claims against what a store actually contains
---

# Entity-id membership gates

Wherever a model output has an identifier slot — the entity a gap report is
about, the store record a citation references, the public number of the item
under analysis — a membership gate checks that the value is a member of a
closed set of identifiers that actually exist. The technique sounds trivial
and catches two distinct, measured failure classes: the model *invents* an
identifier (a fabricated reference wearing a valid shape), and the model
*misuses the slot* — putting a field name, a summary phrase, or a slice-wide
observation where an identifier belongs ("all 42,261 rows" in an id field is
not an id; it is an aggregate claim smuggled past the schema).

## Procedure

1. **Build the known set deterministically, at payload-preparation time.** The
   ids in scope come from the store — the entities in the analyzed slice, the
   record identifiers the brief exposes — assembled by code and written into
   the payload itself, so the model sees exactly the list the gate will later
   check. Ship the set's *size* alongside it: a gate scope of zero known ids
   means the gate is vacuously open, and that must be visible, not silent.
2. **Check membership on every identifier slot, not just citations.** Gap
   reports, miscategorization proposals, cross-references — any field typed as
   "an id" gets the check. The rejection message should teach: name the value,
   say it is not an entity in this slice, and say where the observation
   belongs instead (slice-wide findings go in pattern fields, not id slots).
3. **Check claim scope against the record's real fields.** Membership proves
   the id exists; it does not prove the record supports the claim attached to
   it. A store-fact citation may only assert what the cited record's own
   fields hold — a record holding three registration fields cannot ground an
   ownership claim. Encode the record type's field inventory once, and reject
   claims whose substance exceeds it with an instruction to re-ground the
   claim as researched material with an external source.
4. **Scope honestly.** A keyword-based scope check will false-positive on
   record types with rich, varied fields. Restrict it to the record classes
   where the gap was actually measured, and document the restriction as a
   scope limit — a gate that claims completeness it does not have is worse
   than one that states its coverage.

## Decision rules

- **When an id fails membership, reject the verdict — never resolve to the
  nearest match.** Fuzzy-matching a fabricated id to a real one authors a
  connection between a real entity and a claim no evidence attached to it,
  which in this domain is the defamation path.
- **When the known set is incomplete, widen the set, not the gate.** Merge in
  the additional authoritative registry; do not add an "unknown ids pass"
  mode. A gate with a bypass mode measures nothing.
- **When two gates check the same membership at different pipeline stages,
  make their scopes identical.** A pre-persist gate narrower than the
  write-time gate measures nothing — any verdict passing only the wide scope
  was always going to be accepted — so collapse to one scope, defined once
  and imported by both.
- **When membership passes, the claim is still only a lead.** Co-occurrence of
  a real entity id and a real reference proves the pieces exist, not that the
  asserted connection between them does. Membership gates feed the human
  review door; they never replace it.

## When not to use it

Do not apply membership gating to slots that are legitimately open-world —
free-prose evidence descriptions, names of entities outside the store that the
model researched on the open web. Forcing those through a closed set either
blocks honest research or, worse, trains prompt-side workarounds where the
model relabels web findings as store facts to pass the gate. The open-world
slots get the citation-kind discipline instead: an external claim carries an
external source address, checked by the citation gate, and enters the store
only as an unverified lead.
