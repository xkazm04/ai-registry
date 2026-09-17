---
layer: application
type: application
subject: job-coordination
technique: terms-travel-permission-does-not
stack: rust
verified_against: rust@1.96.1
verified_on: 2026-09-17
applied: code
ab_verdict: better
---

# A deferred gate verdict assembled from two configurations (Rust)

How the technique lands in a public Rust evaluation service (`xkazm04/lighttrack`,
commit `5503ed1`, 2026-09-17). The stack witness is the repository's own pinned
toolchain (`rust-toolchain.toml`, `channel = "1.96.1"`), which every blocking gate
runs through; no job in CI names a version, so the file is the only address.

The seam was chosen because it could **falsify** the technique. The tree argues, in
prose beside the code, that reading the current configuration is the right call here:
the gate handler resolves judge calibration "keyed on the benchmark's own (rubric,
judge) pair, so a benchmark that switched judges does not inherit the previous one's
calibration" (`crates/api/src/benchmarks.rs:444-446`). If that is right, the
freeze-at-submission rule loses at this seam. A caught outcome would have narrowed the
technique to "name the configuration, do not refuse the verdict".

## The unit of work, and where its terms were frozen

A benchmark run is a deferred unit in the strict sense: it is enqueued through one
shared constructor with its parameters validated at the door
(`crates/api/src/jobs_enqueue.rs:82-108` — samples, heal, provenance, and
`max_attempts` all written into the row at enqueue), claimed by a separate runner
process, and finished minutes to hours later. Two of its terms are already frozen
correctly, and by the same mechanism: the runner stamps the judge model, the rubric
id, the dataset reference and the dataset's frozen state and version **into the run's
own report** (`crates/runner/src/bench.rs:87-102`).

So the run knows what it was scored under. The verdict does not use it.

## Arm A: the verdict reads the current row

`decide_gate` takes the whole `Benchmark` and reads `baseline_score`, and the handler
reads `judge_model` and `rubric_id`, all from the row **as it stands when somebody
asks for the verdict** (`crates/api/src/benchmarks.rs:374-427`, `:431-459`). A floor
refusal exists, and its doc comment enumerates its own completeness: "the strongest
statement this gate can make is the one condition it can actually read off the run:
**the case set was allowed to move**" (`:332-346`). The enumeration is wrong by one. A
second condition is readable off the run and was not being read — the instrument.

Consequence, measured: a run scored by judge `sonnet` against a benchmark that now
judges with `haiku` comes back `pass`, with no caveat, subtracting a number one judge
produced from a baseline a different judge produced. A `regressed` verdict on the same
pair is a false alarm with a number behind it. The response is assembled from two
configurations and says so nowhere. This is a success-path defect: nothing crashes,
nothing logs, and the gate is green.

## Arm B: the floor rests only on conditions the run recorded

The predicate gains the second condition (`baseline_not_comparable` now takes the
benchmark; `instrument_moved` compares the run's pinned `judge_model` / `rubric_id`
against the row's current ones). A disagreement degrades `pass` and `regressed` to the
existing unverified lane with a caveat naming both instruments. Absence is left alone:
a run from before the pin existed stamps no judge, and reading that silence as drift
would retire every legacy verdict at once.

## Target, floor and result

Declared before either arm ran. **Target**: gate verdicts that attribute a run's
`pass` or `regressed` to a configuration the run was not scored under — arm A 2, arm B
target 0. **Floor**, tolerance 0: the eight pre-existing `decide_gate` cases return
identical statuses and caveats, `no_baseline`-from-absence gains no caveat, and
`partial` is not relabelled.

Result: arm A 14 passed / 1 failed, the new case red with `left: "pass", right:
"no_baseline"`; arm B 15 passed / 0 failed. Target 2 to 0, floor held at 0 changes.
The repository's own lint gate (`cargo clippy --workspace --all-targets -D warnings`)
passes on arm B. Its format gate is red at this commit on a file neither arm touches
(`crates/core/src/lib.rs:143,149`, a re-ordered re-export), which is recorded here
because a red gate on somebody else's file is named, not fixed.

## What the seam refuted, and what it did not

It refuted the prose, not the code's intent. Keying calibration to the *current* judge
is correct for the question "is the instrument this benchmark uses now trustworthy",
and wrong for the question the gate actually answers, which is about a run that has
already happened. Both questions are live, so the split is not freeze-versus-live: the
verdict about a finished unit is computed from its frozen terms, and the current row
still answers what the *next* run will be judged by.

It also found the tree disagreeing with itself, which is the stronger corroboration.
The repository already applies this exact rule at a different altitude and argues it
explicitly: the toolchain is pinned per commit so that `cargo fmt --check` and `cargo
clippy -D warnings` are "functions of THIS COMMIT and nothing else", after a day in
August when six untouched files went red because the ruler moved underneath them
(`rust-toolchain.toml`, header comment). That is the technique, applied to the ruler of
a gate, by an author who then let the same gate's judge float.
