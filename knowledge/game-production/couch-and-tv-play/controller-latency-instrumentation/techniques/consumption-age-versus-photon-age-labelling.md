---
layer: technique
type: technique
subject: controller-latency-instrumentation
technique: consumption-age-versus-photon-age-labelling
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass, one-authority-per-quantity]
shared_with: []
use_when: [writing a latency figure into a report or dashboard, two latency numbers disagree, a budget is about to be compared to a measured number]
---

# Consumption age versus photon age labelling

Four quantities share the word "latency" in a controller pipeline, and most of the damage
done by latency numbers is done by the word. The technique is a small controlled
vocabulary and a rule that no figure travels without one of its terms.

## The vocabulary

**Round trip.** Controller send to controller receive of an acknowledgement, in one clock.
It measures the radio and the two network stacks twice, plus the screen device's handling
of a message. It includes the return leg and ends before any simulation consumed anything.

**Consumption age.** The corrected stamp of an input compared with the instant the
simulation consumed it, in the screen device's clock. It measures the outbound leg, the
queueing before the simulation's next step, and the offset error. It excludes rendering,
presentation and the panel.

**Photon age.** The finger or its stand-in to the first display frame carrying the answer,
observed by a camera. It includes everything. It is the only one of the three allowed to be
called input-to-screen latency.

**Unmeasured.** The value of any of the above for which no instrument ran. It is a state,
not a number.

Every figure in a report, dashboard, commit message or chat reply is written with one of
these terms, the unit, and its clock basis. "Ack RTT p95 63 ms" and "input age p95 47 ms
(consumption, offset-corrected)" and "optical p95 not measured" are complete statements.
"Latency p95 47 ms" is not, and no template should allow it.

## Why the distinction is worth rules

The numbers are not ordered the way intuition expects. In a measured two-client run the
acknowledgement round trip tail was larger than the consumption age tail, because the round
trip pays the return leg and the age does not, yet the age is the one that includes the
simulation's queueing; each is smaller than the photon age would be. A reader holding one
number can bound neither of the others. Equally, a round trip median can be tiny while the
consumption age is poor, if the screen device's frame loop is the bottleneck, so a good ping
proves nothing about the game.

Two misreadings recur. The round trip read as one-way latency overstates it and is
caught by whoever knows what a ping is. The consumption age read as input-to-screen
latency understates it by the entire display pipeline and is not caught by anybody, because
it is a good-looking number with a plausible name. The labelling rule exists for the second.

## Procedure

1. Define each measured quantity once, in the same place the measurement is implemented,
   with its name, unit, start event, end event and clock. That definition is the single
   authority; reports quote it and do not paraphrase it.
2. Name the field after the end event, not after the aspiration: a field that ends at
   consumption is called consumption age, whatever the design document hoped for.
3. Carry the synchronisation state with the number. A consumption age taken before the offset
   was estimated is a lower bound with a different meaning, and the report shows it as such
   rather than as the same quantity with worse luck.
4. Give each report an optical row. If there is no film, the row says not measured.
5. When comparing against a budget, compare like with like. A photon budget is compared to a
   photon figure; a consumption figure may be compared to a consumption budget someone has
   derived, or to nothing.

## Decision rules

- **When a quantity has no label, refuse to publish it.** An unlabelled figure will be read
  as the most flattering candidate.
- **When two figures that look like the same quantity disagree, check their ends before
  their values.** The disagreement is usually two different intervals under one name.
- **When a consumption figure passes a photon budget, report the pass as a floor of the
  evidence, not as the verdict.** The remaining distance to the photon figure is the part
  nobody has measured.
- **When a derived figure is formed from two measured ones, label it derived and name both
  inputs.** The display-side remainder of the optical figure over the consumption figure is
  an estimate whose error is the sum of both errors.
- **When proposing a threshold, label the proposer.** A proposed rubric is a proposal until
  an owner has accepted it, and the report must not render it as a standard the build has
  met or missed.
- **When latency is hidden by prediction or smoothing, report that too.** A system that
  extrapolates the controller's state to cover lag has a different felt latency from its
  measured one; if no such compensation was added, say so, because the absence is a
  design decision a reader may care about.

## When not to use it

- **In a tight debugging loop.** A developer watching a live counter does not need a legend;
  the labelling rule binds what leaves the loop, not what happens in it.
- **For a quantity with a single, universally understood meaning in the team**, such as the
  frame interval. Define it once and move on.
