---
layer: application
type: application
subject: audience-absorption-at-scale
technique: raid-group-greeting
stack: rust
status: forged
verified_on: 2026-10-31
verified_against: rust@1.97.1
applied: code
ab_verdict: not-better
proof: ab-paired
---

# The raid minute that a longer flag could not give back

*Verified against Shadowrunr OS, an AI-hosted villain livestream (github.com/xkazm04/shadowrunr,
branch main, commit `917629d`, pushed), on 2026-10-31. The workspace pins its toolchain in
`rust-toolchain.toml` (channel 1.97.1), and the run built and tested with that toolchain.*

Step 4 of the technique asks for raiders to stay a group for about a minute: no raider is
boosted as an individual newcomer, and the greeting answers all of them. The tree already
removed the first-contact boost from raiders, but only inside the one beat that looked like
a raid. This run tested whether holding that suppression for a whole minute would give the
room its slots back. It did not, and the replay showed why.

## The seam

The pick context's raid flag is per beat:
`crates/shadowrunr-brain/src/lib.rs:1221 "raid: self.orch.is_raid(),"`. That flag is true
only when one 5-second beat holds five first contacts. The orchestrator already recognises
a raid spread over several beats for its greeting
(`crates/shadowrunr-brain/src/orchestrate/mod.rs:222 "pub const RAID_WINDOW_MS: i64 = 20_000;"`,
`crates/shadowrunr-brain/src/orchestrate/mod.rs:872 "if raid || arrived >= RAID_FIRST_CONTACTS {"`).
The picker never saw that wider window. A raider who spoke in the second beat of a spread
raid, or a minute later, kept the full boost.

## The paired proof

**Instrument.** `crates/shadowrunr-sim/src/runner.rs:1800 "async fn raid_window_replay() {"`,
an ignored test shipped in `917629d`. It runs the real brain with the keyless scripted engine
over the simulator's `raid_moment` room at 300 viewers (the raid lands in one beat) and at 40
(the raid is spread out), plus a raid-free `growing_channel` room of 30. Each room runs 8 seeds
of 900 seconds. The raid clock is the first raider's chat line, because the room moves the
scheduled raid past its guards. Arm A reproduced byte for byte on every repeat run.

**Arms.** A: the tree as it was. B: the raid flag held for 60 seconds after any raid
detection, whether one beat, spread, or during a scene. Arm B was a 21-line patch, measured
and then reverted.

**Target.** The room's share of pick slots in the minute after the raid.
**Floor.** Picks before the raid, and every pick in the raid-free room, must not change.

| room | arm A room picks | arm B room picks |
| --- | --- | --- |
| 300 viewers, first minute | 28 / 90 | 29 / 89 |
| 40 viewers, first minute | 6 / 52 | 6 / 52 |

| floor | changed under B |
| --- | --- |
| picks before the raid, raid rooms | 7 of 16 runs |
| whole run, raid-free room | 2 of 8 runs |

The target did not move and the floor broke. **Verdict: not-better.** The patch was not shipped.

**The seam was chosen to falsify.** A caught outcome would mean the per-beat flag is not what
gives raiders the minute. It was caught, in two ways the technique did not state:

- Of 108 raider picks in the first minutes (arm A), 98 carried `novel`, the picker's bonus for
  a viewer never picked before
  (`crates/shadowrunr-brain/src/picker.rs:354 "if c.safety.is_none() && !self.picked_ever.contains(&c.msg.viewer.id) {"`).
  Only 63 carried `first_contact`. Others carried `stale` (57), `carried` (47) and `greet` (28,
  so about 1.75 greetings per raid). The anti-domination bonus is a second newcomer boost, and
  suppressing the first leaves it standing.
- The 20-second surge tracker also fires on ordinary arrivals before a raid and in a room that
  never had one. A window keyed to it changes those beats, which is the floor that broke.

## What the change is

Nothing in product code. The instrument is shipped so the next arm (suppressing `novel` for
raid arrivals, with the window keyed to a raid that names itself) costs one run, about 6
minutes. The technique gained a section on both boundaries.

## What this realization cannot do

- The scripted engine cannot parse the picker's model replies, so beats with more than 40
  candidates fall back to the deterministic order. The ranking measured here is the fallback,
  and that is also what the tree runs whenever the model call fails.
- The replay measures who is picked, not whether the greeting landed. The raid greeting still
  has no scripted beat naming the raiding host and party size.
- The tree has no platform raid event. Every raid it sees is a surge, and this run showed a
  surge-keyed window cannot tell a raid from the room filling up.
