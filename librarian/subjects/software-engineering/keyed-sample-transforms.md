---
subject: keyed-sample-transforms
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# keyed-sample-transforms

First touch: [[2026-09-02-monai-v2]] via the forge wave over `librarian/handoffs/2026-09-02-monai.md`
(run forge-monai-0903, forge 1.4.0). Class: NEW, `backend-platform/data-pipeline-semantics`.

## 2026-09-03 - forged from the handoff

array and keyed dual forms, one draw per sample, pass-through, missing-key policy, multi-sample fan-out, thread-unsafe marking; 6 techniques. Upward lessons: two once-per-sample calls (coin and parameters); a parent never pre-maps a nested chain. Deviation worth an upstream issue: the missing-key override collects targets from flatten(), so a nested chain with different map_items stays strict and the inverse raises. Two source-tree applications (python@3.10, commit 02201b8). Worker's gate: clean for
this subject; director's gate over the wave: bundle integrity OK. No fleet apply row yet -
the subject is in the `/intake apply` backlog.
