---
subject: retry-backoff
domain: software-engineering
last_touched: 2026-08-31
touched_by: intake
dry_streak: 0
---

# retry-backoff

First touch: [[2026-08-22-1]], the pilot of the external-reconcile lane — an
application written against a world-class tree outside any consumer repo.

## State

Six techniques, applications now on two stacks: rust (circuit-breakers,
durable-retries, from the consumer repo) and node (storm-control, from
`awslabs/smithy-typescript`). The single-stack debt this subject carried is
cleared; four techniques still have no application on any stack.

## Open leads (banked, with return conditions)

Three candidate upward lessons for the technique layer, observed in the smithy
reconcile but NOT yet applied — each needs a second independent sighting before
it earns a technique edit, per deepen's convergence rule:

- **Success-denominated retry budgets.** storm-control words the aggregate cap
  as "a stated fraction of recent request volume" (a windowed measure); smithy
  implements it with no window at all — the bucket refills only from successes,
  so capacity self-scales to the success stream. If another major tree does the
  same, the technique's wording should admit both denominators.
- **Evidence-gated pacing.** Adaptive send-rate limiting that stays fully OFF
  until the first throttling error — storm control with zero calm-weather cost.
  Candidate addition to the "pace the release" bullet.
- **Bounded trust of server backpressure.** `retry-after` hints honored but
  clamped into `[computed, computed + 5s]` — respects the dependency without
  letting a broken header schedule an unbounded sleep. Belongs to backoff-design
  if it recurs.

## Declines

- Did not stamp `verified_against` on the node application: its contract is a
  stack runtime version, and the truthful pin here is a third-party library
  version + commit, which lives in the application's prose. If external
  reconciles become a standing lane, the profile may want a field for this —
  a proposal for the profile's owner, not a unilateral edit.

## Applied to the technique layer

- 2026-08-22-6: **the deny spelling is judged at the outermost boundary** (sharpening of the existing bullet) applied to `storm-control` ([[2026-08-22-6]]).
- 2026-08-22-8: `storm-control` now cites the promoted `verdict-survives-boundary` law ([[2026-08-22-8]]).

## 2026-08-31 — intake `github:TanStack/query` @ `1566c16d` ([[2026-08-31-tanstack-query]])

Gained `suspension-is-not-failure` + `next--suspension-is-not-failure`
(experiment, better).

**A missing stage, not a contradiction.** "Stopping is a first-class outcome"
names exactly four terminal states and is correct about all four; the ladder
has a fifth state that is *not* terminal — **suspended**, where the schedule
has halted on an unmet precondition, no budget is being spent, and the work is
still alive. Its nearest neighbour is `denied` and they are attributed
oppositely: a breaker judges the **dependency**, a suspension reports the
**caller's own environment**. The golden path's "done" bar was amended to
match.

The second half is the asymmetry: **the predicate that resumes is strictly
stronger than the one that starts**, because starting is user-intent-driven and
resuming is the machine's own initiative.

Measured in `goat`: the tree gets the asymmetry right by configuration and
loses the classification — the retry predicate substring-scans `error.message`
for status codes while the message holds user-facing copy and the status sits
in a typed field it never reads, so it refuses **0 of 17** permanent error
codes. `gate-sees-target`, with the classification it needs already present
one module away.

### Open lead

- **Route the retry predicate through the existing error code.** A few lines,
  it is the whole repair, and the offline code that already exists is the one
  that should map to *suspend* rather than to a failure. Sized and measured;
  ask outstanding.

**Shipped** `goat` `d4995c3`: the predicate now reads the category the error
already carries, offline excluded as a suspension. **0/20 -> 20/20** permanent
codes refused, 0 false positives in either arm, both arms extracted from their
own revision and executed. Still open: nothing counts retries by class, so
`suspended` and `exhausted` remain indistinguishable to an operator.

## 2026-09-01 - fate recorded for the maturity ladder

Hint fate (from [[2026-08-22-1]] and the application's own close): **confirmed** - cross-item budget scoped to the failure domain, refill as a function of successes, jitter everywhere with server hints clamped; one deviation recorded (refusal classification erased at the caller boundary). Counterpart smithy-lang/smithy-typescript @ 6815d3e, @smithy/core 3.33.3. Recorded by [[2026-09-01-1]] so the subject meets the `reconciled` definition in [[standard]]; nothing else changed.
