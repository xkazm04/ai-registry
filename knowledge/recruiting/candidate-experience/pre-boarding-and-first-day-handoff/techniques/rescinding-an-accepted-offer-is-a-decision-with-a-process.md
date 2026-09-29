---
layer: technique
type: technique
subject: pre-boarding-and-first-day-handoff
technique: rescinding-an-accepted-offer-is-a-decision-with-a-process
status: forged
laws: [every-decision-names-its-actor, absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate, say-only-what-the-record-holds]
shared_with: []
use_when: [building a cancel, revoke or withdraw action on a hire or a pre-boarding run, deciding what a failed background check or medical or reference may do to a person who has accepted, choosing the outcome vocabulary for a hire that does not start]
---

# Rescinding an accepted offer is a decision with a process

The neighbouring technique says a revoked pre-boarding run stays revoked. It says
nothing about how a hire *gets* revoked, and that is where the ordinary
implementation fails: the only door that closes a person is the one built for the
selection stage, so the rescission goes through it. The person who accepted a job
last week is then closed with the outcome, the notice and the reporting meaning of
someone screened out at the first gate.

The technique has four parts: the acceptance carries a ledger of what is still
conditional, a rescission is a named human decision that cites a ground, the ground
decides what process is owed, and the record carries a distinct outcome.

## An acceptance carries a contingency ledger

Acceptance is rarely unconditional. A background check, references, a right-to-work
check, a medical clearance, a licence verification may all still be open. Record each
one at the acceptance write with three things: what it is, who owns it, and its state
— `open`, `passed`, `failed`. Without the ledger, "the check came back" has no place to
land, and the only thing the system can do with bad news is cancel.

- **A contingency is a state, not a stage.** A board that models a background check as
  a column after the offer step has to answer, on acceptance, whether the person has
  been hired or has moved to a waiting column. The answer is by role: only the terminal
  role is a hire. See the sibling technique on the live stage.
- **Open is not failed.** A check that has not returned, a reference nobody has
  answered, a document that could not be read: each holds. Rescinding on an unreturned
  result renders the absence of a result as a result.
  [Absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence),
  and [uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate).
- **The ledger is also the handoff's content.** The named owner receives what is still
  conditional, not only that the person accepted. No authoritative source on what a
  recruiter must transfer to a manager was found, so treat the list as a design
  default rather than a standard.

## A rescission is a named human decision

Cancelling a hire is the most consequential irreversible act in this window, and it is
exactly where a system is tempted to act on inference: no reply for three weeks, an
expired token, a check that is late. Automation may rank, remind the owner and draft
the notice. It may not rescind, and it may not classify a silent hire as a renege. The
record names the person who decided and the ground they chose.
[Every decision names its actor](../../../_laws.md#every-decision-names-its-actor).

The decision cites one ground from a closed set the product holds:

- a contingency failed, naming which;
- the role or requisition changed;
- the start date could not be met by either side;
- the person withdrew (that is theirs, not yours — record it as the person's act).

## The ground decides what is owed

The substance differs by jurisdiction and belongs to
`multi-jurisdiction-hiring-compliance`; what this technique fixes is that the *ground*
selects the process, so a single generic cancel cannot carry them.

- **A ground that rests on a third-party report** (a background or consumer report)
  usually owes the person the report, a description of their rights and a real chance
  to answer *before* the decision becomes final, then a notice of the final decision.
  A shortcut for remote applicants exists in at least one regime and is narrower than
  it reads.
- **A ground that rests on a criminal-record finding** may owe an individualised
  assessment and a written analysis with a response window, set by local fair-chance
  law rather than by the employer.
- **A ground that rests on a medical result** is defensible only where the examination
  was applied to every entering hire in that job category and the exclusion is
  job-related and consistent with business necessity.
- **A ground that is not about the person at all** (role withdrawn, start date) can
  still be a breach where the accepted offer is a contract: the honest routes are the
  contract's own terms and notice, not a status flip.
- **Discrimination law does not pause because the person has not started.**

The application below sets out the dated statutory anchors. Those are a starting map,
not advice; check the regime the run will operate in.

## The record carries a distinct outcome

A rescinded hire is not a rejection, and it is not a decline. The hiring record should
be able to say, for any closed person: the company passed on them, they turned the
company down, the role went away, or an accepted hire was rescinded. Collapsing the last
into the first reproduces the mistake the status vocabulary of a well-kept pipeline
exists to avoid: the reject rate absorbs a decision that was never a merit judgement,
the offer-acceptance rate keeps counting an acceptance the company then reversed, and
the person receives the selection-stage rejection message.

Three consequences follow:

- **The outbound message is chosen by outcome.** A rescission sends the rescission
  notice its ground requires, never the selection-stage template.
- **Every derived count sees a reversal.** A hire that was metered, exported to the
  system of record and recorded as an outcome must be reversed at each of those places,
  or the funnel still shows a hire the person never started.
- **The export names it.** The system of record receives a rescinded hire as that, not
  as a rejection of an applicant it had already been told was hired.

## Decision rules

- **When a contingency is late, the hire holds and the owner is told.** Nothing adverse
  is inferred from lateness.
- **When a ground rests on a report or a screening result, do not let the action
  complete until the notice has gone and the response window has run.** Pending is a
  state the record can hold.
- **When the person withdraws, record it as their act and do not run the company's
  rescission notices.** They were owed a confirmation, not a process.
- **When a rescinded hire is later reinstated, that is a new decision with its own
  actor**, not an undo of the old one.
- **When the ground is uncertain, hold and route to a human.**

## When not to use this

- **Same-day starts with no open contingency.** There is no window in which a
  rescission can happen apart from ending the employment, which is a different
  process.
- **Agency and contingent placements** where the employing entity is not the one
  running the hiring process. Route the decision to whoever holds the contract.
- **As a reason to stop rescinding.** The technique asks for a door with a process
  behind it, not for the door to be harder to find.
