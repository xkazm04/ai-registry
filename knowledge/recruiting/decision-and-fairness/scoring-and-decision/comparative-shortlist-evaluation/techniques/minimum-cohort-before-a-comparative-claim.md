---
layer: technique
type: technique
subject: comparative-shortlist-evaluation
technique: minimum-cohort-before-a-comparative-claim
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [gating a compare view or ranked slate, deciding whether a leader may be named, reusing a fairness sample floor for a head-to-head]
---

# Minimum cohort before a comparative claim

Before any comparative language is generated — leader, strongest, ahead of,
stands out — the surface asks how many candidates it is actually comparing, and
refuses the vocabulary when the answer is too small to support it.

This sounds trivially obvious and is routinely absent, because the code path that
produces a comparison usually iterates a list and the list can have one element
without erroring. A single-candidate "comparison" then renders a leader, a rank
of one-of-one, and often a confident recommendation. Nothing in it is false and
all of it is misleading.

## The floor for a head-to-head is two, and it is ordinal

A comparative claim over a shortlist is an **ordinal** claim about specific named
people: *under this rubric, on this evidence, A scored above B.* It is not a
claim about a population, a rate, or a group. Two people are genuinely enough to
make it, because it is exactly a statement about those two.

So set the head-to-head floor at two and defend it against being raised. The
final pair is the single most common comparative situation in hiring, and a
system that refuses to compare two finalists because a statistician's rule of
thumb wanted thirty has failed at the job. The claim being made is not the claim
that rule of thumb governs.

## The statistical floor is a different constant with a different job

A selection-rate ratio, an adverse-impact test, a pass-rate-by-group figure, a
peer benchmark: these are claims about *proportions*, and a proportion over a
handful of people is not stable. Those floors live in the tens, are chosen from
the stability of the statistic and the identifiability of contributors, and have
nothing to do with the number of people it takes to say "A ranked above B."

Keep the two constants separate, named separately, and documented with their own
reasons. The failure runs in both directions and both are expensive:

- Reusing the statistical floor for the head-to-head suppresses legitimate
  comparisons of two and three finalists, which recruiters then do by hand,
  unrecorded and unaudited.
- Reusing the head-to-head floor for the statistic emits a selection-rate ratio
  computed over four people and puts it in a compliance conversation.

If a single constant is currently serving both, that is a defect regardless of
whether the two numbers happen to be equal today, because the next person to
tune one will silently move the other.

## There is a ceiling as well as a floor

A comparative evaluation also has a maximum field. Past a handful of candidates a
side-by-side stops being a comparison and becomes a table nobody reads: the
narrative degrades, the exclusive-differentiator lists collapse toward empty
because someone always matches, and the cost of the robustness matrix grows with
the square of the field. Cap the compared set, select into it deliberately — the
strongest by fit, or an explicit recruiter selection — and say which rule was
applied and how many candidates were left out.

Single-source the cap as one named constant that both the ranking path and the
selection interface read. A cap enforced in one place and re-typed in the other
drifts, and the failure is silent: the interface offers a selection the ranker
will quietly truncate, so the recruiter's comparison excludes people they believe
they included.

## Procedure

1. **Count the cohort that will actually be ranked**, after every exclusion has
   been applied — withdrawn candidates, out-of-scope applications, records
   filtered by the current view. The number that gates the claim is the number of
   people the claim is about, not the number in the pipeline.
2. **Compare against the head-to-head floor** before generating any output, not
   after. A gate applied to already-generated text is a redaction, and redactions
   leak.
3. **Below the floor, produce a distinct state**, not an empty result and not a
   degenerate one. "Insufficient cohort" is a verdict; it is rendered, it is
   sealed, and it is never a pass. An unranked single candidate must not be shown
   as rank 1 of 1, and must not be shown as scoring zero —
   [absence of evidence is not evidence](../../../../_laws.md#absence-of-evidence-is-not-evidence).
4. **Suppress every downstream claim that depends on the cohort**, not just the
   crown. Below the floor there is no leader, no separation status, no robustness
   claim and no exclusive-differentiator list, because "no rival has this" is
   vacuously true when there are no rivals. Each of these must consult the same
   gate rather than re-deriving it.
5. **Carry the cohort size into the record and into the copy.** A comparative
   verdict states what it was computed over —
   [a claim carries its sample and its basis](../../../../_laws.md#a-claim-carries-its-sample-and-its-basis).
   "Strongest of three" and "strongest" are different sentences and the second one
   is not available.
6. **Say what would unblock it.** A refusal a recruiter cannot act on gets worked
   around. "Add one more candidate to compare" is an actionable state; a greyed
   panel is not.

## Decision rules

- When the cohort is below the head-to-head floor, emit the insufficient state
  and suppress leader, separation and robustness together — never partially.
- When a fairness or rate statistic is requested, gate it on the statistical
  floor even if the comparative view already rendered. The two surfaces answer to
  different constants and may legitimately disagree about whether they can speak.
- When the cohort is at the floor exactly, the comparison is permitted and the
  wording still carries the count. Two is enough to compare and not enough to
  hide.
- When candidates are filtered out by a view, recompute the gate for the filtered
  set. A comparison of the two visible rows is a comparison of two, whatever the
  unfiltered total says.

## When not to use it

Do not apply this gate to non-comparative output. A single candidate's own
scorecard, gap list, or strengths summary is a claim about one person and is
perfectly valid at cohort size one — it simply must not use comparative
vocabulary. The gate governs the word *strongest*, not the word *strong*.

Do not use it as a proxy for evidence sufficiency. Ten candidates clear this
floor easily and may still each have evidence too thin to separate; that is the
band question, handled elsewhere. Cohort size and evidence depth are independent
failure modes, and a system that checks only the first will still crown coin
flips.
