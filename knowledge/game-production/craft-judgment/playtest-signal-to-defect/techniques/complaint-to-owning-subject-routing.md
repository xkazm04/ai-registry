---
layer: technique
type: technique
subject: playtest-signal-to-defect
technique: complaint-to-owning-subject-routing
status: forged
laws: [one-authority-per-quantity, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a complaint queue is almost entirely balance tickets, deciding who owns a playtest finding, building the triage table for a session pipeline]
---

# Complaint to owning subject routing

The concern: **sending a finding to the discipline that owns the defect class it belongs to,
rather than to the discipline whose vocabulary the complaint happened to borrow.** This is the
step that makes the whole subject pay. A perfectly observed, minimized, two-axis finding filed
against the wrong discipline is a finding that will be argued about and closed.

## Route from the observation, by asking what would have to change

The routing question is never "what is the player complaining about". It is **"what would have to
be different for this observation not to have happened"**, answered from the observation field
and never from the interpretation field. The same sentence out of a tester's mouth routes four
different ways depending on what the recording shows:

- *"It was too hard"* — with a recording showing an ability that was never used once: a
  **teaching** finding. An ability nobody was taught is not weak, it is absent; tuning its numbers
  changes nothing for a player who never pressed the button.
- *"It was too hard"* — with a recording showing the ability used correctly and often: a
  **tuning** finding, and now a real one, because the premise it needs has been confirmed.
- *"I got lost"* — with a recording showing the player walking past the exit twice: a
  **legibility** finding. The space is laid out correctly and reads wrongly, and re-laying it out
  will move the problem rather than fix it.
- *"I got lost"* — with a recording showing them exhaust every branch and find no exit: a
  **layout** finding, which is a different team and a different fix.
- *"The fight dragged"* — with correct totals and a flat middle: a **pacing** finding. Lowering
  health shortens the flat part without removing it.

Three orderings do most of the work here, and each exists because the earlier hypothesis is both
cheaper to check and further up the causal chain: **teaching before tuning**, **legibility before
layout**, **pacing before numbers**. Skipping them is how a project ends up rebalancing systems
that were never reached, re-authoring spaces that were never misbuilt, and shortening encounters
that were never too long.

## Building the table

A routing table has four columns and the third one is the one people forget: the complaint
shape, the candidate defect classes it could belong to, **the observation that discriminates
between them**, and the owning discipline for each. Without the discriminator column the table is
a keyword mapping, and a keyword mapping is exactly the thing that files everything containing a
number under balance.

Two structural rules govern it:

- **One owning discipline per defect class.** Where two teams both accept "the fight dragged",
  neither owns it and the finding oscillates. Assign each class exactly one destination, and let
  that destination pull in whoever else it needs.
- **The classes you route by are the classes a session declares its coverage in.** When findings
  are classified in one partition and sessions declare what they tested in another, nothing can
  join the two, and every question of the form "did this session even look at that?" becomes
  unanswerable — which is the question that decides whether an absent finding was fixed or merely
  unvisited. One partition, used by both.
- **Split compounds before routing.** *"The second fight dragged, and then I got lost, and I
  never used the shield"* is three findings, and routing it as one guarantees at least two of them
  die. Splitting happens at the observation, before any owner is named.

## No default bucket

The single most important rule in the technique: **a router with a default bucket sends
everything to the default.** Balance is the usual default, because it accepts anything phrased
with a number in it; polish and *feel* are the runners-up. A project whose complaint queue is
overwhelmingly one destination has not discovered that this destination is uniquely troubled — it
has discovered its router, and the discovery is invisible from inside the queue because every
individual ticket looks plausible.

So there is no default. A finding that does not match a discriminator is **unrouted**, which is a
named state with its own queue that gets reviewed as a queue. The size of that queue is a
measurement of the routing table rather than an embarrassment: a growing unrouted queue means new
kinds of defect are appearing, which is information, and an empty one on a live project means the
router is guessing.

## A route is a claim, and a wrong one costs more than none

An arriving owner is a powerful anchor. A finding that lands with a discipline attached stops
being re-opened, and — worse — it *inoculates* the real owner, who never sees it because it was
already assigned. This is the same asymmetry that governs automated crash attribution and it has
the same resolution: no attribution costs one triage conversation, and a wrong one costs a
team-week plus the finding.

Hence: **a rejected route returns to unrouted with a stated reason, never bounced silently to
the next-most-plausible destination.** The reasons are what improve the table, and a rejection
that names the missing discriminator is worth more than the finding it rejected.

## Decision rules

- **When the observation does not discriminate, the finding is unrouted and the next action is to
  observe, not to guess.** Name the observation that would settle it; that is a cheap, specific
  request for the next session.
- **When a finding routes to a discipline that has no method for it, route it anyway and record
  the gap.** The discipline that owns a class it cannot yet handle is a staffing or tooling
  finding, and disguising it by re-routing to whoever is available hides it permanently.
- **When routing is automated, feed it the observation field only, and require the discriminator
  to be present.** An automated router given free-text complaints will reproduce the default-bucket
  failure at machine speed and with better grammar.
- **When one destination's share climbs steadily over a quarter, audit the router before the
  game.** Distribution over time is the diagnostic; a stable distribution with a growing unrouted
  queue is healthy, a shrinking unrouted queue with one destination swelling is not.

## When not to use it

- **Not on a team small enough that everyone owns everything.** The table's value there is the
  *class*, not the owner — keep the discriminator column, drop the routing column, and use it as a
  diagnosis aid rather than as a queue.
- **Not before the observation is confirmed.** Routing an interpretation produces a guess with an
  address on it, which is strictly worse than a guess without one.
- **Not for findings that are genuinely about the whole.** Some observations — the game has no
  identity, the first ten minutes do not cohere — do not decompose into an owned class, and
  forcing them through the table shreds them into five small tickets that will each be fixed
  without addressing anything. Those belong in a review that has the whole in scope.
