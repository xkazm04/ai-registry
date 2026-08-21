---
layer: technique
type: technique
subject: claim-verification-and-provenance
technique: claim-ref-addressing
status: forged
laws: [provenance-or-nothing, one-definition-one-import]
shared_with: []
use_when: [minting permanent citation links for published figures, designing a claim identifier scheme, handling malformed or dead citation URLs]
---

# Claim-ref addressing

A claim reference is the permanent, machine-checkable address of one published
claim. Its design goal is stated by
[provenance-or-nothing](../../../_laws.md#provenance-or-nothing): every published
figure must carry an address a machine can check — which means the address must
still resolve to a checkable answer years after the page that minted it was
rewritten, the store re-imported, and the schema migrated twice.

## The address encodes the claim, not a row

The decisive design rule: **the address carries the full identity of the claim
in its own segments.** For a graph assertion, that is source, relation, and
target; for a value claim, dataset, metric, and optional subject. Encode each
segment reversibly (a URL-safe encoding with an unambiguous separator) so the
server can decode the address and re-derive the answer purely from the current
store.

What this buys, concretely:

- **No lookup table.** An address that points at a surrogate key needs a
  citations table mapping key → claim, and that table is a second store that
  can drift, get truncated, or fail to migrate. A self-describing address
  needs only the decoder and the live store.
- **Rebuild-survival.** Re-imports renumber rows; they do not rename a
  legislator or a registry identifier. Addresses built from durable natural
  identity survive the rebuild; addresses built from storage identity do not.
- **Symmetric minting.** The surface that publishes a figure and the gate that
  verifies it must compose the reference from one shared, dependency-free
  module — [one-definition-one-import](../../../_laws.md#one-definition-one-import)
  applied to identity. If each side assembles the ref by hand, a one-character
  divergence renders as "we do not know this claim", and every such false
  negative teaches readers the gate is broken.

Keep the identity segments to durable vocabulary. The dataset name and metric
slug are *part of the address* and therefore frozen; anything versioned — the
formula, the pass number — travels in the claim's derivation field, never in
the address, or every recompute would invalidate every citation ever issued.

## Refusal, never repair

A decoder has exactly two outcomes: a fully decoded claim, or null. The rules:

- **Malformed input returns "unknown reference", never a guess.** No fuzzy
  matching, no trimming to the nearest valid prefix, no case repair. A
  verification surface that repairs addresses will eventually confirm a claim
  the citer did not make — one such event ends the surface's authority.
- **An undecodable address is a hard 404-class answer, never an empty frame.**
  A blank page reads as "still loading" or "temporarily broken"; the honest
  answer is a definite "this is not an address we ever issued", stated as a
  verdict with a reason.
- **Bound the input.** Claim identities are short; an address segment beyond a
  small fixed length is abuse of the endpoint, not a citation, and is refused
  before decoding.

## The address space is append-only

Every reference ever issued is a standing promise. Consequences:

- **Format migrations decode both shapes.** A new address format is added
  beside the old decoder, never replacing it. Redirect old to new if you
  like; refuse neither.
- **"Gone" is a first-class page, and it works from the address alone.** When
  an address decodes but today's store no longer carries the record, the
  reader has arrived from a citation and has nothing else. Because the address
  *is* the claim, the surface can still state what was asserted — the
  endpoints, the relation, the metric — and enrich it with whatever the store
  still knows (endpoints usually outlive the edge between them). What it must
  not do is invent: a vanished entity renders as its literal identifier, with
  no reconstructed name and no link into a void.
- **Never re-issue an address for a different claim.** If the identity
  vocabulary must change meaning, that is a new address shape, not a reused
  one.

## When not to use it

Self-describing addresses fit claims whose identity is a few short durable
tokens. Do not force them onto content-shaped artifacts — a whole filtered
view, a rendered document — where the identity is the *configuration* of the
view. Those want a content-hash permalink (the fingerprint family: address =
view config + hash of the rendered content), which trades re-derivability of
meaning for exact change detection. The two schemes coexist behind one gate;
the mistake is using row ids for either.
