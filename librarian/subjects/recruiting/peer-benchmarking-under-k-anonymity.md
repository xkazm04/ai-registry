---
subject: peer-benchmarking-under-k-anonymity
domain: recruiting
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
---

# peer-benchmarking-under-k-anonymity

First touch by `/deepen`, dispatched by the Curator lane on the scan finding "never swept by the librarian". Registry HEAD at dispatch 2cfe873e. Commits fd8cefda (sources) and 08319b1c (index, catalog).

## 2026-09-29 - the window-bias mechanism named the wrong anchor

**Depth rung:** L2 for the tree (kp at ef5a31a8a read and its org-benchmarks tests run, 6/6); L1 for the statistics (no external lane, no blind lane).

**Corrected:**
- Golden path and all-time technique blamed a window on the completion date, then recommended a start window as the fix. A completion-anchored window can contain a 120-day hire; the survivorship hole is the start-anchored window over completed rows, which is what kp's `created_at` cohort is. Both files now name the anchor; a completion window is the honest fallback where no horizon can be set.
- "A decimal place raises the floor by an order of magnitude" is two orders for a proportion (error falls as the square root of n).
- "The count is the only figure whose disclosure risk is nil" now covers the neighbour that leaks: a pool size at one contributor (kp's `totalEntries: 137` payload, since fixed).
- New decision rule: a newest-first row cap is an unchosen start window; the truncated flag must travel and the all-time caption must not survive it.

**Applications re-read (verified_on 2026-09-29):** every line-number citation had drifted and was replaced by a symbol; the cost-per-applicant deviation was stale (now computed, all-time only). Node applications carry verified_against node@24.

**Verified, left alone:** self-exclusion before the floor, aggregates-only, per-contributor normalisation (kp still resolves each team's own axis), the dominance-check gap (still absent in kp), the below-floor rates coerced to 0.

**Not evaluated:** an external primary for the statistical disclosure control literature (a named dominance rule, differential privacy as the alternative to a floor), a training-data-only lane, kp's floor of 2 teams against the technique's working-room rule. Return condition: a project that adds a dominance check or a windowed benchmark.

## Impact
No project's registry map joins this subject, so no verdict was stale. All twelve maps regenerated and committed locally (bundle digest only), not pushed.
