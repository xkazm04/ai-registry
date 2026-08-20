---
layer: technique
type: technique
subject: candidate-self-scheduling
technique: withdraw-is-not-cancel
status: forged
laws: [every-decision-names-its-actor, say-only-what-the-record-holds, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [a candidate declines an interview round, designing terminal states for an invitation, reading a scheduling history months later]
---

# Withdraw is not cancel

Two acts end a scheduled round and look identical in storage. **Cancel** is the
company calling the interview off. **Withdraw** is the candidate declining this
round. They are different facts about different actors, and collapsing them into
one terminal state destroys the only thing anyone will later want to know.

## What the distinction carries

| | Cancel | Withdraw |
| --- | --- | --- |
| Actor | the company, via a named recruiter | the candidate |
| Obligation created | re-offer, or explain | none |
| What it says about interest | nothing | the candidate declined *this round* |
| Correct pipeline effect | round reopens or the stage is re-planned | stage ends; candidate is not rejected |
| Correct read later | a company-side event | a candidate-side event |

Neither is a rejection, and neither is a no-show. Four distinct facts, four
distinct states — a system with one "closed" state answers none of the questions
a recruiter, an auditor or the candidate themselves will ask.

The asymmetry matters most in the warm cases. A candidate who withdraws from a
round because their week collapsed is frequently still interested in the
company, and a record that reads "cancelled" or "rejected" removes them from
every future consideration a human would have made. Conversely, a
company-cancelled round recorded as a withdrawal quietly blames the candidate
for the company's decision.

## Procedure

1. **Give each act its own state and its own verb in the interface.** The
   candidate's control says something like "I can't make this round" — never
   "cancel", which reads as calling off an event they do not own.
2. **Attribute every terminal transition.** The actor is a named recruiter, the
   candidate, or the system (an expiry). "Cannot determine" is a legitimate
   third state; a default actor is not.
3. **Offer the alternative before the exit.** A withdraw control placed next to
   the escape hatch, with the hatch first, converts most would-be withdrawals
   into a proposal (propose-your-own-times-escalation). A candidate who cannot
   make the offered times and is shown only an exit will take the exit.
4. **Ask why, optionally, and store the answer as the candidate's own words.**
   Never infer a reason; never render an unstated reason as a system claim.
5. **Make it reversible while the round is still live.** "I can't make any of
   these and I have a deadline at work" and "I no longer want this job" are
   different sentences, and a one-way button collects both. Reversibility costs
   nothing and recovers real candidates.
6. **Release the held time immediately**, and route the release to the calendar
   subject, which owns the event lifecycle.

## Ordering: a dead link beats a booking, a booking beats the picker

The candidate-facing page resolves its state in a fixed priority, and the
ordering *is* the logic:

1. **Dead** — revoked, cancelled, withdrawn or past deadline. Reported first,
   even when a booking exists, because showing a confirmed time on a dead
   invitation tells someone to turn up to an interview nobody will attend. This
   is the ordering bug that produces the worst possible candidate experience in
   the whole flow.
2. **Booked** — show the confirmed slot, the remaining reschedule budget, and
   the withdraw control. Never a fresh picker: a picker over a booking invites
   double-booking and communicates that the earlier choice did not matter.
3. **Open** — the picker, plus the escape hatch.

Expiry is **derived** from the deadline at read time, never a stored flag kept
true by a sweep. A stored flag is a claim that depends on a job that will be
down when it matters — leaving a link live past its deadline, or, worse, marking
a valid link dead because a sweep ran with a bad clock. What is stored is what
an actor *did*; what is computed is what is currently *true*.

## The record must not assert a state that is not real

The same honesty rule extends past the terminal states. A booking that did not
advance the pipeline — the interviewer never joined, the round was abandoned,
the requisition closed — must not be sealed as though a stage completed. The
record carries an explicit reason saying what actually happened, and a
qualifying reason code is the honest artifact when the outcome is "scheduled,
then nothing".

A gap is read later as a gap. An assertion is read later as fact. Writing a
false completion is therefore strictly worse than writing nothing, and the whole
value of a scheduling history is that it can be trusted by someone reconstructing
what a candidate was actually offered.

## When not to use this

Do not model withdrawal as a *candidate-level* exit. Withdrawing from a round is
not withdrawing from the process, and it is certainly not withdrawing from the
company. If a candidate wants to leave the process entirely, that is a separate,
explicit act with its own consequences — including data-handling ones — and it
belongs to the consent and status subjects, not to a scheduling page.

Do not use withdrawal counts as an evaluative signal. A withdrawal usually
measures a mismatch between your scheduling constraints and someone's life; read
as a fact about the person, it is a claim the record does not support.
