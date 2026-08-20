---
layer: technique
type: technique
subject: pre-boarding-and-first-day-handoff
technique: the-acceptance-to-start-date-silence-gap
status: forged
laws: [every-decision-names-its-actor, absence-of-evidence-is-not-evidence, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [designing what happens between an acceptance and a first day, investigating a renege or a no-show, arguing for post-acceptance instrumentation]
---

# The acceptance-to-start-date silence gap

The gap is the interval between a recorded acceptance and a first day. The technique
is to treat that interval as an owned, instrumented, contact-bearing stretch of the
process rather than as a pause — and to be honest that nothing in the ordinary
incentive structure will produce that treatment on its own.

## Why the silence is structural

Name the mechanism before proposing a fix, because the fix looks trivial and keeps
failing anyway.

- The requisition **closes** at acceptance. It leaves every open-role view, every
  weekly pipeline review, every dashboard the recruiting team actually looks at.
- The headline metric **stops** at acceptance. Time-to-hire is booked. Whatever
  happens next cannot improve it and cannot damage it.
- The recruiter's next search is **already late**, and the recruiter is measured on
  it. Attention follows measurement, correctly.
- The manager is not yet in a relationship with this person and often has no surface
  that shows the person at all until a start-date reminder fires.

So the person disappears from every view at once. This is why "just send a nicer
welcome email" does not survive contact with the problem: nobody's number moves when
it is sent and nobody's number moved when it was not.

## The measurement that makes the gap visible

You cannot manage this window without two facts per hire, and most systems hold
neither:

1. **Gap length** — days from acceptance to start date. Distribution, not average;
   the tail is where reneges live.
2. **Days since last contact** — from *any* named human on the organisation's side,
   through any channel. Not "days since a system event," which counts a provisioning
   job as a relationship.

From those, one derived number is worth putting on a screen: hires whose gap is above
the median *and* whose last human contact is more than a fortnight old. That is the
renege-risk cohort, and it is usually the first time anyone in the organisation has
seen it as a list.

A caution the law demands: a hire with no recorded contact is not evidence of no
contact — recruiters call people from their phones. Render it as *no contact
recorded*, and let a recruiter stamp a contact they made offline.
[Absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence);
an unrecorded call must not render as neglect any more than as attention.

## The contact cadence

The cadence is proportional to the gap, not fixed, and it is deliberately thin. This
is not a nurture campaign; a person who has accepted a job does not want to be
marketed to by their employer.

- **Within one working day of acceptance**: a confirmation from a named person that
  includes the start date, who they will hear from next, and when. This message is
  the handoff made visible to the candidate.
- **Roughly the midpoint of the gap**: one substantive contact with actual content —
  the team they are joining, what the first week looks like, an introduction to their
  manager. Substantive means it tells them something they did not know.
- **Five to seven days before the start date**: the practical message. Where to go,
  what time, who to ask for, what to bring, what will be waiting.
- **On any change**: a moved start date, a re-org affecting their team, a change of
  manager. Silence about a change the person will discover on day one is the single
  fastest way to convert a hire into a resignation in month one.

Gaps under two weeks collapse the middle contact. Gaps over two months earn one
additional midpoint touch and no more.

The pre-boarding questionnaire is *not* one of these contacts. It is a request from
the organisation for the person's labour; a request is not a relationship, and a
window whose only two messages are both forms is still silent.

## The owner rule

At the acceptance write, one named person becomes accountable for this hire until
their first day, and that name is stored on the record and shown to the candidate.

- Never a team, a queue or a shared mailbox. Those are addresses, not owners.
- Never defaulted to the recruiter who ran the search unless they actually agreed —
  authority may be downgraded to *unassigned*, never upgraded to a person who did not
  accept it. [Every decision names its actor](../../_laws.md#every-decision-names-its-actor).
- Unassigned is a valid, visible, work-generating state. It is far better than a
  falsely-attributed owner, because the false attribution is exactly what stops
  anyone from noticing that nobody has this.

## Decision rules

- **When the gap exceeds the organisation's median by a wide margin, schedule the
  midpoint contact at the time of acceptance, not later.** Anything left to be
  scheduled later, in this window, is not scheduled.
- **When a hire's start date moves, re-derive the whole cadence and tell them
  immediately.** A moved date silently re-plans nothing else in the person's life.
- **When the person asks a question in this window, the answer comes from the named
  owner, not from a shared alias.** The relationship is the product here.
- **When a scheduled contact cannot be sent because of your own quota, outage or
  billing state, send it degraded rather than not at all.** The person's engagement
  with the organisation must not depend on the organisation's commercial state;
  [a candidate's process never stalls on your constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints).
- **When a hire reneges, record the reason as they gave it, in their words, or record
  nothing.** Reneges are the only direct evidence this window produces, and inventing
  a category for one destroys its value.

## What automation may and may not do here

It may compute the gap, rank the quiet hires, remind the owner, draft the message and
schedule the sends. It may not decide that a quiet hire has reneged, may not close a
hire's record on inference, and may not send a message that asserts something about
the person's intentions. A hire who has not answered is a hire who has not answered.

## When not to use this

- **Same-day and next-day starts.** Frontline and seasonal hiring frequently has a
  gap measured in hours. There is no window to instrument; the whole of this
  technique collapses into the first-day plan.
- **Contingent and agency placements** where the employing entity is not the one
  running the hiring process. Instrument the handoff to the employer instead, and be
  honest that you do not own the person's experience.
- **As a substitute for fixing a genuinely bad offer.** A person who accepted
  reluctantly and is being counter-offered does not need a newsletter; they need a
  conversation with someone who can change something.
- **As justification for collecting more.** The cadence is contact, not data
  collection. Every touch that is actually a form belongs to the questionnaire
  technique and is bound by its restraint.
