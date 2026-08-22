---
subject: self-healing
domain: software-engineering
last_touched: 2026-08-22
dry_streak: 0
---

# self-healing

First touch: [[2026-08-22-4]], external reconcile against
`argoproj/argo-rollouts` @ `9f8d111` (VERSION 1.2.0). Gained
`go--auto-rollback` — second stack; single-stack debt cleared. Hint confirmed.

## Open leads (banked, convergence rule applies)

- **Fail closed when the gate itself breaks** — a dying measurement pipeline is
  abort-worthy, not pass-worthy. SECOND SIGHTING already exists (a webhook
  gateway aborting the create on a dedup lock/lookup error, same wave): first
  candidate for the next technique cycle.
- The minimum-volume floor is an API obligation on the framework, not advice to
  the threshold author — the deviation here is "the only place to put the rule
  is the user's query string".
- Measurement-count floors are not event-count floors — passing the letter of a
  threshold rule while missing its intent.
- Cancel the in-flight experiment when the verdict lands — matters wherever the
  gate costs money per probe.

## Cross-subject proposals

- retry/promote/abort/undo as a first-class operator verb set →
  health-checks/remediation-affordances.
- Three-surface loudness (event + notification + phase) → alerting.
- Warm-capacity retention for the failed attempt (abortScaleDownDelaySeconds) →
  retry-backoff's cost model.
