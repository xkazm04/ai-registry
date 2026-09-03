---
subject: deferred-operation-fusion
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# deferred-operation-fusion

First touch: [[2026-09-02-monai-v2]] via the forge wave over `librarian/handoffs/2026-09-02-monai.md`
(run forge-monai-0903, forge 1.4.0). Class: NEW, `backend-platform/data-pipeline-semantics`.

## 2026-09-03 - forged from the handoff

algebraic op representation, one flush predicate, data-dependent opt-out, compatibility-break resample, explicit barrier, equivalence oracle; 6 techniques. Upward lessons: requires_current_data is a property of the op as parameterized; the flush predicate logs its branch; per-assertion oracle tolerances. Deviations: the compatibility check is a stub so the mid-chain resample is dead code and overrides are last-entry-wins; array-form crops declare no data dependence while reading voxels. Two source-tree applications (python@3.10, commit 02201b8). Worker's gate: clean for
this subject; director's gate over the wave: bundle integrity OK. No fleet apply row yet -
the subject is in the `/intake apply` backlog.
