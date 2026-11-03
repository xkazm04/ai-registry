---
layer: application
type: application
subject: claimed-improvement-remeasurement
technique: queued-runs-as-head-sample
stack: rust
status: forged
verified_on: 2026-11-03
verified_against: rust@1.96
---

# The run that backs a promotion must have run what is promoted (tracklight)

Project `tracklight`, https://github.com/xkazm04/lighttrack at origin/main, commit 5aa119f.
The claim here is not a timing: an operator promotes a new version of a stored prompt, and the
promotion gate asks a benchmark run to back it. A version-triggered benchmark run is the queued
head sample of this technique, in an LLM evaluation product instead of a CI pipeline. The code
reaches the technique's step 2 and step 5 independently, in Rust.

## The identity stamp is written by the code that consumed the input

The failure the gate was rewritten for is the technique's "a run queued by branch name builds
whatever the branch points at". A triggered run used to carry its prompt identity
`crates/api/src/prompts_gate.rs:7 "as provenance copied from its enqueue payload"` while the
generator read the target's stored prompt instead, so
`crates/api/src/prompts_gate.rs:8 "a green run could certify content it never saw"`. The
request said which version to test, the generator read something else, and the report repeated
the request.

The fix moves the stamp to the consumer. The new evidence is
`crates/api/src/prompts_gate.rs:10 "written only by the runner code that fetched"` the registry
content. The runner writes it at `crates/runner/src/bench.rs:211` after resolving the prompt,
under the comment `crates/runner/src/bench.rs:204 "one report key no provenance passthrough can fake"`.
Resolution happens before any spend:
`crates/runner/src/bench.rs:194 "Resolve every target's registry prompt BEFORE the first paid call"`.
The gate compares the stamp with the version being promoted and refuses a mismatch with
`crates/api/src/prompts_gate.rs:142 "the benchmark run backing this promotion generated with prompt"`
version N, not the one promoted. A run with no stamp at all is refused too, because it never read
the registry. Tests pin both refusals (`crates/api/src/tests_prompt_gate.rs:194`,
`crates/api/src/tests_prompt_gate.rs:241`).

That is the **upward lesson** now in the technique's step 2: the commit or version a run built
is recorded by the step that consumed it. A copy of the queue request is the claim's own record
of what it asked for, not evidence of what ran.

## A partial run is not a smaller sample

The technique's step 5 waits for the whole batch because the first runs to finish are biased.
The gate refuses an incomplete run for the same reason, and states it as a selection problem
rather than a count problem:
`crates/api/src/prompts_gate.rs:180 "WHICH cases those were is scheduling-dependent"`, so
`crates/api/src/prompts_gate.rs:181 "a favourable subset must never be able to promote"`.
Cancelled, aborted and budget-halted runs all count as incomplete; the budget status reads
`crates/api/src/prompts_gate.rs:222 "halted by the run budget ceiling"`. The test at
`crates/api/src/tests_prompt_gate.rs:169` pins the block for an incomplete run whatever its mean.
This matches the technique's decision rule that a budget exhausted before the floor leaves the
verdict open rather than lowering the floor.

## Where it departs

- **Legacy fallback.** With no tagged run at all, the gate
  `crates/api/src/prompts_gate.rs:237 "falls back to the newest scored run of any version"`, so
  older projects keep a working gate. The resolution check runs first wherever the benchmark can
  resolve prompts. Where it cannot, promotion carries only a warning, a deliberate one-release
  migration path rather than an identity check.
- **No base batch.** The comparison is against a stored floor score and the previous comparable
  run. There is no interleaved base batch on the prior version, which is the technique's step 6
  remedy when the organic base is stale.
- **The gate's direction.** The gate refuses a proven regression and lets through what it
  cannot decide. That is a no-regression gate, not a credit judge; see the sibling application
  [rust--claimant-figure-never-decides](./rust--claimant-figure-never-decides.md).
