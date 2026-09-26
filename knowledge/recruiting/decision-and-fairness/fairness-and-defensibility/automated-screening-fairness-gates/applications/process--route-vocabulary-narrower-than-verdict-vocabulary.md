---
layer: application
type: application
subject: automated-screening-fairness-gates
technique: route-vocabulary-narrower-than-verdict-vocabulary
stack: process
status: forged
verified_on: 2026-09-26
---

# Two vocabularies in one prompt pipeline

Every LLM hiring task in `pipeline/jobfit/automation.py` emits a verdict, and one field
of that verdict is meant to be machine-actionable. The two sets are declared next to each
other, thirteen lines apart, with the asymmetry spelled out.

## The declarations

`automation.py:358-371`:

```python
RECOMMENDATIONS: tuple[str, ...] = ("advance", "hold", "reject")
RECOMMENDATION_FALLBACK = "hold"
RECOMMENDATION_CHOICES = "|".join(RECOMMENDATIONS)
SCREEN_ROUTES: tuple[str, ...] = ("advance", "hold")
```

- `RECOMMENDATIONS` is "the canonical advance|hold|reject vocabulary every LLM HR task
  emits and the whole pipeline branches on. Defined ONCE here (previously an inline
  literal repeated in each prompt + a duplicated coerce tuple) and mirrored on the TS side
  in `app/_lib/interview-recommendation.ts`." The bench contract still declares its own
  copy (`pipeline/jobfit/llm/bench/contracts.py:11`), so "once" is true of the
  production path only.
- `RECOMMENDATION_FALLBACK = "hold"` carries the reason inline (`:360-362`): "Never
  silently `advance` (could auto-progress a candidate) or `reject` (the fairness gate
  forbids a silent auto-reject) — `hold` routes to the human Decisions gate."
- `SCREEN_ROUTES` is documented (`:367-369`) as "a strict SUBSET of the verdicts.
  `screen_candidate()` collapses (recommendation, confidence, fairness gate) into
  `result["route"]` ∈ this set, which the TS layer reads to auto-advance vs. queue for
  review."

`RECOMMENDATION_CHOICES` is rendered into the prompt text rather than typed by hand
(`:364-366`, used at `:1105`), "derived so the legal set is stated in exactly one place
and the prompt can never list a stale vocabulary."

## The collapse

`automation.py:1195-1196` computes the route after the model has spoken, after the
fairness gate has overridden it (`:1184-1188`) and after the volume gate (`:1189-1194`):

```python
advance = result["recommendation"] == "advance" and result["confidence"] >= POLICY["screen_advance_conf"] and not early
result["route"] = "advance" if advance else "hold"
```

Three properties of the standard are visible in those two lines: the model's
recommendation survives in `result["recommendation"]` for the human who receives the
hold (a `reject` survives for an experienced candidate; for a shielded or volume-blocked
one it has already been rewritten to `hold`); confidence (`screen_advance_conf: 80`) can
only narrow the route from advance to hold, never widen it; and there is no expression in
this module that can produce a route of `reject`. The role-run engine has its own,
separate `ScreenRoute` type with a `"reject_proposed"` member
(`app/_lib/role-run-stages.ts:475`), set only for an entry already withdrawn, rejected or
missing and gated on a person.

## The coercion default is context-aware

`coerce_recommendation` (`automation.py:387-395`) validates a raw verdict against the
canonical set and returns the fallback otherwise. The screening task passes a better
default than a blind hold (`:1149-1151`): the deterministic builder's own
recommendation, "rather than a blind 'hold'". That is safe here only because the
deterministic builder is itself under the shield. Its bottom branch is now three-way
(`:1130-1135`):

```python
if early:
    rec, conf = "hold", 65
elif not may_reject:
    rec, conf = "hold", 55
else:
    rec, conf = "reject", 65
```

and the post-model override rewrites any `reject` for a shielded candidate anyway. The
API is looser than its one caller: `default` is an unchecked string, so a future caller
could pass a value outside the set.

## The contract enforces the narrowing, in the bench

`pipeline/jobfit/llm/bench/contracts.py:42-58` validates a screening payload and applies
the two vocabularies separately, the route against a literal (`:56`):

```python
if payload.get("recommendation") not in RECOMMENDATIONS: ...
if payload.get("route") not in {"advance", "hold"}: ...
```

The contract is used by the model bench (`pipeline/jobfit/llm/bench/scenarios.py:276`), not by production, so a
payload carrying `route: "reject"` is caught when a model is benchmarked, not when a
candidate is screened.

## The consumer honours it, and the TypeScript parse closes it

`app/_lib/automation-run.ts` parses the route with `coerceScreenRoute`
(`app/_lib/interview-recommendation.ts:71-81`), which checks it against `ROUTE_SET =
new Set(SCREEN_ROUTES)` and returns the closed type `ScreenRoute`, defaulting to
`"hold"`. It then hands it to `screenStageOutcome(stage, route)`
(`app/_lib/pipeline-stages.ts:249`), which never rejects: `const cleared = route ===
"advance"`, and every other case returns `held_for_review`. Its docstring states the rule
for the funnel entry stage: screening a fresh applicant "ALWAYS moves them into
Screened — the same fair, archetype-neutral, never-reject Accepted→Screened move the
policy pass makes once a candidate is scored." The closed type is lost on that hop,
because `screenStageOutcome` takes `route: string`.

## A second actionable field, closed 2026-09-26

When a workspace sets its screening gate to `"auto"`, `automation-run.ts` ratifies a
parked review unattended if the *recommendation* is `advance`. That is a deliberate
relaxation of the confidence floor, and it made the recommendation a second
machine-actionable field. Because the route cannot say why it held, the relaxation also
advanced candidates held by the fairness shield, whose `advance` recommendation Python
leaves standing. kp `0faded607` re-derives the shield in that branch, so the
relaxation now acts only where the route held for confidence. A route that carried its
hold reason would let the branch say so directly.

## Deviations

- **Holds carry no structured reason.** The `screening_hold` event records only the
  recommendation, so neither a reviewer nor the audit can tell a confidence hold from a
  shield hold, a volume hold or a parse fallback.
- **The recommendation is shown first.** The decisions ledger renders the model's verdict
  as a badge on every row, beside quick accept and reject
  (`app/features/hiring/decisions/ledger/LedgerCells.tsx:54`), and the candidate's
  decision bar shows it again
  (`app/features/hiring/pipeline/candidate/decision/CandidateDecisionBar.tsx:52`).
  Nothing records the reviewer's own reading before the reveal. The self-reported
  confidence is kept off that badge, and a test holds it off
  (`app/features/shared/confidence-vocabulary.test.ts:118`).
- **Python's side is not closed.** `SCREEN_ROUTES` is read in Python only by
  `pipeline/jobfit/eval/automation_eval.py:128` and by tests; the Python production path writes the route
  from the two-line collapse above, not through a type.
