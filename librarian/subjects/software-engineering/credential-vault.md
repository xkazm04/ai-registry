---
subject: credential-vault
domain: software-engineering
last_touched: 2026-08-22
dry_streak: 0
---

# credential-vault

First touch: [[2026-08-22-5]], external reconcile against `hashicorp/vault`
@ `c3d7264` (2.2.0-beta1). Gained `go--token-refresh-lifecycle` — second stack;
single-stack debt cleared. Second hint refuted with evidence: OSS rotation is
14 lines of constants plus stubs (Enterprise-only), nothing to reconcile.

## Open leads (banked, convergence rule applies)

- The look-ahead exit: refreshing at a threshold is not enough — the SLEEP must
  not be allowed to land past it. Short lifetimes fail without this.
- Clock-skew margin reframed as measured response AGE (issuance-time anchor),
  strictly better than a guessed buffer.
- The terminal state promoted to a persisted, queryable, counted, listable
  first-class state with a bounded re-attempt sweep.
- Renewability refusal as one reasoned predicate — a single vocabulary for
  "why won't this renew".
- Deviation worth its own lead: failure classification that exists server-side
  collapsing to a SUBSTRING CHECK client-side. THIRD SIGHTING of the
  verdict-vocabulary-must-survive-the-boundary family (with wave 1's erased
  refusal enum and wave 2's exemplary reason-labelled counter) — cycle
  candidate alongside fail-closed.
- Orphaned live credential on failed lease registration — the same file
  honors retire-the-failed-acquisition for tokens and skips it for secrets.

## Cross-subject proposals

- Full-width ±50% jitter vs full-jitter [0,t] — a comparative note for
  backoff-design on which jitter shape preserves expected-value schedules.
