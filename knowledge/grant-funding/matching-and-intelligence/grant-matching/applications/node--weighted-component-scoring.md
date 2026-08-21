---
layer: application
type: application
subject: grant-matching
technique: weighted-component-scoring
stack: node
status: forged
verified_on: 2026-08-19
---

# Node — weighted component scoring in a nonprofit grant matcher

How the grant-writing-nonprofits repo (`C:\Users\mkdol\xprice\grant-writing-nonprofits`)
realizes weighted component scoring as pure TypeScript functions, deliberately
shipped *before* any model lane — the file header at
`src/features/grant-ingest/scoring.ts:12-16` records the decision: "Gemini-scored
from the start" was explicitly rejected for the first slice, "determinism + zero
cost + zero latency until we know what we're actually scoring".

## The org-to-opportunity ranker

`scoreGrant()` (`scoring.ts:60-75`) sums three named components under explicit
maxima — `GEO_MAX = 30`, `MISSION_MAX = 50`, `AWARD_MAX = 20` (`scoring.ts:55-58`)
— and clamps the total to 0-100. Mission gets the plurality; geography and
award size are gates wearing score clothing. The components stay attached to
the result (`ScoredGrant.components`) so the explainer can consume them.

Component internals show the tiered-credit and honest-neutral rules:

- **Geography** (`scoring.ts:77-104`): a structured country gate runs first —
  a real cross-border mismatch returns 0 regardless of prose ("don't rank a UK
  national grant for a US org just because the prose says 'national'"). A
  city/state/abbreviation hit earns the full 30; federal/national programs earn
  `GEO_MAX * 0.6` — partial credit at a fixed fraction. The
  `isFederalAgency()` detector (`scoring.ts:201-213`) is the conservative-text-
  detector rule in code: it excludes agencies containing "state" (unless
  "united states") before matching federal anchors, because "Texas Workforce
  Commission" would otherwise pass a naive `commission` pattern.
- **Mission** (`scoring.ts:106-118`): keyword hits over title+description with
  the saturating transform `MISSION_MAX * (1 - Math.exp(-hits / 2))` and the
  comment that names why: "a grant that mentions every keyword is usually a
  meta-RFP, not a tighter fit". This is the
  diminishing-returns-keyword-overlap technique living inside one component.
- **Award size** (`scoring.ts:120-136`): missing amounts earn
  `AWARD_UNKNOWN_DEFAULT = 10` — half the max, never full marks. Amounts are
  compared via USD-normalized fields stamped at ingest ("A CZK 5M grant must
  not score as $5M for a US org"), and any overlap with a revenue-relative
  sweet spot (5%-40% of annual revenue) earns the full 20.

`explainMatch()` (`scoring.ts:164-199`) then derives reasons strictly from
these components — its comment is the fidelity contract verbatim: "mirrors
exactly what scoreGrant() rewarded, so it never claims a reason the score
didn't actually credit". Full geography credit yields "Serves your area
(<place>)" with the place recovered by re-running the match; partial credit
yields only "Open nationwide"; evidence is the deduped `matchedKeywords()`
list capped at 3.

## The same discipline reused for item similarity

`relatedGrants()` (`src/features/grant-references/related.ts:64-95`) ranks
"opportunities like this one" with a second weighted decomposition: sector
overlap up to **45** (scaled by the fraction of the target's sectors shared),
same funder **30** with a fallback tier of same funder-*type* at only **8**
("same funder = funder-DNA continuity"), jurisdiction **12**, award-band
overlap **13** (ranges overlapping, or midpoints within ~3×,
`related.ts:50-61`). Different components, same technique: named signals,
editorial weights, tiered credit where one signal subsumes another, and a
result that carries its parts (`sharedSectors`, `sameFunder`, …) for display.

## Transplant notes

Everything here is dependency-free pure functions over plain objects — the
whole pattern ports to any runtime by copying the shape: constants for maxima,
one function per component, one clamp, one explainer reading the components.
The two lessons worth carrying verbatim are the conservative federal-agency
detector (text detectors need documented exclusions before credits) and the
USD-normalization comment (never score money across currencies un-normalized).
