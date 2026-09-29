---
layer: application
type: application
subject: requirement-inflation-control
technique: must-have-soft-cap-and-forced-ranking
stack: process
status: forged
verified_on: 2026-09-29
applied: code
ab_verdict: better
---

# The cap in four places, and the one that trimmed

The soft cap is enforced or coached at four points in the same product, at three
different numbers and with three different remedies. Reading them side by side is
what found the one that behaved as a truncation.

## Where the cap lives

- **Intake persona, rule 9** (`pipeline/jobfit/intake.py:86`): "When must-haves
  exceed six, ask the requestor to rank the top three rather than accepting the
  list." The coaching form, with the ranking move and the number six.
- **Published-text lint** (`app/_lib/jd-lint.ts:82`, `:195`): `MANY_MUST_HAVES = 8`
  over the higher of an obligation-word count and a structured `mustHaveCount`. The
  tooling form, set above the coach's number as the technique prescribes. It reports
  a count and stops; there is no ranking remedy on this surface.
- **Role-design prompt** (`pipeline/jobfit/devcase/design.py:175`): "short and
  decisive (≤8)", instructed in prose and not enforced on the model's output.
- **Role-design keyless fallback** (`design.py:210`): a slice. This is the one that
  trimmed.

## The trimming slice, and the A/B

Before 2026-09-29 the fallback returned `musts[:6]` for any brief with a stated
grading. `musts` is the requestor's confirmed `must_have` rows, weight-ordered,
followed by the real-stack fill, so a brief with more than six stated rows lost the
lowest-weighted confirmed ones without a word. The same function's model path is told,
at `:164`, that every stated must "must appear in mustHaves"; so one brief produced two
different specs depending on whether a provider was configured.

One need with eight stated `must_have` rows (weights 0.95 down to 0.60), run through
the real `design_role` with no provider, at kp `4dd303bdd` (A) and after the change (B):

| stated rows | A returned | A dropped | B returned | B dropped |
| --- | --- | --- | --- | --- |
| 3 | 5 | none | 5 | none |
| 6 | 6 | none | 6 | none |
| 8 | 6 | `Git`, `Testing` | 8 | none |

B bounds `max(6, len(stated))`: the cap still limits what the fallback adds from the
real stack, and never what the requestor confirmed. New test red on A, green on B;
the 278 devcase tests pass (277 before). Landed in kp `006bf7a0a`, local, not pushed.
n is one need at three sizes: this shows the drop and its removal, not how often
briefs exceed six.

## What it says about the technique

The cap is a control on quantity that must decline to act on grades a human already
confirmed. "Never trim by position" is not enough: this slice trimmed by weight, which
reads as principled and is still a silent trim, because the requestor ordered nothing
and was never told. The technique's remedy stands (ask for a top three, at intake),
and the condition it gained is that a system-side bound applies to what the system
contributes, never to the confirmed list.

## Deviations from the standard

- **The lint still gives no ranking remedy** and its message copy states the pool
  premise the subject now conditions ("deters under-represented applicants"). The
  advertising subject banks the copy fix for the next pass over the four catalogs.
- **Three numbers, no shared home.** Six, eight and the fallback's six are separate
  literals; the technique wants the machine above the coach, and the fallback's six is
  a third use of the coach's number for a machine bound.
