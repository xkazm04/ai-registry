---
subject: workflow-property-contracts
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# workflow-property-contracts

First touch: [[2026-09-02-monai-v2]] via the forge wave over `librarian/handoffs/2026-09-02-monai.md`
(run forge-monai-0903, forge 1.4.0). Class: NEW, `backend-platform/model-workflow-contracts`.

## 2026-09-03 - forged from the handoff

required and optional property sets, wiring-location checks, attribute protocol, dual-implementation parity, contract-driven adapters, mid-iteration event seams; 6 techniques (absorbs the training-loop design decision D7). Upward lessons: unknowable position resolved by matching the consumer by kind; a set marks the workflow uninitialized. Deviation: the required check raises at the first miss instead of returning the list; an unknown name silently becomes a plain attribute. Two source-tree applications (python@3.10, commit 02201b8). Worker's gate: clean for
this subject; director's gate over the wave: bundle integrity OK. No fleet apply row yet -
the subject is in the `/intake apply` backlog.
