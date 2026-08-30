---
layer: application
type: application
subject: trace-rollup-and-attribution
technique: derived-trace-rollup
stack: rust
status: forged
verified_on: 2026-08-30
verified_against: rust@1.96
---

# Rust: the trace as a pure fold over events (LightTrack)

LightTrack has no `traces` table at all — `docs/DATA_MODEL.md:50-54` states it
as doctrine: "There is **no `traces` table**: the rollup is computed on read
(`core::trace::Trace::from_events`) from the events, and the span tree is
reconstructed from `span_id` / `parent_span_id`."

## The pure fold

The rollup lives in `crates/core/src/trace.rs` as an I/O-free module ("Stores
fetch the events; this turns them into a `Trace`", module doc at lines 1-7).
`Trace::from_events_bounded` (trace.rs:299-334) is the whole procedure:

- sort oldest-first (`events.sort_by_key(|a| a.ts)`) — drives chronological
  child order, first-seen model order, waterfall offsets;
- identity and window taken from the events themselves (trace.rs:306-311);
- duration and status delegated to the shared `TraceShape` (trace.rs:313,
  325-326) — the same rule the list's SQL aggregate path reads, so the two
  views cannot disagree (see trace.rs:35-51);
- one-pass totals in `totals_of` (trace.rs:365-384), counting unpriced spans
  beside the cost sum;
- the span forest built by `build_forest` (trace.rs:400-454).

## Tolerance for malformed input, tested

The "every event appears exactly once" invariant is explicit in the code:
dangling or unset parents become roots (trace.rs:419-430), a self-parent is
excluded from nesting by the `p != i` guard (trace.rs:426), and events
unreachable from any root — parent cycles — are promoted to roots in a final
sweep (trace.rs:445-452) with a `visited` set as the cycle guard
(trace.rs:469). Duplicate `span_id`s render as distinct flagged nodes, with
only the first occurrence owning the id for parent linkage (trace.rs:404-415,
field doc at 213-217). Each rule has a dedicated test:
`dangling_parent_becomes_root`, `cycle_does_not_drop_or_loop`,
`duplicate_span_ids_are_marked_not_silently_doubled` (trace.rs:589-698).

## The bounded read and the honest clip

The store fetches a trace's events oldest-first, capped: `list_by_trace` in
`crates/store/src/sqlite/events.rs:313` fetches one row past the cap —
"cheaper than a COUNT on the overwhelmingly common untruncated trace"
(events.rs:335) — and the API's `MAX_TRACE_SPANS` (5,000, DATA_MODEL.md:65)
feeds `from_events_bounded`, which sets `spans_total` / `spans_logged` /
`spans_truncated` (trace.rs:329-331). When the cap bites, every derived
number covers the retained spans only, and the payload says so
(DATA_MODEL.md:65, `Trace` field docs trace.rs:269-279).

## Shared identity and the refusal path

Both ingest doors canonicalize ids through the one `normalize_trace_ref`
(trace.rs:26-33), called from `normalize_ids` in
`crates/api/src/events.rs:74-80` — the fix for the incident where the OTLP
door lower-cased hex ids and the SDK door didn't, splitting one end-to-end
trace into two. Tenancy is in the query: `list_by_trace` scopes by project
via `idx_events_project_trace` (events.rs:305-334), and DATA_MODEL.md:73-77
draws the conclusion — a colliding id in another project is invisible, and
"asking for someone else's trace is a **404**, not a 403." A backend with no
server-side grouping (the document-store backend) refuses the whole trace
surface with `501 unsupported` rather than an empty page
(DATA_MODEL.md:77-81), branching on the `Store::serves_traces()` capability
flag.

## What the conformance suite pins

The shared suite asserts the parts the technique calls out as drift-prone:
list/detail agreement under the one `TraceShape` rule, the `(ended,
trace_id)` keyset, and the span cap with its truncation signal
(DATA_MODEL.md:77-79) — i.e. it tests the *pair of paths*, not each path
alone.
