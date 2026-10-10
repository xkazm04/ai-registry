---
layer: application
type: application
subject: speech-synthesis-script-writing
technique: hesitation-marks-can-silence-a-line
stack: process
status: forged
verified_on: 2026-10-10
---

# The Mechanic line that rendered as silence — Death Ride campaign voices

*Resolved 2026-10-04 against the `firetv-deathride` working tree (branch `deathride/main`, tip
`9ceb02d7`). Paths below are root-relative to that tree. Every cited line was re-opened and
re-read on that date. Re-checked 2026-10-10 at tip `d9990777`: every anchor still holds, and the
owner's listening status below is corrected.*

Death Ride is a vehicular-combat racing campaign for Fire TV, played from the sofa. Some of its
story lines are synthesised with ElevenLabs on the `eleven_multilingual_v2` model: an Announcer
(account voice "Callum") and a young, nervous Mechanic who runs the parts store (account voice
"Harry"). The game has not been played by anyone, so nothing below was heard in play; what
exists is fourteen rendered lines with measurements, one failure, and a dialogue research
dossier (R3) that turns the failure into a writing rule. Web search was exhausted for this
pass, so the vendor pages the dossier cites were not re-read here; the vendor claims below are
the dossier's reading of them.

## The failure as measured

The Mechanic's seizure line, as written before synthesis:

- `deathride/audio/x3/voices/SCRIPT.md:71 "He took your car? Right. Right... I thought he might. Come round the back."`
- `deathride/audio/x3/voices/acceptance.json:1620 "He took your car? Right. Right... I thought he might. Come round the back."` — the exact request text.
- `deathride/audio/x3/voices/acceptance.json:1621 "eleven_multilingual_v2"`, rendered at
  `deathride/audio/x3/voices/acceptance.json:1623 "0.45"` stability and
  `deathride/audio/x3/voices/acceptance.json:1625 "0.25"` style.

The edited clip's silence measurement, with its basis:

- `deathride/audio/x3/voices/acceptance.json:1748 "-50"` dBFS counted as silence, and
  `deathride/audio/x3/voices/acceptance.json:1749 "0.1"` seconds as the shortest gap counted,
  after `deathride/audio/x3/voices/acceptance.json:1702 "-45 dBFS edge trim with 10 ms margin"`.
- `deathride/audio/x3/voices/acceptance.json:1768 "0.5552423610574819"` silence share, and
  `deathride/audio/x3/voices/acceptance.json:1769 "1.0732879818594103"` seconds for the longest
  interior gap. The four interior intervals (lines 1750 to 1766) are each roughly 0.9 to 1.1
  seconds in a 7.05-second clip.

The project's own account:
`docs/concepts/deathride/X3-4-campaign-voices.md:35 "long interior pauses and 55.52% measured silence, above the 45% voice ceiling;"`
and its handling:
`docs/concepts/deathride/X3-4-campaign-voices.md:36 "it remains a visible failed candidate, with caption and silent fallback in data."`
followed by
`docs/concepts/deathride/X3-4-campaign-voices.md:37 "No threshold waiver, hidden retime or paid retry."`

## What the dossier makes of it

The dossier states the vendor guidance on pauses for the model in use —
`docs/narrative/research/R3-dialogue-craft.md:204 "can cause instability"` (about too many
break tags) — and turns the failure into a rule:
`docs/narrative/research/R3-dialogue-craft.md:216 "55.52% silence against a 45% ceiling [33]. Cut hesitation marks first."`
Its checklist and blacklist carry the same rule:
`docs/narrative/research/R3-dialogue-craft.md:373 "at most one capitalised word and one hesitation mark"`;
`docs/narrative/research/R3-dialogue-craft.md:261 "and long TTS silences (A13)"` (piled
ellipses and dashes); and its revision protocol checks silence after synthesis:
`docs/narrative/research/R3-dialogue-craft.md:402 "Check pronunciation locks and silence against the 45% ceiling"`.
Sources: ElevenLabs TTS best practices
(https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices) and the
project file X3-4; the dossier rates the vendor rows high confidence
(`docs/narrative/research/R3-dialogue-craft.md:226 "**Confidence: high** for rows from ElevenLabs pages"`).

## Reconciliation against the technique

**Confirmed.** One hesitation mark per line, hesitation as a cause of silence, a silence screen
that states its threshold and minimum gap, and a failed clip kept visible with caption and
silent fallback instead of being retimed to pass.

**Upward lesson — fragments count.** The failing line has only one ellipsis, yet four gaps of
about a second, which is one at nearly every sentence boundary of a five-sentence,
fourteen-word line. Computed on 2026-10-04 from each line's `edited.silence` fields in the same
file, the Mechanic voice runs a silence share of about 0.18 to 0.33 on its passing lines with a
longest gap of 0.41 to 0.94 seconds (for example
`deathride/audio/x3/voices/acceptance.json:1082 "0.9436281179138322"` on the welcome line), while
the Announcer voice runs 0 to 0.20 with a longest gap of at most 0.54 (for example
`deathride/audio/x3/voices/acceptance.json:614 "0.0"` silence on its own seizure line, two
sentences). The two voices also differ in settings (below, and in the companion application on
settings), so voice and settings are not separable here. The
Mechanic's four-sentence rig line
(`deathride/audio/x3/voices/acceptance.json:1801 "It is basic. I know. But I fitted a mine dispatcher."`)
passes at `deathride/audio/x3/voices/acceptance.json:1946 "0.2862925099102858"`. So the
seizure line's excess sits in its fragmented, repeated, questioning shape on a voice that holds
boundaries long, not in the ellipsis alone. The technique now counts fragments and repeats as
hesitations and prices a boundary per voice.

**Deviation (the dossier falls short).** "Cut hesitation marks first" is the right first move
but an incomplete diagnosis: removing the one ellipsis from this line would leave four sentence
boundaries on a long-pausing voice. The dossier's voice bible also asks for the very shape that
failed —
`docs/narrative/research/R3-dialogue-craft.md:64 "Mechanic, who speaks in fragments and hedges"`
— without noting the synthesis cost. And no rewrite has been rendered, so the cause is not
traced: one take, no retry.

## Death Ride use

The seizure line is rewritten before any paid retry, as a text change and not a settings
change, for example to two sentences with the hedge in the words: "He took your car. I thought
he might — come round the back." That rewrite is a proposal, unrendered and unheard. The voice
bible's "fragments and hedges" for the Mechanic is spent as one fragment per line at most. The
45% ceiling, its -50 dBFS basis and its 0.1-second minimum stay in the screen, and the Mechanic
voice's boundary price (most of a second) goes into the brief of any generator drafting his
lines.

**Corrected 2026-10-10.** This application said owner listening was still pending, citing
`deathride/audio/x3/voices/acceptance.json:1608 "listening pending"`. That field predates the
owner's pass. On 2026-10-03, a day before this application was written, the owner listened on
the review page and kept all fourteen clips, this one included
(`docs/concepts/DEATH-RIDE-OWNER-DECISIONS-2026-10-03.md:69 "No rejections there."`). The game
ships the clip as kept, with its silence failure retained and guarded by a validator. The script
of 2026-10-04 has since replaced the line for a story reason, not a silence one
(`deathride/narrative/lines.csv:294 "recorded;replaced-by:shop.seizure.1"`). The `python`
application beside this one reads the keep and the rewrite.
