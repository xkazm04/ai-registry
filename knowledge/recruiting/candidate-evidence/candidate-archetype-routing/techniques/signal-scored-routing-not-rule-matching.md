---
layer: technique
type: technique
subject: candidate-archetype-routing
technique: signal-scored-routing-not-rule-matching
status: forged
laws: [inference-must-look-like-inference, meaning-does-not-live-in-a-label]
use_when: [building or replacing a candidate classifier, a routing rule chain has grown special cases, deciding how to express a marginal classification]
shared_with: []
---

# Signal-scored routing, not rule matching

## The concern

Classifying a candidate's career type looks like the textbook case for a chain of
conditionals, and it is the textbook case for why chains of conditionals are the wrong
tool for judgment. Careers are made of overlapping, partial, contradictory evidence: a
person can be enrolled in a degree *and* have four years of work; a person can be
changing domain *and* be early in their career. A rule chain forces every such candidate
into whichever branch happens to come first in the file, encodes a priority order nobody
deliberately chose, and returns an answer with no way to express that the answer was
close.

The technique replaces the chain with an **accumulator**: independent signals each add a
weight toward one or more archetypes, the totals are ranked, and the top archetype is
returned together with a confidence derived from the margin. The scoring function is
**data, not code** — a table of signals and weights that a non-engineer can read, an
auditor can be shown, and a tuning cycle can change without a deploy.

## The procedure

1. **Enumerate the signals as observable facts, not as conclusions.** "Currently
   enrolled in a programme", "less than one year of relevant experience", "three or more
   years of relevant experience", "declares a desire to change domain", "has held roles
   in two unrelated disciplines". Each is something the record either shows or does not.
   A signal that is itself a judgment ("looks junior") is not a signal; it is the output
   you are trying to compute.
2. **Give each signal a weight toward one or more archetypes.** Weights are ordinal in
   practice: a strong indicator roughly twice a weak one, a decisive combination higher
   than either part. Do not pretend to more precision than the evidence supports — the
   values are a stated policy, not a fitted model, and they should be round.
3. **Allow compound signals.** The highest-weight entries are usually conjunctions,
   because that is where careers actually distinguish themselves: wanting a domain
   change *combined with* substantial existing experience is a much stronger indicator
   of a career changer than either fact alone, and should carry a weight larger than
   both.
4. **Accumulate, rank, take the top.** No early exit, no first-match-wins. Every signal
   that applies contributes.
5. **Derive confidence from the outcome, not from a constant.** A clear winner is
   confident; a near-tie is not. The simplest defensible derivations are the margin
   between first and second place, or the winner's share of the total mass. Whichever
   you pick, state it — a confidence whose derivation is undocumented is a number, not
   evidence.
6. **Return the contributing signals alongside the class.** The list of what fired is
   the explanation, and it costs nothing to carry. Without it you have a classification
   nobody can question, which in a hiring context is a classification nobody can defend.
7. **Keep the table in the shared declaration**, next to the archetype list and the
   thresholds, so the whole routing policy reads as one page.

## Decision rules

- **When two archetypes are within a small margin, the result is low-confidence, not a
  coin flip.** The margin *is* the uncertainty; discarding it to return a clean answer
  is discarding the only honest thing the classifier produced.
- **When a new special case appears, add a signal with a weight — never a branch.** The
  discipline is what keeps the model auditable. One branch is always harmless; the
  eleventh branch is the rule chain you replaced.
- **When a signal only ever fires together with another, merge them into one compound
  signal.** Two correlated signals double-count the same evidence and inflate confidence
  on exactly the candidates where you should be least sure.
- **When a weight is set to make one specific candidate come out right, stop.** Tune
  against a labelled sample of real careers, not against the person currently on screen.
  Fitting to an individual is how a signal table becomes a rule chain with extra steps.
- **When the classifier's output feeds a display, render it as a hypothesis.**
  [Inference must look like inference](../../../_laws.md#inference-must-look-like-inference):
  a heuristic reading of somebody's career is a suggestion carrying a probe, not a fact
  about them, and it must not be shown in the grammar reserved for what was measured.
- **When you review the table, review the population it produces.** The right cadence is
  periodic: sample recent routings, especially the low-confidence and the reviewer-
  corrected ones, and check whether a weight is systematically misreading a career shape
  — a non-linear path, an unusual education system, an interrupted history.

## Why data rather than code

Three properties follow from putting the signal table in the declaration, and none of
them is available to a function full of conditionals:

- **It can be shown.** "Here is every input that affects how we classify a candidate,
  and what each one is worth" is a sentence you can complete for an auditor, a works
  council or a candidate who asks. A code path is not an answer to that question.
- **It can be diffed.** A change to routing policy appears in review as a changed number
  with a stated reason, rather than as a restructured function whose behavioural delta
  the reviewer has to simulate mentally.
- **It cannot accumulate hidden priority.** Weights have no order. The bug class where
  the answer depends on rule sequence simply does not exist in an accumulator, which
  removes an entire family of "why did this candidate come out different after we added
  an unrelated rule" incidents.

The table is also the place where scepticism is expressed as policy rather than as
judgment. When domain experience says a particular combination of facts is usually a
misreading, that belief becomes a row with a number, reviewable by the next person.
[Meaning does not live in a label](../../../_laws.md#meaning-does-not-live-in-a-label) —
and it does not live in an engineer's memory of why a branch was added either.

## When NOT to use it

- **Not where a single fact is definitionally sufficient.** If the candidate stated
  their own archetype, that is not a signal to be outvoted — it sets the class outright,
  and the signal model's role shrinks to detecting contradictions. See the sibling
  technique on self-declaration.
- **Not for legally-defined categories.** Where a status is a matter of documented fact
  rather than inference — a protected status, a work authorization, an accommodation —
  do not score it. Scoring a fact invites a confident wrong answer about something that
  had a correct one available.
- **Not as a substitute for asking.** A signal model is what you use *until* the
  candidate answers, and its existence is not a reason to leave the question off the
  form. The cheapest large improvement in routing accuracy is always the question.
- **Not with a learned model in place of the table, unless you can still show the
  table.** A fitted classifier over the same signals will usually outperform hand-set
  weights on accuracy and lose on every other property that matters here — explicability,
  reviewability, the ability to state the policy in one page. In a decision that gates a
  fairness shield, that trade is a bad one.
