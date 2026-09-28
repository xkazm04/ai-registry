---
layer: technique
type: technique
subject: collective-and-statutory-hiring-governance
technique: machine-ordering-after-independent-reads
status: forged
laws: [no-adverse-outcome-is-solely-automated, every-decision-names-its-actor, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [a committee or panel is shown a machine ranking, deciding when members see the machine's ordering, making a body's reliance on a machine ranking visible in the record, combining members' ratings into the body's recommendation]
---

# The machine ordering comes after the independent reads

The concern: a tool that never seals a winner has settled *who signs*, and
nothing else. Whether a machine ranking is advice or the decision in practice
depends on how heavily the people who decide lean on it. Data-protection law in
at least one major jurisdiction now reads it that way: a score that a decider
"draws strongly on" is itself the automated decision, whoever signs. High-risk AI
rules name the tendency to over-rely on a recommendation as something oversight
must guard against. A committee that is handed the machine's ordering in its
pre-read, deliberates over it and then recommends its top name has produced an
advisory record and an automated outcome at the same time.

The weight is invisible unless the record shows what the members thought
*before* they saw the machine. So the sequence is the technique: every member
records their own read first, the machine's ordering is revealed after, as one
labelled input, and the record keeps both.

## Procedure

1. **Independent reads first, locked.** Each member rates every candidate
   against the rubric before seeing anyone else's ratings and before seeing the
   machine's ordering. Each read is attributed and timestamped, and it cannot be
   edited once the reveal has happened. The machine's evidence, meaning
   per-candidate facts, what was and was not measured, and the limits, may be in
   the pre-read. Its *ordering* may not.
2. **Reveal the ordering as one labelled input.** After the reads are locked,
   show the machine's ordering with its separation and robustness, without a
   crown, and labelled as the output of an automated process. It sits beside the
   members' reads, not above them.
3. **Keep the before and the after.** Where a member changes a rating after the
   reveal, the change is a new, attributed entry with a reason. It never
   overwrites the locked read. The distance between the locked reads and the
   final ones, measured toward or away from the machine, is the only direct
   evidence of how strongly the body drew on the ordering.
4. **Combine the members' reads mechanically for the scored output of record.**
   Averaging independent structured ratings is the defensible aggregate. A
   consensus discussion adds little or nothing to validity over it, and it costs
   the independence the first step bought. The discussion's job is to surface
   evidence: a disqualifying fact, a gap in the record, a reading somebody
   missed. It is not a second, louder round of scoring.
5. **The body's recommendation carries its own reasons.** "Ranked first by the
   system" is not a reason a body may give. The record names the body as the
   actor
   ([every decision names its actor](../../../../_laws.md#every-decision-names-its-actor))
   and states why it chose, in terms of the evidence.
6. **Watch reliance at the process level.** Count, across processes, how often
   the body's choice is the machine's first position, and how far members' reads
   move toward the machine after the reveal. A high follow-rate *with* large
   post-reveal movement is the signature of a body that draws strongly on the
   ordering. Report it to whoever owns the deployment, because it is the fact
   that decides whether the advisory label is true
   ([no adverse outcome is solely automated](../../../../_laws.md#no-adverse-outcome-is-solely-automated)).

## Decision rules

- **When the tool cannot host per-member reads, it cannot sequence the reveal.**
  Keep the ordering out of the committee's pre-read, and name the missing step
  where the body will see it: members' independent reads are recorded outside
  the tool, before the ordering is shown. Do not ship the ordering to the body
  first and hope.
- **A read is bound to what it judged.** A locked read records the version of
  the brief, the rubric and the evidence set it was made against
  ([a verdict is bound to what it judged](../../../../_laws.md#a-verdict-is-bound-to-what-it-judged)).
  If the evidence changes after the reads, they are re-taken, not carried over.
- **Movement toward the machine is not a defect in itself.** A member may learn
  something real from the analysis. The rule is that movement is recorded with
  its reason, not that it is forbidden.
- **Where the body must act in public, the aggregate is the body's act.** In
  open-meeting jurisdictions, turning members' individual scores into a
  shortlist can itself be formal action that has to happen in the meeting, with
  the scores attributed by name. A tool or a clerk that produces the shortlist
  outside the meeting has had the body act in private. Compute the aggregate for
  the meeting and have the body adopt it there.
- **Expect resistance and keep the step cheap.** People rate designs that make
  them commit before seeing the machine's answer less favourably, even when
  those designs cut over-reliance. A one-screen form per candidate is the
  budget. A heavy ceremony gets skipped.

## When not to use it

- **Single-decider processes.** There the machine's recommendation is
  legitimately the first thing the decider sees. The protection is that a human
  actions it with the means to disagree, which the sibling subject on combining
  signals into a hire decision owns.
- **Statutory rank order.** Where a certificate's order is set by an examination
  and statutory preference, there is no discretionary read for the ordering to
  anchor. Where it would anchor, inside the band the appointing official may
  choose from, the eligibility-list technique governs what may be shown.
- **Screening before the body sees anyone.** A machine that removes candidates
  from the body's view has taken a decision this technique cannot repair after
  the fact. That is the automated screening subject's gate, and it has to hold
  before any committee convenes.
