---
layer: technique
type: technique
subject: sound-effect-generation
technique: envelope-first-briefing
status: forged
laws: [style-is-restated-not-remembered]
shared_with: []
use_when: [describing a sound effect in words, a generated effect is the right idea with the wrong shape, an effect must fit an exact slot in a cut, tuning how literally a generator follows an effect description]
---

# Envelope-first briefing

A sound effect is one event, and an event is its envelope: how it starts,
what it sustains, how it ends. The brief that works describes those phases
in order, because they are what the ear actually parses and what the
picture actually needs — a hit that must punctuate a cut is *made of* its
attack, and a brief that never mentioned the attack has left the sound's
one load-bearing property to chance.

## The four-part description

**Material and action** first — the physical event, concrete: "heavy iron
door slams", "glass cracks and settles", "low wind through a concrete
stairwell". Generators resolve physical descriptions far better than
emotional ones; "menacing" is a hope, "sub-heavy distant impact" is a
spec. Then the phases:

- **Attack** — sharp, soft, swelling, reversed. The phase that decides
  what the sound *is for*: punctuation wants sharp, atmosphere wants none.
- **Body** — tonal or noisy, resonant or damped, steady or evolving.
- **Tail** — dry stop, ring, decay into the space, reverse into the next
  event. The tail is where effects overstay: an unbriefed tail defaults
  long, and a long tail smears the silence after it that the cut may have
  needed.
- **Space** — dry, small room, hall, vast exterior. Space is part of the
  sound, not a later decision: two effects in colliding spaces read as
  two productions.

Duration is explicit, in seconds — schemes accept it on a scale from
half a second to tens of seconds, and default to guessing from the prompt
when unset. Let them guess only for exploration; a slot in a cut has a
length, and the brief carries it.

## The adherence dial

Effect schemes commonly expose a prompt-adherence control — how literally
the description binds, at the cost of take-to-take variation. Use it by
intent: **specification wants high adherence** (the sound is designed;
takes should converge on it), **foley-fishing wants low** (the
description is a region to explore; variation is the product). The
default sits low on most schemes — tuned for fishing — so a spec-shaped
brief that leaves the dial alone is quietly asking for variety it does
not want.

## Restatement, per element

An effects pass for one production shares a sonic world — the same spaces,
the same weight, the same finish — and that world is restated in every
element's brief, exactly as a style block is: "dry, close, sub-heavy,
modern trailer finish" rides on the hit *and* the riser *and* the whoosh.
Elements briefed without the shared world arrive from different films.

## Decision rules

- When an effect is the right event with the wrong shape, re-brief the
  phase that missed — attack, body, tail, or space — rather than
  re-describing the event, because the event resolved and the envelope is
  the variable.
- When the effect must land in an exact slot, state duration and a dry
  tail, because those are the two properties the cut cannot negotiate.
- When takes vary too much to converge, raise adherence before adding
  words; when they converge on the wrong thing, add description before
  touching the dial.

## When not to use this

Musical elements — stingers with pitch and tempo intent — belong to the
composition craft, not the envelope form; the tell is that the brief
wants a key. And genuinely exploratory sound-fishing ("what does this
scene want?") is served by low adherence and loose physical prompts on
purpose — envelope precision enters when a sound is being *specified*,
and applying it during search narrows the net before the fish is found.
