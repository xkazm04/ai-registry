---
layer: technique
type: technique
subject: collective-and-statutory-hiring-governance
technique: ordinal-eligibility-list-over-a-crowned-lead
status: forged
laws: [inference-must-look-like-inference, no-adverse-outcome-is-solely-automated, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [hiring from a civil-service register or certified list, a statutory rank order governs the appointment, deciding between a ranked list and a recommended pick]
---

# An ordinal eligibility list, not a crowned lead

Where an appointment is made from a register of eligibles, the decision object is
a **rank-ordered list**, and the tool's output must have that shape. This is not
a presentational variant of a recommendation. A discretionary fit score and a
statutory rank are different kinds of quantity, and substituting one for the
other is the defect this technique exists to prevent.

## Why the substitution is a category error, not a rounding error

A recommended lead is a *judgment*: this person, for these reasons, on this
evidence, with this much confidence. A rank on an eligibility list is a
*position in a procedure*: it determines who may be certified, in what order,
within which reachable band, subject to adjustments the register applies before
anyone looks at a résumé. The two answer different questions and are consumed by
different actors under different rules.

Three consequences follow immediately:

- **The list is the deliverable; the top of it is not.** Certification typically
  reaches a group, not an individual — the top several, a scored band, whoever
  remains after the preferred candidates are placed. A surface that emphasises
  position one has already misdescribed the process.

- **Order is the payload; the score is context.** Consumers of a register act on
  position. A fit score may be shown as the basis for the ordering, but it must
  render in the grammar of an estimate, not of an entitlement
  ([inference must look like inference](../../../../_laws.md#inference-must-look-like-inference)).
- **A fit ordering is incomplete by design.** Statutory adjustments are not in
  it and cannot be put there by a tool that holds no adjudicated status — see
  [name-the-ceiling-you-cannot-compute](./name-the-ceiling-you-cannot-compute.md).
  A fit list that looks final is worse than no list. Once a certificate exists,
  the adjustments are in *its* order, which is why the fit signal may annotate
  that order but never replace it.

## Which list: the certification regime decides

"A rank-ordered list" is itself one regime among several, and a tool that
assumes it will be wrong in the others. Registers in current use take at least
three shapes:

- **A score-ordered certificate.** Candidates are scored on an examination,
  statutory preference is added to the score (or places some preference-eligible
  candidates at the top outright), and the certificate is cut at a
  pre-determined score or count. The order is the statute's.
- **Quality categories.** Candidates are placed in two or more categories
  instead of receiving individual scores. The appointing official may choose
  anyone in the highest category. Within a category, preference-eligible
  candidates are listed ahead of the rest, and there is no merit order among
  them.
- **A top-N window.** The official must choose among the N highest-standing
  names, and the statute fixes N.

In every one of them, the statutory order is set by the examining office
*before* the list reaches the person choosing, and it limits their discretion
in the one direction that matters: passing over a preference-eligible candidate
to choose a lower-standing one requires a formal procedure. So the rule for a
tool that works *downstream of certification* is not "produce an ordinal fit
ranking". It is:

- **The certificate's order is the list. The fit signal annotates it and never
  re-sorts it.** A fit ranking shown as a competing sequence is a map of whom
  to pass over, drawn without the procedure that passing over requires.
- **Where the statute leaves order open**, meaning within a category or among
  names of equal standing, a fit ordering is a legitimate aid to the
  discretion the official has, labelled as exactly that.
- **When the official's choice would pass over a higher-standing
  preference-eligible candidate**, the surface says that a pass-over procedure
  applies before the selection. It never lets the choice read as routine.

The regime is configuration inside the eligibility-list mode, fixed per
posting before applications are solicited, not a new mode. Without it the tool
cannot know which of these shapes it is looking at.
## Procedure

1. **Present every eligible candidate in one ordinal sequence**, numbered, with
   no candidate singled out by typography, emphasis, or a "recommended" marker.
   Removing the crown is the visible half of the technique; it is also the half
   teams try to keep "just for usability." Where a certificate exists, that
   sequence *is the certificate's*, in its statutory order, and the steps below
   apply to the fit annotation beside each name, not to the order.
2. **Label the ordering by what it is:** a fit ranking derived from the evidence
   available to the system. Not an eligibility ranking, not a certification, not
   a merit order. The name of the artifact is load-bearing, because the reader's
   next action depends on which of those they think they are holding.
3. **Show ties as ties.** Where two adjacent candidates' evidence cannot
   distinguish them, the list says so at that position rather than imposing an
   order the evidence does not support. Arrival order, identifier order and
   alphabetical order are all silent tie-breaks that will eventually determine
   someone's employment.
4. **Give unscored and unassessable candidates their own state.** A candidate the
   system could not evaluate is *not ranked last*; they are unranked, listed
   separately, and routed to a human. Coercing an unmeasured person to the bottom
   of a register is the exact failure that
   [absence of evidence is not evidence](../../../../_laws.md#absence-of-evidence-is-not-evidence)
   names.
5. **Exclude the ineligible rather than ranking them low.** A candidate who fails
   a hard requirement is not eligible, and eligibility is a different predicate
   from fit. Placing them at position eleven implies they are eleventh-best and
   reachable if the list runs deep; omitting them from the list — while keeping
   them visible elsewhere as *not eligible, for this reason* — says the true
   thing. Three states, not one axis: eligible and ranked, eligible but unranked,
   not eligible.
6. **Carry the statutory step onto the artifact itself**, adjacent to the list,
   not in a help page. Which step it is depends on where the tool sits. Before
   certification, the preference is still to be adjudicated and applied by the
   examining office. After certification, it is already in the order, and the
   outstanding step is the pass-over procedure.
7. **Seal nothing as an appointment.** The list is advisory input to a
   certification made by an appointing authority
   ([no adverse outcome is solely automated](../../../../_laws.md#no-adverse-outcome-is-solely-automated)).

## Decision rules

- When the cohort is below the floor at which a comparative claim is meaningful,
  emit no ordering at all. A register of two is not a short register; it is not a
  register.
- When the top candidates' evidence bands overlap, the list must state that the
  ordering within the overlap is within the measurement's own uncertainty. A
  reachable band computed from a fit score is a fiction if the score cannot
  separate its members.
- When a consumer asks for "just the top one" — an integration, an export, a
  summary line — refuse the field rather than filling it. The first element of a
  list is not a recommendation, and the moment it is exposed as one, it becomes
  one.
- When the list is re-generated after the candidate set changes, it is a new
  list with its own identity, not an update to the old one. A committee or an
  authority that acted on the previous list acted on a different artifact.
- When a rank must be shown alongside a score, show the score's uncertainty in
  the same view. A bare number next to an ordinal position reads as a measured
  entitlement.

## When not to use it

Do not force list semantics onto a discretionary process. Where an employer is
genuinely free to appoint whomever they judge best, an ordinal presentation with
no recommendation withholds the judgment the tool was built to offer and pushes
the reader toward reading rank one as a winner anyway — the worst of both shapes.

Do not use this technique as a way to avoid saying anything. An ordinal list is
not neutral output; it is a strong claim about relative fit, and it carries every
obligation the comparison mechanics impose — cohort floor, band separation,
weighting robustness. The sibling subject on comparative shortlist evaluation
governs those; nothing here relaxes them.
