---
layer: application
type: application
subject: harness-fault-attribution
technique: re-gate-then-resample
stack: process
status: forged
verified_on: 2026-09-27
applied: code
ab_verdict: better
---

# Process: a rerun that was two harnesses

A benchmark of memory designs replays one fabricated year of use and asks 194 probes, each
design answering through the same consumer model and judge. Its run header records the
design, consumer, judge, budget, scenario and date. Two runs of the plain retrieval design,
started fifteen minutes apart on 2026-09-03, carry headers that are identical in every
configuration field. They disagree on **18 of 194 probes**. Read as a rerun, that is a
spread of about nine points on one configuration, which is larger than most gaps the
benchmark was built to measure.

## The three moves, on stored data

On 2026-09-27 the pair was split with the harness's own stored outputs. No model was
called for an answer.

1. **Re-gate.** Both runs' stored answers were copied and re-scored under one current judge.
   **0 verdicts crossed the pass/fail line in either run.** The judge contributed nothing
   to the 18.
2. **Fingerprints.** Each stored answer carries the size of the context it was served.
   - **17 of the 18** flipped probes were served a different context in the two runs.
   - **1 of the 18** (a procedure probe) was served a context of the same size and answered
     differently: a longer answer passed, a shorter one failed. That one is the consumer's
     own sampling, the only flip that is.

   The context change has a cause in the harness's history. A commit that stopped embedding
   rendered dates into the retrieval index landed **15 seconds before the second run
   started**. The first run's index had the date inside every chunk, so the ranking read
   the clock.
3. **Direction.** 16 of the 17 context flips go the same way: the first run correct, the
   second wrong, stale or abstaining. The first run's extra passes were earned by the leak.
   Nobody had triaged them, because they were passes.

## What the old rule would have recorded

The old rule reads "a failure that disappears on rerun was environmental". Here the
failures sit in the second, corrected run, and the passes that "fixed" them sit in the
leaking one. So the rule examines the wrong run. It calls the failures environmental and
never asks why the first run passed. It fits the 17 context flips only by accident, and it
mislabels the 1 flip that was the model's own variation. A second pair in the same corpus shows the other
half of the rule failing. Two runs of the recorded-context replay agree on **194 of 194**
probes, and the second answered every probe from the response cache (194 hits). It could
not have disagreed, so its agreement proves nothing about any cause.

## What changed in the tree

The run header now carries the harness revision and whether its tracked code was edited,
captured at run start, and a re-score stamps its own. The comparison table prints the
revisions whenever its rows span more than one or are unstamped. Both controls were run:
matching stamps print nothing, differing stamps print the warning, and the stamp reads
edited before the commit and clean after it.

## What was not checked

- Context identity is by size, not content: the harness stores the answer and the size
  of the served context, not the context itself. Two different contexts of equal size
  would read as one, so the answer-only count of 1 is an upper bound.
- No fresh resample was drawn, so the consumer's own flip rate on this design is known
  from one probe, not measured.
