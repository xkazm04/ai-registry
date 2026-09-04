---
subject: accumulate-then-aggregate-metrics
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# accumulate-then-aggregate-metrics

First touch: [[2026-09-02-monai-v2]] via the forge wave over `librarian/handoffs/2026-09-02-monai.md`
(run forge-monai-0903, forge 1.4.0). Class: NEW, `backend-platform/model-workflow-contracts`.

## 2026-09-03 - forged from the handoff

per-iteration buffering, NaN as undefined with a returned count, lazy rank synchronization, reduction-axis vocabulary, detached buffer reads; 5 techniques. Boundary vs metrics-rollups: indexed by time and never ending vs indexed by sample and class over a set that ends. Upward lessons: the writer invalidates the sync cache; the aggregate reads a clone; the composite count has its own predicate. Deviations: a zero-count reduction returns zero not NaN; the handler drops the count; buffer arity not enforced. Two source-tree applications (python@3.10, commit 02201b8). Worker's gate: clean for
this subject; director's gate over the wave: bundle integrity OK. No fleet apply row yet -
the subject is in the `/intake apply` backlog.
