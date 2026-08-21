---
layer: technique
type: technique
subject: requirement-inflation-control
technique: ninety-day-outcome-as-the-despec-filter
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, every-decision-names-its-actor]
shared_with: []
use_when: [deciding whether a stated requirement belongs on the must line, a requisition arrives as a list with no stated outcomes, a requestor defends a requirement you cannot evaluate]
---

# The ninety-day outcome as the de-specification filter

The set of things the person must have gotten **done** by the end of their
first ninety days is the admission test for every hard requirement. Nothing
enters the must line unless one of those outcomes becomes unreachable without
it. The rule is stated as an implication and applied without hedging: **a
must-have that maps to no ninety-day outcome is a nice-to-have.**

The device is a filter, not an elicitation move. Surfacing outcomes in the
first place is the intake conversation's job and it has its own ordering rule
(outcomes before requirements, so requirements never get to anchor). This
technique is what you do with the outcome set once you have it: use it as the
gate every candidate requirement must pass.

## Why it de-specifies where argument does not

Requirement disputes are unwinnable in the register they arrive in. "Do we
really need five years?" invites the requestor to defend their judgment, and
people defend judgments they would have abandoned if never challenged. The
outcome filter changes the register from *importance* to *mechanism*: not "is
this important" but "which outcome fails without it, and how". Three
properties follow.

- **It has a wrong answer that the requestor can see.** When the requestor
  works through four outcomes and none of them needs the line, the conclusion
  arrives in their own reasoning. Nobody had to be talked out of anything.
- **It produces the basis, not just the verdict.** A requirement that passes
  emerges attached to the outcome it protects — which is exactly what the
  screening rubric, the interview design and any later challenge will need.
  A requirement stated without its basis is a claim about a person's fitness
  that cannot say what it was computed over
  ([a-claim-carries-its-sample-and-its-basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)),
  and here is the cheapest moment in the whole process to attach one.
- **It is symmetric.** The same pass that demotes also *promotes*: an outcome
  with no requirement covering it is a hole in the specification, and the
  filter finds those for free. A control that only ever shortens lists gets
  read as cost-cutting; one that also finds missing requirements gets read as
  rigour.

## The have-to-do reframe underneath it

The filter only works on a specification that has been flipped from *have* to
*do*. A requestor's native output is attributes — what the person must have.
Attributes have no failure condition, so they cannot be filtered. Deliverables
do. The reframe is the move that makes the whole technique operable: ask for
five or six things the person will **deliver**, phrased as completed results
with a date, and every requirement then has something concrete to justify
itself against.

This is also the standing repair for the backfill specified as a portrait of
whoever left. "They knew the legacy system" is an attribute of a person;
"the legacy system's monthly extract runs without escalation by week six" is a
deliverable, and it admits three different kinds of person.

## The procedure

1. **Fix the outcome set before touching the list.** Three to five outcomes,
   each a completed thing rather than an activity — "the weekly close runs
   without manual reconciliation" and not "owns the close process". An
   activity cannot fail, so it cannot filter.
2. **Take each candidate must-have in turn and ask which outcome it is
   load-bearing for.** One requirement, one question, in the requestor's
   hearing. Do not batch; a batched pass gets answered as a whole and the
   individual demotions never happen.
3. **Ask *how* it is load-bearing, not just whether.** "It'd help with all of
   them" is a non-answer. The usable form names a mechanism: without it, this
   outcome slips past day ninety, or is reached but wrong, or needs someone
   else's time the team does not have.
4. **When no outcome claims it, reflect the trade-off and stop.** "So this one
   isn't blocking any of the four — it looks like a strong preference rather
   than a filter. Want it as a nice-to-have?" Then let them answer. Never
   move it yourself; the demotion belongs to the person whose need it was
   ([every-decision-names-its-actor](../../../_laws.md#every-decision-names-its-actor)).
5. **Sweep the other way.** Any outcome with no requirement pointing at it is
   read back as an open question: what would someone need to have done before
   for you to believe they can land this one?

## Decision rules

- **Ninety days, not the first year.** A twelve-month horizon re-admits
  everything, because almost any capability is load-bearing for *something*
  within a year. The short horizon is what gives the filter teeth: it selects
  for what cannot be learned in the ramp, which is the same line as
  prerequisite-versus-learnable grading, arrived at from the other side.
- **An outcome the requestor cannot state is not an outcome you may supply.**
  Offering one and having them nod produces a filter built on the recruiter's
  guess, wearing the manager's authority. Offer role-shape hypotheses as
  disposable proposals, marked as yours, or run the session without them.
- **No outcomes at all is a finding, not a blocker.** A requestor who cannot
  describe a first-quarter result has a workload complaint or a departure to
  process, not a role. Report that. It is frequently the moment a requisition
  is correctly withdrawn, split or rescoped, and it is worth far more than
  the shortened list you would otherwise have produced.
- **A regulated credential skips the filter.** A licence a jurisdiction
  requires in order to perform the work at all is required by law, not by an
  outcome. Confirm the credential and the authority that mandates it; do not
  make the requestor justify it against day ninety.
- **Filter at intake, never after the shortlist.** The same question costs one
  sentence before sourcing and costs the recruiter their standing afterwards:
  a challenge to the requirements raised once the pipeline is visibly thin
  reads as an excuse for the thin pipeline, not as advice, and the requestor
  is right to hear it that way. If a requirement was missed at intake, the
  honest move is to say the list was under-examined and re-run the filter as a
  named exception — not to introduce it as a diagnosis of the search.
- **Run the filter once per requirement, at grading time.** Re-running it at
  every downstream stage re-opens settled decisions and trains the requestor
  to stop volunteering requirements — the shorter list you then see is a
  hidden one, not a cleaner one.

## What passing looks like on the record

A requirement that survives carries three things: the outcome it protects,
the mechanism by which it protects it, and the fact that the requestor
affirmed the pairing. A requirement that fails carries the same three fields
with the third reading *demoted by the requestor*. Both are useful; the
second is what lets you answer, three months later, why a line everyone
remembers discussing is not in the brief. How those fields are stored,
versioned and attributed is the structured-brief practice's concern — this
technique's obligation is to produce all three rather than leaving two of
them in the recruiter's head.

## When not to use it

- **On a nice-to-have.** Preferences do not filter anyone, so the filter buys
  nothing and costs a turn. Grade it and move on.
- **On a role with a genuinely long ramp by design** — a rotational programme,
  an apprenticeship, a role whose first quarter is training. There the
  ninety-day outcome is "completed the programme's first module", which
  filters almost nothing, and the honest instrument is the outcome at the end
  of the *ramp* with that horizon stated explicitly rather than smuggled in.
- **As a rejection rationale.** The filter decides what goes on the must line;
  it never speaks about a specific person. A candidate is measured against the
  published requirement, not against a reconstruction of the outcome debate
  that produced it.
- **Mid-elicitation, as an interruption.** If the requestor is deep in a
  narrative about the work, let it run — the outcomes usually fall out of it.
  Filtering is a pass over a list, and a list you do not have yet cannot be
  filtered.
