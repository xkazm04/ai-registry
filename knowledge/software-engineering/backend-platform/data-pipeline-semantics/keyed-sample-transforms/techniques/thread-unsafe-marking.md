---
layer: technique
type: technique
subject: keyed-sample-transforms
technique: thread-unsafe-marking
status: forged
laws: []
shared_with: []
use_when: [running a transform chain under a threaded executor, a random transform producing samples with mixed parameters under concurrency, deciding whether a transform may be shared between workers, seeding a chain and its children]
---

# Thread-unsafe marking

A transform that mutates its own state under a call — a random transform
that draws parameters onto itself and then applies them — is not safe to
share between threads. **Such transforms are marked, and a threaded executor
copies marked transforms per item rather than sharing one instance.** The
alternative, locking the call, is a throughput cliff in the one place a
pipeline cannot afford it; the alternative to that, hoping, produces a
sample with one key transformed by another sample's draw.

## What the marker means

The library's transform contract states that a transform is thread-safe
unless it declares otherwise, and that the declaration is a class-level
marker readable without instantiating or calling the transform. A random
transform is unsafe by construction: its call sequence is draw, store,
apply-per-key, and two threads interleaving those steps on one instance
produce a draw that belongs to neither sample. A transform that caches a
lookup table on first use, or accumulates a running statistic, is unsafe for
the same reason with a different state.

The marker is the transform's promise about *itself*. It does not promise
anything about the executor, and it is not a request for a lock. It is the
information an executor needs to decide, per transform, whether one instance
serves all workers or each worker gets its own.

## What the executor does with it

A process-based executor — one worker process per data loader worker — is
unaffected: each process has its own copy of the chain, and the marker
changes nothing. The marker matters for *threaded* executors, which share
one heap. Such an executor walks the chain before starting, and for every
marked transform makes one copy per worker thread, so that each thread's
chain holds its own instance of every stateful transform and shares the
stateless ones. The copy is made once at executor start, not per sample;
per-sample copying of a transform with a large lookup table is the cost the
marker was meant to avoid.

There is a second, cheaper answer that a library with a random/deterministic
split can take, and it is the one that avoids the reseeding problem below
by construction: **bound the threaded region so that it ends before the
first random transform.** A cache that pre-computes the deterministic
prefix of a chain under a thread pool and leaves the random tail to run
per epoch in the consumer's own worker never applies a random transform
under threads at all. The marker still matters — a non-random transform
that lazily builds a lookup table on itself is marked and copied — but the
copies are of transforms whose copied state is *correct* to duplicate, and
the generator-duplication trap never arises. When a library can draw that
line, it should, and say that its threaded phase is scoped to the
deterministic prefix; when it cannot, the reseeding rule applies in full.

An executor that ignores the marker is the failure this technique names.
The failure does not raise. It produces samples that are individually
plausible and collectively wrong, at a rate proportional to contention, and
it disappears when the executor is run single-threaded to debug it.

## Random state and the copy trap

A random transform holds its own generator, independent of every other
transform and of any global seed. A chain that is seeded reseeds each random
child from the chain's own state, in order, so that seeding the chain twice
with the same value reproduces the same draws in every child. That is the
only sanctioned way to make a chain reproducible; setting a global seed
before constructing it works until the first transform is reordered.

The independence of per-transform generators is what makes the copy in the
previous section subtle. A copied random transform carries a copy of its
generator, in the same state — and two generators in the same state produce
the same sequence forever. A threaded executor that copies a marked random
transform per worker and stops there has given every worker the same
augmentations, which defeats the augmentation exactly as a shared global
seed across worker processes does. The rule is that a copied random
transform is reseeded after copying, from the worker's identity or from a
fresh draw off the parent's generator, and that a library's copy operation
on random transforms either reseeds or warns loudly that it did not. The
warning is the minimum; a silent copy of a generator is a reproducibility
bug disguised as a convenience.

The same trap is why a random transform's state is never seeded from a
constant at construction by default: a library that seeds every random
transform from zero unless told otherwise makes every fresh chain draw the
same sequence, and every user discovers it at the point of comparing two
runs that were supposed to differ.

## Decision rules

When a transform stores anything between its call's start and its return
that a concurrent call could read, mark it. When in doubt, mark it; the cost
of an unnecessary copy is memory, the cost of a missing mark is a wrong
sample. When writing an executor that shares a chain across threads, copy
marked transforms per worker at start, and reseed the random ones after
copying. When a chain must be reproducible, seed the chain and let it reseed
its children; never seed a global generator and rely on construction order.
When a random transform is deep-copied for any reason — a cache, a
checkpoint, a per-worker clone — treat the copy as unseeded until it is
reseeded.

## When not to use it

A pipeline that only ever runs under process-based parallelism can leave
the marker unread, though not unwritten: the library has no way of knowing
which executor a caller will choose, and a transform that is honest about
its state costs nothing to write. A library whose transforms are all pure —
no random component, no caches, no accumulators — has nothing to mark and
should say so in its contract, so that a reader does not go looking.
