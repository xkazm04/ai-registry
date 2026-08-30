---
layer: application
type: application
subject: conflict-of-interest-detection
technique: vote-versus-interest-join
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Node: the six-clause vote×interest join in the politicas money layer

The politicas project (Czech parliamentary accountability, Next.js/TypeScript)
realizes the join as a pure, DB-free TypeScript module —
`features/money/collisions/deriveCollisions.ts` — whose header (lines 1-31)
declares the whole doctrine: inputs are typed rows plus maps, every rule is
unit-tested in `deriveCollisions.test.ts`, the loader
(`getCollisionCandidates.ts`) stays a thin IO shell, and "nothing here runs
through a model — a candidate exists because a deterministic join computed
it, or it does not exist." The header ends with the lead/finding boundary
verbatim: "Výstup je KANDIDÁT, nikdy zjištění" — the output is a CANDIDATE,
never a finding; temporal overlap is a fact, substantive connection needs a
human (batch-4 discipline item 17).

## The six declared clauses

The join rule is versioned (`COLLISION_RULE_VERSION = "strety-v1"` in
`statuteRelevance.ts:32`) and rendered literally in the methodology block on
`/penize/strety`. Mapping to the technique's clause structure:

1. **Tie gate** — `tieEntersJoin` (`statuteRelevance.ts:58-64`): review
   state `verified` AND corroboration `registry-confirmed` (against ARES VR,
   the commercial register) AND a non-null `roleValidFrom`. A missing review
   state counts as pending, never verified — parity with the money loader.
   `deriveCollisions.ts:90-107` also counts the near-misses:
   `tiesVerifiedWithoutPeriod` and `tiesPendingWouldEnter` go into coverage.
2. **Deterministic vote→bill linkage** (`deriveCollisions.ts:129-158`) —
   primary path is the session agenda map (`agendaTisk`); an agenda item
   carrying several bills returns `"ambiguous"` and the vote is dropped
   *without* the title fallback rescuing it ("nejednoznačný klíč nesmí
   vyrobit kandidáta") and counted in `eventsAmbiguousAgenda`. The fallback
   `tiskRefOf(title)` (`statuteRelevance.ts:69-74`) only fires when the
   agenda knows nothing — and the header records its measured yield on live
   data: 0 of 2,014 vote titles carried a bill number.
3. **Statute relevance** — `relevantStatutesFor` (`statuteRelevance.ts:38-51`)
   reads the fixed channel→statute table; a firm with no public-money
   channel yields an empty set and `deriveCollisions.ts:182` skips it.
4. **Temporal alignment** — `voteInRolePeriod` (`statuteRelevance.ts:80-85`),
   both boundary days inclusive, ISO dates compared lexicographically at
   day precision, tested on the boundary days.
5. **Positional vote only** — `deriveCollisions.ts:190-191`: `bucketOf(choice)`
   (the same vocabulary the Seismograf vote feature uses — one imported
   definition) must be `"yes"` or `"no"`; abstention, not-voting and absence
   form no candidate.
6. **One candidate per tie×vote** — multiple hit statutes aggregate into
   `candidate.statutes` (`deriveCollisions.ts:192-220`); the stable id is a
   content hash over `(personPspId, companyId, votePspId)`
   (`collisionCandidateId`, lines 81-85), so re-derivation is idempotent.

## The coverage ledger and null-vs-zero

The return value (`deriveCollisions.ts:241-261`) carries a coverage object
with every filter's population: ties total/verified/entering, voided votes,
linked votes, ambiguous agenda drops, bills in graph vs matched. The
`voteLayerConsulted` flag (lines 63-69, 234-239) implements
missing-is-not-zero exactly: when the tie gate already emptied the join and
the caller never read the vote layer, all vote-layer counts return `null`
("nečteno") instead of zero — because `votes.length - 0 = 0` "would look
like 'the chamber never voted', which is a claim this run never verified."
The tie counts stay numbers, because those rows were genuinely read.

## Determinism against dirty data

Two data-error tiebreaks are declared inline rather than left to iteration
order: a duplicate bill number deterministically resolves to the lowest
node id (lines 116-120) so a double ingest cannot flip results, and a
duplicate ballot for one person on one vote keeps the first under the
loader's stable sort (lines 172-175). Final ordering (lines 224-232) is
total — vote date desc, then locale-aware name, then registry id, then vote
id — leaving no unstable remainder. Candidates are derived on read, never
persisted (the tripwires module, `lib/analysis/tripwires.ts:6-7`, cites
this as "precedens 4C": no table, no state, re-derived every read), so a
rule-version bump propagates everywhere at once.
