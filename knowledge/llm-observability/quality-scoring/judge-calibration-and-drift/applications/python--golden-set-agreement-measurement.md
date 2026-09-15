---
layer: application
type: application
subject: judge-calibration-and-drift
technique: golden-set-agreement-measurement
stack: python
status: forged
verified_on: 2026-09-15
---

# A majority vote that never receives more than one vote, in ragas (Python)

Read-only at commit `298b68274234c060deacab3cf5fb52aa3a20e885` of the public
`ragas` evaluation library. The version is tag-derived and the shallow clone
carried no tags, so the commit is the only witness. Nothing here was executed.

## The design

Several of the library's LLM-judged metrics declare self-consistency. A
`strictness` setting is documented as playing "a crucial role in maintaining
consistency", and is forced odd so that a vote cannot tie. The discrete
verdicts from N generations are then reduced by an ensembler that takes the
most common verdict per item (`src/ragas/metrics/base.py:655-677`). That is
the golden-set technique's "cheap variance reduction", built as a mechanism.

## Why it does nothing

The ensembler returns its first input unchanged whenever it receives one
response (`base.py:665-666`). Three separate things make sure it only ever
does:

- **Context precision wraps a single response in a list before voting.** It
  calls `ensembler.from_discrete([response], "verdict")`
  (`src/ragas/metrics/_context_precision.py:166`). Every vote has exactly one
  voter.
- **The aspect-style critics make one generation call whatever `strictness`
  says.** They then vote over that one response.
- **A structured-output client wraps its one result as a one-element
  generation list.** The multi-generation path then reduces the requested N
  to the number actually returned and logs that it received one. The knob
  stays set, and the draw count collapses underneath it.

The library's rewritten metrics dropped the ensembling entirely. One legacy
metric (answer relevancy) still makes a real multi-sample call.

## What the tree shows about the amendment

The failure is the second of the two the amendment names: machinery that
never receives more than one draw. It is invisible in every place a reader
would look for it:

- the configuration still says N
- the documentation still says consistency
- the aggregation code is correct
- nothing fails

Only counting the draws, requested against distinct responses returned,
would have shown it. Nothing in the library counts them.

## What this realization cannot do

- It cannot report how many effective samples stood behind a verdict.
- Its judges do not stamp whether a draw was pinned or sampled, so a reader
  cannot tell which of the amendment's two failures, if either, applies.
