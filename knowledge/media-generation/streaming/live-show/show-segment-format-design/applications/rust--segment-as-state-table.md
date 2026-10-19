---
layer: application
type: application
subject: show-segment-format-design
technique: segment-as-state-table
stack: rust
status: forged
verified_on: 2026-10-19
verified_against: rust@1.97.1
---

# Segments as compiled-in TOML tables, run by one interpreter

Shadowrunr OS is an AI-run villain livestream: a generated host (Malakor) runs a show
for a live chat, and every segment of that show is a TOML table interpreted by one
generic Rust state machine. Read at github.com/xkazm04/shadowrunr @ 4025231 (branch
main); the toolchain pin is `rust-toolchain.toml:2 "1.97.1"`. The tree was read, not
built or run. This application shows where the tree realizes the state-table
technique, where it carries the handover and guest rules the technique's table
declares, and where it falls short of the standard.

## The table is data, and the interpreter is generic

Each table says so in its header:

- `crates/shadowrunr-segments/data/segments/seg-01.toml:2 "no segment-specific code exists"`
- `crates/shadowrunr-segments/src/table.rs:3 "One generic interpreter"`

A table declares an id, a status, an initial state, its states, `allowed_ops` (host
actions), `commands` (viewer commands), the segments it may switch to, a
`rules_prompt`, clock rules and a transition list
(`crates/shadowrunr-segments/data/segments/seg-01.toml:8 "states = "` through line 21).
Validation runs at load: unknown fields are refused, the initial state and every
transition endpoint must be declared states, every op and command must be known to
the dispatcher, and poll bounds must be consistent:

- `crates/shadowrunr-segments/src/table.rs:222 "deny_unknown_fields"`
- `crates/shadowrunr-segments/src/table.rs:252 "fn validate"`
- `crates/shadowrunr-segments/src/table.rs:291 "clock: poll bounds are inconsistent"`

The technique's split between starting and closing events is in the tree verbatim,
and is an upward lesson the golden path took from it: starting triggers can be
refused, while closings and the clock always happen and leave the state unchanged
when no row matches.

- `crates/shadowrunr-segments/src/table.rs:111 "Starting triggers are refused in a state with no matching row"`
- `crates/shadowrunr-segments/src/table.rs:112 "always happen and simply leave the state unchanged"`

The shelved-format rule is also the tree's: two formats are kept with status
`descoped` and their design notes, the runtime refuses them, and validation insists a
descoped table keeps its notes.

- `crates/shadowrunr-segments/data/segments/seg-02b-i.toml:1 "DESCOPED. The runtime refuses to start it."`
- `crates/shadowrunr-segments/src/table.rs:297 "a descoped segment allows no ops and keeps its design notes"`

## Host actions are refused with a reason; direction is restated every tick

A host op outside the table returns a named rule, which becomes an output moderation
event; an op the current state cannot start returns `not_in_state`. The direction is
rebuilt from the table on every tick and partly generated from it (the foils
available tonight, the case under audit).

- `crates/shadowrunr-segments/src/runtime.rs:691 "op_not_allowed"`
- `crates/shadowrunr-segments/src/runtime.rs:682 "not_in_state"`
- `crates/shadowrunr-segments/src/runtime.rs:900 "is stable within a segment"`

The strongest confirmation of "put what the runtime can check in the table" is in the
investigation segment. Its prose forbids stating ungraded items as fact, while the
runtime refuses a documented-grade reveal without an allowlisted primary source.

- `crates/shadowrunr-segments/data/segments/seg-02a.toml:34 "never state a REP, CLM or SPC item as"`
- `crates/shadowrunr-segments/src/runtime.rs:780 "doc_requires_primary_source"`

The enforced half cannot fail. The prose half did: in night tournament
night-0dd890a1ad (n as stated, 2026-10-18), this segment's raid-subject and
unproven-as-fact situations failed occasionally on the small core tier (3/26 and 2/29
runs, in the digest's order).

## Handover rule and guest rule, as declared

The opener's handover is a sustained entry-readiness gate with a ceiling and a grace
period (`ccv_min = 15`, `sustain_s = 180`, `max_elapsed_s = 1500`, `grace_s = 60`).
The runtime resets the sustain timer on a dip and records whether the rule or the
ceiling fired; the numbers are labelled as guesses. The grace period with a
deterministic fallback is an upward lesson taken into metric-gated-handover, and the
format supplies its own bridge into the next segment.

- `crates/shadowrunr-segments/data/segments/seg-01.toml:45 "Handover when ccv >= ccv_min has held for sustain_s seconds without a dip"`
- `crates/shadowrunr-segments/data/segments/seg-01.toml:51 "the clock completes the switch itself"`
- `crates/shadowrunr-segments/src/runtime.rs:868 "self.ccv_since = None;"`
- `crates/shadowrunr-segments/data/segments/seg-01.toml:36 "Every number is an ASSUMPTION"`
- `crates/shadowrunr-segments/data/segments/seg-01.toml:32 "the foil dares you to prove one real case"`

The guest rule and the quiet-room rule are declared as direction:

- `crates/shadowrunr-segments/data/segments/seg-01.toml:28 "A foil speaks at most one"`
- `crates/shadowrunr-segments/data/segments/seg-01.toml:29 "you always have the last word."`
- `crates/shadowrunr-segments/data/segments/seg-01.toml:26 "never let the room die."`

## Deviations (the standard stands)

- **Out-of-segment viewer commands are dropped silently.** The command check is
  followed by a bare `continue`, with no event and no acknowledgement; host ops
  outside the table, by contrast, are recorded. The technique asks for an in-world
  decline. `crates/shadowrunr-segments/src/runtime.rs:509 "allows_command(command_name(&cmd))"`
- **Ops and commands are per segment, not per state.** State gating happens only
  through the starting-trigger rows, so `vote` is open in every state of the opener.
  `crates/shadowrunr-segments/data/segments/seg-01.toml:20 "propose"`
- **No floor, and one segment with no exit.** The opener's rule has a ceiling but no
  minimum run time; the investigation segment's clock carries only poll bounds and no
  handover rule, so it ends only when the host switches.
  `crates/shadowrunr-segments/data/segments/seg-02a.toml:43 "[clock]"`
- **Validation does not check reachability or exits**, and tables carry no version.
- **The guest cap and the host's last word are prose only.** The reply parser accepts
  a line for the active foil of any length and in any position, and the design
  generates host and foil in one call. The technique allows one call, but only with
  the order and the cap enforced on the parsed result.
  `crates/shadowrunr-brain/src/grammar.rs:145 "Line::Foil"` and
  `docs/design/obsidian-program-digest.md:57 "Duet generation:"`
- **There is no premise deck.** The design specifies one, but quiet beats are handled
  by a generic instruction and by a fresh-bit nudge after the repetition guard
  empties a beat.
  `docs/design/obsidian-program-digest.md:45 "fires a new premise whenever chat is quiet for more than 12s"`,
  `crates/shadowrunr-brain/src/compose.rs:510 "Fill the silence"`,
  `crates/shadowrunr-brain/src/lib.rs:794 "A quiet beat the guard silenced"`.
  The output gate's test fixture records where that spiral ends - a character break
  the gate replaces - and it is the upward lesson behind the quiet-room deck's "why
  not just ask the host to fill it":
  `crates/shadowrunr-brain/src/moderation.rs:1961 "I notice this stream has gone very quiet"`.
