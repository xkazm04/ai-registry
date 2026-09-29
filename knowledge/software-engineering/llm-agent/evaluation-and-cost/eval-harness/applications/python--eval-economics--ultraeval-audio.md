---
layer: application
type: application
subject: eval-harness
technique: eval-economics
stack: python
status: forged
verified_on: 2026-09-29
verified_against: python@3.10
applied: experiment
ab_verdict: better
---

# A resume that binds cached stages to a row position and never asks which evaluator made them (UltraEval-Audio)

UltraEval-Audio is an open evaluation framework for speech and audio models. It runs a
model over a dataset, post-processes the output, scores each item and aggregates. This
document reads it at commit `bead726925d43f526bed48a4a6a827595169429d`. The Python
witness is its declared floor (`pyproject.toml:10` "requires-python"). **Executed, in a
narrow sense:** the tree's own resume loader and task runner ran on a synthetic dataset
of six and eight items with the heavy scoring packages replaced by stubs, so what follows
is structure and never magnitude. The tree was not modified.

## What the design gets right

Every run writes one typed row per stage per item (prompt, inference, post-process,
eval, error) to a fresh results file, and a resumed run replays the cached stages into
that new file (`audio_evals/eval_task.py:51` "eval_info", `audio_evals/eval_task.py:57` "post_process"), so the results file is
always a complete record and the file it resumed from is never half-merged. The loader
snapshots its source before the recorder can truncate the same path
(`audio_evals/dataset/resume.py:29` "shutil.copy2", `audio_evals/recorder.py:13` "os.remove(f_name)"). And there is a separate, better-named door for the case that
matters most: a "load inference file" mode keeps only the prompt and inference stages
(`audio_evals/dataset/dataset.py:31` "def load_inf_file"), so an evaluator can change
without any model being called again. That is the technique's re-score path, built.

## Where it departs from the technique

The technique says a recorded cell is keyed by what makes it the same measurement. This
tree keys it by **position** and by nothing else.

**A cached score outranks a new evaluator.** A resumed row that already has an eval
stage never calls the evaluator (`audio_evals/eval_task.py:66` "score = kwargs"). With a
full cache the run reports the previous evaluator's numbers under the new evaluator's
name. With a partial cache it reports both, blended, under one mean, and nothing in the
result says so.

**The row's identity is its index in a list that sampling reorders.** Recorded ids are
positions in the list after a random sample (`audio_evals/eval_task.py:172` "random.sample"), and the loader attaches each cached stage to that same index in the
full dataset (`audio_evals/dataset/resume.py:42` "idx = int(doc", `:45` "data[idx]").
After a sampled run, a resume binds outputs to the wrong items.

**The two run modes read the cache differently.** The two-phase path re-scores every
item and ignores a cached eval stage (`audio_evals/eval_task.py:127` "score = self.evaluator"),
while the single-phase path reuses it. One resume flag means two different things.

## The paired run

Arm A is the tree's own resume. Arm B is a resume keyed by the item's content and the
evaluator's identity, written as a subclass in the probe (a demonstration of the rule,
not a patch proposed to the tree). The target is rows carrying another item's output and
results reported under an evaluator that did not produce them. The floor is that an
unchanged-configuration resume still reuses the whole cache.

| Case | Arm A (tree) | Arm B (keyed) |
| --- | --- | --- |
| Unchanged config, six items (floor) | 0 model calls, 0 evaluator calls, one evaluator's mean | identical: 0 and 0, same mean |
| Evaluator swapped, full cache | old evaluator's mean reported; the new evaluator called 0 times | new evaluator called 6 times, its own mean; model called 0 times |
| Evaluator swapped, half the eval rows missing | mean of both evaluators blended | only the new evaluator's rows |
| Resume after a sampled run (3 of 8 items) | 2 of 3 cached rows carry another item's output | 0 of 3 |

An unsampled resume of the same dataset bound 0 of 8 rows wrongly, which is the control
showing the instrument reports misbinding only when it is there. The target moved and the
floor held, so the verdict is `better`.

## What this cannot show

Resuming after a random sample is an unusual pair of flags and the tree's own guide only
describes the plain restart, so the second departure may never fire in practice. The
first is one flag away for anyone who edits an evaluator and types the resume shorthand.
Both arms ran on invented items with stubbed scorers: the counts prove the binding rule,
not how often a real run trips it. The tree has no fingerprint of the model, the prompt
or the evaluator to key on, so arm B's identity key is an addition, not a fix to a
missing check.
