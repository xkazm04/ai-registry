---
layer: technique
type: technique
subject: evidence-and-sources
technique: inference-labelled-as-inference
status: forged
laws: [every-number-has-a-source-and-a-date, a-claim-travels-with-its-counter-evidence]
shared_with: []
use_when: [presenting a derived number or a likely explanation in a technical article, drawing an explanatory illustration rather than a data figure, reviewing a draft that states reasoning with the confidence of measurement]
---

# Inference labelled as inference

The concern: much of a post's value is reasoning beyond its evidence: a cost derived by
multiplying a measured count by a published price, an explanation for an observed
regression, a consequence the sources imply but never state, an illustrative timeline drawn
to explain a mechanism. Stated with the same confidence as a measurement, that reasoning
borrows authority it has not earned, and a reader who finds one overstated inference stops
trusting the measurements too. **Label inference as inference, cite each of its inputs,
and label explanatory illustrations as illustrations.**

## Three kinds, three labels

| Kind | What it is | How it is labelled |
|---|---|---|
| Derived number | A computation over cited inputs (count times price, capacity from window size and average length) | The formula in the text or caption, each input cited ([every number has a source and a date](../../../_laws.md#every-number-has-a-source-and-a-date)) |
| Reasoned claim | An explanation or consequence the sources support but do not state | Marked in the sentence ("a likely reason", "this implies", "an inference from [3] and [7]"), with its basis cited |
| Illustration | A figure drawn to explain how something works, not to report data | "Illustration" in the caption, with no axis values that could be read as measured |

## Procedure

1. Read each number in the draft and ask: was this read, measured, or computed? Computed
   numbers show their formula or point to it.
2. Read each causal or predictive sentence and ask: does a cited source say this, or does
   the post conclude it? Conclusions get a marker word and their basis.
3. For each figure, ask whether its values are data. If any are invented to show a shape
   (arrival times on a cache timeline, a schematic distribution), the caption says
   "illustration" and the figure avoids precise tick values.
4. Where an inference is contested by evidence, the counter-evidence travels with it
   ([a claim travels with its counter-evidence](../../../_laws.md#a-claim-travels-with-its-counter-evidence)).

## Decision rules

- **When an inference carries the post's thesis, test it.** If it can be measured, measure
  it and promote it to evidence; if it cannot, say so in the limits.
- **Marker words are not hedges.** "This implies" is a precise label; "it could perhaps be
  argued" is fog. Use one plain marker and move on.
- **Derived numbers keep the precision of their weakest input.** A price read to two
  significant figures does not yield a cost to five.
- **Do not label everything as inference to be safe.** Over-labelling hides the real
  inferences among false modesty; measured and cited facts are stated plainly.

## When not to use it

Pure reporting of a measurement or a specification, where nothing beyond the evidence is
claimed; there labels would be noise.
