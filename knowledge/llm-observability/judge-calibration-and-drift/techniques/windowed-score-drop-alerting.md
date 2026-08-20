---
layer: technique
type: technique
subject: judge-calibration-and-drift
technique: windowed-score-drop-alerting
status: forged
laws: [statistical-verdicts-or-no-verdict, never-present-absence-as-an-answer]
shared_with: []
use_when: [detecting slow quality or kappa slides that per-event checks miss, tuning window and min-sample knobs on a score regression detector, deciding server-side vs runner-side drift responsibilities]
---

# Windowed score-drop alerting

The concern: catch the *slow slide* — a score series (product quality under
a rubric, or the judge's own kappa under its reserved rubric) whose recent
level has regressed against its own established baseline, in steps
individually too small for any single-point comparison to notice. This is
the server-side half of drift detection; the runner-side per-cycle delta is
the other half, and neither substitutes for the other.

## The detector

Keyed per (project, rubric), the server keeps a bounded rolling window of
normalized scores — each incoming value divided by its scale and clamped to
0..1, so rubrics with different maxima share one detector. On every score
write:

1. Push the normalized value; evict from the front past the window cap
   (order ~20).
2. **Refuse to speak below a minimum sample count** (order ~8). A verdict
   from three points is a coin flip wearing a dashboard; below the floor
   the detector stays silent — silent as in *no verdict*, which the
   surrounding system must not render as "no regression".
3. Split the window: the most recent quarter (floored at 3) is the
   **recent** tail; everything before it is the **baseline**. Require the
   baseline side to also hold a minimum count, or again: no verdict.
4. Compare means: when `(baseline − recent) / baseline` meets the
   configured relative drop (~15%), fire — carrying recent mean, baseline
   mean, drop percentage, sample count, and who scored.

Design choices worth defending:

- **Relative drop, not absolute.** A 0.10 fall means something different on
  a rubric that lives at 0.95 than one that lives at 0.40; a ratio makes
  one threshold serve both.
- **Recent-vs-own-baseline, not recent-vs-target.** The detector alarms on
  *change*, which needs no per-rubric configuration; whether the absolute
  level is acceptable is the trust bar's job, a different question with a
  different owner.
- **A degenerate baseline refuses.** A baseline mean at zero makes the
  ratio meaningless; the detector declines to divide rather than
  manufacturing an infinite drop.
- **Cooldown-deduped delivery.** A sustained regression re-triggers on
  every write; a per-key cooldown turns that into one alert per incident
  window instead of a pager storm, without suppressing a *different*
  rubric's alert.
- **The alert names its evidence.** Recent mean, baseline mean, drop, and
  n travel in the payload — the receiver can judge severity without a
  query, and an alert that carries its own sample size cannot
  impersonate more confidence than it has.

## The warm-up blindness, stated honestly

The minimum-sample floor means the detector is blind for the first N
observations of any (project, rubric) key — for a daily calibration
cadence, roughly the judge's first week in service. This is a feature
(statistical honesty), but only if the gap is covered: the runner-side
per-cycle check — this kappa versus the immediately previous one, and
versus the absolute bar — fires from the second cycle onward with no
window at all. The pairing is the design: **immediate check for the cliff,
windowed check for the slope.** Deploying the windowed detector alone and
calling drift "handled" leaves exactly the fast failure — a provider model
swap tanking agreement overnight — undetected until the window warms up
around the wreckage.

Symmetrically, the windowed detector is what makes the memoryless check
sufficient: five consecutive drops of 0.04 kappa never trip a 0.15
per-cycle delta, but they move the recent mean well past a 15% relative
drop.

## Tuning rules

- **Window ≈ the horizon of "recently".** Too small and one bad day is a
  baseline; too large and last quarter's regression is still diluting
  today's baseline. Size it in *cycles*, mindful of cadence: 20 daily
  cycles is three weeks of memory.
- **Min samples buys false-positive suppression with blindness.** Raise it
  only while the immediate check covers the front edge.
- **Drop threshold below the meaningful-regression size, above the noise
  floor.** Measure the series' natural cycle-to-cycle variance first;
  a threshold inside the noise band pages someone weekly for nothing and
  teaches them to ignore the channel.

## When not to use this

Not for series that are supposed to move — a rubric being actively
iterated, or scores during a golden-set version migration; mute the key
across the change and let it re-baseline, otherwise the detector
faithfully reports the migration as a regression. Not as a release gate:
this is an *alerting* trend heuristic (rolling means, no family-wise
correction); a gate verdict demands the paired, corrected statistical
machinery, and borrowing the alert threshold for a ship/no-ship decision
launders a heuristic into a verdict.
