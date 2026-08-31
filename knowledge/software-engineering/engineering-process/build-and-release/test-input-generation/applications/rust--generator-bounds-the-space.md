---
layer: application
type: application
subject: test-input-generation
technique: generator-bounds-the-space
stack: rust
verified_on: 2026-08-31
verified_against: rust@1.80.0
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A property suite that runs 10,000 cases against an invariant it cannot violate (Rust, Tauri desktop)

This tree is a good test of the technique because it is not a careless one. It
has a real property-based suite over a timeline-compiler module, it runs at
least a thousand cases per invariant and supports a ten-thousand-case bake via
an environment variable, its generators are composed and readable, and — the
detail that matters most — **the generator's own comments state its
constraints and justify them**. It is exactly the "sophisticated generator that
has earned confidence" the technique warns about, and it is the strongest
possible place to ask the technique's one question.

## The two arms

The measurable is *how many behaviours the suite reports on versus how many it
can reach*. Both arms read the same tree at the same commit.

- **Arm A — the suite as it stands.** `cargo test --test render_plan_proptest`
  compiles the timeline and calls `assert_invariants` on every output. Result:
  green, ≥1,000 cases per property, and the file's own header states the claim
  it is taken to support — every random composition exercises the compiler and
  every output is checked.
- **Arm B — the same suite, plus step 1 of the technique**: read the generator
  as an adversary and enumerate what it *cannot* produce, then check each
  constraint against the code that consumes the field.

Arm A reports zero untested dimensions, because it has no way to report any.
Arm B took about ten minutes and returned nine, three of which resolve to code
the suite therefore never reaches.

## What the generator cannot produce

From `arb_video_clip`, `arb_audio_clip` and their siblings:

| pinned field | value it can only take | consequence |
| --- | --- | --- |
| `trim_end` | `0.0`, hardcoded in every clip | trimming from the end is never generated, in a struct that declares the field |
| `media_duration` | `Some(60.0)`, always | never absent, never disagreeing with the clip |
| `transcript_path` / `transcript_status` | `None`, always | the sidecar-transcript states are unreachable |
| `label` | `None`, always | — |
| audio `file_path` | one literal path | two audio clips always share a source |
| video `file_path` | a pool of three, index defaulting to the first | one path over-represented; a distinct-source case is rare |
| `fps` | one of three values | — |
| audio loudness measurements | present exactly when `normalize` is true | the normalize-without-measurements pair cannot occur |

Two of these are *documented* choices, and the documentation is what makes the
example valuable rather than embarrassing. The generator says it constrains
deliberately "so compile() stays on the happy path", and that the measurement
correlation exists so one warning branch "doesn't dominate the sample space".
Both are defensible decisions. Neither is visible from the test's result, and
nothing re-checks them when the compiler grows a new branch.

## The structural fact: an invariant checked only in the passing direction

The finding this tree could not have been built to produce sits in
`invariants.rs`. Among the properties asserted after every compile is one that
fires when a clip's computed source end exceeds the media's duration —
a genuine violation with a specific error and a specific message.

The generator makes that violation **unreachable by construction**. It pins
`media_duration` to sixty seconds while drawing `trim_start` from 0–5 and
`duration` from 0.25–10, so the computed source end cannot approach sixty, let
alone exceed it. The check therefore runs ten thousand times per bake and
returns the same answer every time, for a reason that has nothing to do with
the compiler being correct.

This is the technique's central claim in its sharpest available form: the suite
is not weakly testing that invariant, it is **structurally incapable** of
testing it, and the report is identical either way
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
The neighbouring subject's negative-control discipline is the natural
complement and would have caught it from the other side — nobody had ever
watched that assertion fire.

## Verdict and what follows

`better`, and cheaply: the technique's procedure is a reading pass over one
file, and it converted a green suite's silence into a written list of nine
unreached dimensions with three confirmed consequences. The list is the
artifact; it is what the suite could not produce for itself.

The indicated repairs, in the technique's order — widen before lengthening:
draw `trim_end` rather than pinning it; let `media_duration` be absent and
sometimes smaller than the clip that references it, which reaches the invariant
above; decorrelate the loudness measurements from the normalize flag and let
the warning branch occur; and add the reachability assertions of step 4 so a
future refactor that re-pins a field fails loudly instead of quietly.

## What this realization cannot do

The generator's constraints were found by reading, not by measurement, so the
list is as complete as one careful pass — there may be more. Nothing here
counts *how often* an interesting state occurs, only whether it can occur at
all, because the tree emits no reachability counters; installing them is the
step-4 recommendation and the instrument that would turn this from a structural
result into a measured one. And the three confirmed consequences are confirmed
against the code as it is today: a compiler that grows a branch on `trim_end`
next month inherits the same blind spot with no signal.
