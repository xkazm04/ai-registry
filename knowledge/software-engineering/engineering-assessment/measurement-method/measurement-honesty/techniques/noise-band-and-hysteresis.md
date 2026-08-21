---
layer: technique
type: technique
subject: measurement-honesty
technique: noise-band-and-hysteresis
status: forged
laws: [one-authority-per-vocabulary, count-carries-predicate]
shared_with: []
use_when: [deciding whether a metric change is worth announcing, a classification flip-flops across runs, setting a threshold near which subjects will cluster]
---

# Noise band and hysteresis

Run the same measurement twice over an unchanged subject and the number moves.
That movement is not error to be apologized for; it is a **property of the
instrument**, as real as its units, and a system that has not measured it
cannot tell a change from a re-run. The band is the width of that movement; the
hysteresis is what you do at the boundaries the band straddles.

## Measuring your own band

The band is measured, never chosen from taste. The procedure is unglamorous and
takes an afternoon:

1. Pick a set of subjects broad enough to include the awkward ones — large and
   small, dense and sparse, and at least a few sitting near classification
   boundaries.
2. Re-measure each with no intervening change, at an interval short enough that
   real change is implausible but long enough to cross the caches, pagination,
   and rate-limit behavior of the real pipeline. Repeat several times.
3. Record the spread per subject. The band is a high percentile of that spread —
   not the mean, and not the maximum, which is one flaky source away from
   absurd. The ninetieth is a defensible default.
4. Write the band down as a **single named constant** with a comment stating
   how it was derived and when. Every consumer reads that one constant:
   announcement suppression, trend arrows, "improved/declined" copy, digest
   inclusion. Two hand-maintained copies of a band is
   [one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
   violated with a delay fuse — someone re-measures and updates one of them.
5. Re-derive the band whenever the pipeline's sources or fetch strategy change.
   A band is a claim about an instrument that no longer exists once the
   instrument changes.

A band of a couple of points on a hundred-point scale is typical for a
composite over many sources, and it is worth internalizing how *small* a change
that makes uninterpretable: most week-over-week movement in such a metric is
the instrument breathing.

## Suppress announcements, not values

The load-bearing distinction, and the one most implementations get wrong:
**hysteresis and band suppression apply to what the system says, not to what it
stores.**

- The stored value is the honest current measurement. It updates every run,
  band or no band. Anything else creates a second source of truth that
  disagrees with the raw computation, and someone will eventually compare them.
- The *announcement* — the digest line, the notification, the trend arrow, the
  "you improved" copy — fires only when the delta exceeds the band. Below it,
  the system stays quiet and shows the current value without a change
  narrative.

Framed this way the technique costs nothing in truthfulness. Nothing is hidden;
the system merely declines to narrate movement it cannot distinguish from its
own jitter. And the credibility payoff is direct: a subject that receives
"improved" and sees nothing change learns to ignore every future notification,
including the one that mattered.

## Asymmetric thresholds at classification boundaries

A band suppresses *reporting* of small changes but does not stop a subject
parked exactly on a threshold from crossing it every run. That needs
asymmetry — different thresholds for entering and for leaving a state:

> To **enter** the higher classification, exceed the boundary by half a band.
> To **leave** it, fall below the boundary by half a band. Between the two, the
> previous classification persists.

Concretely, with a fifty-point boundary and a band of four: enter at fifty-two,
leave at forty-eight. A subject drifting in the forty-eight-to-fifty-two zone
holds whatever it last legitimately earned, and no consumer churns.

Three rules keep asymmetry honest:

- **State the direction of the bias and choose it deliberately.** Enter-high /
  leave-low is *conservative on promotion and generous on demotion* — hard to
  claim a level, slow to lose one. That is right for a level the subject
  displays publicly, and wrong for a safety threshold, where the bias must
  invert: easy to enter the alarmed state, hard to leave it.
- **Hysteresis requires memory of the prior state**, which makes the
  classification path-dependent. Two subjects with identical current values can
  legitimately hold different classifications. That is the mechanism working,
  but it must be explainable — the explanation surface says "held at this level;
  current value is inside the stability band around the boundary", per
  [count-carries-predicate](../../../../_laws.md#count-carries-predicate).
- **A widened guardband around a blend or cut point is the same move.** Wherever
  two computations meet at a threshold — a switch between estimators, a
  fallback trigger — widening the transition zone by the band prevents the same
  oscillation, and for the same reason.

## When not to use it

- **When you have not measured the band.** A guessed band is a censorship
  policy with no evidence, and the first real regression it swallows destroys
  more trust than the churn it prevented. Measure first; ship suppression
  after.
- **On the stored value, the audit log, or the export.** Those are records of
  what was measured. Smoothing them makes the system unable to answer "what did
  we compute on that date", which is the question every dispute opens with.
- **When the metric's job is to be twitchy.** Live operational signals are
  consumed precisely for their fast edges; a band there is latency added to an
  alarm. Apply hysteresis to the *paging* decision if flapping is the problem —
  never to the signal itself.
- **When the movement is structural rather than noisy.** If re-runs move because
  a source paginates non-deterministically or a detector races, the band is
  measuring a bug. Fix the determinism; a band applied to a broken instrument
  hides the breakage and widens every year.
