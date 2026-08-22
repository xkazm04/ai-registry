---
subject: hitl-approval
domain: software-engineering
last_touched: 2026-08-22
dry_streak: 0
---

# hitl-approval

First touch: [[2026-08-22-2]] — the 2026-08-22 harvest wave. Class: EXTENDS.

## State

6 -> 9 techniques, 2 -> 3 applications. **Single-stack debt retired** (was rust-only; now carries a react application).

## Open leads (banked, with return conditions)

- **paired-tables-assert-their-relation** (proposed law, not added). When two tables key off one closed vocabulary and must stand in a fixed relation, the relation belongs in code that runs at load, because no single edit sees both sides. Sightings here, in this bundle's key-parity gates, and in schema-versus-migration parity.
- The worker added a section, "An assertion is only as live as its module", after finding the tree's own load-time invariant assertion never executes — nothing imports its module. Put the check on the side that acts.
