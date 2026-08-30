---
layer: application
type: application
subject: cross-provider-benchmark-operations
technique: target-matrix-runs
stack: python
status: forged
verified_on: 2026-08-30
verified_against: python@3.12
source: EleutherAI/lm-evaluation-harness
---

# Python: lm-evaluation-harness declares the case axis, and leaves the target axis to the operator

EleutherAI's `lm-evaluation-harness`, version `0.4.13.dev0` (`pyproject.toml:7`)
at commit `4e7e0d47f33bc71070c1d38394bafbb52b117163` (2026-08-21), is the tree
most model releases quote their numbers from. It holds two of this technique's
five rules hard, does not implement two, and inverts the first — and the
inversion is the interesting part.

## Rule 1 — declare the matrix in the definition: half held, half inverted

The **case** axis is declared, and declared well. A group YAML names its
children (`lm_eval/tasks/mmlu/default/_mmlu.yaml:1-9`: `group: mmlu`, four
subgroups, `aggregate_metric_list` with `weight_by_size: True`), and
`TaskManager` resolves names, globs and tags to leaf tasks
(`lm_eval/tasks/manager.py:179-236`). Constructing a `TaskManager()` over this
commit indexed **14,562 names — 841 groups, 697 tags, 13,024 leaf subtasks**
(measured, probe below).

The **target** axis is not declared at all. `--model` is a plain `type=str`
with no `nargs` (`lm_eval/_cli/run.py:77-84`), against `--tasks` with
`nargs="+"` (`:66-76`); `simple_evaluate` takes `model: str | LM`, singular
(`lm_eval/evaluator.py:55-56`). One invocation is **one target × many cases**.
The cross-provider matrix is assembled afterwards by reconciling result files,
which the writer supports rather than performs: results land under
`<out>/<model_name_sanitized>/results_<iso-timestamp>.json`
(`lm_eval/loggers/evaluation_tracker.py:271-280`).

**Finding — the technique, not the code.** Rule 1 reads as if one process owns the
whole cross product, but a harness spanning vLLM, HF-local and hosted APIs cannot:
each target needs its own weights, device and environment. The rule that survives
is weaker and better — *the matrix's non-target axes are declared once and shared
verbatim, and each target records enough to prove it ran that declaration.*

## Rule 3 — score per cell, aggregate per target: confirmed, and hashed

With `log_samples`, every (case, filter) cell is written whole — `doc_id`,
`doc`, `target`, raw and filtered responses, per-sample metric values
(`lm_eval/evaluator.py:644-665`). Three SHA-256 digests (`lm_eval/utils.py:129-130`)
ride along: `doc_hash` over the serialized document, `prompt_hash` over the
rendered context actually sent, `target_hash` over the gold string
(`evaluator.py:655-664`). The writer folds them into one per-task fingerprint:

```python
sample_hashes = [s["doc_hash"] + s["prompt_hash"] + s["target_hash"] for s in task_samples]
task_hashes[task_name] = hash_string("".join(sample_hashes))
```

(`lm_eval/loggers/evaluation_tracker.py:249-260`.) **This is the harness's answer
to "were these two columns run on the same workload":** two result files from two
providers are commensurable iff their `task_hashes` agree.

Group aggregation carries its own receipt: `Group.aggregate` weights subtask means
by `sample_len` (`lm_eval/api/group.py:267-271`), warns naming the subtasks that
lacked the metric (`:253-260`), and stores `sample_count` per metric key (`:271`),
so a group mean over a partial subtask set is detectable in the artifact, not only
in the log. A leaf task claimed by two requested specs is a hard `ValueError`, not
a double-weighted case (`lm_eval/tasks/manager.py:283-305`).

**Sharpened sub-claim — the fingerprint conflates cases with rendering.** Because
`prompt_hash` is in the fold, `task_hashes` changes when the *prompt rendering*
changes even though the case set is byte-identical: measured below for
`--num_fewshot`, and by the same mechanism for `--apply_chat_template` — which is
precisely what differs between two providers. The digest proves "same declaration end to
end" but cannot separate different cases from different prompt; the case-only pin,
the ordered `doc_hash` list, is folded nowhere. Fold both, report which broke.

## Rule 4 — three axes: refuted, quality only

`_EvalConfig` and `EvalResults` carry no cost and no latency field
(`lm_eval/result_schema.py:19-106`); only the tracker's whole-run wall clock exists
(`evaluation_tracker.py:118-120`). Grep-scoped over the engine, tasks excluded:

```
grep -rniE "\b(cost_usd|price|pricing|usd|cost_per|token_cost)\b" --include=*.py lm_eval/ | grep -v tasks/  -> 0 lines
grep -rniE "latency" --include=*.py lm_eval/ | grep -v tasks/  -> 1 line (a comment, neuron_optimum.py:104)
```

A program on this instrument must join cost and latency from the serving layer —
exactly the two-different-worlds join the golden path warns against.

## Rules 2 and 5 — judging: not implemented, so not evidence

Generation is separated from *scoring*, but scoring is mechanical
(`task.process_results`, `evaluator.py:639-641`), never a model.
`grep -rniE "judge" --include=*.py lm_eval/` returns 12 lines, **all** in per-task
helper files (`tasks/ifeval/instructions_util.py`, `tasks/pisa/utils.py`, …), zero
in the engine. Rules 2 and 5 have no counterpart here — passed over, not refuted.

## Executed evidence

2026-08-23, Python 3.12.1, `pip install -e .` in the clone, offline: two
synthetic 8- and 6-case JSONL tasks plus a group over them, model `dummy`;
scripts in `<scratch>/worker-cross-provider-benchmark-operations/scratch/probe{1,2,3}.py`.

- **Two runs, same declaration** → byte-identical `task_hashes`
  (`probe_a: 86c0…0024`), identical `group_subtasks` and `sample_count`.
- **`--limit 3`** → `task_hashes` changed; `n-samples` recorded
  `{"original": 8, "effective": 3}`; selected `doc_id`s were `[0, 1, 2]` — a
  **prefix**, not a sample. `get_sample_size` (`evaluator_utils.py:49-54`) then
  `islice(iter, rank, limit, world_size)` (`utils.py:622-628`) is the whole
  mechanism; its docstring says "only use this for testing" (`evaluator.py:113-115`).
  A fractional limit is `ceil(len(eval_docs) * f)`, so it re-selects as data grows.
- **`--samples {"probe_b": [0,1,2]}`** reproduced the `--limit 3` hash for that
  task exactly; `[5,6,7]` gave a different one. `--samples`
  (`api/task.py:576-597`) is the real case pin.
- **`--num_fewshot 2`** → `task_hashes` changed while the ordered `doc_hash`
  list was **unchanged** — the conflation above, executed.
- **`load(["probe_suite", "probe_a"])`** → `ValueError: Duplicate task
  'probe_a': found in both 'probe_suite' and 'probe_a'`.

## One finding for the sibling technique

No shipped task pins its dataset revision:
`grep -rn "revision" --include=*.yaml lm_eval/tasks/` over 13,872 YAML files (845
carrying `dataset_path`) returns exactly **one** line — Italian prose in an MMLU
translation. The mechanism exists: `dataset_kwargs` is splatted into
`datasets.load_dataset` (`api/task.py:869-873`), so `revision:` passes through.
Nobody uses it, so the content pin is retroactive: `doc_hash`, after download.
