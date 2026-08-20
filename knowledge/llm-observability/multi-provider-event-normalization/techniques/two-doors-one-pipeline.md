---
layer: technique
type: technique
subject: multi-provider-event-normalization
technique: two-doors-one-pipeline
status: forged
laws: [server-owns-the-accounting-clock]
shared_with: []
use_when: [adding a second ingestion format to an existing pipeline, deciding where validation and pricing live, reviewing an ingest architecture for accounting drift]
---

# Two doors, one pipeline

Offer multiple ingestion endpoints — as many as adoption requires — but let
each one be a *pure mapper* onto the single internal event model, and route
every mapped event through one shared downstream pipeline. The doors differ
in wire format; nothing else about an event's life may depend on which door
it entered through.

## The shape

A typical operator needs at least two doors:

1. **A native JSON endpoint** — the default. A small client wrapper per
   language records model, usage, latency, and status around each provider
   call and posts an event. Lowest sender effort, highest shape control.
2. **A standard-telemetry endpoint** — accepts span exports in the
   vendor-neutral telemetry standard's generative-AI conventions. An app
   already instrumented needs no new SDK, only an exporter endpoint. This is
   the anti-lock-in lever: it trades shape control for adoption.

The second door's *entire* job is mapping spans to events. The mapped events
then join the first door's traffic in the identical batch handler, so
validation, redaction, pricing, and limit admission are one code path with
one behavior. This is the invariant to defend in review: **a door may
translate; it may never adjudicate.**

## Why the invariant is load-bearing

Every responsibility that leaks into a door gets duplicated per door, and
duplicated logic drifts:

- **Two validators disagree** — one door accepts an event the other rejects,
  and the difference is invisible until a customer asks why their two
  services show different acceptance rates.
- **Two pricing paths disagree** — the same call costed differently by entry
  route is an invoice dispute waiting for discovery.
- **Two admission checks disagree** — a usage cap enforced at one door and
  not the other is a cap a sender can route around, which is no cap.
- **Clock discipline fractures.** Spans arrive carrying sender-side start
  times, which are correct input for latency computation and poison for
  windowed accounting. When re-stamping receipt time lives in the shared
  pipeline, every door inherits it; when it lives in a door, the next door
  forgets it. The server's clock must be stamped once, centrally, for all
  doors alike.

## Decision rules

- **When asked to add a format, add a mapper, not a pipeline.** The new
  door's output type is the existing internal event; its code contains no
  calls into pricing, storage, or limits.
- **When a door needs door-specific policy** (e.g. the telemetry door
  refuses non-LLM spans; the native door has no such concept), keep the
  policy inside the mapping decision — accept/refuse/translate — never as a
  divergent version of a shared stage.
- **When a shared rule exists, call the shared function.** Canonicalizing a
  trace reference, normalizing an id, scrubbing a payload: one function,
  imported by every door. Two services in one end-to-end trace, entering by
  different doors, must land on the identical trace id — a re-implemented
  "equivalent" canonicalizer that differs on case splits the trace in half.
- **Scope each door narrowly and say so.** Accepting one signal type over
  one transport (e.g. traces over HTTP JSON, not the binary protocol, not
  metrics or logs) is a legitimate v1 the documentation states plainly; a
  door that half-supports a transport fails senders silently.

## When not to use it

If there is genuinely one sender population with one shape — an internal
tool ingesting only its own wrapper's events — a second door is speculative
surface area; add it when the second population exists. And the technique
does not license unlimited doors: each door is a mapper you must keep
current against its format's churn, so every door needs an adoption case
that pays for its maintenance.
