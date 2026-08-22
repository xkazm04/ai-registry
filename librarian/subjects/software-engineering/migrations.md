---
subject: migrations
domain: software-engineering
last_touched: 2026-08-22
dry_streak: 0
---

# migrations

First touch: [[2026-08-22-2]], external reconcile against `golang-migrate/migrate`
@ `18966c7` (v4.19.1 era). Gained `go--error-propagation` — second stack; the
single-stack debt is cleared.

## Open leads (banked, convergence rule applies)

- **Persist the verdict, don't just report it** — the dirty flag as a durable
  ledger field beside the version. SECOND SIGHTING already exists (SQLite's
  page-1 journal byte, same wave): first candidate for a technique edit.
- Record the attempted version, not the last-completed one — names what manual
  repair must do.
- Refusal enforced at every advancing entry point (five public verbs, one guard
  each) — one unguarded verb voids the flag.
- Close streams WITH their error — a plain close converts a source failure into
  a valid-looking empty payload and thence a ledger lie.
- Interruption is a fourth outcome ("stopped, work remains"), not success.

## Cross-subject proposals (for owning subjects)

- Pipe/stream boundaries closed with their error → a resilience-side home.
- Nil-by-default library logger = diagnostics not propagated → observability.
