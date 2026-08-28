---
layer: application
type: application
subject: model-routing
technique: capability-floors
stack: process
status: forged
verified_on: 2026-08-28
refresh_by: 2026-11-28
---

# Where a local 27B model stops being a coding executor — a measured floor, August 2026

The capability-floors technique says a floor must be *measured*, not feared. This
is the measurement, for one concrete question: **can a model that runs unmetered
on one consumer GPU carry code-fixing work, and where exactly does it stop?**

Rig: RTX 4090 (24 GB), 63 GB RAM, Windows 11, Ollama 0.32.15. Candidate
`qwen3.8:27b` (Q4_K_M, 27.3B, tools + thinking). Reference tiers: Claude Opus 5
and Sonnet 5 through Claude Code CLI.

## The task set, and why it can be trusted

22 defects were mined from two production repositories by running the operator's
own multi-lens scan skill over 8 feature contexts (123 findings, 84 of them
carrying a real test gate). 16 were selected into two tiers and — this is the
part that makes the numbers mean anything — **each was given a FAIL_TO_PASS
regression test that was confirmed to fail at the base commit for the right
reason**, an assertion or a genuine throw from production code, never an import
error.

- **T1 mechanical** (8): one file, one mechanism.
- **T2 seam** (8): 2–5 files, one subsystem boundary.

Fixtures were **hidden from the executors**. Models received only the finding —
title, body, `file:line` evidence, likely files. This closes the gaming surface:
a model cannot satisfy an assertion it never saw.

## Measured

| executor | T1 | T2 | overall |
|---|---|---|---|
| Opus 5 (Claude Code) | 8/8 | 8/8 | **16/16** |
| Sonnet 5 (Claude Code) | 8/8 | 8/8 | **16/16** |
| **qwen3.8:27b (pi harness)** | **8/8** | **6/8** | **14/16** |
| qwen3.8:27b (qwen-code harness) | 1/8 | 0/8 | 1/16 |

**The floor sits inside T2, not at the local/frontier boundary.** On single-file
mechanical defects the local model is indistinguishable from either frontier
model — on one task three executors emitted *byte-identical* minimal diffs,
because a well-specified small defect has one correct fix. It broke on two
multi-concern seam fixes: a typed retry taxonomy spanning an SDK boundary, and a
flag discarded across five call sites.

**The harness is a first-class variable, not a wrapper.** Same model, same tasks,
same prompts: 14/16 through one harness, 1/16 through another, the loser dying on
`Model stream ended after a tool result without visible progress`. A capability
floor measured through a single harness is a floor for that *pair*, and reporting
it as a model property is an error.

## The axis a pass/fail column cannot see

Every patch was then ranked **blind** — labels shuffled per task, correctness
withheld — by two independent judges on root-cause-vs-symptom, blast-radius
awareness, idiom fit, earned-vs-unearned initiative, and insight.

| | wins (judge 1) | wins (judge 2) |
|---|---|---|
| Opus | 11/15 | 14/15 |
| local 27B | 4/13 | 1/13 |
| Sonnet | **0/15** | **0/15** |

86% pairwise ordering agreement. Two findings survive it:

1. **The two frontier models are identical on correctness (16/16 each, zero
   divergence in either direction) and far apart on quality.** Any pass/fail
   benchmark declares them equivalent. That equivalence is an artefact of the
   instrument.
2. **The local 27B ranked above the cheaper frontier model on quality while
   below it on correctness.** Less often right; when it acted, more often acting
   on the real problem.

The recurring failure the judges named: *implementing the finding verbatim*,
which surfaced as an unread consumer. On one task the finding's own prescribed
fix still crashed, because the hardened function was a **type predicate** and the
next line dereferenced a second field. One patch read the consumer and caught it;
three shipped the finding's suggestion unchanged.

## What landed, and what that cost

14 of 16 winning patches were merged to the source repository, suite green
(2484/2484). **Two were reverted**, and both are the argument for review-before-
execution: one shipped a test its own implementation failed; one broke a
pre-existing cascade test. Neither was an interaction effect — each broke on its
own commit.

## Calibration — what this does not establish

16 tasks over two tiers in two repositories. Enough to separate 16/16 from 1/16
and to locate a floor inside T2; **not** enough to call a 2-task gap between
neighbours. The cross-cutting tier was scoped out: its fixtures leaned on
source-presence assertions that a correct fix of a different shape would fail,
and the two that ran failed for *both* frontier models — a task no frontier model
passes is likelier a rigid fixture than a hard problem.

A second open-weight candidate was excluded on **hardware**, not quality: its
smallest published quantisation (97.6 GB) exceeds this box's 87 GB VRAM+RAM
ceiling, and no local build carries its vision path at any size. That is a floor
set by the rig, and it moves when the rig does.

## Measuring the floor is where the errors live

Six instrument faults were found and fixed *during* the run, every one producing
a plausible wrong answer rather than an error:

1. **A junctioned `node_modules` split module identity** — the runtime resolved
   the real path while the repo's loader returned the junction path, so a
   framework export arrived `undefined` instead of throwing. 106 phantom
   failures; `--preserve-symlinks` fixed it.
2. **A CRLF checkout** failed a test doing line-ending-sensitive source analysis.
   Identical blob hash, different bytes on disk.
3. **Newline translation on write** turned every captured diff into CRLF, so
   valid patches stopped applying.
4. **Locale decoding of subprocess output** mangled UTF-8 in diff context lines
   (`→` became mojibake), same symptom, different cause.
5. **Regression detection matched failures at file granularity only.** A file
   with four passes and one failure reports the *test* name, so partial-file
   regressions were invisible — this let two broken patches through to merge.
6. **Fixtures requiring a runner flag the suite omitted** were counted as model
   regressions. Five tasks were wrongly marked as breaking the build.

Faults 5 and 6 are the instructive pair: one made the instrument **blind to real
failures**, the other made it **invent failures that did not exist**. A floor
measured on an unaudited harness is a number about the harness.

One further trap belongs to the task set rather than the rig: **1 of 17
candidate defects had already been fixed** before the run. A stale task scores
every model as failing, and there is no signal in the result to reveal it —
re-verifying each defect against current HEAD is not optional.

## Return conditions

The floor moves on either of two events, and re-measuring before then is waste:
a first-party routing capability in the agent harness (the third-party proxy
route was rejected — it is explicitly unsupported for non-first-party models, and
in practice broke the terminal it was configured in), or a successor open-weight
model in the 20–40B range fitting the same 24 GB card.
