---
layer: application
type: application
subject: audience-absorption-at-scale
technique: first-contact-exemptions
stack: rust
status: forged
verified_on: 2026-10-22
verified_against: rust@1.97.1
applied: code
ab_verdict: better
proof: ab-paired
---

# The raid that every arrival greeted on its own

*Verified against Shadowrunr OS, an AI-hosted villain livestream (github.com/xkazm04/shadowrunr,
branch main, local commit `645bb06` on top of `663949b`; the change has not been pushed yet),
on 2026-10-22. The workspace pins its toolchain in `rust-toolchain.toml` (channel 1.97.1), and
the run built and tested with that toolchain.*

The technique has five steps. The show already did four of them. The fifth was missing,
even though the tree could already detect the case where it applies.

## What already conformed

A viewer's first message gets past the input filter's rate cap only after the platform term
rules have run, so moderation still sees it first:
`crates/shadowrunr-brain/src/moderation.rs:949 "return Some("first_message");"`.
It cannot be swallowed by near-duplicate collapse either, which matches the technique's
step 2:
`crates/shadowrunr-brain/src/moderation.rs:1188 "a gift, a first message or"`.
The exemption is spent once a viewer is in the filter's seen set, so a second message
competes on ordinary terms. The picker adds a fixed bonus for a first contact:
`crates/shadowrunr-brain/src/picker.rs:316 "s += 1.2;"`.

## The step that was missing

The orchestrator already calls five first contacts in one beat a raid
(`crates/shadowrunr-brain/src/orchestrate/mod.rs:119 "pub const RAID_FIRST_CONTACTS: usize = 5;"`).
It used that flag for one thing only: expiring the bit it had queued
(`crates/shadowrunr-brain/src/orchestrate/mod.rs:888 "Some("raid")"`). The picker never
learned about the raid, so every raider kept the full first-contact bonus. The technique's
step 5 asks for the opposite: suppress those individual boosts during a raid and let one
group greeting serve the whole party.

## The paired proof

**Instrument.** An offline replay that changes no product code. It takes the simulator's
300-viewer raid population over 900 seconds at eight seeds and feeds each 5-second tick
through the real input filter, the orchestrator's first-contact bookkeeping and the real
picker. Arm A ran the tree as it was. Each B-side arm changed one policy. Every raid beat
had 23 candidates or fewer, which is under the picker's 40-candidate model threshold
(`crates/shadowrunr-brain/src/picker.rs:58 "llm_threshold: 40,"`). So the deterministic
order the arms change is the order that decides those beats.

**Target.** Pick slots in raid beats that go to the room instead of the raid.
**Floor.** Two numbers. First, raid episodes where nobody greets the raid. Second,
non-raid beats, which must not change.

| arm | policy in a raid beat | room picks / 92 | beats greeting the raid twice / 46 | ungreeted raid episodes / 20 |
| --- | --- | --- | --- | --- |
| A | every first contact boosted (as was) | 26 | 24 | 2 |
| B | single first messages unboosted, every wave boosted | 31 | 20 | 2 |
| C | only the raid's largest wave boosted (**shipped**) | 34 | 19 | 2 |
| AD | A, plus normal near-duplicate collapse for first messages | 29 | 23 | 2 |

The non-raid beats in the run were identical between A and C (28 rows). In arm C,
single-raider picks fell from 16 to 4.

**The seam was chosen to falsify.** A caught outcome would have meant that the raid ritual
already collapses, so suppressing individual boosts gives nothing back. Arm B nearly showed
exactly that: most of the slot it freed went to a *second* wave from the same raid. The
reason is that the ritual arrives as several distinct phrases ("who is" the host, a hype
line, a salute), and each phrase collapses into its own wave. Each of those waves then
counts as a group greeting. "Greet once" therefore had to mean that one wave keeps the
boost. Changing the clustering alone (arm AD) moved three picks, so the shipped change
targets the picker and leaves the filter alone.

## What the change is

`Orchestrator::is_raid` exposes the existing flag. During a raid beat, the beat's
`PickContext` carries `raid` and `raid_wave`, where `raid_wave` is the first-contact wave
with the most viewers. The bonus now goes only to that wave:
`crates/shadowrunr-brain/src/picker.rs:309 "&& (!ctx.raid || ctx.raid_wave.as_deref() == Some(c.msg.id.as_str()))"`.
The composer still sees every first contact, so a raider who asks what the show is still
gets the newcomer note if they are picked on ordinary terms. A unit test pins all three
cases: in a raid, the wave is greeted first and the room keeps the second slot; outside a
raid, both arrivals go first. After the change, the workspace tests, `cargo fmt --check` and
`clippy -D warnings` on the brain crate all passed.

## What this realization cannot do

- The replay leaves out the orchestrator's carry queue and the beat plan's offer filter. A
  raider message that is carried keeps its first-contact flag, so in later beats it competes
  with the age bonus but without the raid suppression.
- Raids are detected only from the surge: five distinct first-timers in one 5-second beat.
  The tree has no platform raid event and does not treat a busy room filling up differently
  from a raid. The sibling raid technique says that difference matters, and this run did not
  measure it.
- "One greeting" here means the composer is handed one wave. The tree has no scripted
  greeting beat that names the raiding host and party size.
