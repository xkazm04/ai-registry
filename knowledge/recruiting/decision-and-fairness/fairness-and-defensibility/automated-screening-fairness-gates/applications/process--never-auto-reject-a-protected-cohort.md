---
layer: application
type: application
subject: automated-screening-fairness-gates
technique: never-auto-reject-a-protected-cohort
stack: process
status: forged
verified_on: 2026-08-20
---

# The shield in a spawned Python screening pipeline

The hiring pipeline in this repo is a Python analysis process (`pipeline/jobfit/`)
spawned by a TypeScript app. All automated hiring judgment lives in
`pipeline/jobfit/automation.py`, and the cohort shield is implemented there four times
over — as policy data, as a pre-model gate, as a post-model override, and as a stage
rule — with the protected set itself living outside the module.

## The whole policy is nine numbers

`automation.py:62-73` holds `POLICY`, described in its own comment as "the only place
rules live":

```python
POLICY: dict[str, int] = {
    "bau_advance_score": 70, "bau_advance_conf_low": 65, "bau_reject_score": 40,
    "screening_auto_days": 2, "stale_days": 21, "aging_days": 30,
    "rematch_floor": 55, "rematch_max": 2, "screen_advance_conf": 80,
}
```

The band between 40 and 70 is the undecided region, and it is 30 points wide — the
majority of the realistic score mass routes to a human. `screen_advance_conf: 80` is the
confidence floor for auto-advance; there is no corresponding confidence number for
rejection, because that path does not exist.

The adverse half of the policy ships **off**: `app/_lib/decision-config-schema.ts:58-62`
sets `SCREENING_DEFAULT = { autoRejectEnabled: false, rejectBottomPercent: 20,
maxMatchToReject: 45 }`. A workspace that has not made a deliberate decision does not
auto-reject anybody.

## The protected set has one source, enforced by a source-scanning test

`automation.py:77` reads the set from the shared registry rather than declaring it:

```python
_EARLY_CAREER = registry.early_career_archetypes()
```

with the comment "single-sourced from the shared registry (`archetypes.json`) so the
in-code fairness levers ... can't drift from the scorer's set." The TypeScript side reads
the same registry file (`app/_lib/archetypes.ts`).

`pipeline/jobfit/tests/test_early_career_single_source.py:1-45` is the enforcement, and
it is the anchor worth copying: it does not merely test behaviour. It pins the registry's
set to the canonical literal `{"student", "career_switcher"}`, asserts every consumer
module derives its set from the registry, **and scans the Python sources so the shadowed
hand-written tuple cannot be reintroduced** — in any bracket form, after a bug found a
set literal slipping past a class that only covered `()` and `[]`. The file's own
docstring states the reason: "a divergence between the two would mis-route a protected
candidate with ZERO error — exactly the silent failure the fairness gate exists to
prevent."

## Three placements around the model call

`screen_candidate` (`automation.py:404`) applies the shield before, during and after the
model call:

- **Before** — `automation.py:409-410`: `forced_hold = early and (candidate.potential_score
  or 0) > 0.5 and m.total < 55`, commented "PRE-LLM FAIRNESS GATE: a learnable-gap
  early-career candidate is never auto-rejected."
- **During** — the prompt itself carries the instruction when `early` is true: "This is
  an EARLY-CAREER candidate — judge on potential, frame gaps as learnable, and never
  recommend a hard reject; prefer 'hold' for a human."
- **After** — `automation.py:474-479`, under the comment "Apply the fairness gate +
  routing AFTER the model/fallback (model cannot override it)": a `reject` from the model
  is rewritten to `hold` for a forced-hold candidate *and* for any early-career candidate,
  and the `route` computation carries `and not early`, so an early-career candidate is
  never auto-advanced either.

That last clause is the standard's "shield auto-advance too" rule realized: the score
that cannot be trusted downward is not trusted upward.

## The stage machine says it in one line

`evaluate_entry` (`automation.py:319`) is the deterministic policy pass. At the `Screened`
stage the order of its guards is the whole doctrine:

```python
if early:
    return out("hold", None, "early-career: human screening gate (never auto-advance/reject)")
if not scored:
    return out("hold", None, "screened without a match score; awaiting match (not auto-rejected)")
if score < POLICY["bau_reject_score"]:
    return out("reject", None, f"BAU score {score} < {POLICY['bau_reject_score']}")
```

(`automation.py:374-381`.) The shield is checked before the score is compared to
anything, and the unscored branch sits between them — the function's docstring records
the incident behind it: without that branch "an unscored entry would collapse to
`int(None or 0) == 0` and be rejected for `0 < bau_reject_score`, silently turning a data
gap into a rejection."

## What the repo does not have

The shield is defined by career archetype only. There is no mechanism for adding a cohort
the organization carries an affirmative obligation toward, and no periodic review of
whether the shielded set still matches where the scorer actually misreads people. The
standard asks for both; the repo covers the archetype half well and the governance half
not at all.
