---
layer: application
type: application
subject: correlated-exchange-over-broadcast
technique: orphaned-correlation-on-peer-restart
stack: rust
status: forged
verified_on: 2026-09-02
verified_against: rust@1.95
---

# One enum for five ways a correlated wait can end

The dora dataflow runtime states the orphaning problem in its own docs before
it solves it. `docs/patterns.md:279-291` — "the fault tolerance system
(`restart_policy`, `input_timeout`) restarts crashed nodes, but it does **not**
synthesise per-correlation cancellation messages" — then enumerates the
consequences: in-flight `request_id` correlations are orphaned because the
restarted server has no knowledge of pre-crash requests, active `goal_id`
state machines are left non-terminal, and clients never receive `"aborted"` or
`"canceled"` for them. What the daemon *does* emit is
`NodeRestarted { id }` to all downstream nodes, "so clients can use this
signal to fail pending correlations against that server".

That is the technique's whole premise, written by the people who hit it
(`dora-rs/adora#148`), and the tree then builds the endpoint discipline on top.

## The classification is one pure function with its own tests

`apis/rust/node/src/event_stream/mod.rs:1386-1420` defines
`CorrelationOutcome` — `Match`, `ServerRestarted`, `StreamEnded`,
`StreamError`, `Passthrough` — and `classify_correlation_event`, which tries
the caller's predicate first and otherwise maps `Event::NodeRestarted { id }
if id == expected_server` to `ServerRestarted`, `Event::Stop(_)` to
`StreamEnded`, `Event::Error(_)` to `StreamError`, and everything else to
`Passthrough`. The doc comment says why it is a free function: "so the
decision logic can be unit-tested without a live `EventStream`", and the tests
at `:2202` ("pattern-aware correlation classification") do exactly that,
including the case that matters most — a terminal result for `goal-2` seen
during a wait for `goal-1` classifies as `Passthrough`, not as a match.

The peer comparison is per peer, as the standard requires: a restart of a node
other than `expected_server` falls through to `Passthrough` and does not fail
the wait.

## Restarted, timed out and stopping are three different returns

`wait_for_correlation` (`:1281-1352`) turns the classification into
`PatternError::ServerRestarted(_)`, `PatternError::Timeout`,
`PatternError::StreamEnded` and `PatternError::StreamError`, and
`docs/patterns.md:76-92` shows the call site branching on them — `Timeout` to
a fallback path, `ServerRestarted` with the comment "the in-flight request_id
is orphaned; retry against the new instance". The standard's asymmetry
(reissue on restart, back off on timeout) is the tree's documented usage.

The deadline is absolute for the whole wait, not per message: `:1315-1318`
computes `deadline` once and derives `remaining` on each iteration, returning
`Timeout` when it reaches zero. Busy unrelated traffic therefore cannot extend
a wait indefinitely.

## The events that end the wait are still handed to the main loop

`:1331-1350` is where the technique meets the passthrough discipline.
`ServerRestarted` and `StreamEnded` both push the event into
`pending_passthrough` *before* returning the error, so the caller's own event
loop still sees the restart and the stop; only `StreamError` is consumed,
because it is moved into the returned error. Ordinary non-matching events are
buffered and returned to `recv_async` later (`:851-862`).

Two traps the tree names in comments, both of which the standard states as
rules:

- **The livelock** (`:864-876`, `:1321-1324`): the wait pumps
  `recv_from_stream`, never `recv_async`, because the latter drains
  `pending_passthrough` first, "would immediately hand the just-buffered event
  straight back, the classifier would re-buffer it, and the loop would spin on
  the same event forever … until it hit its deadline and wrongly reported a
  timeout (while pinning a CPU core)".
- **The pipelined match already in the buffer** (`:1291-1313`): a reply to
  `req-2` classified non-matching during the wait for `req-1` is invisible to
  the stream pump, so the wait scans `pending_passthrough` first and extracts
  the match in place, preserving the order of the rest. The comment also
  states the report-once rule: only a `Match` is pulled, because a buffered
  `NodeRestarted` "was reported to the caller when it was first seen, so it is
  left for the caller's own event loop rather than re-surfaced here". Integration
  tests for the buffer live at `:2393`.

## Terminal matching, on the action side

`recv_action_result` (`:1242-1275`) is the terminal-status half in one
predicate: match `GOAL_ID` against the needle, then require `GOAL_STATUS` to
be one of `GOAL_STATUS_SUCCEEDED`, `GOAL_STATUS_ABORTED`,
`GOAL_STATUS_CANCELED`. Anything else with the same goal id — feedback — falls
through to the buffer and reaches the caller's loop, which is how a client
observes progress and waits for the end on the same stream.

## Where the tree falls short of the standard

Two gaps, both acknowledged in the tree rather than hidden.

The standard says a wait carries a deadline *and* a restart watch. The tree
provides both only inside the two helpers; a node that hand-rolls its loop
(the alternative shown at `docs/patterns.md:302-315`) gets whatever it writes,
and the Python binding has no helper at all, so every Python client is
hand-rolling. The discipline is available, not enforced.

And `docs/patterns.md:317-319` records the missing half deliberately: "a
future release may add daemon-side synthesis of per-correlation cancellations
so clients without the helpers still get explicit terminal events". The
standard's position is that endpoint-held correlation state cannot be restored
by the transport and the caller must decide — which the tree's helpers do —
so the deferred work is a convenience for clients that skipped the discipline,
not a repair of the mechanism.
