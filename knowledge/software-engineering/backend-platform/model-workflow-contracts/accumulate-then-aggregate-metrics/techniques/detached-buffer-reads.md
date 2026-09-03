---
layer: technique
type: technique
subject: accumulate-then-aggregate-metrics
technique: detached-buffer-reads
status: forged
laws: [one-validation-door]
shared_with: []
use_when: [accelerator memory rises linearly across a validation pass, two readers of one metric disagree, a downstream step modifies what a metric handed it]
---

# Detached buffer reads

The accumulator's buffer is the state the whole contract rests on, and it can be
corrupted from two directions without a single error being raised: by what is put
into it, and by what is handed out of it. The technique is two rules at the two
doors — **detach at append, clone at read** — so that the buffer holds nothing but
values and nothing outside the accumulator holds the buffer.

## Detach at append

A value computed from a model's output inside a differentiable computation carries
a reference to the graph that produced it. Append that value as it is and the
buffer keeps the graph alive: the forward pass of every batch, retained until the
pass ends, memory rising in a straight line across the epoch and released all at
once at reset. The symptom is an out-of-memory failure late in a long validation
pass that never appears on a short one, and the cause is a metric, which is the last
place anyone looks.

So the per-batch call severs its **inputs** from their graphs before computing
anything — a prediction and a reference that arrive attached are detached at the
door — and the value it appends is then a plain number with no history. Detaching
the inputs is sufficient, because a computation over detached inputs builds no
graph; running the metric under a no-graph mode as well costs nothing and guards
against an input the door did not see. The rule is on the input side because
detaching the output only would still have built and freed a graph per batch, which
is the memory the metric had no business touching.

## Clone at read

The read side is the subtler one. A metric that hands out its internal buffer — the
list of per-batch tables, or the concatenated union — has given a caller a handle
on its own storage. The caller sorts it in place to find a worst case, or
normalises it, or slices a view and writes through the view, and the next reader
sees a buffer the first one rewrote. Two handlers now disagree about one metric,
and the disagreement depends on handler order.

The buffer therefore has exactly one writer — the append — and every read returns
a **detached clone** of the synced buffer
([_laws: one-validation-door_](../../../../_laws.md#one-validation-door)): the
accumulator's storage is never aliased outside it, so the set of writers is the one
method and stays enumerable. A read of the buffer implies a sync, because the only
buffer worth reading is the union; a read on an unsynced accumulator in a
multi-process run triggers the gather exactly as an aggregate would, and the clone
is of the gathered result.

## What is cloned

The synced union, per buffer, and only the buffers asked for. A metric that keeps
parallel buffers — value and count, or three confusion cells — lets a reader ask
for one by position rather than forcing a clone of all of them. The default read
returns all, in the order they are appended, and a single-buffer metric returns the
one table rather than a one-element list, so the common case reads plainly.

## The memory case

A clone doubles the buffer's footprint for the duration of the read. For a metric
buffer this is almost never material: *N* samples by *C* classes of one float each
is kilobytes for a thousand cases and a few dozen classes. It becomes material when
the buffer holds inputs rather than values — a non-decomposable metric accumulating
scores and references — and the set is large. There the rule is to **move the
buffer to host memory at append** rather than to alias it at read: the accelerator
is the scarce resource and the metric's rows do not need to live on it, so the
append transfers each batch's rows out and the union is assembled and cloned where
memory is cheap. Handing out a read-only view is the last resort, and it is
documented as such at the read, because "read-only" is a promise the language may
not enforce.

## When not to use it

The tempting exemption is the aggregate itself: it lives inside the accumulator, so
it could read the storage directly and skip the clone. It should not, and the reason
is the reduction it performs. The standard way to reduce a table with undefined
cells is to mask them to zero, sum, and divide by the count — and the mask-to-zero
step **writes into the table**. An aggregate that reads the storage directly and
reduces this way has silently replaced every undefined cell in the buffer with a
zero, so the report writer that reads next sees zeros where the count says there
were none. The aggregate reads a clone like every other consumer, and the clone is
what makes an in-place reduction safe. The only reader exempt from the rule is one
that provably never writes, and that is a property of the code that is true until
the next edit.
