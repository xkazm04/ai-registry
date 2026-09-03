---
layer: application
type: application
subject: edge-queue-policy
technique: per-edge-depth-and-policy
stack: rust
status: forged
verified_on: 2026-09-02
verified_against: rust@1.95
---

# Per-input `queue_size` and `queue_policy` in a dataflow descriptor

dora (`github:dora-rs/dora`, commit `bdd1516`) declares the queue on the
**input**, in the same YAML block that declares what the input subscribes to,
and the whole policy is two optional fields:

```yaml
sensor_data:
  source: sensor/frames
  queue_size: 10
  queue_policy: drop_oldest
  input_timeout: 5.0
```

`docs/yaml-spec.md:142-167` carries the example and the option table;
`libraries/message/src/config.rs:109-124` is the deserialized shape (`Input`
with `queue_size: Option<usize>`, `queue_policy: Option<QueuePolicy>`,
`input_timeout: Option<f64>`), so an input written in the short form
(`image: camera/frames`) inherits `DEFAULT_QUEUE_SIZE = 10` and
`QueuePolicy::DropOldest` (`config.rs:24-36`).

## What the tree confirms

**Drop-oldest is the declared default**, spelled as `#[default]` on the enum
variant rather than as a fallback in the consuming code — one authority, and a
descriptor that omits the field is a descriptor that chose freshness on
purpose. The alternative is `Backpressure`, and it is the opt-in the technique
describes.

**The clamp is implemented and commented with its incident.**
`QueuePolicy::effective_cap` (`config.rs:38-55`) returns `queue_size.max(1)` for
drop-oldest, and the comment states exactly why zero is not honoured: the
runtime operator channel nulls the just-queued event on every `add_event`, so a
zero cap "would drop 100% of the input's events — the operator never receives a
single message and the dataflow silently hangs. Clamp `queue_size: 0` to 1
(latest-only) instead of turning the input into a dead port."

**Losslessness carries a hard ceiling.** `Backpressure` resolves to
`max(10 × queue_size, 100)` (`config.rs:52`), and both queue layers drop at
that cap with an ERROR log rather than growing:
`apis/rust/node/src/event_stream/scheduler.rs:324-332` and
`binaries/runtime-api/src/channel.rs:147-151`. The floor of 100 exists so a
`queue_size: 1` lossless input is not a 10-slot queue; `config.rs:702`
(`backpressure_cap_has_floor`) is the test.

**The unbounded default was an incident, not a hypothetical.** The March audit
lists it as P13 — "Unbounded per-node event channels — slow receiver causes OOM,
High, `running_dataflow.rs:159`" (`docs/audit-report-2026-03-21.md:164`) — with
the remedy "bounded channel with drop-oldest", closed at capacity 1000
(`docs/sprint-plan-v0.1.1.md:51`).

**Enforcement is per admission, on the pushed input only.**
`channel.rs:100-107` caps after every single push and documents the cadence as
a load-bearing invariant ("`drop_oldest_inputs` relies on this cadence — it only
re-checks the just-pushed input — so exactly one event must be enqueued between
calls"), with `channel.rs:109-119` explaining why the alternative — a per-input
map over every configured input, per message — was rejected.

## Deviations

**`backpressure` does not apply backpressure.** `docs/yaml-spec.md:155` labels
it "Lossless input (blocks sender when full)", and nothing in the tree blocks a
sender on this policy: it is a 10× buffer that drops the oldest at the cap
(`scheduler.rs:322-332`, `channel.rs:147-151`). The three preconditions the
technique asks for before an edge may declare backpressure — deferrable
producer, no coupled sibling output, no cycle — are never evaluated, because
there is no upstream pressure to evaluate them against. The name promises the
producer will slow; the implementation gives a deeper queue and a louder drop.
A consumer reading the spec will size for losslessness and get a 10× freshness
window.

**Two queue layers, one vocabulary, different reporting.** The same `QueuePolicy`
governs the node API's per-input scheduler (`scheduler.rs`) and the operator
runtime's shared deque (`channel.rs`), which is right; but only the first
counts its drops (`scheduler.rs:239-242`). The second logs and forgets, so an
overflow inside the operator runtime is invisible to the drop-accounting
surface the node API exposes.

**Every drop path logs per occurrence.** `scheduler.rs:330` warns on each
discarded event and `channel.rs:164` warns on each drop batch — on a saturated
1 kHz input, that is a second incident layered on the first. The counters exist
precisely so the log does not have to carry the volume.
