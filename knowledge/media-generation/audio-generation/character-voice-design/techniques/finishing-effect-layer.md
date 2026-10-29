---
layer: technique
type: technique
subject: character-voice-design
technique: finishing-effect-layer
status: forged
laws: [typed-input-owns-its-channel, unmeasured-is-not-pass]
shared_with: []
use_when: [a character must sound like a machine, a hologram, a robot or a voice over a radio, a designed voice came back muddily robotic, deciding whether to apply a voice effect at playback or bake it into files]
---

# Finishing effect layer

What makes a voice sound artificial is a treatment applied to a human-sounding
voice, not a property to ask a designer for. Designers render "robotic",
"metallic" or "holographic" unevenly: some candidates carry a little, some a lot,
some none, and whatever they carry cannot be removed, retuned or compared clean.
An effect chain owned by the production can do all three, and once it owns the
channel the description stops describing it
([a typed input owns its channel](../../../_laws.md#typed-input-owns-its-channel)).

## Chains by character type

Each chain is small, parameterised and identical on every line. Values are
starting points to tune by ear, not standards.

- **Artificial intelligence, warm.** A light chorus or short modulated delay
  (around 15 to 25 ms, slight detune, mostly dry), a gentle high shelf for air,
  and a short bright room. It reads as synthetic without distancing.
- **Robot, playful or retro.** A high-pass to thin the low end, a presence lift,
  one or two very short echo taps (a few milliseconds apart) for a metallic ring,
  and a fast amplitude tremolo for buzz.
- **Comms or radio.** A band-pass around the telephone band (roughly 300 Hz to
  3.4 kHz), light saturation, optionally a squelch at line ends. It is a
  *context* variant of whatever chain the character uses, not a second voice.
- **Hologram or projection.** The warm chain plus a slightly longer, wetter
  room and a little more chorus; shimmer comes from modulation, not from a
  description.

## Rules

- **Audition the chain on the casting board.** The board offers clean and
  treated as a toggle over the same takes, so each candidate is judged both
  ways. A voice that is best clean is not necessarily best treated: treatment
  rewards clear diction and penalises breathiness.
- **Ship the chain that was auditioned.** The chain's parameters are written
  down once and the board, the bake step and the runtime player all read that
  one definition. A chain re-tuned by ear in a second place drifts from the one
  the owner approved.
- **Prefer playback-time application when the runtime allows it.** The stored
  audio stays clean, the chain can be retuned without re-rendering, and a muted
  or accessibility mode can drop it. Bake into files when the target cannot run
  the chain (a platform audio pipeline without effects, a distribution format),
  and keep the clean renders beside the baked ones.
- **Expect the chain to mask small take differences.** A consistent treatment
  hides minor variation between renders, which helps consistency and hides
  defects equally. Acceptance listening for dropped words or mispronunciations
  happens on the clean render
  ([unmeasured is not pass](../../../_laws.md#unmeasured-is-not-pass)).
- **Keep intelligibility above effect.** If a listener has to strain, the chain
  is too wet. Test the treated voice on the hardest token line of the audition
  set.

## When not to use it

A character that is a person needs no treatment layer; a "warm human assistant"
brief is satisfied by the timbre alone. When the brief explicitly wants the
artificial quality to be part of the timbre (a voice that is unsettling because
it is not quite human), it can be described, but then it is auditioned clean like
any other timbre trait, and no chain doubles it.
