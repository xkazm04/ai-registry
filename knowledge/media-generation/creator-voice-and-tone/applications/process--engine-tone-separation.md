---
layer: application
type: application
subject: creator-voice-and-tone
technique: engine-tone-separation
stack: process
status: forged
---

# Process: falsifying the engine/tone separation on a real script pipeline

The gravitone-gcloud studio states the separation as law in `knowledge/TONE.md:7-14`
("The engine decides what happens. The tone decides how it sounds. Tone may never
change the beat chain.") and attaches it to the composition procedure at
`knowledge/TONE.md:97-118`: tone enters at step 9 of a 10-step procedure, with the
reference world as the single sanctioned reach-back into step 7's analogy choice.
Rather than trusting the law, the repo ran a falsification experiment against it —
`pipeline/runs/2026-08-11-why-bitcoin-price-does-not-rise/TONE-TEST.md` — which is
the reference realization of this technique as a *process*.

## The experimental design

Two hypothetical creator profiles were declared **before writing** in
`tone-profiles.json` (same run directory), constructed to sit near opposite ends of
every measured dial range: "Null Pointer" (235 wpm, `I` ≈ 9/1k, a joke every ~45s,
software-culture reference world) and "The Long Way Round" (172 wpm, hard-zero `I`,
no jokes, domestic-objects world). The profiles' `deliberately_not_dials` block
(tone-profiles.json:99-104) explicitly sets no target for hedging, numeric, or
causal density — making their movement the second experimental question. Both
profiles re-rendered the prose of the same approved script from the same
`notebook.json`; the beat chain, turns, connectors, analogy budget, and fact set
were held fixed by construction (`held_fixed_by_construction`,
tone-profiles.json:90-98). Prose was then measured with the same corpus counters
used to build the dial ranges.

## What the process proved

- **The chain held completely** (TONE-TEST.md §4): 15/15 beats, identical order,
  identical connectors, in both renders — including under deliberate attack (a
  135-word deficit whose most cuttable beats "volunteered" and were refused; a
  forbidden list that forced an analogy re-choice inside the same slot). The stated
  reason generalizes: `notebook.json` pre-authors mechanisms as a `chain[]` of
  BUT/THEREFORE steps, so beats exist as data before prose does — tone cannot
  delete what it has no handle on.
- **The law's blind spots surfaced only because the run measured beyond the law**
  (TONE-TEST.md §4-§5): a legal 18-second digression pushed turn 1 out of its
  60–90s cadence band, and the slow profile cut hedges 7.8→3.9/1k and numeric
  expressions 36.2→28.3/1k with no dial set for either. The verdict — "holds as
  written, and narrowly" — is exactly the yield a falsification process exists to
  produce.
- **Amendments were recorded, not applied** (TONE-TEST.md §8): the run proposed six
  concrete law extensions (schedule protection, word-budget exemption for hedges
  and figures, rate demoted to constraint, digression budgeted at step 4,
  forbidden-list validation, profile × engine compatibility) into the run
  directory and left `knowledge/**` untouched — experiment and doctrine change as
  separate reviewed steps.

## Transferable process rules

1. Declare extreme profiles *before* rendering; a test profile tuned after seeing
   output tests nothing.
2. Hold structure fixed by construction (structure-as-data), then try to break it —
   surplus words, deficit words, forbidden imagery, incompatible dials.
3. Measure invariants the law names *and* adjacent quantities it does not (the
   schedule, the not-a-dial properties); the findings live in the gap.
4. Record verdicts and proposed amendments in the run artifact; amend doctrine in a
   separate change.
