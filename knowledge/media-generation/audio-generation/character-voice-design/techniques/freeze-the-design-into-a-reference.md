---
layer: technique
type: technique
subject: character-voice-design
technique: freeze-the-design-into-a-reference
status: forged
laws: [typed-input-owns-its-channel, edit-do-not-regenerate, unmeasured-is-not-pass]
shared_with: []
use_when: [a voice designer has no save step and re-reads the description on every render, casting with an open or local text-to-voice model instead of a hosted provider, a designed voice sounds like a slightly different person on every line, moving a cast from a hosted designer to a local engine, per-line direction on a designed voice changes who is speaking, choosing which clip a designed voice is cloned from]
---

# Freeze the design into a reference

[Design-to-read parameter lock](./design-to-read-parameter-lock.md) assumes three
stages: design, **save**, read. The save is where a chosen preview becomes a
stored voice with a durable identifier, and it is the save that makes two
*different* lines sound like one person; a fixed seed only makes a repeated line
repeat. Hosted designers provide the save as a call. Many open text-to-voice
models do not: the description is the voice, and every render conditions on the
prose again. Wrapped naively, such a model is cast by description, and every
line of the production is a fresh draw from the neighbourhood the description
names. Nothing errors. The cast is a different person in every scene.

The save step therefore has to be built, and it is built from a second engine:
**render one reference clip from the chosen design, keep it as the asset, and
read every production line through a cloning engine conditioned on that clip.**
At least one open model family documents exactly this as its recommended
workflow for "a consistent character voice across many lines": design a short
reference clip, build a reusable clone prompt from it, generate every new line
from that prompt.

## What the freeze buys, and what it costs

It buys the stored voice the lock technique needs. The identity is now an
artifact - the clip and the clone engine generation it is read through - and
everything that technique says about locking the render key, and everything the
production subject says about binding an asset to an engine generation, applies
to it unchanged.

It costs the direction channel, and that is the decision a production has to
make on purpose. On a description-conditioned designer, per-line direction and
identity travel in **one** prompt: an integration that layers "panicked,
shouting" onto the voice description for one line has rewritten who is
speaking for that line, because the model cannot tell which words are timbre
and which are performance. That is the failure the
[typed-input-owns-its-channel](../../../_laws.md#typed-input-owns-its-channel)
law names, and the freeze cures it by moving identity into the clip. But
cloning engines are uneven about what direction they then accept. Surveyed in
one integration of nine open speech engines: the permissively licensed clone engine
there accepts no free-text direction at all and drops it silently; another
exposes only a fixed expressiveness default per language; a third reads inline
non-verbal tags, in one language. The single engine that cloned, designed *and*
took free-text direction carried non-commercial weights. Those facts are dated
and per engine; the shape recurs, so check it per engine before committing a
production to it.

## The rule

1. **Cast on the designer, decide on clone reads.** Rounds run on the design
   model exactly as the slate and audition techniques describe. Before a voice
   is cast, its frozen reference is rendered and the audition lines are read
   *through the clone engine*; that is what ships, so that is what the owner
   judges ([unmeasured is not pass](../../../_laws.md#unmeasured-is-not-pass)).
2. **Render the reference for neutrality, not for the audition.** A cloning
   engine copies the reference's manner along with its timbre. A preview
   performed in panic makes every cloned line a little panicked. Render the
   reference from the design with a neutral, working-register instruction, a
   few sentences of plain text, clean and dry. The emotional range belongs in
   the line text and in whatever channel the clone engine offers; the treatment
   belongs in the finishing layer.
3. **Never re-design to fix a line.** Once frozen, a note on a line is answered
   by re-reading that line through the same reference and key. Going back to
   the designer for one line is regenerating the voice
   ([edit, do not regenerate](../../../_laws.md#edit-do-not-regenerate)) and
   produces exactly the per-scene drift the freeze removed.
4. **When range matters more than one channel can carry, freeze per register.**
   A character whose arc needs a whisper and a shout, on a clone engine with no
   direction channel, can carry a small set of references rendered from the
   same design and seed with different delivery instructions, one per register,
   each named and chosen per line. They are separate assets that are meant to be
   one person, so they pass a speaker-similarity check against each other within
   one embedding model, and a listening board, before they ship together.
5. **Record the freeze as the asset.** The cast record keeps the description,
   the design seed and designer generation (to rebuild), the reference clip and
   its text (the identity), and the clone engine generation (the render key).
   The reference was produced by the production's own design model, so its terms
   are that model's weights' terms and nobody else's. That is the licence
   advantage of designing locally rather than cloning a hosted designer's
   preview, which carries the hosted provider's terms into every line.

## Moving a cast from a hosted designer

A production that cast on a hosted designer and wants an open path keeps less
than it might expect:

- **The description ports.** It is prose in the designer's vocabulary, and the
  rounds' notes about which words carried the voice are the most reusable
  casting knowledge the production has.
- **The seed does not.** A seed is meaningful only to the model that drew from
  it; the same number on another designer is an unrelated voice.
- **The preview ports only under its source's terms.** Cloning the hosted
  preview reproduces the cast voice most closely and binds the hosted
  provider's terms to every line. Whether that is acceptable is a rights
  question for the production, not a technical one.

So the clean migration is a casting round, not a conversion: the winning
descriptions re-run on the local designer as a round, the owner picks, and the
pick is frozen. It costs one round per character and buys a cast whose every
term is known.

## When not to use it

- **The designer has a save step** and the production stays on it: use the
  stored voice and the parameter lock directly.
- **One line, heard once.** A prototype bark does not need an asset.
- **The production wants per-line variation of the voice itself** - a crowd,
  a disguise, a voice that is meant to be unstable. Re-designing per line is
  then the feature, and it should be named as one.
