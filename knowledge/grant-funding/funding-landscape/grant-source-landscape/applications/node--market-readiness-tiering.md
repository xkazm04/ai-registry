---
layer: application
type: application
subject: grant-source-landscape
technique: market-readiness-tiering
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# A coverage claim that outran the registry pillar

Source tree: the fleet's grant-matching platform for small nonprofits (slug `grant`), a
TypeScript web application, read on 2026-10-14 on `main`. The stack witness is the
continuous-integration pin, Node 24. The repository is private, so this document describes the
seam and does not cite paths or lines. The change is `79b8fb4` on the project's `main`.

## The tree had a tier map and did not follow it

The project keeps a dated market map that tiers each market on the three pillars (open-call
feed, applicant registry, awarded history) and puts the United Kingdom at strong registry,
world-class awarded history, scrape-only calls. The product's public coverage band and the
verification FAQ said UK charities are checked against the national charity regulator. The
verification layer builds adapters for the US and Czech registries only; the UK sources are
declared on the market profile, are neither built nor listed as declared-unbuilt, and resolve to
no adapter. The stated confidence had been derived from the declaration, not from the built set.

The seam was chosen to falsify the claim that the product's stated confidence follows its
tiers. It did not, on exactly the pillar the technique says caps the trust tier.

## The paired proof

A gate test walks every supported market, and for any blurb that claims a registry check
requires at least one built adapter among that market's verification sources. Target: blurbs
claiming a check with nothing built behind them, A 1 of 4 (the UK), B 0 of 4. The FAQ answer
moved from stating UK verification as live to naming it as coming soon. Floor: the US and
Czech blurbs untouched and still backed, 47 jurisdiction and FAQ tests, type check and lint
clean. Verdict `better`.

## Not measured, and where it would show

Whether users read the blurb, and whether the map's own verdicts still hold: it is dated once
for the whole document, three months old, and was not re-fetched here. Return when a UK
register adapter is built: restore the claim, and the test then permits it.
