---
layer: application
type: application
subject: product-feed-and-catalog-spine
technique: usps-become-ad-benefits
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The request held and the deterministic floor wrote reviews nobody gave

Verified against the Czech-first marketing workspace at its origin master tip of
2026-10-22 (`7bbd1cab`), Node 24 per `package.json` engines. Anchors: the ad request
builder in `src/lib/catalog/ad-copy.ts` (`adRequestForProduct`), the deterministic asset
group in `src/lib/catalog/generate.ts` (`buildAssetGroup`, `FloorClaims`, `clampList`),
and the keyless demo in `src/lib/ai/tools/ads.ts` (`demoAds`).

## What the tree already does the technique's way

The ad request is one pure function over the record: the selling points with blanks
dropped, joined, falling back to the category and then the name. The interactive
generator and the batch export both call it. The floor takes proofs as a typed claims
object (free-shipping threshold, rating, return window, dispatch hours) and emits a
line only when its value is present. Every fragment that joins selling points is built
conditionally. Procedure steps 1, 3 and 4 held on reading.

## The seam chosen to falsify it

The decision rule on headline slots says a short selling-point list leaves the slot
empty or takes a descriptive fact, never a filler. The availability section says an
unavailable item gets no availability line. The floor was the place to test both, since
it is the copy a shop bulk-exports without a model. A caught outcome would show the
claims object is not enough: a floor can be strict about typed proofs and still invent
proofs through its fallbacks. It did. When the list had fewer than two entries, the two
selling-point headlines fell back to "verified quality" and "customers' favourite
choice". A product the record marked unavailable got "preorder now" as a headline and
"restocking soon" in a description. A test in the tree asserted the preorder copy.

## A and B

The same rows ran through both arms with the same script: the six-product sample
catalog in four shapes each (as written, no selling points, one selling point, declared
unavailable). That makes 24 asset groups. A: the floor as it stood. B: the filler
fallbacks removed, the availability line emitted only for an available product, and an
empty fragment never kept as an asset.

- Target: filler or future-promise lines, A 30 of 240, B 0 of 216.
- Floor: no empty assets and no over-limit assets in either arm. At least four
  headlines per group in B (six in A), above the three a responsive ad needs. Two new
  tests are red on A and green on B, and the one test that asserted preorder copy now
  asserts its absence. All 19 ad-copy tests pass, as do typecheck, lint, the LLM
  contract gate, context decay and agent review. The full unit suite stands at
  4385/4389 against a clean base of 4383/4387, with the same single failure
  (patterns-embeddings, default credentials).

The project commits sit on a pushed branch cut from origin master. The master push is
blocked by the base suite's red, which was measured before the arms ran.

## A boundary the floor exposed

Omitting a proof can empty a whole asset. A description packed from "all selling
points" plus the availability clause has nothing left for an unavailable product with
no selling points, and the packer returned an empty string. The blank filter has to run
on the assembled asset as well as on the fragments. The technique carries this as a
decision rule.

## What this realization cannot do

The keyless demo generator is a second instance and was not changed. It hardcodes a
999 CZK free-shipping line, "quality you can trust", "customers' favourite choice" and
fast delivery and easy returns, whatever the record says. Its output is labelled as a
demo, so the run filed it rather than changing a second file. Nothing in the tree
checks whether a selling point the owner listed is itself an availability claim. The
sample catalog lists "in stock now" as a selling point, and it would still be restated
for a product the record marks unavailable.
