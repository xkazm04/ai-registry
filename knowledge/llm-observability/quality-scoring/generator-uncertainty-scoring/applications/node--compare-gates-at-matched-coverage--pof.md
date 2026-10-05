---
layer: application
type: application
subject: generator-uncertainty-scoring
technique: compare-gates-at-matched-coverage
stack: node
verified_on: 2026-10-05
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# A refusal line keyed by grader, and the report that forgot which one ran

The version witness is `package-lock.json`, which resolves `@types/node` to
24.13.3; the tree pins no engines field and no CI node version.
The tree is the PoF repo (`pof`) at `f6f1286a`, read on 2026-10-05. The seam is
the image-to-3D input gate: a vision grader scores a concept image 0-10, and a
line on that score decides whether a paid generation may start.

## What the tree already decided

The gate is already per-grader, and it says why in its own words:

- `src/lib/visual-gen/input-gate.ts:71 "A threshold is fitted to its grader. DEFAULT_GATE was measured on the hosted Qwen chain"`
- `src/lib/visual-gen/input-gate.ts:84 "'qwen3.8:27b': { passAt: 9, failBelow: 8 },"`
- `src/lib/visual-gen/input-gate.ts:68 "const DEFAULT_GATE: GateThresholds = { passAt: 7, failBelow: 5 };"`

The local 27B grader got its own refitted row on 2026-09-22, after an arena on
hand-labelled inputs showed it spending the scale differently from the hosted
chain the default was measured on. Every other grader still reads the default.
The router can reach several of them for the same capability:

- `src/lib/vision/router.ts:111 "prod: { recognize: ['ollama', 'qwen-cloud', 'gemini']"`

A local model swap behind the same provider, or a fallback to the third
provider, is judged on a line that was fitted to a different grader.

## Arm A and arm B, read from the recorded arena

The arena's raw answers are committed (`.ai/arena/input-gate.jsonl`, three
graders, two repeats, identical across repeats). Replayed against the truth
set's current 88 labelled inputs (19 good, 69 bad):

| Grader | Bad admitted at the shared line (no good refused) | At its own line (highest refusing no good input) | Separation |
| --- | --- | --- | --- |
| 27B (has a row) | 21 | 7 (line 8) | 0.988 |
| 9B distill | 14 | 6 (line 8) | 0.953 |
| 12B | 28 | 15 at line 8, 12 at line 9 | 0.984 |

Read at the shared line, the 9B leads by seven bad inputs. At matched
operating points it leads by one, and 8 of its 19 good inputs sit exactly on
its line, which is why the tree gave it no row. The ranking held. The size of
the lead did not, and each shared-line count is two to three times the
grader's own.

## The change

The gate card already carried `model` and `thresholdsFrom`, but the outcome the
generate route reports dropped both. So a job could not say that its verdict
had been read on another grader's line. The commit keeps them on the outcome,
and the note now names the line:

- `src/lib/visual-gen/input-gate.ts:168 "default line, not fitted to ${card.model}"`
- `src/lib/visual-gen/input-gate.ts:191 "thresholdsFrom: card.thresholdsFrom,"`

**Target:** reported outcomes that name the grader and whose line decided them.
**Floor:** verdict and refusal identical for every answer. Over all 267
recorded answers, the same cards went through both arms. Arm A, the previous
outcome type, named the line on 0 of 267. Arm B names it on 267 of 267. 178
of the 267 answers (every answer from the 9B and the 12B) were read on the
default line, and all 178 now say so. Verdicts held on 267 of 267, and
refusals on 267 of 267. The gate's own suites passed (32 of 32).

## What this realization cannot do

It discloses a borrowed line; it does not fit one. The 12B's own line
(line 8: 15 of 69 admitted, none of 19 refused, no good input on the line) is
not shipped, because the 2026-09-22 run set a pass set of twenty before
another row moves, and the truth set holds nineteen. The third provider has
never been measured on this gate at all, so its operating point is unknown,
not merely borrowed. And the scale is integer: no line separates inputs that
the same grader puts on the same score, so "matched" is the nearest point
both graders can reach, never an exact one.
