---
layer: golden-path
type: golden-path
subject: collective-and-statutory-hiring-governance
status: forged
use_when: [building a tool used by a search committee or a public-sector hiring panel, deciding whether a system may name a winner, a hiring process is governed by an eligibility list or a statutory preference, a works council or union agreement constrains how candidates are selected]
techniques:
  - governance-mode-selection
  - advisory-machine-that-never-seals
  - ordinal-eligibility-list-over-a-crowned-lead
  - sticky-governance-against-silent-downgrade
  - name-the-ceiling-you-cannot-compute
  - committee-visible-evidence-packet
---

# Collective and statutory hiring governance

Most hiring software is built on an unexamined assumption: that somewhere there
is one person who decides, and the software's job is to help them decide well.
For a large and growing share of real hiring, that assumption is simply false.
A faculty search is decided by a committee that votes, whose recommendation
travels to a dean and then a provost. A civil-service appointment is made from
a certified list of eligibles in rank order, with statutory point or absolute
preferences applied by an appointing authority that is not the hiring manager.
A unionised workplace fills a posting from an internal bid governed by seniority
before it ever looks outward. A works-council agreement may specify what a
selection tool is allowed to produce at all.

In every one of those processes, **a single machine-picked winner is illegitimate
by construction** — not inaccurate, not risky, *illegitimate*. The correct name,
produced by the wrong actor, is still void. This subject is about that fact and
about the design consequence that follows from it: the shape of what a tool may
emit is determined by who is entitled to decide, and a tool that emits the same
artifact everywhere is wrong in most places.

The sibling subject on comparative shortlist evaluation owns the mechanics of
comparing people — cohort floors, band separation, robustness statuses,
differentiators. Assume all of it. This subject asks the question that sits
above those mechanics: given that you *can* compute a defensible ordering, what
are you permitted to do with it here?

## Legitimacy is a property of the process, not of the answer

The naive reading treats governance as a compliance overlay: compute the best
answer, then add caveats, approvals and audit trails around it. That reading
survives contact with a single-decider process and fails everywhere else,
because in a collective or statutory process the decision is a *different
object*. It is a committee vote with a quorum and a record. It is a certification
from a ranked register with a duration and an expiry. It is an offer made only
after a recall list and an internal bid have been exhausted. None of those
objects can be produced by a scoring function, and a scoring function that
produces something shaped like them is producing a forgery.

Three questions separate a governed process from an ungoverned one, and they
must be answered before any surface is designed:

1. **Who is entitled to decide?** A named individual, a deliberative body, or a
   rule external to both.
2. **What artifact *is* the decision?** A sealed pick, a minuted vote, a
   certified list — and who signs it.
3. **What is the machine therefore permitted to emit?** A recommendation, an
   input to deliberation, or an ordering with an explicit hole in it where a
   statutory adjustment goes.

Answer them in that order. The third answer is derived; it is never a product
preference. See [governance-mode-selection](techniques/governance-mode-selection.md)
for turning those answers into a small, closed set of modes, and
[advisory-machine-that-never-seals](techniques/advisory-machine-that-never-seals.md)
for what changes in the system when the answer to (1) is not "one person".

## The three modes that cover the field

Nearly every hiring process a general tool will meet falls into one of three
governance shapes, and three is the right number — fewer collapses real
distinctions, more invents policy nobody asked for.

| Mode | Who decides | The decision artifact | What the machine may produce |
| --- | --- | --- | --- |
| **Single-decider** | one accountable hiring authority | that person's recorded choice | a recommended lead, sealed as *the recommendation*, still human-actioned |
| **Collective** | a committee or panel, by deliberation and vote | the body's minuted recommendation, travelling up a chain | advisory material only — never a sealed winner |
| **Eligibility-list** | a rule: rank order plus statutory adjustments, certified by an appointing authority | a certified list of eligibles | an ordinal fit-ranked list with the statutory step named and left undone |

The load-bearing distinction between the last two is often missed. A committee
process is *human-decided*: the machine steps back so that people may deliberate.
An eligibility-list process is *rule-decided*: the machine steps back because a
discretionary score is the wrong **kind of quantity**. Substituting a fit score
for a rank on a register is not a smaller version of the right thing; it is a
different instrument wearing the same clothes.
[ordinal-eligibility-list-over-a-crowned-lead](techniques/ordinal-eligibility-list-over-a-crowned-lead.md)
carries that distinction.

Note also what mode does *not* change: the underlying evaluation. The comparison
runs identically in all three. Governance constrains the **output kind and the
sealing behaviour**, not the arithmetic. Teams that try to make the model "more
careful" in committee mode have misdiagnosed the problem — the analysis was never
the illegitimate part.

## The default is the dangerous one

Every product of this kind ships single-decider mode first, because that is the
demo, and every subsequent mode is added as a special case around it. This has a
predictable structural consequence: the auto-seal is the **path of least
resistance**, the code path everything else must remember to opt out of. Then a
refactor introduces a new entry point, or a retry path, or a scheduled re-run,
and one of them forgets. The result is a sealed winner in a process where no
winner may be sealed, produced silently, discovered months later by a candidate's
lawyer.

The specific instance that catches almost everyone is a mode control whose state
lives only in the current view. It resets to the default on a fresh load, for a
different user, on a re-run — and if the run trusts that parameter, a governed
process downgrades itself the first time anyone opens it cleanly. Governance is
resolved from what the process was last governed by, server-side; the request
parameter is a proposal.

Design against this in two ways. First, invert the predicate: write the rule as
"*only* the default mode may auto-seal a single pick as the decision," so every
new caller is refused by default rather than admitted by default. Second, make
the governance mode part of the **identity of a run**, not a display attribute
of it. A comparison computed under rules that no longer apply is not a cache hit,
it is a correctness failure — the same candidates, the same scores and the wrong
governance is exactly the artifact you must never serve.
[sticky-governance-against-silent-downgrade](techniques/sticky-governance-against-silent-downgrade.md)
is that discipline in full.

## Say what you structurally cannot do

The most valuable sentence a governed hiring tool ever emits is a sentence about
its own ceiling. In a statutory-preference process the decisive adjustment —
veterans' preference points or an absolute preference, a disability-quota
placement, a reemployment or recall right, a residency or local-hire preference,
a seniority bid — depends on facts the tool **does not hold and cannot infer**.
It does not know a candidate's veteran status; asking for it would itself be
regulated, and guessing it from a résumé is exactly the proxy inference the whole
field exists to prevent.

So the tool says so, in the artifact, at the point of use: this ordering is a fit
ranking; the statutory preference must be applied by a human before certification;
the system holds no such status and cannot compute it. That is not a disclaimer.
It is the most useful output on the page, because it converts an invisible gap
into a named step with an owner.
[name-the-ceiling-you-cannot-compute](techniques/name-the-ceiling-you-cannot-compute.md)
generalises it: every governed mode has a step the machine cannot perform, and
naming it is the technique.

The neighbouring failure is subtler. A tool that silently produces a *complete-
looking* ranking teaches its users that the ranking is complete. Nobody reads a
policy manual against a clean interface. The interface has to carry the hole.

## What a committee actually needs

Stepping back from the decision does not mean producing less. A committee is a
worse decision-maker than an individual in one specific way — it anchors, hard,
on whoever speaks first and on whatever the first document says — and a tool can
be genuinely load-bearing precisely there. The useful contribution is a
**packet**: the same evidence, in the same shape, delivered to every member
before deliberation, with each candidate's evidence and its limits stated at the
same altitude.

Two craft rules the packet must respect, both well-established in structured
hiring and both routinely violated by machine-generated summaries. Independent
scoring precedes debrief: members record their own reads before they see each
other's, or the panel produces one person's opinion with five signatures. And the
packet is bound to what it judged — the version of the brief, the rubric and the
evidence set that produced it — because a committee reconvening in six weeks over
a stale packet is deliberating about a job that no longer exists. See
[committee-visible-evidence-packet](techniques/committee-visible-evidence-packet.md).

In public-sector and academic hiring, treat the packet as potentially disclosable
from the moment it is generated: open-records requests, candidate access requests
and litigation discovery all reach it. This is a writing constraint before it is
a storage constraint. Anything the packet cannot defend on its face — an
unsourced characterisation of a person, a confident-sounding inference, a
comparison the cohort could not support — should not have been in it.

## Failure modes of the naive reading

- **Mode as a label.** The mode is stored, displayed, and read by nothing.
  Meaning must not live in a display string; every consequential branch keys off
  a stable governance vocabulary, and any surface that renders a governance state
  reads the same value the sealing predicate reads.
- **Advisory in the copy, decisive in the artifact.** The screen says
  "recommendation" while the record seals a winner, the export shows a crown, and
  the notification tells the candidate they were selected. Candidate-visible
  decision kinds must be *distinct kinds*, not one kind with a different heading.
- **The unattended path.** A batch job, a scheduled re-run, or a retry executes
  under the default because the mode lived in the interactive request. An
  unattended process queues; it does not decide.
- **Governance drift on re-run.** The comparison is re-run after the committee is
  chartered, quietly under the old mode, and the second artifact contradicts the
  first with no record of why.
- **Treating consultation as a checkbox.** Where a works council, union agreement
  or civil-service commission governs *whether and how* such a tool may be used
  at all, no mode setting substitutes for that consent. The mode governs the
  output; the agreement governs the deployment.
- **Helpfully filling the statutory hole.** Someone adds a field for veteran
  status "so the ranking can be complete." Now the tool holds a protected
  attribute it has no lawful basis to use in scoring, and the hole it was meant
  to close has become an exposure. The hole is the correct design.

## The one-line test

Before shipping any surface in this area, ask: *if this artifact were read aloud
in a grievance hearing, would it be evidence that the process was followed, or
evidence that it was bypassed?* A tool that helps a committee deliberate is the
former. A tool that hands a committee a winner and asks them to ratify it is the
latter, however carefully it is worded.
