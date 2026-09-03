---
layer: technique
type: technique
subject: deterministic-prefix-caching
technique: enumerate-the-non-working-cases
status: forged
laws: [absent-guard-is-loud, silent-state-is-ungoverned]
shared_with: []
use_when: [writing the reference documentation for a caching dataset, a cache that works in a notebook and does nothing under the production loader, deciding what a mechanism should say about configurations it cannot detect]
---

# Enumerate the non-working cases

A caching mechanism sits between a transform chain and a loader, and the loader's
process model decides whether the mechanism does anything. A cache filled in the
parent process reaches forked workers for free and reaches spawned workers only by
being serialised into each of them, per epoch. A window replaced by a thread in the
parent is visible to workers created after the swap and invisible to workers kept
alive across it. A disk cache keyed on the head is shared correctly across workers
unless something per-worker leaks into the head. In every one of these cases the
mechanism cannot tell it is misconfigured: the loader does not report its start
method to the dataset, the dataset does not know whether its workers persist, and the
run proceeds. Nothing raises. The epoch is slower than the chart promised, or the
model trains on a fraction of the data, and the operator learns this from a metric,
weeks later, if at all.

The technique is that **the mechanism's own reference documentation carries an
explicit list of the process-start and worker configurations under which it silently
misbehaves**, that the list lives beside the constructor rather than in a
troubleshooting page, and that each entry names the configuration, the symptom, and
what to use instead.

## Why a list, and why there

A guard that cannot engage on its own must at least be loud about its absence. The
mechanism here cannot engage: it has no way to inspect the loader that will consume
it, and adding one would couple the dataset to a loader's internals it should not
know. So the only guard available is the operator's knowledge, and the mechanism's
job is to put that knowledge where the operator is looking at the moment they make
the decision — the constructor's documentation, which is what they read when they
write the line that instantiates it. A list in a troubleshooting page is read after
the symptom, by the fraction of operators who notice the symptom; a list beside the
constructor is read before the run, by everyone who reads the constructor.

The list is also the honest form of a claim. A mechanism documented as "an
order-of-magnitude speedup" with a chart is making a claim about a configuration; the
list says which. The chart without the list is a number without its predicate.

## What earns a place on the list

An entry is a configuration that the mechanism (a) cannot detect, (b) does not fail
under, and (c) produces a wrong or useless result under. All three are required. A
configuration the mechanism detects and refuses is not a non-working case, it is a
validated input, and it belongs in the parameter documentation. A configuration that
raises is a non-working case that already announces itself, and the entry can be one
line. A configuration that is merely slower — the disk substrate on a dataset that
fits in memory — is a choice, not a misbehaviour, and belongs in the substrate
guidance instead.

The entries that recur across caching mechanisms of this shape:

- **The spawned start method.** Workers that do not inherit the parent's memory
  receive the cache by serialisation, per worker, per epoch. Symptom: the first epoch
  is slower than uncached. Alternative: fork where the platform allows it; a
  thread-based loader where it does not; the disk substrate otherwise. On the
  platforms whose default start method is spawn, say so by name in the entry — the
  operator on that platform will otherwise assume the default is fine.
- **Persistent workers with a replaced window.** Workers kept alive across epochs
  hold the window they were created with; the parent's swap does not reach them.
  Symptom: none visible; coverage is the initial window forever. Alternative: workers
  recreated per epoch, or the thread-based loader, or the window advanced inside the
  worker.
- **Persistent workers with a refilled cache.** A dataset whose records are replaced
  refills its in-memory cache in the parent; persistent workers keep the old one.
  Symptom: the new fold trains on the old fold. Alternative: the refill call requires
  non-persistent workers and the documentation says so where the refill is described.
- **Per-worker state leaking into the head.** A stage in the head that reads a
  worker-specific seed, identifier or scratch path produces a different output per
  worker, and a disk cache keyed on the record computes and stores one entry per
  worker. Symptom: the cache directory is several times the expected size and the
  hit rate is one over the worker count. Alternative: the stage carries the
  randomizable marker and ends the prefix, which is what it should have done.
- **A thread-based loader with a thread-unsafe head.** The fill and the loader both
  run the head on threads; a stage with mutable scratch state shared across them
  corrupts entries. Symptom: a training curve slightly worse than expected. The
  mechanism copies stages that declare the thread-unsafe marker; a stage that is
  unsafe and undeclared is on the list because no copy is made.

## The entry's shape

Each entry is three sentences: the configuration, stated in the loader's own
vocabulary so an operator can match it against their code; the symptom, stated as
what the operator would observe rather than what is happening inside; and the
alternative, stated as the configuration to use instead. An entry that explains the
mechanism at length and leaves the operator to infer the symptom has taught rather
than warned. An entry without an alternative is a dead end that the operator resolves
by removing the cache.

Where a companion loader exists that avoids most entries — a thread-based loader
that shares the parent's memory and needs no serialisation — the list says so once,
at the top, and the entries say which of them that loader resolves. That sentence is
the single most useful line on the list, because it converts five warnings into one
recommendation.

## Procedure

1. For each substrate, enumerate the assumptions it makes about the process model:
   memory inheritance, worker lifetime, per-worker state, thread safety of the head.
2. For each assumption, name the loader configuration that violates it, and confirm
   by running it: the entry is written from an observed symptom, not a predicted one.
3. Write the entry in the three-sentence shape and place it in the constructor's
   reference documentation.
4. When the mechanism gains a way to detect one of the entries — a loader that
   reports its start method, a worker that can be asked its age — convert the entry
   into a check that refuses or warns, and move it from the list to the parameter
   documentation. The list shrinks as the guard grows; it never shrinks by deleting an
   entry that is still true.
5. Keep the example that accompanies the constructor free of every listed
   configuration, and keep it runnable, so the operator who copies the example gets a
   working run and has to change something deliberately to reach a non-working case.

## When not to use it

A mechanism that runs in a single process with no workers has no process-model
assumptions and an empty list; do not invent entries. A mechanism whose loader is
part of the same library and whose configuration it can inspect should check rather
than list — the list is the fallback for what cannot be checked, not a substitute for
a check that could be written.
