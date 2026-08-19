---
layer: technique
type: technique
subject: narrative-engine-selection
technique: fit-vs-hazard-axes
status: forged
laws: [output-never-outruns-evidence, cost-per-usable-output]
shared_with: []
use_when: [scoring engines against a researched topic, a structurally perfect choice feels wrong, subject involves named people or live harms]
---

# Fit vs hazard — two orthogonal axes

Engine assessment asks two questions, and systems that ask only the first
ship their worst videos with their highest scores. **Fit**: does the shape
this engine needs exist in this material? **Hazard**: what would a wrong
render of this engine on this subject cost? Fit is a property of the
material. Hazard is a property of the render — what the finished video
asserts about the world, and about whom, even when the fit was right and
every sentence is defensible. They vary independently, and the technique is
to score them separately, carry both forward, and never collapse them.

## Why one scalar fails

A single fit score forces every misgiving to be expressed as a fit downgrade
— which is a lie in both directions. Downgrading a genuinely strong fit
because the subject is dangerous corrupts the fit signal (the shape IS in the
material). Not downgrading it ships the hazard. Assessors caught in this trap
produce structurally excellent choices they then reject on grounds the score
cannot express — "structurally right, tonally disqualifying" — and each such
rejection is evidence the instrument is missing an axis, not that the
assessor is timid.

The most dangerous cell is **high fit, high hazard**: the engine snaps on
cleanly, the script reads well, and the damage is in what the shape *implies*
rather than in any sentence a line-by-line review could flag. A verdict
structure on "whose fault was it" convicts by shape. A monotonic ladder over
a team's decisions asserts "it got steadily worse and someone let it" without
ever saying so. No sentence-level gate catches shape-level assertions; only a
hazard axis assessed at selection time does.

## Assessing hazard — the questions to run

Hazard assessment is one free-text line per engine-on-this-subject: what a
wrong render would cost. Prompts that surface it:

- **Whom does the shape accuse?** If the engine's pleasure requires the
  material to turn on somebody — a verdict, an escalation, a takedown — and
  the somebody is a living person, an organization's named conduct, or a
  state, the shape itself is an assertion of culpability. Under
  [output-never-outruns-evidence](../../_laws.md#output-never-outruns-evidence),
  that assertion must rest on evidence of matching grade — a filed action, a
  published admission — not on the weighing performed inside the video.
- **What does the demonstration transfer?** An engine whose pleasure is
  operating a mechanism step by step becomes capability transfer when the
  mechanism is an exploit, a fraud, or an intrusion. Fit stays strong — it is
  the right shape for the story. Render the cost of the chain and the
  defence, never the executable sequence.
- **Does availability rise as evidence thins?** An engine that runs on a rule
  imported from another domain needs almost no facts about the subject, so it
  scores clean fits on topics too young to have facts — and renders a
  confident, unfalsifiable video. A strong fit from this engine on a
  days-old topic is a signal to audit the evidence base, not a green light.
- **Are the units of escalation people?** Ordered-difficulty structures are
  safe when the rungs are concepts, thresholds, or tiers, and hazardous when
  the rungs are cohorts of victims or named actors — the compounding pleasure
  asks the viewer to enjoy each rung being worse, and witnessed exemplars of
  the form often discharge the top rung with a joke.

An empty hazard line means "assessed, none found" — a real verdict, distinct
from "not assessed." Never leave the axis unasked and let the blank read as
clean.

## Decision rules

- Score fit from the material's fields, hazard from the render's assertions;
  record both on every candidate engine.
- A hazard line is not a veto and not a fit downgrade. An engine may be
  strong-fit, recommended, *and* carry a hazard line — that pair is the whole
  point of the axis. The hazard is consumed by arbitration (as the first
  cut), not by the scorer.
- Hazard is also an economics input: under
  [cost-per-usable-output](../../_laws.md#cost-per-usable-output), a render
  that cannot be published — or must be pulled — is an unusable output at
  full production price, so an unpriced hazard is an unpriced cost.
- Treat any known hazard list as incomplete. Hazards are discovered by
  running engines against subjects, not derived from the catalogue; record
  the open question of which engines are genuinely hazard-free versus merely
  un-probed.

## When not to use

Skip formal hazard assessment only where the subject names nobody, transfers
no capability, and rests on settled evidence — a concept explainer on
established science. Even there, the cheap move is to write the empty line
and mean it, keeping "assessed, none found" distinguishable from "never
asked."
