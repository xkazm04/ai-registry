---
layer: technique
type: technique
subject: generated-music-acceptance
technique: structure-verification-against-plan
status: forged
laws: [unmeasured-is-not-pass, checkability-routes-the-pixel]
shared_with: []
use_when: [verifying delivered audio against the section plan that briefed it, a cue must hit picture events at exact offsets, an ear-check keeps missing structural misses, deciding which acceptance checks a script should run]
---

# Structure verification against plan

A section plan commits to numbers: this many sections, at these offsets,
for these durations, at this tempo, totalling this length. Numbers are
checkable, and the bundle's routing law applies to the check itself: **what
could be checked against the plan is checked deterministically; the ear is
reserved for what only an ear can judge.** An acceptance pass that plays
the file and nods has used its most expensive, least reliable instrument
on questions a script answers exactly.

## What the plan makes checkable

- **Total duration**, to the second — against the plan's sum, and for a
  picture-locked cue, against the cue list row it came from. This is the
  first check and the cheapest kill: a right piece at a wrong length has
  already failed.
- **Section boundaries at expected offsets.** Section transitions are
  energy and instrumentation changes, and they are visible — in a
  waveform/spectral view, or to simple onset-and-energy analysis — at the
  offsets the plan's durations imply. A briefed 26-second build that
  actually turns at 21 seconds is a structural miss no conformance listen
  reliably catches, because the ear rides the music's own logic and
  forgives the plan's.
- **Tempo, where it was locked.** Measured against the briefed number when
  picture accents depend on the bar math — and measured at the accent,
  not just at the top: the question is whether the downbeat lands at the
  offset the lock was chosen for.
- **The ending shape**, mechanically: a hard out shows a cliff in the
  waveform at the briefed second; a fade shows a slope where one was or
  was not briefed.

The plan is the *only* thing that makes these checks possible — a
prose-briefed piece has no expected offsets to verify. This is half the
argument for plan-based briefing, arriving from the acceptance side.

## The two-instrument discipline

Run the deterministic pass first, and let it gate the listen: a file that
failed on duration or structure does not need twenty minutes of anyone's
ears. The listen then carries only its proper cargo — style, feel,
intelligibility, the conformance checklist's word-committed items. The
failure mode this ordering prevents is real and common: the ear, arriving
first, likes the take, and the liking negotiates with the numbers ("13
seconds over, but it breathes...") — at which point the timeline it must
fit has not gotten any longer.

## Decision rules

- When the plan committed a number, verify the number with a tool, because
  the routing law does not offer the ear as a fallback instrument for
  arithmetic.
- When a structural check fails, route to a section re-render before any
  creative judgment, because structure is the cheapest thing to fix
  precisely and the most expensive to fix by taste.
- When the same offsets must be verified for every cue in a pipeline,
  script the pass — duration, boundary, tempo, ending — and let the
  acceptance record carry its output, because a check that depends on
  someone remembering to run it is a check that stops running.

## When not to use this

Free-clock pieces briefed with auto duration have fewer committed numbers —
verify what was committed and nothing more; inventing post-hoc structural
expectations to check against is acceptance theater. And this technique
verifies against the *plan*, not against musical merit: a piece can hit
every offset and be dull, which is the conformance listen's territory, and
no meter's.
