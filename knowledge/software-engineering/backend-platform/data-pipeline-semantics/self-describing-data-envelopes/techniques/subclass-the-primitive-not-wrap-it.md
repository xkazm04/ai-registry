---
layer: technique
type: technique
subject: self-describing-data-envelopes
technique: subclass-the-primitive-not-wrap-it
status: forged
laws: []
shared_with: []
use_when: [choosing the type of the value that flows through a third-party numeric pipeline, a wrapper object that every consumer unwraps at the boundary, metadata lost at the first engine call]
---

# Subclass the primitive, not wrap it

An envelope has to be *some* type, and the choice is between two shapes that
look interchangeable on a whiteboard and behave oppositely in a pipeline. A
**wrapper** is a new class that holds the primitive as a field beside the
metadata. A **subclass** is the primitive's own type, extended with the
metadata slots, so that an instance *is* a primitive to every check the
downstream engine performs. The wrapper is the shape every engineer reaches for
first, because it is honest about what it is and touches nothing it does not
own. It is also the shape that fails, and it fails at exactly the boundary the
envelope exists to protect.

## Why the wrapper loses

The downstream of a numeric pipeline is a large API that the pipeline's author
does not control: a tensor engine's operators, a model's forward pass, a loss
function, a device-transfer call, a serialiser, a collate function, and every
third-party stage anyone plugs in. None of those accept a wrapper. So every
call into that surface is preceded by an unwrap and, if the metadata is to
survive, followed by a rewrap — and the rewrap is optional in the sense that
matters: nothing fails if it is forgotten. A pipeline with a wrapper envelope
has therefore *moved* the desynchronisation-by-omission failure from "forgot to
update the sibling key" to "forgot to rewrap after the call", and multiplied its
sites by the number of engine calls. The wrapper design does not cure the
disease; it changes where the lesions appear.

The subclass has no unwrap step because there is nothing to unwrap. The engine's
type checks pass, its operators dispatch, its device moves and stacking and
cloning all run — and, where the engine provides a dispatch hook that lets a
subclass observe the result of every operation performed on its instances, the
subclass can re-attach its slots to whatever the operation returned. That hook
is the load-bearing prerequisite: without it, the subclass carries metadata into
an operation and loses it on the way out, and the design degrades to a wrapper
with a worse name.

## The decision rule

**When the API surface you would have to intercept is larger than the one you
own, subclass. When you own the whole surface, wrap.** A pipeline whose every
stage is written in-house, with no engine underneath, has nothing to intercept:
a wrapper is honest, cheaper to reason about, and never surprises a reader with
an instance that claims to be a primitive and is not quite one. A pipeline that
hands its values to an engine with hundreds of operators cannot enumerate its
boundaries, let alone guard them, and must subclass or accept metadata loss as a
permanent background failure.

Two conditions must hold for subclassing to be viable at all, and they are
checked before the design is committed to, not after. The engine's primitive
must be **subclassable** — some are sealed, and a sealed primitive forces the
wrapper regardless of the rule above. And the engine must offer the **dispatch
hook** described above, or an equivalent way to run code after every operation
that returns a new primitive; without it, propagation cannot be implemented and
the subclass carries its slots only until the first arithmetic.

## What the subclass must promise

An instance of the envelope type must be usable wherever the primitive is,
which imposes obligations that a wrapper never had to meet.

It must **construct from a primitive** without copying the payload where the
engine allows a view, because the envelope is minted for every value a reader
produces and a mandatory copy at the mint doubles memory at the pipeline's
widest point.

It must **survive every structural operation** the engine performs on its own
type — cloning, detaching from a computation graph, moving between devices,
changing dtype, stacking, indexing, slicing — with its slots re-attached to the
result. Each of these is a distinct code path in the engine and each is a
distinct place to forget; the test suite for the envelope enumerates them and
asserts slot survival on every one.

It must **serialise and deserialise as itself**, with slots intact, through the
engine's own persistence path and through the language's generic object
persistence, because a pipeline's values cross process boundaries in worker
pools and caches, and an envelope that arrives on the other side as a bare
primitive has quietly discarded the history that inversion needs. Where the
engine's loader restricts which classes it will reconstruct, the envelope type
registers itself as permitted, at import time, so that the restriction does not
silently strand the slots.

It must **degrade to the primitive on request**, cheaply and explicitly — a
method that returns the bare payload — because some consumers genuinely want
none of it, and forcing them to reach into internals produces the fragile unwrap
the design was meant to abolish.

## The dispatch hook's own rules

The hook that re-attaches slots after an engine operation is the single most
executed piece of the envelope and it is where subclassing designs accumulate
their bugs. Three rules keep it honest.

It runs the engine's operation **first**, on the primitives, and only then
decorates the result; an implementation that reaches into the operation to
inspect its arguments before dispatch has coupled itself to the engine's
internals and will break on the engine's next release.

It handles results that are **not primitives** — scalars, tuples of primitives,
booleans, shapes — by leaving them alone. A hook that tries to attach an affine
to a boolean is the first bug every such implementation ships.

It **never raises for a metadata reason**. An operation that succeeds on the
numbers and then fails because two operands' frames disagree has turned a
tracking convenience into a correctness gate that nobody asked for; the
propagation rule (first enveloped input wins) exists precisely so that this
hook always has an answer.

## When not to use it

Do not subclass when the primitive is immutable by contract and the engine
relies on that — attaching mutable slots to a value the engine may freely share
between operations creates aliasing that the engine's own code never expected.
Do not subclass when the pipeline's values never leave code you own; the wrapper
is simpler and a reader will thank you. And do not subclass to *add behaviour*:
the envelope's methods are accessors for its slots and conversions to and from
the primitive, nothing more. A subclass that grows domain operations becomes a
second API beside the engine's, and the two drift.
