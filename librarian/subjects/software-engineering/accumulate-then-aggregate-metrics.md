---
subject: accumulate-then-aggregate-metrics
domain: software-engineering
last_touched: 2026-10-22
dry_streak: 0
---

# accumulate-then-aggregate-metrics

First touch: [[2026-09-02-monai-v2]] via the forge wave over `librarian/handoffs/2026-09-02-monai.md`
(run forge-monai-0903, forge 1.4.0). Class: NEW, `backend-platform/model-workflow-contracts`.

## 2026-09-03 - forged from the handoff

per-iteration buffering, NaN as undefined with a returned count, lazy rank synchronization, reduction-axis vocabulary, detached buffer reads; 5 techniques. Boundary vs metrics-rollups: indexed by time and never ending vs indexed by sample and class over a set that ends. Upward lessons: the writer invalidates the sync cache; the aggregate reads a clone; the composite count has its own predicate. Deviations: a zero-count reduction returns zero not NaN; the handler drops the count; buffer arity not enforced. Two source-tree applications (python@3.10, commit 02201b8). Worker's gate: clean for
this subject; director's gate over the wave: bundle integrity OK. No fleet apply row yet -
the subject is in the `/intake apply` backlog.

## 2026-10-22 - detached-buffer-reads applied (run intake-apply-dbr-1022)

Dispatched by Curator for the scan's "single stack (python)". First fleet code row and
first non-python application: `react--detached-buffer-reads`, against the IPC timing ring
in personas. That is the first long-lived metric accumulator found in the fleet; the
10-14 pass found only snapshot functions. The read door already copied the array, but
the rows were shared objects. A paired test went from 3/3 outside writes reaching the
ring to 0/3 after freezing a private copy at append. The floor of 170 suite tests and
tsc held, and the change was pushed (personas b7bbe8c35d). Banked boundary, not landed
in the technique because it scores below the amendment threshold on one tree: in a stack
whose rows are references, a container clone is not a value clone, so "every read
returns a clone" can pass review and still hand out storage. Return condition: a second
tree with object rows behind a copied array, or a review that grades a shallow copy as
conformant.
