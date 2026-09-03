---
subject: self-describing-data-envelopes
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# self-describing-data-envelopes

First touch: [[2026-09-02-monai-v2]] via the forge wave over `librarian/handoffs/2026-09-02-monai.md`
(run forge-monai-0903, forge 1.4.0). Class: NEW, `backend-platform/data-pipeline-semantics`.

## 2026-09-03 - forged from the handoff

a data object carries its frame and operation history inside the value; 6 techniques; boundaries vs reversible-transform-pipelines, deferred-operation-fusion, hash-pinned-translation-pipeline. Upward lessons: batch flag is an OR over operands; sidecar conversions are journaled invertible transforms; a transitional reconciliation names a winner. Deviations: collate drops non-common keys silently, ragged fill is a legitimate value, three dated-out compat calls with no reaper. Two source-tree applications (python@3.10, commit 02201b8). Worker's gate: clean for
this subject; director's gate over the wave: bundle integrity OK. No fleet apply row yet -
the subject is in the `/intake apply` backlog.
