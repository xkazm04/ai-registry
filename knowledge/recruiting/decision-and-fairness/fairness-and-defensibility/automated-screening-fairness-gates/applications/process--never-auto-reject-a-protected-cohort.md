---
layer: application
type: application
subject: automated-screening-fairness-gates
technique: never-auto-reject-a-protected-cohort
stack: process
status: forged
verified_on: 2026-09-26
---

# The shield in a spawned Python screening pipeline

The hiring pipeline in this repo is a Python analysis process (`pipeline/jobfit/`)
spawned by a TypeScript app. The deterministic policy pass and the model-backed screen
live in `pipeline/jobfit/automation.py`, and the cohort shield is implemented there four
times over — as policy data, as a pre-model gate, as a post-model override, and as a
stage rule — with the protected set itself living outside the module. It is not the only
automated path: the TypeScript screening wave (`app/_lib/screen-wave.ts:233`) has its own
auto-reject eligibility and reads the shield through the live registry reader.

## The whole policy is a handful of numbers

`automation.py:136-166` holds `POLICY`, described in its own comment (`:135`) as "the
only place rules live". The original nine keys are unchanged:

```python
"bau_advance_score": 70, "bau_advance_conf_low": 65, "bau_reject_score": 40,
"screening_auto_days": 2, "stale_days": 21, "aging_days": 30,
"rematch_floor": 55, "rematch_max": 2, "screen_advance_conf": 80,
```

and two volume keys joined them on 2026-09-16 (`"screen_volume_sparse_max": 5`,
`"screen_volume_moderate_max": 30`), "Hand-mirrored into
app/_lib/automation-cache-key.ts" (`:161-163`). The aging tier is resolved in
TypeScript (`:168-175`), so "the only place" is now qualified in the file itself.

The band between 40 and 70 is the undecided region, and it is 30 points wide — the
majority of the realistic score mass routes to a human. `screen_advance_conf: 80` is the
confidence floor for auto-advance; there is no corresponding confidence number for
rejection, because that path does not exist.

The adverse half of the policy ships **off**: `app/_lib/decision-config-schema.ts:58-62`
sets `SCREENING_DEFAULT = { autoRejectEnabled: false, rejectBottomPercent: 20,
maxMatchToReject: 45 }`. A workspace that has not made a deliberate decision does not
auto-reject anybody.

## The protected set has one source, enforced by a source-scanning test

`automation.py:350` reads the set from the shared registry rather than declaring it:

```python
_EARLY_CAREER = registry.early_career_archetypes()
```

with the comment (`:348-349`) "single-sourced from the shared registry (`archetypes.json`)
so the in-code fairness levers ... can't drift from the scorer's set." On the TypeScript
side, `app/_lib/archetypes.ts:21` holds a build-time bundled copy of the same file, and
`app/_lib/archetype-live.ts` re-reads the file at runtime for every server decision,
because an operator can edit the registry while the app runs.

`pipeline/jobfit/tests/test_early_career_single_source.py` (208 lines) is the
enforcement, and it is the anchor worth copying: it does not merely test behaviour. It
pins the canonical literal `CANONICAL_EARLY_CAREER = {"student", "career_switcher"}`
(`:37`) and the registry's set against it (`:107-115`), asserts every consumer module
derives its set from the registry (`:117-144`), guards the `_EARLY_CAREER` binding by AST
(`:146-167`), **and scans the Python sources so the shadowed hand-written tuple cannot be
reintroduced** (`:169-183`) — in any bracket form, after a bug found a set literal
slipping past a class that only covered `()` and `[]` (`:44-53`). The docstring states
the reason (`:9-11`): "a divergence between the two would mis-route a protected
candidate with ZERO error — exactly the silent failure the fairness gate exists to
prevent."

## Three placements around the model call

`screen_candidate` (`automation.py:1057`) applies the shield before, during and after the
model call:

- **Before** — `:1077-1078`: `forced_hold = early and (candidate.potential_score or 0) >
  0.5 and m.total < 55`, commented "PRE-LLM FAIRNESS GATE: a learnable-gap early-career
  candidate is never auto-rejected."
- **During** — the prompt carries the instruction when `early` is true (`:1100-1101`):
  "This is an EARLY-CAREER candidate — judge on potential, frame gaps as learnable, and
  never recommend a hard reject; prefer 'hold' for a human."
- **After** — `:1184-1188`, under the comment "Apply the fairness gate + routing AFTER
  the model/fallback (model cannot override it)": a `reject` is rewritten to `hold` for a
  forced-hold candidate *and* for any early-career candidate. A volume gate follows
  (`:1189-1194`), and the route at `:1195-1196` carries `and not early`, so the route of
  an early-career candidate is never advance either.

## The stage machine says it in one line

`evaluate_entry` (`automation.py:952`) is the deterministic policy pass. Under `if role
== "screening":` (`:1005`) the order of its guards is the doctrine (`:1013-1020`):

```python
if early:
    return out("hold", None, "early-career: human screening gate (never auto-advance/reject)")
if not scored:
    return out("hold", None, "screened without a match score; awaiting match (not auto-rejected)")
if score < POLICY["bau_reject_score"]:
    return out("reject", None, f"BAU score {score} < {POLICY['bau_reject_score']}")
```

Two earlier guards, a recent human screening decision (`:991`) and a pending approval
(`:1011`), come first. The shield is checked before the score is compared to anything,
and the unscored branch sits between them — the docstring records the incident behind
it (`:963-964`): without that branch "an unscored entry would collapse to `int(None or 0)
== 0` and be rejected for `0 < bau_reject_score`, silently turning a data gap into a
rejection."

## The route held and the outcome did not, until 2026-09-26

A workspace can set its screening gate to `"auto"`, trusting the model's advance
verdicts: a review parked only because confidence was below 80 is ratified unattended.
The ratify branch (`app/_lib/automation-run.ts`) tested the *recommendation*, and Python
leaves an early-career candidate's `advance` recommendation standing while it holds the
route. So in an auto workspace a student or career-switcher the route had held was
advanced without a person, and so was an unknown archetype. Fixed in kp `0faded607`: the
branch re-derives the shield through `readLiveArchetypes()` before it ratifies, with four
new cases in `automation-run.test.ts` (student, career switcher, null, an unregistered
id) that auto-ratified before the change and park after it.

## Deviations

- **Two readings of "protected".** A per-archetype `fairnessProtected` flag exists in
  `archetypes.json` and is settable on custom archetypes in the archetype manager. The
  TypeScript gate shields on `def.fairnessProtected === true || def.scoringModel ===
  "early_career"` (`archetypes.ts:65-66`); Python's automation gate keys only on the
  scoring model (`registry.py:109-110`), and `fairness_protected_archetypes()`
  (`:113-114`) is never read by `automation.py`. A custom archetype marked protected but
  scored as experienced is shielded in TypeScript only: `evaluate_entry` proposes the
  reject (the TS backstop then refuses it) and `screen_candidate` does not hold it. This
  is the second definition the technique calls a production incident, with the backstop
  standing between it and a candidate.
- **The members are named by a career-stage label.** The shielded set is `student` and
  `career_switcher`. A student is detected from enrollment, an expected graduation and
  under a year of relevant experience, and a switcher from a wish to change domain.
  The student signals are the age-signalling terms the technique's membership rule warns
  about. A career the detector cannot read, which falls to its no-signal default, is
  persisted as the unshielded `bau` (see the fail-closed application), so the shield
  covers the thin first CV and not the unread long one.
- **No periodic review** of whether the shielded set still matches where the scorer
  misreads people. The screening wave's calibration holdout
  (`DEFAULT_HOLDOUT_PERCENT = 5`, `decision-config-schema.ts:64-69`) calibrates the
  threshold, not the set.
