---
layer: application
type: application
subject: correlated-exchange-over-broadcast
technique: passthrough-buffered-wait
stack: rust
status: forged
verified_on: 2026-10-22
verified_against: rust@1.96.1
applied: simulation
ab_verdict: unmeasurable
---

# A sink that is safe because the only event anyone reads is counted at the edge

The Personas desktop app drives a real browser over the DevTools protocol for
its account re-login lane. The client is
`src-tauri/src/engine/login_lane/cdp.rs`: one loopback WebSocket, one
`&mut`-exclusive owner, no reader task. Its module header says so ("Request/response is
driven inline (no reader task)"), and the toolchain witness is the pinned
channel in `rust-toolchain.toml`. The protocol is a textbook correlated exchange over a
broadcast stream: commands carry an `id`, replies echo it, and page events
(`method`, no `id`) arrive on the same socket at any moment.

On a first read `Cdp::call` is the naive helper the technique opens with:
`if v.get("id").and_then(Value::as_u64) != Some(id) { continue; }` throws away
every message that is not the reply. No pending buffer, no replay.

## Seam chosen to falsify

The seam was picked because it could kill the finding. If any caller consumed
an event as a payload, the sink would be silent input loss around a call that
succeeded, and the technique's central warning would be shown at work. A
caught outcome would have taught the exact event kind that is dropped. The
finding did not die: the sink is correct, for a reason the technique did not
state.

## Three real cases walked under policy A (as is) and policy B (buffer and replay)

1. **Navigation that finishes before its own reply.** `goto` takes
   `baseline = load_count()`, calls `Page.navigate`, then `wait_load(baseline)`.
   A cached page can fire its load event before the navigate reply. Inside
   `call` that event is a non-match and is discarded, but `next_message`
   increments `self.loads` at ingress, before the match test, so `wait_load`
   sees `loads > baseline` at once. Under a pure sink with no ingress fold this
   waits out `within` and leans on the `readyState` fallback.
2. **Polling while the page navigates.** `wait_for_text` repeats `evaluate`
   calls. Every load event that lands inside any of them is counted, none is
   replayed, and nothing reads it as a payload. A buffer would hold an event
   with no consumer and grow for the length of the poll.
3. **A reply that arrives after its deadline.** A timed-out `call` leaves its
   reply in flight. The next `call` has a higher id (`next_id` only
   increments) and skips it as a non-match. Identity is unique per exchange, so
   the stale reply cannot resolve the wrong waiter
   ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).

Target: events lost that a caller would have read, 0 found; floor: the
deadline is absolute (`call` computes it once, `next_message` takes the
remaining time), so the wait cannot be stretched by traffic. Held.

## What the tree says about the standard

The technique's rule is "everything not the match is preserved for the main
loop". This tree meets the rule's purpose by a second mechanism: **the only
information the main loop wants from the stream is a fact, so the fact is
folded into state at the transport edge and the events themselves are free to
be dropped.** It is safe on three conditions that the code happens to satisfy
and nothing enforces: the fold runs on the one path every receive uses, the
state is monotonic (a count compared with a baseline, not a flag that can be
cleared), and no caller reads an event body. The technique now carries this as
a boundary case.

## What this application cannot show

No test exercises `Cdp` at all, so none of the three cases is run. The first is
a reading of the order inside `next_message`; the third is a reading of
`next_id`. A loopback fake server that emits a load event ahead of a navigate
reply, with the ingress count removed in the B arm, would measure case 1. The
tree also has one consumer of the stream, so the pipelining scan and nested
waits do not arise here: `&mut` exclusivity makes them unreachable.
