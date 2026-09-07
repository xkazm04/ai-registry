---
layer: technique
type: technique
subject: generative-provider-routing
technique: unspent-budget-is-a-defect
status: forged
laws: [cost-per-usable-output, unmeasured-is-not-pass]
shared_with: []
use_when:
  - a generation budget is raised to buy access to a higher-capability provider
  - a pipeline runs unattended and decides for itself how much to spend
  - a run finishes on time, under budget, with no refusals, and the output is flat
  - deciding what a spend control should report besides overspend
---

# Unspent budget is a defect

Every spend control in this subject points one way. A ceiling is checked
before the call, a budget refusal never re-routes, actuals book against the
next window, expected rejects are multiplied into the forecast. The
enumeration is careful and it is one-directional: it exists to stop a run
from spending more than it was given. Nothing in it can see a run that spent
*less*, and nothing asks whether the plan's first entry — the one
[capability-to-vendor-plan](./capability-to-vendor-plan.md) says holds its
position because it currently wins on cost per usable output — was ever
called at all.

The technique is the other half of that control: **a budget is an allocation
with a floor, not only a ceiling, and the reachability of the plan's top
entry is a measured property of the run.**

## Why a ceiling is read as a score

Any producer that decides its own spend optimizes the number it is measured
on, and a ceiling is usually the only number stated. "You have this much"
carries no target, so the behaviour it selects for is minimization — not as
a bug, but as the correct reading of the only instruction given.

The observation that makes this concrete: two generative production runs,
executed independently against the same brief and the same stated credit
budget by different autonomous producers, both treated the budget as a score
to conserve rather than a resource to allocate, and **neither ever called the
highest-capability provider available to it** — the one the budget had been
raised specifically to reach. Two independent producers converging on the
same disposition, with no contact between them, is what distinguishes this
from one run's timidity.

## The defect is invisible to every control already here

That is what makes it worth a technique rather than a note. Walk the run
through the existing instruments and each one reports health:

- The **pre-call ceiling** never fires. Nothing was refused.
- **Actuals** book comfortably under estimate, so the next window's check is
  looser still.
- **Cost per usable output** looks excellent — and it is computed over the
  renders that happened, on the tier that produced them. A cheap tier
  measured only on cheap work returns a flattering number that says nothing
  about the tier that was skipped.
- The **elimination trail** is empty, correctly: no vendor refused, no hop
  occurred, nothing dropped out. There was no departure from the plan to
  record, because the plan was never walked past its cheapest usable entry.
- Per [unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass), a
  capability that was never called is **unmeasured**, not judged — but no
  gate is looking, so the run reports pass.

The result is the silent near-miss raised from a field to a whole run: on
time, on budget, no error anywhere, and flat.

## The two checks

**State the budget as a range, and report the floor breach.** A run carries
an expected consumption band per capability, not a single cap. A run that
finishes below the floor is *reported* — not blocked, not congratulated —
with the band and the actual beside each other. The report is the entire
mechanism; an operator who sees "expected 60–90, spent 12" asks the question
themselves, and an operator who sees only "under budget" never does.

**Make plan-top reachability a run-level fact.** For each capability the run
exercised, record whether the plan's first entry was called. A first entry
that goes uncalled across a whole run has exactly two explanations, and they
demand opposite actions:

- it does not deserve its position, and the grid that ordered the plan is
  stale — re-measure, per
  [cost-per-usable-economics](./cost-per-usable-economics.md); or
- the producer never reached for it, because the budget framing selected
  against it or because no stage of the run ever arrived at the work that
  entry serves.

Either way it is a finding. Neither is an economy, and the two are
distinguishable only because the fact was recorded at the time.

## The boundary this shares with delivery promise

The delivery promise lock catches substitution across delivery *kinds* — a
motion piece served as animated panels, competently, with nothing in the
artifact saying so. This catches the same substitution one axis over:
**across capability tiers inside one kind**. A run can satisfy its delivery
kind, clear its fulfilment ratio, and still have been produced entirely on
the tier below the one it was funded for. The promise's metric cannot see it,
because the promise is about what was delivered and this is about what was
reachable while delivering it.

## Decision rules

- When a budget is raised to buy a capability tier, treat the raise as a
  hypothesis. An unspent budget leaves it untested, and the provisioning
  decision stays unevaluated into the next run.
- When a run reports under-floor, ask whether the work reached the stage the
  expensive tier serves before asking whether the tier is worth it. A
  producer that never got to the shot the premium model was for has a
  sequencing problem, not a pricing one.
- When the plan's first entry is uncalled twice running, re-run the grid
  rather than re-tuning the framing. The position is a claim about a
  measurement, and two silent runs are enough to suspect the measurement.
- Never convert the floor into a quota the producer can satisfy by spending
  on the wrong work. The floor is reported to a human; a floor enforced
  mechanically buys expensive renders of whatever was cheapest to generate.

## When not to use it

A prototype legitimately lives at the bottom of its plan; the cost-per-usable
grid already says the method prices decisions that recur, and a floor over
tens of renders reports noise. The rule binds where a budget was provisioned
*specifically* to reach a tier — the moment someone pays for access to a more
expensive provider, an uncalled entry is the thing worth knowing. And where
one entry serves every capability, there is no plan top to reach and the
reachability half is vacuous; the floor report still applies.
