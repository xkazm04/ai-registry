---
layer: golden-path
type: golden-path
subject: sound-effect-generation
status: forged
use_when: [generating sound effects or ambiences from text, a described sound comes back as the wrong event entirely, building the sound vocabulary of a trailer or short piece, an ambience must loop without an audible seam, deciding whether to generate a finished sound or its layers]
techniques:
  - envelope-first-briefing
  - trailer-punctuation-grammar
  - loop-seam-acceptance
  - layered-element-assembly
  - picture-as-timing-brief
---

# Sound effect generation

A sound effect is not a small piece of music, and briefing it like one
fails immediately: it has no sections, no tempo, no lyric — it has an
**envelope**. One sound is one event with an attack, a body, and a tail,
over seconds rather than minutes, and everything about describing,
generating, and accepting it follows from that shape. This subject owns
the craft of asking a generator for non-musical sound — effects, hits,
transitions, ambiences — and knowing whether what came back is usable.

## Describe the event, not the emotion

Where music briefs traffic in mood, an effect brief traffics in **physics
and phases**: what happens (material and action), how it starts (the
attack — sharp, soft, swelling), what sustains (the body — tonal, noisy,
resonant), how it ends (the tail — dry stop, long ring, reverse), and
where it happens (the space — dry, roomy, vast). "A scary sound" is the
modal request and returns the modal answer; "heavy iron door slams,
sharp metallic attack, short dry room, no ring" is an executable one
([envelope-first-briefing](./techniques/envelope-first-briefing.md)).
Duration is stated, not hoped — generation schemes take it explicitly on
the scale of a half-second to tens of seconds, and a picture-locked hit
gets its exact length.

## In a cut, effects are grammar

Trailer and short-form sound runs on a small vocabulary of functional
sounds — hits that punctuate, risers that promise, whooshes that carry a
transition, drones that hold tension, cutoffs that make silence land —
and each is defined by its *function in the cut*, not its timbre
([trailer-punctuation-grammar](./techniques/trailer-punctuation-grammar.md)).
The grammar is what keeps effect generation from becoming decoration: an
effect earns its slot by doing causal work at a structural beat, the same
law that governs where music enters.

## Assembly beats the composite

The designed sounds that survive professional scrutiny are **layered** —
a low component for weight, a mid transient for definition, an air layer
for size — and generation should follow the practice rather than fight
it: ask for elements, not for the finished composite
([layered-element-assembly](./techniques/layered-element-assembly.md)).
One-call composites couple every quality axis into one take; layers keep
each axis independently re-rollable and independently mixable, which is
the edit-over-regeneration economics arriving at sound design.

## Loops are a distinct deliverable

An ambience that will repeat has one extra property that dominates all
others: the seam. Loop intent is declared at generation where the scheme
supports it, and the seam is tested at acceptance by listening across the
joint — twice through, minimum — because a seam inaudible once becomes a
metronome by the tenth repeat
([loop-seam-acceptance](./techniques/loop-seam-acceptance.md)).

## Where this subject ends

The four-way question: this subject **produces** non-musical sound to a
brief. Music — sectioned, tempo'd, sung — is the neighbouring composition
subject; *placing* effects in a game world under playback budgets is a
different domain's spatial craft, with rules (concurrency, priority,
occlusion) that have no meaning at the brief stage; wiring captured or
played audio through a product is an engineering surface; and the
measured gates of the acceptance subject — loudness, peaks, the defect
taxonomy — apply to delivered effects exactly as to delivered music, one
category over, without duplication here.
