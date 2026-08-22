---
layer: technique
type: technique
subject: motion-quality-gating
technique: filmstrip-sampling-discipline
status: forged
laws: [a-verdict-is-bound-to-its-content, a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient]
shared_with: []
use_when: [feeding motion to a still-image critic, assembling frames from a capture directory, a critic reports defects nobody can see in the clip]
---

# Filmstrip sampling discipline

A still-image critic can judge movement — you lay out an ordered strip of frames and
ask it to read the spacing, the way an animator reads a flipbook. What it cannot do is
tell you that the strip you handed it is not the motion. The sampler is therefore not
plumbing in front of the instrument; it *is* half of the instrument, and three of its
properties are load-bearing because breaking any of them silently changes what is
judged while leaving the output articulate and confident.

## The three rules

**One naming family only.** A capture directory routinely holds more than one series:
a second camera angle, a rerun, a different capture stage that used its own prefix.
Detect the families present, pick exactly one by a declared preference order, and drop
the rest. Never merge. Merging two families produces a strip that alternates between
two viewpoints or two takes — a chimera nobody animated — and the critic will
faithfully report that the character teleports.

**Numeric order, never lexical.** Frame indices sorted as text put the tenth frame
directly after the second. Time reorders itself, the motion arc becomes incoherent, and
the failure looks exactly like bad animation. Parse the index out of the name as a
number and sort on the number.

**Even subsample that keeps the first and last frames.** When there are more frames
than the critic can take, thin them evenly — and pin the endpoints. The first frame is
the start pose that anticipation is judged against; the last is the settle that
follow-through is judged against. A naive "take every nth" drops one or both and
removes precisely the evidence for two of the six things you asked about. The even
sampler that keeps the endpoints is a two-line change and it is the difference between
a ruler that can see the settle and one that structurally cannot.

## Density is a dial with two ends

Sampling is the cost knob and the sensitivity knob at once. Sparse strips are cheap and
blind to fast events: an impact that occupies two frames falls between samples, and the
critic — correctly, given what it saw — reports that the hit has no weight. That defect
belongs to your sampler and it will be filed against the animator.

So set density per action class rather than globally. A class with a short critical
window — an impact, a snap, a cancel point — gets more frames across that window; a
long locomotion cycle does not need them. Where the sampling is uneven on purpose, say
so alongside the score, because an unevenly sampled strip misrepresents spacing, which
is one of the things being graded.

## Bind the score to the sample

The strip is the content the verdict actually judged. Record, with every score, the
number of frames, the layout, the family that was chosen and the sampler's version.
Two consequences follow and both are rules:

- **A sampler change invalidates prior scores.** Not because they were wrong, but
  because they are no longer the same quantity. Re-score before comparing across the
  change; a trend line that spans a sampler change is a fiction.
- **A strip that could not be assembled is not a fail.** Zero matching frames, a family
  that could not be resolved, a capture that never ran — each reports as *not sampled*,
  which blocks the verdict rather than producing one. A gate that cannot run says why.

## Decision rules

- **When both a wide and a close view exist, choose one and declare it.** They are two
  naming families and also two instruments; silhouette reads from the wide, weight
  often from the close. Two views means two scores, not one strip.
- **When frames carry no index at all, refuse.** Directory order and modification time
  are not time. There is no safe fallback ordering, and inventing one produces the
  lexical-sort failure with no name to blame it on.
- **When the strip is laid out as a grid, state the reading order in the instruction.**
  Left to right, top to bottom, one continuous action. Without it a grid is as likely
  to be read as a set of variants as a sequence.
- **Prefer the first frame of the source to a synthesised rest pose.** A prepended
  neutral pose the animator never authored will be scored as a real part of the motion,
  and it flatters anticipation.

## When not to use it

- **When the instrument accepts video natively and reasons over time.** If a critic
  ingests the clip itself, the sampling question moves inside the model, and your job
  becomes recording what its internal frame budget was rather than choosing frames
  yourself. Do not hand a native video critic a strip; you would be discarding the
  capability you are paying for.
- **For continuity or loop-seam defects.** Any subsample can step over a single-frame
  pop, so a strip cannot certify continuity. That needs a full-rate pass or a
  frame-difference measure, not a critic.
- **For duration, frame rate or timing measurements.** Those come from the clip's
  metadata. Counting frames in a strip and multiplying is a derivation with an invented
  factor in it.

## The failure this prevents

The instrument works, the scores arrive, and they are scores of a sequence that never
played: two takes interleaved, or time shuffled by a text sort, or the settle absent
because it was sampled away. Nothing downstream can detect it — every consumer sees a
well-formed card with plausible observations. This is the specific way a perceptual
gate goes quietly insane, and the only defence is that the sampling rules are explicit,
tested in isolation, and recorded next to every number they produced.
