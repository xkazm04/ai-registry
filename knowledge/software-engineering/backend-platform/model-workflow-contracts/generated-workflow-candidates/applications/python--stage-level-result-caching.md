---
layer: application
type: application
subject: generated-workflow-candidates
technique: stage-level-result-caching
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# Stage-level result caching, in MONAI's AutoRunner

Read against MONAI at commit `02201b8600df372cb425f2bb8e0cb7addd0df50f`
(`requires-python = ">=3.10"`, `pyproject.toml:20`). `AutoRunner`
(`monai/apps/auto3dseg/auto_runner.py`) fronts the four stages — analyze,
algo_gen, train, ensemble — and is the reference realization of a runner
whose default is run-if-not-cached.

## Per-stage flags default to "decide from cache"

The constructor docstring (`auto_runner.py:66-76`) states the contract for
three of the four stages in identical words: `analyze`, `algo_gen` and
`train` each "Defaults to None, to automatically decide based on cache, and
run ... only if we have not completed this step yet." The same block states
the search support in one line — "Currently, only NNI Grid-search mode is
supported" (`:76-77`) — and `not_use_cache` (`:80`) is the global
force-everything switch. The resolution is at `:260-261`: `self.analyze =
not self.cache["analyze"] if analyze is None else analyze`, and likewise for
`algo_gen`; an explicit `True` or `False` overrides the cache either way.

## The marker is an index the check re-verifies

The cache is a marker file, `cache.yaml` in the working directory
(`:255`), with keys `analyze`, `datastats`, `algo_gen`, `train` (`:358`). It
would be the sentinel the technique warns against, except that `read_cache`
(`:348-383`) re-verifies each claim against its result before trusting it:
`analyze` is downgraded to `False` unless `datastats` names a file that
exists on disk (`:368-371`); `algo_gen` is downgraded unless
`import_bundle_algo_history(self.work_dir, only_trained=False)` finds at
least one serialized `algo_object.json` (`:373-376`); `train` is downgraded
unless the same import with `only_trained=True` finds at least one
(`:378-381`). The marker points; the result decides — this is the upward
lesson the technique now carries in its "marker as index" paragraph.

Each stage writes its claim only after its work: `export_cache(analyze=True,
datastats=self.datastats_filename)` at `:829`, `export_cache(algo_gen=True)`
at `:863`, `export_cache(train=True)` at `:893`.

## Completion is per candidate, read from the record

The train stage (`:867-895`) shows the two-level check. The stage-level
cache flag decides whether the stage is entered at all; inside it, when the
choice was automatic (`auto_train_choice = self.train is None`), the runner
re-imports every candidate's record and filters on `AlgoKeys.IS_TRAINED`
(`:879-885`), logging "Skipping already trained algos ... Set option
train=True to always retrain all algos." A candidate's completion is the
`is_trained` state in its own bookkeeping, not the presence of a weights
file, and it is written by the training path together with the score
(`AlgoKeys.SCORE = "best_metric"`, `monai/utils/enums.py:690-702`) via
`algo_to_json(..., **algo_meta_data)` (`monai/apps/auto3dseg/hpo_gen.py:235-238`
for the search path). The keys are one enumeration, `AlgoKeys`, whose
docstring also fixes the identity format the ensembler later parses:
"`ID` is the identifier of the algorithm. The string has the format of
`<name>_<idx>_<other>`" (`enums.py:692-693`).

An entered train stage with no generated candidates raises rather than
succeeding empty: "Could not find training scripts in ... Possibly the
required algorithms generation step was not completed." (`:872-876`).

## Where the tree falls short

Three deviations. The stage-level `train` claim survives `read_cache` when
*one* trained record exists (`:378-381`), and the stage is entered
automatically only when that claim is false (`:869`), so a run that trained
one of five candidates and crashed reports the stage as cached on the next
run and the per-candidate filter at `:879-885` never sees the other four;
the operator must pass `train=True`, which then retrains all five. The
per-candidate state is right and the stage-level check does not read it.
Forcing analysis does not cascade: `analyze=True` re-runs
analysis and writes a new `datastats` path, but `algo_gen` stays cached and
the existing candidates keep fills from the old statistics. And the
support statement for search lives in the runner's argument docstring
(`:76-77`) while `hpo_gen.py:32` exports both `NNIGen` and `OptunaGen` —
the enumeration of what is supported is not at the subclass the technique
asks for.
