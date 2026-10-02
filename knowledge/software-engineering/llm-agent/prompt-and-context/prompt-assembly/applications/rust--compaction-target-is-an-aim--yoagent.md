---
layer: application
type: application
subject: prompt-assembly
technique: compaction-target-is-an-aim
stack: rust
status: forged
verified_on: 2026-10-02
verified_against: rust@1.86
---

# The 22-token session: a headroom target outranking the task (Rust, agent library)

Stack version from the crate's `rust-version` field (`Cargo.toml:24 "rust-version"`);
commit `2428f68d` of a public agent library. The tree's own offline sweep was re-run at
this commit, so the measurements below are reproduced, not quoted.

## What the tree does

The ladder's last rung is `level3_drop_middle`. It keeps the first messages and at
least the last `keep_recent`, removes the smallest middle span that reaches the
target, and, when the protected head plus tail already exceed the target, hands the
whole history to `keep_within_budget`. Both exits pass the *target*:

- `src/context.rs:886 "return keep_within_budget(messages, target);"`
- `src/context.rs:923 "return keep_within_budget(&result, target);"`

`keep_within_budget` keeps messages newest-first until the argument is full, then
re-snaps to a turn boundary. The task prompt is the oldest message, so it goes first.
The target comes from a headroom policy (budget minus N turns of measured growth),
floored at `src/context.rs:272 "pub const MIN_HEADROOM_RATIO: f32 = 0.30;"`.

## What it cost, and what was done

The tree's issue tracker carried two unexplained live logs, `25 msgs / 19504 tok -> 3
msgs / 1665 tok` and a collapse to `1 msgs / 22 tok`. The tree's sweep reproduces both
through the real compactor and names the mechanism in its eval document
(`docs/evals/compaction-defaults.md:139 "nothing survives but the 22-token"`). Its
measured response was to raise the floor from 0.15 to 0.30
(`CHANGELOG.md:200 "At 0.15 that dropped the"`: 91% of compactions lost the opening
task and 41% the latest request at the default budget; 0% and 2% at 0.30, for about 7%
more input and no change in compaction count).

The eval document also states the structural fix and then does not ship it:
`docs/evals/compaction-defaults.md:302 "only the budget is a hard limit."`, preceded
at line 299 by the proposal that level 3 fall back against the budget. At this
commit both fall-back calls above still pass the target, and the changelog records the
residual (`CHANGELOG.md:207 "Small budgets (around 26K) can still collapse"`).

## Re-run at this commit

`cargo run --release --example compaction_sweep -- floor` (2.8 s, deterministic):

| profile @ budget | shipped floor 0.30: task lost / latest lost / marker-only per run | protect-set candidate |
|---|---|---|
| coding @ 96K | 0% / 2% / 0 | 0% / 2% / 0 |
| coding @ 26K | 100% / 82% / 43 | 81% / 46% / 0, at 26.4 vs 13.3 compactions per 100 |
| records @ 26K | 100% / 42% / 0 | 0% / 0% / 0 |

The 96K row reproduces the changelog's 0% and 2%. The 26K rows show the structural
point: raising the constant fixed the default budget and left the small one
untouched, and the candidate that never lets the target fall below the protected set
removes the marker-only collapses entirely and the task loss in one of two profiles.
It does not remove it in the tool-heavy profile, because there the newest turn alone
is most of the window.

## What the realization cannot do

- It has no knob that makes the protected set budget-relative; `keep_recent` stays a
  message count, and the doc's own finding is that this is why no single floor works
  across budgets.
- The sweep measures what a compaction *removes*, not what the model then does without
  it (`head-` and `ask-` say what it no longer sees, not what that costs). A
  continuation-after-loss run is the missing arm and no tree instrument has one.
- The cache-hit column is an idealised proxy; the tree says so itself and the live
  check is listed as open.
