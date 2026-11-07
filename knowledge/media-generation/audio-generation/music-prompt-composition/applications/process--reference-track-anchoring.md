---
layer: application
type: application
subject: music-prompt-composition
technique: reference-track-anchoring
stack: process
status: forged
verified_on: 2026-11-06
refresh_by: 2027-02-06
applied: experiment
ab_verdict: unmeasurable
proof: ab-paired
---

# Process: how much of a reference survives the notation route, on YuE2

A tutorial demonstrates this model's cover route and says the output "followed the [shape]
of the reference, but it's not a copy". The caption reads "sheep", which we take to mean
shape. The same tutorial later warns against copying a song this way. The vendor guide,
read directly on 2026-11-06, describes the route: "The workflow does not feed the reference
audio to YuE2 directly", a transcriber produces a melody score, and "the connection to the
original song is the melody".

## What was measured

A local run on 2026-11-06, n=1, used one of our own generated songs as the reference, so no
third party's work was rendered. Distances are against that reference. Notes is 1 minus
chroma cosine per bar, and sound is mean absolute log-mel difference per bar.

| Pair | Sound | Notes | Length |
|---|---|---|---|
| Different style and lyrics, no reference | 1.50 | 0.407 | 137.12 s |
| Different style and lyrics, reference's melody notation | 0.90 | 0.107 | 120.68 s |
| For scale: reference's own notation at a new seed | 1.02 | 0.143 | 119.68 s |

Transcribing 120 s of reference took 6.3 s of engine time (n=1).

## What the authors report

The model card's cover benchmark covers 948 works, two styles and two seeds, for 3,792
songs per method. With the full score, CLEWS mAP is 0.647 and Hit@1 is 71.3%. Without a
score it is 0.006 and 0.3%. Without chords it is 0.598 and 67.3%. Paper section 5.3 frames
the test as "a supplied composition must remain recognizable in a different style". These
are the vendor's own figures on a benchmark it chose, and they were not reproduced here.

## What it says

"Not a copy" holds only for the audio. The melody is what this route exists to keep, and
it did. The authors' benchmark also shows the cost on the other side: style similarity and
musicality scores are higher without the score, so the card itself says "Identity and
quality should be read together".

## What it does not settle

- **The law.** This document gives no legal reading of any output.
- **How it sounds.** No person listened to these takes, and the verdict is `unmeasurable`
  until a blind listening pair exists. Vocal quality and lyric fit were not measured.
- **Reach.** One song, the model's own output as the reference. A human-recorded reference
  may transcribe worse.
