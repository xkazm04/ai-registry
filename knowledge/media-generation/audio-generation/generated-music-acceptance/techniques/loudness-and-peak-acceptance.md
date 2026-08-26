---
layer: technique
type: technique
subject: generated-music-acceptance
technique: loudness-and-peak-acceptance
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [generated cues differ audibly in level across one production, delivering audio to a platform or broadcaster with a loudness spec, a track distorts after transcoding, setting the measurement pass for delivered audio]
---

# Loudness and peak acceptance

Generated tracks arrive at whatever loudness the model's training mix
implied — routinely hot, and inconsistently so between takes, which means a
production that strings three generated cues together without measuring
them ships audible level jumps it never decided. Loudness is the most
mechanically checkable property audio has, with standardized units and
free tooling, so it is the clearest case of the measurement law in the
whole modality: a delivered file either was measured or it was not, and an
unmeasured file did not pass.

## The three numbers, and what each governs

- **Integrated loudness (LUFS)** — perceived level over the whole program.
  This is the delivery target: streaming platforms normalize to the
  neighbourhood of −14 LUFS; broadcast delivery specs sit near −23/−24
  LUFS depending on region; theatrical and trailer chains run their own,
  louder regimes with their own compliance measures. The target is a
  property of the **destination**, not of the track — the same cue is
  mastered to different numbers for different outlets, and the acceptance
  question is "at the target for where this ships", never "loud enough".
- **True peak (dBTP)** — the ceiling. Inter-sample peaks that clear
  digital full scale distort on decoding and transcoding; keep true peak
  at or under −1 dBTP, and allow more headroom (−2 dBTP) when the
  destination will transcode to lossy formats, which reconstruct peaks
  hotter than the source stored them.
- **Loudness range (LRA)** — how much the level moves over the piece. Not
  a compliance number, but the diagnostic for two generated-music habits:
  a crushed take with almost no range that fatigues at any level, and a
  cue whose briefed build never made it into the dynamics.

Every number is recorded **with its basis** — integrated versus
short-term, measured over what span, against which destination target —
because "−14" with no basis is a different kind of unmeasured.

## Normalize at the mix, accept at the gate

The acceptance gate does not fix levels; it verifies them. Level *matching*
across cues — so cue 2 does not step out of the production — is mix work,
done once loudness is known; the duck under narration is automation the
assembly craft owns. What acceptance owns is refusing to pass a file
nobody measured, and refusing "it sounds fine at my desk" as a substitute:
monitoring level, room, and the ear's adaptation all move what "fine"
means, and none of them move a meter.

## Decision rules

- When a cue joins a production, measure integrated loudness and true peak
  before any creative listen, because the creative listen is itself
  distorted by an unmatched level — louder reads as better.
- When the destination is unknown at acceptance time, master and measure
  to the most conservative plausible target and record the number, because
  turning a quiet master up is trivial and un-crushing a hot one is not.
- When a file passes the meter but distorts anywhere downstream, check
  true peak against the transcoded path, because lossy encoding is where
  compliant-looking peaks go to clip.

## When not to use this

Nothing skips this gate on the delivery path — it is the cheapest check in
the subject. What does not need it: disposable exploration candidates that
will never touch a timeline, and comparative listens *between* takes,
which need matched levels rather than target levels (match them to each
other, judge, then master the winner to the destination).
