---
layer: golden-path
type: golden-path
subject: pre-boarding-and-first-day-handoff
status: forged
use_when: [designing what happens after a candidate accepts an offer, building a pre-boarding questionnaire or new-hire checklist, handing a hire from recruiting to a manager or people team, investigating a renege or a first-day no-show]
techniques:
  - the-acceptance-to-start-date-silence-gap
  - industry-preset-checklists
  - language-neutral-template-keys
  - the-live-stage-gates-the-handoff
  - pre-boarding-questionnaire-as-a-hire-record
  - signature-seam-declared-not-implied
---

# Pre-boarding and first-day handoff

This subject owns the window between a signed acceptance and a first day. It begins
at the instant the acceptance is recorded — the sibling `offer-lifecycle-and-deadlines`
guarantees exactly one such event, with an actor and a timestamp, and that guarantee
is the only thing this subject is entitled to assume. It ends when the person has
started and the record of them has moved into whatever system runs employment.

It is the least-instrumented stretch of the entire hiring process in almost every
organisation, and the reason is structural rather than accidental. At acceptance the
requisition closes. The time-to-hire clock stops and the number is booked. The
recruiter's scorecard is complete and their next search is already late. The manager
believes recruiting still owns the person; recruiting believes the manager does now.
The person, meanwhile, is going to spend anywhere from two weeks to three months
between "I accepted" and "I started," during which absolutely nothing is measured and
frequently nothing at all happens.

So the silence is not an oversight anyone made. It is what the incentive structure
produces by default, and closing it is a design decision nobody in the process is
rewarded for making. State that plainly to whoever is funding the work, because the
usual framing — "we just need a better welcome email" — will not survive first contact
with the fact that no team's metrics move when the gap is closed and every team's
metrics already moved when it opened.

## What is actually at risk here

Three distinct losses live in this window, and they have different causes.

**The renege.** The person accepts and then does not start, usually because a
competing process they had not yet closed produced an offer, or because their current
employer counter-offered, or because the doubt that every acceptance carries had two
uninterrupted months to grow. Renege rates rise with the length of the gap and with
the silence inside it — those are separable variables, and only one of them is under
your control. You cannot usually shorten a notice period. You can absolutely decide
whether the person hears from the organisation during it.

**The lost hire cost.** A renege at week eight of a ten-week gap is more expensive
than a rejection at screen by roughly the entire cost of the search, plus the delay of
restarting it, plus the fact that the runner-up has usually gone. This is the number
that funds the work; the sibling `silver-medalist-rediscovery` owns whether the
runner-up is still reachable.

**The bad first day.** The person starts, and their access does not exist, their
equipment has not arrived, nobody has been told they are joining, and their manager is
on leave. This is not a smaller failure than the renege; it is the same failure caught
later. Both are produced by the same absent handoff.

## The handoff has a named owner, or it has none

The single most useful structural rule in this subject: **at the moment acceptance is
recorded, one named person becomes accountable for the hire until their first day.**
Not a team, not a queue, not "People Ops" — a person, recorded on the hire's record,
visible to the candidate.

This is an instance of the general law that
[every decision names its actor](../_laws.md#every-decision-names-its-actor), applied
to an ownership transfer rather than a decision. The transfer is consequential and
irreversible in practice — once the recruiter has moved on, they do not come back —
so it records who received it. A handoff with a null owner renders as *unassigned*,
which is a work item; it must never render as the recruiter, who did not agree to it.

The corollary is that the handoff is an *event*, not an assumption. Something happens
at acceptance: a record is created, an owner is set, a first contact is scheduled. If
nothing happens at acceptance except a stage change, there was no handoff — there was
a stage change, and the person is now in a queue nobody reads.

## The acceptance token is not the hire

The most common implementation error in this window is to treat the artifact the
candidate holds — an acceptance link, a signed letter, a token — as sufficient
authority to provision. It is necessary and it is not sufficient. Between acceptance
and day one a person can be un-hired: a requisition pulled, a background check
returned, a role restructured, a start date withdrawn, an offer accepted and then
rescinded by either side. The live pipeline state is what governs; the token only
proves who is asking.

This has a sharp operational form, and it is the subject of a technique below: a
revoked pre-boarding run is never silently re-created. A gate that says "no run
exists, therefore start one" will happily re-provision a hire someone deliberately
cancelled — and the person then receives a cheerful welcome questionnaire for a job
that was withdrawn from them last Tuesday. Both sides of the handoff — the one the
new hire touches and the one the people team touches — must consult the *same* gate,
because two gates that can disagree eventually will, and the disagreement always
resolves in favour of whichever side had less context.

## Pre-boarding collects a different class of data than selection ever could

Up to acceptance, everything the organisation holds about the person is *selection*
data — it exists to answer whether to hire. From acceptance, it becomes *employment*
data — it exists to pay, equip, insure and legally engage them. The questionnaire
that straddles that line is the most sensitive artifact in the whole hiring process,
because it is the first time the organisation may legitimately ask things it was
forbidden to ask an hour earlier: a bank account, a national identifier, an emergency
contact, a health or immunisation record, a right-to-work document, a clothing size.

Three rules follow and none of them is optional.

First, **the purpose changed, so the basis changed.** The consent or legal basis that
covered the application does not cover this. The sibling
`candidate-consent-and-retention` owns the basis, the retention clocks and the
deletion path; this subject owns the discipline of not smuggling employment-data
collection into a selection-era record and hoping nobody notices.

Second, **ask at the latest responsible moment, not the earliest possible one.** Every
field collected before day one is a field that must be deleted if the person does not
start. Collect what genuinely unblocks provisioning — the name they want on their
badge, their equipment need, their confirmed start date — and defer everything that
only the payroll system needs until the payroll system exists for them.

Third, **an empty answer is not an answer.** A blank submission must not mark the
record as complete, and it must not consume the one reminder the person was owed. The
law is [absence of evidence is not evidence](../_laws.md#absence-of-evidence-is-not-evidence):
"not yet filled in" and "filled in with nothing" are different states, and only the
first should still be chasing the person.

## What "onboarded" means is sector-shaped, and a preset is a compressed theory of it

A general office hire needs a contract, identity and tax details, equipment, accounts,
a buddy and a first-day agenda. A clinician needs primary-source licence verification,
credentialing, immunisation records and patient-safety training before they may touch
a patient — and the contract is the *least* interesting item on their list. A trades
hire needs a safety orientation and issued protective equipment before they may be on
site at all. A technology hire needs intellectual-property assignment and equity
paperwork that the office default does not contain. A frontline service hire needs
work authorisation confirmed and a uniform issued, and their checklist has to run in
days rather than weeks because that is how fast the role fills.

Those are not five variations of a form. Each is a compressed claim about what has to
be true before this person may legally and safely do the work, and the sequencing
inside each one matters — the safety orientation gates site access, the licence
verification gates patient contact. Shipping presets is how that knowledge reaches a
team that does not have it. Shipping them *as guarantees* is how a team stops thinking
about it. The technique below carries the discipline that keeps presets honest.

## Every string in this window has three readers in three languages

A checklist item or a questionnaire field is authored once, by a recruiter, in
whatever language they happen to be working in. It is then read by a colleague in the
same workspace who may not share that language, and — months later, on a page of their
own — by the new hire, whose language is neither. Freezing the sentence at authoring
time pins all three readers to one person's locale forever.

The settled answer is to store a stable key and resolve it at read time, keeping the
authored text only as a fallback for rows whose key was deliberately dropped. This is
the second half of [meaning does not live in a label](../_laws.md#meaning-does-not-live-in-a-label):
a record persists structured facts and composes its sentence for the reader in front
of it. The trap is partial coverage — a system that resolves the six default fields
and silently falls back to authored text for the forty sector-specific ones has a
localisation story for exactly the cohort that needed it least.

## A stamp is not a signature unless you can say whose it is

Almost every pre-boarding flow acquires an e-signature surface, and almost every one
of them starts as an internal audit stamp: someone on the people team marks the
contract signed. That is a perfectly reasonable first implementation and a genuinely
dangerous thing to *label* as a signature, because the documents passing through it
are employment contracts, non-disclosure agreements and intellectual-property
assignments — precisely the documents someone will one day try to rely on in a
dispute.

The rule is that the seam is declared in the vocabulary the user sees, not in a
comment only a maintainer reads. If the person who was marked as having signed did not
personally act, the record says who marked it and when, and the interface says
"marked complete" rather than "signed." Upgrading to a qualified electronic-signature
regime is then a provider change behind a named seam, not a relabelling exercise
conducted after a lawyer asks a question. [Say only what the record holds](../_laws.md#say-only-what-the-record-holds).

## Delivery is the whole feature

A pre-boarding experience that exists but is reachable exactly once — a link rendered
on the acceptance confirmation screen, never emailed, never reminded — has a
completion rate governed entirely by whether the person closed the tab. Most do. The
hire record then stays empty, the people team concludes the questionnaire is not
worth building on, and the ghosting window the feature existed to close is exactly as
open as it was before.

So treat the link as a delivered artifact with its own lifecycle: sent on acceptance
through a channel the person actually reads, re-sendable on request, and chased once —
once — if it is still unanswered after a few days. Whether it *arrived*, was retried
and was deduplicated belongs to `candidate-communication-integrity`; what this subject
owns is that it was owed, and that "we showed it to them" is not delivery.

## Seams with neighbouring subjects

`offer-lifecycle-and-deadlines` owns everything up to and including the acceptance
write. The handover point is that single guaranteed acceptance event: it owns that
exactly one exists and who caused it; this subject owns everything that event
triggers. Correspondingly, everything downstream of acceptance is *best-effort behind*
the acceptance and never a precondition of it — a provisioning failure must not turn a
successful acceptance into an error for the person who just took the job.

`candidate-communication-integrity` owns whether anything you send in this window
arrives, is retried, and is not duplicated. This subject owns what is owed and when;
a message that was never scheduled is a handoff failure, a message that was scheduled
and lost is a delivery failure.

`candidate-consent-and-retention` owns the legal basis, retention clock and deletion
path for the far more sensitive data a hire's record now holds. This subject owns the
collection discipline — what is asked, when, and by what necessity.

`portable-hiring-records` owns the export into a system of record. The hire stage is
usually the terminal state a hiring system owns; what happens after it belongs to a
human-resources platform, and the boundary is honest only if the export is real. A
handoff that ends at "the webhook fires" and begins again at "someone re-keys it by
hand" is two handoffs with a gap in the middle, and the gap is where the person is.

`degrade-never-block-a-candidate` owns the general posture that your outage is not
their problem; this subject inherits it unchanged for everything the acceptance
triggers.

## Failure modes of the naive reading

- **Acceptance as an ending.** The stage moves, the requisition closes, and nothing
  else is scheduled. The next event on the person's record is their start date, or
  the absence of one.
- **The handoff nobody received.** Ownership transfers to a team rather than a person,
  and every member of that team correctly believes someone else has it.
- **Provisioning from the token.** Anyone holding an acceptance link is treated as a
  hire, so a withdrawn hire re-provisions, a cancelled run restarts, and a person
  receives onboarding for a job that no longer exists.
- **A form built for the strongest cohort.** The office default shipped to a clinical
  or frontline team, whose actual blockers — licence, immunisation, safety, work
  authorisation — are absent from it, so the checklist reads as complete while the
  person cannot lawfully start.
- **Presets as compliance.** The opposite error: a sector template treated as a legal
  guarantee, so nobody checks it against the jurisdiction it will run in.
- **Copy frozen at authoring time.** A questionnaire composed in the recruiter's
  language and read by a new hire in another, months later, on a page of their own.
- **A stamp that reads as a signature.** An internal completion mark presented in the
  grammar of an executed document, on exactly the documents where that matters.
- **The link shown once.** A pre-boarding surface with no delivery, no resend and no
  reminder, whose measured completion rate is then used as evidence that hires do not
  want it.
- **Chasing a blank.** An empty submission recorded as complete, which both flatters
  the record and suppresses the reminder the person actually needed.
