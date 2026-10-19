---
layer: application
type: application
subject: live-response-latency-budgeting
technique: fleet-loss-grace-signoff
stack: rust
status: forged
verified_on: 2026-10-19
verified_against: rust@1.97.1
---

# Rust: a fleet watch, one authored line, and an outcome that is not a score

Shadowrunr OS (github.com/xkazm04/shadowrunr @ 4025231) runs its host,
Malakor, as a Rust brain whose every spoken line comes from a model call.
This application reads its fleet-loss policy against the
[fleet-loss-grace-signoff](../techniques/fleet-loss-grace-signoff.md)
technique. The toolchain is pinned in `rust-toolchain.toml` at 1.97.1.

## Loss is a state with its own type

The policy lives in its own module, with the fleet's condition as a
three-valued mode and the watch's answer as a three-valued verdict:

- `crates/shadowrunr-brain/src/fleet.rs:1 "Fleet-loss policy. When the engine fleet is degraded or down"`
- `crates/shadowrunr-brain/src/fleet.rs:25 "SignOff,"`
- `crates/shadowrunr-brain/src/fleet.rs:51 "if mode == FleetMode::Healthy {"`

Confirmed: loss is a named state, not an inference from one call; a healthy
reading resets the clock; and once the watch has signed off it answers `Gone`
on every later beat, so the sign-off plays exactly once
(`crates/shadowrunr-brain/src/fleet.rs:48 "if self.signed_off {"`).

The brain classifies which errors feed the state:
`crates/shadowrunr-brain/src/lib.rs:145 "fn fleet_class(e: &EngineError) -> bool {"`,
matching rate limits, unavailability, timeouts and I/O. Any other engine
error is returned as an error, not counted as fleet loss. **Upward lesson**:
the draft said "a run of failures across every route"; the tree taught that
the failures must be classified first, and the technique now says so. Note
that a timeout counts as a fleet signal here, so a slow live call starts the
clock; the grace window, not the classifier, is what keeps one slow call from
signing off.

The clock starts at the failure, not when the loop next looks:
`crates/shadowrunr-brain/src/lib.rs:674 "The grace clock starts at the failure, not at the next beat."`
**Upward lesson**, now in the technique.

## The sign-off needs no model

The closing line is a constant, voiced as a normal host line and followed by
a sign-off operation carrying the cause:

- `crates/shadowrunr-brain/src/lib.rs:135 "The Lord of the Darkness recalls me to the crypt"`
- `crates/shadowrunr-brain/src/lib.rs:476 "fleet_lost: engine degraded or down for {grace}s"`

Confirmed: authored ahead, in character, frames the end as the character's
world intervening ("recalls me to the crypt ... I shall return"), and costs
no generation call. It is text, not pre-rendered audio, because the tree
generates no media yet.

## The outcome is infrastructure, not content

The simulation harness ends a run that hit the sign-off as an engine failure,
not as a scored stream:
`crates/shadowrunr-sim/src/runner.rs:532 "An engine failure is not a result: the brain's fleet-loss sign-off, or engine errors"`.
Confirmed. The night tournament shows why it matters: an earlier run of the
same tournament lost 98 runs to a provider quota outage that the harness
first recorded as judge "void", and the fix reclassified them as
`judge_pending` / `engine_failed` and re-ran them (night tournament
night-0dd890a1ad, n as stated, 2026-10-18).

## Deviation: the grace window is dead air

The default grace is five minutes:
`crates/shadowrunr-brain/src/lib.rs:121 "fleet_grace_s: 300,"`.
The module comment promises the host "keeps chatting" through it, which holds
while the fleet is merely `Degraded` and calls still succeed. When the core
call fails with a fleet-class error, the beat records the turn, checks the
watch and returns with no spoken line
(`crates/shadowrunr-brain/src/lib.rs:678 "return Ok(ev);"`). There is no
stalling deck anywhere in the brain; stalling lines exist only as a design
note (`docs/research/03-llm-orchestration.md:150 "lines in character"`).
So a `Down` fleet produces up to 300 s of silence before the sign-off, fifteen
times the rubric's 20 s ceiling. The standard stands: the grace window is
bounded by what the stalling deck (or a degraded local lane, which the
research doc proposes and the config declares unavailable in v0.1) can
speak through, and a longer window needs a lane that can talk.
