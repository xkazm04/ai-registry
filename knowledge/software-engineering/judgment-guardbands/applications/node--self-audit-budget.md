---
layer: application
type: application
subject: judgment-guardbands
technique: self-audit-budget
stack: node
verified_on: 2026-08-20
---

# The discrepancy budget — forty lines, most of them the argument

`src/lib/scoring/discrepancy-policy.ts:1-41` is a module whose entire runtime
surface is one constant and one pure function; the rest is the reasoning, and
the reasoning is the reusable part.

## The threat model, named in the header

The opening comment states why a budget exists at all:

> repo file content enters the prompt, and a `discrepancies` entry DOUBLES that
> dimension's guardband (±25 → ±50) with no independent corroboration. Together
> those are a repo-authored channel into how far the model may move the number
> about that same repo.

Then the division of labour that this subject rests on:

> The prompt boundary (`scoring/prompt.ts`) removes the *authority* of repo
> text; this budget removes the *payoff* of getting an extra discrepancy
> emitted anyway.

That sentence is the seam between this subject and prompt-safety, written by
someone who had to implement both halves. Authority-removal is a boundary
discipline and can fail; payoff-removal is arithmetic and cannot.

## All-or-nothing, with both arguments

```ts
export const MAX_FLAGGED_DIMENSIONS = 2;
```

The rule, as stated at `:14-18`:

> at most MAX_FLAGGED_DIMENSIONS dimensions can be widened on one scan, and if
> MORE than that are flagged, NONE are widened (a scan whose audit claims most
> detectors are broken is not a scan where the model has earned more trust — it
> is a scan whose discrepancy channel is unreliable, whether from a
> hallucination or from planted text).

Note that the evidential argument covers both causes with one response —
hallucination and planted text get the same treatment, which is what makes the
policy implementable without a detector for intent. And the structural
argument at `:19-20`:

> All-or-nothing rather than "keep the first N" on purpose: any "keep N" rule
> needs a tie-break the model can steer (ordering), and a partially-honoured
> blanket claim is the worst of both.

Followed immediately by what the budget substitutes for (`:21-22`):
"Corroboration by re-running the detector — the ideal fix — is not available
here: the engine receives already-computed signals, so the budget is the
enforceable half."

## Eligibility before counting

`applyDiscrepancyBudget` (`:36-41`) takes *eligible* dimensions, not raw flags,
and the docstring says why: a deterministic dimension, a failed or dropped
detector, or an unknown id "can't be [widened], so counting them would blow the
budget on claims that never moved a number." Filter, then count, then decide —
the ordering the technique requires so that suppression is never triggered by
flags that were inert anyway.

The returned `WidenDecision` carries `widened`, `capped` and `flaggedCount`
rather than just the set: the count survives into the warning and into
`scoreIntegrity.widenCapped`, so an over-budget run is attributable later.

## Both outcomes suppressed together

`src/lib/scoring/engine.ts:125` binds the two grants to one budget:

```ts
const d9Unmeasurable = !widenBudget.capped && hasD9VisibilityBlindSpot(...);
```

An audit distrusted for over-flagging loses its exclusions as well as its
widenings. And the unmeasurable path itself (`engine.ts:186-196`) is the
technique's safer grant, implemented exactly as described: the security
dimension's deterministic 0 is treated as "a visibility blind spot, not a
measured absence", the dimension is renormalized out as n/a rather than
counted, and the comment closes the loop on the payoff question — "The LLM
only marks it unmeasurable here; it never raises the D9 number."

The user-facing warning when the budget blows (`engine.ts:128-133`) is worth
copying verbatim as a house style for this class of message, because it states
the policy rather than the symptom: "A self-audit that suspects most detectors
is treated as unreliable, not as licence to move further from the evidence;
the scores below stay pinned to the deterministic signals."
