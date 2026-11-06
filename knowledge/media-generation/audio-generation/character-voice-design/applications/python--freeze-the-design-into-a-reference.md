---
layer: application
type: application
subject: character-voice-design
technique: freeze-the-design-into-a-reference
stack: python
status: forged
verified_on: 2026-11-06
verified_against: python@3.12
---

# A local voice studio that casts by description and never freezes

Voicebox is an open-source, local-first voice studio whose Python backend wraps
nine speech engines behind one registry. Citations resolve against commit
`8af7efe62fab8d33e2a5dfbedabaa45f68a5184f` (release 0.6.0 plus a month of
unreleased work). The stack witness is the `justfile`'s interpreter pin,
`python_version := "3.12"` (`justfile:23`). It is the negative instance of the
technique: it ships an open designer with no save step, and builds none.

## A designed voice is its description, re-read on every line

The unreleased "Describe a voice" source creates a profile of type `designed`
backed by an open design model; the changelog calls it "a third source ... next
to clone-from-audio and built-in voice" and states that "A per-generation
instruct layers onto the description instead of replacing it"
(`CHANGELOG.md:12`). The profile's voice prompt is the prose itself
(`backend/services/profiles.py:616-622`: "Designed profiles: return text
description"), and the backend sends it to the designer on every generation
(`backend/backends/qwen_voice_design_backend.py:191-201`). Nothing renders a
reference, nothing stores one, and nothing routes a designed profile to a
clone engine. A seed is honoured when the request carries one (`:204-207`),
which repeats a line and does not hold the person across lines.

## Direction is written into the identity

The same lines are the direction channel. The backend's own comment states the
trade it took: "For this model `instruct` carries the voice identity itself, so
the profile's description has to lead. A per-request instruct is appended so
style tweaks layer on rather than replacing the designed voice" (`:193-196`),
producing `f"{design_prompt.rstrip('. ')}. {instruct}"` (`:199`). Putting the
description first is the best that can be done inside one prompt, and it is
still one prompt: a line directed "furious" is drawn from the neighbourhood
of the description plus "furious", which is a different neighbourhood.

## The clone side shows what the freeze would cost

The tree also carries everything a freeze would need, and its registry
records what each piece would give up:

- The permissively licensed clone engine is flagged `supports_instruct=False`,
  with the comment "Base model drops instruct silently"
  (`backend/backends/__init__.py:272`). The model's own documentation shows the
  same: instruction control is listed for the design and preset variants, not
  for the clone variant, and it recommends designing a reference and cloning
  from it "when you want a consistent character voice across many lines".
- A second clone engine takes its expressiveness from fixed per-language
  defaults (`backend/backends/chatterbox_backend.py:157-170`, `exaggeration`
  0.4-0.5), not from the request.
- A third clones and reads inline non-verbal tags, and is English-only
  (`backend/backends/chatterbox_turbo_backend.py:4`).
- The one engine that clones, designs and takes free-text direction is labelled
  non-commercial in its display name, with the reason in a comment: "the
  OmniVoice weights are CC-BY-NC ... Keep the label visible and never make this
  engine a default" (`backend/backends/__init__.py:435-439`). The label is the
  whole enforcement; nothing in the registry is a licence field a caller could
  filter on.

So for a production that needs licence-clean weights and a stable cast, the
tree's own catalogue forces the technique's decision: freeze into a clone engine
and carry delivery in the text and the tags, or keep per-line direction and
accept a voice that moves with it.

## What a production taking this tree should add

One step and one field. The step: when a designed profile is cast, render a
neutral reference from it once, store the clip, and resolve the profile to a
clone engine with that clip from then on. The field: a licence attribute per
engine configuration, so "non-commercial" is something a production can refuse
rather than read.
