---
layer: application
type: application
subject: generated-workflow-candidates
technique: template-filling-with-provenance
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# Template filling with provenance, in MONAI's Auto3DSeg

Read against MONAI at commit `02201b8600df372cb425f2bb8e0cb7addd0df50f`
(`requires-python = ">=3.10"` in `pyproject.toml:20`). Auto3DSeg is the
generator this subject was forged from: `DataAnalyzer` writes the statistics,
`BundleGen` fills algorithm templates into MONAI bundles, `AutoRunner`
drives the stages, and `AlgoEnsembleBuilder` selects. This application
follows one candidate from template to fill record.

## The fill is one overridable function that returns a mapping

`BundleAlgo.fill_template_config` (`monai/apps/auto3dseg/bundle_gen.py:155-170`)
is the whole fill seam. Its signature takes the statistics filename and the
candidate's output path and returns, per its docstring, "the records of
filling template config: `{"<config name>": {"<placeholder key>": value,
...}, ...}`" — the per-configuration-file mapping the technique asks for.
The base implementation returns `{}`, and the Notes block says why in the
technique's own words: "Template filling is optional. The user can construct
a set of pre-filled configs without replacing values by using the data
analysis results." The concrete algorithm templates (fetched from a
separate release, below) override it; the base class never assumes a
template needs filling.

## Export copies, fills, and keeps the record

`export_to_disk` (`bundle_gen.py:172-195`) is the two-step the technique
describes. With `copy_dirs=True` (the default) it copies
`algorithm_templates/<Algo>` to `output_path/algo_name` with `shutil.copytree`
(`:184-190`), then, unless `fill_template=False`, assigns
`self.fill_records = self.fill_template_config(...)` (`:193-194`). The
record is not written to disk here; it becomes durable because
`BundleAlgo.state_dict` (`bundle_gen.py:370-391`) includes `"fill_records":
self.fill_records` alongside `name`, `output_path`, `data_stats_files` and
`best_metric`, and `algo_to_json` (`monai/auto3dseg/utils.py:328-358`)
serializes that state dictionary into `algo_object.json` inside the
candidate's own folder, under `_state_`, beside `_target_` (the fully
qualified class) and `template_path`. So the provenance log travels with the
bundle in the bookkeeping record, and a reviewer who opens
`<work_dir>/<algo>_<fold>/algo_object.json` reads which placeholders in
which config the generator set.

The reload path re-expresses the record through the bundle config language:
`algo_from_json` (`utils.py:423-468`) requires `_target_`, builds
`{"_target_": target}` and calls `ConfigParser(algo_config).get_parsed_content()`
to instantiate the class (`:491-497`), then restores the state through
`load_state_dict`. A legacy `.pkl` is accepted with a `FutureWarning`
(`:446-453`), and the pickling writer itself is `@deprecated(since="1.6")`
and refuses unless `MONAI_ALLOW_PICKLE=1` (`utils.py:678-693`) — the
supply-chain doctrine's named, per-process opt-in, which this subject cites
rather than re-mints. `docs/source/whatsnew_1_6.md:25-29` records the
migration and the advisory (GHSA-qxq5-qhx6-94qw) that drove it.

## A template may decline the dataset

`pre_check_skip_algo` (`bundle_gen.py:105-114`) is the opt-out hook: it
returns `(skip_bundlegen, skip_info)` and its docstring says it "is
overriden within algo" — each template inspects the statistics report and
says whether it applies. `BundleGen.generate(..., allow_skip=...)` honours
it (`auto_runner.py:860`), so a template that cannot handle the dataset is
skipped with its reason logged rather than generating a candidate that
fails in training.

## Templates are fetched by pinned hash

`default_algo_zip` (`bundle_gen.py:405-407`) points at a release asset named
by `ALGO_HASH` — `.../releases/download/algo_templates/{ALGO_HASH}.tar.gz` —
so the template set a candidate was generated from is a pinned identity,
not "latest". The hash is recorded in code, not in each candidate's record;
a consumer who wants to know which template version produced a bundle
reads it from the MONAI version that generated it.

## Where the tree falls short of the technique

Two deviations, recorded here so the standard is not lowered.
`export_to_disk` accepts `copy_dirs=False`, under which `self.output_path =
str(self.template_path)` and the fill writes into the template in place
(`bundle_gen.py:191-192`) — a mutation of the pinned input the technique
forbids. And the hyperparameter-search generators pass searched values as
train-time overrides (`hpo_gen.py:233`, `self.algo.train(self.params)`)
after exporting with `fill_with_datastats=False` (`:195-197`), so a trial's
configuration files do not carry the searched values and its fill record
does not mark them; only the trial folder name (`get_task_id`, `:176-181`)
encodes them.
