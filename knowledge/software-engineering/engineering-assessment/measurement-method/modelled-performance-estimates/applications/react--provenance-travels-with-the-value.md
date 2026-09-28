---
layer: application
type: application
subject: modelled-performance-estimates
technique: provenance-travels-with-the-value
stack: react
status: forged
verified_on: 2026-09-26
verified_against: react@19
---

# A spend estimate typed so it cannot be added to a measured cost, beside three price tables that disagree

Personas (a Tauri desktop app with a React front end) shows three preflight
cost figures before it runs anything: an arena match's spend, a fleet
dispatch's cost and wall-clock minutes, and an execution preview against a
monthly budget. None of the three was measured. Each is a token heuristic
multiplied by a price, which makes each a modelled estimate in this subject's
sense. The arena module is the best worked example of the provenance rule the
author has read in a front end. The three surfaces together are a worked
example of the basis rule failing: **one resolution function** is not
enforced. Citations are against commit `900b8f0b4` (read 2026-09-26).

## The class lives in a type, not a name

`EstimatedCost` (`src/features/agents/sub_lab/components/arena/arenaSpendEstimate.ts:38`)
wraps the dollar figure in a class with a private constructor, and the only
way to read the number back is `toUsd()`. The doc comment (`:28-37`) states
the technique's reason more sharply than the technique does: "the provenance
of this figure lives in the identifier, and an identifier does not survive an
arithmetic operator. As a bare number an estimate and a measured cost are the
same type and will be added, averaged and rendered alike - which is exactly
how a heuristic ends up gating a budget warning."

A naming convention (`estimated_*`) dies at the first sum. A wrapper survives
it, because the sum will not type-check until someone unwraps it on purpose.
This is the front-end form of the technique's "typed value that survives to
the outermost consumer".

`pricePerDuel` (`:70`) returns `null` for a model with no table entry
(`:72`), and `estimateArenaSpend` (`:79`) counts those duels as
`unpricedDuels` with their labels. They are kept out of the sum, not priced
at zero. The module header gives the reason (`:11-13`): "Coercing an Ollama
contender to zero would report a cheaper match than the one that runs".

The dispatch gauge carries a weaker sibling. `estimateDispatch`
(`src/features/fleet/monitor/grid/dockEstimate.ts:128`) returns
`assumedModel` (`:142`) beside the cost, and the dock's tooltip switches its
wording on it (`QuickDispatchDock.tsx:285`). That is one bit, not a rung. It
says the rate was assumed, and it does not say which rate.

## Deviation: the basis is resolved three times, from three tables

The arena module's header claims the prices come "from ANTHROPIC_TIERS, the
one place the app declares them" (`:10`). The tree has three tables for the
same model families, and they disagree:

| family | arena (`compareHelpers.ts:57`) | dispatch (`dockEstimate.ts:50-57`) | execution preview (`src-tauri/engine/src/cost.rs:15`, `:40`) |
| --- | --- | --- | --- |
| sonnet, in/out per MTok | 3 / 15 | 2 / 10 | 3 / 15 |
| opus | 5 / 25 | 5 / 25 | 15 / 75 |
| haiku | 1 / 5 | 1 / 5 | 0.25 / 1.25 |

So one Opus call is priced three times higher before an execution than before
an arena duel. Each surface is internally consistent, and each is labelled an
estimate. Together they are the case the technique's basis rule exists for:
"the computation and the basis record obtain each input from one resolution
function, so the two cannot disagree about what was assumed." Here the
disagreement is between surfaces rather than between a value and its record.
None of the three publishes the rate it used, so a reader comparing two
screens cannot tell that the gap is in the table and not in the workload.

Two smaller departures sit beside it.

- **An empty sum renders as a figure.** `ArenaSpendEstimate.cost` is "Zero
  when nothing priced is selected" (`:65`). A match whose contenders are all
  unpriced still renders the preflight body with a formatted `$0.00`, followed
  by the unpriced note (`ArenaPanelColosseum.tsx:261-273`). The refusal
  technique's rule is that a derived figure whose inputs are all absent is
  absent too. The head figure should be missing there, not zero.
- **Unset and unknown share a default.** In the dispatch gauge, an unset model
  and a model with no `RATES` entry both resolve to `DEFAULT_RATE`
  (`dockEstimate.ts:69`, `:134`). The comment justifies the unset case: the CLI's
  default is Sonnet (`:64-68`). An explicitly chosen model that has no rate is
  the refusal technique's "missing input", and it is priced as though it were
  the default.

The standard stays as written. The arena module shows the rung carried as a
type. The three tables show that the type alone does not carry the basis, and
the basis is what would have exposed a threefold gap in a single release.
