---
layer: technique
type: technique
subject: keyed-sample-transforms
technique: multi-sample-fan-out
status: forged
laws: []
shared_with: []
use_when: [a patch sampler that returns several samples from one, a transform downstream of a sampler receiving a list instead of a dictionary, inlining a nested chain into its parent, a transform that consumes a list of samples and returns one]
---

# Multi-sample fan-out

Some transforms turn one sample into many — a random patch sampler that
draws several crops from one volume, a slicer that emits every plane of a
stack. Everything after them in the chain was written for one sample. **The
chain maps the rest of its transforms over the list, to a declared nesting
depth, and a transform that reduces a list back to one value opts out of
mapping explicitly.**

## The chain owns the mapping

The fan-out transform returns a list of dictionaries. It does not know what
follows it and must not. The chain, on receiving a list from a transform,
applies the next transform to each element rather than to the list — and
keeps doing so for every later transform, because once a sample has become a
list it stays one until something reduces it. The transforms after the
sampler are unchanged single-sample transforms; the mapping lives in one
place, the chain's call loop, and a library that puts it anywhere else ends
up with every transform checking whether it received a list.

The fan-out transform has its own obligation, inherited from pass-through:
every output dictionary carries every unlisted key of the input. Because
several outputs share one input, the carried values must be copied deeply
into each output rather than shared, or a later in-place operation on one
output's metadata edits the metadata of its siblings. The named keys are
fresh per output by construction; it is the *unnamed* ones that alias.

## The depth is declared, not inferred

A chain cannot tell a list of samples from a sample that happens to be a
list. A sample whose top level is a list of dictionaries — one per time
point, say — and a fan-out result look identical to a loop that maps over
anything iterable. The chain therefore carries a mapping depth as an
integer: zero means apply each transform to the input as a whole, one means
map over the top-level list, two means map over a list of lists. The caller
sets it when constructing the chain; the chain never guesses from the shape
of the data.

Inference from shape is the naive reading and it fails in both directions.
A chain that maps whenever it sees a list will map over a sample's channel
list and hand a transform one channel at a time. A chain that never maps
hands a downstream transform the whole list and fails on the first indexing
operation, with an error that names the transform and not the sampler that
produced the list.

## Reducers opt out

A transform that consumes a list and returns one thing — a batch collator, a
sampler that picks one of several candidates, a transform that averages a
set of augmented views — must receive the list, not be mapped over it. The
chain cannot know this from the transform's signature. The transform
declares it, with a marker the chain checks before mapping: for a marked
reducer the chain passes the list whole regardless of depth. After a reducer
the data is a single sample again and later transforms are applied without
mapping until the next fan-out.

The marker is a declared trait rather than a runtime probe — the chain does
not call the transform and see whether it fails — because the failure of a
mapped reducer is not always an exception. A reducer mapped over a list of
one-element inputs may well succeed, per element, and return a list of
reduced singletons where one reduction was expected.

## Nested chains and the flatten refusal

Chains nest: a chain may contain a chain as one of its transforms, and a
library commonly offers to flatten that into one flat sequence for
inspection or caching. Flattening is only correct when the inner chain
would have mapped its transforms at the same depth the outer one does. An
inner chain declared at depth zero — because its author wanted its
transforms to see the whole list — inlined into an outer chain at depth one
now has its transforms mapped over elements they were written to consume
together. The rule is that flattening refuses when a nested chain declares a
different depth than its parent, with an error naming both. The depth is a
property of the chain that declared it, and a chain that cannot be inlined
without changing that property is not inlinable.

The runtime rule is the same one in the other direction. When the parent
chain reaches a nested chain as one of its transforms, it does *not* map
over the list before handing it down; the nested chain receives the list
whole and applies its own declared depth to its own transforms. A parent
that pre-mapped would apply its depth and then the child's on top, and a
child declared at depth zero — written to receive the whole list — would
see one element. The nested chain is the authority on its own mapping, both
when it runs and when it is inverted, and the parent treats it as opaque.
The defects that taught this were all found the same way: a chain that
worked flat and broke when a sub-chain was extracted for reuse.

The same reasoning governs inversion: reversing a chain that fanned out must
map its inverse transforms at the same depth as the forward pass, over each
output, and a reducer with no inverse ends the reversible region. The forward
depth is the only record of how the inverse must be applied, which is one
more reason it is declared rather than inferred.

## Decision rules

When a transform returns a list of samples, the chain maps subsequent
transforms over it; the transform itself does nothing about what follows.
When constructing a chain, declare the mapping depth from what the samples
are, and never rely on the chain detecting a list. When a transform must
receive a list whole, mark it as a reducer; when a reducer is found
unmarked, mark it rather than special-casing it in the chain. When
flattening a nested chain, compare depths first and refuse on mismatch.

## When not to use it

A pipeline where fan-out is handled by the dataset — one sample per index,
with the sampler run before indexing so that the transform chain only ever
sees single samples — does not need mapping in the chain. The technique is
for libraries where the sampler is a transform like any other and the
chain has to accommodate what it returns.
