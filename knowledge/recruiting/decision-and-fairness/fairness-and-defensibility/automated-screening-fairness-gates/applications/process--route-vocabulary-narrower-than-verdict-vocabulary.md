---
layer: application
type: application
subject: automated-screening-fairness-gates
technique: route-vocabulary-narrower-than-verdict-vocabulary
stack: process
status: forged
verified_on: 2026-08-20
---

# Two vocabularies in one prompt pipeline

Every LLM hiring task in `pipeline/jobfit/automation.py` emits a verdict, and exactly one
field of that verdict is machine-actionable. The two sets are declared next to each other,
fourteen lines apart, with the asymmetry spelled out.

## The declarations

`automation.py:85-98`:

```python
RECOMMENDATIONS: tuple[str, ...] = ("advance", "hold", "reject")
RECOMMENDATION_FALLBACK = "hold"
RECOMMENDATION_CHOICES = "|".join(RECOMMENDATIONS)
SCREEN_ROUTES: tuple[str, ...] = ("advance", "hold")
```

- `RECOMMENDATIONS` is "the canonical advance|hold|reject vocabulary every LLM HR task
  emits and the whole pipeline branches on. Defined ONCE here (previously an inline
  literal repeated in each prompt + a duplicated coerce tuple) and mirrored on the TS side
  in `app/_lib/interview-recommendation.ts`."
- `RECOMMENDATION_FALLBACK = "hold"` carries the reason inline: "Never silently `advance`
  (could auto-progress a candidate) or `reject` (the fairness gate forbids a silent
  auto-reject) — `hold` routes to the human Decisions gate."
- `SCREEN_ROUTES` is documented as "a strict SUBSET of the verdicts. `screen_candidate()`
  collapses (recommendation, confidence, fairness gate) into `result["route"]` ∈ this set,
  which the TS layer reads to auto-advance vs. queue for review."

`RECOMMENDATION_CHOICES` is rendered into the prompt text rather than typed by hand,
"derived so the legal set is stated in exactly one place and the prompt can never list a
stale vocabulary."

## The collapse

`automation.py:474-480` computes the route after the model has spoken and after the
fairness gate has overridden it:

```python
advance = result["recommendation"] == "advance" and result["confidence"] >= POLICY["screen_advance_conf"] and not early
result["route"] = "advance" if advance else "hold"
```

Three properties of the standard are visible in those two lines: the model's `reject`
recommendation survives in `result["recommendation"]` for the human who receives the hold;
confidence (`screen_advance_conf: 80`) can only narrow the route from advance to hold,
never widen it; and there is no expression anywhere that can produce a route of `reject`.

## The coercion default is context-aware

`coerce_recommendation` (`automation.py:114`) validates a raw verdict against the
canonical set and returns the fallback otherwise. The screening task passes a better
default than a blind hold — `rec = coerce_recommendation(payload.get("recommendation"),
det["recommendation"])`, with the comment "Off-set / missing verdict falls back to the
deterministic builder's own (context-aware) recommendation rather than a blind 'hold'".
That is safe here only because the deterministic builder is itself under the shield: its
own bottom branch is `("hold" if early else "reject")`, and the post-model override at
`:474-479` rewrites any `reject` for a shielded candidate anyway.

## The contract enforces the narrowing

`pipeline/jobfit/llm/bench/contracts.py:42-58` validates a screening payload and applies
the two vocabularies separately:

```python
if payload.get("recommendation") not in RECOMMENDATIONS: ...
if payload.get("route") not in {"advance", "hold"}: ...
```

The recommendation may be any of the three; the machine-actionable `route` field admits
only `advance` or `hold`. A payload carrying `route: "reject"` is a contract violation
caught at the boundary, not an outcome.

## The consumer honours it

`app/_lib/pipeline-stages.ts:205` — `screenStageOutcome(stage, route)` — is the only
consumer of the route, and it never rejects: `const cleared = route === "advance"`, and
every other case returns `held_for_review`. Its docstring states the rule for the funnel
entry stage: screening a fresh applicant "ALWAYS moves them into Screened — the same fair,
archetype-neutral, never-reject Accepted→Screened move the policy pass makes once a
candidate is scored. The screen's confidence only decides how they land." A non-screening
stage is advisory only: the verdict is recorded and nothing moves.

## Deviation

The narrowing is enforced by convention and by the bench contract, not by the type system:
`route` is a plain string on the wire, and `SCREEN_ROUTES` is a tuple that no serializer
consults at runtime in the production path. The standard asks for a closed type at the
boundary so the unsafe value has no representation. The repo's coverage is strong on
declaration and on validation-in-bench, and thin on structural impossibility.
