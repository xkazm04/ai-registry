---
layer: technique
type: technique
subject: pipeline-aging-and-attention-triage
technique: attention-queue-ordering-and-rationale
status: forged
laws: [say-only-what-the-record-holds, no-adverse-outcome-is-solely-automated, every-decision-names-its-actor]
shared_with: []
use_when: [building a to-do or attention strip, ranking what a recruiter sees first, replacing a blended urgency score]
---

# Attention queue ordering and rationale

"What should I look at next?" is the only question a workspace-level surface
genuinely answers. The wrong answer is one blended urgency score. The right
answer is **a small closed set of named queues, each with a written rationale,
merged into one ranked strip.**

## Why named queues beat a score

A blended score is unarguable, unauditable, and uncorrectable. When a recruiting
lead says "why is this above that", the honest answer from a tuned score is "the
weights", which ends the conversation and ends the trust. Named queues put the
policy in language: this row is here *because somebody is blocked on a human
approval*; that row is here *because it passed its stage's threshold*. The
policy becomes reviewable by the people who actually own it, none of whom will
read the ranking function.

The rationale is also a correctness constraint, per
[say only what the record holds](../../../_laws.md#say-only-what-the-record-holds):
the reason shown must be the condition that actually put the row there, computed
from the same predicate that selected it. A generated or approximated
explanation of why something is urgent is a claim nobody made. One selection,
one sentence, no second spelling.

## The queue set

Five queues cover the workspace-level surface of a hiring pipeline. Each is
named, each is bounded, each carries its rationale:

1. **Waiting on a human approval gate.** An entry parked at a recognised
   approval kind — anything the taxonomy marks as requiring a person. These are
   already known to need a human, by construction; nothing else in the strip
   has that property. Rationale: "a person must decide before this can move."
2. **Aging or stalled active entries.** Past the stage's threshold, in an
   active role, per the aging techniques. Rationale: "no movement in N days at
   this stage."
3. **Imminent confirmed interviews.** Conversations happening soon that need
   preparation, materials, or an interviewer confirmation. Take the lifecycle
   state from the scheduling discipline; do not recompute "is this still live".
   Rationale: "an interview is confirmed for tomorrow."
4. **Ingested but unpublished roles.** Work that entered the system and never
   became visible — a role parsed from an intake conversation, still a draft.
   Rationale: "this role exists but nobody can apply to it."
5. **Fresh untouched arrivals.** New entries still at the entry stage that
   nobody has opened. Rationale: "arrived and not yet looked at." This is the
   only queue whose members may be perfectly healthy; it is there because the
   cost of a first look is minutes and the cost of not taking it is a person
   waiting in silence.

Closed set, deliberately. Every additional queue dilutes the strip and pushes it
toward being a second inbox. A candidate for a sixth queue should displace one
of these or stay out.

## Membership predicates are closed sets, and typos are not gates

The approval-gate queue in particular is defined by a **closed taxonomy** of
approval kinds, with one rule: any recognised kind means a human is needed.
Recognised, not merely present — an unrecognised value is rejected, so a typo
cannot masquerade as a real gate and inflate the most privileged queue in the
strip.

That guard has a mirror-image cost worth designing for. If an unrecognised kind
is not a gate, a typo does not create a phantom item; it makes a real one
**disappear**, silently, from the queue that outranks everything else. So the
closed set must be paired with validation at the *write* site — nothing may
store an approval kind the taxonomy does not know — and with a count of
unrecognised values somebody actually looks at. A closed vocabulary enforced
only at read time converts data errors into invisible omissions, and an
omission from this queue means a person waits on a decision nobody was told to
make.

## The partition must be total

Attention queues are usually defined as filters over one collection, and the
recurring bug is that the filters are not exhaustive: an item satisfies none of
them and vanishes from the surface entirely. The canonical instance comes from
the scheduling side — a confirmed interview partitioned as "confirmed and in
the future" disappears the instant its start time passes, because it is no
longer upcoming, is not awaiting anything, and is not flagged. It vanished
exactly when the recruiter needed it most: during the call, and in the minutes
afterward when a no-show or a next step had to be recorded.

Two rules fall out, and they generalize to every queue here:

- **Every item lands somewhere.** Design the queues as a partition and prove
  totality, rather than as a list of interesting cases. Where a strict boundary
  is used, give it a **grace window** on the near side, so an item at or just
  past the edge stays visible instead of falling through it.
- **Terminal fates get a home.** Declined, no-show, expired, withdrawn — a
  collapsed, low-emphasis section beats disappearance, because an item that
  silently leaves the surface is indistinguishable from one that was handled.

The scheduling discipline owns the invitation lifecycle and its buckets in
detail; triage consumes those buckets. The boundary is the point: do not
recompute "is this interview still live" here, or the same interview will read
as confirmed on one surface and gone on another.

## Ordering

Ordering across queues is a *policy* decision and should be written down as one,
not discovered in the code. The default that holds up:

1. Blocked on a human approval — somebody is already known to be needed.
2. Stalled — a failure that has already occurred.
3. Imminent interviews — time-boxed and unrecoverable if missed.
4. Aging — a risk, still recoverable.
5. Housekeeping queues (unpublished roles, untouched arrivals).

Within a queue, order by the queue's own natural urgency — longest overdue,
soonest starting — and cap each queue's contribution so one noisy queue cannot
own the whole strip. A strip that is thirty aging rows has told the recruiter
nothing they did not know.

## The strip outranks the setup checklist

On a workspace home surface the attention strip sits **above** onboarding and
configuration checklists, and this is worth defending because product instinct
argues the opposite. The argument is one sentence: a stalled application is a
person waiting on you; finishing your workspace configuration is not. Setup
guidance addresses a team's convenience and can be found whenever they look for
it. An attention item addresses somebody outside the building who cannot see the
queue and has no other channel. Ranking convenience above obligation is the
default this whole subject exists to reverse.

## The strip surfaces; it does not act

Every item resolves to a link to the thing, not to a button that resolves it in
place. Bulk actions on an attention strip are how a duration becomes a decision
nobody made —
[no adverse outcome is solely automated](../../../_laws.md#no-adverse-outcome-is-solely-automated).
Where an item does carry an action (acknowledge, snooze, assign), the action is
attributed:
[every consequential decision names its actor](../../../_laws.md#every-decision-names-its-actor).
A snooze in particular must record who snoozed, why, and until when — an
unattributed, unexpiring snooze is the mechanism by which the strip becomes a
place things go to disappear.

## Decision rules

- Every entry in the strip carries the rationale computed by the predicate that
  selected it; if you cannot state the reason, do not show the row.
- Rank between queues by the stated policy order; never by a blended score.
- Cap each queue's share of the visible strip.
- An entry that qualifies for two queues appears once, in the higher-ranked
  one, with that queue's reason.
- Empty is a valid and desirable state; render it as an achievement, not as an
  error or a blank.

## When not to use this

- **Not for a personal task list.** Attention is derived state — it is
  recomputed from the pipeline every time. The moment recruiters want to add
  their own items, you are building a task manager, and the derived strip
  should stay separate from it or it will drift out of sync with reality.
- **Not for candidate-facing surfaces.** These queues expose your operational
  standing. What a candidate is told about their own wait is the transparency
  discipline's problem, and it is a different sentence with different rules.
- **Not as an escalation system.** A queue that nobody works needs a person to
  own it, not a louder colour. Triage surfaces work; it does not create
  accountability where none was assigned.
