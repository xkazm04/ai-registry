---
layer: technique
type: technique
subject: video-assembly
technique: drift-correction
status: forged
laws: [unmeasured-is-not-pass, edit-do-not-regenerate]
shared_with: []
use_when: [a narration or music clip sits off its mark, building a sync-adjustment control, deciding whether a sync problem is an offset or a rate mismatch]
---

# Drift correction

Drift correction is the practice of treating audio–video sync as a signed
number against a named mark, and fixing it by the smallest edit that zeroes
the number. Its two enemies are vagueness ("the voice feels late") and
overkill (re-rendering a clip whose only defect is that it starts 300 ms
after it should).

## Sync has thresholds, so drift has a scale

Human tolerance for sync error is asymmetric and small: sound arriving
*early* is detectable from roughly 45 ms; sound arriving *late* from
roughly 100–125 ms; broadcast practice holds audio within about 15 ms early
to 45 ms late. Three working consequences:

- **Milliseconds are the unit.** Frame-granular tools (a frame is 33–42 ms
  at common rates) can leave a clip inside one frame yet outside the
  early-sound threshold. The correction control works in sub-frame steps —
  increments of a few tens of milliseconds, with the current signed offset
  always displayed.
- **Early is worse than late.** When forced to land off-mark, land late.
  Sound before its cause reads as broken; sound slightly after reads as
  room.
- **Severity is stated, not felt.** 300 ms of narration drift is far past
  every threshold — audible to everyone. 30 ms late is inside broadcast
  tolerance. The display should let a reader make that judgment from the
  number.

## Offset versus rate: diagnose before touching

Two mechanisms produce "out of sync", and they have different fixes:

- **Constant offset** — the clip is uniformly early or late (a start
  mis-placed, a latency baked in upstream). One slide fixes it. Test:
  measure the error at the head and at the tail; equal error is offset.
- **Rate mismatch** — material at one rate on a clock at another, or an
  audio device's clock disagreeing with the picture's. Error grows with
  position: clean at the head, a hundred-plus milliseconds out by the tail.
  No slide fixes it; correct at the source (conform the rate, re-export),
  because an offset chosen to look right in the middle is wrong at both
  ends.

Measure against an anchor event where possible — a transient that exists in
both domains (a door, a beat, a plosive against lip closure) is worth more
than an impression of the whole clip.

## The correction protocol

1. **Every clip has a mark** — the time it is supposed to start, owned by
   the cut. Drift is defined as distance from the mark, so it is meaningless
   for material that never had one; place first, then measure.
2. **The offset is data, not gesture.** The dialled-in correction is stored
   on the clip and survives the session the same way any edit does. A
   correction that lives only in a control's local state is un-reviewable
   and un-shippable. Seed the control *from* the stored value — a clip
   nobody has touched reports exactly what the cut already says about it.
3. **The picture moves with the number.** Whatever displays the offset and
   whatever draws the clip must read the same value, so the bench and the
   ruler can never tell two stories.
4. **Provide snap-to-mark.** Incremental nudging converges slowly and can
   overshoot; returning to exactly zero must be one action, and zero must
   mean *on the mark*, not *where I started nudging*.
5. **Status follows the measurement.** A clip whose offset has been zeroed
   is shown as placed, not as a drifting clip somebody bandaged. Re-derive
   on every read; never store "drifting" as a permanent character trait.
6. **Correct, don't regenerate.** Slide the clip; do not re-render or
   re-synthesize material whose content is fine. Regeneration to fix timing
   discards every review the content has passed and may not even fix the
   timing.

## Decision rules

- When head and tail error differ, stop nudging and fix the rate at the
  source, because offset correction cannot repair a slope.
- When drift is within threshold (inside ~15 ms early / ~45 ms late), leave
  it, because chasing zero on every clip spends attention the audible
  defects need.
- When a correction would move a clip onto a neighboring clip, the problem
  is upstream (a duration wrong somewhere), not sync — surface it rather
  than absorbing it as overlap.
- When the same offset keeps appearing across many clips from one source,
  fix the source's latency once, because per-clip correction of a systematic
  error is toil that will miss one.

## When not to use this

Drift correction presumes the mark is right and the material is right, and
only their alignment is off. If narration was recorded against an old cut,
the fix is a re-take or a re-time decision, not a nudge — no offset makes
the wrong sentence land on the right picture. And intentional overhangs
(a music tail rung past picture, a sound bridging into the next scene) are
authored asymmetries, not drift; they carry intent in their note, and a
correction pass that "fixes" them has vandalized the mix.
