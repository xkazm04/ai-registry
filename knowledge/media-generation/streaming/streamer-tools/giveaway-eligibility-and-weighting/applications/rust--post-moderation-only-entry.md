---
layer: application
type: application
subject: giveaway-eligibility-and-weighting
technique: post-moderation-only-entry
stack: rust
status: forged
verified_on: 2026-11-02
verified_against: rust@1.97
---

# Post-moderation-only entry in Castle Control's `cc-lots` pool

Castle Control is a desktop toolkit a human streamer runs beside Twitch and OBS; its giveaway
module ("Lots") keeps an open entry pool, a `Roll`, until the streamer seals it for a
verifiable draw. Citations were resolved on 2026-11-02 against the main checkout of the
repository (workspace `rust-version = "1.97"`, edition 2024), crate `crates/cc-lots`, with
the live wiring described in `crates/cc-core/LIVE-PIPELINE.md`.

## The passed message is a type with one constructor

The entry intake takes a `PassedMessage`, and the only way to build one is from a moderation
verdict that is `Pass`:

- `crates/cc-lots/src/pool.rs:49` "there is no constructor that skips the verdict check" —
  the payload field is private, so no other module can wrap a raw message.
- `crates/cc-lots/src/pool.rs:59` "pub fn from_verdict(message: MessageFacts, verdict: Verdict)"
  and `crates/cc-lots/src/pool.rs:60` "if verdict != Verdict::Pass {" returning `Error::NotPassed`.
- `crates/cc-lots/src/pool.rs:174` "pub fn intake(&mut self, passed: PassedMessage) -> Intake"
  — the `Roll` has no other method that inserts an entry.

On the live path, the core adds the matching rule from the other side:
`crates/cc-core/LIVE-PIPELINE.md:107` "Only a matching passed decision can mint `PassedMessage`."
Held and barred messages never enter (`crates/cc-core/LIVE-PIPELINE.md:113` "held/barred messages never enter"), and a gap
in the chat stream fabricates nothing (`crates/cc-core/LIVE-PIPELINE.md:89` "Missing messages get no fabricated verdict.").
Sealing closes the door structurally rather than by a flag: `crates/cc-core/LIVE-PIPELINE.md:108` "sealed rolls are absent
from intake", and `crates/cc-lots/src/pool.rs:122` "`seal_roll` consumes it after checking
GuardedDraw" — the open `Roll` is moved into the sealed draw.

## Identity, dedupe and verified attributes

Entries are keyed by `TwitchUserId` in a `BTreeMap` (`crates/cc-lots/src/pool.rs:126`
"entries: BTreeMap<String, Entry>"), and a second qualifying message returns a distinct
result rather than a silent no-op: `crates/cc-lots/src/pool.rs:193` "if self.entries.contains_key(message.user_id.as_str())"
→ `Intake::AlreadyEntered`. The four `Intake` outcomes (`crates/cc-lots/src/pool.rs:115-120`: `Added`,
`AlreadyEntered`, `Ineligible`, `Cooldown`) are what the desktop shows the streamer.

Membership is metadata, never text: `crates/cc-lots/src/pool.rs:16-17` "membership/cohorts must come from
verified metadata, never claims in message text. No monetary units." On the live path,
`crates/cc-core/LIVE-PIPELINE.md:110` "Login and subscription status come from bridge metadata", and what
the bridge cannot supply is not guessed: `crates/cc-core/LIVE-PIPELINE.md:112` "absent evidence grants nothing." The facts
struct's `Debug` prints shape only (`crates/cc-lots/src/pool.rs:32` "Shape only: chat text and cohort names
never reach logs"), which keeps entry diagnostics from becoming a chat transcript.

## Upward lesson: entry follows the verdict in force

`crates/cc-core/LIVE-PIPELINE.md:112` "A shadow `would_act` is a pass" — while a Gatehouse rule is in
shadow (recording, not acting), the messages it would have removed pass and their senders
enter the roll. The technique adopted this as a decision rule: no draw-only stricter gate,
but the configuration screen must say which rules are armed.

## Deviations

- **No removal at the freeze.** The technique removes a viewer banned or timed out between
  entering and the freeze. `Roll` exposes no per-entry removal: the only entry mutator besides
  `intake` is `crates/cc-lots/src/pool.rs:285` "pub fn clear_entries(&mut self)", which empties the whole pool.
  The seal re-filters entries by cooldown (`crates/cc-lots/src/pool.rs:220` "filter(|entry| entry.entered_at <= at && !self.cooling(user, at))"),
  not by moderation state, so a viewer who entered cleanly and was then banned is still in
  the frozen list.

The free path is not a side door: `crates/cc-lots/src/pool.rs:185-186` admits a `!join` message only through
the same `intake`, so the message has already passed moderation before the free path is
even considered.
