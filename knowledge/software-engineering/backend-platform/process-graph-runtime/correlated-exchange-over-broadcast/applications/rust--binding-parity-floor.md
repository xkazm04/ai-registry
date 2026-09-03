---
layer: application
type: application
subject: correlated-exchange-over-broadcast
technique: binding-parity-floor
stack: rust
status: forged
verified_on: 2026-09-02
verified_against: rust@1.95
---

# Four bindings, three parity levels, one honest table

The dora dataflow runtime implements request/reply, goal/feedback/result and
session/segment/chunk as metadata conventions and says so in the opening
paragraph of `docs/patterns.md`: "No changes to the daemon, coordinator, or
YAML syntax are required — the patterns are implemented as conventions at the
node API level." The keys live in one module,
`libraries/message/src/metadata.rs:245-290` (`REQUEST_ID`, `GOAL_ID`,
`GOAL_STATUS` and the three status values, then `SESSION_ID`, `SEGMENT_ID`,
`SEQ`, `FIN`, `FLUSH`), and every binding that hosts an exchange has to reach
those keys from its own language.

Four bindings reach them to four different depths, which is exactly the
situation the technique's table exists for.

## Where each binding actually stands (commit `bdd1516`)

**Rust — full.** Send helpers (`send_service_request`,
`send_service_response`, `send_stream_chunk`) and the two correlated waits
`recv_service_response` / `recv_action_result` on `EventStream`
(`apis/rust/node/src/event_stream/mod.rs`).

**C++ — full, and documented as a mapping.** `docs/patterns.md:341-354` is
the parity table the technique asks for, mapping each Rust symbol to its C++
counterpart (`recv_service_response`, `goal_status_succeeded()`,
`PatternError` → `DoraPatternStatus`). Its terminal outcome enum at
`apis/c++/node/src/lib.rs:90-119` carries `Matched`, `Timeout`,
`ServerRestarted`, `StreamEnded`, `StreamError` and `InvalidArgument`.

**Python — send half in helpers, read half in raw metadata.**
`apis/python/node/src/lib.rs:507-535` mints the `request_id` and warns if the
caller supplied one; `:549-574` passes it through on the response and warns
when it is missing rather than sending an unmatchable reply. There is **no**
`recv_service_response` or `recv_action_result` in the Python binding, so a
Python client that wants a targeted wait writes the loop, the deadline and the
restart watch itself. The metadata surface on receive does exist —
`event["metadata"]` reaches Python code (`apis/python/operator/src/lib.rs:141`)
— so the gap here is helper parity, not capability.

**C — no metadata surface at all, in either direction.**
`apis/c/node/node_api.h:74` is the whole send API:
`int dora_send_output(void *dora_context, const char *id_ptr, size_t id_len,
const char *data_ptr, size_t data_len)` — payload only. The implementation
confirms it is not an omission in the header but in the binding:
`apis/c/node/src/lib.rs:319-322` calls
`send_output_raw(output_id, Default::default(), …)`, hard-coding empty
parameters. The read side (`read_dora_input_id`, `read_dora_input_data`,
`read_dora_input_timestamp`, `node_api.h:64-71`) exposes no accessor for
metadata either. A C node can be a data producer or consumer in this graph and
cannot participate in any correlated exchange.

## What the tree teaches the technique

**A metadata surface that drops what it does not understand is worse than a
missing one.** `docs/patterns.md:356-358` records the C++ instance: reading
correlation keys off an incoming message requires
`event_as_input_with_metadata`, because the older `event_as_input` "returns the
payload only, which is not enough for the server side of an exchange". Two
accessors, one of which silently discards the identifier the whole pattern
depends on — the server compiles, runs, replies, and nothing matches.

**Name the success variant defensively.** `apis/c++/node/src/lib.rs:97-101`
explains why the success case is `Matched` rather than `None` or `Success`:
X11's `X.h` defines both as macros, so any node pulling in a common GUI or
vision library would fail to compile against the header. The parity floor is
about capability, but shipping a binding is also about the ecosystem it
compiles inside.

## The control-plane half, with both bug classes on the record

`libraries/message/src/daemon_to_coordinator.rs:484-513` carries the typed
reply variants for control mutations, and the doc comments are the incident
report.

`:484-491` — before `AddNodeResult` existed, "the daemon returned `None` and
the coordinator accepted any successful TCP response as proof that AddNode
applied, even a `SetParamResult` or other unrelated reply — committing state
for a node the daemon may have rejected (#1682)." That is the first bug class
exactly: any-reply-as-proof, committing a mutation that was refused.

`:500-505` — `AddMapping` had the same shape with the opposite symptom: the
daemon returned `None`, "which the coordinator's WS layer skipped instead of
forwarding as a reply, causing `send_and_receive` to time out after 30s with
`daemon dispatch failed: timeout waiting for daemon WS reply`." A null reply is
not an uninteresting reply; skipped, it becomes a half-minute stall on a
mutation that succeeded.

The fix in both is the technique's rule made structural: every mutation gets
its own named result variant — `AddNodeResult`, `RestartNodeResult`,
`StopNodeResult`, `RemoveNodeResult`, `ReplaceNodeResult` (`:495-499`,
"the coordinator only commits its descriptor update after matching this exact
variant"), `AddMappingResult`, `RemoveMappingResult`, `SetParamResult`,
`DeleteParamResult` — so a caller matching the wrong one does not compile.

## Where the tree falls short of the standard

The parity table at `docs/patterns.md:341-354` covers C++ only. There is no
per-binding capability table stating the C binding's absence or Python's
missing waits; the opening paragraph's "the patterns are implemented as
conventions at the node API level" reads as universal, and a reader picking a
binding on that basis finds the hole at integration time. The standard's
obligation — publish the level per binding, per half — is met for one binding
out of four.
