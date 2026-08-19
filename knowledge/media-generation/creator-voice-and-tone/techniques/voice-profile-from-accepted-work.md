---
layer: technique
type: technique
subject: creator-voice-and-tone
technique: voice-profile-from-accepted-work
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [building or updating a learned voice profile, choosing which scripts count as training evidence, explaining a profile's numbers to the creator who owns it]
---

# Voice profile from accepted work

A voice profile is learned, not configured — every numeric dial is extractable from
plain text with simple counters — but *what it is learned from* decides whether it
converges on the creator or on the model. The discipline in one line: **seed from
nominated work, update only on acceptance, learn the delta, and show every number
with its source.**

## The profile object

One profile per **creator × format** — never per creator. The same presenter,
measured across two of their own formats, moves rate, inclusion, and address
substantially between a procedural walkthrough and a commentary piece; a single
merged profile renders both slightly wrong. Each profile holds:

- the numeric dials (rate, author presence, address, inclusion, formality, humor
  frequency), each as a target value **plus the count of accepted scripts behind
  it**;
- the two declared components: reference world (permitted + forbidden domains) and
  signature bookends (literal strings);
- observations that are shown but never applied — engine usage, subject-property
  measurements — kept visibly separate from the dials.

## The loop

1. **Seed** from 3–5 scripts the creator nominates — their back catalogue or
   exemplars they admire. Run the same measurement used everywhere else in the
   pipeline; a profile measured with a private counter cannot be validated against
   anything.
2. **Update on acceptance, not on generation.** Only scripts the creator approved
   and shipped update the profile. A generated draft they rewrote is evidence about
   the model, not about them — folding it in is how the profile quietly becomes a
   self-portrait of the generator.
3. **Learn the delta, not just the absolute.** Diff accepted against generated: if
   the creator consistently cut hedges the tool inserted, or contracted what the
   tool wrote formally, that is a tone fact stronger than any measurement of the
   accepted text alone, because it isolates the creator's hand from the model's
   prior.
4. **Show the profile as sourced numbers.** "Your rate: 212 wpm, from 6 accepted
   scripts." A dial with no accepted scripts behind it is unmeasured and must be
   displayed as the default it is — never presented as if it were the creator's
   measured voice.

## The three failure modes, and their guards

- **Drift to the mean.** Re-fitting on generated-then-lightly-edited scripts
  converges the profile onto the model's own voice — the layer ends up
  personalizing everyone toward the same center. Guard: the accept-only rule, plus
  a periodic re-anchor against the original seed set; if the live profile has
  walked far from the seeds without the creator's editing behavior explaining the
  walk, the fit is contaminated.
- **Learning structure by accident.** A creator whose accepted scripts all use one
  narrative engine must not have that engine become a preference — engine choice
  belongs to the idea, not the person. Guard: store engine usage as an observation
  to display, never as a default to apply. The dial/observation partition in the
  profile object exists for exactly this.
- **Over-fitting to a hit.** One viral script must not dominate the fit. Guard:
  weight by count, not by performance. An early-stage studio has no reliable
  performance signal, and pretending otherwise encodes noise as voice.

## Decision rules

- **When the profile has fewer accepted scripts than the seed set** (roughly, under
  5–10), render with the house default and show the learned values as provisional.
  A profile should have to *earn* the right to override the default, and the
  crossover point is a measurable question, not a constant to hardcode.
- **When accepted and corpus measurements disagree wildly on one dial**, suspect the
  measurement before the creator — counters calibrated on auto-transcribed captions
  and counters run on written prose are not on the same scale (an 8× gap was
  measured on numeric density for exactly this reason).
- **When a creator disputes a number**, the profile must be able to answer with its
  sources: which scripts, which counter, what values. A profile that cannot show
  its work gets abandoned the first time it sounds wrong, and rightly.

## When not to use it

Do not learn a profile for a creator who has not accepted anything yet — declare one
in an interview instead (rate preference, reference world, bookends) and let
acceptance data replace it gradually. And do not extend the loop to properties the
subject or engine owns: measuring a creator's historical hedging density and
applying it as a target reproduces the dial-classification error with a learned
number on it.
