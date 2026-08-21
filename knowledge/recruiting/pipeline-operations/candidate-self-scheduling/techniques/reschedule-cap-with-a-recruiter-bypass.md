---
layer: technique
type: technique
subject: candidate-self-scheduling
technique: reschedule-cap-with-a-recruiter-bypass
status: forged
laws: [a-candidates-process-never-stalls-on-your-constraints, every-decision-names-its-actor]
shared_with: []
use_when: [limiting candidate-initiated reschedules, a recruiter must fix a wrongly-offered slot, deciding what counts as spending a reschedule]
---

# Reschedule cap with a recruiter bypass

Candidate-initiated reschedules are capped at a small number. Recruiter-initiated
changes bypass the cap entirely and do not debit the candidate's budget. The cap
is a budget belonging to one actor, and every consumption of it names that actor.

## Why a cap at all, and why a small one

An uncapped reschedule loop is a live write path into an interviewer's calendar
held by an unauthenticated bearer token. Each cycle costs a real person a real
calendar churn, and at scale it is a denial-of-service on the least replaceable
resource in the process. So the cap is real.

It is also small — one or two, not ten — because a larger cap is a worse
experience, not a kinder one. A candidate who has moved a slot twice and still
cannot make it does not need a third identical grid; they need a human. The cap's
job is to route that candidate to the escape hatch
(propose-your-own-times-escalation) at the point where the self-service loop has
demonstrably failed, not to ration a scarce good.

State the number and the remaining balance in the interface, always. A hidden
limit that reveals itself only on exhaustion is experienced as a trap, and the
candidate has no way to spend it wisely.

## What does and does not spend the budget

This is where implementations go wrong, and the errors all land on the candidate.

**Spends an attempt:** the candidate moves a confirmed booking to a *different*
offered slot.

**Does not spend an attempt:**

- **Re-picking the same time.** A resubmission of the slot already booked is a
  no-op. It happens through double-clicks, back buttons, refreshed confirmation
  pages and duplicated links. Charging for it is a bookkeeping bug that the
  candidate experiences as a penalty for a network glitch.
- **A failed attempt.** A slot that lost a race, hit a conflict, or failed
  validation never became a booking; nothing moved, so nothing is spent.
- **A recruiter's change.** See below.
- **A change forced by the company** — an interviewer falling ill, a round being
  restructured, a slot that should never have been offered. The company's error
  is not the candidate's budget.
- **A first booking.** The initial choice is not a reschedule.

## The bypass is an authority question, not a flag

The recruiter path is not "the same endpoint with a boolean". It is a different
actor with a different authorization, on an authenticated path, and it produces
a differently-attributed record. Every reschedule stores who initiated it — the
candidate, or a named recruiter — and the counter increments only for the
former. That attribution is the durable artifact: six months later, "this
candidate moved the interview three times" and "we moved it three times" are
opposite facts about the same row, and only the actor field separates them.

A recruiter repair should also be able to reach slots the generator would not
offer, because repairs are often exactly that: an evening agreed by email, a
Friday afternoon the rules exclude. That authority belongs to the authenticated
path only.

## Procedure

1. **Store the cap on the invitation**, not in global configuration, so a
   recruiter can raise it for one candidate without changing anyone else's.
2. **Store a counter of candidate-initiated reschedules**, incremented in the
   same transaction that persists the new booking — never before validation,
   never on a failed attempt.
3. **Compare the submitted slot with the current booking first.** Equal means
   return the existing booking unchanged, do not increment.
4. **Enforce the cap only on the candidate path.** The recruiter path checks
   authorization instead, and records the acting recruiter.
5. **Surface the remaining balance to the candidate** on every render, and when
   it reaches zero, render the escape hatch rather than a disabled button.
6. **Log every reschedule with actor, previous slot, new slot and reason where
   given** — this is the record the recruiter and any later reviewer will read.

## Decision rules

- **When the cap is exhausted, offer a route, never a wall.** An exhausted cap
  that renders as a greyed-out control is the dead end this whole subject exists
  to prevent.
- **When you are unsure whether an action should spend the budget, do not spend
  it.** The cost of an over-generous budget is one extra calendar move; the cost
  of an over-strict one is a candidate stranded by your accounting.
- **When a recruiter raises a candidate's cap, record it as a decision with an
  actor**, not as a silent configuration edit.
- **When the same candidate has multiple rounds, budget per invitation, not per
  candidate.** A hard second-round scheduling problem is not evidence about the
  first round.

## When not to use this

Do not cap a round that has not been booked at all — an unbooked invitation has
no reschedules to count, and applying the cap to *picker views* or to failed
submissions converts a browsing candidate into an exhausted one.

Do not use the cap as a proxy for candidate seriousness or as an input to any
evaluative judgment. It measures calendar friction, most of which is yours: a
narrow window, a single interviewer, a timezone mismatch. Reading it as a signal
about the person is unsupported by anything the record actually holds.
