---
layer: application
type: application
subject: invariant-placement
technique: a-new-field-must-choose
stack: rust
status: forged
verified_on: 2026-11-06
verified_against: rust@1.99
applied: experiment
ab_verdict: unmeasurable
proof: ab-paired
---

# Rust: a destructure with no rest pattern, and what non_exhaustive costs in one repository

The version is the compiler this probe ran on, rustc 1.99.1. The trees below were read and not built. Both are design
only: `leodearden/reify` is AGPL-3.0 and `melgarafael/lina-space` declares no licence, so line references say where they
were read, and the code below is written for this probe.

## Two trees

**reify at `8d65e1b0`.** An engine's per-build reset binds every field with no rest pattern, grouped under comments by
class: reset on every surface, reset on one path, must survive (`crates/reify-eval/src/engine_build.rs:3475-3500`). Its doc
comment names why a uniform reset would be wrong, a setting a sweep would destroy. A kernel's warm-state table uses the same
move and says what catches each stage: the pattern error, then the unused-variable lint under its enforced warnings
(`crates/reify-kernel-manifold/src/kernel.rs:2891-2901`). The registry entry records this as the mechanism
(`docs/invariants.md:31`).

**lina-space at `9b4d57c8`.** The event fold is a total match (`crates/lina-core/src/events.rs:1983`). At the UI boundary the
same event types are marked `non_exhaustive`, and the doc comment requires a default arm in every shell
(`crates/lina-host/src/lib.rs:35-37`). The shell is a path dependency in the same repository. Its default arm read a new
paused state as running, a comment names that as the failure, and a test now pins the case
(`app/lina-gpui/src/canvas.rs:167-173`, `app/lina-gpui/src/canvas.rs:238-242`).

The second tree has no instance of the field half: 555 lines end in a rest pattern and its one no-rest site only moves
fields, per the miner. So the two voices meet on the root, that adding a member stops the build until someone decides, and
on the enumeration half. The field half has one voice and a compiler run.

## The run

A two-field reset of our own, one field cleared and one kept on purpose, then a third field planted.

| Arm | Planted field | Result |
| --- | --- | --- |
| A, clears a listed field | not mentioned | compiled, the new field silently kept |
| B, destructure with no rest | not mentioned | refused, E0027 names the field, no binary |
| B, field named and unused | named | compiled with a warning |
| B, same, `-D warnings` | named | refused, no binary |

Floor: with no planted field A and B printed the same thing, one field cleared and one kept.

The enumeration half, with a variant added to a dependency:

| Form | Result |
| --- | --- |
| Closed enum, match missing the variant | refused, E0004 names the variant |
| `non_exhaustive` enum, every variant listed, other crate | refused, E0004 demands `_` |
| `non_exhaustive` enum with `_`, other crate | compiled, the new variant read as the default arm's "run" |
| `non_exhaustive` enum, same crate, every variant listed | compiled, no wildcard needed |

So the attribute's cost arrives at the crate line, not the repository line, which is what the technique says about a shell
compiled together with its core.

## The seam

The nearest connected project holds a small stream tracker with a reset that clears one field of two. The field it keeps has
a reason nobody wrote there. This is the When-not case: two fields, one site. A second reset site in its Rust is a terminal
parser's, unread. No large state reset was found by a search for reset and clear methods, so the seam could not show the payoff.

## Verdict

`unmeasurable` for any project. The refusal is a compiler fact on our code. What it would save is a count of missed fields over
time, and only a tree with a reset of real size and a history could give that. A survey for such a reset is the instrument.
Nothing was changed in the project.

## What this realization cannot do

It proves a decision was made. An author can bind a field as ignored with a false reason, and the build passes.
