---
layer: application
type: application
subject: subsystem-review-doctrine
technique: ground-truth-pass-before-proposals
stack: process
status: forged
---

# Ground truth as Pass 0 of a UE5 module evaluator

`PoF` drives a deep-evaluation pipeline over the modules of a UE5 ARPG project. The prompt
templates live in `src/lib/evaluator/module-eval-prompts.ts`, and the ordering of passes is
declared at the top of that file:

```ts
// src/lib/evaluator/module-eval-prompts.ts:20
export const EVAL_PASSES: EvalPass[] = ['ground-truth', 'structure', 'quality', 'performance'];
```

`getPassesForModule` (`:449`) appends a module-specific fifth pass where one is defined —
today only `arpg-combat`, which adds `combat-trace`. Every module gets the four; the order is
not configurable per module, which is the point.

## The grounding checks

`GROUND_TRUTH_CHECKS` (`src/lib/evaluator/module-eval-prompts.ts:56`) is four lines and every
one of them is load-bearing:

```
- For each class you reference, name its parent class and its file path under Source/
- Name the specific UPROPERTY/UFUNCTION members you depend on
- Name ONE observable runtime behaviour you can verify for each
- If you CANNOT confirm any of the above from the actual source, do NOT propose changes —
  first request a read-only inventory of the missing class
```

Mapped to the technique: line 1 is **identity**, line 2 is **members**, line 3 is the
**observable-behaviour** anti-fabrication check, and line 4 is the **refusal branch**. The
accompanying description at `:53` states the intent in one sentence — "establish ground truth
before proposing any change" — so the model receives both the rule and its purpose.

The refusal branch is the reason this pass exists. UE5's C++ surface is large, versioned, and
heavily conventional, which is precisely the shape of API that a code model reconstructs from
priors rather than from the file: a plausible `AARPGCharacterBase` parent, a plausible
`UPROPERTY` that was renamed, a plausible ability entry point. Pass 0 forces the model to put
the actual declaration site on the page before it is allowed to recommend anything, and gives
it a legal way to stop when it cannot.

## What the later passes inherit

Because Pass 0 runs first for every module, the three passes after it are written as if their
premises hold. `getPassDescription` (`:429`) has `structure` asking about class hierarchy and
module boundaries, `quality` about UE5 convention and correctness, and `performance` about
tick cost and synchronous loads — none of them re-establishes that the classes exist, because
Pass 0 did or refused. That is the entitlement rule realised as prompt structure rather than
as prose advice.

## Deviations from the standard, recorded

- **The refusal is not machine-checkable.** `buildEvalPrompt` (`:395`) emits the same
  `FINDING_SCHEMA` (`:32`) for every pass — a JSON array of findings, with `[]` for none. A
  Pass 0 refusal therefore has no distinct representation: a model that refuses correctly and
  a model that found nothing both emit `[]`, and the pipeline cannot tell them apart. The
  standard says a refusal is a *result* and must render as one; the fix is a Pass 0 output
  shape carrying `confirmed[]` / `unconfirmed[]` and a boolean that blocks the later passes.
  The standard stays where it is.
- **Grounding is not enforced downstream.** Nothing prevents the structure pass from running
  when Pass 0 confirmed nothing, because the passes are dispatched as a list rather than as a
  dependency chain. Ordering is present; the gate between the links is not.

## Reusable shape

The transplantable part is small: four lines of prompt, one of which is a refusal, placed
first in a fixed pass list, with the later prompts written to assume its output. It costs one
extra model call per module and removes the whole class of findings that name code that is not
there.
