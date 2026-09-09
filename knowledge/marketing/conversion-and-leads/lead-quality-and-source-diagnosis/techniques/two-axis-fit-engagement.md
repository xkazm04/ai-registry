---
layer: technique
type: technique
subject: lead-quality-and-source-diagnosis
technique: two-axis-fit-engagement
status: forged
laws: [not-measured-is-not-zero, label-convention-as-convention, never-invent-proof]
shared_with: []
use_when: [scoring an individual lead for a work queue, designing a lead grade a rep can predict, deciding what a missing score component should do]
---

# Two-axis scoring: fit times engagement

## The concern

A single lead score - one number from zero to a hundred - is the most requested and
least useful artefact in lead handling. A seventy built from "great fit, never
answered" wants a nurture; a seventy built from "poor fit, three eager messages"
wants a polite decline. The number hides which one it is, and the rep learns to
ignore it. The working model - fit on one axis, engagement (behaviour, intent) on the
other, combined only at the end into a grade - is the dominant practitioner
convention and it is dominant for this reason: routing decisions get worse the moment
the axes are collapsed.

## The two axes

**Fit** is what the lead is, computable at creation, deterministic, no model:

- reachability - is there an email, a phone, a way to answer;
- service match - does the enquiry text hit something the business actually sells,
  read from the catalogue rather than guessed; one clear match is a strong signal and
  the match saturates after two, because ten mentions are not ten times the fit;
- business signal - a company name, a registered company identifier, for a
  business-to-business weighting;
- region - does the enquiry mention a locality the business serves;
- channel quality - an intent-bearing source (a referral, a search click) outranks a
  bulk import or a cold list, on a coarse explicit ladder an operator can read.

**Engagement** is what the lead has done, and it decays:

- the qualifying answers (timeline, budget, scope, the rep's disposition), reused
  from the same scoring the reply workflow uses so three surfaces cannot desync;
- behaviour - inbound message volume saturating at a handful, whether the business
  ever replied (a replied-to lead is a live conversation), whether a meeting
  happened;
- a recency factor that halves every thirty days of silence.

Either half of engagement alone reaches at most half the scale. A lead with three
messages and no qualifying answers is not an A; a lead with perfect answers and no
follow-up is not either.

## The grade

One threshold on each axis makes a plain 2x2 a user can predict: **A** both high,
**B** fit high and engagement low, **C** engagement high and fit low, **D** neither.
B outranks C by design - fit is the half nobody can change, engagement is the half a
good reply can raise. The queue orders A to D, then by the sum inside the grade; the
reply clock sits on top and lateness always outranks grade.

## Decision rules

- **When a fit component cannot be evaluated - no catalogue, no regions configured -
  drop it and re-normalise the remaining weights, because** an unconfigured project
  is not a poor-fit project, and scoring the absent as zero punishes the business
  for a setting.
- **When the last-activity timestamp is missing or unparseable, treat the lead as
  fresh, because** decay is a penalty for silence and missing data is not silence.
- **When the qualifying answers are absent, score that half zero, because** an
  un-worked lead is low engagement, honestly; the absence here is a fact about work
  not done, not a missing measurement.
- **When a model is asked to triage leads, it proposes and never writes the score,
  because** the score is deterministic and auditable and a model's write would make
  it neither; and the proposal runs over redacted fields, because a lead's identity
  never enters a prompt.
- **When a lead's fit is A-grade and the source is a suspected spam flood, trust the
  source diagnosis over the lead score, because** a bot with a plausible company
  name scores well on fit by construction.

## Weights and thresholds

Every weight above - twenty-five on reachability, thirty on service match, twenty on
business signal, ten on region, fifteen on channel; forty-five, twenty-five and
thirty across the behaviour signals; the sixty cut on each axis; the thirty-day
half-life - is a convention. They are chosen to be readable, so a rep can say why a
lead graded B, which a learned weight cannot offer. The standard is that they are
revisited when the business has enough closed deals to see which components
predicted a win, and that every surface that explains a grade calls them what they
are. Practitioner convention also says a business below roughly a thousand closed
outcomes should stay on rule-based scoring, because a learned model on fewer is
fitting noise it cannot explain.

## When NOT to use

- Not as a per-source figure; sources are scored on stage rates
  (`quality-score-qualification-and-win`).
- Not to override the reply clock; a late lead is late.
- Not with a model in the loop writing scores; proposals only.
- Not on erased contacts; a tombstone keeps the funnel skeleton and has no fit to
  score.
