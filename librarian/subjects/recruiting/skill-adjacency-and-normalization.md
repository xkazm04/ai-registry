---
subject: skill-adjacency-and-normalization
domain: recruiting
last_touched: 2026-08-23
touched_by: external-reconcile
dry_streak: 0
---

# skill-adjacency-and-normalization

First touch: [[2026-08-23-8]], external reconcile against
`EuropeanCommission/ESCO` (API pinned to selectedVersion=v1.2.1; reuse terms
summarized; single queries only). Gained
`data--canonical-term-with-surface-aliases` (uncovered). Hint confirmed -
the core claim executed clean (a Czech-only alias resolves to the same
concept URI the English preferred label reaches) - with one sub-claim
refuted (the taxonomy qualifies the preferred label and keeps the bare
ambiguous surface as an alias; one concept's preferred label is the bare
string "R" in three languages).

## The sharpest sightings

- THE API DEFAULT DATASET IS NOT ANY NAMED VERSION: the same URI returns
  near-disjoint English alias sets with and without the version parameter,
  same day. Any number taken unversioned is unreproducible - pin a mirrored
  taxonomy.
- Alias data is language-hollow: 8/8 sampled concepts carry byte-identical
  alias sets across six non-English languages, 4/8 no Czech key at all -
  the failure bilingual-surface-parity predicts, witnessed in the reference
  taxonomy itself.
- Search results carry the matched string but never a match TYPE or score -
  a label hit and a description hit are indistinguishable without deriving
  it ("Java" returns JavaScript and Javanese as label hits; "Kubernetes"
  matches only a description, unmarked).

## Convergence (director placed)

- SEARCH DEFAULTS THAT MANUFACTURE CANDIDATES, sighting 2 of 2 in the same
  wave (with the register's alias default, [[2026-08-23-8]]): rank-1-as-
  resolution silently picks "monitor guest access" for "Access" and "Sass"
  for "SAS". A bare ambiguous alias from a foreign taxonomy is a search
  hint, not a surface. Placement-ready at the next cycle.

## Technique-edit candidates (single-sighted, banked)

- canonical-term-with-surface-aliases: the entry shape should permit ZERO OR
  MORE parents (real published taxonomies ship polyhierarchy; a
  single-parent lint rejects a correct entry) and carry a VERSION PIN for
  any mirrored external vocabulary.
- unmodelled-term-graceful-fallback sighting: the clean empty exists
  (total 0, no nearest-neighbour guess) but the description-matched
  near-miss arrives unmarked - a consumer taking rank 1 invents the
  relationship the technique forbids. Second counterpart makes it an edit.
- Law candidate phrase, n=1: an imported identity is evidence; an imported
  surface is a hypothesis.

## Open leads

- Whether any single string is a label on two concepts (true duplicate
  surface) - needs a bulk pull the single-query rule forbids.
- What "latest" actually serves - not v1.2.1, not any accepted named
  version; no version-metadata endpoint exists.
- Alias counts sampled at n=8, all ICT - nothing generalizes to
  non-technical families yet.
- Hierarchy is one level deep in the programming family (35 mutual
  siblings; R parented elsewhere and so unrelated to Python) - a ladder run
  over a foreign taxonomy's edges inherits its placement judgment wholesale
  (hierarchy-credit / sibling-adjacency gap).
