---
layer: technique
type: technique
subject: tiling-texture-acceptance
technique: biome-themed-tile-prompting
status: forged
laws: [one-authority-per-quantity, unmeasured-is-not-a-pass]
shared_with: []
use_when: [generated environment textures all look the same regardless of the setting asked for, composing a material prompt for an environment class, an unknown environment class needs a defined result, keeping the words that request a material and the words that interpret it in agreement]
---

# Biome-themed tile prompting

## The concern

Ask a general image model for a tiling ground texture for a dozen different environments,
and a surprising number come back as the same dark granular asphalt. The model is not
ignoring the environment word; the word simply did not carry enough weight against the
mass of its training distribution, and an under-constrained generator falls toward its
densest region. The symptom reads as a model defect and is actually a prompt-composition
defect, which is why it is often "fixed" by switching models and comes straight back.

The general craft of composing image prompts and locking a style belongs to generative
media practice. What is specific here is narrow: **an environment class must resolve to a
material vocabulary, and an unrecognised class must resolve to a stated fallback rather
than to whatever the generator prefers.**

## Procedure

1. **Enumerate the environment classes** the content actually uses. This is a closed
   list — it comes from the design, not from free text — and closing it is what makes the
   next step finite.
2. **For each class, write a material vocabulary**, not an adjective. Three kinds of word
   do the work: the material noun (what the surface is made of), its condition (weathered,
   cracked, frost-rimed, sun-bleached), and a colour or tonal phrase. The noun is the
   heaviest; a class that only supplies adjectives will still collapse.
3. **Compose the vocabulary into the query rather than appending it.** A leading material
   noun steers; a trailing modifier decorates.
4. **Declare a fallback for unknown classes** and make it a deliberate, named generic —
   not the empty string. A silent generic and a chosen generic look the same in the output
   and are completely different in the log.
5. **Keep the tiling instruction structural where the generator supports it**, and
   textual only as a secondary. A prompt asking for seamlessness is a request, not a
   constraint, and its success rate is what the seam check measures.
6. **Append a fixed quality suffix once, in one place.** If every prompt in the pipeline
   ends with the same craft-quality phrasing, that phrasing is a single asset with one
   owner; pasted into each call site it becomes several, and they drift.
7. **Record which class produced each texture.** Without it, nobody can ever answer "are
   our desert textures worse than our forest ones", which is the question that finds the
   next collapsed class.

## The single-source requirement

The same vocabulary that composes a prompt must be the vocabulary that reads the result
back. If plain-English surface words map to physical material properties for the purpose
of authoring — a word meaning glossy implies low roughness, a word meaning polished metal
implies a metallic response — then that mapping is one table with one owner, consumed by
both the prompt composer and whatever interprets the output. Two copies is the classic
form of this bug: a surface is requested rough, generated rough, and interpreted glossy,
because the interpreting copy was updated and the composing copy was not. The failure is
silent and shows up as a material that looks wrong for no traceable reason.

## Decision rules

- **When outputs across several classes look alike, suspect the vocabulary before the
  model.** Test it: generate the same class with and without the vocabulary, side by side.
  If the vocabulary makes no difference, it is too light — add material nouns, not more
  adjectives.
- **When a class needs more than a handful of words, it is probably two classes.** Split
  it; a vocabulary that tries to cover both a mossy forest floor and a bare rock shelf
  produces the average of them.
- **When the same class must produce variety, vary within the vocabulary**, not by
  loosening it. Loosening returns the collapse.
- **When a fallback fires, that is a finding, not a normal path.** Count the fires. A
  class that repeatedly falls through is a missing entry, and a fallback rate nobody
  measures is how a vocabulary quietly stops covering the content.
- **Never let a class's words be edited in one place and read in another.** One owner per
  mapping.

## When NOT to use it

- **For a unique hero surface**, where a specific art direction is being executed and a
  class vocabulary would flatten it toward the class average. Author that prompt.
- **When the generator already enforces the material class structurally** — a model
  conditioned on a material taxonomy rather than free text does not collapse in this way,
  and a second vocabulary layered on top just fights the conditioning.
- **As a substitute for reference.** A vocabulary steers a generator; it does not tell
  anyone what the environment should look like. That decision is upstream, and if it has
  not been made, better words will not make it.
