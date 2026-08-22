---
subject: webhook-ingestion
domain: software-engineering
last_touched: 2026-08-22
dry_streak: 0
---

# webhook-ingestion

First touch: [[2026-08-22-4]], external reconcile against `frain-dev/convoy`
@ `2b60cc6` (v26.6.6). Gained `go--duplicate-and-replay-dedup` — second stack;
single-stack debt cleared. Hint held.

## Open leads (banked, convergence rule applies)

- The dedup namespace component must be an immutable identifier, never a
  display name — a rename re-partitions dedup memory.
- Two dedup predicates over one identity is a named hazard; one predicate per
  identity, or an explicit per-path pairing rule.
- Two-tier check: a cheap advisory fast path explicitly non-authoritative,
  plus the authoritative claim inside the write transaction. (Fail-closed half
  is the SECOND SIGHTING of the gate-fails-closed lead — see self-healing.)
- Dedup memory bound and data retention must be independent knobs — enabling
  retention silently shortened a security window here.
- Duplicate absorption must not increment the success counter without a
  duplicate counter beside it.

## Cross-subject proposals

- Any pre-authentication body read is bound by the same size cap as the main
  read (the 32 MB multipart hole beside a 50 KB policy) → payload-bounds.
- A stage consuming the body before verification must restore it
  byte-identically → payload-bounds / sender-authentication.
- Provider-specific verifiers frequently ship without a timestamp window; the
  receiver adds it → sender-authentication.
