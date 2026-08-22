---
layer: application
type: application
subject: prompt-fitness-and-evolution
technique: mutation-taxonomy
stack: process
status: forged
verified_on: 2026-08-20
---

# A closed mutation taxonomy over dispatch prompts

Realized in the PoF codebase as `MutationType` (`src/types/prompt-evolution.ts:81`) with its
transforms in `src/lib/prompt-evolution/mutations.ts:14` and its authoring surface list at
`mutations.ts:68`. Eight strategies, enumerated in a union type, each with a heuristic text
transform applied client-side for instant feedback and refinable through a CLI agent for the
complex cases.

| Strategy | Transform | Description shown to the author |
| --- | --- | --- |
| `imperative-rewrite` | `toImperative` | Rewrite with direct commands ("You must create…") |
| `add-examples` | `addExampleHints` | Inject inline code example hints |
| `step-by-step` | `toStepByStep` | Break into numbered sequential steps |
| `holistic` | `toHolistic` | Merge into a single comprehensive paragraph |
| `add-context-hint` | `addContextHint` | Prepend project context reminder |
| `shorten` | `shorten` | Remove redundant detail and filler |
| `add-verification` | `addVerification` | Append build/compile verification step |
| `swap-ordering` | `swapOrdering` | Reorder numbered steps / files |

## What the closure buys

The union type is the taxonomy. `applyMutation` (`mutations.ts:14`) switches over it with no
default arm, so the type checker refuses a ninth strategy that is not also given a transform,
a style and a label — the enumeration and the implementation cannot drift apart. Every variant
carries `mutationType` and `parentId` (`prompt-evolution.ts:26-29`), so the lineage is a tree
with an attributable edge, not a pile of prompt texts.

`shorten` is the member that matters most for prompt cruft: removal is a first-class mutation
with a hypothesis ("no quality loss, less cost"), which is what makes a clause retirable on
evidence rather than permanently load-bearing by default.

## Lineage starts automatically

`PromptVariant.source` marks `seeded` as the auto-captured baseline: the first dispatch of a
checklist item with no variants records the **exact** prompt that was sent as v1
(`prompt-evolution.ts:17-24`). No one has to remember to start the lineage, which is the
difference between a taxonomy that exists and one that has a parent to mutate from.

## Style is classified, not applied

`classifyStyle(prompt)` (`mutations.ts:164`) derives a `VariantStyle` — `imperative`,
`descriptive`, `step-by-step`, `holistic`, `example-rich`, `minimal`
(`prompt-evolution.ts:5`) — from the prompt text. Note the deliberate split: `mutationType` is
*what was done to the parent*, `style` is *what the result reads like*. They are correlated
(each mutation declares the style it produces) but they are separate fields, because a variant
that arrived by hand-editing still has a style and no mutation, and a variant that arrived by
mutation should not have its style re-asserted in two places.

## Deviation from the standard this subject teaches

The eight strategies mix axes: `imperative-rewrite` and `holistic` are register/format
rewrites, while `add-verification` and `add-context-hint` add requirements the output must
satisfy. A revision that switches register *and* adds a proof obligation is attributable to
neither, and the taxonomy as written offers no way to say "constrain, holding register
fixed". The standard stays as the technique states it — one axis per strategy — and this
realization is a partial one. The set is nonetheless closed, typed and lineage-bearing, which
is the majority of the value.

Two of the eight are also the family the golden path calls out as producing durable gains:
`add-verification` appends a proof obligation ("verify the build compiles successfully; fix
any errors before finishing"), and the authoring technique at
`src/lib/prompts/quality/index.ts:101` (`TEXT_TECHNIQUE`) is the same move at full scale —
single source of truth with the arithmetic shown, forward-derive rather than reverse-engineer,
sibling-sourced cross-references, prove hard cases inline, scope depth to the subject, refuse
vaporware. That revision is recorded as having taken every text step type from roughly the
40s to ≥90 against the bands in `src/lib/judge/rubrics.ts` (90 = shippable, 70–89 =
competent placeholder, <70 = fail), with 6 of 6 authoring agents converging on it
independently.
