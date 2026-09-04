---
layer: technique
type: technique
subject: workflow-property-contracts
technique: mid-iteration-event-seams
status: forged
laws:
  - one-authority-per-vocabulary
  - failure-not-empty-success
shared_with: []
use_when: [a host needs to observe or react inside a training step it does not own, deciding whether new behaviour goes in the loop or in a handler, wiring validation or checkpointing onto a trainer]
---

# Mid-iteration event seams

A training loop that exposes only "epoch started" and "epoch completed" forces every
observer that needs the loss, the gradients or the model output to be written into the
loop itself, and the loop grows a flag per observer until it is a monolith with
options. The stance: **the loop owns everything that touches tensors and gradients,
and between its stages it publishes named events**; everything that observes or reacts
is a handler on one of those events, mutates the loop's state, and returns nothing.
Decollation, post-processing, metric accumulation, checkpointing and the trigger that
runs validation are all handlers. Nothing else is in the loop.

## The rule that decides where code goes

Ask one question of any new behaviour: does it touch a tensor or a gradient as part of
producing the step's output? If yes, it belongs in the iteration — the forward pass,
the loss, the backward pass, the optimizer step, and whatever mixed-precision or
accumulation logic those need. If no, it is a handler. The iteration leaves its result
in a well-known place in the loop's state — the output record with the prediction and
the target — and handlers read from there. Logging reads the loss from the state.
Metrics read the prediction and the target. The checkpoint handler reads the model.
None of them are passed anything; all of them attach to an event and read the state
when it fires.

The failure mode of ignoring this rule is a loop with a `validate_every` argument, a
`log_every` argument, a `save_best` argument, and a growing set of hooks that receive
positional arguments whose order nobody remembers. Each argument is a handler that was
written into the loop because there was no seam to attach it to.

## The events

The loop publishes the usual lifecycle pairs — run, epoch and iteration, each started
and completed — and, between the stages of one iteration, a mid-iteration set:
**forward done**, **loss done**, **backward done**, **model done** (the optimizer has
stepped). Where the iteration has an inner loop — multiple inner steps per batch — an
inner-iteration started-and-completed pair joins them. Those names are a closed
vocabulary with one definition that the loop publishes and every handler imports
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)); a
handler that spells an event name as a string of its own is a handler that fires on
nothing after a rename, without an error.

The mid-iteration events are the seams the lifecycle events cannot provide. A host
that wants the loss per step, not per epoch, attaches to loss-done. A host that
inspects gradients before the step attaches to backward-done. A host that transforms
the model's output before anything else sees it attaches to model-done, first.

## Decollation and post-processing are handlers, and their order matters

The output of a step is a batch. Metrics and post-processing transforms are written
per item, in channel-first layout, because that is what a transform author can reason
about. So two handlers are attached to model-done, in this order: first, one that
decollates the batch into a list of per-item records; second, one that applies the
post-processing transforms to each record. The order is not negotiable — post-
processing on an undecollated batch applies a per-item transform to a stacked tensor
and either fails or, worse, produces plausibly-shaped nonsense — and the loop
registers both itself, in that order, before any host handler can attach, so that a
host's model-done handler always sees decollated, post-processed output.

The general lesson: handler order on one event is registration order, and where an
order dependency exists between two handlers, the loop registers both. A dependency
left to the host's registration order is a defect that a config reorder will expose.

## Handlers mutate; they never return

A handler receives the loop and reads or writes its state. It returns nothing. A
protocol in which a handler's return value steers the loop — "return the modified
output", "return whether to continue" — makes the loop's behaviour depend on which
handler ran last, which is registration order again, and it cannot be read off the
list of handlers a workflow declares. A handler that wants to stop the run sets the
loop's terminate flag; one that wants to change the output writes the output record.
The state is the channel.

Validation is the canonical case. A validator is a full second workflow, not a mode
of the trainer. The trainer runs it through a handler attached to epoch-completed with
a stride — every so many epochs, or every so many iterations for a run whose epochs
are too long to wait for, with an option to run once at start so a resumed run has a
baseline — which calls the validator with the trainer's current epoch so the
validator's records line up. The trainer does not know the validator exists; the
handler does, and a handler invoked with no validator set fails loudly rather than
running nothing. That is why the validator can be wired after the trainer is
constructed, through a setter whose argument name is the validator's stable address,
and why a key-metric comparison for checkpointing lives in the validator's
epoch-completed, comparing this epoch's value against the best so far and recording
the improvement in state for a checkpoint handler to act on.

One comparison rule: when the key metric is not a scalar — a per-class vector, a
structure — the comparison cannot run, and the loop must say so at a level the
operator sees, not skip it and continue. A best-checkpoint that never updates because
the comparison was silently skipped is a run that reports success and saved nothing
useful ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Decision rules

When new behaviour reads state and writes state, make it a handler and pick the
earliest event at which the state it needs exists. When two handlers on one event
depend on each other, register both from the loop in the required order and do not
expose the order to the host. When a host needs a seam the loop does not publish,
add an event rather than an argument. When a handler needs a value from another
handler, pass it through the loop's state under a name, never through a return value.

Do not put the loss computation in a handler on forward-done to keep the loop small;
the loss touches tensors and gradients, and a loop whose backward pass depends on a
handler having fired is a loop that trains nothing if the handler is missing. Do not
add a mid-iteration event a handler cannot usefully act on — an event after the
optimizer step but before the model-done event is a distinction without a consumer.
