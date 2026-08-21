---
layer: technique
type: technique
subject: pre-boarding-and-first-day-handoff
technique: pre-boarding-questionnaire-as-a-hire-record
status: forged
laws: [absence-of-evidence-is-not-evidence, say-only-what-the-record-holds, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [designing what a new hire is asked before day one, storing pre-boarding answers on a hire record, deciding what a blank or partial submission means]
---

# The pre-boarding questionnaire as a hire record

The questionnaire a person fills in between acceptance and day one is the first thing
they complete as an employee-to-be rather than as a candidate. It is also the moment
the record about them changes class: from *selection* data, which existed to decide
whether to hire, to *employment* data, which exists to pay, equip, insure and legally
engage them.

The technique is to treat that document as a hire record with its own collection
discipline, its own field set, and its own honest states — not as a form bolted to the
end of the offer flow.

## The class change is the whole point

An hour before acceptance, asking for a bank account, a national identifier, a health
record or a clothing size would have been improper and in most jurisdictions unlawful.
An hour after, several of those become legitimate — because the purpose changed.

Three consequences:

- **The purpose changed, so the basis changed.** Whatever covered the application does
  not cover this. The sibling `candidate-consent-and-retention` owns the basis, the
  retention clock and the deletion path; what this technique owns is not smuggling
  employment-era collection into a selection-era record because the row already
  existed.
- **These answers must never flow backwards into selection.** A health record, an
  emergency contact, an equipment preference or a work-authorisation field must not
  become visible to anyone still evaluating anybody, must not enter a matching or
  scoring surface, and must not appear in an analytics cohort. The strongest
  structural version of this rule is that the pre-boarding store is not the
  candidate-evaluation store.
- **If the person does not start, this data has the shortest life of anything you
  hold.** Collect on the assumption that you will be deleting it.

## Ask at the latest responsible moment

The field set is governed by one question per field: *what does this unblock, and when
is the earliest it is genuinely needed?*

- **Ask before day one** what provisioning actually blocks on: the name the person
  wants used and on their badge, confirmation of the start date, equipment or
  accessibility needs, sizing where the role issues clothing or protective equipment,
  an emergency contact, and the sector-specific evidence that gates the work — a
  licence number and expiry, held certifications, immunisation status, work
  authorisation.
- **Defer to the employment system** everything only payroll, benefits or tax needs.
  Every field collected early is a field to delete on a renege and a field to migrate
  on a start.
- **Never ask for anything the record already holds.** Re-asking a person for their
  own name, spelled the way they already spelled it twice, is the clearest possible
  signal that nobody read their file. Prefill what you have, let them correct it, and
  record the correction as authoritative — a person's own statement of their name
  outranks whatever a parser extracted from a document.

Ask for the preferred name explicitly and early, and use it everywhere from that
moment. It is the cheapest field on the form and it changes the tone of every message
that follows.

## The field set belongs to the run, not to a global constant

Which fields a hire sees comes from **their own template**, resolved at read time —
because a clinical hire and a frontline hire are asked different things, and a
questionnaire edited last month must not retroactively change what an in-flight hire
was asked. The set the surface renders and the set the write path accepts must be the
same set, derived from the same place.

That is also the trust boundary. On submission, keep only the keys this run's
template defines and discard everything else, silently. A questionnaire endpoint that
persists whatever it is handed lets anyone holding a link write arbitrary fields onto
a hire record. Bound each value's size as well; the general defence belongs to the
engineering bundle, but the specific rule — *the allowed set is this run's template,
never a global list* — is a hiring rule, because a global list is exactly what makes a
frontline hire's record accept a clinical field.

## Empty is not submitted

An all-blank submission must not persist. This is the highest-value small rule in the
technique, and it fails in a specific, compounding way:

1. An empty record marks the hire as having submitted, so the recruiter's view says
   the questionnaire is done.
2. Reminder logic almost always excludes hires that have a submission, so the empty
   row **permanently suppresses** the one nudge the person was owed.
3. The person is now silent, unreminded, and recorded as engaged.

So: reject an empty submission with a distinct signal that says *nothing was
provided*, not one that says the link is invalid. Those are different problems for the
person in front of the screen, and conflating them sends someone hunting for a broken
link that works fine.
[Absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence):
"not yet filled in" and "filled in with nothing" are distinct states, and only the
first should still be chasing anybody.

The same rule governs partial submissions. Save what was given, mark the record
partial rather than complete, and keep chasing the fields that are still missing —
never render a partially-answered questionnaire as done, and never render an unanswered
field as an empty value the people team might act on.
[Say only what the record holds](../../../_laws.md#say-only-what-the-record-holds).

## Show the person only their side

The hire's view carries their identity, their questionnaire, and at most a read-only
reassurance that things are progressing. It does not carry the internal checklist
actions, the internal task list, the offer terms, or anything about who else is
involved. A window into the organisation's own workflow is not reassurance; it is a
place for a person to watch a task sit unstarted for three weeks.

## Mirror engagement to the people team — and make the mirror durable

When the person submits, the people team should see it. That signal and the answers
themselves are frequently written through different paths, and when the mirror is
best-effort and the write is not, a momentary contention can persist the answers while
silently dropping the "candidate engaged" event — so the record diverges from the
signal, and someone chases a hire who already replied. Retry the transient failure a
bounded number of times, and if it still fails, log it as a divergence rather than
losing it quietly. The answers are the source of truth; the timeline event is a
derived convenience that must not be allowed to lie.

## Decision rules

- **When a field is not needed before day one, do not ask for it before day one.**
- **When a field is sector-gating (a licence, a certification, work authorisation),
  ask for the evidence, not for a self-assessment of compliance.** A number and an
  expiry date can be verified; "yes, I'm licensed" cannot.
- **When an answer conflicts with what the record holds, the person's own answer wins
  for identity facts and triggers a review for verifiable ones.**
- **When the person does not start, delete on the retention clock the consent sibling
  defines — and delete the questionnaire answers first**, because they are the most
  sensitive and the least useful.
- **When a hire's data is ambiguous and an automated action would be adverse — a
  missing work-authorisation field, an unreadable licence number — hold and route to a
  human.** [Uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate).

## When not to use this

- **Where a human-resources platform already owns pre-boarding intake.** Two
  questionnaires asking the same person the same things is worse than one that is
  slightly late; hand over instead, and let `portable-hiring-records` own the export.
- **Same-day starts**, where the questionnaire and the first-day paperwork are the
  same conversation, in person.
- **As a screening instrument.** Nothing collected here may ever influence whether the
  person is hired — they already are.
- **As a substitute for contact.** A form is a request for the person's labour. A
  window whose only two messages are both forms is still a silent one.
