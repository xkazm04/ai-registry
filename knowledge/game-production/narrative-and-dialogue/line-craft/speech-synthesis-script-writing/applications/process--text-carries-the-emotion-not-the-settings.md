---
layer: application
type: application
subject: speech-synthesis-script-writing
technique: text-carries-the-emotion-not-the-settings
stack: process
status: forged
verified_on: 2026-10-04
---

# Voice settings against the documentation — Death Ride campaign voices

*Resolved 2026-10-04 against the `firetv-deathride` working tree (branch `deathride/main`, tip
`9ceb02d7`). Paths below are root-relative to that tree. Every cited line was re-opened and
re-read on that date.*

Death Ride synthesises part of its campaign dialogue with ElevenLabs. Its dialogue research
dossier (R3, section A13 "Writing for the ear and for ElevenLabs") tabulates what the vendor
documents per model generation, and the project's voice wave records the settings it actually
used. Putting the two side by side is the reconciliation this application makes. The vendor
pages were not re-read for this document (web search was exhausted for the pass); the
documentation claims below are the dossier's reading of them. The game has not been played, and
no line's delivery has been judged by a listener.

## The current setup

- `docs/concepts/deathride/X3-4-campaign-voices.md:14 "settings (stability .55, similarity .75, style .30)"` — the Announcer, chosen as "noir".
- `docs/concepts/deathride/X3-4-campaign-voices.md:15 "(stability .45, similarity .75, style .25); hesitant syntax"` — the Mechanic, continuing
  `docs/concepts/deathride/X3-4-campaign-voices.md:16 "and short breaths suggest nervous helpfulness. These settings do not prove that"`.
- `docs/concepts/deathride/X3-4-campaign-voices.md:17 "Model remains"` the older multilingual generation, confirmed per request at
  `deathride/audio/x3/voices/acceptance.json:28 "eleven_multilingual_v2"` and
  `deathride/audio/x3/voices/acceptance.json:957 "0.25"` (the Mechanic's style on his welcome line).

## The documentation as the dossier reads it

- Style: `docs/narrative/research/R3-dialogue-craft.md:210 "Recommended at 0 [4]"`, for both generations.
- Speed: `docs/narrative/research/R3-dialogue-craft.md:211 "0.7 to 1.2. Extreme values degrade quality [1]"`, and absent on the newer generation.
- Stability on the newer generation becomes presets:
  `docs/narrative/research/R3-dialogue-craft.md:209 "Presets: Creative, Natural, Robust."` — rated medium, from secondary guides:
  `docs/narrative/research/R3-dialogue-craft.md:444 "Source 5 is secondary and should be checked against the live ElevenLabs UI."`
- Emotion on the older generation comes from narrative context, at a cost:
  `docs/narrative/research/R3-dialogue-craft.md:205 "These tags are spoken and must be cut in post [1]"`;
  on the newer, bracketed tags, which
  `docs/narrative/research/R3-dialogue-craft.md:207 "v3 may read a tag aloud when it doesn't suit the voice"`.
- For the model in use: `docs/narrative/research/R3-dialogue-craft.md:200 "where v3 audio tags are not documented [33]."`
- Casting: `docs/narrative/research/R3-dialogue-craft.md:221 "Cast for the emotional range the character needs."`

Sources: ElevenLabs TTS best practices
(https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices), Audio Tags 101
(https://elevenlabs.io/blog/v3-audiotags), Text to Dialogue
(https://elevenlabs.io/docs/overview/capabilities/text-to-dialogue), the Text to Speech product
guide (https://elevenlabs.io/docs/eleven-creative/playground/text-to-speech), and secondary
guides on the newer generation's presets (https://inference.sh/blog/guides/elevenlabs-v3-voice-cloning-fix,
https://help.artlist.io/hc/en-us/articles/33143492937757-Elevenlabs-Eleven-v3).

## Reconciliation against the technique

**Confirmed.** Settings are global and generation-specific; emotion written as narrative context
or as a speech-verb adverb is spoken
(`docs/narrative/research/R3-dialogue-craft.md:266 "In TTS context, it gets spoken."`); a tag
pushes a voice past its range at a cost
(`docs/narrative/research/R3-dialogue-craft.md:90 "an angry tag on a soft voice can also misfire"`);
newer-generation tags do not belong in lines for the older generation
(`docs/narrative/research/R3-dialogue-craft.md:386 "audio tags in v2 lines"` is on the
blacklist). The project itself is honest that a setting is a hope about delivery, not a
measurement of it (line 16 above).

**Deviation (the project falls short of the standard).** Both voices run style exaggeration at
0.30 and 0.25 against a documented recommendation of 0, with no written reason for the departure
beyond the "noir" and "nervous" intent. The dossier tabulates the recommendation and the project
setting in separate places and does not flag the conflict.

**Upward lesson — the trait pursued twice.** The Mechanic's nervousness is sought through the
settings (the lower stability of the two voices) and through the text at once: line 15's
"hesitant syntax" and the dossier's voice bible
(`docs/narrative/research/R3-dialogue-craft.md:64 "Mechanic, who speaks in fragments and hedges"`).
The Mechanic's lines run a silence share of about 0.18 to 0.56 against the Announcer's 0 to
0.20, and his most fragmented line failed the silence ceiling (see the companion application on hesitation marks).
Which owner caused it is not separable from one take per line, but the technique now names the
double owner as the failure to avoid.

## Death Ride use

Each voice is re-baselined as a voice-level decision with style at 0 (or a written reason to
keep it), the Mechanic at a stability no lower than the Announcer's, and every approved line in
that voice re-heard afterwards, because the change re-performs all of them. Nervousness then
lives in the Mechanic's words — smaller vocabulary, one hedge, one fragment at most — not in a
looser voice. Lines stay free of bracketed tags while the older generation is in use, and the
voice-bible template's TTS row
(`docs/narrative/research/R3-dialogue-craft.md:355 "tag range the voice can carry;"`) is filled
per voice before any tagged line is written for a newer generation. None of this has been
rendered or heard yet.
