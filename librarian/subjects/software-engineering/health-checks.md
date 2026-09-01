---
subject: health-checks
domain: software-engineering
last_touched: 2026-08-31
touched_by: intake
dry_streak: 0
---

# health-checks

First touch: [[2026-08-22-7]], external reconcile against `hashicorp/consul`
@ `6c576af` (2.1.0-dev). Gained `go--check-scheduling` (uncovered) - second
stack; single-stack debt cleared. The worker was killed mid-trim by a network
outage; the director finished the trim (134 -> 130) and re-ran the citation
check (~20 probes, all landed).

## Touch log

### 2026-08-31 - `/intake`, amendment only

`three-state-outcomes` gained a per-class section. Source:
[[2026-08-31-genesis-agi]].

The technique was picked as a likely catch and mostly was - it covers the three-valued
verdict more thoroughly than the source did, including the retrofit trap where a legacy
boolean folds "never probed" into "passed". What it did not reach: a check that reports
several **finding classes** has a second axis, and the same collapse reappears on it
invisibly. The check completes, the dependency is reachable, the overall verdict is
honest, and one class was never computed because an enumeration hit a budget - and zero
is the accumulator value a truncated loop already holds. Worse than the per-check
collapse in one respect: a green check at least invites the question of when it last
ran, while a zero inside a green check invites nothing.

Applied against a managed tree's lint ratchet and came back **not-better** - the tree
already implements all three obligations (a distinct cannot-run exit path, refusal to
re-baseline partially "because a partial re-baseline would silently delete the skipped
buckets", and an empty-population assertion before trusting counts), and its findings
ledger draws the same line one level down with a state meaning "absence also happens
when the sensor never ran". Zero edits to reach arm B. That is independent
corroboration from a tree unconnected to the source, not a failed application.

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

## 2026-09-01 - fate recorded for the maturity ladder

Hint fate (from [[2026-08-22-7]] and the application's own close): **confirmed** - probe-on-render designed out, per-target cadence with a single scheduler, expiry as a distinct verdict rather than a frozen last result. Draft orphaned mid-trim; the director ran the ~20-probe citation re-check and every cite landed. Counterpart hashicorp/consul @ 6c576af (2.1.0-dev). Recorded by [[2026-09-01-1]] so the subject meets the `reconciled` definition in [[standard]]; nothing else changed.
