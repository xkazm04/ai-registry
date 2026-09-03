---
subject: retry-backoff
domain: software-engineering
last_touched: 2026-09-03
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

## 2026-09-02 - `/intake` portkey-gateway (run `intake-portkey-0902`, intake 2.1.1, Opus workers)

Four amendments from a multi-provider gateway (a vendor repository with no rules page - the yield came from the pipeline code). `circuit-breakers` § "One breaker per candidate: the verdict as a selection input" bounds the existing "Deny wins" rule (N breakers → 1 call) with the 1-breaker-per-candidate case, where all-open degrades to trying, not refusing. `backoff-design` § "When the stated schedule does not fit the budget" reconciles two rules the technique already stated and never collided, and the golden path gains the fifth terminal state (over-budget wait); the stated-schedule rule gains the ordered accept-list for the three spellings of retry-after with two unit systems; the jitter passage gains a counterexample (a fleet-correlating hop shipped with randomization off). `storm-control` gains the fan-in default rule: a component every caller passes through ships with retries off. Source-tree application `node--circuit-breakers`. Peer: pumper independently reached the over-budget rule (`capped_retry_sleep`) and is now the reference the tracklight proposal cites.

## 2026-09-03 - `/intake` kube-rs (run `intake-kube-0903`, intake 2.3.1, Opus workers)

`backoff-design` gains "Sizing the window: it is a period, not a constant" and one `use_when` entry. The reset-after-sustained-health rule already existed (line 82), so the source was a catch there; the landed half is the un-stated one: the stability window is sized against the failure's period, armed by health not by elapsed time, un-jittered, and a ladder wrapped around a stream ends the stream on exhaustion.
