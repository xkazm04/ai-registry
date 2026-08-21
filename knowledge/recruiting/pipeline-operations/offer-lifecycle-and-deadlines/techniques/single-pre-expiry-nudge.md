---
layer: technique
type: technique
subject: offer-lifecycle-and-deadlines
technique: single-pre-expiry-nudge
status: forged
laws: [no-adverse-outcome-is-solely-automated, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [designing the reminder policy for a live offer, deciding how many times to chase a candidate, reviewing why offers lapse without a reply]
---

# The single pre-expiry nudge

The deadline lapses an offer *silently*. Nothing announces it, nobody chooses it in
the moment, and the candidate's first evidence that it happened is a page that no
longer works. The nudge is the proactive half of the expiry policy: one heads-up,
before the lapse, so a candidate who simply forgot does not lose a live offer to
silence.

Exactly one. Zero means the system's only communication about the deadline arrives
after it has already cost the person the offer. Two or more is a dunning sequence —
and a dunning sequence about a job offer reads as pressure, which is the failure
mode the whole deadline instrument is trying to avoid.

## Lead time is proportional, floored, and capped

The reminder's lead time is derived from the window, not fixed:

- **Roughly a quarter to a third of the window**, so a one-week offer is nudged
  around two days out and a one-month offer around a week out. A fixed lead time
  either fires before the candidate has read the original letter (on long windows)
  or after they have already had to decide (on short ones).
- **Floored at a few hours** so an exploding one-day offer still gets a heads-up
  rather than a reminder scheduled into the past.
- **Capped at a small number of days** so a two-month executive window does not
  generate a nudge the candidate reads as a demand three weeks before they were
  ever going to answer.

Compute the reminder time at dispatch and store it, so an extension re-arms it
deliberately rather than a rolling calculation firing whenever a job happens to run.

## Suppression: the conditions under which it must not fire

The nudge is suppressed — not merely skipped, but recorded as suppressed with its
reason — when any of these hold:

- the offer is no longer live (accepted, declined, withdrawn, already expired);
- a counter or negotiation is open, because the candidate is *mid-conversation*
  with a named person and an automated reminder cuts across it;
- the deadline was extended and the extension notice itself already told the
  candidate the new date within the lead-time window;
- a person has contacted the candidate about this offer since dispatch — a human
  touch consumes the nudge, because the point is that the candidate has been
  reminded, not that a message was sent;
- the reminder time has already passed at the moment it would be scheduled — send
  nothing rather than a reminder about a deadline that has arrived;
- the offer has no deadline at all, because an offer that never lapses has nothing
  to nudge toward.

The due predicate is therefore two-sided: the deadline must be in the **future**
*and* within the lead window. A one-sided "within the lead window" test fires on
offers that already expired.

If the nudge did not fire, that is a fact worth holding. "Reminder suppressed
because negotiation open" and "reminder never scheduled" are different, and only the
second is a bug.

## "Exactly one" is enforced by a claim, not by an intention

A reminder sweep that runs on a timer will re-tick, overlap itself, or run in two
processes. So the "one" is not a property of the schedule; it is a property of a
**claim taken before dispatch**. The sweep conditionally stamps the offer as
reminded — succeeding only if it was not already stamped and the offer is still
live — and only the writer that won the stamp goes on to send.

That ordering deliberately makes the policy *at most once* rather than at least
once. If the send fails after the claim, it is logged and **not retried**: the
reminder was burned. This is the right trade on a candidate-facing, offer-bearing
channel, where a duplicate is worse than a miss — a missed nudge costs a courtesy
and the offer still runs to its published deadline, while a duplicate reads as
chasing someone about a job offer. Claim-after-send inverts the risk and is wrong
here.

The hazard this creates is worth naming because it bites in production: any
condition that makes the send *impossible* must be checked **before** the claim, not
after. A sweep that claims the reminder and then discovers it cannot resolve the
recipient has burned a candidate's one-shot nudge and stamped the record as though
they were told — they then watch a live offer lapse in silence while the audit trail
says they were warned. Resolve the recipient, the tenant and the link first; claim
last.

## What the nudge says

Its job is to restate the offer, not to sell it. Four things, in this order: the
role and the organisation, the fact that the offer is still open, the exact deadline
as an absolute date and time with a named timezone, and a way to reach a named
person. Nothing else.

Specifically, it does not add urgency language the deadline does not carry, does
not imply a competing candidate unless one genuinely exists and the recruiter chose
to say so, does not re-state the compensation figure unless it is pulled live from
the offer record at send time (a stale figure in a reminder is worse than no
figure), and does not include a decline button — a reminder is not a place to make
saying no the easy click.

Above all it says how to ask for more time. A candidate who is waiting on one more
interview elsewhere, or on a family decision, should be able to convert the nudge
into an extension request rather than into a rushed decline.

## The lapse itself is not an adverse decision

The nudge exists because expiry is the one transition no human chose. That places
a hard limit on what the expiry may then do. The machine may let the clock run out
on the terms the organisation published — that is the offer's own contract, not a
judgment about the person. It may not conclude the candidate is unsuitable, may not
mark the application rejected on its own authority, and may not trigger a rejection
communication. Where the lapse has any consequence beyond closing the offer, a
person owns that consequence and is named in the record.
[No adverse outcome is solely automated](../../../_laws.md#no-adverse-outcome-is-solely-automated).

The corollary: a lapsed offer routes to a recruiter as a *task*, not to an archive
as a *result*. The most valuable recoveries in an offer funnel come from the
recruiter who calls the person whose offer lapsed and finds out they had been in
hospital.

## The nudge is not gated on your commercial state

The reminder is a communication about the candidate's own live decision. If the
organisation's messaging quota, plan limit or provider budget is exhausted, the
reminder still goes — through a degraded path if necessary, with its degradation
recorded — because the alternative is that an organisation's billing state silently
costs a person a job offer.
[A candidate's process never stalls on your constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints).
Whether it was actually *delivered*, retried and deduplicated is the neighbouring
communication-integrity concern; what this technique owns is that it was owed.

## When not to use this

- **Offers with no deadline at all** (rare, and usually a mistake) have nothing to
  nudge toward; fix the missing deadline instead of inventing a reminder.
- **Windows shorter than the floor lead time** — a few-hour exploding offer is a
  phone call, and a reminder message inside that window is noise.
- **Candidates who have asked not to be contacted through that channel.** The
  preference outranks the policy; nudge through a channel they accepted, or record
  that no channel was available.
- **As a substitute for a recruiter's judgment on a wobbling candidate.** If the
  signal is that someone is hesitating, the answer is a human conversation, not a
  scheduled message.
