---
layer: technique
type: technique
subject: media-playback
technique: committed-buffer-steering
status: forged
laws: [limits-are-derived, failure-not-empty-success]
shared_with: []
use_when: [input should change content that is produced ahead of the playhead, a steer appears to be ignored because it lands seconds later, deciding whether to discard produced-but-unplayed content, many contributors steer one timeline]
---

# Committed buffer steering

A timeline fed by a producer working ahead of the playhead
([generated-supply-margin](./generated-supply-margin.md)) will eventually be
given an instruction: a viewer redirects the story, an operator corrects the
subject, a moderator vetoes a direction. Between that instruction and the
screen sits everything already produced. This technique is about what the
buffer *costs* at that moment, because the same depth that guarantees
continuity is the thing standing between the input and its effect.

That is the trade, and it is structural rather than a tuning nuisance:
**buffer depth is simultaneously the stall protection and the reaction
latency, and the two want opposite values.** Deepening the buffer to survive
a slow producer makes the surface less responsive by exactly the amount
added. No amount of engineering removes the conflict; the technique is to
make the choice deliberately, price it, and tell the truth about the result.

## The steerable frontier is production, not playback

The first thing to get right is *what* an instruction can still affect,
because the intuitive answer is wrong and produces a surface that promises
more than it delivers.

Content that has been produced but not yet played is **committed**. It
exists, it cost the margin to make, and steering it means throwing it away.
So the frontier an instruction can reach without paying anything is not
"whatever has not been seen yet" — it is **whatever has not yet entered
production**, and those two points differ by one full production time plus
the depth of the queue behind it. A surface that offers steering against
the playhead is offering a capability it does not have.

Say the frontier out loud in the design. Everything below follows from
where it sits.

## Three honest responses, and a dishonest one

- **Append** — the instruction shapes the next unit that enters production.
  Reaction latency equals the current committed depth; nothing is wasted
  and no margin is spent. This is correct when the input is a *direction*
  rather than a *correction*: the contributor is steering where the content
  goes next, not objecting to what is on screen.
- **Discard and re-produce** — drop the committed tail, produce against the
  new instruction. Reaction latency falls to roughly one production time,
  and the price is not merely the discarded content: it is the *margin the
  content represented*. Discarding `D` seconds of buffer costs
  `D · ρ / (1 − ρ)` of wall clock to rebuild, which at a ratio near one is
  minutes for seconds. This is why the responsive path is a luxury of
  systems running with real headroom, and why a surface that offers it
  unconditionally will be found stalling shortly after it becomes popular.
  Where it is offered, bound it: a discard budget per interval, derived
  from the margin rather than picked ([limits-are-derived](../../../../_laws.md#limits-are-derived)).
- **A reserved shallow lane** — keep one cheap, near-zero-depth lane whose
  production cost is trivial next to the main one (an overlay, a caption, a
  short spoken acknowledgement, a state change in the surrounding surface)
  and land the *acknowledgement* there immediately while the main lane
  reacts at committed depth. This is usually the right answer and it is
  reliably the last one built, because it looks like a presentation detail
  and is actually the thing that makes the latency tolerable. It works
  because the intolerable part of a slow reaction is not the wait — it is
  not knowing whether the input registered.

The dishonest fourth response is to accept the instruction, show nothing,
and let it surface a minute later. The contributor cannot distinguish
*accepted, effective in ninety seconds* from *silently dropped*, so they do
the only rational thing and send it again, three times, which is now three
committed units of redundant content. An acceptance that produces no
observable receipt is an empty success with good intentions
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## State the reaction latency; it is a number you already have

At the moment an instruction is accepted, the delay before it can possibly
be visible is computable: the committed depth ahead of the frontier, in
seconds of content. It is not an estimate and it does not require
prediction. Surface it — as an acknowledgement carrying the wait, a
position in a visible queue, or a countdown — and the whole class of "is
this thing even working" behaviour disappears.

This is also the honest place to admit the discard policy. If the system
*can* preempt, the acknowledgement says the instruction is taking effect
now; if it cannot, it says when. Two different promises, and a surface that
renders both identically has taught its contributors to distrust it.

## Many contributors, one timeline

Steering an interactive stream is rarely one input against one turn — it is
a crowd against a single shared timeline, which adds a problem that a
per-user surface never has: **contention among instructions that are all
legitimate.** Priority over autonomously generated filler is the easy half
and the half everyone implements. The hard half is the policy among real
inputs, and it needs to be stated:

- The instruction queue is **bounded**, with a declared admission rule.
  Unbounded acceptance means an input accepted now takes effect at an
  unbounded future time, which converts a promise into a lie by degrees —
  and the contributor who waits eleven minutes has a worse experience than
  the one who was refused in a second.
- Refusal at the boundary is loud and immediate, never a quiet drop.
- Ordering is a product decision with visible consequences (arrival order,
  rate-limited per contributor, weighted, sampled) and it belongs in the
  surface, not in an undocumented sort.

The autonomous producer keeping the buffer full is best understood as the
lowest-priority contributor rather than as a separate mechanism. That
framing gets the preemption logic right for free and stops filler from
being special-cased into a path where it cannot be displaced.

Two refinements come from schedulers that have run this in production, and
both are the difference between a priority rule that works and one that
looks fine until it is loaded.

**Priority without an aging bound is a starvation weapon.** A strict class
priority — instructions always beat filler — means a busy enough stream of
instructions never lets the background producer run, and the buffer it was
maintaining drains to nothing while every individual decision looks
correct. The fix is to make the priority *expressible as a deadline* rather
than as a class: give each class a scheduling horizon, key the queue on
`enqueue_time + horizon` computed once at admission, and the ordering falls
out of a single comparison. High-priority work still jumps ahead, but only
by the difference between the two horizons, so background work older than
that difference cannot be overtaken. Preemption and a starvation bound stop
being two mechanisms in tension and become one number.

**A caller-supplied priority is an unauthenticated privilege knob.** The
moment an instruction can name its own urgency — a deadline field, a
priority flag, a "this is important" bit — the field is reachable by
whoever can send an instruction, and on a public surface that is everyone.
Floor it per class: a contributor may schedule itself sooner within its own
class, never sooner than the class above it. Without the floor, one field
in one message buys ahead of every other contributor *and* ahead of the
filler keeping the stream alive, which is the starvation case the horizons
were there to prevent, re-entered through the front door.

## Decision rules

- Name the steerable frontier and design against it, not against the
  playhead.
- Choose append, discard or shallow-lane per *class of instruction*, not
  once for the system — corrections and directions have different
  economics and deserve different paths.
- Never offer discard without a budget derived from the supply margin.
- Acknowledge every accepted instruction within a perceptual beat, on a
  lane whose depth is near zero, and carry the reaction latency in the
  acknowledgement.
- Bound the instruction queue and refuse loudly at the boundary.
- Treat the autonomous filler producer as the lowest-priority contributor
  to the same queue.

## Relationship to steering a single unit of work

The per-user analogue of this problem — a message arriving while one turn
is still running — is
[mid-turn-steering](../../../../llm-agent/runtime-and-io/streaming-output/techniques/mid-turn-steering.md),
and its contract is worth knowing because two of its rules carry over
unchanged: steering is a declared capability rather than something probed
for, and an accepted steer needs an observable join point or it is a
promise with no receipt.

What does not carry over is the shape of the degrade. There, the fallback
to *queue as the next turn* is a clean binary, because a turn is a unit of
work with a beginning and an end and the user is waiting on it. Here there
is no turn to be inside or outside of: the timeline never ends, work is
always in flight, and the question is never *steer or queue* but **how far
ahead the commitment already extends and what buying it back would cost.**
A design that imports the binary will conclude it is always in the
steering case, and will discover the price of that only under load.
