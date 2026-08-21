---
layer: technique
type: technique
subject: usage-limit-governance
technique: graduated-throttle-with-deterministic-shed
status: forged
laws: []
shared_with: []
use_when: [a cap should apply back-pressure before its hard wall, clients flap between accepted and rejected at a threshold, making shedding reproducible and testable]
---

# Graduated throttle with deterministic shed

A hard threshold is a cliff: the client is fully accepted at one event and
fully rejected at the next, with no signal in between. Machines respond to
cliffs badly — they retry, and the retries arrive at a wall that will not
move for a window's worth of time. The graduated tier replaces the cliff
with a ramp: below a start ratio nothing happens; between the start and the
threshold a proportionally growing share of traffic is shed with a short
retry hint; at the threshold the ramp ends and the rule becomes a hard
stop, identical to a strict cap. The client feels pressure early, slows
down cooperatively, and — if it does — may never hit the wall at all.

## The ramp

Shed fraction is a pure function of the usage ratio: zero at the ramp
start, linear to one at the threshold. Three boundary decisions matter:

- **The start reuses the warning knob.** If the rule has a soft-warning
  fraction, the ramp starts there — the operator already declared where
  "approaching" begins. Only in its absence does a default apply; the last
  fifth of the budget is a defensible one, matching the ordinary intuition
  of "you're nearly out". Never introduce a second, independent ramp-start
  knob beside the warning fraction.
- **At the threshold the mechanism changes, not just the number.** A
  breached rule does not shed — it rejects outright, with the window-scaled
  retry hint instead of the shed's short one. But report the shed fraction
  as saturated (1.0) rather than snapping it back to zero: the fraction is
  a proximity signal published to clients, and a signal that collapses at
  the moment of maximum pressure reads as recovery.
- **Exactly at the ramp start, shed is zero.** The boundary is
  deterministic, not a coin flip — a client at precisely the start ratio is
  not yet being shed, and a test can assert that.

## The deterministic lottery

The shed decision for one event is **not a random draw**. Map (rule id,
event id) through a pinned hash to a stable point in [0, 1); the event is
shed when its point falls below the current shed fraction. This buys three
properties a random draw cannot offer:

- **Reproducible.** The same event gets the same verdict from the same rule
  at the same pressure, every time. Support can replay a rejection;
  a test can assert one.
- **Monotone.** Raising the shed fraction only ever *adds* events to the
  shed set — no event is un-shed as pressure rises. This is the anti-flap
  property: as usage creeps up, the accepted population shrinks smoothly
  instead of oscillating, and a client that was shed does not get teased
  back in and thrown out again by noise.
- **Unflappable under re-evaluation.** Admission paths re-evaluate — on
  retries, in tests, across replicas reading the same totals. A random
  draw makes every re-evaluation a new lottery; a deterministic one makes
  re-evaluation idempotent.

Two implementation rules keep the lottery honest. Pin the hash to your own
code — a short, well-known non-cryptographic hash written out explicitly —
never to a standard library's default hasher, whose behavior is an
implementation detail free to change under you and thereby silently reshuffle
which traffic is shed. And condition the hash output before use: cheap
hashes mix short inputs unevenly, so finish with an avalanche step and take
the top bits onto the exactly-representable unit-interval grid, or the shed
set will cluster instead of sampling traffic evenly.

Know where this sits against the wider field. General overload control
sheds probabilistically — random early drop in network queues, adaptive
client-side throttling that rejects with a computed probability — and is
right to: those regulators face transient overload on a feedback loop of
milliseconds, where a re-rolled verdict costs nothing and flap is noise.
A budget cap's pressure moves on the window's timescale and its verdicts
are re-read — by retries, by tests, by the status surface a support
engineer replays — which is why determinism wins here. The precedent is
not absent from large systems either: overload frameworks that need
per-user consistency partition users into admission levels by a stable
hash of user id, for exactly the anti-flap reason. And if events carry a
criticality dimension, shed by it before the lottery — a uniform draw
treats a health probe and a customer's call alike; ordering the ramp by
criticality tier, with the deterministic lottery breaking ties within a
tier, keeps every property above while shedding the most sheddable
traffic first.

## The two retry hints

A shed is transient back-pressure: nothing is over budget, other traffic
is flowing, and the same logical call may pass moments later. Its retry
hint is a short pause — a second or a few — growing with the shed fraction,
so heavier pressure asks for more patience. A breach is a wall: capacity
returns only as usage ages out of the rolling window, so the hint scales
with the window. Publishing the shed fraction on *accepted* responses too
completes the contract: a cooperative client can pace itself down the ramp
without ever being refused.

## When not to use it

- **Strict caps.** A compliance or contractual ceiling wants the hard-stop
  tier: no traffic deliberately dropped while budget remains, one
  unambiguous wall. The graduated tier trades a little pre-threshold loss
  for smoothness; that trade must be the operator's explicit choice, never
  a default applied to a cap that said "block".
- **Observe-only rules.** The alerting tier never sheds; shedding is
  enforcement, and an "alert" that drops one request in fifty is a lie with
  a euphemism.
- **Idempotency-keyed retries of the same event.** The lottery keys on the
  event id, so a client that retries a shed event under the *same* id will
  be shed again at the same pressure — by design, since re-evaluation is
  idempotent. Clients should mint a fresh id per attempt (a new logical
  event), and documentation should say so; a client that expected the
  retry itself to reroll the dice has misread the contract.
