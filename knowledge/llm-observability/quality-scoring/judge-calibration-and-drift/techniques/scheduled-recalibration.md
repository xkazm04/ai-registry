---
layer: technique
type: technique
subject: judge-calibration-and-drift
technique: scheduled-recalibration
status: forged
laws: [the-judge-is-both-untrusted-and-under-test, quality-apparatus-stays-unbudgeted]
shared_with: []
use_when: [a judge is in production and its trust verdict is aging, wiring calibration into cron or CI, detecting provider model updates that silently change the judge]
---

# Scheduled recalibration

The concern: a calibration is a dated claim, and the drift sentinel is the
machinery that re-earns it on a cadence — re-judging the frozen golden set,
comparing against the previous cycle, persisting the result, and failing
loudly when trust degrades. The threats it exists for produce no errors:
the provider updates the model behind a stable name, someone lands a rubric
wording tweak, traffic drifts into territory the judge grades differently.
Without a schedule, the first symptom is downstream — benchmarks that "look
weird" — which is the instrument's failure being discovered through the
measurements it corrupted.

## The cycle

Each cycle is the same four steps, and their order matters:

1. **Read the previous cycle's kappa** from the persisted history (the most
   recent entry under the judge's reserved instrument name).
2. **Re-judge the pinned golden set** — same items, same rubric, same
   thresholds. Concurrency is free to vary; the agreement math must be
   invariant to it, or parallelism has become a hidden method change.
3. **Persist this cycle's agreement** as a first-class score in the quality
   store, which is also what feeds the windowed server-side detector.
4. **Compute the drift verdict** against the previous kappa and report it
   compactly; warnings go to the error stream so schedulers and log
   filters see them without parsing the happy path.

The per-cycle verdict has two trigger levels, and both are needed:

- **Below the bar** → alert: the judge is now untrusted. Fires on the very
  next bad cycle, no warm-up window.
- **Above the bar but dropped sharply** (more than a configured delta,
  ~0.15 kappa, versus the previous cycle) → warning: an early signal
  before trust is actually lost. This is the cheap insurance against
  arriving at the bar with no notice.

The immediate check is deliberately memoryless — one previous point — which
is why it pairs with the windowed detector: a slow slide of small steps
never trips a single-cycle delta, and a windowed trend never fires on day
one. Each covers the other's blind spot.

## Scheduler integration: the exit contract

Run the sentinel one of two ways, and know which failure semantics you are
buying:

- **Single-cycle mode** for external schedulers (cron, CI, an
  orchestrator): run one cycle, exit. Exit code 0 when trusted; a
  *reserved, distinct* non-zero code when the cycle ends untrusted, so the
  scheduler alarms without parsing output — and distinguishable from a
  crash, because "stop trusting the judge" and "fix the pipeline" are
  different pages. Every cycle records a real data point, so the cadence
  should be deliberate (hourly or daily), not "as often as possible" — this
  is not an idempotent poll.
- **Daemon mode** for a long-lived sentinel: loop on an interval, always
  exit 0, and survive transient cycle errors (the store briefly down, one
  unparseable judge response) by logging and continuing. A sentinel that
  dies on the first flaky cycle protects nothing; a scheduler-driven
  single cycle that *hides* an untrusted verdict in a swallowed exit code
  protects less than nothing.

## Cadence and cost

Recalibration spends judge tokens on every cycle, forever. Two rules keep
that honest:

- **The calibration path is unbudgeted.** It is quality apparatus, not
  product traffic: no usage cap may throttle it, and its spend never enters
  product cost accounting. A sentinel that gets rate-limited during a
  traffic spike goes blind at the exact moment the system most needs a
  trusted judge.
- **Cadence follows the volatility of the instrument, not the calendar's
  roundness.** Daily is a sound default for a production judge; tighten
  around known risk events (provider model releases, rubric changes —
  recalibrate *immediately* after either, don't wait for the schedule);
  loosen for a pinned model version with a frozen rubric, where monthly
  re-measurement plus event-triggered runs suffices.

Record the judge's per-cycle cost alongside the agreement metrics — it is
the price of trust, and it belongs in the same history so the "can we
afford a bigger golden set" conversation is had with numbers.

## When not to use this

Do not schedule recalibration for a judge whose scores drive nothing —
measure once when standing it up, then calibrate on promotion to a
consequential role. And do not let the sentinel *replace* event-triggered
recalibration: a schedule catches what changed underneath you; only
discipline catches what you changed yourself, at the moment you change it.
Finally, resist "fixing" a failing sentinel by widening the drift delta or
lowering the bar mid-slide — a threshold moved while it is being
approached is the alarm being unplugged.
