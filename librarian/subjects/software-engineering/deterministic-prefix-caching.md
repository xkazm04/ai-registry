---
subject: deterministic-prefix-caching
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# deterministic-prefix-caching

First touch: [[2026-09-02-monai-v2]] via the forge wave over `librarian/handoffs/2026-09-02-monai.md`
(run forge-monai-0903, forge 1.4.0). Class: NEW, `backend-platform/data-pipeline-semantics`.

## 2026-09-03 - forged from the handoff

boundary by capability marker, unknown callable ends the prefix, hash inputs and pipeline, atomic write then move, running-window replacement, enumerate the non-working cases; 6 techniques. Seven upward lessons folded (hash before the head runs, graded head-hash fallback, dedupe by record hash, strip process-local identity, shared store for deferred fill, second copy_cache condition, replacement count derivation). Deviations: head hash off by default; the boundary lambda copy-pasted at five sites; temp file in the system temp dir so the move can be a cross-filesystem copy. Two source-tree applications (python@3.10, commit 02201b8). Worker's gate: clean for
this subject; director's gate over the wave: bundle integrity OK. No fleet apply row yet -
the subject is in the `/intake apply` backlog.
