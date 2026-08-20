---
layer: technique
type: technique
subject: llm-call-telemetry-model
technique: ingest-skew-rejection
status: forged
laws: [server-owns-the-accounting-clock]
shared_with: []
use_when: [bounding how wrong a client-reported timestamp may be, choosing skew tolerances for an ingest API, deciding whether backfilled or buffered traffic should be admitted]
---

# Ingest skew rejection

Client event time is client-owned — but not unboundedly. An event whose
reported time sits so far from server "now" that every time-ordered read
over it becomes fiction is rejected at ingest, with a stable machine
code (`ts_too_old` / `ts_too_new` by convention) and an HTTP-level refusal.
This is a **data-quality** check, not a security one: once accounting
windows key on server receipt time ([dual-clock-event-time](./dual-clock-event-time.md)),
a wrong client clock can no longer corrupt budgets — but it can still
scatter garbage across trace views, listings, and `since`/`until` windows
where humans will debug against it. The check exists, and is on by default,
*even though* enforcement no longer depends on it.

## The bounds are asymmetric, on purpose

The two directions of skew have different legitimate populations, so one
symmetric tolerance is the wrong shape:

- **Future: tight** — on the order of minutes (a 5-minute default is
  conventional). No legitimate emitter reports a call that has not happened;
  the only honest population in the future is ordinary NTP drift, and the
  tolerance should cover that and nothing else. A future timestamp beyond
  it is almost always a misconfigured clock, and admitting it plants events
  where no time-range query will find them until the calendar catches up.
- **Past: generous** — on the order of days (a 7-day default is
  conventional). The past has real, honest populations: offline-buffered
  SDK retries, batch backfills, mobile emitters that upload when they
  reconnect. The past bound rules out *nonsense* (a timestamp a decade off,
  an epoch-zero default), not lateness. Setting it tight silently drops the
  exact traffic — flaky-network clients — whose telemetry you most need.

The decision rule for tuning either bound: ask which honest emitter the
bound would reject. If the answer is "none", tighten; if you cannot answer,
you have no basis to reject and the bound stays generous.

## Rejection mechanics

- **Reject the event, not the batch.** The batch path records a per-item
  code; one skewed row must not fail its ninety-nine well-formed siblings.
  The single-event path maps the same code to the matching HTTP error. One
  code taxonomy across both surfaces — two front doors that phrase
  rejections differently will drift.
- **Codes are contract, prose is not.** Emitters and dashboards branch on
  the code; the human message may be reworded at any time and must never
  be parsed.
- **Count what you refuse.** Every rejection lands in a rejection ledger
  the operator can see. A rising `ts_too_new` rate is a fleet clock
  problem; a rising `ts_too_old` rate may mean the past bound is starving
  a legitimate buffering pattern. Silent rejection converts a client-side
  bug into unexplained missing data — the most expensive symptom in
  telemetry.
- **Configurable, testable, on by default.** Bounds come from configuration
  with the defaults above; an explicit zero disables the check for
  deliberate historical imports. The policy is resolved once at startup but
  every rule is a pure function of (event, now), unit-testable without an
  environment.

## What it is not

It is not clamping — a skewed timestamp is refused, never silently
rewritten to the nearest bound, because a clamped value looks like a
measurement and lies about ordering. It is not validation of receipt time,
which the server stamps and needs no bounds on. And it is not a substitute
for the dual-clock split: bounding client time to ±minutes and then keying
budgets on it anyway re-creates the corruption at a smaller amplitude —
skew inside the window is still spend sliding between accounting periods
under client control.
