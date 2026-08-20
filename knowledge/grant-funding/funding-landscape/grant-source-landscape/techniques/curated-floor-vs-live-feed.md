---
layer: technique
type: technique
subject: grant-source-landscape
technique: curated-floor-vs-live-feed
status: forged
laws: [never-fabricate-a-figure]
shared_with: []
use_when: [a jurisdiction has no structured feed, designing the source registry for a multi-market corpus, deciding what runs by default vs behind a flag]
---

# Curated floor vs live feed

A funding corpus serves jurisdictions with wildly unequal data availability,
but its users arrive with equal expectations: whoever opens the product in
their region should see real, relevant money. The technique is a two-layer
source design that reconciles those facts:

- **The curated floor** — an always-on, offline, hand-maintained set of real
  recurring funding programs per jurisdiction. No network dependency, fully
  deterministic, unit-testable. Its job is a guarantee: *no jurisdiction the
  product claims renders an empty corpus*.
- **The live feed** — an opt-in adapter against a verified external endpoint,
  gated behind explicit configuration, layered *on top of* the floor. Its
  job is freshness and breadth where a real feed exists.

The two layers emit the same normalized shape into the same corpus, under
distinct source keys. That sameness is the design's hinge: upgrading a
jurisdiction from floor-only to floor-plus-feed is additive — wire the
adapter, flip the flag — never a migration or a rewrite.

## Why the floor is load-bearing, not a stopgap

The floor looks like scaffolding to be torn down once "real" feeds arrive.
It is not, for three reasons:

1. **Feed scarcity is structural, not temporary.** Most jurisdictions will
   never publish a structured open-call feed; their floor is the permanent
   baseline, with scraping or research layering on top someday.
2. **Live feeds fail.** Endpoints go down, change shape, grow bot-walls. A
   default ingest that depends on a third party being up is a demo that
   fails on stage and a nightly job that silently empties a region. The
   floor is the no-network baseline that makes every other source optional.
3. **Region scoping needs an inventory.** In a product that scopes results
   by the applicant's region, each region's floor is its own source key,
   attached to that region's configuration — so an applicant in one region
   sees their floor and never a neighbor's. The floor doubles as the
   inventory of what the product genuinely knows about each region.

## The curation discipline

A curated floor is hand-written data, and hand-written funding data sits one
careless edit away from the domain's cardinal sin. The rules:

- **Real programs, real funders.** Curated entries name actual grantmakers
  and actual recurring programs — verifiable against the funder's own
  public materials. Amounts and windows reflect the program's published
  figures. Where an entry is deliberately illustrative rather than sourced,
  it is labeled as such in the data itself, not passed off as scraped fact.
- **Close dates are maintenance debt, accepted knowingly.** Static dates go
  stale as cycles roll over; refreshing them is a scheduled chore, and an
  expired curated entry must age out of matching exactly as a live row
  would — the deadline machinery treats both identically.
- **The floor stays small and high-precision.** A few well-chosen recurring
  programs per jurisdiction. The floor's value is that everything in it is
  real and relevant; padding it for volume inverts that.
- **Curated rows declare their nature.** They carry a source key that marks
  them curated, and they may lack what live rows must have (a resolvable
  public deep link). That gap is recorded as a known limitation of the
  layer, not hidden by fabricating links.

## Gating the live layer

Every live adapter answers "am I configured?" before it runs, and the
default answer for anything unverified is no:

- A feed is enabled only with an explicit flag, and — where the adapter is a
  template awaiting a verified dataset — only with the verified dataset
  identifier supplied. **A template with a placeholder identifier fails
  fast when enabled**, rather than fetching garbage; the floor covers the
  jurisdiction meanwhile.
- The registry of sources is one flat list; the runnable subset is computed
  by filtering on configuration. New adapters are added to the list and
  inherit the whole ingest pipeline — one registration point, no parallel
  wiring.
- Free, public, stable backbones (a federal clearinghouse) may be always-on;
  everything fragile, rate-limited, or half-verified is opt-in.

## Decision rules

- When entering a jurisdiction, ship its curated floor first; wire the live
  feed second, only once its endpoint and columns are verified.
- When a live feed and the floor overlap, both stay: dedup keys keep rows
  distinct per source, and the floor's rows retire naturally as their dates
  pass.
- When a curated entry can no longer be verified against the funder's
  public materials, remove or relabel it — a plausible stale entry is worse
  than a smaller floor.

## When not to apply

Skip the floor where a jurisdiction's live backbone is genuinely reliable,
free, and always-on *and* the product does not claim finer-grained coverage
there — a strong national clearinghouse can be the floor for its whole
country. And do not build curated floors for markets the product does not
actually claim; an unmaintained floor for an abandoned market is stale data
waiting to mislead.
