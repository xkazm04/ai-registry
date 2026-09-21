---
layer: technique
type: technique
subject: channel-native-social-and-repurposing
technique: the-channel-confirms-the-app-promises
status: forged
laws: [a-gate-before-money-and-copy, not-measured-is-not-zero]
shared_with: []
use_when: [designing the status vocabulary of a post or content board, deciding when a slot may show as published, reconciling a plan against a connected channel's state]
---

# The channel confirms; the app promises

*Published* is a word about an event in the world: the channel accepted the post and
showed it. Nothing inside the app can make that event true. The technique is a status
vocabulary that separates what the app **promised** (a plan, a hand-over) from what the
channel **confirmed**, and a reconciliation rule that lets only the channel's own state
put a slot in the confirmed column.

## The vocabulary

Five states, in board order, because the naive three (idea, scheduled, published) is
where the lie lives:

| state | what the app knows | may read as "it went out"? |
|---|---|---|
| idea | in the queue, no date | no |
| scheduled | placed on a day of the plan; purely internal | no |
| queued | handed to a real connected channel as a real scheduled post; the link to that post is held | no |
| published | the channel confirmed it went out; **derived** from the linked post, never asserted locally | yes |
| done | the maker marked the slot finished by hand; nothing left the app | no |

The fifth state exists because makers do finish things by hand - a post typed straight
into a network's own composer, a listing updated in a browser - and need a checkmark.
The checkmark is private and says so. What it must never do is read as a publish,
because every count above it (posts this week, cadence used, publish rate) inherits the
claim.

On the channel side the post itself has its own lifecycle - draft, scheduled, a
transient *publishing* claim taken atomically so two overlapping runs cannot both send
it, then published or failed. The claim is leased, not permanent: a claim older than a
bounded time-to-live (the claimer crashed mid-publish) is settled to failed by a sweep,
never left in a limbo the interface has no terminal meaning for.

## Reconciliation

The board derives its states from the channel on every load, in a pure function:

- A slot with **no link** claiming published or queued is a legacy board written by an
  old local-flip control. It is downgraded to *done* ("marked finished"), because nothing
  ever left the app for it.
- A slot whose linked post is **gone** from the channel centre (withdrawn) keeps its
  plan, loses the claim, returns to *scheduled* and **says so** with a withdrawn flag.
  This is not a silent revert: the maker handed a post over and it is no longer there,
  which is news they have to be told.
- A slot whose linked post the channel reports **published** is published.
- A slot whose linked post **failed** returns to *scheduled* with a failed flag, so the
  maker sees the send did not happen and the slot is theirs to retry.
- Anything else linked is *queued*.

The derived flag outlives the evidence through a one-shot cleanup: the dead link and
the send time that will never come are stripped and persisted, the withdrawn flag is
kept, so the board does not re-derive the same news on every load forever.

## The write path is the other half

A hand-over is created through one endpoint that performs three refusals before it
promises anything:

1. Over the channel limit: refused with a validation error.
2. An unparseable scheduled time: refused rather than silently falling through to
   publish-now.
3. A scheduled time more than a small skew window in the past (a year typo, a stale
   form value, a timezone misread): refused. "Schedule for a past time" and "publish
   now" are different intents, and the second is the least reversible action in the
   subject; only an *omitted* time means publish now. The skew window - two minutes,
   as convention - covers clock drift and submit latency and nothing else.

Scheduling then records an activity row that is explicitly **not** a publish: nothing
has left the app, so the row carries no publish taxonomy and stays invisible to any
publish-rate rollup. The publish event is recorded by the sender when it actually
sends ([a gate before money and copy](../../../_laws.md#a-gate-before-money-and-copy)).

Where a channel has no sending integration at all, the honest states are *scheduled*
and *done* - the board never reaches *queued* for it, and a "publish" control for that
channel is removed rather than simulated.

## Decision rules

- When a slot has no channel link, it may be at most *done*, because a publish claim
  without a channel event is an assertion about the world the app cannot make.
- When the channel reports failed, return the slot to its plan and flag it, because a
  failed send is the maker's to retry and silently reverting hides the news.
- When the linked post disappears, keep the plan, drop the claim, flag it as withdrawn
  and persist the stripped link once, because a flag re-derived forever is the
  staleness reconciliation exists to remove.
- When a scheduled time is in the past beyond the skew window, refuse, because falling
  through to publish-now sends copy live on a connected account by accident.
- When counting anything that reads as "went out", count only the confirmed state,
  because every other state is a promise, and promises are not
  measurements ([not measured is not zero](../../../_laws.md#not-measured-is-not-zero)).

## When NOT to use

- Not for a purely internal editorial calendar with no channel at all. There, *done* is
  the terminal state and the vocabulary collapses to three honestly - as long as none of
  them is called published.
- Not to invent a confirmation. A simulated send in a demo returns a simulated status
  and is labelled as demo; it never produces a confirmed state that later read-back
  could mistake for a real post.
- Not as a substitute for read-back. Confirmation says the post went out; it says
  nothing about what it did. Performance is the grounding technique's job and arrives
  hours later.
- Not with the transient *publishing* claim as a user-facing state without a lease.
  A claim that can be held forever is a post that can be stuck forever.
