---
subject: pre-publish-fillability-forecast
domain: recruiting
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
---

# pre-publish-fillability-forecast

First touch by `/deepen`, dispatched by the Curator lane on the scan finding "never swept by the librarian". Registry HEAD at dispatch 2cfe873e; worked from origin/main f7bb4e05 because the primary checkout was eleven commits behind and carries sibling work in flight.

## 2026-09-29 - a cross-read against the neighbouring subjects found three gaps

**Depth rung:** L1. No web lane, no blind training-data lane, no fleet-tree lane: the applications were not re-opened, so their `verified_on` (2026-08-20) and `verified_against` are untouched. The one outside check was a read of the compensation-banding subject's own pay-transparency text, which cites Directive 2023/970 Art. 5 and the 7 June 2026 deadline; the directive itself was not re-fetched.

**Landed:**
- **Golden path.** New section: the pool is applicants' data reused for a purpose they were not shown, so retention, withdrawal and erasure bind the forecast, and the output is counts and lever attributions, never a named list. The subject said nothing about this.
- **eligible-versus-qualified-distinction, rule 5.** Skipping unknown gates keeps "eligible" honest to the candidate but admits people on a statutory gate (licence, work authorization) nobody verified; the count of those travels beside the eligible number.
- **pay-versus-market-verdict, "when the range is not the offer".** The ceremonial-range escape is narrowing: good-faith ranges in US postings and the EU pre-interview disclosure make the range a commitment in covered markets, and a range widened until the verdict goes silent is the evasive one. Coverage stays with compensation banding.

**Verified, left alone:** single-lever attribution, non-additive deltas, the two denominators, phantom defaults, reuse of the production scorer, the no-apply rule for grounded fields. Read, not attacked with new evidence.

**Not evaluated:** every application against its tree; whether the GDPR purpose-limitation reading holds for a compatible-purpose assessment in a given deployment (the section says the operator decides and records it); any benchmark. Return condition: the applications' clock (2026-11-20 derived, or a change to `winnability.py`), or a project mapping to this subject.

**Not landed:** no new technique.

## Impact

`build-registry-map` was NOT run: the primary checkout was behind and dirty, and the run regenerated only index, rules and catalog in a clean worktree. Per-project stale counts for this subject are therefore unread. Return condition: the next run that regenerates the map.

## Applied

No new technique and no flipped golden-path rule, so no `applied.md` row is owed.
