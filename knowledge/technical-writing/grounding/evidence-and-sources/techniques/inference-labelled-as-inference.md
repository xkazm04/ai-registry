---
layer: technique
type: technique
subject: evidence-and-sources
technique: inference-labelled-as-inference
status: forged
laws: [every-number-has-a-source-and-a-date, a-claim-travels-with-its-counter-evidence]
shared_with: []
use_when: [presenting a derived number or a likely explanation in a technical article, drawing an explanatory illustration rather than a data figure, reviewing a draft that states reasoning with the confidence of measurement, writing a scenario figure for a use case]
---

# Inference labelled as inference

The concern: much of a post's value is reasoning beyond its evidence: a cost derived by
multiplying a measured count by a published price, an explanation for an observed
regression, a consequence the sources imply but never state, an illustrative timeline drawn
to explain a mechanism. Stated with the same confidence as a measurement, that reasoning
borrows authority it has not earned, and a reader who finds one overstated inference stops
trusting the measurements too. **Label inference as inference, cite each of its inputs,
and label explanatory illustrations as illustrations.**

## Four kinds, four labels

| Kind | What it is | How it is labelled |
|---|---|---|
| Derived number | A computation over cited inputs (count times price, capacity from window size and average length) | The formula in the text or caption, each input cited ([every number has a source and a date](../../../_laws.md#every-number-has-a-source-and-a-date)) |
| Reasoned claim | An explanation or consequence the sources support but do not state | Marked in the sentence ("a likely reason", "this implies", "an inference from [3] and [7]"), with its basis cited |
| Illustration | A figure drawn to explain how something works, not to report data | "Illustration" in the caption, with no axis values that could be read as measured |
| Worked example | A scenario figure made up to show how a use case works ("a team that opens twenty pull requests a week") | The conditional or "say" in the same sentence, round inputs, and kept out of titles, descriptions and pull-quotes, where the label cannot follow it |

## Procedure

1. Read each number in the draft and ask: was this read, measured, or computed? Computed
   numbers show their formula or point to it.
2. Read each causal or predictive sentence and ask: does a cited source say this, or does
   the post conclude it? Conclusions get a marker word and their basis.
3. Read each scenario sentence and ask: is this figure about the world, or made up to
   show the arithmetic? A made-up figure in the indicative reads as a fact about the
   reader; put it in the conditional. Do not cite it: no source exists, and asking for one
   is how a source gets invented.
4. For each figure, ask whether its values are data. If any are invented to show a shape
   (arrival times on a cache timeline, a schematic distribution), the caption says
   "illustration" and the figure avoids precise tick values.
5. Where an inference is contested by evidence, the counter-evidence travels with it
   ([a claim travels with its counter-evidence](../../../_laws.md#a-claim-travels-with-its-counter-evidence)).

## Decision rules

- **When an inference carries the post's thesis, test it.** If it can be measured, measure
  it and promote it to evidence; if it cannot, say so in the limits.
- **Marker words are not hedges.** "This implies" is a precise label; "it could perhaps be
  argued" is fog. Use one plain marker and move on. The measured cost of hedging falls on
  the vague kind: in experiments, a numeric range around a figure barely moved trust in the
  number or the source, verbal uncertainty cost more, and a review of 48 studies found
  quantified ranges had only positive or null effects. Hedges placed on the data rather
  than on the interpretation lowered readers' evaluations, most among the scientifically
  trained.
- **Label the reasoning, not the measurement.** The marker goes on the step beyond the
  evidence; the measured inputs are stated plainly. On the interpretation, a professional
  marker did no harm where a colloquial one cost credibility. Where the uncertainty is a quantity,
  give the range rather than a probability word: readers translate words like "likely"
  into numbers inconsistently, even with a published key beside them.
- **A marker word does not replace the inputs.** "This means two to three times faster"
  is labelled and still uncheckable if the figures it was computed from are not on the
  page. The label and the cited inputs travel together.
- **Derived numbers keep the precision of their weakest input.** A price read to two
  significant figures does not yield a cost to five. Round once, at the end: carry full
  digits through the computation and round the reported result, as measurement-uncertainty
  practice does, so that rounding errors do not compound.
- **Do not label everything as inference to be safe.** Over-labelling hides the real
  inferences among false modesty; measured and cited facts are stated plainly.

## When not to use it

Pure reporting of a measurement or a specification, where nothing beyond the evidence is
claimed; there labels would be noise.
