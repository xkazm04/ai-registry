---
layer: technique
type: technique
subject: game-dialogue-voice-pipeline
technique: bake-versus-runtime-speech
status: forged
laws: [a-budget-shapes-the-output, unmeasured-is-not-a-pass]
shared_with: []
use_when: [deciding which spoken lines are pre-rendered and which are generated in play, an NPC must answer text that did not exist at build time, a streamed line arrives late]
---

# Bake versus runtime speech

The named concern: give every spoken line a class that decides *when* it is rendered and
*who accepts it*, record the class in the line catalog, and for the lines that are rendered
in play, decide in advance what plays when the render is late. The concern is not
"is synthesized speech fast enough". It is that two lines in the same scene can require
opposite pipelines and a project that picks one for the whole game pays the wrong cost on
half of it.

## The three questions

Ask them per line class, in this order, and write the answers into the catalog.

1. **Can the text exist before play?** If the wording is authored or can be enumerated
   (story beats, barks, tutorial prompts, shop greetings), it can be rendered offline. If
   the wording depends on a player utterance or on generated text, it cannot, and the line
   is runtime by construction.
2. **Does a wrong read break a story beat?** A line whose delivery carries plot, a joke or
   an emotional turn needs a person to hear it before a player does. That forces the bake,
   even when the text could be produced at runtime, because runtime output has no
   listener at authoring time.
3. **Does the line repeat?** A line heard once a game and a line heard four hundred times
   a game have different tolerances for a flat read and different render costs. Frequent
   lines are baked in several variants and selected, which costs storage and removes both
   latency and the risk of a bad read on the tenth repetition.

The resulting classes are stable enough to name. **Baked-authored:** final text, offline
render, accepted by a listener, frozen before ship. **Baked-pool:** a set of interchangeable
variants for a bark category, selected by rule, each accepted like an authored line but in
bulk. **Runtime:** text generated in play, rendered in play, accepted only statistically,
by sampling and by constraints on what the text may be. A line may move to a cheaper class
when its answers change; it may not be in two classes at once.

## Runtime lines inherit a budget and add a stall rule

A runtime line is bound by the real-time synthesis budget from the voice input/output
craft: the time from text ready to first audible sample, with a stated median and a stated
tail, measured on the target device and network. That budget is not restated here. What a
game adds is the stall: the moment the player has asked and the render has not arrived.

The stall rule has an ordered ladder, chosen per character and recorded:

1. **A pre-baked filler read** in the character's voice (a thinking sound, a short stock
   acknowledgement) that starts within the budget and hides the wait.
2. **Text first**, with the voice following, for characters whose presence can carry a
   subtitle.
3. **A held interaction** with an explicit thinking animation, when neither of the above
   fits the character.

Silence is never a rung. A late stream that leaves the NPC frozen and mute reads as a bug,
because a player has no model for "the speech provider is slow". The filler read is a
baked line in the catalog like any other, with its own id and its own consent row.

A budget of this kind shapes what is generated
([a budget shapes the output](../../../../_laws.md#a-budget-shapes-the-output)): short
first sentences render sooner, so the text generator is told to lead with a short clause,
and the renderer is fed sentence by sentence rather than after the whole reply. The
perceived wait then approaches the longer of the two stages rather than their sum.

## Decision rules

- **When text is final and a wrong read costs a story beat, bake it,** regardless of how
  fast the runtime path is. The acceptance step exists only offline.
- **When a line repeats across a category, bake a pool** and select by rule; the pool's
  size is a design decision, not a leftover.
- **When the text does not exist until play, it is runtime, and it needs a stall rung
  before it ships,** not after the first report of dead air.
- **When a vendor states a latency figure, treat it as a lead** and measure the budget
  yourself before setting it; a stated median excludes the network and says nothing of the
  tail. Unmeasured is not a pass
  ([unmeasured is not a pass](../../../../_laws.md#unmeasured-is-not-a-pass)): a runtime
  class with no measured tail carries *not measured* in the catalog.
- **When a runtime line is spoken, log its text, voice, model and measured latency,** so
  the bake-worthy lines (the ones players actually trigger) can be promoted into the baked
  classes later.
- **When a bake is rendered, render it with its neighbours' text as context** if the
  provider supports it, so adjacent lines share prosody; a line rendered in isolation and
  spliced beside its neighbours is audible at the seam.

## When not to use this

- **In a game with no runtime speech.** The classification collapses to baked-authored
  and baked-pool, and the stall ladder is dead weight.
- **As a reason to bake what should be runtime.** If the design's promise is a companion
  who responds to anything the player says, baking makes the promise false; the cost to
  pay is the stall rule, not a bigger recording list.
- **For the sound of the voice in the world.** Once a line exists it is an emitter; its
  position, occlusion and ducking belong to the spatial audio craft.
