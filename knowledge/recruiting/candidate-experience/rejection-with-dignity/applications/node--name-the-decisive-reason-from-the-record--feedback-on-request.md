---
layer: application
type: application
subject: rejection-with-dignity
technique: name-the-decisive-reason-from-the-record
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
applied: simulation
ab_verdict: better
---

# A feedback letter the candidate asks for, after a person decided

The unsolicited decline is one artifact. The tree also grew a second, pull-based
one on 2026-09-18 (`c56dfe13a`, `bed21cfd3`): a candidate opens their status page
and asks for a short letter on how the interview went, a recruiter reviews and
approves it, and it is sent and kept readable on the page. It applies the
standard's exceptions to the unsolicited-letter rules, and each of them is a
place the standard had only gestured at.

## Who may ask: only after a person decided about *this* candidate

`letterEligibility` (`app/_lib/interview-letter-policy.ts:112`) implements a rule
stated once in the file header. A letter may be requested only when a person
decided: a hire, or a rejection whose deciding event names a human actor
(`letterEventAttribution`, `:71`; the actor prefix is authoritative, an actor-less
legacy row falls back to the event kind, anything else is `unknown`, "and unknown
is never a person"). Everything else is refused, and the reasons are chosen with
care:

- An automated screen-out is not eligible "even when a named person approved the
  batch": the batch approval "is a decision about a COHORT, and nothing was
  decided about this one candidate by a person". The screen-out already carries a
  score-against-threshold explanation instead.
- `role_closed` and `rematched` read as "not selected" on the status page, but the
  role closed under the person, so "there is no interview judgement to report".
- A rejected entry with no reject event on record fails closed (`:121-`).
- No recorded interview means no letter, because offering one "would promise
  feedback the record cannot back".
- Consent withheld wins over everything, and blanks the view silently.

The refusal is one answer for all of them (`STATUS_LETTER_NOT_ELIGIBLE`, 409,
`app/api/status/[token]/letter/route.ts:66`), so the door "cannot be used to learn
whether a candidate was screened out by a machine or whether their consent
lapsed". The 14 tests in `interview-letter-policy.test.ts` pin each branch.

## The empty state says it is empty

The keyless draft is `buildInterviewLetterTemplate`
(`app/_lib/interview-letter-template.ts`). Its header states the standard by name:
"a list the record left empty renders nothing — no generic advice fills the slot —
and a record with no areas at all says so in one plain sentence instead of
guessing." The sentence is catalog copy, `interviewLetter.template.noSpecifics`:
"The record of the interview does not point to specific areas, so we would rather
not guess at any." (`:72`, test `:72`.) This is the refinement of the
silence-is-right rule: in the unsolicited decline an empty reason section renders
nothing, and here, where the candidate asked, the letter states that it holds
nothing specific. It still names no reason.

## A closed vocabulary instead of a deny-list

The competency names in the letter "come from the rubric catalog": "A name the
rubric catalog does not know is DROPPED, never printed: the names arrive from the
drafting CLI, and this is the last gate that guarantees nothing a candidate said,
and no rating, can reach the letter through the keyless path." The only
interpolated value that is not catalog copy is the role's title. A proxy phrase
cannot reach a letter built this way, which the free-text deny-list cannot promise
(see the protected-attribute application). The model-drafted variant goes through
`letter_problem` (`pipeline/jobfit/automation.py:2037-`): empty, too long,
protected language, a digit outside the role's own terms, scoring machinery, or a
quotation of the candidate each discard the draft "WHOLE; none of them is
repaired", and the template ships.

## A person owns every sentence

`dispatchInterviewLetter` (`app/_lib/comms-dispatch.ts:609-`) sends "the
recruiter's own final text, verbatim: a person owns every sentence of it, so
nothing here rewrites, trims or appends to what they approved beyond the delivery
chrome". The approver is the signed-in session's actor, "derived from the session,
never from the body, so nobody can approve in someone else's name"
(`app/api/decisions/feedback-letters/[id]/approve/route.ts:30-, :91`), and the
store refuses anything that is not a `human:` actor. The delivery outcome is
reported truthfully, and a send that did not go out never turns the approval into
a failure because the letter is also on the status page.

## Measured 2026-09-29: three cases from the tests

`node scripts/run-unit-tests.mjs` over the two test files: 20 pass. Read as
simulation cases against the standard (n = 3, cases from the tests, not from live
traffic):

1. A human reject with a recorded interview is eligible as `not_selected`; the same
   entry rejected by the screen wave is refused as `automated_decision` even with a
   named batch approver.
2. An entry whose role closed is refused as `not_decided_about_candidate`; without
   the rule the page would offer a letter about an interview judgement nobody made.
3. A record with no areas renders the one `noSpecifics` sentence, never a
   generated list; a name outside the catalog is dropped.

Falsifier: nobody has measured what candidates make of the `noSpecifics` sentence,
or how many requests are refused as ineligible. The technique's claim that a
requested letter needs an explicit empty state rests on the reading of the
sentence, not on a reaction.

## Deviations

- **The recruiter's final text is not filtered.** `letterTextProblem`
  (`interview-letter-policy.ts:189`) checks only "empty" and "too long"; the
  approve route stores and sends what the recruiter typed. `protected_language`
  runs on the model's draft, not on the edit, and the standard's procedure step 1
  names exactly this case, human-written text, as the highest-yield source.
- **The cap does not apply, by design.** A person-owned letter is the standard's
  exception to the three-line ceiling; the control moved to who may ask and who
  approved.
- **The never-ghost obligation is untouched.** This letter is pull-based, so it is
  not evidence for the unsolicited decline's dispatch.
