---
layer: application
type: application
subject: judge-calibration-and-drift
technique: golden-set-agreement-measurement
stack: rust
status: forged
verified_on: 2026-09-15
verified_against: rust@1.96.1
applied: code
ab_verdict: better
proof: ab-paired
---

# Self-consistency samples that could not disagree, in LightTrack's judge (Rust)

The witness for `rust@1.96.1` is the repository's `rust-toolchain.toml`,
which pins the channel CI and every local gate run under. The tree was read
and changed at `5137555`, and the change landed as `d6c0324`.

## The seam

LightTrack's rubric judge draws `samples` verdicts per case and reports
`agreement` as one minus the spread of the per-sample overalls
(`crates/engine/src/judge.rs`, `aggregate`). The production generator
requested deterministic sampling on every call: temperature 0 and a pinned
seed, with the stated reason that "self-consistency disagreement signals
ambiguity rather than sampling noise". Both halves of that sentence are
the amendment's first failure. Draws pinned to one request have no spread
to read, so the agreement a multi-sample verdict carried was the absence
of a measurement, and the spend was N single verdicts.

The tree already held the rule the judge was missing. Its benchmark
framework unpins candidate generation when `--gen-samples > 1` and stamps
the run `sampled`, because "pinning there would collapse every draw onto
one output and silently delete the feature". The generation half and the
judging half faced the same force, and only one of them was built for it.
Neither the corpus citation nor a unit test could see this: the judge's own
eval corpus feeds canned replies that differ because the fixture says so.

## A and B

- **A** (HEAD): every sample pinned, stamped by the provider (`exact` where
  temperature and seed were accepted).
- **B**: when more than one sample is requested, `ProviderGen` draws each
  sample through the unpinned dispatch and stamps it `sampled`. The folds
  that already take the weakest stamp, single-case and batched alike,
  report `sampled` on the verdict. A one-sample verdict stays pinned.

## What was read

Both arms ran through the production entry point (`run_rubric_judge`) with
an ignored live test that is committed beside the change
(`crates/engine/tests/judge_samples_live.rs`). The setup: a small local
seeded model behind the OpenAI-compatible provider, four deliberately
ambiguous grounding cases, five samples each, and three runs per arm.

| | case-runs whose samples disagreed | stamp | cross-run behaviour |
| --- | --- | --- | --- |
| A | 3/12, all the same case at identical values | `exact` | that case's overall moved 0.8 to 0.6 between a cold and a warm run |
| B | 7/12, across 3 cases | `sampled` | overalls move between runs (one case read 0.9, 0.8, 1.0) |

The seam was chosen to falsify. The prediction was that pinned samples can
never split, and arm A refuted it: one case split, reproducibly, under a
stamp that claimed exact reproduction. That split is a property of the
serving stack (a reused prefix is the likely source), not of the case's
ambiguity, which is the opposite of what the pinned design assumed it was
reading. It produced the amendment's second sentence: a reproducibility
stamp derived from what the request asked for overstates what the provider
delivered.

## What this realization cannot do

- B makes the split signal reachable. It does not make a sampled overall
  reproducible, and it does not claim to. A deploy gate that needs a
  replayable score should judge with one sample.
- The paired proof ran against one small local model. A hosted judge's
  temperature and seed behaviour differs by provider, and the `exact`
  stamps on seeded providers still rest on the request rather than on a
  verified replay.
- The engine's gate (204 tests, fmt, clippy) cannot see either effect. Only
  the ignored live test can, and it needs a local model to run.
