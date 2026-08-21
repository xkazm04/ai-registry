---
layer: technique
type: technique
subject: assessment-instrument-validation
technique: minimum-cohort-and-inconclusive-verdicts
status: forged
laws: [absence-of-evidence-is-not-evidence, a-claim-carries-its-sample-and-its-basis, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [designing the verdict vocabulary of a validation run, a validation ran on too few submissions, a scoring path errored and the run still returned a number]
---

# Minimum cohort and inconclusive verdicts

A validation gate with two outcomes is a gate that lies under pressure. Every
ambiguous run — three submissions, a scoring path that half-errored, an
instrument shape the harness could not exercise — has to be forced into pass or
fail, and the forcing is never neutral. Calling it a fail blocks a launch on
what everyone agrees is thin evidence, so it gets called a pass, and an
instrument nobody measured ships carrying an approval.

The fix is a verdict vocabulary that can say *I do not know* and a sample floor
that triggers it automatically, so the honest answer is the default rather than
an act of courage.

## Four verdicts, and what each one means

- **pass** — the run executed, the cohort met the floor, every threshold in the
  gate was cleared. This is the only state that certifies.
- **fail** — the run executed, the cohort met the floor, and a threshold was
  missed. A real finding: the instrument does not discriminate as required.
- **inconclusive** — the run executed but cannot support a conclusion. The
  cohort was below the floor, or margins fell inside the tolerance band, or a
  required comparator was absent. The evidence is genuinely insufficient
  ([a-claim-carries-its-sample-and-its-basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
- **not evaluable** — the run could not be performed. Inputs missing, the
  scoring path errored, the instrument is of a shape this harness cannot
  exercise. Nothing was measured, so nothing may be concluded — including
  nothing bad.

The last two are frequently collapsed into one, and the collapse costs you the
distinction that matters operationally: *inconclusive* is fixed by gathering
more evidence, *not evaluable* is fixed by repairing the harness or the inputs.
Merging them sends every ambiguous run to the wrong owner.

The precedence between them is fixed, and it is worth stating explicitly because
a rollup that gets it wrong hides real findings: **a real signal always beats the
absence of one.** Any measured violation makes the run a *fail*, even if other
checks were unmeasurable. Otherwise, a thin-but-present cohort makes it
*inconclusive*. Only when every unresolved check was blocked by an empty cohort
is the run *not evaluable*. And only when every check resolved true is it a pass.

## The two rules that make the vocabulary hold

**Inconclusive never certifies.** It is not a soft pass, it does not satisfy a
strict flag, and it does not disappear in a rollup where a summary counts
"non-failures". Anywhere a verdict is rendered, all four states are rendered
distinctly. The moment inconclusive is displayed in the same colour as pass,
the vocabulary has silently become two-valued again
([absence-of-evidence-is-not-evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).

**No data must never read as unfair.** This is the rule with teeth, because the
same verdict vocabulary runs over real submissions once the instrument
deploys. When the harness could not evaluate a submission, the honest render is
*not evaluable*. Rendering it as a poor score, a zero, or a neutral middling
value manufactures an adverse claim about a person out of an empty cell — and
in a selection context that empty cell becomes a rejection
([uncertainty-resolves-toward-the-candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)).
The asymmetry is deliberate: a wrongly-held submission costs a review; a
wrongly-scored one costs somebody the role.

The same rule governs a partially-completed run. Rates are computed over the
**evaluated subset**, never over the roster. Dividing by everything invited
turns pending work into evidence of a defect and understates every measured
margin.

## Setting the floor

The floor is a minimum number of submissions per compared group, and it is
argued about more than any other number in the gate, so it needs the most
explicit reasoning.

Set it from what the comparison must survive, not from what is convenient:

- **A comparison of means needs enough observations that one outlier cannot
  carry it.** Below a handful, a single unusually-scored submission moves the
  group mean past any margin you could set.
- **The floor is per compared group, not per run.** Twenty submissions with
  nineteen strong personas and one weak one does not meet a floor of five.
- **A floor for a synthetic cast is not a floor for a real cohort.** Synthetic
  submissions are constructed to differ; human submissions cluster. The real
  cohort floor is higher and belongs to the practice that computes rates over
  real people.

Where the floor is not met, the run reports the actual count beside the verdict.
"Inconclusive" alone tells the reader nothing; "inconclusive: 3 submissions in
the weak group, floor is 5" tells them exactly what to do next.

## Procedure

1. **Define the four states in one place** and make every consumer of the run —
   report, exit status, dashboard, certification flag — read that definition.
2. **Check evaluability first.** If inputs are missing or the scoring path
   errored, return *not evaluable* and stop. Do not compute margins over partial
   output.
3. **Check the cohort floor next**, per compared group, before any threshold.
4. **Only then evaluate the gate thresholds** and return pass or fail.
5. **Render the count and the floor with every non-pass verdict**, plus which
   threshold or which input was responsible.
6. **Make the strict path refuse fail and inconclusive — and think twice about
   not evaluable.** A certification mode that accepts inconclusive is not a
   certification mode: the sample was measured and found too thin, and letting it
   through is exactly the pressure this vocabulary exists to resist. *Not
   evaluable* is the subtle one. It never certifies either, but treating it as a
   hard failure teaches the organisation that an empty run means the instrument
   is unfair or non-discriminating, which is a claim nobody measured. The
   defensible arrangement is that a strict run refuses fail and inconclusive as
   errors, and reports not-evaluable loudly as an unperformed run routed to
   whoever owns the harness — never as a violation, never as a certification.

## Decision rules

- **When a run is inconclusive twice in a row for the same reason, fix the
  cohort, not the floor.** The floor moving to accommodate the cohort is the
  gate accommodating the answer.
- **When the scoring path errors on some submissions, those submissions are not
  evaluable and are excluded from rates** — and their count is reported. A
  silent exclusion inflates every remaining margin.
- **When a stakeholder asks for the inconclusive runs to be counted as passing
  "for now", write the request down with a name against it**
  ([every-decision-names-its-actor](../../../_laws.md#every-decision-names-its-actor)).
  The next reader of those scorecards needs to know the instrument was never
  certified.
- **When rolling up many runs, report the four counts, never a percentage of
  passes.** A pass rate computed over runs that include inconclusives hides the
  exact thing the vocabulary exists to surface.

## When not to use it

Nothing here applies to an instrument that has no gate at all — an exploratory
scoring experiment nobody will act on does not need a verdict vocabulary, and
imposing one produces ceremony without a decision behind it. The four states are
also not a substitute for a human review of a *fail*: the vocabulary tells you
which runs deserve attention, it does not diagnose the instrument. And the floor
is not a fairness threshold; the minimum cohort at which a selection-rate ratio
between protected groups becomes stable is a different, larger number owned by
the adverse-impact practice.
