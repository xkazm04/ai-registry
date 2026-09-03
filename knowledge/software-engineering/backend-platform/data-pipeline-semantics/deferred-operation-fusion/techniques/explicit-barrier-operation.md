---
layer: technique
type: technique
subject: deferred-operation-fusion
technique: explicit-barrier-operation
status: forged
laws: []
shared_with: []
use_when: [an author needs materialization at a specific position in a chain, choosing between force-lazy and force-eager and honour-each for a pipeline, an operation's lazy flag is being edited to control where a flush happens]
---

# Explicit barrier operation

A barrier is an operation with no effect on the datum whose only property is that it
is not deferrable. Placed in a chain, it trips the flush decision: everything pending
before it is materialized, and whatever follows begins a fresh accumulation. It
exists so that an author has **positional** control over materialization without
touching the operations on either side.

## Why a no-op is worth shipping

Without a barrier, an author who wants the pending entries applied at a particular
point has two options, and both are wrong. The first is to set the next operation's
lazy flag to eager. That works, but it has changed that operation's behaviour
everywhere the chain runs, it couples "where do I want a flush" to "which operation
happens to come next", and when the chain is reordered the flush moves with the
operation instead of staying where the author put it. The second is to insert an
operation that reads current values, which forces the flush as a side effect of its
declaration — an abuse of a flag that means something else, and one that carries an
actual resample of its own.

The barrier decouples position from operation. It is placed, it flushes, and it is
inert otherwise: it appends nothing, it reads nothing, it has no parameters, and its
inverse is the identity. An author reading the chain sees exactly where materialization
happens, because it is written down as a step rather than implied by the flags of
neighbouring steps. The cost of shipping it is one class with one property; the cost
of not shipping it is authors editing flags on operations they do not own.

## The barrier's one property

The barrier is *not* a deferring operation. That is the whole of its definition and it
must be true at the type level, not by configuration: a barrier that inherits from the
deferring base and sets its flag to eager is a deferring operation in eager mode, and
the pipeline's force-lazy switch will flip it back and the barrier will stop
barriering. The flush decision treats it as it treats any plain operation — needs real
input, therefore flush — and that treatment is immune to the pipeline mode because the
mode only governs operations that *can* defer.

Two consequences. The barrier is the only operation an author can rely on to flush
under every pipeline mode, including force-lazy. And a barrier placed where nothing is
pending is harmless: the flush finds an empty list and does nothing, so barriers can
be left in a chain across edits without a cost.

## The three pipeline modes

The pipeline-level switch is a tri-state, and the barrier is what makes the strongest
of the three usable.

*Honour each*: every deferring operation uses its own flag. This is the mode in which
a chain's laziness is a property of its operations, and the author of each operation
decided. It is the right default for a pipeline whose operations were written by
people who understood the protocol.

*Force eager*: no operation defers, whatever its flag. This is the standard path, and
it is the safe default for a pipeline as shipped, because a pipeline that defers by
default makes every operation that has not been through the oracle a hazard. It is
also the mode a pipeline's inverse runs in, since inverting a chain with pending
entries would record a history that never happened.

*Force lazy*: every operation that can defer does, whatever its flag. This is the mode
for a pipeline whose author has read the chain and wants the maximum fusion it
supports — and it is the mode in which per-operation flags are useless as positional
control, because the switch overrides them. The barrier is the only positional
control that survives force-lazy, which is why the two ship together.

The switch overrides in one direction only. It can turn a deferring operation eager
and it can turn one lazy; it cannot turn a plain operation into a deferring one, and
it cannot make an operation that reads current values stop reading them. Those
properties are facts about the operation and the switch governs only the choice the
operation left open.

## The end of the pipeline is an implicit barrier

Whatever the mode, the pipeline drains pending entries when it finishes. A datum that
leaves with entries pending is a datum whose array is wrong for every consumer that
does not know the protocol — a metric, a writer, a model — and none of them know it.
The implicit barrier at the end is therefore not optional and not mode-dependent;
the explicit barrier is the same operation, made available to the author for the
positions the pipeline cannot know about.

## When not to use it

Do not place a barrier to fix an operation that saw stale values. That operation
should declare it reads current values ([data-dependent-opt-out-flag](./data-dependent-opt-out-flag.md)),
and the declaration travels with it to every chain; a barrier fixes one chain and
leaves every other use of the operation broken.

Do not place a barrier before every operation "to be safe". A chain of barriers is
the eager path with extra steps, and the author who wants the eager path has the
force-eager mode, which says so in one place.
