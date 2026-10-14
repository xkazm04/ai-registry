---
layer: application
type: application
subject: error-handling
technique: containment-boundary-restores-state
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.85
---

# A tool server built to abort on panic, held up by its prevention rule alone

The tree is the open-source speech tool vox, read at commit `96fe9dbc`; the witness for
the stack is `Cargo.toml:4 "edition"`, the 2024 revision, which needs 1.85 or later. It
runs a long-lived tool server for coding agents that serves every tool call of a
session in one process. Its release profile sets `Cargo.toml:85 "panic = "` to abort,
so this is the technique's last section in its purest form: every release build is a
target where no catch can run, and the product's safety on all of them is the
prevention rule.

## The panics the tree found, one per incident

Each prevention arrived after a crash and carries its reason at the site. Echoing the
spoken text back to the agent truncated by byte index, and a multi-byte character at
the cut killed the server, `src/mcp.rs:609 "Truncating by byte index aborts the whole"`
followed by the server; the fix counts characters and a test is named after it,
`src/mcp.rs:1029 "fn truncate_for_echo_never_panics_on_multibyte()"`. A sound file
handed to the transcription tool can declare a sample rate of zero, which made a
length computation saturate and abort on allocation,
`src/mic.rs:205 "usize::MAX and aborts the process on the allocation. A WAV header can"`,
and a regression test builds that header by hand,
`src/mic.rs:584 "Reachable from a crafted WAV header: without the guard this computed"`.
A header declaring an enormous rate would have made a filter quadratic,
`src/mic.rs:214 "Bound the window: a crafted header (rate 2^31 against 16 kHz) would"`.
And a clamp whose bounds could cross was guarded because the clamp
`src/mic.rs:94 "panics if its bounds cross"`.

All four inputs are reachable from an agent: the text of a speech call and the file
argument of the transcription tool.

## What this realization cannot do

The technique pairs the prevention rule with a sweep that runs every registered
operation with junk parameters and asserts nothing escapes. This tree has the
prevention at the sites it has met and no sweep: its tool-server tests drive the
server over its real input and output, but call only the tools that make no sound,
and none feeds hostile arguments to every tool. Each of the four guards above was
found by a crash, not by an instrument, so the next unguarded site will be found the
same way, by an agent session that ends. A junk-argument sweep over the fourteen
tools, run without an audio device, is the missing half.
