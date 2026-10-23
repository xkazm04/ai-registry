---
layer: application
type: application
subject: on-stream-persona-continuity
technique: per-turn-persona-anchor
stack: rust
status: forged
applied: code
ab_verdict: unmeasurable
verified_on: 2026-10-21
verified_against: rust@1.97.1
---

# Rust: a rotated line bank and a worn-out list in the per-turn band

Shadowrunr OS (github.com/xkazm04/shadowrunr @ 829eb0a) composes its host, Arch-Lich
Malakor, in a Rust brain crate. On 2026-10-21 it gained a voice section in the per-turn
block: up to three example lines from a per-tone bank, matched to the beat's situation and
rested for eight beats after showing, followed by the phrases the host has worn out. The
full persona stays in the byte-stable prefix. This application reads the section as an
anchor near the newest turn and records the one figure the project measured. The workspace
pins `rust-toolchain.toml` (channel 1.97.1).

## Where the anchor sits

The composition contract puts the voice section in the per-turn block, not the prefix:
`crates/shadowrunr-brain/src/compose.rs:11-13 "the voice section (exemplars for the beat's"`,
byte-absent when empty
(`crates/shadowrunr-brain/src/compose.rs:791 "5c. The voice section: exemplars and worn-out phrases. Byte-absent when it has none."`).
The banks say the same thing in their own header:
`characters/malakor/lines/theatrical.toml:2 "per-turn section as exemplars (three a beat, matched by situation tag; never the stable"`.
Every bank line has an owner-review status, so the anchor shows only reviewed or seeded
material (`characters/malakor/lines/theatrical.toml:3 "prefix). status:"`).

A beat that must carry no performance gets no anchor: the situation tags return `None` when a
viewer is in care
(`crates/shadowrunr-brain/src/compose.rs:502 "beat must carry no roast material at all: a viewer is in care or in distress"`), and the call site
says so (`crates/shadowrunr-brain/src/lib.rs:1056 "Exemplars for the beat's situation and the phrases worn out (never in a care beat)."`).

## Rotation

The rest window and the count are constants:
`crates/shadowrunr-brain/src/working.rs:24 "pub const EXEMPLARS_PER_BEAT: usize = 3;"` and
`crates/shadowrunr-brain/src/working.rs:26 "pub const EXEMPLAR_WINDOW: usize = 8;"`. The module
header states the reason in the technique's terms:
`crates/shadowrunr-brain/src/working.rs:8-9 "Exemplars rotate under the same rule: one shown is not shown again within"`.
The heading tells the model what the lines are for:
`crates/shadowrunr-brain/src/working.rs:128 "Lines in your voice (do not reuse verbatim):"`.

## The worn-out list, and what it measured

The same section names the host's own recent tics back to it:
`crates/shadowrunr-brain/src/working.rs:129-130 "Heading of the worn-out phrases."`, headed "Worn out, do not say:",
read from the last twenty spoken lines, a phrase counting once two of them carry it
(`crates/shadowrunr-brain/src/working.rs:28 "pub const TIC_WINDOW: usize = 20;"`,
`crates/shadowrunr-brain/src/working.rs:30 "pub const TIC_MIN_LINES: usize = 2;"`). The test
case is a real one, a refusal the host had repeated on a ten-minute run
(`crates/shadowrunr-brain/src/working.rs:631 "The tic of sbx-20261021-143530-10m."`). The
deterministic repetition guard on the aired line still stands behind it
(`crates/shadowrunr-brain/src/outgate.rs:27 "The output rule of the repetition guard."`).

The project's own build record (private, not cited by path) gives one before/after on a
live voiced ten-minute run: tic share 32% before and 30% after, with the note that the
disclosure line "became the new tic". That release shipped craft sections, line banks,
owner directions, narrowed rails and a rescaled judge together with the voice section, and
each arm is one run, so no part of the movement is attributable to the anchor or to the
worn-out list. The verdict is `unmeasurable`. The figure is still the shape the technique
warns of: a named tic gave way to the next one, and the share barely moved.

## Where the tree falls short

- The worn-out list quotes the tics verbatim under "do not say". The self-reinforcement and
  priming findings say that can feed the phrase it names; the technique's form is a positive
  or abstract instruction, measured as an arm. Nothing here measures the list with and
  without.
- No in-character rate is tracked against stream time, so the anchor's purpose (holding
  character late in a long stream) has no instrument yet. The judge scores bite and a tic
  share per run, not drift by minute.

Return: a paired run of the same matrix with the voice section present and absent, scored
for in-character rate by stream minute and for tic share, n stated.
