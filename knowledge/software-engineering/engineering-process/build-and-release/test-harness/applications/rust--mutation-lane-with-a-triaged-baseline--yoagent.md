---
layer: application
type: application
subject: test-harness
technique: mutation-lane-with-a-triaged-baseline
stack: rust
status: forged
verified_on: 2026-10-02
verified_against: rust@1.86
---

# A weekly mutation report over seven modules, and the runner it killed (Rust, agent library)

Stack version from the crate's `rust-version` field (`Cargo.toml:24 "rust-version"`);
commit `2428f68d` of a public agent library. The workflow, the tool configuration and
the baseline document were read at this commit; the lane itself was not re-run here.

## The shape

`.github/workflows/mutants.yml` runs weekly and on demand, sixteen round-robin shards,
`fail-fast: false` (`.github/workflows/mutants.yml:52 "fail-fast: false"`) so one slow
shard does not cancel the rest. Its header states the stance the technique takes: not
per-change, a report, surviving mutants never red, and the run goes red only for a
broken build, a failing unmutated baseline or a configuration error. The tool version is
pinned with the reason in a comment beside it. Scope is seven modules chosen where
a silent failure costs most (`.cargo/mutants.toml`), with the reason for each and for
the one left out; the timeout is derived (`.cargo/mutants.toml:59 "timeout_multiplier = 3.0"`).

## The baseline and its triage

The first baseline was a sample, stated as one:
`docs/evals/mutation-baseline.md:56 "93 mutants tested in 86m"` (22 missed, 58 caught, 12 unviable, 1 timeout),
round-robin shard 0 of 10, because a full local run was estimated at about 14 hours. The
document sorts survivors into real gaps (13), boundary cases (2) and equivalent or
acceptable (7), gives a reason per row, and says why survivors are listed in prose and
not in the tool's exclusion list: line and column drift with every edit. The first full
run (928 mutants, 30 minutes, 75% detected overall, 65% for the loop module and 100% for
the price-layer resolver) is a table beside it.

## The defect the lane found in itself

Two dispatched runs lost the same four of eight shards with no error and the
document narrates the diagnosis: freeing about 20 GB of disk did not change which
shards died, which made the cause deterministic
(`docs/evals/mutation-baseline.md:144 "The cause was deterministic."`).
The cause was mutants of one cursor-advancing function that push on every step and
never terminate, growing memory until the runner was shut down before the tool's own
timeout. They are excluded by pattern with the reason in the configuration; the workflow
logs host state in its first step, with the comment
`.github/workflows/mutants.yml:56 "Logged so a runner that dies mid-run leaves evidence."`.

## What the realization cannot do

- The baseline is a sample, and one of its real-gap rows says sibling presets
  "probably have the same gap (not checked)"; the full-run table is a count by module.
- Mutation covers seven modules; the wire-format providers rely on mock-boundary tests
  and an external-source diff instead, which is a reasoned exclusion and also the
  unmeasured majority of the crate.
