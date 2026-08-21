---
layer: technique
type: technique
subject: presenting-a-score-to-a-recruiter
technique: knockout-reason-categorised-at-birth
status: forged
laws: [meaning-does-not-live-in-a-label, no-adverse-outcome-is-solely-automated, say-only-what-the-record-holds]
shared_with: []
use_when: [a candidate fails a hard requirement, a disqualification is being expressed as a low score, generated prose is being pattern-matched to classify a reason]
---

# Knockout reasons categorised at birth

A **knockout** is a categorical bar: no authorization to work in the location,
an absent licence the role legally requires, an unmeetable on-site
requirement, a compensation floor above the band. It is a different kind of
object from a score, and the two failures of this technique are (a) expressing
a knockout *as* a low score and (b) letting its category be re-derived later
from the sentence a model wrote.

## Why a knockout is not a low score

Compressing "not eligible" into "31 out of 100" corrupts three things at once.
The recruiter reads *weak* and forms an opinion about the person's ability
that the evidence does not support. The candidate is ranked against people
they were never in competition with, so every comparative figure in the cohort
is slightly wrong. And the knockout becomes silently *tradeable*: raise the
weight on another dimension and the ineligible candidate climbs back over the
threshold, because a number can always be outvoted by other numbers.

Knockouts are therefore a **separate channel**: a flag with a category and its
evidence, rendered above or instead of the score, never expressed through it.
Where a knockout exists, the numeric score is either suppressed or explicitly
subordinated ("ineligible — assessed 74 on the remaining dimensions"), so
nobody advances a candidate on a strong number without seeing the bar, and
nobody rejects a capable candidate believing they scored badly.

## Categorise at the moment of production

The recurring defect: the scorer emits a human sentence ("candidate does not
appear to hold the required certification"), and a downstream step classifies
it by matching keywords in that sentence to route, count, or display it.

That derivation is broken by construction. It runs on prose a model wrote — in
one language, in one phrasing, with a wording that changes on the next
generation or the next prompt edit. It breaks silently: a knockout that stops
matching simply becomes uncategorised, and uncategorised usually means
invisible. And it violates
[meaning-does-not-live-in-a-label](../../../../_laws.md#meaning-does-not-live-in-a-label)
in its most expensive form, because the "label" here is a sentence in a
generated document.

The procedure:

1. **Define a closed category vocabulary** — work authorization, licence or
   credential, location or mobility, compensation, availability, an explicit
   role-defined hard requirement, and an "other" that is *reviewed*, not
   ignored.
2. **The producer emits the category alongside the sentence**, as a structured
   field, at the moment it detects the bar. A structured emission constrained
   to the vocabulary is cheap; a post-hoc classifier is a second model with
   its own error rate stacked on the first.
3. **Every consumer reads the category; nobody parses the prose.** Routing,
   counting, filtering, colouring, translating and auditing all key off the
   identifier. The sentence exists for the reader.
4. **Carry the evidence with the category** — the requirement it violates and
   the field or document line it was read from — so the claim is checkable and
   [say-only-what-the-record-holds](../../../../_laws.md#say-only-what-the-record-holds)
   is satisfiable. A knockout without a citation is an allegation.
5. **Compose the display sentence at render time from the structured facts**,
   so the record is readable in the next reader's language and defensible in
   the next jurisdiction, rather than frozen in the producing run's phrasing.

## A gate may only rest on what the role actually asserted

Requisition intake fills blanks. A work mode, a location norm, a seniority
floor, a language — normalization stamps a default where the posting said
nothing, and downstream nothing distinguishes the stamped value from the
stated one. A default is a **phantom requirement**: the role never asserted
it, and no candidate may be barred by it.

The discipline is to record, on the requisition, which fields were defaulted,
and to make the knockout evaluator treat every defaulted field as absent.
Phantoms may still inform ranking, where being wrong costs a position rather
than a candidacy. They may never open a gate.

The candidate's side has the mirror rule: **where the candidate's value is
unknown, skip the gate rather than fail it.** An unknown education level does
not fail an education minimum; a profile listing no languages does not fail a
language requirement; a candidate whose archetype could not be classified is
not hard-gated on a floor that cannot be justified for an unknown class. Each
of those skips becomes an assumption line on the card, so the recruiter sees
that a gate was passed by silence rather than by evidence.

## Decision rules

- **A knockout never executes a rejection.** It parks the candidate at a human
  gate with the category and the evidence shown —
  [no-adverse-outcome-is-solely-automated](../../../../_laws.md#no-adverse-outcome-is-solely-automated).
  Knockouts are the category of finding most often argued successfully:
  authorization status changes, a licence is in progress, a location
  constraint was a preference the requisition overstated.
- **An uncertain knockout is not a knockout.** If the evidence for the bar is
  itself an inference ("the résumé does not mention authorization"), it is an
  open question with a probe attached, not a categorical bar. Only an explicit
  negative from the record qualifies.
- **Multiple knockouts are all recorded**, not just the first. Which one a
  candidate could clear determines whether they can be reconsidered.
- **A rollup of categories orders by count, with a declared tie-break.** The
  ordering of "what excluded this candidate from most roles" is itself a
  claim; leaving ties to iteration order makes the same data render in a
  different order on two runs. Declare the vocabulary's order once and use it
  as the tie-break.
- **Category counts are a requisition-quality signal.** When a single hard
  requirement knocks out most of a pipeline, the finding is usually about the
  requirement, not the market — hand that to requirement discipline rather
  than absorbing it as normal attrition.
- **A category is never repurposed.** Adding "overqualified" or "poor culture
  fit" to a vocabulary designed for legal and logistical bars turns an
  eligibility mechanism into an unaccountable rejection channel.

## When not to use this

- **For soft mismatches.** A missing preferred skill, a shorter track record,
  an adjacent domain: these are score dimensions and belong in the breakdown.
  A knockout vocabulary that grows to cover preferences stops being a bar and
  becomes a way to reject without a number.
- **Where the requirement is not actually hard.** If a hiring manager would
  interview someone who fails it, it is a weight, not a knockout — and
  encoding it as a knockout removes it from the recruiter's ability to trade
  off, which is exactly the property knockouts are supposed to have.
