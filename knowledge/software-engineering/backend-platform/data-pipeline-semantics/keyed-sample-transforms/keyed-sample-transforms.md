---
layer: golden-path
type: golden-path
subject: keyed-sample-transforms
status: forged
use_when: [designing a transform library whose samples are dictionaries of related fields, a random augmentation that must apply identical geometry to an input and its label, a transform that emits several samples from one, a keyed chain that silently loses or corrupts fields it never named]
techniques:
  - array-and-keyed-dual-forms
  - single-draw-per-sample
  - pass-through-of-unlisted-keys
  - missing-key-policy
  - multi-sample-fan-out
  - thread-unsafe-marking
---

# Keyed sample transforms

A supervised training sample is rarely one value. It is an input, a label
that must stay geometrically aligned with it, a weight map, a mask, a set of
metadata fields, an identifier — a small dictionary whose entries have to be
transformed *together* or not at all. A transform library built for single
values handles this badly, and the ways it handles it badly are all the same
way: the caller ends up writing the coordination — the "apply this to both,
with the same random crop, and remember to carry the identifier through" —
at every call site, and gets it subtly wrong at one of them. This subject owns
the library shape that moves that coordination into the transform itself:
**every operation exists in a single-value form and a keyed form over a
sample dictionary, and the keyed form owns which keys it touches, what
happens to the keys it does not, how many random draws a sample gets, what a
missing key means, and what a chain does when one sample becomes many.**

Three neighbours look close enough to name. Deferred-operation fusion — a
sibling under this category — owns how a chain *executes*: which operations
are described rather than applied, where the pending queue is flushed, what
forces an early materialisation. This subject owns how a chain is *addressed*:
which fields of a sample an operation reaches and what it owes the fields it
does not. A reader deciding whether a transform may be postponed is in that
subject; a reader deciding what a transform does to the label when it was
only told about the image is here. The two compose — a keyed transform may
well be a deferred one — and neither needs the other to be read first.
[Test input generation](../../../engineering-process/build-and-release/test-input-generation/test-input-generation.md)
owns randomness in *tests*: its seed technique argues that a seed reproduces
an input only relative to the generator that consumed it, and that a failing
case is persisted as the input rather than the number. This subject's random
discipline is about *production* draws — how many a sample receives and which
object holds the state — and it stops where a test would want to replay one.
The discriminator is the consumer of the random state: an assertion means the
test subject, a pipeline stage means this one.
[Pipeline DAG execution](../../work-execution/pipeline-dag/pipeline-dag.md)
owns a user-authored graph of *steps* with durable per-node status, branch
conditions and human gates. A transform chain is not that: it is a linear
sequence of pure functions over one sample, run in-process, with no status
vocabulary and no persistence between stages. When the question is "which
node runs next and can the run survive a restart", read that subject; when
it is "what does stage four receive from stage three for the keys stage three
never mentioned", read this one.

## The core stance: the keyed form is a thin, honest wrapper

The temptation, once a dictionary form exists, is to make it the real
implementation and let the single-value form wither — or the reverse, to
write the single-value form and let each call site build its own dictionary
loop. Both produce drift. The stance that holds is that **the single-value
form is the only place the operation is implemented**, as a pure callable
over one value, and **the keyed form is a wrapper that owns iteration over
keys and nothing else**. The wrapper decides which keys, in what order, with
what shared state; the callable decides what happens to a value. When the
callable gains a parameter, the wrapper forwards it. When the wrapper gains a
concern — a missing key, a second sample, a random draw — the callable does
not learn about it. [array-and-keyed-dual-forms](./techniques/array-and-keyed-dual-forms.md)
carries the shape and the two failure modes of getting it wrong.

That single decision makes the rest of the subject fall out as obligations
of the wrapper, and each one is a place a naive wrapper breaks a chain.

## Four obligations of the wrapper

**One draw per sample, shared across keys.** A random transform applied to an
image and its label must rotate both by the same angle, crop both at the same
corner, flip both or neither. The naive keyed form calls the random
single-value form once per key, drawing fresh parameters each time, and the
label is now misaligned with its image by an amount nobody will detect until a
model trains to a plausible-looking but wrong optimum. The rule is that the
wrapper draws once, then applies the single-value form with randomisation
disabled to every key, so that every key receives the same frozen geometry.
The single-value form must therefore expose a way to be called *without*
drawing, which is a design constraint on the callable that only the keyed
form reveals. [single-draw-per-sample](./techniques/single-draw-per-sample.md)
is the discipline.

**Every key not named is passed through unchanged.** A keyed transform told
about `image` and `label` receives a dictionary that also holds an
identifier, an affine, a source path and a class weight. It returns all of
them, untouched, in the same dictionary. This sounds too obvious to state,
and it is the obligation most often broken: a transform that constructs its
output dictionary from scratch, returning only the keys it produced, has
silently deleted every field the next transform was going to need. The
failure surfaces three stages later as a key error — or, worse, as a default
being substituted for a field that used to be present.
[pass-through-of-unlisted-keys](./techniques/pass-through-of-unlisted-keys.md)
states the rule and the copy semantics it implies.

**A missing key has one policy, honoured in one place.** Sometimes a sample
legitimately lacks a key the transform was told about — an inference sample
has no label; a partially annotated case has no mask. The wrapper must choose,
explicitly, between raising and skipping, and the default is to raise, because
a silently skipped key is a transform that did nothing and reported success.
Permissive mode is a stated opt-in, and it is honoured by exactly one gate —
the iterator that yields the keys to touch — so that no transform can
implement its own tolerant reading. The inverse direction of a chain, where
the dictionary being reversed has fewer keys than the forward one, is the
standing legitimate use of the permissive mode.
[missing-key-policy](./techniques/missing-key-policy.md) carries the gate.

**A transform that fans out declares it, and the chain maps over the result.**
A patch sampler turns one sample into many. Everything after it in the chain
was written for one sample and must not learn about the list; the chain maps
them over the list instead. The naive reading — pass the list along and hope
— works until a transform downstream is itself a list-consumer and now
receives a list of lists, or until a transform upstream of the sampler was
told to map and applied itself to the sample's *fields* as if they were
items. The rule is a declared nesting depth on the chain, and an explicit
opt-out for transforms that reduce a list to a value.
[multi-sample-fan-out](./techniques/multi-sample-fan-out.md) states both halves.

## What a random transform owns, and why that makes it unsafe to share

A random transform carries its own random state. The alternative — a global
seed the whole pipeline reads — is fragile in the way shared mutable state
always is: reordering two transforms changes every draw after them, and a
second worker process consuming the same seed produces identical
augmentations, which is the opposite of augmentation. So each random
transform holds its own generator, seeded from the chain when the chain is
seeded and independent afterwards. Seeding the chain reseeds every random
child from the chain's own state, so a chain seeded twice with the same value
produces the same sequence of draws in every child.

Because the keyed form holds a single-value instance with a generator of
its own, seeding the keyed form must forward to the instance it holds;
a wrapper reproducible in its coin and unreproducible in its parameters
has the failure of both designs and the diagnosability of neither.

The consequence is that a random transform is a stateful object under a
call: it draws, stores the parameters, and applies them. Two threads sharing
one instance can interleave a draw and an apply and produce a sample with one
key transformed by another sample's parameters. The library's answer is not
to lock — a lock in a per-sample hot path is a throughput cliff — but to mark:
a transform whose call mutates its own state is declared as such, and any
executor that runs transforms concurrently copies marked transforms per item
rather than sharing them. [thread-unsafe-marking](./techniques/thread-unsafe-marking.md)
is that contract, and it is the same reason a random transform must not be
deep-copied casually: two copies of one generator produce the same "random"
draws forever. The cleanest escape from that trap is structural — a
threaded phase that is scoped to end before the first random transform
copies only the transforms whose state is correct to duplicate.

## The chain is the second author of every transform

A library that ships transforms and a chain that runs them are one design,
not two. The chain decides the mapping depth over multi-sample outputs, the
chain reseeds children, the chain honours the thread-safety marker when it
parallelises, and the chain is what a caller reads to learn the two usage
modes — a single value flowing through single-value forms, or a dictionary
flowing through keyed forms — that a library supports. A chain that inlines
a nested chain must therefore refuse when the nested one was declared with a
different mapping depth: flattening it would apply the outer depth to
transforms written for the inner one, and the resulting shape error would
surface at the sample, not at the chain. Refusing is cheaper than every
alternative.

## What "done" looks like for this subject

A keyed transform library meets the bar when: every keyed transform is
implemented by delegation to a single-value callable that is separately
usable and separately tested; a random keyed transform applied to a sample
with two spatial keys yields identical geometry on both, and this is a test,
not an assumption; a chain of a dozen keyed transforms returns every key the
first one received, whether or not any transform in between named it; a
missing key raises by default and skips only when the caller said so, and
the caller can find the one place that decision is made; a transform that
emits a list composes with everything after it without those transforms
knowing; a transform that reduces a list declares that it does; and a
threaded executor can be handed the chain and produce correct samples
because the transforms that must be copied are marked and the executor
honours the mark. The caller who assembles the chain should never write a
key loop, a seed-sharing hack, or a "remember to copy the identifier" line
— the library's shape is what makes those lines unnecessary.
