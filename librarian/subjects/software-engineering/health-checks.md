---
subject: health-checks
domain: software-engineering
last_touched: 2026-08-22
touched_by: external-reconcile
dry_streak: 0
---

# health-checks

First touch: [[2026-08-22-7]], external reconcile against `hashicorp/consul`
@ `6c576af` (2.1.0-dev). Gained `go--check-scheduling` (uncovered) - second
stack; single-stack debt cleared. The worker was killed mid-trim by a network
outage; the director finished the trim (134 -> 130) and re-ran the citation
check (~20 probes, all landed).

## Open leads (banked, convergence rule applies)

- Probe-on-render designed OUT structurally (readers cannot trigger probes;
  cost is a function of registration, not observation) - stronger than the
  technique's discipline framing.
- A minimum interval clamped UPWARD with a warning instead of rejected - an
  impossible cadence yields a logged correction, not a dead check.
- Staleness rendered in the OUTPUT field when the status vocabulary has no
  third state to spend ("TTL expired, last output before timeout follows").
- Damping counters that start AT their thresholds so the first verdict is
  never delayed, and reset each other so they count consecutive outcomes.
- Deviation lead: interval-driven checks never back off - only the on-event
  runner does; the trade is defensible and silent.
