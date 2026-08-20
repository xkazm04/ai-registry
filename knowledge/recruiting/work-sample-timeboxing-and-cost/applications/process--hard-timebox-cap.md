---
layer: application
type: application
subject: work-sample-timeboxing-and-cost
technique: hard-timebox-cap
stack: process
---

# The two-hour cap in the case-design pipeline

The case designer is a prompt pipeline (`pipeline/jobfit/devcase/design.py`). The
cap is a module constant with its reasoning written beside it
(`design.py:26-31`):

> "Hard cap on case length (UAT M8). The case's instrument is AMBIGUITY + a
> visible decision log, NOT volume — the candidate's code is assumed 100%
> LLM-generated — so a focused 'real work, ≤2h' exercise is the goal at every
> level. A half-day take-home drives a 40–60% drop-off among strong seniors, the
> exact pool this case is for. Seniority scales DEPTH / ambiguity (see the
> prompt), not hours."

`_MAX_TIMEBOX_HOURS = 2.0`. That comment is the standard's whole economic
argument in five lines, and the 40–60% figure — measured, not assumed — is what
turned "long take-homes lose good people" from a plausible claim into a number
this document can carry.

## The per-level table is bounded by the cap, by construction

`design.py:33-38`:

```python
# Seniority-scaled timebox, every value bounded by _MAX_TIMEBOX_HOURS.
_TIMEBOX = {"junior": 1.0, "medior": 1.5, "senior": 2.0, "lead": 2.0}
```

Four rows, one ceiling, and the top two rows are equal — lead does not get more
hours than senior, because there are no more hours to give. `_timebox()` resolves
an unrecognised seniority to the **middle** value (1.5), not the maximum: an
unknown level costs the candidate less, not more.

## The prompt states the cap as a scoping constraint

`design.py:274-279` is the calibration instruction, and it is the sibling
technique verbatim:

> "junior = narrow, well-scoped, more scaffolding, simpler probes; senior/lead =
> MORE AMBIGUOUS and judgment-heavy — raise the DEPTH and ambiguity, NOT the
> number of deliverables. The ~{timebox}h is a HARD cap: scope the tasks so a real
> candidate can genuinely finish in that budget (prefer 3-4 focused tasks; depth
> over coverage), and never pad a senior case with extra sub-deliverables to make
> it 'harder'."

Note what the instruction does: it hands the generator the *already-clamped*
number and makes the task list the dependent variable. The cap is not checked
after generation as a validation step — it is an input to the design, which is
the ordering the standard insists on.

The mid-flight requirement change is scheduled inside the same budget
(`design.py:295`, `design.py:402`): `afterMinutes` defaults to roughly a third of
the timebox and is clamped to land at least fifteen minutes before the end
(`design.py:456`), so the second phase is answerable rather than a trap on the
clock.

## Deviations

- **The cap is not enforced at the human review gate.** The reviewer edit path
  (`app/api/devcase/lifecycle/[id]/approve/route.ts:26`) accepts any
  `timeboxHours` in `(0, 80]` — a two-week exercise. The Python designer's cap
  and the reviewer's edit form disagree by a factor of forty. The standard's rule
  is that every writer of the number clamps; here only the generator does.
- **The model default sits above the cap.** `pipeline/jobfit/devcase/models.py:213`
  declares `timebox_hours: float = 4.0`, double the policy maximum. Any
  construction path that does not pass a value manufactures an over-policy
  exercise silently.
- **No cold-run calibration exists.** Nothing measures whether a generated
  two-hour case actually takes two hours. The validator
  (`lifecycle_eval.py:101-102`) only checks the number is positive — "case: bad
  timebox" fires at zero, not at unrealistic. The standard's cold run is
  unimplemented, and the cap's honesty currently rests on the generator's
  self-estimate.
- **No unpaid-labour terms.** There is no payment, intellectual-property or
  commercial-use statement anywhere in the candidate-facing case copy. The
  exercise is built on a synthetic materialized seed rather than live production
  material (`seed_materializer.py`), which is the right default and keeps the
  commercial-use question from arising — but the position is never stated to the
  candidate.
- **Drop-off is not measured by segment.** The 40–60% figure informed the cap and
  then stopped: no ongoing per-level or per-segment tracking of
  invitation-to-submission conversion exists, so a future regression in the same
  metric would be invisible.
