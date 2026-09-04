---
subject: health-checks
domain: software-engineering
last_touched: 2026-09-04
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
## 2026-09-02 - intake [[2026-09-02-sentry-self-hosted]]

Class: EXTENDS. `probe-design` gained "The consuming probe" - the target mints a token, the
probe deletes it; the second principled side effect beside the scratch round-trip. The
missing-stage shape: the proxy table's "process running" row named the hazard for a portless
worker and no section said what the honest probe *is* there. Kept apart from the ownership
heartbeat (`loop-supervision`) explicitly, because a fleet worker holds the ownership half
built correctly and no progress half at all - `rust--probe-design` (simulation, better,
structural-only). 6 -> 6 techniques, 5 -> 6 applications.

## 2026-09-03 - `/intake` kube-rs (run `intake-kube-0903`, intake 2.3.1, Opus workers)

Application `rust--check-scheduling` (the tree's readiness check is an on-event trigger with no cadence). The worker first overwrote `rust--probe-design`, then restored it byte-identically; the director verified an empty diff against HEAD. Two amendment candidates raised, recorded as leads in the source note and not landed: a check keys on minted identity never a name (an event-driven check gets one look), and a wait ships no default deadline when the fulfilling party is external.

Golden path gains "One process, two answers: what a red is allowed to cause": the consumer of a check decides which question it answers (restart on red asks alive, stop traffic on red asks serving), and two independent trees this run (kp's chart probing the root page beside an honest serving endpoint; the control-plane library's one-shot readiness gate) were the two sightings that corroborated it. Links the new `completeness-barrier-with-a-warm-queue` technique.

## 2026-09-04 - `gamedev-res` (intake, `github:Kavex/GameDev-Resources` @ `f7c89aa`)

Amendment to `three-state-outcomes`: **"Remediation semantics differ per state -
and this is the one with teeth"** - plus
`applications/process--three-state-outcomes.md` carrying an A/B.

The technique gave *render* and *retry* their own per-state sections and named
remediation once, in passing, as "a failed verdict without a remedy is half a
verdict". That is the enumeration hunt paying out: the third consequence is the
only one that can destroy something. When the checked population is **content**
rather than infrastructure - a citation list, a curated index, a link graph - the
standard remedy for `failed` is deleting the row, and the row carries judgment no
re-fetch restores. The added rule: a destructive remediation is gated on a
stronger predicate than the display verdict - a definitive 404/410 plus persistence
across runs.

Two sub-sections came with it. **Widening the success class is the wrong fix and
the one teams reach for** - the source moved six refusal codes into `alive` over
twelve years, one commit at a time, each individually reasonable, arriving at
exactly the collapse this technique calls poisonous. And **exemptions are rows too
and need the same reaper** (`creation-names-reaper`): two of that project's nine
exempted hosts match no remaining link, one exempted in 2020 for a service dead
since 2016.

Measured on this registry's own corpus: 172 prose citations, **1 gone, 21
unverifiable, 18 of those 403** - deleting on any non-2xx would remove 22 rows to
retire 1, a 95% false-deletion rate, and it would take out the best-maintained
sources first because bot defence correlates with being a serious publisher.

`dry_streak` reset: this subject last landed 2026-09-03 and landed again here.
