---
layer: application
type: application
subject: workflow-property-contracts
technique: wiring-location-checks
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
source: Project-MONAI/MONAI
---

# The two-check property contract in MONAI's bundle workflows

MONAI at commit `02201b8600df372cb425f2bb8e0cb7addd0df50f` (`pyproject.toml:20` pins
`requires-python = ">=3.10"`). The bundle subsystem is the source this subject was
reconciled against: a property table, a required-existence check in the base class, and
an optional-wiring check in the config-backed subclass. This application traces the
wiring check and the required check it extends, and records the one place the tree
falls short of the technique.

## The record, and the table as the one authority

`monai/bundle/properties.py:11-23` is the module docstring, and it states the contract
in the technique's own terms: "optional properties mean: if some component of the
bundle workflow refer to the property, the property must be defined, otherwise, the
property can be None". Each entry has four values — description, required flag,
config item ID, reference config item ID — and the last two are marked "only
applicable when the bundle workflow is defined in config", which is the seam the
code-backed implementation steps through.

The docs are derived from the table, not written beside it: `docs/source/conf.py:64-69`
builds `train_properties.csv`, `infer_properties.csv` and `meta_properties.csv` from
`TrainProperties`, `InferProperties` and `MetaProperties` at documentation build time.
Only the first three columns are exported (`.iloc[:, :3]`), so the reference ID — the
field this technique is about — is the one field a reader of the docs never sees.

## The reference location that is an argument name

`monai/bundle/properties.py:101-106` is the `evaluator` entry: optional, config ID
`validate::evaluator`, and `REF_ID: "validator"` with the inline comment "this REF_ID
is the arg name of `ValidationHandler`". `val_interval` at `:107-112` does the same with
`REF_ID: "interval"`. Every other optional property's reference ID is a config path;
these two are argument names, because the handler that consumes them sits at an
unknown index in `train::handlers`.

`monai/bundle/workflows.py:632-661` is `_check_optional_id`, the wiring check. The
procedure matches the technique line for line: no reference ID means skip (`:644-647`);
for `evaluator` and `val_interval` it walks `train::handlers` and matches the handler
by kind — `h["_target_"] == "ValidationHandler"` — then reads the named argument from
the match (`:650-654`); otherwise it reads the reference ID directly (`:655-656`); and
it fails only when the value is neither an expression (`startswith(EXPR_KEY)`) nor
exactly `@` plus the property's own ID (`:659-660`). Match-by-kind-then-read-by-name
is the upward lesson this tree taught the technique: the "unknowable position" is
resolved, not skipped. When no validation handler is present, `ref` stays `None` and
the check returns `True` — nothing refers to the evaluator, so its absence is
legitimate.

## The required check, and where it falls short

`monai/bundle/workflows.py:256-264` is the base `check_properties`: `None` when no
workflow type was given (the "not checked" outcome the technique demands, distinct
from an empty list), otherwise a comprehension over required properties with
`not hasattr(self, n)`. `ConfigWorkflow.check_properties` (`:531-553`) calls it, then
appends every optional property whose wiring check failed, and returns the combined
list — one report for both sets.

The probe is where the tree falls short. `hasattr` swallows only `AttributeError`, but
`ConfigWorkflow._get_prop_id` (`:573-580`) raises `KeyError` for a required property
absent from the config, and `_get_property` (`:582-594`) raises `RuntimeError` before
`initialize`. Run against a config missing `dataset_dir` at this commit,
`check_properties()` raises `KeyError: "Property 'dataset_dir' with config ID
'dataset_dir' not in the config."` instead of returning `["dataset_dir", ...]`, and
before `initialize()` it raises the `RuntimeError`. The check also resolves — that is,
instantiates — every required component through `get_parsed_content` on the way to
answering `hasattr`, so it is not the pure read the technique asks for. The test suite
never exercises a missing required property: `tests/bundle/test_bundle_workflow.py:67`,
`:172` and `:178` assert only `check_properties() == []`. Deviation recorded; the
standard — a list of names, from a probe that instantiates nothing — stays.

## The consumer protocol as a test

`tests/bundle/test_bundle_workflow.py:64-99` is the sequence the technique states:
`initialize()` (`:65`, under the comment "should initialize before parsing any bundle
content" at `:64`), `check_properties() == []` (`:67`), reads of `bundle_root`, `device`,
`network_def`, `inferer`, `preprocessing`, `postprocessing` by attribute (`:69-78`), an
optional read returning `None` (`inferer.key_metric is None`, `:80`), sets of the same
names (`:81-88`), a second `initialize()` because "changed the bundle content" (`:91`),
then `run()` and `finalize()` (`:92-93`). Nothing in the test names a config key, which
is the discipline the host layer inherits: `monai/bundle/scripts.py:1940-2009`
(`create_workflow`) resolves a workflow class by name or dotted path, constructs it
from a config file or from keyword arguments, calls `initialize()` and returns it —
the only address a host ever holds.
