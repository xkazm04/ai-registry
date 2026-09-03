---
layer: application
type: application
subject: federated-client-contracts
technique: contract-driven-hosting
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# Contract-driven hosting in MONAI's federated client

MONAI's `MonaiAlgo` (`monai/fl/client/monai_algo.py`, pinned at commit
`02201b8600df372cb425f2bb8e0cb7addd0df50f`) is the training-side `ClientAlgo` that NVIDIA
FLARE hosts at each site. It drives a MONAI bundle through the bundle's `BundleWorkflow`
property contract and never through the bundle's config paths, which is what lets the same
bundle train locally and federate unchanged. The abstract verb set it implements is
`monai/fl/client/client_algo.py:17-149`: `BaseClient` carries `initialize`/`finalize`/`abort`,
`ClientAlgoStats` adds `get_data_stats`, and `ClientAlgo` adds `train`/`get_weights`/`evaluate`.

## Initialize: create once, set names, re-initialize, read by name

`MonaiAlgo.initialize` (`monai_algo.py:507-539`) constructs a `ConfigWorkflow` only when
`self.train_workflow is None`, so one workflow object outlives every round. It then calls
`initialize()`, sets two contract properties — `train_workflow.bundle_root` and
`train_workflow.max_epochs = self.local_epochs` — disables checkpoint loaders, and calls
`initialize()` a second time under the comment "initialize the workflow as the content
changed" (`:513-514`). Only then does it read `self.trainer = self.train_workflow.trainer`
and refuse with a `ValueError` unless the object is a `SupervisedTrainer` (`:515-517`); the
evaluator path mirrors this at `:531-539` with `SupervisedEvaluator`. The second
initialization and the kind check are the two things the technique's initialize step
requires beyond the sibling subject's name-only discipline, and both are present.

The statistics client does the same with dataset descriptors: `get_data_stats` reads
`self.workflow.dataset_dir`, `self.workflow.train_dataset_data` and
`self.workflow.val_dataset_data` (`:227-259`), which is why those three are properties of
the training workflow at all.

## Train: hold the base, set a cumulative budget, count on the engine

`train` (`:569-606`) loads the global weights via `convert_global_weights` (`:58-74`), which
walks the *local* state dict and reshapes each matching global tensor to the local shape
(the docstring names homomorphic-encryption secure aggregation as the reason tensors may
arrive flattened), returning a match count that `_check_converted` (`:768-776`) turns into a
`RuntimeError` when zero. The reshaped copy is held as `self.global_weights` for the delta.
The round budget is set on engine state, cumulatively: `self.trainer.state.max_epochs =
self.trainer.state.epoch + self.local_epochs` (`:599`), and the iteration count at round
start is captured from the engine, `self.iter_of_start_time = self.trainer.state.iteration`
(`:601`). After `self.trainer.run()`, `get_weights` reports
`stats[FlStatistics.NUM_EXECUTED_ITERATIONS] = self.trainer.state.iteration -
self.iter_of_start_time` (`:659`) — the engine's counter minus the engine's counter, never
a host-side tally.

## Where the anchors sit relative to the standard

Two points fall short of the technique and are recorded as deviations rather than
adopted. `disable_ckpt_loaders` (`:98-103`) addresses the handler list by the config path
`"validate#handlers"` and matches `"CheckpointLoader"` as a substring of `_target_` — a
path the host remembered from one bundle layout, not a contract-named collection — and it
is skipped entirely for a `PythonicWorkflow` (`isinstance(..., ConfigWorkflow)` at `:511`,
`:535`), so a code-first bundle trains with its loaders live and nothing says so. And the
round budget is set on `state.max_epochs` directly rather than through the workflow's
`max_epochs` property, which is fine for the engine the host already type-checked but is
the one place `train` touches an object's internals.

## Related sightings

`abort` (`:736-748`) calls `self.trainer.interrupt()`, an engine flag observed at the next
safe point, and `finalize` (`:750`) calls `terminate()` — the asynchronous-abort contract
the lifecycle technique describes. `_warn_provisioned_config_execution` (`:38-55`) is
called from both `initialize` implementations (`:190`, `:492`) and states the accepted
trust cost as a runtime warning naming the bundle root, `_target_` resolution and `$`
evaluation, with a link to the project's advisory.
