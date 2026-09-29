---
layer: technique
type: technique
subject: generated-speech-acceptance
technique: published-number-comparability
status: forged
laws: [output-never-outruns-evidence, refusal-is-a-state]
shared_with: []
use_when: [a reproduced score is being put beside a published one, a reproduction misses the published figure and someone wants a cause, writing up a replication, quoting a vendor's number in a comparison table]
---

# Published-number comparability

Putting a reproduced score in the same row as a published one is a claim that
the two were produced the same way. Most gaps between them are not verdicts on
the model; they are differences in the protocol. The work here is to name what
the two numbers share before the row is written, and to write the honest
non-answer when the sharing cannot be shown.

## The causes, from a run of replications

Across many reproductions of published speech results, the gaps traced to a small
number of causes, and the order of the list is the order to check them in:

1. **A different system under the same name.** The published figure came from a
   hosted service, the reproduction from released weights. The service may run a
   later model, a different decoding setting or a post-processing stage the
   weights do not include.
2. **A different metric under the same label.** A downstream summary reported
   character error where the original benchmark reports word error, for several
   languages. The numbers are not on one scale, and one of them was relabelled.
   The original is not always clean either: a table that labels every language
   word error and says nothing of the unit for unspaced scripts leaves each
   reproduction to choose one, so it must say which it chose.
3. **A different split of the same corpus.** The published row is a subset, a
   different language set, or a differently filtered version.
4. **A different normalizer.** Script conversion, numerals, punctuation, or a
   second reference (see the normalization technique). The same named
   recognizer reached through two different loaders, one by full hub identifier
   and one by a bare size name, is a pin that has not been shown equal.
5. **A retired or replaced judge** (see the judge technique).
6. **Moved code.** The scoring code changed after the paper; the reproduction
   ran a later revision.
7. **The vendor's own scorer.** When the vendor's own scoring code, re-run,
   reproduces the reproduction and not the published figure, the gap sits on the
   model side of the pipeline and not the scorer side. That is the one check
   that separates the two. In one reproduction the vendor's script gave 1.81
   against a published 1.64, the reproduction's own scorer gave the same 1.81,
   and the honest conclusion was a small model-side gap with the scorer
   cleared.

The first two are the commonest and the cheapest to rule in or out, and the last is the most
informative, because it converts "we could not match" into "the difference is
in the released artifact".

## Procedure

For each published number, fill in a short table before comparing: the system
and how it was served, the dataset and split with its item count, the metric
and its unit, the normalizer, the recognizer or embedding model or judge with
full identifiers, the code revision, the number of runs and the spread. Then
put the two protocols side by side and mark each line same, different or
unknown. The comparison cell is filled only when every line is same. If a line
is different, the cell is left empty and the reason is written in it. If a
line is unknown, the cell says which.

## Rules

- **Leave the cell empty and say why when the definitions differ.** An empty
  cell with a reason is a result; a number in the cell is a claim, and a
  claim about a mismatched protocol outruns the evidence behind it.
- **Say "cause not traced" rather than infer.** When the result files cannot
  distinguish two explanations, list the candidates that were ruled out and
  state that the cause was not traced. An inferred cause read back in a later
  document becomes a fact.
- **Carry the valid-row count beside every score.** A score over nine hundred
  and ninety-nine of a thousand rows is not a score over a thousand; say so, and
  say whether the missing row was traced. A silent drop changes the
  denominator and, in a slice, the ranking. Say where the row was lost. A row a
  judge failed to score is loss on the instrument's side and can usually be
  excluded and counted; a row the system failed to synthesize is loss on the
  system's side, and excluding it flatters the system that failed most. No
  elimination is silent.
- **Compare the gap to what the normalizer can move.** If the observed gap is
  smaller than the effect a plausible normalizer difference produces, the gap is
  not evidence about the model.
- **Take the tolerance from your own spread.** Repeat the run; the run-to-run range
  is the tolerance below which two numbers are the same number. A round
  "within five percent" imported from elsewhere is an invention.
- **Do not chase a match by tuning.** Adjusting the reproduction until the
  number lands makes the reproduction agree with the paper and no longer with the
  claim. Record the mismatch and the state of each control.

## Statuses a reproduction can honestly carry

Reproduced (every line same, within the run spread); not reproduced with a
named cause; not comparable, with the line that differs; not traced. A fifth
status, "reproduced by construction", is available only when the vendor's own
scorer was used.

## Decision rules

- When the published number came from a hosted service and the reproduction
  from weights, compare the direction and ordering, not the value.
- When a downstream summary is the only source, find the original benchmark
  definition before quoting either number.
- When the cause cannot be traced within a stated budget, publish the
  reproduction as its own number and stop.

## When not to use this

Two runs of your own under one pinned protocol are comparable by construction;
there the technique collapses to a diff of the pins. Its full weight applies
only when a number crosses an organizational or version boundary.
