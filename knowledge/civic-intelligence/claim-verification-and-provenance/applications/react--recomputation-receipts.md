---
layer: application
type: application
subject: claim-verification-and-provenance
technique: recomputation-receipts
stack: react
status: forged
---

# React: the /zdroj receipt — an addressed computation behind a permanent URL

politicas serves a provenance receipt for every knowledge-graph claim at
`/zdroj/<ref>`, where the ref is a self-describing address minted by
`features/shared/provenance/claimRef.ts`. The address header (claimRef.ts:1-21)
states the doctrine: the address carries the whole claim identity
(`h.<b64url(src)>.<b64url(rel)>.<b64url(dst)>` for an edge, `u.<b64url(id)>`
for a node), "so the server can deterministically re-derive the receipt from
nothing but reading the graph — the receipt is not a database row but an
addressed computation". Refusal over repair is coded, not aspirational: the
decoder returns null for anything malformed ("we refuse addresses, we do not
repair them", claimRef.ts:46), the surface answers 404 and "never an empty
frame" (claimRef.ts:15-16), and `MAX_REF_LENGTH = 512` (claimRef.ts:61-63)
rejects abuse before decoding. `claimRefPath()` (claimRef.ts:96-98) is the
single place the URL is composed, so publisher and gate mint byte-identical
addresses.

## The derivation is pure; the React layer only typesets

`features/shared/provenance/receipt.ts` is the whole receipt derivation —
"the server loads the edge/node + audit trail and HERE they become a
serializable receipt … the capsule and the /zdroj page then only typeset —
no logic in components, the entire derivation is testable over fixture rows"
(receipt.ts:1-8). The React page and the share capsule are dumb consumers of
`ProvenanceReceipt` (receipt.ts:106-126). Disclosure rules from the technique
appear as code:

- **Literal transcription:** `toProvenance` is "a literal transcript of the
  stored fields, no substitution" (receipt.ts:164-172); a vanished endpoint
  renders its literal id with kind `"unknown"` and no invented links
  (receipt.ts:143-162).
- **Exact values:** `formatWeightCs` (receipt.ts:231-239) refuses the app's
  rounding formatter — "the receipt is a document: rounding 0,87 to '0,9'
  would alter the documented value" — and uses deterministic `String(n)` so
  SSR and client render the same byte.
- **Gate defaults:** `gateFromEdge` (receipt.ts:174-196) reads
  `verified`/`rejected` literally and maps *anything else, including a
  missing state*, to `pending_review` — "a gated edge never gains 'verified'
  silently". Deterministic (ungated) relations return `gate: null`, and the
  receipt says no review applies "instead of pretending an empty queue"
  (receipt.ts:10-15).
- **Gone with dignity:** `toDecodedClaim` (receipt.ts:246-302) handles the
  decodable-but-vanished record — "the WORST moment for the reader: they
  arrived from a citation and have nothing to hold" — by restating what the
  address asserted, filling in only endpoints the graph still carries, and
  never offering a detail link "that would lead into a void".

## The machine-readable edge of the receipt

`toClaimReviewJsonLd` (receipt.ts:333-386) is the structured-review-emission
gate enforced inside the emitter: `if (receipt.gate?.status !== "verified")
return null`. The comment records the incident that forced it — until
2026-08-12 the page emitted schema.org/ClaimReview markup for every receipt
with the review state written as a Czech sentence in `ratingValue`, so "a
crawler that does not read ratingValue as prose received our unreviewed lead
as a verified fact" (receipt.ts:20-25, 337-342). The fixed emission carries a
numeric 5/5 rating with `alternateName`, the permanent claim ref as
`itemReviewed.name`, appearance URLs only from stored registry identifiers in
deduplicated stable order, `datePublished` as the *review* decision date
before the computation date (receipt.ts:361-363), and omits `url` entirely
rather than fabricate an absolute base (receipt.ts:344-347).

## What this application demonstrates

One React route realizes three layers of the subject at once: a permanent
self-describing address (claim-ref-addressing), a per-request pure
re-derivation with disclosure-not-repair rendering (recomputation-receipts),
and a human-gated machine-readable emission (structured-review-emission) —
with the incident comments left in the code as the reason each rule is a
rule.
