---
layer: application
type: application
subject: streaming-platform-api-custody
technique: event-stream-gaps-not-guesses
stack: rust
status: forged
verified_on: 2026-11-02
verified_against: rust@1.97
---

# Rust: EventSub WebSocket gaps with edges, and a bounded chat ring that reports overflow

Castle Control (local checkout `Spooky/CastleControl`, main @ 8ef2d8e) is a
desktop tool for human Twitch streamers. `cc-twitch` owns the EventSub WebSocket workers;
`cc-core`'s live pipeline consumes chat from them. The workspace pins
`rust-version = "1.97"` (`Cargo.toml:8 "rust-version = "`). Every anchor below was re-opened
on 2026-11-02.

## The constraint the design starts from

`docs/plan/01-analysis.md:84 "Three connections per token, 300 subscriptions per connection, and no replay after a drop."`
Topics are packed before any socket opens and the pack refuses to exceed those limits:
`crates/cc-twitch/src/scopes.rs:188 "if capacity == 0 || capacity > 300 || topics.len() > capacity * 3 {"`,
each group owning its own reconnect loop
(`crates/cc-twitch/src/scopes.rs:186 "Each worker owns one group and its own reconnect loop."`).

## The socket gap

The leading edge is the last frame actually read, and it survives repeated failed attempts:
`crates/cc-twitch/src/eventsub.rs:247 "*from = Some(last_seen);"` and
`crates/cc-twitch/src/eventsub.rs:155 "if from.is_none() {"`. The gap is emitted only once the
new session has finished subscribing, so its trailing edge is the moment coverage returned:
`crates/cc-twitch/src/eventsub.rs:217 "self.emit(BridgeEvent::Gap {"`. The design record names
what it does and does not claim:
`docs/SECURITY.md:181 "timestamps mark missing coverage, not a claim of replay."`

The worker keeps the connection honest on the way. It reads while it subscribes
(`crates/cc-twitch/src/eventsub.rs:178 "Subscribe while reading concurrently: long batches must not starve keepalives."`),
lets one refused topic fail alone
(`crates/cc-twitch/src/eventsub.rs:185 "A permanent refusal of one topic must not stall its siblings."`),
treats a missed keepalive as loss
(`crates/cc-twitch/src/eventsub.rs:301 "EventSub keepalive missed"`), pins the reconnect host
(`crates/cc-twitch/src/eventsub.rs:291 "untrusted EventSub reconnect destination"`), rejects a
notification for a topic it never subscribed
(`crates/cc-twitch/src/eventsub.rs:330 "unexpected EventSub topic"`), and splits revocation by
reason (`crates/cc-twitch/src/eventsub.rs:339 "The login stays valid: only this subscription went away."`).

## The internal overflow gap

Chat reaches the moderation lane through a bounded broadcast ring:
`crates/cc-core/LIVE-PIPELINE.md:85 "A subscriber consumes a bounded broadcast ring (256 chats), with one"`
in-flight verdict, and `crates/cc-core/LIVE-PIPELINE.md:89 "Missing messages get no fabricated verdict."`
The producer never blocks on the classifier:
`crates/cc-core/src/live/mod.rs:54 "The sender never awaits this lane: broadcast retains at most 256 chats"`.
A lagged receiver becomes a gap (`crates/cc-core/src/live/mod.rs:89 "Err(broadcast::error::RecvError::Lagged(_)) => {"`),
and a failed item is a gap, not the end of intake
(`crates/cc-core/src/live/mod.rs:76 "per-item failure is a gap, not the end of intake."`).

**Upward lesson.** The gap's leading edge is the last event the consumer *processed*, not the
time the consumer finished: `crates/cc-core/src/live/mod.rs:85 "Start the gap at the last observed event, not at the"`
later completion time, which "could hide that loss" (line 86). A model call that takes
seconds is exactly when the ring overflows, and stamping the gap at completion would shrink it
to nothing.

## Where the tree falls short

- **A quarantined notification leaves no gap.** An unparseable moderation payload is logged by
  kind and version only (`crates/cc-twitch/src/wire.rs:105 "Kind and version only: the payload may carry viewer text."`),
  which is right, but the frame is then dropped as success
  (`crates/cc-twitch/src/eventsub.rs:343 "Frame::Keepalive | Frame::Quarantined => Ok(()),"`),
  so a consumer counting moderation events has no mark that one was lost. **Deviation.**
- **A skipped topic is a status line, not a gap.** Topics refused at subscribe time are
  joined into a connection status detail
  (`crates/cc-twitch/src/eventsub.rs:225 "EventSub topics unavailable: {}"`) rather than an
  open-ended gap for that event type that downstream ledgers would carry. **Deviation.**
- **Unverified live behaviour.** The parse schemas were written without captured payloads:
  `crates/cc-twitch/README.md:51 "This delivery made no external calls and consulted no online documentation."`
  The gap mechanics are tested against local mock servers only
  (`docs/SECURITY.md:188 "All fixtures are explicitly simulated."`).
