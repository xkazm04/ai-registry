---
layer: technique
type: technique
subject: degrade-never-block-a-candidate
technique: a-candidate-action-is-debited-never-gated
status: forged
laws: [a-candidates-process-never-stalls-on-your-constraints, every-decision-names-its-actor]
use_when: [adding a quota check to a hiring workflow, a metered outcome sits on a candidate-initiated path, deciding what a paywall may refuse]
---

# A candidate action is debited, never gated

## The concern

Metering is usually implemented as a single helper: *look up the allowance, compare
the counter, throw if exceeded*. That helper then gets called wherever a billable
event happens. It is uniform, it is easy to reason about, and it is wrong at exactly
one class of call site — the ones where the person standing in front of the check is
not the person who pays.

An applicant clicking *accept offer*, *book this slot*, *submit application* or
*download my data* has no visibility into the employer's plan, no ability to raise
the limit, and no reason to interpret a failure as anything other than a signal from
the employer. A hard gate on that path converts a commercial dispute into a hiring
outcome for an uninvolved third party, and it does so at the moment with the least
slack in the whole process.

The technique is the enforcement asymmetry: **the meter still counts, the invoice
still grows, but the candidate's action completes.**

## The procedure

1. **Classify every metered event by its initiating actor** at the point where the
   meter is defined, not at the call site. Each countable outcome carries a fixed
   attribute: *operator-initiated* or *candidate-initiated*. This is a property of
   the business event, so it belongs beside the event's definition and price, where
   it is visible to anyone adding a new meter.
2. **Give the enforcement layer exactly two shapes**, and no third. One refuses with
   a payment-required answer. One records the usage, computes the overage, and
   returns success. There is no "warn", no "soft-block", no per-caller override —
   those are how the asymmetry erodes.
3. **Bind the shape to the classification, not to the caller.** The choice must not
   be a boolean parameter a future developer can pass wrongly. The meter's own
   definition decides which enforcement it gets, so a new call site inherits the
   correct behaviour by construction.
4. **Debit visibly.** Increment the counter, mark the event as overage, and emit an
   account-level signal — a banner for the operator, a notification to whoever owns
   the relationship. Silent overage is a billing surprise, which is its own kind of
   dishonesty and the reason teams reach for hard gates in the first place.
5. **Record the actor on the resulting event.** The outcome record says the candidate
   initiated it and that it completed under overage
   ([every-decision-names-its-actor](../../_laws.md#every-decision-names-its-actor)).
   When the invoice is disputed, the answer is a specific list of candidate actions,
   not an aggregate the customer cannot audit.
6. **Make the debit best-effort and idempotent.** On a candidate path the debit is
   subordinate to the action: if the meter write fails, log it loudly and let the
   acceptance stand — a metering fault must never convert a successful candidate
   action into an error. And place the debit behind whatever makes the outcome happen
   exactly once (a compare-and-swap on the response, a single terminal transition), so
   a double-click or a re-opened link cannot bill twice for one hire.
7. **Cap by contract, not by interruption.** If overage must be bounded, bound it in
   the agreement and enforce it by suspending *operator* capabilities — no new roles,
   no new campaigns — while in-flight candidates continue to completion. The
   commercial lever exists; it just does not point at the applicant.

## Decision rules

- **When a metered action is initiated by a candidate and the allowance is exhausted,
  debit and proceed.** Blocking transfers the cost of the operator's account state to
  someone with no standing in it
  ([a-candidates-process-never-stalls-on-your-constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).
- **When the same outcome can be reached from both an operator path and a candidate
  path, the candidate path's rule wins for that outcome.** A hire recorded because
  the candidate accepted and a hire recorded because a recruiter marked it are the
  same billable event; if either can be candidate-initiated, the meter is
  candidate-initiated. Splitting the meter by path produces a race where the
  candidate's own action is the one that fails.
- **When you cannot tell who initiated an action, treat it as candidate-initiated.**
  The cost of a wrong debit is an invoice line. The cost of a wrong block is a person
  who thinks they were rejected.
- **When an account is suspended entirely, in-flight candidate commitments still
  complete.** Suspension stops new intake; it does not retroactively withdraw an
  offer someone is holding.
- **When the billing scope of a request cannot be identified, resolve it to the floor
  tier as its own isolated scope** — never to a default account. An anonymous,
  demonstration or unlinked session must be unable to spend, or pollute, a real
  customer's allowance, and the candidate in front of it still completes their action.
- **When a deadline is attached to the candidate's action, never gate it under any
  circumstance** — including fraud holds and abuse controls. A decline deadline does
  not pause for your investigation. Suspend the operator, keep the acceptance path
  open, and reconcile afterwards.

## What this is not

It is not "candidates are free". Every debited action is billed at its contracted
rate and appears on the invoice. The technique changes *when* enforcement happens
(at the account relationship, asynchronously) not *whether* it happens.

It is also not an argument against hard gates in general — the mirror technique,
hard-gating newly created metered work, is what makes this one commercially
survivable. A system with only this half has no floor.

## When not to use it

- **On abuse-shaped volume rather than hiring-shaped volume.** A scripted flood of
  synthetic applications is not a candidate action; it is traffic. Rate limiting and
  bot defence sit before this technique and are ordinary engineering practice, not a
  hiring exception. The test is whether a real person is waiting on the other end of
  the request.
- **Where the metered resource is genuinely finite rather than billable.** If an
  action consumes a physical slot — an interviewer's calendar, a limited assessment
  seat — there is nothing to debit. That is a scheduling problem: offer the next
  honest option, never a silent failure.
- **On operator-facing bulk actions that happen to touch candidates.** A recruiter
  running a bulk re-score over a thousand profiles is an operator action even though
  candidates are its subject. Actor means initiator, not subject.
