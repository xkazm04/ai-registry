---
layer: golden-path
type: golden-path
subject: deferred-operation-fusion
status: forged
use_when: [a chain of geometric or field operations resamples the same datum repeatedly, deciding whether an operation may be deferred and what forces it to run, adding an operation that must read current values to a lazy chain, proving a lazy execution path equals the eager one]
techniques:
  - algebraic-op-representation
  - single-flush-decision-point
  - data-dependent-opt-out-flag
  - compatibility-break-resample
  - explicit-barrier-operation
  - equivalence-oracle-testing
---

# Deferred operation fusion

A chain of operations on a datum — rotate, then scale, then crop, then flip — is
written as a sequence and, naively, executed as one. Each step reads the previous
step's output, produces a new array, and hands it on. For operations that resample
(anything that moves values between grid positions) this is wrong three times over:
every intermediate costs a full allocation, every intermediate adds a round of
interpolation error that the next one compounds, and an early crop throws away
values that a later rotation would have swung back into view, so the final image
carries a hole the eager order made and the intent never asked for. This subject
owns the alternative: each deferrable operation appends a **pending entry** that
describes what it would have done, entries accumulate on the datum, and the whole
stack is **fused into one operation and executed once** at a single flush point when
something forces materialization. It owns the algebra that lets entries compose, the
predicate that decides when to flush, the escape hatches for operations that must
see current values, and the oracle that proves the deferred path produces what the
eager path would have.

The pending queue itself — where it lives on the datum, how it survives being copied,
stacked, moved between devices or serialized — is not owned here. That belongs to the
sibling subject that owns self-describing envelopes: a value carrying its own geometry
and provenance. The seam is execution. The envelope owns the fact that a datum has a
list of pending entries and that the list travels with it; this subject owns what an
entry must contain to be fusable, who appends one, who drains the list, and what
"drain" computes. A reader asking "does the pending list survive a batch collate" is
in the envelope's territory; a reader asking "why did the crop see stale values" or
"why were two entries resampled separately" is here.

## The core stance: an operation is deferrable only if it is describable

The first commitment, and the one everything else derives from, is that **a deferred
operation is a description, not a closure**. A pending entry is data — a matrix, a
displacement field, the resampling parameters that would have applied — and never a
captured function waiting to be called. The reason is fusion. Two closures can only be
run one after the other, which is the eager path with extra bookkeeping; two matrices
can be multiplied into a third, and applying the third once is strictly cheaper and
strictly more accurate than applying the two in turn. An operation that cannot say
what it does in the chain's algebra cannot be deferred, and the correct response is not
to find a cleverer encoding but to declare that operation eager and let it force a
flush ([algebraic-op-representation](./techniques/algebraic-op-representation.md)).

From that follow the four rules a practitioner holds true.

**Laziness is a property of the operation, opted into per operation, and the pipeline
only chooses between honouring it and overriding it.** An operation that has not been
written to emit a pending entry does not become lazy because the pipeline asked; an
operation that emits one can still be told to run eagerly. The pipeline-level switch is
therefore a tri-state — force every capable operation lazy, force everything eager, or
honour each operation's own flag — and the default is the eager one, because a lazy
default makes every operation that forgot to opt in a silent correctness hazard
([explicit-barrier-operation](./techniques/explicit-barrier-operation.md) states the
three modes and their interactions).

**There is exactly one place that answers "must I materialize now".** Before every
operation, the executor consults one predicate over the operation's declared
properties and the pipeline mode, and that predicate either drains the pending list
into the datum or lets the operation append to it. The naive design scatters this
decision across the operations themselves, each checking whether its input "looks
pending"; that design works until an operation forgets, and it forgets silently,
because a datum with pending entries is still a perfectly valid array with the wrong
values in it. The predicate lives in one function, the operations declare properties
and never decide ([single-flush-decision-point](./techniques/single-flush-decision-point.md)).

**An operation that reads values is not the same as an operation that resamples.** A
crop that centres on the foreground must look at the actual values to find the
foreground, and if those values are stale — three rotations pending, none applied —
it will centre on the wrong place. Such an operation declares that it **requires
current data**, and the predicate flushes before it. It still emits its own pending
entry, because its own effect (a translation and a shape change) is describable and
should fuse with whatever comes next. The two properties are independent: *reads
current values* is about the operation's input; *is deferrable* is about its output.
And the first is a fact about the operation as parameterized, computed when it is
built — the same crop class reads values when its extent comes from the datum and
reads nothing when its extent is a constant
([data-dependent-opt-out-flag](./techniques/data-dependent-opt-out-flag.md)).

**Fusion has preconditions beyond the algebra, and violating them is a silent
semantic change.** Two entries with the same matrix algebra can still disagree on how
to resample — nearest versus linear interpolation, zero versus edge padding, the
output value type, whether grid corners or centres align. Fusing them under one
parameter set would apply one entry's parameters to the other's geometry and produce
an output nobody specified. When the accumulator meets an entry whose parameters
conflict with what it holds, the rule is to resample mid-chain with the parameters
held so far and start a fresh accumulation, not to pick a winner
([compatibility-break-resample](./techniques/compatibility-break-resample.md)).

## What forces a flush, and why the list is short

The set of things that force materialization is closed and small, and every member is
a consequence of the stance above. A plain operation that never learned to defer
forces it, because its input must be real. An operation that declares it reads current
values forces it, before itself. An operation that is capable of deferring but has
been told to run eagerly — by its own flag or by the pipeline mode — forces it. An
explicit barrier forces it, and does nothing else. And the end of the pipeline forces
it unconditionally, because a datum leaving the pipeline with pending entries is a
datum whose values are wrong for every consumer that does not know the protocol, which
is every consumer. Nothing else does. In particular, the pipeline's own *inverse*
refuses to run over a datum with pending entries rather than draining them, because an
inverse computed while forward operations were still pending would record a history
that never happened.

The barrier deserves its own sentence. It is a no-op with a single property — it is
*not* deferrable — and its entire effect is to trip the predicate. Its value is
positional control: a pipeline author who wants "everything up to here fused, then
materialized, then the rest fused separately" can say so by placing a barrier, without
editing the flags of any operation on either side, and without knowing which of those
operations happen to read values. Providing it is cheap; not providing it drives
authors to edit flags on operations they do not own.

## What a pending entry must carry

A pending entry is complete when the flush can execute it with nothing but the entry
and the datum. Concretely: the transformation in the chain's algebra; the shape the
output would have had, so the next operation can reason about geometry before
anything is computed; the resampling parameters (interpolation mode, padding mode,
output value type, alignment convention); and enough identity to be matched to the
trace record the reversible-pipeline machinery writes for the same operation. The
keys of that record form a **closed vocabulary with one authority** — a new resampling
parameter is added to the vocabulary, not smuggled into an entry under an ad hoc name,
because the compatibility check between entries can only compare what it knows to
compare.

The shape and the accumulated transformation must be **peekable without flushing**.
An operation that appends to the pending list needs to know the *current* geometry —
the geometry after everything pending has notionally applied — to describe its own
effect correctly; a crop appended after a pending rotation is a crop of the rotated
frame, and its offsets are expressed in that frame. So the accumulator exposes the
composed transformation and the pending shape as a query, and the query is pure. That
same query is what the oracle uses to check that the deferred chain *thinks* it is
where the eager chain actually is, before a single value is computed.

## The oracle is the standard

A lazy path that cannot be proven equal to the eager path is an optimization nobody
can trust, and the proof is mechanical: for every deferrable operation, run the eager
chain and the deferred chain on the same input, then assert three things. The
deferred output equals the eager output within a stated tolerance — a tolerance,
because fusion changes the interpolation arithmetic and bit-equality is the wrong
bar. Before flushing, the pending shape and the composed transformation match the
eager result's shape and frame. And inverting both outputs through the pipeline's
inverse produces the same thing and leaves both pending lists and both trace stacks
empty ([equivalence-oracle-testing](./techniques/equivalence-oracle-testing.md)). An
operation that has not passed this oracle does not get to declare itself deferrable,
whatever its author believes about its algebra. Where the two paths differ beyond
tolerance, the eager path is the definition and the deferred path is the defect —
until the difference is explained as the eager path's own accumulated error, which is
the one case where the lazy path is more correct than the standard it is measured
against, and that case must be argued in writing rather than absorbed into the
tolerance.

## Boundaries

The sibling subject **self-describing-data-envelopes** owns the value that flows: the
array that carries its own geometry, its provenance, and its pending list, and the
rules for how those survive copying, stacking into a batch, moving between devices and
serialization. This subject owns what happens to the pending list — who may append an
entry, what an entry must say, when the list is drained, and what draining computes.
The rule a reader uses: if the question is about *where the pending entries are* or
whether they survive a structural operation on the datum, it is the envelope's; if the
question is about *whether a given operation may append one, when it must instead
force the list to drain, and what the drain produces*, it is here. Neither subject
links to the other, because the envelope must be adoptable by a system that never
defers anything, and this subject must be adoptable by a system that keeps its
pending list beside the datum rather than inside it.

The neighbour [pipeline-dag](../../work-execution/pipeline-dag/pipeline-dag.md) owns
the execution of an explicit, user-authored graph of dependent steps, each with a
durable status and a fate. It looks adjacent because both subjects turn a sequence of
declared operations into work, and the discriminator is what the operations *are*. Its
nodes are opaque: a node runs, produces an output, and the engine never asks what the
node did, so two nodes can never be combined into one — the engine's whole job is to
run each and record its fate. This subject's operations are transparent by
construction: each states its effect in a shared algebra precisely so that adjacent
operations *can* be collapsed into a single one, and the engine's whole job is to
decide how many to collapse before it must stop. When a step's effect can be
described without running it, this subject applies; when the only way to know a
step's effect is to run it, that subject does, and the question of fusion never
arises.

The neighbour [declared-process-graph](../../process-graph-runtime/declared-process-graph/declared-process-graph.md)
owns the document that declares a graph of long-lived processes joined by named
channels, and the path from that document to a topology a runtime will accept. It
schedules nodes: its output is a set of processes that stay up and channels that
carry, and nothing in it ever finishes. This subject collapses nodes: its output is a
single computed value and an empty pending list, and the point of the machinery is
that several declared operations never become separate executions at all. The rule:
if the operations are meant to run concurrently and indefinitely, exchanging messages,
that subject owns their declaration; if they are meant to run once, in order, on one
datum, and the design question is how many of them can be made to not run at all,
this one does.

## What "done" looks like for this subject

A deferred-execution layer meets the bar when: an operation whose effect is not
expressible in the chain's algebra is refused from the lazy path rather than deferred
as a closure; the decision to materialize is made in exactly one function that every
operation passes through, so a new operation that declares nothing is eager by default
and never sees stale values; an operation that reads values declares so and receives
current data, while still contributing its own entry to what follows; entries with
incompatible resampling parameters are materialized at the boundary between them, with
each side's parameters, rather than fused under one; an author can force a flush at any
position with a barrier and can set the pipeline to force-lazy, force-eager or
honour-each; the pending shape and composed transformation can be read without
computing anything; and every deferrable operation carries a test asserting deferred
equals eager within tolerance, peeked geometry equals realized geometry, and both
paths invert to the same value with nothing left pending.
