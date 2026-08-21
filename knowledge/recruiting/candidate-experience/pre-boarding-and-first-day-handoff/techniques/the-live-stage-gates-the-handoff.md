---
layer: technique
type: technique
subject: pre-boarding-and-first-day-handoff
technique: the-live-stage-gates-the-handoff
status: forged
laws: [meaning-does-not-live-in-a-label, every-decision-names-its-actor, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [building a token-authenticated pre-boarding surface, deciding what may provision after an acceptance, debugging a withdrawn hire that re-provisioned]
---

# The live stage gates the handoff

An accepted-offer token proves **who is asking**. It does not prove that the person is
still being hired. Every provisioning action after acceptance is authorised by the
*live* pipeline state, re-read at the moment of the action; the token is a credential,
not a decision.

## Why the token is not sufficient

Between acceptance and day one the hire can be undone, and every one of these
scenarios is ordinary rather than exotic:

- the offer was accepted and then withdrawn by the organisation;
- the requisition was pulled or the role restructured;
- a background, credential or right-to-work check came back and the hire was closed;
- the person was moved back to an earlier stage while something was renegotiated;
- the person was closed out on this requisition after being hired on a different one;
- the pre-boarding run itself was deliberately cancelled by the people team.

The acceptance is a frozen historical fact — it happened, and it stays true. The
hire's *status* is a live one. A gate that reads the frozen fact and provisions from
it will cheerfully send a welcome questionnaire to someone whose job was withdrawn
last week, which is the single most damaging message this window can produce.

## The gate

Resolve a pre-boarding surface in this order, and return the same nothing for every
failure:

1. **Resolve the token** to an offer. No offer, no run.
2. **Require the offer to be accepted** and to be linked to a pipeline entry. This is
   the necessary condition.
3. **Re-read the entry's live stage** and require it to hold the terminal, hired role.
   This is the sufficient condition, and it is the step that is routinely omitted.
4. **Refuse outright if an existing run is cancelled.** A revoked run stays revoked;
   it never resolves and is never re-created around.
5. **Otherwise ensure a run exists**, idempotently, so the link works even for a hire
   whose record nobody on the people team has opened yet.

Step 3 keys off a **stable role in the stage vocabulary**, never off the display name
of a column. Teams rename their board, split the hire column, or run a "starting soon"
stage of their own; a gate that string-matches a label breaks silently the day someone
edits it, and breaks in the permissive direction.
[Meaning does not live in a label](../../../_laws.md#meaning-does-not-live-in-a-label).

Step 4 is the one people argue about, so state it as a rule: **absence of a run is not
permission to create one.** "No run exists, therefore start one" is indistinguishable
from "the run was cancelled, therefore start another." Cancellation must be a recorded
terminal state on the run, distinct from non-existence, and the gate must check for it
before the create path.

## One gate, consulted by both sides

The surface the new hire touches and the surface the people team touches must call the
**same** gate function. Not equivalent logic — the same one.

Two independently-written gates always drift, and the drift is asymmetric: the
candidate-facing side is written with less context, tested less, and is the one facing
the person. When they disagree, the people team sees a hire correctly marked withdrawn
while the person is filling in an onboarding form. Every subsequent bug in this area
is a variation on that theme, so collapse it structurally rather than by convention.

## Refuse with one answer, and leak nothing

Every failure above returns the same unavailable state to the person holding the link.
Do not distinguish "you were never hired" from "your hire was withdrawn" from "this
token is not ours" on a public, token-authenticated surface — the differences are
exactly the information an enumerating party wants, and the differences are also news
that must never be broken to a person by a web page. Where the outcome is adverse and
the situation is ambiguous,
[uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate):
show nothing, and route a task to the named owner to make the call and the phone.

Machine-facing consumers still get a stable code so a surface can localise its own
copy; the code carries the class of refusal, not the person's situation.

## Record the conflict, never swallow it

When a provisioning action is refused because the live stage disagrees with the token,
that is a fact somebody needs. Write it to the hire's timeline as a distinct event —
an attempt was made on a closed record and was blocked — with its actor. A silently
dropped attempt means nobody learns that a withdrawn hire is still holding a live link
and still believes they are starting on Monday.
[Every decision names its actor](../../../_laws.md#every-decision-names-its-actor); a
refusal is a decision, and "the system, on this rule, at this time" is a complete actor.

## The side effects go behind the gate, never in front of the acceptance

The ordering rule that keeps this safe: the acceptance write is claimed exactly once
and is authoritative; everything the acceptance triggers — metering, outcome
recording, export to a system of record, starting the pre-boarding run — is
best-effort *behind* it. A provisioning failure logs loudly and never turns a
successful acceptance into an error page for the person who just took the job. The
sibling `offer-lifecycle-and-deadlines` owns that the acceptance happened once; this
technique owns that nothing downstream may hold it hostage.

Conversely, nothing downstream may run *twice*. Because the acceptance is claimed by
exactly one writer, the handoff hangs off that claim, not off a status read — a status
read is a snapshot two concurrent responses both pass.

## Decision rules

- **When a stage moves after acceptance, re-evaluate every open pre-boarding
  artifact.** The link the person holds does not expire on its own.
- **When the people team revokes a run, that revocation outranks any later
  provisioning trigger, including a fresh acceptance on a duplicate link.**
- **When a hire is closed out on one requisition and hired on another, resolve against
  the entry the offer was linked to.** Provisioning the wrong role is worse than
  refusing.
- **When a token is presented for a run in a different workspace or tenant, refuse
  before any of the above.** Tenancy is the outermost gate and belongs to the
  engineering bundle; it is named here only so nobody puts the stage check first.
- **When in doubt about whether the state is live enough to act on, do not act.**
  Provisioning is reversible for the organisation and irreversible for the person's
  experience of it.

## When not to use this

- **Systems where acceptance and hire are the same atomic event and nothing can undo
  them** — genuinely rare, and usually a claim rather than a fact.
- **Purely internal, authenticated recruiter surfaces**, which have their own
  authorisation model and full context. The gate still governs what may *provision*;
  it does not govern what a logged-in recruiter may read.
- **As a substitute for telling the person.** The gate stops a withdrawn hire from
  being onboarded. Only a human stops them from finding out by clicking a link.
