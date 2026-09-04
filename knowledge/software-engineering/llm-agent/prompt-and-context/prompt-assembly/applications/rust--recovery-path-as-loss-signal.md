---
layer: application
type: application
subject: prompt-assembly
technique: recovery-path-as-loss-signal
stack: rust
verified_on: 2026-09-04
verified_against: rust@1.96.1
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A recovery path with no counter, and a saving measured at the transform

An LLM-observability service whose agent-facing tool server resolves an
entity URI to two content items — a rendered document, and the same body as
raw JSON. The raw item switches to an elided form above a size threshold,
replacing each span's recorded prompt and completion with a marker naming
the single-event read tool that fetches them back
(`crates/mcp/src/resources.rs:104-148`). The version witness is the
repository's own `rust-toolchain.toml`, which pins `channel = "1.96.1"` and
is read by every CI job through rustup; nothing here infers a version.

This is the technique's regime with its precondition unusually clean, and
it is a lossy transform **this corpus itself landed** seven weeks earlier
in the same subject. Testing the new technique against it is a test of the
corpus against its own prior work.

## The precondition holds, and the counter does not exist

Recovery is real and explicit. Every span in the payload carries the event
id that a separate read tool takes as its argument, and the marker names
that route in words (`resources.rs:126-134`). The consumer can get the
original back by an action it can still take, which is the whole condition
the technique needs.

Nothing counts how often it does. The server crate carries no counter, no
metric, no telemetry of any kind — by its own module doc it is a thin stdio
client that "never touches the DB" (`crates/mcp/src/main.rs:1-12`). Its one
per-request trace is `eprintln!("-> {method}")` (`main.rs:73`), which
records the JSON-RPC method and not the tool name, so the `resources/read`
that elided and the `tools/call` that recovered from it are the same two
strings in the only log the process keeps. The technique's prediction —
"the signal is already present in every system that provides a recovery
path; it is usually not counted" — holds here without qualification.

## The saving was measured at the transform's own output

The change shipped with a paired test, which is more discipline than most
such changes get, and the boundary is still the transform's own output:

```
assert!(arm_b.len() * 4 < arm_a.len(), ...)          resources.rs:265-270
eprintln!("paired measurement: arm A {} bytes -> arm B {} bytes", ...)
```

`arm_a.len()` and `arm_b.len()` are the serialized strings the function
returns. Re-run today under the pinned toolchain, the test prints
`arm A 206644 bytes -> arm B 43628 bytes (21.1% of A)`. That is the number
in the tree, and it is measured at exactly the point the technique says a
saving must not be measured at.

## The same comparison at the complete unit of work

A harness reimplementing `render_raw_json` and `elide_payloads` byte for
byte, changing no product code. Arm A is the pre-change behaviour: one
resource read, payloads whole, no recovery possible. Arm B is the shipped
behaviour: one elided read, then *k* recoveries, each a full read of the
event resource. Fixture: the crate's own, 200 spans carrying 400-byte
inputs and outputs.

| *k* recoveries | arm B total | % of arm A |
| --- | --- | --- |
| 0 | 43,628 | 21.1% |
| 1 | 44,836 | 21.7% |
| 10 | 55,708 | 27.0% |
| 40 | 91,948 | 44.5% |
| 80 | 140,268 | 67.9% |
| 100 | 164,428 | 79.6% |
| 135 | 206,708 | 100.0% |
| 200 | 285,228 | 138.0% |

Break-even is **135 recoveries out of 200 spans — a recovery rate of
67.5%**. The mid-state is the finding: the arms do not tie at the endpoints
and cross once, and the whole interesting region is the middle. On bytes,
the transform is robust across a very wide band, which the transform-side
measurement could not have told anyone. On **turns** — the other term the
technique's boundary names — arm B is worse from *k* = 1, and each recovery
is a full round trip through a stdio server. Which term dominates depends
on the recovery rate, and the rate is unobserved, so both readings stay
open. The technique's rule that a rate near zero is ambiguous is not even
reachable here: this system has not produced a rate at all.

## The structural fact the tree proves without meaning to

`elide_payloads` walks for a map whose key is `event` and rewrites `input`
and `output` inside it (`resources.rs:122-148`). It is a **shape** test, not
a size test and not a class test. The trace body nests each span's event
under that key; the event body does not — the single-event endpoint returns
the record at the root (`crates/core/src/event.rs:183-241`,
`crates/api/src/events_query.rs:295` returning `Json<LlmEvent>`).

So the elision never fires for the event resource kind, at any size:

| payload per field | compact whole | emitted | over budget | elided |
| --- | --- | --- | --- | --- |
| 4 KB | 8,324 | 8,408 | no | no |
| 20 KB | 40,324 | 40,324 | yes | **no** |
| 500 KB | 1,000,324 | 1,000,324 | yes | **no** |

Two things follow that nobody wrote down. The recovery destination is
unelidable **by construction** — which is correct, and is the only reason
the break-even table above is computable, because a recovery that could
itself be elided would not terminate. And the guard the doc comment
describes as bounding "the raw-JSON content item" (`resources.rs:82-90`,
`:95-97`) is real for exactly one of the three resource kinds it sits in
front of; for the other two it does nothing but switch off pretty-printing.
A one-megabyte response is reachable through a path whose comment says it
is capped.

## Mode, and why not the one above

`experiment`, not `code`. The counters the technique asks for have nowhere
to land: the server holds no state, writes no metrics, and the recovery
arrives as a later JSON-RPC message with no correlation to the read that
provoked it. Neither of the two blocking gates the toolchain file exists to
pin — `cargo fmt --check` and `cargo clippy -D warnings` — can observe a
rate, and no existing metric can either. A `code` arm would have been a
change whose effect nothing in the tree could see, which is the condition
the mode is defined against.

## The instrument that would make the rate observable

Widen `main.rs:73` from `-> {method}` to carry the tool name and, for a
resource read, the URI and whether the elided branch was taken. The
recovery rate is then a grep over the server's own stderr: within one stdio
session, count the single-event reads whose id appeared in a marker emitted
by an earlier elided read. No metrics backend, no schema, one format string.

Its predicate must travel with it. That rate counts **two** of the
technique's five family members — the pointer-follow and the re-run.
Repeated exploration, a narrowed re-search, and simply taking more turns
are invisible from the server side, because the server sees requests and
not the reasoning between them. A rate from this instrument is a floor, and
quoting it as "the recovery rate" would be quoting a different number than
the technique defines.

## What this realization cannot do

It cannot distinguish a low rate from a well-targeted transform, which is
the technique's own two-sidedness and is unresolved here for the ordinary
reason: no push has been run. It cannot price a turn against a byte — the
break-even table is bytes only, and the turn count moves against arm B
immediately, so the two terms disagree over most of the range and nothing
in this tree adjudicates them. It cannot speak to whether the elided
material was *needed*, only to what it would cost to get back. And the
harness is a reimplementation: it is asserted against the crate's live
output on five positive and four negative cases, but it is not the crate,
and a change to the serializer or the walk would silently invalidate it.
