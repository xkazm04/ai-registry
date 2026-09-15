---
layer: application
type: application
subject: judge-calibration-and-drift
technique: fit-and-report-on-disjoint-labels
stack: python
status: forged
verified_on: 2026-09-15
---

# Two judge-alignment paths that disagree about the split, in ragas (Python)

Read-only at commit `298b68274234c060deacab3cf5fb52aa3a20e885` of the public
`ragas` evaluation library. Its package version is derived from git tags, and
the shallow clone carried none, so the commit is the only witness. Nothing
here was executed.

The library ships two ways to align an LLM judge (a "metric") with human
annotations. They were built at different times and they make opposite
decisions on every rule in the technique, which makes the pair a clean
worked example.

## The older path: instruction search with no split

`metric.train(...)` runs a genetic optimizer over the judge's instruction
(`src/ragas/optimizers/genetic.py`). It reverse-engineers candidate
instructions from annotated batches, mutates them with feedback from the rows
where judge and human disagreed, crosses parents over, and scores fitness.

- **The fitness set is the annotation set.** No split exists anywhere in the
  path. The number the search optimizes is the only number it reports.
- **The selection direction ignores the loss.** The best candidate is
  `np.argmax(fitness_scores)` (`genetic.py:245`). The losses in
  `src/ragas/losses.py` include accuracy and F1, where higher is better, and
  mean squared error (`losses.py:30-44`), where lower is better. On a
  continuous metric the search keeps the candidate furthest from the humans.
- **The negation fix is also wrong.** The prompt-optimizer adapter negates
  every loss before handing it to a maximizing search
  (`src/ragas/optimizers/dspy_adapter.py:158-160`). That is correct for
  squared error and inverted for accuracy.
- **The starting instruction does not compete to the end.** The metric's
  starting instruction is appended to the initial population
  (`genetic.py:203-209`), but only mutated offspring reach the fitness step
  (`genetic.py:224-245`). A search that made things worse returns the worse
  instruction.

## The newer path: retrieved examples, a split, and chance correction

`align_and_validate` (`src/ragas/metrics/base.py:1284-1307`) takes the
technique's shape:

- it splits the annotated dataset 80/20 before aligning
- it fills a few-shot example store from the training part only
- it reports Cohen's kappa for discrete judges, or Pearson for numeric ones,
  on the held-out part, alongside raw agreement

Two defects remain, both at the report step:

- **The two score lists are filtered separately and then paired by
  position.** The gold scores drop `None` on their own, the predicted scores
  drop `None` on their own, and the two lists are zipped
  (`base.py:1430-1436`). One failed judge call shifts every later pair.
- **The split shuffles the caller's dataset in place** (`dataset.py:398-402`).
  Anything that later reads the dataset in its original order reads a
  different order.

## The guide that bypasses both

The library's walkthrough for aligning a judge by hand iterates the prompt
against 160 labeled rows. It reports raw agreement moving from 75.6% to 86.9%
on those same 160 rows (`docs/howtos/applications/align-llm-as-judge.md:231`,
`:389`), with no held-out part and no kappa. The newer API's own split is not
used in the project's own recommended workflow.

## What this realization cannot do

- Neither path records which items were used to fit, so a later
  recalibration cannot exclude them.
- Neither versions the fitted judge, so its trust cannot restart at unknown.
- No unit test covers the optimizer, the alignment path, or example-store
  retrieval, so every defect above ships silently.
