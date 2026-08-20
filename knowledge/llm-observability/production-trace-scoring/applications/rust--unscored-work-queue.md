---
layer: application
type: application
subject: production-trace-scoring
technique: unscored-work-queue
stack: rust
status: forged
---

# Rust: the server-side unscored queue in LightTrack's online scorer

LightTrack's per-event online scorer (`crates/runner/src/score.rs`) is a
polling loop that judges recent events with a model judge. Its selection
step is a textbook before/after of the technique — because the "before" is
documented in the code as the incident that forced the change.

## The anti-join it replaced

The comment at `crates/runner/src/score.rs:67-71` records the old design
and its detonation:

> "Ask the server for the unscored work list directly. This replaces the
> old client-side anti-join that fetched the top-1000 scores and skipped
> events found among them — which silently re-judged events (burning paid
> judge calls) once a project passed 1000 scores, and transferred up to
> 1000 full Score rows every interval tick."

Every element of the failure anatomy is here: the horizon (top-1000), the
success-triggered detonation (once a project *passed* 1000 scores), the
invisibility (silently), the double waste (paid judge calls *and* 1000
full verdict rows over the wire per tick, to answer a one-bit membership
question).

## The server-side form

The replacement is one query parameter: `GET /v1/events?unscored=1&limit=N`
(`score.rs:72-76`). The comment states the correctness contract: "The
server scopes the 'already scored' check to exactly the returned page's
event ids, so it stays correct at any scale" — the store still performs an
anti-join, but with the complete verdict set on its side, per page, so no
horizon exists to outgrow.

The loop composes the remaining gates client-side, in the order the
technique prescribes: partition out events with no judgeable content
(`score.rs:78-88` — cheap, in fetch order), judge the eligible set with
bounded concurrency (`parallel_map`, `score.rs:90-93`), then post results
in fetch order so output is deterministic at any `jobs` (`score.rs:55-57`).
Selection policy stays out of the store's query; the store answers only
"not yet scored."

## Idempotency as deployability

Both scorer loops in the crate are shaped so a pass is safe to re-run.
`score_once` returns the number newly scored and can run under `interval=0`
as a one-shot or looped as a daemon (`score.rs:38-52`). The whole-trace
sibling (`crates/runner/src/score_traces.rs:10-13`) states it as the
contract: "The pass is **idempotent**: a trace that already has a
whole-trace score for this rubric is skipped, so a daemon or a cron
`--once` run never double-scores." Its `should_score` gate short-circuits
on `already_scored` before sampling or error overrides
(`score_traces.rs:283-298`), pinned by the test
`already_scored_traces_are_never_rejudged` (`score_traces.rs:316-322`).

The failure-handling split in `score_traces.rs:70-94` completes the
unsupervised-loop posture: a daemon survives transient cycle errors
(logged, continue), a one-shot propagates them so a scheduler step fails
loudly, and a *permanent* incapacity — HTTP 501 `unsupported`, a backend
with no trace surface — terminates the loop with a stated reason instead
of retrying an identical failure every interval.

## Transferable observations

- The dedup lives **before the spend**: the store's unscored predicate
  gates selection, so no judge call is placed for covered work. A write
  constraint would have protected only the record; the money is spent at
  selection time.
- The incident is preserved *at the call site*, in cost terms. The single
  most effective guard against someone reintroducing the client-side
  anti-join is the comment explaining what it cost last time.
- Per-rubric scoping: "already scored" is checked against the judge's
  rubric label throughout (`score_traces.rs:248-260`), so adding a second
  rubric creates a second independent queue rather than starving on the
  first rubric's coverage.
