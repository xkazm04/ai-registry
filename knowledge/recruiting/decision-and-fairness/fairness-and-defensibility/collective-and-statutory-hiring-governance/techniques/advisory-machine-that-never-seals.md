---
layer: technique
type: technique
subject: collective-and-statutory-hiring-governance
technique: advisory-machine-that-never-seals
status: forged
laws: [no-adverse-outcome-is-solely-automated, every-decision-names-its-actor]
shared_with: []
use_when: [a committee or panel owns the hire, deciding whether a recommendation may be sealed as a decision, separating advisory output from decisive output]
---

# The advisory machine that never seals

In a collective process, the machine's job is to inform a deliberation it is not
a party to. This technique is the mechanical difference between *advising* and
*deciding*, and the difference is not tone. It is whether an artifact exists,
after the run, that a reader would reasonably take as the decision.

The rule: in any mode other than single-decider, the machine produces analysis
and **never seals a winner**. No solely-automated significant decision —
[no adverse outcome is solely automated](../../../../_laws.md#no-adverse-outcome-is-solely-automated).

## What "seals" means, precisely

Sealing is the moment an output stops being a view and becomes a record: it is
written to the decision log, it acquires an actor and a timestamp, it becomes
visible to the candidate, it is exported into a file that leaves the system, or
it becomes the input another stage treats as settled. Any one of those is a seal.
Teams under-count this badly — the crown on a screen is the least of it; the
export, the webhook and the candidate-facing status are the artifacts that
travel.

So the audit is: enumerate every place a comparison's outcome leaves the run, and
check each one against the mode. A single unaudited exit — a nightly digest
email, a downstream stage that reads "top candidate" — is enough to make the
whole mode a fiction.

## What not sealing does not settle

Refusing the seal is necessary and it is not sufficient. Whether a machine's
output is advice or the decision is judged by its effect, not its label, and
three tests recur across jurisdictions:

- **Weight.** A score or ranking that the people who decide draw on heavily is
  treated as the decision itself. Formal human sign-off does not change that,
  and neither does "fabricated" human involvement, meaning a person who routinely
  applies the output with no real influence on the result.
- **Override.** An output used to overrule conclusions the humans reached from
  other evidence has replaced their judgment, whatever the record calls it.
- **Screening.** A body, or a tool, that removes candidates from the final
  authority's view, or ranks them for it, is performing the decision function.
  Public-meeting rules have been applied to committees for exactly that reason.

So the advisory mode owes two things beyond the seal. It must not *screen*:
a comparison over part of the field says which part it covers and how that part
was chosen, the rest of the field stays in the body's view, and anyone the
machine could not assess is visibly unassessed, not absent. And it must make the
body's reliance *visible*: the order in which members see their own reads and
the machine's ordering, and what moved between them, is recorded. See
[machine-ordering-after-independent-reads](./machine-ordering-after-independent-reads.md).
A committee that follows the machine every time, and whose members move toward
it after seeing it, is a committee whose advisory label is untrue, and the
record is what shows it.

## Procedure

1. **Split the decision kind, not the copy.** Advisory output and a decisive lead
   are two distinct candidate-visible decision kinds with distinct identifiers,
   distinct rendering and distinct downstream handling. One kind with a softer
   heading is the failure mode; anything reading the log later cannot tell them
   apart, and something eventually reads the log.
2. **Emit the analysis in full.** Advisory does not mean thinner. Scores, bands,
   differentiators, robustness, cohort — all of it, at the same depth. What is
   withheld is the *conclusion*, not the evidence.
3. **Replace the crown with the ordering plus its uncertainty.** Where the
   single-decider surface names a lead, the advisory surface presents the field
   with the separation stated. A lead sitting inside the confidence overlap must
   read as effectively tied, not as a quiet endorsement; carry the separation
   verdict onto the payload so the surface cannot re-derive it more favourably.
4. **Name the actor as the body, and only when the body has acted.** The
   committee's recommendation is recorded when the committee records it, by a
   named person on the body's behalf. The machine's contribution is attributed to
   the automated process. Authority may be downgraded from human to automated
   when the record is unclear, never upgraded
   ([every decision names its actor](../../../../_laws.md#every-decision-names-its-actor)).
5. **Seal the advice, not the outcome.** There *is* something to persist: what
   the machine told the committee, when, over which candidate set, under which
   rules. That record is how a committee reconstructs, months later, the advice
   they were given. Sealing the advisory artifact is required; sealing a winner
   is forbidden. Keeping those two straight is the whole technique.

   Reconstruction has a shopping list, and each item is one an implementation
   typically computes and then drops: the governance mode in force; the cohort and
   its provenance (an explicit selection is not the same field as an automatic
   top-N); the candidate count and the full field size; the confidence band and
   the separation verdict; the robustness status; the version of the reasoning
   that produced the ranking; and the model's own words about the candidate it put
   first, **verbatim and clipped**, never re-narrated. A record saying only "the
   system ranked X first" is not reconstructible: nobody can see which reasoning
   produced it or what it actually said. Clip rather than store everything — a
   decision record is an audit artifact, not a transcript store.

   The shopping list also includes **who was not compared, and why**: candidates
   withheld from the cohort (consent withdrawn, identity erased, unassessable)
   are counted in the record. Otherwise the recorded field size is the compared
   field, and an auditor reads advice over part of the field as advice over all
   of it.

   Write that record in one canonical language, permanently, whatever language the
   surface renders in. It is read by auditors, exported, and compared across
   organisations and across years; wording that depends on whichever locale
   happened to be configured at run time — or that changes when that setting is
   flipped — is not an immutable record. The structured facts persist; the reader-
   facing sentence is composed at render time.
6. **Refuse the ratify-shaped affordance.** A one-click "accept recommendation"
   in a collective process converts deliberation into rubber-stamping, and the
   record it produces is indistinguishable from an automated decision with a
   human's name attached. The committee's action is recorded as their own
   decision, entered as such.

## Decision rules

- When the mode is not single-decider and any code path is about to write a
  decision record naming a winner, that path fails closed and writes the advisory
  record instead. Do not warn and proceed.
- When a downstream consumer requires a single "selected candidate" field to
  function, the correct answer is that the field is null until a human supplies
  it — not that the top of the ordering is copied into it. A null decision renders
  as *not yet decided*, never as a default person.
- When a committee overrides the machine's ordering entirely, that is a normal
  outcome and generates no exception, no flag and no "override" stigma in the
  record. The ordering was advice; declining advice is what deliberation is.
- When a surface outside the seal path renders a lead — a crowned column, a
  "recommended" heading, a top-pick field on an API — it reads the same sealing
  predicate as the seal. A crown drawn beneath an "advisory" banner is the
  seal's failure mode reached by a different exit, and the banner does not
  cancel it.
- When the run degrades — a model unavailable, an analysis incomplete — the
  advisory artifact says so and the process continues on its human track. A
  candidate's process never stalls on the tool's constraints, and a degraded
  advisory is never frozen as though it were authoritative.

## When not to use it

Do not apply advisory-only semantics to a genuine single-decider process as a
blanket safety measure. It sounds conservative and is not: it removes the sealed
recommendation that gives that process its traceability, leaving the decider's
reasoning unrecorded. The protection there is that a human actions the outcome,
which the recommendation already respects.

Do not use advisory mode to dodge accountability for a bad analysis. "It was only
advice" is not a defence when the advice was the only thing in the room. The
committee packet still has to be defensible on its face.
