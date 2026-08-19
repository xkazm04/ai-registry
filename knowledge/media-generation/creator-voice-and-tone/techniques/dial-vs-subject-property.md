---
layer: technique
type: technique
subject: creator-voice-and-tone
technique: dial-vs-subject-property
status: forged
laws: [output-never-outruns-evidence, unmeasured-is-not-pass]
shared_with: []
use_when: [deciding which tone controls to expose to a creator, auditing why a render sounds more confident than its sources, classifying a measurable script property as style or fact]
---

# Dial vs subject-property

The classification question behind every tone control: is this property a *choice*
the creator gets, or a *consequence* of the subject or the engine? Expose only the
choices. For the consequences, compute the value and show it — a displayed
measurement builds trust; the same value as a slider produces incoherence or lies.

## The classification test

For each measurable property, ask what determines it:

| Determined by | Classification | Tool behavior |
|---|---|---|
| the creator's identity and format | **dial** | expose, learn, apply |
| the subject | subject property | compute, display, protect |
| the engine | engine property | compute, display, protect |

The three properties most often mis-exposed as dials, with the measured ranges that
prove they track the material and not the person:

- **Hedging density** tracks the subject's knowability: 0.0 per thousand words on a
  fully-specified subject, 18.2 on a genuinely contested one where the script says
  the uncertainty out loud. A "confidence" dial on an uncertain subject instructs
  the tool to overstate — the render becomes more certain than the fact behind it.
- **Numeric density** tracks whether the subject is quantitative: 0.0 to 28.6 per
  thousand across equally effective scripts. Dialed up it manufactures precision;
  dialed down it withholds evidence.
- **Causal-opener density** tracks how much the engine derives rather than asserts
  (measured 15–40% across a corpus). Raised stylistically it inserts "therefore"
  between beats with no causal relation.

What remains after the test — rate, author presence (I per thousand), viewer address
(you per thousand), inclusion (we per thousand), formality (contractions per
thousand), humor frequency — is the complete numeric dial set, each with a measured
corpus range to bound plausible targets.

## Not a dial is necessary, not sufficient: the compression channel

Refusing to expose a property does not protect it. Measured on a controlled re-render:
a slow, formal profile with *no target set* for hedging or numeric density cut hedges
from 7.8 to 3.9 per thousand and numeric expressions from 36.2 to 28.3 — while causal
density held within 1.2 points. The mechanism: rate × duration is a word budget, and
under a shrinking budget hedges and spelled-out figures are the cheapest words —
grammatically optional, narratively invisible. Every individual cut read as good
editing; together they made the render more confident than its medium-confidence
sources. The control condition proves the channel: the same properties under a
*surplus* budget held or rose.

So subject properties need active protection, not just absence from the control
panel:

- **Word-budget exemption.** A hedge may not be removed to meet a rate. A scale
  conversion may lose its prose framing, never its figure.
- **Post-render verification.** Measure the protected properties on every render and
  compare against the structure's declared values. A render that silently dropped
  half its epistemic marking must fail the check — and a property nobody measured
  must report as unmeasured, never as fine.

## Decision rules

- **When a creator asks for a control the test classifies as subject-owned**, show
  the measurement and its cause instead: "this subject is uncertain; the script says
  so 9 times" beats a rejected slider. If they push, the honest framing is that the
  request is an accuracy setting, not a style setting.
- **When validating a render against a profile**, confirm the measurement scales are
  commensurable first. Corpus baselines extracted from auto-transcribed captions
  count digits; written prose spells numerals out — the same text measured 4.3 vs
  36.2 per thousand under the two counters, an 8× gap. Comparing across scales
  validates nothing.
- **When a dial's measured range is exceeded by a learned target**, flag it rather
  than clamp it silently — a creator genuinely outside the corpus range is signal
  about the corpus, but an extraction bug is likelier.

## When not to use it

The test assumes factual content where accuracy is the contract. In persuasion or
entertainment formats, hedging genuinely is a stylistic register and the
classification collapses. And do not run the protection machinery on structure-free
tools (caption generators, title writers): with no fact set behind the text, there is
no evidence level for the output to outrun.
