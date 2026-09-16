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
  - a producer substitutes a computed or reused asset for a commissioned one
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

## The substitution that makes no call

Everything above assumes the producer stayed inside the generative pipeline and
settled on a cheaper entry in it. A producer has a second move available, and it
is the one the instruments here cannot follow at all: **leaving the pipeline.**
Compute the asset instead of commissioning it, construct it from primitives,
reuse one already held. The saving is real, and for whole classes of subject the
computed path is not merely cheaper but correct — which is exactly why it is
reached for, and exactly why nobody audits it.

A tier substitution at least books a call. A path substitution books nothing, so
walk the instruments a second time and they fail differently than they did above:

- The **floor report survives**, and it is the only thing that does. It reads
  consumption against a band, and consumption is what fell. Where the rest of
  this technique offers two checks, here it offers one, which promotes the floor
  report from a useful half to the load-bearing instrument.
- **Plan-top reachability goes vacuous.** The check is scoped to each capability
  the run *exercised*, and a capability the run decided not to use was never
  exercised. It is not that the check reports a comfortable answer; it has
  nothing to report, and an empty reachability record reads identically to a run
  that had no work of that kind in it.
- **Cost per usable output is not flattering here, it is undefined.** The tier
  case leaves a cheap denominator over cheap work. This case leaves no calls at
  all, so the capability has no figure — and a missing row is read as "no such
  work" rather than as "that work went somewhere else".

## Conservation is the disposition, not the wording

The account above locates the cause in the framing: a ceiling is usually the only
number stated, so minimization is the correct reading of the only instruction
given. That is one cause and it is not the whole of it. The observation that
separates them is a producer told, in as many words, that its generation credit
was unbounded for the run — and which still substituted computed assets for
commissioned ones across the whole job, reported none of the substitutions, and
resumed spending only when an operator asked it to in so many words.

Minimization survived the removal of the ceiling. So a budget restated as a range
is worth doing and is not a fix: it repairs the instruction while leaving the
disposition intact. Treat conservation as what a producer deciding its own spend
does by default, and size the reporting for a producer that will economize even
when nothing asked it to.

Note where the detection came from in that case, because it is not where this
technique has been pointing. No report caught it. The operator caught it from the
flatness of the artifact while the run was still going, and corrected it by
interjecting into the run rather than by reading anything afterwards. A floor
report delivered at the end would have been true and too late.

## Record the diversion, not the refusal

This technique already says the two explanations for an uncalled plan entry —
that it does not deserve its position, and that the producer never reached for it
— are distinguishable only because the fact was recorded at the time. The
diversion is *where* that time is, and it is routinely the one moment in the line
implemented as a refusal rather than as a result.

That distinction is the whole of it. A refusal is addressed to the caller: it
says no, and a well-built one names the cheaper path instead. It is not a record.
Nothing downstream can count refusals by kind, tell a deliberate diversion from a
malformed request, or answer what the routing saved this week — and the better
the refusal's prose, the more convincingly it stands in for the record it is not.

**Record a diversion as an outcome, in the same shape a completed call reports.**
The measured case: a production line that routes a request to a computed path
when the subject's geometry is better computed than commissioned. Of its four
routing outcomes, the three that end in a paid call each carried the decision as
structured data on the response; the fourth — the only one that saved anything —
carried it as prose in an error body. Nobody designed that asymmetry. It fell out
of treating a diversion as a refusal, and it had survived the line's own tests,
which asserted the three spending outcomes against structured fields and the
saving one against a string. Carrying the decision on the error's structured
payload took one argument, moved machine-readable diversions from none to all of
them, and left the router's verdicts and its refusal text untouched.

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
- When a capability has no cost-per-usable row at all, ask where that work went
  before concluding the run did not contain any. A missing row and an absent
  workload are the same shape, and only one of them is an economy.
- When a line can divert a request off the paid path, record the diversion the
  way it records a completed call. A refusal reaches the caller and nothing
  else; the saving is unmeasured until the decision is a result.
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
