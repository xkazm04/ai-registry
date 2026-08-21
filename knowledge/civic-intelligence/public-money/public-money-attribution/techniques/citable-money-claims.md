---
layer: technique
type: technique
subject: public-money-attribution
technique: citable-money-claims
status: forged
laws: [provenance-or-nothing, one-definition-one-import, lead-not-finding]
shared_with: []
use_when:
  - a money figure will be quoted outside the product
  - assembling an evidence packet or verification surface for figures
---

# Citable money claims

What a journalist copies out of an accountability product is not "a tie
exists" — it is a *number*: "firms tied to this official received 412
million." If the product can verify the existence of the relationship but not
the figure being quoted, its verification surface checks the wrong thing. The
technique treats every rendered money figure as a mintable claim: an object
with a permanent address, a named metric, a stated derivation, and a gate
state — so that the sentence in the article can be checked, later and by
someone else, against a live recomputation
([provenance-or-nothing](../../../_laws.md#provenance-or-nothing)).

## The minting rules

1. **The value comes from the shared arithmetic.** The claim module performs
   no addition of its own; it mints exactly what the one attribution module
   computed. A claim on an independently re-summed number is one more
   definition of the metric in a product that has already been burned by
   holding several ([one-definition-one-import](../../../_laws.md#one-definition-one-import)).
   Both sides of the verification equation — the surface that publishes the
   figure and the gate that re-derives it — import the same pure module, so a
   verification failure means the world changed, never that two hand-rolled
   reference formats disagreed.
2. **Mint what is rendered.** The claim's metric names precisely the quantity
   the reader has in front of them — one tie's reach, the attributable-bucket
   contract sum, an entity's headline reach. A citation must never be about a
   neighboring number: a claim that verifies the split total while the page
   shows the merged one is a verified irrelevance.
3. **The gate state is part of the assertion.** Every tie carries its
   human-review state — verified, pending, or rejected — and the claim carries
   it *literally*, not flattened to a boolean. Rejected is a terminal state
   distinct from unreviewed, and a rejected tie stays in the graph with its
   history; a claim minted over it says so.
4. **An aggregate is verified only if all its parts are.** A sum over one
   confirmed tie and four unreviewed ones is a *pending* claim, whatever its
   largest component's status. An empty aggregate is pending, not verified —
   verification is a positive act, never a vacuous truth. This is the
   arithmetic form of [lead-not-finding](../../../_laws.md#lead-not-finding):
   the figure inherits the weakest verification of anything inside it.

The claim also records its derivation vintage — which pass of the pipeline
produced the underlying figures — because "the number was right when minted"
and "the number matches the live store" are different assurances, and a
verification surface must be able to say which one failed.

## The strictest surface: the evidence packet

When figures are packaged for handoff — an evidence packet an editor will work
from — the gate becomes absolute: **only human-verified material enters.**
Missing or unrecognized review state normalizes to pending, and pending is
excluded; only strict equality with "verified" passes. Machine-generated
collision candidates and heuristic leads never enter at all, by module
boundary, not by filter — the packet code imports nothing from the candidate
side, and a colocated test holds that invariant.

Two disclosures make the strictness honest rather than silently distorting:

- **Exclusions are counted and shown** — how many ties were pending, how many
  rejected — so the packet says "this is the verified subset of a larger
  picture", not "this is the picture".
- **The packet carries a content fingerprint** over its canonical content —
  ties, timeline, and the disclosed exclusions themselves, but *not* the
  assembly date — so a copy circulating in a newsroom can be checked against
  the live version regardless of when it was downloaded.

## When not to use it

Claim-minting is for figures asserted outward. Internal triage scores, review
rankings, and exploratory aggregates do not need claims — wrapping every
transient number in the ceremony devalues the addresses that matter and
bloats the verification surface. Nor is a claim a substitute for the review
gate: minting a pending claim does not make the figure publishable as a
finding; it makes the figure's *unfinished state* citable, which is exactly
what a careful outlet needs in order not to run it yet.
