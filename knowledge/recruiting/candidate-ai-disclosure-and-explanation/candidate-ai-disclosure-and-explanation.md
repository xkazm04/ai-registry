---
layer: golden-path
type: golden-path
subject: candidate-ai-disclosure-and-explanation
status: forged
use_when: [writing what a candidate is told about AI in the hiring process, exposing a decision history to the person it was about, deciding what may cross from the operator record to the candidate view, answering a request to explain or review an automated decision]
techniques:
  - disclosure-at-the-point-of-submission
  - allowlist-of-candidate-visible-decisions
  - decisive-facts-not-the-rationale
  - three-state-attribution-that-fails-to-unknown
  - held-data-derived-from-what-exists
  - right-to-request-a-human-review
---

# Candidate AI disclosure and explanation

Two duties live here, and conflating them is the first mistake.

**Disclosure** is prospective: before or at the moment a machine touches an
application, the person is told that it will, what it will look at, who decides,
and what they can ask for. **Explanation** is retrospective: after a decision has
affected them, that person is owed an account of *that decision* — what it was,
what actually moved it, who or what made it, and what recourse exists.

Both are addressed to the candidate. Neither is the audit record. The
organisation keeps a sealed, hash-chained, operator-attributed history of every
consequential decision because it must be able to defend itself years later;
that artifact is written for a regulator, a tribunal and a future engineer.
The candidate surface is written for one person, about themselves, and it is
constructed by *projection* — a deliberate, allowlisted narrowing of the
internal record — not by relaxing the internal record's access controls. The
sibling subject on decision audit and traceability owns the record itself; this
subject owns the boundary and everything on the far side of it.

The one-sentence test that decides every hard case: **a candidate is owed an
explanation of decisions about them, not the audit chain's internals and not
anyone else's data.**

## The description of a system is not an explanation of a decision

The most common failure in this domain is a sincere one. An organisation
publishes a thoughtful page about how its assessment technology works — the
signals it considers, the fairness testing it runs, the model family, a
flowchart — and believes it has discharged its explanation duty. It has not. It
has described a system. The person wants to know why *they* were declined.

The line is not about length or technical depth. Handing someone the scoring
formula, the feature weights, or a faithful step-by-step trace of the pipeline
fails the duty just as completely as a marketing page does, and for the opposite
reason: neither is intelligible as an account of one person's outcome. The
standard that has converged across regulators, courts and practice is that the
explanation must be **concise, intelligible, specific to this person's data, and
sufficient for them to contest the outcome**. That last clause is the operative
one. If, having read it, the person still cannot identify anything to correct,
dispute or appeal, the explanation did not happen.

Concretely, an explanation of a decision has to answer four questions and it can
usually answer them in four sentences:

1. **What was decided**, in the vocabulary of the process (not advanced;
   shortlisted; held for review), and when.
2. **Which of their own data went into it** — not the whole feature space, the
   data of theirs that was actually used.
3. **What was decisive** — the fact or facts that, had they differed, would have
   changed the outcome.
4. **Who or what decided**, and what they can do about it now.

Notice what is absent: the model's internal reasoning, the comparison against
other applicants, the operator's private notes, the score's derivation. Some of
that is protected; most of it is simply not an explanation.

## Disclosure is multistage, and each stage is a different document

Treating disclosure as a single privacy paragraph at the bottom of a form is how
teams end up with a notice that is technically present and practically useless.
Three stages, three documents, three audiences-of-one:

- **Before or at submission.** The person is deciding whether to hand over their
  career history. This is where they must learn that automated assistance is
  used, what it assesses, that a human decides, how long the data is held, and
  how to get it erased. Some regimes require this a fixed number of days before
  the tool is used at all, which in a rolling-applications world means *at the
  point of submission or earlier* is the only implementable reading.
- **In flight.** While a decision is pending, the person is owed an honest,
  non-misleading picture of where they stand. That surface is the sibling
  subject on candidate status transparency; disclosure's contribution to it is
  the attribution line — that a stage was reached with machine assistance, and
  that no adverse outcome was decided by the machine.
- **After an adverse decision.** The principal reasons, the manner and degree to
  which automation contributed, the categories and sources of data used, an
  opportunity to correct data that was wrong, and a route to human review. This
  is the stage most systems never build, because nothing in the happy path
  forces it.

The three documents must not contradict each other. The submission-time notice
is a *promise*; the post-decision explanation is the *performance* of that
promise. If the notice says a human decides every rejection and the explanation
surface attributes a rejection to the automated process, one of them is a lie
and the organisation cannot tell which.

## A disclosure asserting the wrong jurisdiction's law is a false statement

Disclosure text is frequently regime-specific: the enumerated rights, the
retention window, the advance-notice period and even whether a right to human
review exists at all differ by where the candidate is and where the employer
operates. The sibling subject on multi-jurisdiction hiring compliance owns the
regime matrix. What belongs *here* is the rendering rule, and it is
uncompromising: **a legal assertion may never have an optimistic default.**

The failure mode is banal in code and severe in effect. A disclosure component
initialises with a home-regime default while the compliance lookup is in flight,
so every candidate sees the wrong regime's promise on first paint. Worse, when
the lookup fails — an unauthorised response, an expired credential, a
misconfigured workspace — the default is never replaced, and a workspace in one
jurisdiction serves another jurisdiction's legal claim permanently, to everyone,
silently. Nothing errors. The page looks correct.

The rule that prevents it: render the **minimal universally-true statement**
until the regime is known, treat a failed regime lookup as *unknown* rather than
as the home regime, and never let a jurisdiction-specific clause appear on a
default. "A person reviews and decides" is safe everywhere. "You have a right to
X under statute Y" is safe only where Y applies. Degrade to the first; never
guess your way into the second.

## The boundary is an allowlist, and the default is hidden

Everything the operator record holds is invisible to the candidate unless it has
been deliberately admitted. A denylist inverts the risk: it makes every new
decision kind visible by default, exposing internal vocabulary, experiment
mechanics and half-written reason codes the moment a developer adds an enum
value and forgets that a public surface reads the same table. An allowlist ships
a new decision kind hidden until someone has written candidate-appropriate copy
for it — the copy is the admission ticket.

Three categories are excluded on principle, and it is worth knowing why each is
excluded, because the reasons differ:

- **Internals of the record.** Chain hashes, payload snapshots, policy version
  identifiers, the sealed rationale text. These are the machinery that makes the
  record defensible; they explain nothing to the subject and they leak the
  organisation's internal structure.
- **Other people.** The approving operator's name, comparative rank against
  other applicants, any datum that is about a second person. An explanation of a
  decision about you is not a window into anyone else, including the person who
  made it. Accountability for who decided runs to the regulator and the
  tribunal, not to the candidate; the candidate is owed *whether a human
  decided*, which is a different fact.
- **Events with no effect on them.** Being excluded from an experiment arm,
  being spared a screen at random, being enqueued and dequeued — these are
  process, not decisions that produced an outcome. Surfacing them manufactures
  anxiety and invites the person to contest something that did not happen to
  them. A holdout that spared someone is the clearest case: nothing was decided
  about them, so there is nothing to explain. Note the direction of the
  exclusion, though — sparing a candidate *is* a machine decision about that
  candidate and belongs in the operator's audit trail with an attribution. It is
  excluded from the candidate projection, not from the record.

Consent gates the whole surface, not merely its fields. Where the retention
window has expired or the record has already been anonymised, the explanation
view returns nothing at all — the same read-time rule every other boundary
applies. An explanation is a disclosure of personal data about a person, and it
does not get an exemption from the basis on which that data is held.

## Attribution has three states and fails away from the machine

Every candidate-visible decision names its actor as *a person*, *the automated
process*, or *not determined*. The third state is mandatory. A record whose
actor cannot be established must render as unknown, never as a default person
and never as an anonymous "our team".

The direction of failure is asymmetric and deliberate: authority may be
downgraded from human to automated when the record is unclear, never upgraded.
Claiming a human decided when the record cannot prove it is the one falsehood
this surface may never utter, because it is exactly the claim a person would
challenge and exactly the claim the organisation would have to substantiate.
Downgrading is conservative; it admits to more automation than may have
occurred, which harms nobody and understates the organisation's diligence.
Upgrading fabricates a human accountability that may not exist. See
[every-decision-names-its-actor](../_laws.md#every-decision-names-its-actor) and
[uncertainty-resolves-toward-the-candidate](../_laws.md#uncertainty-resolves-toward-the-candidate).

## Never claim to hold what you do not hold

The "what we hold about you" section is the part of a candidate data view most
likely to be written as a static list, and a static list is a standing lie in
both directions. It claims an interview recording for a candidate who never
interviewed. It omits the enrichment that a later feature quietly began storing.

Derive the list from what the record actually contains, item by item, at render
time. This is not merely tidier — it is the only construction that stays true
when the schema changes, and it is the construction that makes an erasure
request verifiable, because the same derivation that lists the data is the one
that enumerates what erasure must remove. The confirmation owes the same
honesty: an erasure that reports success because the code reached its last line,
rather than because a record was demonstrably altered, tells a person their data
is gone while it is still readable — the single worst false statement this
surface can make. Lawful basis and erasure themselves
belong to the sibling subject on candidate consent and retention; the duty
*here* is that the inventory shown to the person is a reading of the record, per
[say-only-what-the-record-holds](../_laws.md#say-only-what-the-record-holds).

## Meaning does not survive a renamed stage

Candidate-facing copy is derived from pipeline state, and pipeline state is
whatever a talent team called their columns this quarter. Map to a stable role
vocabulary — entry, screening, interview, offer, terminal — and compose the
sentence from the role, never from the label. The failure this prevents is
concrete and humiliating: an offer-stage candidate told "we have received your
CV" because someone renamed a column and the copy lookup fell through to a
default. Likewise a role that closed reads as *not selected* without implying
anything about the person's merit, because no merit judgment was recorded.

## The right to human review must be a mechanism, not a sentence

Promising review and implementing a contact address is the most common hollow
compliance artifact in this domain. A real review right has four properties: it
is reachable from the surface where the decision was shown, it is available at
any point rather than within a window the person will miss, it routes to a human
with authority to reverse, and its outcome is sealed back into the record
attributed to the reviewing human — never inheriting the machine's attribution.

The right is also the pressure valve for everything above. A person who
disagrees with an explanation they cannot fully verify has somewhere to go, and
that path is what converts a disclosure from a claim into an accountable one.
Where no adverse outcome is ever solely automated to begin with
([no-adverse-outcome-is-solely-automated](../_laws.md#no-adverse-outcome-is-solely-automated)),
review is a second human look rather than a first one — which is the posture to
aim for, because it means the promise was true before anyone asked.

## Failure modes of the naive reading

- **Transparency as volume.** Publishing more — the model card, the weights, the
  full trace — while answering none of the four questions. Volume is a defence
  against the accusation of secrecy, not a discharge of the duty.
- **The audit record with the scary bits deleted.** Building the candidate view
  by redacting the operator dossier, field by field, rather than projecting a
  purpose-built view. Redaction leaves the internal shape visible and fails open
  the moment a field is added.
- **Disclosure that overpromises.** Copy asserting human review of every
  decision, in a system where a threshold silently auto-declines. The promise is
  the easy part to write and the expensive part to keep; write only what the
  pipeline enforces.
- **Explanation that leaks a second person.** Naming the approving operator, or
  explaining a decline by reference to stronger applicants. Both feel candid.
  Both are disclosures about someone else.
- **Trade secrecy as a blanket refusal.** Commercial confidentiality narrows
  what may be said about internal mechanics; it does not extinguish the person's
  right to know which of their data was used and what was decisive. Refusing
  wholesale on secrecy grounds is not a defensible position.
- **A notice that renders before it knows.** Any legal assertion painted from a
  default while a lookup is pending. Covered above; it belongs in this list
  because it is the failure that looks least like one.

## The techniques

- [disclosure-at-the-point-of-submission](techniques/disclosure-at-the-point-of-submission.md)
  — the four clauses that reach every applicant, and the legal assertion that
  may never render from a default.
- [allowlist-of-candidate-visible-decisions](techniques/allowlist-of-candidate-visible-decisions.md)
  — hidden by default, admitted only by candidate-appropriate copy.
- [decisive-facts-not-the-rationale](techniques/decisive-facts-not-the-rationale.md)
  — the contestable pair, never the argument written to defend the decision.
- [three-state-attribution-that-fails-to-unknown](techniques/three-state-attribution-that-fails-to-unknown.md)
  — downgrade toward the machine, never upgrade toward a person.
- [held-data-derived-from-what-exists](techniques/held-data-derived-from-what-exists.md)
  — an inventory that cannot over-claim or under-claim, because it is a
  traversal.
- [right-to-request-a-human-review](techniques/right-to-request-a-human-review.md)
  — the four properties that separate a mechanism from a sentence.
