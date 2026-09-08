---
layer: application
type: application
subject: usage-limit-governance
technique: graduated-throttle-with-deterministic-shed
stack: rust
status: forged
verified_on: 2026-09-05
verified_against: rust@1.96
---

# Rust: graduated throttle in LightTrack's limits core

LightTrack (a Rust workspace for LLM-traffic observability; read at commit
`828dfb4`, 2026-09-05, toolchain pinned to 1.96.1 by `rust-toolchain.toml`)
implements the graduated tier in `crates/core/src/limits/` — since the
August read the single `limits.rs` has been split into `rule.rs`
(the rule and its evaluation), `status.rs` (the status, the lottery, the
retry hints), `scope.rs`, `threshold.rs` and `tests.rs` — as pure functions
over a `LimitRule` with no store access, so every property is unit-testable.

## The three-tier action model

`LimitAction` (rule.rs:99-122) is `Alert | Throttle | Block`, with the two
capability predicates the technique calls for: `enforces()` (Throttle and
Block, rule.rs:110-112) and `sheds()` (Throttle only — "that is what makes
it a different tier from `Block` rather than a synonym for it",
rule.rs:114-118). The rule's own doc comment carries the exemption the
golden path insists on: "Tripped by **monitored traffic only** — the
scoring engine is exempt" (rule.rs:126). The August read quoted a comment
here that said inline pre-call blocking "still requires the future
gateway/proxy mode"; that sentence is gone, because the SDKs now take a
client-side seat instead (see the `rust--enforcement-placement-and-
reconciliation` application).

## The ramp

`DEFAULT_THROTTLE_START = 0.8` (rule.rs:121-124) — "the last fifth of the
budget is the ramp". `LimitRule::throttle_start()` (rule.rs:210-218) reuses
the rule's `warn_at` when it is finite and strictly inside `(0, 1)`: "the
operator already told us where 'approaching' starts — reusing it avoids a
second knob that could contradict the first". The shed fraction is computed
in `evaluate_with_evidence` (rule.rs:257-297): zero for non-shedding
actions, `1.0` once breached ("reported as 1.0 so the signal is continuous
rather than snapping back to zero"), else linear
`((ratio - start) / (1.0 - start)).clamp(0.0, 1.0)`. The same function
keeps a breached rule from also being "warning" (rule.rs:284-286).

## The deterministic lottery

`shed_ticket(rule_id, event_id)` (status.rs:22-41) maps the pair to a
stable point in `[0, 1)`. Both implementation rules from the technique
appear as deliberate choices in the code:

- FNV-1a written out by hand "rather than `DefaultHasher` so the mapping
  is pinned to this code, not to a std implementation detail"
  (status.rs:13-14) — with a `\x1f` separator between the two ids
  (status.rs:27) so concatenation ambiguity cannot alias tickets.
- A SplitMix64 avalanche finisher because "FNV mixes its low bits well but
  its high ones poorly on short inputs, and we want the *top* 53"
  (status.rs:33-39); the top 53 bits land on the exactly-representable
  `[0, 1)` grid (status.rs:40).

The function is `pub` for a reason the technique's "pin the hash" rule
predicts but did not spell out: "Public because the SDKs need the server's
own function, not a re-implementation of it... 'would be' is only true if
it is the same arithmetic" (status.rs:16-20). The Rust client calls straight
through; the TypeScript and Python ports are held to the same values by a
`shed_lottery` fixture list in `clients/contract/fixtures/limits.json`.

`LimitStatus::sheds()` (status.rs:166-170) gates the lottery: only before
the threshold (`!self.breached`), only when `shed_fraction > 0`. At the
threshold `rejects_ingest()` (status.rs:135-137) is the hard stop — and it
also fires for an *unpriceable* cost cap, the imputation technique's
degenerate case.

## The two retry hints

`LimitStatus::retry_after_secs()` (status.rs:175-184): a breach waits per
window (`LimitWindow::retry_after_secs`, rule.rs:57-62 — 30s/300s/900s for
hour/day/month, "far shorter than the window itself"); a shed asks for
`1 + ceil(14 × shed_fraction)` seconds — a 1-15s pause growing with
pressure. The unpriceable state now takes the *window-scaled* branch, and
the comment records the defect that motivated it: "It used to fall into
the shed branch and advertise a 1s pause, so a cooperating client hammered
a refusal that could only ever answer the same" (status.rs:176-179) — a
live instance of the technique's warning that conflating the two hints
teaches clients to hammer a wall that will not move.
`Admission::from_statuses` (crates/store/src/lib.rs:489-500) implements the
precedence: "a hard stop outranks a shed, since it is the longer wait".

## The behavioral tests

The property suite (tests.rs:229-345) asserts the technique's claims
directly, named as behaviors:

- `throttle_ramps_where_block_is_a_cliff` (tests.rs:229-262) — 0 of 400
  synthetic events shed below and exactly at the ramp start ("the boundary
  is deterministic, not a coin flip"); 150-250 of 400 at mid-ramp; Block
  sheds nothing anywhere; at the threshold both reject and shedding stops
  being the mechanism.
- `shedding_is_deterministic_and_monotone_so_it_cannot_flap`
  (tests.rs:270-293) — the same event gets the same verdict 50 times;
  walking pressure up in 10 steps over a fixed population of 500 ids, every
  previously-shed id stays shed ("nothing is ever un-shed... walked up to —
  not past — the threshold"). Note the population is fixed: this is the
  technique's monotonicity over re-evaluation, not a claim about a stream
  of fresh ids.
- `retry_hint_separates_transient_back_pressure_from_a_hard_wall`
  (tests.rs:309-326) — heavier shed asks a longer pause; a breach waits
  window-scaled, hourly < daily.
- `warn_at_doubles_as_the_throttle_ramp_start` (tests.rs:296-306),
  `only_throttle_and_block_enforce` (tests.rs:328-333) and
  `rejects_ingest_requires_breach_and_enforcing_action` (tests.rs:335-)
  pin the knob reuse and the tier predicates.

The shed decision itself is made in `evaluate_admission`
(crates/store/src/lib.rs:554-596), where the candidate event is known:
`st.shedding = st.sheds(&ev.id)` (lib.rs:593) — "recorded on the status so
the rejection ledger and the alerts attribute the shed to the right rule".
The proximity signal — `usage_ratio`, `shed_fraction`, the binding rule's
id and scope — rides on every ingest door's response, in the body of
`POST /v1/events` and as `X-LightTrack-*` headers on the batch and OTLP
doors and on the 429 itself (crates/api/src/ingest_proximity.rs:1-17,
44-58), because "a client that batches or exports OTLP therefore had no
way to see the wall coming". Carrying the binding rule's id is what lets
the client run the same lottery: "without the rule's identity a client can
run the same function but never the same decision" (ingest_proximity.rs:
53-57).
