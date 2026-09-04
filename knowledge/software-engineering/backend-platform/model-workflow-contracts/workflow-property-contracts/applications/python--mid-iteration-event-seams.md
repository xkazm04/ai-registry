---
layer: application
type: application
subject: workflow-property-contracts
technique: mid-iteration-event-seams
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
source: Project-MONAI/MONAI
---

# Mid-iteration events in MONAI's engine workflow

MONAI at commit `02201b8600df372cb425f2bb8e0cb7addd0df50f` (`pyproject.toml:20`,
`requires-python = ">=3.10"`). The training loop is a `Workflow` over a PyTorch Ignite
engine, and the property contract's `trainer` and `evaluator` are instances of it. This
application traces the event vocabulary, the two handlers the loop registers itself,
the validation trigger, and the attach duck-type — and records one place where the
loop's honesty stops at a warning.

## The event vocabulary has one definition

`monai/engines/utils.py:47-65` defines `IterationEvents`, an `EventEnum` with six
members: `FORWARD_COMPLETED`, `LOSS_COMPLETED`, `BACKWARD_COMPLETED`,
`MODEL_COMPLETED`, `INNER_ITERATION_STARTED`, `INNER_ITERATION_COMPLETED`. The docstring
pins each to a stage — forward is "when `network(image, label)` completed", loss "when
`loss(pred, label)` completed", backward "when `loss.backward()` completed", model "when
all the model related operations completed" (`:52-57`). `Workflow.__init__` registers
them on the engine (`monai/engines/workflow.py:176-182`) so handlers attach to the enum
member, never to a string of their own.

`monai/engines/workflow.py:47-53` states the design: "All trainer, validator and
evaluator share this same workflow as base class", and additional logic is attached
"based on Event-Handler mechanism". `:124` is the seam for the iteration itself —
`super().__init__(self._iteration if iteration_update is None else iteration_update)` —
the one function that owns tensors and gradients.

## Decollation and post-processing are handlers, registered in that order

`monai/engines/workflow.py:184-190` registers, from the constructor, first
`_register_decollate()` (when `decollate=True`) and then `_register_postprocessing()`
(when a post-processing callable is given), with the inline comment that post-processing
without decollation "may not work well because all the MONAI transforms expect
`channel-first` data" — the order dependency the technique says the loop must own.
Both are ordinary handlers: `_register_decollate` (`:196-209`) attaches
`_decollate_data` on `IterationEvents.MODEL_COMPLETED` and rewrites
`engine.state.batch` and `engine.state.output` in place; `_register_postprocessing`
(`:211-225`) attaches `_run_postprocessing` on the same event and applies the transform
per item over the decollated lists (`:222-225`). Neither returns a value; both mutate
`engine.state`.

## The key-metric comparison, and its one soft spot

`_register_metrics` (`:227-262`) attaches every metric by name and then registers
`_compare_metrics` on `Events.EPOCH_COMPLETED` (`:243-262`): it reads
`engine.state.metrics[key_metric_name]`, compares it with `self.metric_cmp_fn` against
`engine.state.best_metric`, and on improvement writes `best_metric` and
`best_metric_epoch` into state for a checkpoint handler to act on — state as the
channel, no return value. When the metric is not a scalar (`:248-253`) it emits
`warnings.warn("Key metric is not a scalar value, skip the metric comparison ...")` and
returns. A warning is visible, so this sits on the confirmed side of the technique's
rule; but a run whose best checkpoint never updates gets one warning per epoch and no
failure, which is the softest form of "say so" the rule admits.

`_register_handlers` (`:265-272`) is the attach duck-type: `for handler in handlers_:
handler.attach(self)`. Anything with an `attach(engine)` method is a handler; the loop
never inspects what it is.

## Validation is a handler that runs a second workflow

`monai/handlers/validation_handler.py:66-85`: `attach` registers the handler on
`Events.EPOCH_COMPLETED(every=self.interval)` or, when `epoch_level=False`, on
`Events.ITERATION_COMPLETED(every=self.interval)` (`:71-74`), and additionally on
`Events.STARTED` when `exec_at_start` is set (`:75-76`) — the epoch-or-iteration stride
and the run-at-start baseline that the technique folded in from this tree. `__call__`
(`:78-85`) raises `RuntimeError("please set validator in __init__() or call
`set_validator()` before training.")` when no validator is set, then calls
`self.validator.run(engine.state.epoch)`. `set_validator` (`:58-64`) is what lets a
config wire the evaluator after construction, and why the bundle property's reference
ID is the argument name `validator`.

The validator side is `monai/engines/evaluator.py:139-151`: `Evaluator.run(global_epoch)`
sets `state.max_epochs = max(global_epoch, 1)`, `state.epoch = global_epoch - 1` and
`state.iteration = 0` before delegating to the base `run`, so the validator's records
carry the trainer's epoch. The scout's anchor at `:131-137` is the forward-mode lookup
(`eval` versus `train`), not `run`; the citation above is corrected to the lines that
hold it.
