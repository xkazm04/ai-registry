---
layer: technique
type: technique
subject: live-system-demo-film
technique: audio-first-beat-pacing
status: forged
laws: [typed-input-owns-its-channel, unmeasured-is-not-pass]
shared_with: []
use_when: [pacing a captured demo against synthesised narration, deciding how long a beat's picture should hold, a demo film runs longer or shorter than its voice track, choosing between an estimated and a measured clip length]
---

# Audio-first beat pacing

The narration is generated first, its clips are **measured**, and only then is
anything captured. The picture is held per beat for

> `max(measured clip, settle) + breath`

timed from the moment the beat's actions **start**. Those two words — measured,
and start — are the entire technique, and each of them replaces a habit that
looks harmless and is not.

## Why the voice goes first

A picture captured before its narration exists has to be fitted to the voice
afterwards, and there are only two ways to do that: speed the voice up, or
re-time the picture by hand. The first damages the artifact the audience is
actually following; the second is an editing session, and an editing session is
a cost paid again on every re-shoot, which is how a demo film stops being
re-shot and starts being stale.

Generating the voice first inverts the dependency. The narration becomes a set
of clips with known lengths before the recorder runs, so the recorder can simply
wait the right amount per beat. Sync is then not a correction applied later; it
is a property of how the take was made. Nothing drifts, because nothing was ever
placed by eye.

## The formula, clause by clause

**`measured clip`** — the real duration of the rendered narration for this beat,
read from the audio itself. Not the word count, not the character count, not the
provider's estimate at request time.

**`settle`** — the minimum the picture needs to be legible regardless of the
voice: an animation completing, a spinner clearing, a list re-sorting, a
reader's eye travelling to a region that just changed. It is a **floor**, not an
addend, which is why the formula takes a maximum and not a sum. A four-word line
over a screen that just replaced itself still owes the audience time to look;
equally, a long line over a static screen should not add the settle on top and
leave the film dawdling.

**`breath`** — a small constant added to every beat. It does three jobs: it
stops one beat's audio abutting the next, it absorbs the small error in any
duration measurement, and it gives the ear a boundary so a sequence of beats
reads as a sequence rather than as one run-on paragraph. A few hundred
milliseconds to about a second; it is a house constant, declared once, not a
per-beat decision.

**timed from action start** — the beat's narration begins playing when the beat
begins, and the beat's actions run underneath it. If the hold is instead
measured from the moment the actions *finish*, every beat costs its actions
twice: once while the voice talks over them, and again as silence afterwards.
Over forty beats that silence is minutes, and it is invisible per beat, which is
what makes it dangerous. The grammar argument points the same way: the audience
should watch the thing happen **while** it is being described, not after the
description has ended.

## The hold has consumers inside it

A beat is not always one picture. A beat that shows two things in sequence, or
that runs an on-screen animation — text being typed, a value counting into
place — has sub-consumers of the same hold, and they must be budgeted **from
what is left of the clip at the moment they start**, never from the clip's full
length. The arithmetic is the same shape as the outer formula and it is
forgotten for the same reason: whatever the beat already spent is invisible
once it has been spent. An animation sized against the whole clip runs past the
beat's end, and the audience watches it finish under the next beat's narration.

The working rule is to give such an animation a fixed fraction of the remaining
time, with a floor so that a very short remainder still produces something the
eye can read. Two pictures in one beat split the remainder between them. In
every case the sub-budget is computed at the moment of use, from the clock, and
never from a constant that happens to have been right once.

## A measured duration is a typed input, and it owns its channel

Once the pacing consumes a real number, prose in the script about the picture
"holding for a while" or "pausing for emphasis" is a second authority over a
channel that already has one, and the two do not average — they settle into
timing that matches neither, and the symptom reads as under-direction, which
invites more prose and makes it worse. The repair is not to ban the intent but
to move it into the typed channel: a beat that genuinely needs the picture held
longer than its line declares a larger settle, as a number, in the same place
every other number lives. Direction about duration that cannot be expressed as a
number in that channel is direction that will not be honoured.

## The unmeasured fallback, and its ceiling

A clip that has not been synthesised yet still has to be paced, because a
rehearsal must be runnable before anyone spends on synthesis. The rule:

1. Fall back to a **declared** delivery-rate constant — a words-per-second or
   characters-per-second figure that lives in the configuration, not in a
   function body — and compute an estimated length from the line.
2. **Mark the beat unmeasured.** The estimate is never silently indistinguishable
   from a measurement. The mark rides with the beat into the run's record, and
   the run states how many of its beats it paced by guessing.
3. **An estimate may pace a rehearsal; it may never pace a delivered cut.**

The third rule is not fastidiousness. Word-to-time estimates are wrong in a
biased, content-dependent direction: compact written figures expand to many
syllables aloud, abbreviations and proper nouns expand unpredictably, and marked
pauses add seconds with no words at all — conventional guidance puts pause-heavy
delivery ten to fifteen percent above its word-count prediction. A fifteen
percent per-beat error is survivable in a price estimate and fatal in a cut,
because it accumulates: by the tail of a long film, audio is landing under the
wrong picture entirely. The planning band is worth knowing for the estimate —
produced narration without an on-screen presenter conventionally sits around 130
to 175 words per minute — but a band is a prior, and the render's clock is the
verdict.

## Decision rules

- When a clip exists on disk and is fresh for its line, pace from its measured
  duration; when it does not, pace from the declared rate constant and mark the
  beat unmeasured — never fall through to a hard-coded default hold, which is an
  estimate that cannot be audited.
- When the run is a delivery run and any beat is unmeasured, fail the run rather
  than ship the cut, because an unmeasured beat is the one defect the recording
  cannot show you.
- When a beat's picture needs longer than its line, raise that beat's settle;
  never lengthen the line to buy time, because padding the argument to fix the
  timing is the cheapest-looking and most expensive edit available.
- When the picture's own work exceeds the narration — a job that genuinely takes
  time, and whose taking time is the point — the settle already expresses it and
  the voice waits. Do not add a second waiting mechanism beside the formula.
- When the whole film runs long or short against expectation, check the timing
  origin before anything else: a consistent per-beat overrun proportional to how
  much each beat *does* is the action-start mistake, not a synthesis problem.

## When not to use it

Pacing to a measured clip presumes a synthesised narrator whose output exists
before the capture. A film narrated live by a human, or one where a presenter is
on camera, has the opposite dependency — the picture is captured with the voice
and the pacing is a performance decision — and the formula does not apply. It
also does not apply to a beat that is pure atmosphere: a title card or a slow
establishing scroll has no line to be paced against, and inventing one to keep
the machinery uniform buys nothing. Such beats carry a settle and no clip, which
the formula already handles, and they should be recognisable as such in the
script rather than dressed up as narration with an empty line.
