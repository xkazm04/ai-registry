---
layer: application
type: application
subject: audience-absorption-at-scale
technique: room-scaled-rate-caps
stack: rust
status: forged
verified_on: 2026-10-19
verified_against: rust@1.97.1
---

# The flood cap that gagged a three-person room

*Verified against Shadowrunr OS, an AI-hosted villain livestream (github.com/xkazm04/shadowrunr,
branch main, commit `4025231`), on 2026-10-19. The workspace pins its toolchain in
`rust-toolchain.toml` (channel 1.97.1).*

The technique says: every per-viewer rate bound — messages admitted at the input as well as
answers given at the picker — must scale with room size, loosen only for messages addressed
to the host, stay monotone and continuous at the small-room boundary, log what it drops,
and leave first contacts, unanswered sincere questions and safety-critical messages to their
own exemptions. The show's input filter, which runs before the chat picker on every
5-second tick, is where the tree learned the input half of that rule.

## The doctrine it serves

The research that shaped the picker states the size rule in one line:
`docs/research/05-chat-patterns.md:233 "The picker's job changes with size: answer everyone at 3, choose at 30, aggregate at 300."`
The calibration behind it keys size to chatters rather than viewers, with the chatting share
falling from a third at three viewers (`sim/calibration.json:265 "chatting_share"`, value 0.34) to
0.15 at thirty and 0.08 at three hundred. The doctrine's cap rule for busy rooms is
`docs/research/06-moderation-and-monetisation.md:419 "At most one pick per viewer per 60 s at 30+ CCV"`.

## The scaled cap

The filter's base is six messages per viewer per rolling minute, moderators exempt, and a
room of at most five distinct chatters in the last minute counts as small. The scaling rule
is documented beside the function:
`crates/shadowrunr-brain/src/moderation.rs:637-638 "and the message is addressed to the character"`,
"`B * (S + 2 - A)`", which with the defaults gives
`crates/shadowrunr-brain/src/moderation.rs:640 "36, 30, 24, 18, 12 for 1..=5 chatters"`
and meets the base of 6 exactly at the boundary. The incident that motivated it is recorded
on the next line: the lenient cap sits "above the 16 a minute the weary run's featured
chatter peaked at in a 3-chatter room"
(`crates/shadowrunr-brain/src/moderation.rs:640 "above the 16 a minute the weary run's featured"`).
A simulated show had a single engaged viewer conversing with the host at up to 16 messages a
minute, and a busy-room cap of 6 discarded most of the conversation. That is the upward
lesson the technique's opening section carries: the constant cap's small-room failure is
silent, and a real conversation at that size runs far above any flood threshold.

The leniency is gated on address. A message is addressed when it names the character or is
a real question
(`crates/shadowrunr-brain/src/moderation.rs:701-702 "pub fn is_addressed(text: &str, names: &[String]) -> bool {"`),
and the unit test pins the whole shape, monotone and continuous, and flat for everything
unaddressed at every size up to 300:
`crates/shadowrunr-brain/src/moderation.rs:2104 "assert_eq!(caps, [36, 30, 24, 18, 12, 6, 6]);"`.

## Exemptions and the drop log

The cap's call site lists what bypasses it: "Gifts and subs, a viewer's first message and a
sincere question from a viewer not answered lately are exempt"
(`crates/shadowrunr-brain/src/moderation.rs:936-937 "Gifts and subs, a viewer's first message and a sincere"`).
Two of the three exemptions are incident lessons, each pinned by a test. A top-rank viewer's
gift of five subscriptions was dropped by the cap
(`crates/shadowrunr-brain/src/moderation.rs:1724 "a Dread Council gift of five subs was dropped by the cap"`),
so the thank-you never happened. And a viewer asking
`crates/shadowrunr-brain/src/moderation.rs:1792 "is malakor an ai or a real guy?"` was cut
off the same way, so a repeated sincere question now passes until the viewer is answered. Safety-critical disclosures skip the cap entirely, ahead
of every other stage. Every drop and every exempt pass is emitted as a moderation event with
its reason (`dropped` or `exempt:<why>`), which is how the gag above became visible.

## Deviations

- The scaling covers only the input flood cap. The picker's answer cap (two of the last five
  beats, plus one for the top ranks) does not loosen as the room shrinks, though in practice
  the picker's fill-from-deferred rule keeps a lone viewer answered.
- The doctrine's busy-room answer cap is one pick per viewer per 60 s; the picker allows
  two of the last five beats, about two per 25 s. Code and doctrine disagree, and neither
  number has a measurement behind it.
- The base cap of 6 and the small-room size of 5 are hand-set constants with one observed
  peak behind them; the technique asks for the measured peak and answer concentration at
  several sizes before they are trusted.
