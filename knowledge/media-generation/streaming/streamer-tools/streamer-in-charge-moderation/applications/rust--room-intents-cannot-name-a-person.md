---
layer: application
type: application
subject: streamer-in-charge-moderation
technique: room-intents-cannot-name-a-person
stack: rust
status: forged
verified_on: 2026-11-02
verified_against: rust@1.97.1
---

# Rust: the room governor's type barrier in Castle Control

Castle Control (local checkout `CastleControl`, `main` @ 8ef2d8e) is a desktop toolkit a
human Twitch streamer runs beside OBS. Its `cc-gatehouse` crate contains a room governor
that watches how many distinct viewers are chatting and proposes chat-mode changes as the
room grows. The governor is the cleanest realization in the tree of the rule that
automation addressing the room cannot address a person, because the barrier is the type
system, proved by a doctest that must fail to compile.

## Two vocabularies

Room settings are a closed enum with only room parameters:
`crates/cc-gatehouse/src/governor.rs:16 "/// A room setting, never an action on a viewer. No serialization is provided."`,
`crates/cc-gatehouse/src/governor.rs:18 "pub enum RoomSetting {"`. The intent the governor emits
wraps one of them in a lease, and the doc comment carries the property and its proof:
`crates/cc-gatehouse/src/governor.rs:36 "/// Exhaustively room-only: neither variant can name a person or punitive action."`,
with the `compile_fail` block constructing an `End` that names a user,
`crates/cc-gatehouse/src/governor.rs:45 "// room intents cannot address a viewer"`.
Both variants are covered — `Apply` and `End` — at
`crates/cc-gatehouse/src/governor.rs:49 "pub enum RoomModeIntent {"`. Neither type derives a
serialization, so no payload can be deserialised into one; they are built only from the
governor's state.

Person actions live elsewhere entirely: they are `ActionIntent`s emitted by the final
action gate against a specific message, and a proposal against an account is a
`BanPending` record in the review queue (see the sibling application on the ban window).

## Leases that yield

The governor's settings are leases. A human change marks the lease yielded without
renewing it:
`crates/cc-gatehouse/src/governor.rs:208 "/// The caller must distinguish an observed human change from our own echo."`,
`crates/cc-gatehouse/src/governor.rs:209 "/// Preserve the original expiry; yielding never renews a lease. A late human"`.
At expiry, a yielded lease is an observation, not a command:
`crates/cc-gatehouse/src/governor.rs:37 "/// `End` releases an unyielded lease; it never reverts a human's replacement."`,
and the ledger writer repeats it
(`crates/cc-gatehouse/src/gate/governor.rs:11 "/// ledger chokepoint. Yielded expiry is an observation, never an End command."`).
The state machine must be ticked in silence so leases expire in an empty room
(`crates/cc-gatehouse/src/governor.rs:2 "//! It owns no executor, storage, task or transport. Call `tick` even during silence."`),
and a plan issues each setting once per tier activation
(`crates/cc-gatehouse/src/governor.rs:226 "/// A plan issues each setting once per tier activation, never auto-renewing."`).

## Honest settings state

The chat delay and the platform's Shield Mode are set through a confirm seam that refuses
to remember a state it has not seen confirmed:
`crates/cc-gatehouse/src/gate/settings.rs:9 "/// Applied settings are unknown until confirmation; restart never guesses state."`.
Before dispatch the old state is cleared and the epoch rotated
(`crates/cc-gatehouse/src/gate/settings.rs:43 "/// Rotate the epoch before dispatch so older preparations cannot revive it."`,
`crates/cc-gatehouse/src/gate/settings.rs:58 "self.gate_settings.delay = None;"`).

## Suspicion cannot act

Platform-flagged suspicious or restricted users enter through an intake that cannot reach
the screening batch and cannot emit an action intent:
`crates/cc-gatehouse/src/gate/events.rs:156 "/// Restricted/suspicious messages have a distinct intake that cannot call"`,
`crates/cc-gatehouse/src/gate/events.rs:157 "/// screen_batch or emit an ActionIntent, even when punitive rules are armed."`.
The result reaches the streamer with `intent: None`
(`crates/cc-gatehouse/src/gate/events.rs:178 "intent: None,"`).

## Deviations from the technique

- **No live executor.** On this commit the governor is a simulated audit seam:
  `crates/cc-gatehouse/src/gate/governor.rs:1 "//! Simulated governor audit only: no room executor or viewer action authority."`,
  and the intents are "proposals only, with no live executor or RPC registration"
  (`crates/cc-gatehouse/src/governor.rs:38 "/// These are proposals only, with no live executor or RPC registration."`).
  The type barrier is proved; the executor half of "one executor per vocabulary" is not
  yet built.
- **Echo detection is delegated.** The governor states that the caller must tell a human
  change from the tool's own echo (line 208 above) and does not do it itself; until a live
  caller exists, that distinction is unrealized.
