---
layer: technique
type: technique
subject: rejection-with-dignity
technique: name-the-decisive-reason-from-the-record
status: forged
laws: [say-only-what-the-record-holds, inference-must-look-like-inference, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [drafting decline copy, deciding what reason a rejection may state, reviewing a personalisation feature for a rejection flow]
---

# Name the decisive reason from the record

A decline may state exactly one reason, and it must be the reason that is on
file. This technique is the resolution procedure that turns a stored decision
into a sentence — and, equally, the refusal procedure that produces no sentence
when the record holds nothing.

The failure it prevents is subtle because it looks like quality work: a
per-candidate generation pass that reads the profile and writes a considered,
specific, well-argued rationale. That rationale was produced at send time by
something that was not in the room when the decision was made. It is an
inference wearing the grammar of a recorded fact
([inference-must-look-like-inference](../../../_laws.md#inference-must-look-like-inference)),
and it is unfalsifiable against your own audit trail — which means the first
time a candidate asks "on what basis", your letter and your record disagree.

## The resolution order

Resolve the reason deterministically, taking the first that exists:

1. **A knockout answer.** A stated disqualifying response to a screening
   question — no work authorisation for the location, unwilling to relocate
   when relocation is mandatory, missing a legally required credential. This is
   the cleanest reason there is: factual, candidate-supplied, and not a
   judgment about them. Say it plainly.
2. **Missing must-have requirements.** Name them, drawn from the recorded set
   of unmet mandatory requirements, not re-derived at send time. Two or three
   at most; the ceiling applies here.
3. **The recorded comparative outcome.** A match tier, a scorecard verdict, a
   ranked shortlist position. This yields the honest comparative sentence:
   other applicants matched the requirements more closely. It is available only
   when one of those is actually on the record. A strong profile with nothing
   missing is not a recorded comparison.
4. **Nothing.** No reason section at all. The letter says the application is
   not being taken forward, and stops.

**The stage that decided supplies the reason.** Where the decision was taken at
an interview, the reason comes from that interview's own record (the weakest
recorded competencies), and steps 2 and 3 are not consulted: a CV gap named for
a candidate who was invited in on that CV is a lie they can check. A live
letter of exactly this kind shipped in one implementation: an interview-stage
candidate was told the decisive reason was a gap that had been on her CV the day
she was invited in, and a screening-stage and an interview-stage letter named
the same reason, only the greeting differing. The cure was structural. The
prompt's reason instruction now branches on which evidence exists, and the model
must name the deciding axis in a structured field that is checked against the
record, because the prose itself cannot be checked across four languages.

Within steps 2 and 3 there is a second, sharper ordering: **what a human asked
for outranks what a machine derived.** A recruiter's own recorded checklist of
still-unmet criteria is a better reason than a matcher's list of unmet
requirements, even though both are "on the record", because the first is a
stated hiring intention and the second is an extraction artifact that may
reflect a parsing miss rather than a real absence. Rank reason sources by
provenance and label which source a given letter used, so a later reader can
tell a recruiter's judgment from a pipeline's inference.

A generic "we have decided to proceed with other candidates" is legitimate only
as state 3 or 4 — as the true comparative outcome, or as the neutral closing
when nothing specific is on file. It is not legitimate as a *substitute* for a
recorded specific reason: if the record says the candidate lacked two mandatory
qualifications, hiding that behind the generic line withholds the one piece of
information they can actually act on.

## The strong-profile case

When the record shows a strong match and no missing requirements — the
candidate was good and someone else was better, or the role filled — there is
no deficiency to name and the system must not manufacture one. Any invented gap
here is the worst possible letter (see the sibling technique on disproven
gaps): the candidate's own evidence refutes it immediately.

What may be said in its place depends on what the record holds. With a recorded
comparison (a shortlist position, a candidate chosen instead) it is the graceful
comparative statement; with a recorded structural fact (role closed, filled
internally) it is that fact; with neither it is nothing beyond "not taking your
application forward", plus one genuine acknowledged strength drawn from what was
recorded. This section used to prescribe the comparative sentence for every
strong profile. A live implementation showed why that fails: told to say another
candidate matched more closely, the model also wrote that the decision was close,
and nothing in the record said either.

## Reasons that are true and unsayable

Some recorded reasons cannot be relayed: headcount withdrawn, an internal
appointment, a frozen requisition, an unrelayable reference finding, a
confidential business decision. The rule is **say the true structural fact at
the level you can say it, or say nothing** — the role has closed, the position
was filled internally. Never swap an organisational reason for a
candidate-attributed one. That substitution converts a decision that had
nothing to do with the person into a documented judgment about their ability,
and it is both a lie and an unnecessary injury.

## Binding the reason to what it judged

The reason must be bound to the version of the role and rubric it was decided
under ([a-verdict-is-bound-to-what-it-judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged)).
If the requirement set changed after the decision, the letter still states the
requirements that were actually applied; re-deriving against the current
posting produces a reason the decision-maker never used. Concretely: freeze the
reason payload with the decision, and have the letter read that frozen payload
rather than recompute anything.

## Decision rules

- When a reason exists in the record, state it; when it does not, state none —
  never generate one at send time.
- When several reasons exist, name the **decisive** one only. A list of every
  imperfection is a dossier, not an explanation.
- When the stored reason is free text written by a recruiter, it passes through
  the protected-attribute filter before it may be quoted, and it is quoted at
  the record's altitude — not paraphrased into something warmer that says more.
- When a reason category is itself a protected characteristic or a close proxy,
  it is never stated, and the decline falls back to the recorded comparative
  outcome, or to no reason where there is none, while the underlying decision
  goes to review.
- When the candidate asked for the reason and the record holds none, say so in
  one plain sentence (the record does not point to specific areas, so the sender
  would rather not guess). Silence is right in an unsolicited letter; in an
  answer to a request it reads as a refusal to reply.
- When the record's reason contradicts the record's own evidence about the
  candidate, suppress and escalate — do not ship a reason your own data
  disproves.

## What the law asks for, checked 2026-09-29

The technique's mechanism (state only the frozen recorded reason, never a fresh
one) is what both camps of legal advice converge on, and it needs a stated
position because the advice splits. Counsel in the US commonly advise against
giving a specific reason, because an explanation that later shifts can be read
as pretext; the same body of case law also holds that Title VII does not oblige
an employer to articulate a basis at the time, and that the employer is not
bound to whatever reasons it gave (*Rooney v. Rock-Tenn*, 8th Cir., 2018, as
quoted by an employment-law blog; the opinion was not read, and this is a
dismissal case, so it bears on hiring by analogy). The
reason to state one anyway is that where the explanation is frozen with the
decision and quoted from it, it cannot shift.

- **No duty to give reasons was found.** The UK's Acas guidance says "Employers
  do not have to explain their reasons for rejecting job applications" (fetched
  2026-09-29), and the discrimination questionnaire route was repealed in 2014.
  No EU or Czech rule requiring reasons surfaced. But where a claim is brought,
  the burden of proof shifts, so the frozen payload is a defence asset as well as
  a courtesy (*Meister*, C-415/10: a refusal of any information can be a factor
  in presuming discrimination).
- **Explanation on request is where the law is heading.** EU AI Act Art. 86(1)
  gives a person affected by a high-risk system's decision a right to "clear and
  meaningful explanations of the role of the AI system in the decision-making
  procedure and the main elements of the decision taken"; employment is in
  scope. The Digital Omnibus on AI moved the stand-alone high-risk application
  date from 2 August 2026 to 2 December 2027 (in force 27 July 2026, per a law
  firm's report of the text; the Official Journal was not read). The CJEU's
  *Dun & Bradstreet Austria* (C-203/22, 2025) reads the GDPR access right to
  need "the procedure and principles that were actually applied", not a bare
  formula (law-firm summary; judgment not read). Both point the same way: the
  answer to a request is the sealed reason read back in the record's terms.
- **One US regime prescribes part of the notice.** Colorado's SB 26-189 (signed
  2026-05-14, effective 2027-01-01, enforcement under legal challenge at the time
  of writing) requires, within 30 days of an adverse outcome, "a plain-language
  description of the decision, the ADMT's role, and instructions for requesting
  additional information" (a law firm's summary). California's ADMT rules apply
  from 2027-01-01 and the final text's notice duty was not confirmed. Illinois
  and New York City require notice of the tool, not a reason in the rejection.
- **A retention promise meets a legal hold.** The ICO says unsuccessful
  candidates' records should not be kept beyond the period in which a claim can
  be brought, and that longer holds need prior notice; US federal rules require
  one year (29 CFR 1602.14, not read here). A letter's stated window must not
  promise deletion inside one of these, and the window belongs on the application
  form as well as in the decline.

Not evaluated: the primary text of the Omnibus regulation, the California final
rule, and the Czech data-protection authority's current view of a retention
period.

## When not to use this

- **Where a jurisdiction prescribes wording.** Some regimes mandate specific
  adverse-action language, notice periods, or a stated right to contest. The
  statutory text governs; this technique fills what remains.
- **Where a human is having a conversation.** A finalist debrief is a dialogue,
  and a person may say more than the record holds *as their own opinion,
  labelled as such*. What they may not do is put that opinion in writing as the
  organisation's recorded reason.
- **Where the reason is the subject of an open dispute or investigation.**
  Communication then follows the dispute process, not the standard decline
  path.
