---
layer: technique
type: technique
subject: on-stream-persona-continuity
technique: per-turn-persona-anchor
status: forged
laws: [style-is-restated-not-remembered]
shared_with: []
use_when: [a generated live host drifts out of character late in a long stream although its persona prompt is present every turn, deciding what persona material goes near the newest turn, rotating example lines into a host's prompt]
---

# Per-turn persona anchor

A persona prompt that sits at the head of the context every turn does not hold the
character by being there. Measured on instructed chatbots, the agent drifts from its
system prompt within a few rounds, with the prompt present on every one of them; the
proposed mechanism is attention that decays over a long exchange, so the head of the
context weighs less as the transcript under it grows. A live stream is the long
exchange at its extreme. The anchor is a **short, stable piece of persona material
placed in the per-turn band, next to the message being answered**, so the character
is restated where the model is looking when it writes.

## What the anchor holds

- **A compact restatement** of the few voice invariants that make the character
  recognisable, taken from the core and worded the same way every time. It is a
  reminder of the core, never a second version of it.
- **A few example lines**, chosen for the beat's situation (a roast request, a bait,
  a quiet stretch, a newcomer), drawn from a bank the owner has reviewed. Examples
  carry a voice better than adjectives do, and the situation match is what keeps
  them relevant.
- **When drift is measured per behaviour**, a one-line instruction naming the
  behaviour that slipped. In one study of simulated personas this beat plain
  restatement by a wide margin; it needs its own monitor and its own test, so it is
  added only where something measures which behaviour slipped.

The byte-stable prefix still carries the full persona at the head. The anchor
adds to it and replaces none of it, and it obeys the same placement rule: material
that changes per turn lives in the per-turn band, below everything stable.

## Rotation

Example lines shown every turn become the lines the host says. Models copy quoted
text, and a few examples are copied far more than anyone expects. So the bank
rotates: a line shown is rested for a number of beats before it may be shown again,
the section says the lines are a register and are not to be reused verbatim, and
the anti-repetition window still compares what airs against what was said. A bank
small enough that rotation runs out is too small for the stream.

## What it buys, and what it does not

Re-inserting the persona near the newest turn reduces drift; it does not end it. In
one controlled comparison, reinjection cut the modelled rate of judged drift by
about a third and no mechanism removed it, and checking on a fixed schedule did no
worse than checking when a monitor asked. Read that as the anchor's ceiling: it
buys margin, and the guardrail measurement of in-character rate stays on.

## Decision rules

- **When the host holds character early and loses it late**, suspect attention
  decay before suspecting the core; add or strengthen the anchor before rewriting
  the persona.
- **When an example line starts airing verbatim**, lengthen the rest or widen the
  bank for that situation; do not delete the section.
- **When an anchor is added or changed**, it is a change to the persona the model
  reads; record it as a version and do not pool measurements across it.
- **When a beat must carry no performance** (a viewer in distress, a safety
  directive), the anchor's example lines are left out; the safety layer's
  material owns that beat.

## When not to use it

A short exchange does not need one: the measured drift appears over several rounds
and grows with length. A host whose drift is measured as flat across a full stream
has no use for the extra per-turn tokens either. And the anchor is a reminder, not a
filter; it does not replace the output gate or the in-character measurement.
