---
layer: technique
type: technique
subject: windowed-inference-over-oversized-inputs
technique: failure-driven-memory-degradation
status: forged
laws: [failure-not-empty-success, verdict-survives-boundary]
shared_with: []
use_when: [the same inference code must run on machines with very different accelerator memory, an inference call fails with out-of-memory on some inputs and not others, deciding what a stitcher should do when its canvases do not fit]
---

# Failure-driven memory degradation

Every memory parameter in a windowed stitcher — the canvas device, the buffer
size, the threshold that moves canvases to the host — is a prediction about a
machine, and the machine is not known when the code is written. The same code
runs on a workstation with a small accelerator, on a shared server beside jobs
it cannot see, and on a large node with nothing else on it. A configuration
that fits one of them fails on another, and the failure arrives as an
out-of-memory error thrown from inside the model's forward pass or from the
canvas allocation, with the operator holding the parameters.

The rule is that the stitcher **descends a fixed ladder on failure** and
**remembers where it fell**.

## The ladder

The rungs are strategies that produce the same result at decreasing speed and
decreasing accelerator memory, in this order:

1. Canvases on the accelerator, no buffering. Fastest; the whole output must fit
   beside the model.
2. Canvases on the host, with a band buffer on the accelerator of some number of
   windows along the longest axis. The accelerator holds the model, a batch,
   and one band.
3. The same, with the band halved. Repeated until the band is one window.
4. Canvases on the host, no buffer. Every window transferred individually. Fits
   by construction, because the accelerator holds only the model and one batch,
   and if that does not fit the input was never going to be processed on this
   machine.

The ladder is fixed and ordered, not searched. A search over parameters that
tries combinations until one fits is unbounded in time and leaks the failure's
cause into which combination happened to succeed; a ladder has a known depth,
each rung is a strategy a practitioner would have chosen by hand, and the rung
reached is a legible fact about the machine.

Every rung produces the same canvas to within floating-point reassociation.
That is the property that makes the ladder a memory policy and not a
degradation of the result, and it is the property that separates this from a
capability fallback: a caller cannot tell, from the output, which rung ran.

## Bounded, and loud at the bottom

The number of trials is bounded — a small fixed count above the ladder's depth,
so that a halving sequence terminates — and exhausting it raises the original
out-of-memory error. The alternative, returning whatever canvas exists when the
last trial fails, is a partial result presented as a whole one, and it is the
one thing a stitcher must never do
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
Each rung starts from fresh canvases; a rung that fails mid-way has written
into accumulators that the next rung discards.

Between rungs, release the accelerator's cached allocations. An out-of-memory
error often leaves the allocator fragmented with the failed attempt's blocks
still held, and the next rung fails on memory that would have fit had it been
returned.

## Classifying the failure

The ladder is descended only on out-of-memory, never on any other error. A
shape mismatch, a bad input, a model bug — descending on those retries a
deterministic failure four times at increasing cost and then raises the same
error, and it hides the real cause under an unrelated memory message.

The difficulty is that runtimes rarely give out-of-memory a type a caller can
catch cleanly; it is often a generic runtime error whose class name or message
names the condition. The rule is that the classification happens at **one
door** — a single predicate that inspects the raised error and answers
"out-of-memory or not" — and every rung consults that predicate rather than
matching on text itself. The verdict is computed once and carried as a typed
value to the loop that acts on it
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary));
three rungs each matching the message in their own way is three chances for one
of them to descend on the wrong error. The predicate is also the place a
runtime change lands: when the error's class is renamed, one function changes.

## Remembering the threshold

The ladder's first descent costs a failed attempt at the first rung, and that
attempt is not cheap — the model ran over some windows before the allocation
failed. The next input of the same size will fail the same way. The rule is
that when the first rung fails, the stitcher **writes the observed size back as
its threshold**: the element count of this output, less one, becomes the size
above which canvases go to the host directly. The next similar input starts on
the rung that worked.

The band size is remembered the same way. When the buffered rung halves its
band and succeeds, the halved band is written back as the instance's band size,
so the next input starts at the band that fit rather than at the one that did
not. Every rung that was reached by descent leaves its parameter behind.

Three properties keep the memory honest. It is a **ratchet**: the threshold only
tightens, because a rung that fit once is not evidence that it will fit again
under a different neighbour. It is **visible**: the write-back is logged with the
size and the rung, because a threshold that tightened on a transient failure —
another process's peak, an allocator in a bad state — is a permanent slowdown,
and the only defence is an operator who can see it happen. And it is
**resettable**: the stitcher exposes the threshold as a value the operator can
restore, so a machine that was misjudged during a busy hour is not condemned to
the slow rung for the process lifetime.

The threshold lives for the process, keyed on nothing but size. That is the
right scope for a policy learned at runtime — a new process on a new machine
starts fresh — and the wrong scope for anything persisted: a threshold written
to disk would need to be keyed on the model, the device and its memory, and
invalidated when any of them changes, which is the discipline of a capability
record and not of this technique.

## The operator's explicit choice wins

The ladder engages only when the caller left the canvas device unspecified. A
caller who named the canvas device has made the decision the ladder exists to
make, and the stitcher runs that configuration once and raises if it fails.
Adapting over an explicit choice would mean the operator who pinned the canvas
to the accelerator for a latency budget gets a silent host stitch instead, and
the one who pinned it to the host to protect a shared accelerator gets an
attempt on the accelerator first. Unspecified means "you choose"; specified
means "I chose".

## Choosing the buffer axis automatically

When the ladder reaches the buffered rung and the caller did not choose a
buffer axis, choose the longest spatial axis, provided it is at least twice the
length of the axis that would otherwise be the default; a band along the
longest axis has the fewest bands and the widest transfers. When no axis
dominates, the choice does not matter much and the default axis serves.

## When not to use this

When the deployment is a single known machine with a single known input size,
measure once and set the parameters; the ladder costs a failed attempt per
process and buys nothing. When the failure is not memory — a timeout, a bad
input — the ladder must not engage, which is what the classification door is
for. And never let the ladder mask a model that is genuinely too large for the
accelerator: the bottom rung fails, and the error it raises is the correct
answer.
