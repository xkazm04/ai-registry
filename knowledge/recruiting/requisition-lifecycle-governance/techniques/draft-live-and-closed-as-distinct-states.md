---
layer: technique
type: technique
subject: requisition-lifecycle-governance
technique: draft-live-and-closed-as-distinct-states
status: forged
laws: [every-decision-names-its-actor, say-only-what-the-record-holds]
shared_with: []
use_when: [designing the state machine a role moves through, deciding whether a role needs a closed state, open-requisition counts have stopped being believable]
---

# Draft, live and closed as distinct states

The lifecycle of a requisition compresses to three states, and the compression
is not arbitrary: each of the three permits a different set of operations, and
no pair of them can be merged without losing a permission distinction that
somebody downstream relies on.

| State | Visible to | Candidates may enter | Editable | Counted as open |
|---|---|---|---|---|
| Draft | its owners only | no | freely | no |
| Live | its intended audience | yes | with care | yes |
| Closed | anyone who could see it live | no | no | no |

Everything else teams want — *on hold*, *pending approval*, *filled*, *cancelled*,
*archived* — is either a precondition on an edge or a **reason** attached to a
state, not a fourth state. Add states only when they carry a distinct permission
set; otherwise add a reason code and keep the machine legible.

## What each state is for

**Draft exists so that a bad role can be written.** The whole point of a draft
is that it may be incomplete, wrong, half-thought and unapproved. Gates that
belong at go-live must not be enforced on save; a system that validates every
keystroke turns role definition into form-filling, and people respond by
drafting in a document elsewhere and pasting the finished text in — which is
exactly how a requisition ends up with no intake history behind it.

The one thing a draft must *not* permit is candidates. No sourcing, no
outreach, no applications, no pipeline entries. If a draft can hold a candidate,
then a role can be worked before it is approved, and the approval gate is
advisory.

**Live is the state that consumes attention.** It is the only state a metric
should count, the only one a search should surface, the only one an application
may attach to. Because it is the consequential state, entering it is the edge
that carries the preconditions (approval, brief substance, advertisement
quality) — and leaving it is the edge that carries the cascade onto people.

**Closed exists to make counting honest.** This is the state that gets skipped,
and the skip is invisible for a long time.

## Why the closed state had to exist at all

Consider a system with only draft and live. A role is filled. The offer is
accepted, the person starts, the hiring manager moves on. Nothing in that
sequence forces anyone to touch the requisition, because the requisition is not
what anybody is looking at any more. It stays live.

Now every metric built on "open requisitions" is wrong, and wrong in a
direction that does not look like a bug:

- the **open-role count** grows monotonically, because roles enter it and never
  leave;
- **recruiter load** attributes phantom work, so capacity planning under-hires
  recruiters;
- the **aging report** fills with roles that are old because they are finished,
  which buries the roles that are old because they are stuck — the single
  signal the report exists to produce;
- **time-to-fill** and **time-to-close** compute over a denominator containing
  roles that were filled long ago and have no close date, so either they are
  excluded (and the metric silently describes a subset) or they are included
  with an open-ended duration (and the metric is unbounded).

None of these throw an error. They render as a business with a lot of open
roles and slow hiring, and people make headcount decisions on that reading. A
metric that cannot be falsified by its own data is the most expensive kind of
wrong, which is the counting form of
[say only what the record holds](../../_laws.md#say-only-what-the-record-holds):
if the record does not hold the fact that the role ended, no report may imply
that it is still running.

The fix is structural, not procedural. Do not rely on discipline to close
roles; make closure the natural consequence of the events that end a role — an
accepted offer, a cancelled plan, an expired approval — and put the outstanding
ones in front of the person who owns them.

## Decision rules

- **When a state would permit exactly what its neighbour permits, it is not a
  state.** Fold it into a reason code on the neighbouring state. Three states
  with reasons beat seven states with overlapping rules, because the seven-state
  machine gets a new edge every quarter and nobody can enumerate the edges.
- **When a role is filled, closed is not optional.** Closure is what an accepted
  offer means for the requisition; wire the two together rather than trusting a
  checklist.
- **When a role is paused indefinitely, close it rather than leaving it live.**
  A hiring freeze that leaves roles live keeps candidates in pipelines that
  nobody is working. A frozen role is closed with a reason, and reopened later
  as a new span.
- **When a role closes, record who closed it, when, and why** —
  [every decision names its actor](../../_laws.md#every-decision-names-its-actor).
  A close with no actor cannot be explained to the candidate it terminated.
- **When counting open roles, count the state, never the absence of an end
  date.** Deriving "open" from a missing close date makes every unclosed filled
  role permanently open by construction.
- **When records predate the state field, decide what a null state means once,
  in one place, and write it down.** Legacy and imported rows arrive with no
  status; treating null as live is usually right for a pre-existing catalog and
  disastrous for an import, and the difference must be a stated decision rather
  than whatever each query happened to assume. One function owning every
  transition — and every read of the status — is what keeps that decision from
  forking into six subtly different answers.
- **When a closed role must run again, open a new span** rather than reverting
  the old one. The brief, the approval and the market have all moved; and
  reviving the old record silently returns candidates to a process they were
  told had ended.
- **Never delete a requisition.** The closed record is the account of what the
  role required at the time decisions were made under it, and it is the only
  defence for every rejection issued against it.

## When not to use this

- **Where roles are perpetual and evergreen** — a continuously-open talent pool
  or a permanent apprenticeship intake genuinely has no fill event. Model those
  as a distinct kind of record with its own metric treatment, rather than
  distorting the three-state machine to accommodate them; the danger is that one
  evergreen role becomes an excuse for everything to stay live.
- **Where a single person drafts and opens in the same minute** the draft state
  still has to exist for the ingest and approval paths, but it need not be an
  interface step the user consciously visits.
- **As a substitute for pipeline stages.** These states describe the
  *requisition*; where a candidate sits inside a live one is a different
  vocabulary with a different owner, and collapsing the two produces a machine
  where closing a role and rejecting a person are the same operation.
