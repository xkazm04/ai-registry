---
subject: observability-telemetry
domain: software-engineering
last_touched: 2026-08-22
dry_streak: 0
---

# observability-telemetry

First touch: [[2026-08-22-4]], external reconcile against
`getsentry/sentry-javascript` @ `bc57430` (core 10.67.0). Gained
`node--remote-telemetry-economics` — second stack; single-stack debt cleared.
Two hints refuted by evidence (offline transport is a retry wrapper with a
host-supplied store, not crash-record-storage material).

## Open leads (banked, convergence rule applies)

- The budget holder names the class to shed — per-category, over the wire — as
  the preferred realization where the vendor supports it.
- **The drop ledger must not be transported solely by the channel it audits** —
  a local-sink mirror is a first-class requirement.
- Free-tier bookkeeping must not enter the metered ledger (ring rotation is not
  a drop).
- Sampling rate must survive a frozen propagation context, or downstream
  re-derives wrong denominators.

## Cross-subject proposals

- Offline transport (5s→1h backoff, order-preserving replay queue, ledger
  excluded from the store) → a retry/queue home, likely retry-backoff.
- Server-issued per-category deadlines (rate-limit parsing) → retry-backoff as
  the server-directed counterpart to the client-side budget pilot.

## 2026-09-04 - [[2026-09-04-cargo-make]] (intake, run cargomake-0904)

`log-architecture` gained a section under "Levels are a contract": **a level bound to a side effect leaves the vocabulary.**

The source binds its error-level macro to process termination inside the logger's format closure, so emitting an error record and terminating are one act. That looks like maximal enforcement of the level contract and is its deletion: no call site may then emit at error level for a failure the program intends to survive, so every survivable-but-notable event is forced into warn - which this technique reserves for "surprising but survived". The level meaning *a failure reached a door* comes to mean *the process is ending*, and warn absorbs both its own meanings and all of error's. The tell is a population count: warn outnumbering error by an order of magnitude with plain failures among the warns.

The rule: termination is a decision the failure domain makes and travels as a typed outcome, not as a severity string a formatting layer inspects. One authority for "this is fatal" belongs in the error taxonomy, where the classification already lives.

**Unapplied in the fleet, established by search:** every termination site in the three authorized trees is print-then-exit at an explicit call site, and both registry gate helpers accumulate and let the caller decide. The corpus needed the boundary stated; no managed project commits the error.
