---
layer: technique
type: technique
subject: offer-lifecycle-and-deadlines
technique: idempotent-terminal-response-under-a-race
status: forged
laws: [every-decision-names-its-actor, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [implementing offer accept or decline, investigating a duplicated hire notification, deciding what to show a candidate whose second click lost the race]
---

# Idempotent terminal response under a race

The acceptance of an offer is the highest-stakes write in a hiring system and the
one most likely to arrive twice. Candidates double-click. Mail clients and security
scanners prefetch links. A phone drops signal mid-submit and the person retries. A
recruiter records a verbal acceptance in the same second the candidate clicks. And
the expiry job runs while an acceptance is in flight.

Two rules make all of that safe, and a third makes it kind.

## Rule 1 — the store decides the winner

The transition to a terminal state is made by a **single conditional write**: set
the state to accepted *only if* the offer is currently live, and use the row the
write actually affected as the answer. One statement, one round trip, no read-then-
decide-then-write. The compare-and-swap is the only claim that counts.

Read-then-write is not merely theoretically unsafe here; its failure has a known
shape. Two requests both read *live*, both proceed, both write accepted — and both
then run the acceptance's side effects. The result is a doubled downstream hire
notification and a stage transition fired against an offer that had already moved,
which is how a hiring manager learns of one acceptance twice and how an onboarding
process is started twice for one person. The duplicated *row* is recoverable; the
duplicated *side effects* have already left the building.

So the ordering is fixed: claim the state first, and run every consequence —
notifications, stage transitions, downstream handoff, metering — only on the branch
that proves it made the change. If the conditional write affected nothing, no side
effect fires. This also makes the terminal write the honest place to stamp the
actor: whoever's action won the compare-and-swap is who accepted, recorded with the
instant it happened. [Every decision names its actor](../../_laws.md#every-decision-names-its-actor).

## Rule 2 — evaluate lapse before accept

Before the accept can be claimed, the deadline is evaluated, and if it has passed
the offer is transitioned to expired *first*. Lapse-before-accept is not an
optimisation; it is what makes the published deadline the enforced deadline.

Without it, an offer that expired an hour ago is still sitting in the live state
because no job has swept it yet, and an acceptance arriving now succeeds — which
means the real deadline is not the one you published, it is whenever the sweeper
happens to run. That inconsistency is worse than either a strict or a lenient
policy, because it is invisible and it varies per offer.

Run the same lapse evaluation in the read path too, so the page a late candidate
opens already tells them the truth rather than offering them a button that will
refuse them.

## Rule 3 — the loser of the race is not shown an error

When the conditional write affects nothing, look at what state is actually
recorded, and answer from that:

- **Already in the state they asked for** — they clicked accept and the offer is
  accepted — return the *success* response. That is the truth of their situation:
  the offer is accepted, by them, and the second click changed nothing. Showing an
  error on the click that in fact succeeded is a gratuitous panic, and it is the
  most common support ticket this whole area generates.
- **In a different terminal state** — they clicked accept and it is declined, or
  withdrawn — return a clear conflict explaining which state it is in and how to
  reach a person. Do not silently overwrite; a decline is not undone by a later
  accept arriving.
- **Expired** — return the expired answer, which is distinct from both success and
  from "no such offer".

The general shape is: identical repeats of a terminal action are idempotent and
succeed; conflicting terminal actions fail loudly with the actual state named. Where
the situation is genuinely ambiguous at the boundary — an acceptance and an expiry
contending within the grace window — resolve toward the candidate.
[Uncertainty resolves toward the candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate):
a wrongly-honoured acceptance costs a conversation, a wrongly-refused one costs a
person the job they had just taken.

## Side effects must be individually safe too

The conditional write protects the state; it does not protect a side effect that
retries. Give the downstream consequences their own identity — keyed on the offer
and the transition, not on the request — so a retried notification job recognises
its own prior success. The acceptance event that downstream processes consume
should be exactly one event per offer, forever, and that guarantee is what the
pre-boarding handover is entitled to rely on.

## Do not make the candidate the concurrency control

Disabling the button after the first click is good manners and no defence: it does
not survive a refresh, a back button, a prefetch, or a second tab. Client-side
guards reduce noise; the store's conditional write is the correctness boundary.
Likewise, do not solve the double-accept by making the accept link single-use in a
way that punishes a legitimate revisit — a candidate returning to their accepted
offer to re-read the terms should see their acceptance, not a dead link.

## When not to use this

- **Non-terminal transitions** — a counter-offer, a note, a question — are not
  claims on a terminal state and do not need the compare-and-swap; they need
  ordinary optimistic concurrency at most.
- **Recruiter-side administrative corrections** deliberately need to overwrite a
  terminal state (an acceptance recorded against the wrong offer). Those are a
  separate, audited, human-authorised path that records the reversal and the
  reverser — never the same endpoint the candidate uses, and never inheriting the
  original actor.
- **Systems where the offer state is not the source of truth** for downstream
  hiring actions. If something else can independently start onboarding, this
  technique protects the wrong boundary; fix the source of truth first.
