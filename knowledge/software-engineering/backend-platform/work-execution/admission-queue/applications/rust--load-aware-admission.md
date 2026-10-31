---
layer: application
type: application
subject: admission-queue
technique: load-aware-admission
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.96
---

# Load-aware admission in the Personas resource governor

`src-tauri/src/engine/resource_governor.rs` is a 73-line implementation of
the technique's whole core — per-signal asymmetric thresholds, hysteresis,
first-sample honesty, defer-never-disturb — with the rationale written
into the module doc rather than left as folklore. It is worth reading as a
minimal reference implementation, and its two gaps are as instructive as
its virtues.

## Defer new, never disturb running

The module doc states the prime directive verbatim: "Running executions
are NEVER interrupted — only NEW admissions defer to the per-persona
queues, draining as load recovers" (`:10-11`). The gate is a single
boolean on the tracker (`set_resource_throttled`,
`src-tauri/engine/src/queue.rs:312-314`), consulted at *both* promotion
doors — fresh admission (`admit`, `:455`) and queue drain (`drain_next`
`:604`, `drain_next_global` `:675`) — so pressure holds new work in the
queues without touching anything in flight. The queue absorbs the
deferral exactly as the technique describes; if pressure persists, the
per-persona depth bound eventually refuses with `QueueFull`.

## Asymmetric thresholds, with the rationale attached

Four constants (`:27-33`): CPU pauses at **70%** and resumes below
**55%**; memory pauses at **85%** and resumes below **70%**. The module
doc carries the per-signal meaning argument (`:13-16`): high RAM
occupancy is often healthy cache warmth while the OOM kill lives near
95%, so memory's bar is *higher* than CPU's, whose spikes are transient.
This is the technique's "thresholds are per-signal, chosen from what each
signal implies" — implemented as named constants with the why beside
them, not one global pressure percent.

Re-checked 2026-10-31 at personas@22260d77c9: the memory pair is now **90%**
pause / **88%** resume (`:31-33`), raised in `0050e97c7e` (2026-09-26) as
"operator-directed tuning" for a dev box sitting at ~87% used RAM, whose
message says to "revert to 85/70 for a normal machine". The constants still
carry the per-signal rationale, but the module doc (`:13-16`) still argues from
the 70% mark, and a machine-specific tuning now lives in shared source with its
revert instruction only in a commit message.

## Hysteresis, in both directions

The loop (`:50-56`) pauses when **either** signal exceeds its pause
watermark, and resumes only when **both** fall below their *resume*
watermarks — a 15-point gap on both signals (2 points on memory since the
90/88 retune noted above), plus the conservative
both-must-clear rule on reopen. The 3-second sampling cadence (`:35`) is
deliberately cheap ("no process enumeration"), and the reading is shared
by all admission decisions in the window via the tracker flag — the probe
never runs per-request.

## Probe honesty: one virtue, two gaps

- **Virtue** — the first sample carries no valid CPU delta, and the loop
  skips it rather than acting on a bogus 0% reading (`:46-49`). The
  technique's warm-up rule, exactly.
- **Gap 1 — a silent probe freezes the gate silently.** `continue` on an
  invalid sample keeps the *previous* gate state with no announcement. One
  bad sample is warm-up; a sampler that never becomes valid would leave
  the gate frozen forever, and "could not measure" is indistinguishable
  from "measured healthy" — the fail-open posture is real but implicit,
  never stated or logged, which is the half of the technique's
  probe-failure rule ("the choice is made once, stated in the gate") this
  file skips.
- **Gap 2 — transitions are visible, duration is not.** Every gate flip
  logs both readings and the direction (`:57-71`), and the tracker exposes
  `resource_throttled()` for UI (`queue.rs:318-320`) — but that accessor
  is marked dead code, and nothing alarms on time-in-state. A gate closed
  for a day (the capacity problem wearing a safety feature's uniform) and
  a gate closed for a minute look identical to every consumer that isn't
  tailing logs.

## The composition seam

The governor deliberately mirrors the tracker's *other* environmental
gate: the module doc says it "mirrors the tracker's existing
`quota_cooldown` admission gate, but driven by system load instead of the
AI provider's rate limit" (`:6-8`). Both gates report into the same
admission verdict (`AdmitResult`), and the admit path logs *which* gate
held (`queue.rs:461-468`) — the one-gate-one-vocabulary composition the
subject's vocabulary technique prescribes, with the governor as one voice
in it rather than a second door.
