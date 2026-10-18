---
layer: technique
type: technique
subject: on-stream-persona-continuity
technique: byte-stable-persona-prefix
status: forged
laws: [style-is-restated-not-remembered]
shared_with: []
use_when: [composing the per-turn prompt of a generated live host, adding an optional section to a persona prompt, tracing a transcript back to the persona that produced it]
---

# Byte-stable persona prefix

The persona is restated in full on every turn, and it is restated in **the same
bytes**. The prefix that carries the core, the bible and the active tone is
composed from the same sources, in the same order, with the same separators, so
that the character the model reads at the end of a long stream is exactly the
character it read at the start. Everything that varies per turn goes after it.

This is the persona form of a principle the bundle already holds for visual
style: consistency across many calls comes from restating the whole contract on
every call, with no short form. A persona summarised, paraphrased or re-templated
per turn is a family of similar characters, and over hours the family drifts.

## Ordering

Compose from most stable to least stable:

1. the core, then the platform and safety rules the host obeys, then the rules
   enabled for this show;
2. the bible and the active tone;
3. stream-scoped material that is fixed for the stream once it starts, such as
   the owner's brief, framed below everything above it;
4. per-turn material: the recalled memories, the show state, the chat window,
   the message being answered.

No per-turn value is interpolated into the upper layers. A viewer's name, the
clock, a counter, or a rank threshold written into the persona text turns a
stable prefix into a per-turn one and buys nothing the lower layers could not
carry.

## The three payoffs

- **Identity.** The character is literally the same input every turn, so drift
  can only come from the lower layers, which are where the other techniques of
  this subject guard it.
- **Traceability.** A hash of the composed prefix is recorded with every turn.
  Any transcript, clip or complaint resolves to the exact persona that produced
  it, and two runs can be compared only when their hashes say they ran the same
  character.
- **Latency and cost.** A byte-identical prefix is what provider-side prompt
  caching keys on. On a live show the cached prefix is part of the first-word
  budget, not merely a discount.

## The empty-section rule

An optional section that is absent must be **byte-absent**: no header, no empty
fence, no trailing separator, no "none tonight" placeholder. A feature that, when
unused, still changes the prefix has silently forked the persona into "with the
feature off" and "before the feature existed", invalidated every cache, and
broken every comparison against older runs. The test is mechanical: compose with
the feature unused and compare the bytes against a composition from the build
before the feature existed; they must match.

## Decision rules

- **When a new section is added**, decide its stability class first and place it
  in the matching band; a section whose stability is unknown goes below the
  prefix until measured.
- **When a source file is edited**, the prefix hash changes and every comparison
  across the edit is a comparison between two characters. Record the edit as a
  persona version; do not pool the measurements across it.
- **When composition reads files at runtime**, read them once per stream and
  compose from the loaded copy, so that an edit mid-stream cannot change the
  character between two turns.
- **When a test exists for composition**, it asserts byte equality of the prefix
  across turns and across the absent-section case, not merely that the expected
  phrases appear somewhere. Pin the no-feature prefix as a literal golden string,
  and assert that a stream-scoped section only ever appends: the prefix with the
  section starts with the exact bytes of the prefix without it.
- **When the hash changes between two turns of one stream**, that is a defect,
  not a tuning event; the recorded hash is how prompt-cache churn and mid-stream
  persona drift are both detected.

## When not to use it

Byte stability is wrong for material that must change: a host that should react
to the clock or the room needs that context, and it belongs in the per-turn band
rather than being suppressed. The technique governs where things go, not whether
the host may know them.
