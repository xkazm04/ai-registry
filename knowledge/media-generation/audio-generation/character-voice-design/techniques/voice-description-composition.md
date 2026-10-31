---
layer: technique
type: technique
subject: character-voice-design
technique: voice-description-composition
status: forged
laws: [refusal-is-a-state, style-is-restated-not-remembered]
shared_with: []
use_when: [writing the prompt a text-to-voice designer turns into a voice, a designer refuses a description or returns voices that ignore it, rewriting a description for a second casting round]
---

# Voice description composition

The description is the only channel into a text-to-voice designer that shapes the
voice itself. It is short (one widely used designer caps it at 1,000 characters),
it is read by a model trained on how people describe voices, and every word in it
either moves an acoustic property or is noise. Composing it is turning the timbre
column of the vocal brief into that vocabulary, in a stable order.

## The anatomy, in order

1. **Who.** Gender presentation, age as a number or a narrow band ("around 30",
   "late 30s"), accent named plainly ("neutral American", "soft Scottish").
   Age is among the strongest controls a designer has; it moves texture, energy
   and maturity together.
2. **The instrument.** Pitch register ("low-mid", "bright upper-mid"), texture
   ("slight husk", "light rasp", "smooth"), breath and resonance ("airy top
   end", "resonant chest voice").
3. **The manner.** Pace, articulation and attitude expressed as delivery:
   "crisp diction", "quick but unhurried", "a faint smile in every line", "dry".
   Attitude words work when they describe how a line is said; they fail when they
   describe who someone is.
4. **The recording.** "Close-mic, studio-quality, no background noise." Designers
   default to clean audio, but stating it removes a variable, and a deliberate
   channel ("headset-style") is the one exception the brief allows here, used
   only when no effect chain will own it.

Two or three sentences, roughly 200 to 400 characters, is a useful starting
band, not a limit. A very short description leaves most properties to the seed;
a long one risks contradicting itself unless every added word is audible. A
designer may recommend longer, more detailed prompts at a lower adherence
setting, and that pairing is worth trying when a short description underfits.

## Decision rules

- **Every adjective must be audible.** Before a word stays, name what a listener
  would hear differently without it. "Intelligent" fails the test; "precise
  enunciation" passes.
- **One description is one voice.** Ranges ("sometimes playful, sometimes
  cold") produce an average. Range belongs in the audition lines.
- **No names of people or characters.** Designers refuse or ignore them, and a
  description that depends on a name is an imitation brief. When a designer
  refuses, read the refusal as a fact about the brief and rewrite the name into
  attributes; never resend the same text hoping it passes
  ([refusal is a state](../../../_laws.md#refusal-is-a-state)).
- **No treatment words when an effect chain exists.** "Robotic", "metallic",
  "holographic", "radio" belong to the finishing layer. A designer asked for them
  bakes in an uncontrollable version.
- **Restate the whole description in every round.** A second-round variant is
  the full description with one axis changed, never a delta ("same as before
  but lower"), because the designer remembers nothing between calls
  ([style is restated, not remembered](../../../_laws.md#style-is-restated-not-remembered)).

## The design text is part of the prompt

Designers also take a sample text the new voice reads in its preview, and that
text conditions the result: it is a performance script for the preview, and it
should complement the description rather than contradict it. A cheerful text
under a description of a grave voice gives a muddled preview. Use a text of at
least the designer's minimum length (often around a hundred characters) that
covers the working register and one contrast, written plainly, and hold it
constant across the whole slate.

## The knobs beside the prose

Most designers expose a prompt-adherence control (how strictly the description
is followed versus how freely the model improvises) and a seed. Hold both
constant across a slate so the descriptions are the only variable; raise
adherence when candidates ignore the description, lower it when every candidate
sounds like the same flat reading of the words. A high adherence setting can
itself make the voice sound artificial, so a synthetic edge that appears as
adherence rises is the knob, not the timbre. A designer usually returns
several previews per call; they are siblings of one description and are worth
hearing before writing another.

## When not to use it

When the voice is a clone, the description is metadata, not a control. When a
designer exposes typed controls (an age slider, an accent selector), those own
their channels and the prose stops repeating them.
