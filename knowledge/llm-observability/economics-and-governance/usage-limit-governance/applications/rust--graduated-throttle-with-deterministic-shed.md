---
layer: application
type: application
subject: usage-limit-governance
technique: graduated-throttle-with-deterministic-shed
stack: rust
status: forged
verified_on: 2026-08-20
---

# Rust: graduated throttle in LightTrack's limits core

LightTrack (a Rust workspace for LLM-traffic observability) implements the
graduated tier in `crates/core/src/limits.rs`, as pure functions over a
`LimitRule` — no store access, so every property is unit-testable.

## The three-tier action model

`LimitAction` (limits.rs:186-208) is `Alert | Throttle | Block`, with the
two capability predicates the technique calls for: `enforces()` (Throttle
and Block) and `sheds()` (Throttle only — "that is what makes it a
different tier from `Block` rather than a synonym for it", limits.rs:203-207).
The doc comment states the honest boundary the golden path insists on: both
enforcing tiers reject at *ingest admission* — "Inline pre-call blocking
still requires the future gateway/proxy mode" (limits.rs:184-185).

## The ramp

`DEFAULT_THROTTLE_START = 0.8` (limits.rs:213) — the last fifth of the
budget is the ramp. `LimitRule::throttle_start()` (limits.rs:444-448)
reuses the rule's `warn_at` when set: "the operator already told us where
'approaching' starts — reusing it avoids a second knob that could
contradict the first". The shed fraction is computed in
`evaluate_with_evidence` (limits.rs:477-484): zero for non-shedding
actions, `1.0` once breached ("reported as 1.0 so the signal is continuous
rather than snapping back to zero"), else linear
`((ratio - start) / (1.0 - start)).clamp(0.0, 1.0)`.

## The deterministic lottery

`shed_ticket(rule_id, event_id)` (limits.rs:222-242) maps the pair to a
stable point in `[0, 1)`. Both implementation rules from the technique
appear as deliberate choices in the code:

- FNV-1a written out by hand "rather than `DefaultHasher` so the mapping
  is pinned to this code, not to a std implementation detail"
  (limits.rs:221) — with a `\x1f` separator between the two ids so
  concatenation ambiguity can't alias tickets.
- A SplitMix64 avalanche finisher because "FNV mixes its low bits well but
  its high ones poorly on short inputs, and we want the *top* 53"
  (limits.rs:233-241); the top 53 bits land on the exactly-representable
  `[0, 1)` grid.

`LimitStatus::sheds()` (limits.rs:379-383) gates the lottery: only before
the threshold (`!self.breached`), only when `shed_fraction > 0`. At the
threshold `rejects_ingest()` (limits.rs:358-360) is the hard stop.

## The two retry hints

`LimitStatus::retry_after_secs()` (limits.rs:388-394): a breach waits per
window (`LimitWindow::retry_after_secs`, limits.rs:150-156 — 30s/300s/900s
for hour/day/month, "deliberately far shorter than the window itself,
because usage leaves the window continuously"); a shed asks for
`1 + ceil(14 × shed_fraction)` seconds — a 1-15s pause growing with
pressure. `Admission::from_statuses` (crates/store/src/lib.rs:358-380)
implements the precedence: the hard stop's hint outranks the shed's.

## The behavioral tests

The property suite (limits.rs:717-814) asserts the technique's claims
directly, named as behaviors:

- `throttle_ramps_where_block_is_a_cliff` — 0 of 400 synthetic events shed
  below and exactly at the ramp start; ~half (150-250/400) at mid-ramp;
  Block sheds nothing anywhere; at the threshold both reject and shedding
  stops being the mechanism.
- `shedding_is_deterministic_and_monotone_so_it_cannot_flap` — the same
  event gets the same verdict 50 times; walking pressure up in 10 steps,
  every previously-shed id stays shed ("nothing is ever un-shed... that is
  what keeps traffic from oscillating as usage creeps up").
- `retry_hint_separates_transient_back_pressure_from_a_hard_wall` — heavier
  shed asks a longer pause; a breach waits window-scaled, hourly < daily.
- `warn_at_doubles_as_the_throttle_ramp_start` and
  `only_throttle_and_block_enforce` pin the knob reuse and the tier
  predicates.

The shed decision itself is made in `evaluate_admission`
(crates/store/src/lib.rs:447-452), where the candidate event is known:
`st.shedding = st.sheds(&ev.id)` — "recorded on the status so the
rejection ledger and the alerts attribute the shed to the right rule".
`shed_fraction` also rides on accepted ingest responses (limits.rs:338-343),
giving cooperative clients the proximity signal before any refusal.
