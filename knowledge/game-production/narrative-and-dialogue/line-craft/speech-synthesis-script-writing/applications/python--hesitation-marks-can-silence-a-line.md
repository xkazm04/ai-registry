---
layer: application
type: application
subject: speech-synthesis-script-writing
technique: hesitation-marks-can-silence-a-line
stack: python
status: forged
verified_on: 2026-10-10
applied: experiment
ab_verdict: unmeasurable
---

# Death Ride: the silence screen, the owner's keep, and the rewritten Mechanic

This application reads the code that screens rendered voice clips, the record of what happened
when a listener overruled it, and the rewritten script that followed. The tree is the `firetv`
repository's `deathride/main` branch at `d9990777`, read on 2026-10-10. Anchors are
root-relative to that tree. The `process` application beside this one reads the same failure
from the research dossier. Nothing has been played by a person, and no audio was rendered for
this pass.

## The screen states its basis and refuses to retime

The meter's silence rule carries its threshold and minimum gap in the code:
`deathride/tools/audio/measure-audition.py:49 "Each interval must remain below -50 dBFS in every channel for >=100 ms."`
The mastering step fails a speech clip over 45 percent:
`deathride/tools/audio/master-x3.py:49 "silence=silence['fraction']<=(.45 if category=='tts' else .35)"`.
Before measuring, it trims only edge silence and codec residue, and it says why:
`deathride/tools/audio/master-x3.py:195 "Preserve interior speech pauses. This is an edit, never a waived gate."`
This is the technique's screen as written, with the basis stated, edges handled apart from the
interior, and no retime to pass.

## A listener kept the failed clip, and the record kept both

On 2026-10-03 the owner listened to all fourteen voice clips on the review page and kept every
one:
`docs/concepts/DEATH-RIDE-OWNER-DECISIONS-2026-10-03.md:69 "No rejections there."`
That includes the Mechanic's seizure line, which had failed the screen at 55.5 percent silence.
The game ships it with the keep and the failure side by side. The manifest marks it
`deathride/assets/audio/cues.json:1463 "owner-accepted"`, and the audio validator refuses any
manifest where that pairing is lost:
`deathride/tools/audio/validate-owner-audio.py:73 "delivered paused voice must retain honest status"`.
The validator also proves that it can catch the loss, with a mutation case that flips the
clip's technical status to pass:
`deathride/tools/audio/validate-owner-audio.py:106 "technical failed silence hidden"`.

This answers what the technique left open: when a person keeps a clip the screen failed. The
keep is recorded *beside* the failure, not instead of it, and a check guards the pair. Two
cautions sit with it. The keep was given on a review page, not at the playback condition this
subject asks for, so it is a desk verdict. And the manifest's own delivery field was never
updated: every one of the fourteen voice cues still says `owner listening pending` next to
`Keep`. The `process` application of 2026-10-04 cited that stale field and reported the line as
unheard. It was corrected on this pass.

## The rewrite adopted the marks rule, not the fragments rule

The 518-line script written on 2026-10-04 replaces the seizure line
(`deathride/narrative/lines.csv:294 "recorded;replaced-by:shop.seizure.1"`) and rewrites the
Mechanic throughout. Counted over his 91 lines in play (rows not retired, not `rec.*`):

- Hesitation **marks** have almost gone. No line has more than one mark, filler or repeated
  sentence, and four have one, for example
  `deathride/narrative/lines.csv:285 "Okay. Okay. The rig's warm. I warmed it when I saw him on the road."`.
- Sentence **boundaries** have not. 18 lines have three or more interior boundaries.

Priced at the Mechanic's measured boundary cost, 7 of the 91 lines are predicted at or above
the 45 percent ceiling. The cost is a median 0.70 seconds of silence per interior boundary and
0.232 seconds of speech per word, from his eight rendered lines (see the `kotlin` application
on length). Five of those seven have no mark at all, so a marks-only count passes them:

- `deathride/narrative/lines.csv:488 "He's following. Good. Let him."`
- `deathride/narrative/lines.csv:281 "Good paper, his. Heavy. Doesn't compress."`
- `deathride/narrative/lines.csv:239 "Nothing owed. I wrote it on the wall. Small. In pencil. In case."`
- `deathride/narrative/lines.csv:489 "You've stopped. So has the drum. Roll."`
- `deathride/narrative/lines.csv:500 "He won't stop. He can't. Keep rolling."`

The other two carry a filler or a repeat
(`deathride/narrative/lines.csv:273 "Ennis. Nobody's asked in, um. A while."`,
`deathride/narrative/lines.csv:492 "That one was ours. Sorry. Sorry. Keep going."`).
Three of the seven are directed "calm for once, low and steady". On the engine generation in
use, that direction reaches the voice only through the words, and the words are fragments.

## Verdict: unmeasurable, and why

The question was whether counting boundaries screens better than counting marks. On the fourteen
rendered clips the two screens tie. Each flags only the seizure line, because that line has both
an ellipsis and four boundaries, so the ground truth cannot tell them apart (n = 14, one failure).
On the 91 drafts the boundary screen flags lines the marks screen passes, but none of those lines
has been rendered. The forecast is also fragile. At the lowest and highest boundary prices the
Mechanic produced (0.34 and 0.91 seconds), the same census flags 0 and 16 lines. Six of the
seven flagged lines are shorter than any rendered calibration line (5 to 8 words against 10 to
17), and in a short line one pause is a large share of the clip.

Return condition: when the Mechanic's draft lines are synthesised, compare the silence share of
the seven flagged lines with the other 84 under the same screen. If the flagged lines do not
fail more often, the boundary count is a weaker screen than the technique claims and gains that
condition.

## Death Ride use

Before any paid render of the Mechanic, run the boundary count beside the marks count and listen
to the flagged lines first. Merge fragments where the meaning allows, for example "He's
following, good. Let him." Refresh the fourteen stale `identityAndDelivery` fields to the
owner's keep, so that the next reader does not repeat the 2026-10-04 mistake.
