---
layer: application
type: application
subject: combining-signals-into-a-hire-decision
technique: a-hold-that-blocks-auto-advance
stack: node
---

# The promote gate that will not advance on a score (Node/TypeScript)

`promoteSubmission` (`app/_lib/devcase-run.ts:779`) is the seam where a Python
evaluation of a take-home submission becomes a pipeline entry and a
`screening_review` decision card. It is the concrete implementation of a
three-valued verdict whose hold is load-bearing: two predicates can each force a
hold on their own, and neither can be out-scored.

## The verdict is one value, computed once, shared everywhere

The return type declares the intent before the code does
(`app/_lib/devcase-run.ts:760-771`):

```ts
recommendation: "advance" | "hold";
```

with the comment that makes it a contract rather than a field: it is *the same*
verdict written onto the card, "surfaced to every caller so nothing downstream (a
candidate-facing comm, an audit row) re-derives a threshold in a second place and
drifts from this one", and `"hold"` means "a human must verify before this reads
as an advance to ANYONE, including the candidate — the orchestrator's ranked
stage gates its comm on it."

Note what is absent from the union: `reject`. The machine-actionable set here is
exactly `advance | hold`, mirroring the Python side's `SCREEN_ROUTES`
(`pipeline/jobfit/automation.py:98`) — "a strict SUBSET of the verdicts" — while
the full vocabulary `("advance", "hold", "reject")` lives at
`pipeline/jobfit/automation.py:85` with `RECOMMENDATION_FALLBACK = "hold"`
(`:90`) for "an unknown / empty / malformed verdict: the safe middle state.
Never silently `advance` … or `reject`". The vocabulary is derived into the
prompt string (`RECOMMENDATION_CHOICES`, `:93`) "so the legal set is stated in
exactly one place and the prompt can never list a stale vocabulary", and coerced
on the way back at `:122` (`return rec if rec in RECOMMENDATIONS else default`).

## Two blockers, each sufficient, neither a subtraction

```ts
const suspectAuth = bundle.authenticity?.band === "suspect";
const lowConfidence = evalConfidence != null && evalConfidence <= LOW_EVAL_CONFIDENCE;
…
const recommendation =
  score >= floor && !suspectAuth && !lowConfidence ? "advance" : "hold";
```
(`app/_lib/devcase-run.ts:800-834`)

The conjunction is the whole technique in one expression: the score clearing the
floor is *necessary and not sufficient*. There is no weighting, no penalty, no
threshold at which a strong enough transfer score reaches `advance` past a
suspect authenticity band.

Each blocker carries its incident in the comment:

- **Authenticity** (`:796`) — "a suspect-authenticity submission may be a
  paste-from-LLM, so it's never auto-advanced on transfer score alone: it's held
  for the live interview that verifies ownership of the decisions (the minted
  followups), with the authenticity concern surfaced to the reviewer."
- **Evidence confidence** (`:801`) — the propagated confidence "was silently
  dropped here, so a deterministic-fallback evaluation advised 'advance' as
  confidently as a fully-grounded one. Low evidence never auto-advances." This
  is the standard's *confidence propagates by the weakest link* rule reaching the
  gate: the number being tested is the MIN computed by `_propagated_confidence`
  in `pipeline/jobfit/devcase/evaluate.py:80`.

## The hold carries its reasons and its flags

`reasons` is built unconditionally from the floor comparison and conditionally
from each blocker (`:835-840`), so the card can answer "why did this advance /
hold?" later — the field's own comment names explainability and compliance as the
driver (`:767-769`). The flags are pushed to the *front* of the recruiter-facing
list with the resolving action stated (`:841-850`):

> "Process-authenticity is suspect (n/100) — verify the candidate authored this
> before advancing."
> "Evaluation evidence-confidence is low (n) — the scores rest on thin/fallback
> evidence; verify live before advancing."

Both sentences name the specific check and the next step, which is what makes
the hold actionable rather than decorative.

## The field-name collision, caught in a comment

The card's `confidence` field carries the **transfer score**, not the 0..1
evidence confidence (`:856-858`): "this field carries the transfer SCORE (the
card UI's existing contract), not the 0..1 evidence-confidence — which now gates
the recommendation above instead of being silently dropped." Two different
quantities under one name is exactly how the evidence confidence went missing in
the first place; the display contract won, and the safety quantity lost.

## Deviations from the standard

- **Only two blockers.** The standard also blocks on coverage below a minimum and
  on an unresolved discrepancy between comparable signals. Neither exists here —
  and the discrepancy rule has no live implementation anywhere in this repo
  (the composite-with-discrepancy-cap module named in the wave's anchors,
  `app/_lib/evaluator/combined-health.ts`, is not present in the tree and cannot
  be cited).
- **The hold has no owner and no clock.** `recordAutomationEvent(entry.id,
  "screening_hold", …)` (`:866`) writes the trail, but nothing assigns the hold
  or ages it toward a named person; aging is surfaced generically by the Python
  policy pass instead. The standard's "every hold has an owner and a clock"
  stands.
- **Clearing a hold is not itself an attributed decision.** `setApproval`
  (`:851`) writes the card; a reviewer acting on it does not record a clearing
  actor and basis against the specific flag.
