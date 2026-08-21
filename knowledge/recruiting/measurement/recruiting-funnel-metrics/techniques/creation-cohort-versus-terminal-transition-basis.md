---
layer: technique
type: technique
subject: recruiting-funnel-metrics
technique: creation-cohort-versus-terminal-transition-basis
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [two funnel figures disagree, choosing a denominator for a conversion rate, reading a rate that keeps rising after publication]
---

# Creation cohort versus terminal-transition basis

Every funnel figure is drawn on one of two bases, and the choice determines
what the number can and cannot see. Naming the basis resolves most
disagreements between two "correct" figures in one sentence.

## The two bases

**Creation cohort.** Membership is fixed by when a candidate *entered*: "of
the candidates created in the second quarter, what became of them". The
denominator is closed and honest — everyone who could have converted is in it.
The cohort is **censored**: on any observation date some members are still in
flight, so every outcome rate is a lower bound that rises for weeks after
publication without anything changing.

**Terminal-transition basis.** Membership is fixed by when a candidate
*finished*: "of the hires made in the second quarter, what was true of them".
Complete by construction — every member has an outcome — and therefore
**survivorship-biased**: it can only describe the population that got through.
A process that degraded last month is invisible here until its victims finish.

The two bases answer different questions and neither is more honest. What is
dishonest is not saying which one is on the screen.

## Which basis each metric family takes

- **Velocity** (time to hire, time to fill) is necessarily terminal: an
  unfinished candidate has no duration. Label it as terminal and pair it with
  in-flight age, which is the leading indicator the terminal figure lacks.
- **Conversion** (application to interview, interview to offer) requires a
  creation cohort plus a maturity horizon. Computed on a terminal basis it
  measures nothing coherent, because the numerator and denominator are drawn
  from populations that entered at different times.
- **Volume** takes whichever basis its consumer needs, but must say: "offers
  extended in March" (transition-dated) and "offers belonging to the March
  cohort" (creation-dated) are different counts and routinely differ by 30% or
  more in a growing funnel.
- **Outcome** rates (acceptance, early attrition) are terminal on the
  numerator's event and must therefore take a terminal denominator too — see
  the acceptance-denominator technique for the specific trap.

## The maturity horizon

A creation-cohort conversion rate is only readable once the cohort has had
time to convert. The horizon is empirical: take the completed cohorts and find
the age at which, say, 90% of eventual outcomes had landed — often six to ten
weeks for a standard professional funnel, far longer for executive search.
Then:

- Cohorts **younger than the horizon** are rendered as *maturing*, with their
  in-flight share shown, and are never compared against mature cohorts. They
  are not "worse"; they are unfinished. Coercing an unfinished cohort into a
  finished-looking rate is
  [absence of evidence rendered as a value](../../../_laws.md#absence-of-evidence-is-not-evidence).
- Cohorts **at or past the horizon** carry a rate, with their residual
  censoring stated.

The failure this prevents is the recurring false alarm: the current quarter
always looks catastrophic against the last one, every quarter, and everyone
learns to ignore the chart.

## The mixed-basis ratio — the most common wrong number

Dividing this month's *hires* (terminal-dated) by this month's *applications*
(creation-dated) produces a figure that:

- is structurally too low, because the month's hires came mostly from earlier
  cohorts while the month's applications have barely started;
- rises for weeks after the month closes with no process change;
- swings violently with inflow — a marketing push that doubles applications
  halves the "conversion rate" overnight while the process is untouched;
- cannot be compared to itself across periods of different growth.

The reason it survives code review for years: **the two bases are identical
over an unbounded window.** All-time, the set of candidates who were hired and
the set of hires that closed are the same set, so one stored count serves both
meanings and nothing is visibly wrong. They diverge the moment a date filter
is introduced — typically as a small "last 30 days" toggle that nobody
reviewed as a change of definition. When a windowed view is added to an
all-time metric, every per-hire and per-cohort figure downstream must be
re-derived against an explicitly chosen basis, and the two meanings given two
names in the payload so a future reader cannot pick the wrong one.

It is not a conversion rate. If a single headline figure is genuinely needed,
publish the last fully mature creation cohort and date it explicitly, rather
than a fresh number that is wrong.

## Procedure

1. Write the metric as a sentence beginning "of the candidates who…". If the
   sentence needs two different dates to be true, you have a mixed basis.
2. Pick the basis the question demands, not the one with data ready.
3. For a creation cohort, attach the maturity horizon and the in-flight count.
4. For a terminal basis, attach the survivorship caveat in one clause and pair
   with the in-flight population where a leading indicator is needed.
5. Print the basis next to the number, in the number's own label — not in a
   footnote, not in a tooltip, not in documentation.

## Decision rules

- When a stakeholder reports a different figure for the same metric, ask for
  their basis before ever checking arithmetic; it is the answer about four
  times in five.
- When a rate would be computed over a window shorter than the maturity
  horizon, render the maturing state instead of the rate.
- When a cohort is defined by a filter a viewer's permissions applied, the
  cohort is a different cohort and the label says so.
- When re-entry exists in the model, decide once whether a re-entering
  candidate joins a new creation cohort or stays in the original, and enforce
  it in one place. Both conventions are defensible; having both is not.

## When not to use this

Do not impose cohort machinery on a pure operational count. "How many
candidates are waiting for feedback right now" is a state question with no
basis to choose; wrapping it in cohorts adds latency and confusion to
something a recruiter needs to be literally current.

Do not use creation cohorts for anything a recruiter is meant to act on
today. Cohort rates are a diagnostic instrument for the process owner; the
person working the pipeline needs current state and stage aging.
