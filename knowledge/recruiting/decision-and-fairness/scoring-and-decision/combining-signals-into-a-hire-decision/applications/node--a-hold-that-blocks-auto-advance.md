---
layer: application
type: application
subject: combining-signals-into-a-hire-decision
technique: a-hold-that-blocks-auto-advance
stack: node
verified_on: 2026-09-27
verified_against: node@24
---

# The promote gate that will not advance on a score (Node/TypeScript)

`promoteSubmission` (`app/_lib/devcase-run.ts:1052`) is the seam where a Python
evaluation of a take-home submission becomes a pipeline entry and a
`screening_review` decision card. It is the concrete implementation of a
three-valued verdict whose hold is load-bearing: three conditions can each
force a hold on their own, and none of them can be out-scored.

## The verdict is one value, computed once, shared everywhere

The return type declares the intent before the code does
(`app/_lib/devcase-run.ts:1029-1044`): `recommendation: "advance" | "hold"`, plus
the machine-readable `reasonCodes` behind it. The comment makes it a contract
rather than a field: it is "The SAME advance/hold verdict written onto the
screening_review card, surfaced to every caller so nothing downstream (a
candidate-facing comm, an audit row) re-derives a threshold in a second place
and drifts from this one" (`:1031-1033`).

Note what is absent from the union: `reject`. The machine-actionable set here is
exactly `advance | hold`, mirroring the Python side's `SCREEN_ROUTES`
(`pipeline/jobfit/automation.py:371`) — "a strict SUBSET of the verdicts" —
while the full vocabulary `("advance", "hold", "reject")` lives at
`pipeline/jobfit/automation.py:358` with `RECOMMENDATION_FALLBACK = "hold"`
(`:363`) for "an unknown / empty / malformed verdict: the safe middle state.
Never silently `advance` … or `reject`". The vocabulary is derived into the
prompt string (`RECOMMENDATION_CHOICES`, `:366`) "so the legal set is stated in
exactly one place and the prompt can never list a stale vocabulary", and coerced
on the way back at `:395` (`return rec if rec in RECOMMENDATIONS else default`).

## One pure rule, three ways to hold, none a subtraction

Since 2026-09-23 the rule lives in its own module, shared by the promote path
and the postings preview (`app/_lib/devcase-run.ts:1078-1081`):

```ts
const lowConfidence = isNum(input.confidence) && input.confidence <= LOW_EVAL_CONFIDENCE;
…
return { recommendation: clears && !suspect && !lowConfidence ? "advance" : "hold", reasons };
```
(`app/_lib/devcase-promote-verdict.ts:81`, `:94`)

The conjunction is the whole technique in one expression: the score clearing the
floor is *necessary and not sufficient*. There is no weighting, no penalty, no
threshold at which a strong enough transfer score reaches `advance` past a
suspect authenticity band. The third hold is new: an absent transfer score
pushes `not_scored` and never clears (`:86-87`), where the old expression
read a missing score as 0.

Each blocker carries its incident in the comment:

- **Authenticity** (`devcase-run.ts:1068-1071`) — "a suspect-authenticity
  submission may be a paste-from-LLM, so it's never auto-advanced on transfer
  score alone: it's held for the live interview that verifies ownership of the
  decisions (the minted followups), with the authenticity concern surfaced to
  the reviewer."
- **Evidence confidence** (`:1073-1076`) — the propagated confidence "was
  silently dropped here, so a deterministic-fallback evaluation advised
  "advance" as confidently as a fully-grounded one. Low evidence never
  auto-advances." The number tested is the MIN of the upstream confidences
  computed by `_propagated_confidence`
  (`pipeline/jobfit/devcase/evaluate.py:301`), now multiplied by the share of
  the rubric actually scored (`:530`).

## The hold carries its reasons and its flags

`reasons` comes from `promoteAuditReasons` (`devcase-run.ts:1180`,
`devcase-promote-verdict.ts:126-144`), so the card can answer "why did this
advance / hold?" later — the field's own comment names explainability and
compliance as the driver (`devcase-run.ts:1037-1039`). The flags are pushed to
the *front* of the recruiter-facing list with the resolving action stated
(`:1181-1192`):

> "Process-authenticity is suspect (n/100) — verify the candidate authored this
> before advancing." (the score in brackets only when one exists)
> "Evaluation evidence-confidence is low (n) — the scores rest on thin/fallback
> evidence; verify live before advancing."

Both sentences name the specific check and the next step, which is what makes
the hold actionable rather than decorative.

## The field-name collision, caught in a comment

The card's `confidence` field carries the **transfer score**, not the 0..1
evidence confidence (`:1198-1201`): "this field carries the transfer SCORE (the
card UI's existing contract), not the 0..1 evidence-confidence — which now gates
the recommendation above instead of being silently dropped." Two different
quantities under one name is exactly how the evidence confidence went missing
in the first place; the display contract won, and the safety quantity lost.

## Deviations from the standard

- **No coverage blocker and no discrepancy rule.** The standard also holds on
  coverage below a minimum and on an unresolved discrepancy between comparable
  signals. Neither exists: there is no discrepancy rule anywhere in the tree, and
  coverage only scales the confidence. A quarter of the rubric missing lowers
  confidence by a quarter, which a well-evidenced file absorbs (see the
  weighting application's experiment).
- **The two runtimes read an absent confidence differently.** The TypeScript
  rule treats it as "no signal, no penalty" (`devcase-promote-verdict.ts:61`);
  the Python scale treats unknown evidence as 0.0. The standard says unknown
  strength is the floor, never silently high.
- **The hold has no owner and no clock.** `recordAutomationEvent(entry.id,
  "screening_hold", …)` (`devcase-run.ts:1209`) writes the trail, but nothing
  assigns the hold or ages it toward a named person. The standard's "every hold
  has an owner and a clock" stands.
- **Clearing a hold records its actor, not its basis against the flag.** A
  human accept or reject seals the actor and the pre-write card's
  recommendation and score (`app/_lib/pipeline-entry-action.ts:506-526`), and
  has done so since 2026-08-04 — the earlier version of this application missed
  it. What is still missing is which flag the clearing resolved, and how.
- **Hold rates are not in the adverse-impact measurement.** Nothing counts
  held-and-aged files as non-selections by group.
