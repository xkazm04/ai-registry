---
layer: application
type: application
subject: character-voice-design
technique: casting-slate-spread
stack: process
status: forged
verified_on: 2026-10-28
---

# Two casting rounds with a text-to-voice designer: a robot companion and an AI-guide character

Both rounds ran on one owner's ElevenLabs Creator account, back to back:

- **Round A, 2026-10-27:** the voice of bp's desktop companion. It is anchored in bp at
  `672bc7a9198cc9cc873d4b4b81548d9e9cdf6f75`.
- **Round B, 2026-10-28:** a voice for an unrelated project, a female AI companion that guides one person in the
  manner of a classic sci-fi AI character. It ran from scratch scripts outside any repository. Its facts are dated
  observations from that session, not anchors.

Both rounds used the same two calls: a design call (`eleven_ttv_v3`), then a save to the library. Audition lines were
read with `eleven_v3` under the stored voice.

## Round A: a slate of archetypes

`docs/blueprint-ui.md:1067 "cast from ten ElevenLabs Voice"`. The ten descriptions were ten different robot archetypes:
- classic unit;
- warm android;
- deep mainframe;
- crisp assistant;
- vintage tin-can;
- vocoder synth;
- quiet drone;
- butler;
- glitch;
- ship computer.

Every candidate shared one design sentence, seed 7 and guidance 6. Three were shortlisted, saved, and each read four
situation lines: a morning check-in, a decision request, a gate warning and a wrap-up. A consistency test then chose the
read settings.

- **Confirmed:** constants held across the slate (one design text, one seed, one guidance), and the round narrowed to a
  shortlist before any line was produced.
- **Deviation:** the slate spread across archetypes rather than along named axes around a canonical description. That
  finds a region well, as it did here, but it cannot say which property made the winner win.
- **Deviation:** every description asked the designer for the treatment ("metallic", "vocoder", "robotic") and the
  page also adds a robot effect, `docs/blueprint-ui.md:1068 "then run through a light robot effect on"`. Two
  authorities own one channel. The finishing-effect-layer technique keeps the standard: describe a human voice, and
  let the chain own the machine.

## Round B: a slate designed for spread

- **The brief.** The character was read into a vocal brief first:
  - timbre: a woman around 30, neutral American, mid register, slight husk, crisp diction;
  - delivery: sarcasm, tenderness, the strain of a degrading arc;
  - treatment: synthetic shimmer and comms band, sent to an effect chain.

  The brief named no character and no performer. It described attributes only, and said up front that the result would
  evoke the character rather than copy its actor.
- **The slate.** Ten descriptions:
  - one canonical candidate ("Core - confident wit");
  - axis variants: register and texture, age (mid-20s bright, late-30s seasoned), warmth, energy;
  - register-led variants: tactical comms, protective whisper, fraying edge, cinematic narrator.

  Every candidate used design seed 11, guidance 5 and one design text of about 290 characters.
- **The audition set.** Five original lines of 5 to 12 s: tactical callout, teasing, protective, wonder and fraying.
  Each used one or two audio tags (none in the wonder line). They were read at stability 0.5 with seed 4242. All 60
  renders (10 design reads plus 50 lines) succeeded on the first pass. The account's character counter moved by
  5,420 for the whole round.
- **The board.** An HTML page:
  - grouped by voice, with one column per line;
  - a "play across all voices" control per line;
  - per-voice picks and per-take stars, exported as text;
  - a Clean / Hologram / Comms toggle, a browser-side effect chain over the same takes.
- **The decision.** The owner picked **Tactical comms** after one round, a register-led variant rather than the
  canonical candidate. The round converged without a second slate.
- **What was locked.** The winner was exported as a locked record:
  - the description, design text, seed and guidance;
  - the read model, stability, seed and format;
  - the effect presets, and the five reference clips;
  - two rebuild paths (instant clone from the clips, or redesign from the record) and an acceptance check.

  That is the design record that round A's tree lacks.

Deviations recorded:
- The board was labelled, not blind, and the takes were not loudness-matched. This deviates from the listening-board
  technique in the generated speech acceptance subject.
- The design text reused material from two audition lines. So the design read was not fully independent of the lines
  it was compared with.

## Upward lesson

**A register-led variant can beat the canonical reading.**
- The winner was built around the character's working register (calm guidance in someone's ear), not around the
  personality summary.
- This is why the technique puts one or two register-led candidates into the first slate, beside the axis variants.

This is a measurement of one owner's choice (n = 1), not a rule about every character.
