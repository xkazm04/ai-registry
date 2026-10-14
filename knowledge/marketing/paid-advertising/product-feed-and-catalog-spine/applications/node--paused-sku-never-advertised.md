---
layer: application
type: application
subject: product-feed-and-catalog-spine
technique: paused-sku-never-advertised
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# The pause filter held on the product adapter and leaked on the channel-plan grounding

The workspace applies the technique at its product adapter: the function that converts
catalog offerings into the legacy product list drops every paused offering, the batch
feed serializer applies the same predicate, the brand-context summary filters on the
flag, and the feed import preserves an existing pause when the feed reports no
availability. All four checks passed on reading.

## The seam chosen to falsify it

The consumers that read the raw offering list instead of the adapter were enumerated:
channel-plan grounding, margin blending, landing-page grounding, the catalog editor and
its counts. The channel-plan grounding builder was the one that feeds a generation
prompt, and it took a deliberately narrow row shape of name and category. Both the
seeded channel plan and the AI regeneration keywords were built from every catalog row,
so a paused product's name and category reached the model as grounding. A caught outcome
would have corrected the technique; it did, in the form of the decision rule on narrow
row shapes.

## A and B

A: a fixture with one live row, one paused row and one row carrying no flag, run through
the grounding builder and serialized; the paused name and category appear. B: the
builder filters on the flag inside the one function all three callers share (the page,
the shared visibility plan, the demo read); the paused name and category appear nowhere
and the flagless row stays live. Target: leaks in the fixture 1 to 0. Floor: the ten
existing grounding tests, typecheck, lint and the other unit tests unchanged (four
unrelated failures pre-exist on the baseline, one a cloud-credential dependency).

## Not changed, and why

The revenue-weighted margin blend still counts paused products in its weights; it is a
reporting default for a cost editor, not an advertising surface, so it was left and is
recorded as a candidate. Landing-page grounding for a service is driven by an explicit
user request for that service, so a paused service matching the request was left as the
user's deliberate act.
