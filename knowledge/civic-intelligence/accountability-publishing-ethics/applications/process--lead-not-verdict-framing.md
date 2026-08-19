---
layer: application
type: application
subject: accountability-publishing-ethics
technique: lead-not-verdict-framing
stack: process
status: forged
---

# Lead-not-verdict framing — the Politicas accusatory-claim pipeline

Politicas (a Czech parliamentary accountability platform, Next.js + PGlite)
enforces the candidate/finding separation as a chain of pure modules and
process rules rather than as a style guide. The discipline is named in-repo as
"accusatory-claim discipline" (batch-4 §17, batch-5 §22) and shows up at four
layers.

## Detection layer: candidates, recomputed, internally gated

`lib/analysis/tripwires.ts:9-25` is the canonical statement. Graph tripwires
are declarative patterns over typed rows — a pure module with no DB or server
imports, unit-tested, with a thin IO loader (`features/admin/getTripwireData.ts`).
Its header codifies three of the technique's procedure steps verbatim:

- **"the output of every tripwire is a CANDIDATE FOR HUMAN REVIEW, never a
  finding. Coincidence in time or in a registry is a fact; substantive
  connection requires human verification and without it must not be asserted
  anywhere."**
- Nothing is written: candidates are re-derived on every read (no candidate
  table, no stored state) — the "recompute, don't accumulate" rule, adopted
  as precedent 4C from the money-conflicts surface.
- Candidates render **only** on the gated internal surface (`/admin` behind
  `AdminGate`) with "vyžaduje lidské ověření" (requires human verification)
  framing and a link into the review console `/penize/kontrola`, where
  promotion happens.

Ordering is by **evidence completeness, not severity** — a deterministic sum
of declared `EVIDENCE_PARTS`, decomposed beside each candidate — and each
pattern carries its rule text verbatim (`ruleCs`) rendered next to results,
versioned like `COLLISION_RULE_VERSION`.

## Public-adjacent layer: flags that carry their own caveat

`features/lawwatch/deriveRadar.ts:1-36` derives the public "collision radar"
ledger. Every entry is framed as a **finding of the drafting process or a
derived flag — severity-free, factual, never an accusation**; derived
money-tie flags additionally carry the human-verification sentence *in their
own copy* (the moneyLoader parity rule), so no consuming surface — page, RSS,
JSON feed — can drop the caveat. Flags with no detection date are honestly
rendered undated and ordered by print number, with the ordering rule
disclosed on-page and in the feed rather than a date being invented.

## Promotion layer: the human gate is the only write path

Public findings exist only as decisions in `review_audit`, written through a
single path (`features/money/reviewActions.ts` →
`ReviewRepository.setTieReviewState`). `features/dukazy/deriveFeed.ts:1-21`
turns those decisions into the public, citable evidence feed and enforces two
rules *inside the derivation function*: the entry renders **gated copy only**,
and the reviewer's free-text `note` — accepted on the input row — is
**deliberately never copied to the output** ("raw reviewer notes are working
material, not a publication"). Verified, rejected, and needs-more decisions
all publish symmetrically, each with a stable append-only id and permalink.

## Research layer: the same rung system for web findings

`docs/case-loops.md:287-325` extends the framing to model- and web-derived
material: a web finding is a **lead, never a fact**, entering the graph only
through a deterministic or human gate; primary registries outrank media; a
research agent's confidence label is itself "a claim to verify, not a fact"
(batch 003 downgraded a "high" after checking the primary source's 404s); and
absence claims require the registry endpoint that could actually contain the
positive — the plain company endpoint never lists officers, and asserting
clearance from it produced 5 false clearances before the rule was written.

## The transplantable shape

What transfers to any stack: (1) stamp the rung where the row is derived, in
a pure function; (2) put the caveat in the item's own copy, not the page
around it; (3) make human promotion the only write path to public state, with
an append-only audit row as the finding's provenance; (4) strip reviewer
working material in the derivation, not at call sites; (5) re-derive
candidates on read so a corrected source cannot leave a stale accusation
standing.
