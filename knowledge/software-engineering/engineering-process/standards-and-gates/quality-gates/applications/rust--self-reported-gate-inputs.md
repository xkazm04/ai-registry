---
layer: application
type: application
subject: quality-gates
technique: self-reported-gate-inputs
stack: rust
verified_on: 2026-09-23
---

# A review council's result file, and the door that will not take its word

A desktop application runs a review skill — a council of judges scoring one
major feature against a versioned rubric — that writes a `result.json` into the
repository and never touches the application's database. The only path from
that file into storage is one ingest command
(`src-tauri/src/commands/infrastructure/dev_tools/council_ingest.rs`), and its
header states why it is the strictest door in the tree: the thing ingested is a
verdict on work the ingesting party produced, and "a door that took a council's
word for its own outcome would be a self-graded exam with a database behind
it."

## What the door recomputes, and what it refuses

- **The numbers.** `overall`, `coverage` and `outcome` are derived from the
  per-dimension verdicts and the named rubric's weights; a file whose stated
  value differs beyond a tolerance of `1e-6` is refused with a message naming
  the field and both values ("states overall … but its own dimensions give …").
  The header gives the reason for refusing rather than correcting: a
  disagreement means the skill and the application run different arithmetic,
  and storing the door's answer would hide that.
- **The classifications.** `floor`, `floor_hit` and `advisory` are derived from
  the rubric and the run's trust state and never read from the file, so a
  member cannot mark its own failed floor advisory.
- **The whole file or nothing.** Everything validates before a row is written;
  half a council is treated as a different verdict, not a weaker one.

## Where both sides had to be pinned to one contract

The rubric's weights and floors live as constants beside the door
(`src-tauri/core/src/models/council.rs`) so the application can recompute
without reading the skill's files, and a test pins them to the design brief's
values. Two further pins were needed for agreement to be possible at all:

- **Rounding.** The skill rounds to four decimals before writing. A test
  records that an unrounded quotient and its four-decimal form differ by more
  than the tolerance (`0.595 / 0.90` against `0.6611`), so without the same
  rounding the door would refuse arithmetic that agrees.
- **Outcome precedence.** The introducing commit (`7fdff5ac4`, 2026-09-20)
  mirrors the skill's aggregate "line for line — including that the round cap
  is read FIRST": a run past the last round is `stalled` even when a hard
  failure is also present. The suite pins it (`a_fourth_round_is_stalled`,
  `a_hard_failure_sinks_a_run_whatever_the_scores_say`, and a branch table for
  the pass rule).

The discriminating pair is `refuses_a_result_whose_own_numbers_disagree` beside
`a_difference_inside_the_tolerance_is_not_a_disagreement`: the first alone is
passed by a door that refuses everything, the second alone by one that checks
nothing.
