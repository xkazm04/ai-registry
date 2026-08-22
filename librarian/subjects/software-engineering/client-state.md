---
subject: client-state
domain: software-engineering
last_touched: 2026-08-22
dry_streak: 0
---

# client-state

First touch: [[2026-08-22-4]] — the 2026-08-22 harvest wave. Class: EXTENDS.

## State

6 -> 9 techniques, 2 -> 3 applications. Merged from FOUR independent scout proposals across four territories. One additive forward-pointer was added to an existing technique so the new write-path technique and the existing read-path guard do not read as rival owners.

## Open leads (banked, with return conditions)

- **the safe default is the failure you can see** (proposed law, not added). FIVE independent recurrences claimed, two of them in EXISTING techniques of this same subject (`persistence-and-migration`, `invalidation-strategy`). Tied with guard-failure-is-not-consent as the wave's best-evidenced proposal.

## Declines

- No application was written for `optimistic-write-path`. The source tree's entire optimistic-write API — mutex, compare-and-swap predicate, rollback — has zero call sites; the repo's own harness notes say so. Excellent material for a technique, but an application is a claim that a real stack realizes it in production, and unwired code is not that. The one place it is cited says plainly that it is unreferenced.
