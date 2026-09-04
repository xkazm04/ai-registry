---
subject: self-healing
domain: software-engineering
last_touched: 2026-09-04
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

## Applied to the technique layer

- 2026-08-22-6: **a broken gate is a verdict, not a gap** (fail-closed family) applied to `auto-rollback` ([[2026-08-22-6]]).

## 2026-08-29 - intake, two ladders

[[2026-08-29-ai-native-sdlc-and-ci-on-call]]: golden path gained a paragraph under
"The epistemic ladder" - detection is tiered by signal magnitude and is
deterministic by design; healing is tiered by diagnostic confidence; they compose by
minimum. The source's control-band table mapped 3σ straight to "propose", which is
the drift the ladder section already warned about arriving through a different door.
`failure-diagnosis` gained a decision rule: diagnose from the measured, not the
configured (first-party lessons-log entry, n=1, restates "a diagnosis names its
evidence" one stage earlier).

## 2026-09-04 — `/intake` over an appliance firmware (jetkvm)

+3 techniques, +2 applications (`go`, `python`). The subject gained the
configuration all five of its commitments quietly assumed away: **the healer that
cannot outlive the thing it is healing.** Every promotion trigger in
`incident-promotion` — recurrence, futility, rollback, severity, budget trips —
is evaluated by a live healer, and when the healed component is mandatory the
exhaustion of its allowance terminates the healer with it. `retry-backoff`'s
stated destination for an exhausted ladder (dead-letter, operator queue) has
nothing to route into, and the receiver that is guaranteed to exist is the next
incarnation of the process.

`healer-death-as-promotion` (write the promotion before the exit; the audience is
the successor, not an operator), `declared-verdict-over-inferred-wreckage` (match
a declared marker, never reconstruct from the stack trace — the source's
classifier test asserts that a crash naming the component *without* the marker is
diagnostic only), `consume-once-mode-handoff` (a file is not a message: unlink on
read, authenticate by shape, bound the read, keep an out-of-band door).

**Neither prior-art map found this subject.** Twenty mapped terms across a
concern-phrased and a forces-phrased pass; `self-healing` shares a slug with none
of them. It was found by reading the `resilience` category listing in
`taxonomy.json`. That is what moved the run from "new subject" to "technique
triple in an existing subject" and is the run's most reusable lesson.

Applied `code` on a fleet speech service and shipped: its worker-pool give-up was
computed correctly and spelled distinctly in the health body, and the deployment's
liveness probe was a TCP connect that could not observe it — so an exhausted
replica was never replaced. 0/1 → 1/1 correct replacements, 0 false. The gap the
fix does *not* close is banked in the application: the verdict still does not
survive the pod restart, so a deterministically broken model re-spends the full
budget in every new pod.
