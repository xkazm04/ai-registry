---
layer: golden-path
type: golden-path
subject: deterministic-prefix-caching
status: forged
use_when: [training epochs re-run the same decode and resample on the same records, deciding where a per-sample transform chain may be cached without freezing augmentation, a dataset larger than memory with a long epoch, a disk cache that seems to hit but never gets faster]
techniques:
  - capability-marker-boundary-scan
  - unknown-callable-is-nondeterministic
  - hash-inputs-and-pipeline
  - atomic-write-then-move
  - running-window-replacement
  - enumerate-the-non-working-cases
---

# Deterministic-prefix caching

A training run applies the same chain of transforms to the same records thousands of
times. Most of that chain is the same work every time — read the file, decode it,
reorient it, resample it to a fixed spacing, normalise its intensities — and only the
last few stages differ per pass: a random crop, a random flip, a random intensity
shift. The naive economics are obvious and the naive implementation is wrong twice
over. Cache the whole chain and augmentation dies: every epoch sees the same crop of
the same volume, and the model overfits to a fixed sample of a random process. Cache
nothing and the run spends most of its wall-clock re-decoding bytes that have not
changed since the first pass.

The principal position is that **the chain has a seam, the seam is found by scanning
for a capability rather than by configuration, everything before the seam is a derived
value that names its recomputation, and the mechanism publishes the configurations
under which it silently does nothing.**

## The head is deterministic, the tail is random, and the seam is discovered

A transform chain is an ordered list. Some stages are pure functions of their input;
some draw from a random source. The cacheable prefix is the longest run of pure stages
from the front of the chain, and it ends at the first stage that is not known to be
pure. That "known to be" is the whole design. The seam is not the first stage whose
name contains "random", not a stage index in a configuration file, and not a flag the
author sets on the dataset. It is found by walking the chain and asking each stage
whether it carries the randomizable capability — a trait the stage declares about
itself, independent of whether it currently holds a random-number generator, so that a
stage can declare itself uncacheable for reasons of its own (it reads a clock, it
consults a file that changes, it must not be memoised).
[capability-marker-boundary-scan](./techniques/capability-marker-boundary-scan.md)
owns the walk and the rule for what the marker means.

The scan has a second termination condition that is easy to miss and expensive to
skip. Authors compose pipelines freely, and a chain accepts any callable — a lambda
that squeezes a dimension, a function from a utility module, a class from another
library. None of these implement the pipeline's own transform interface, so none of
them can be asked whether they are random. The only honest answer is that an unknown
callable is nondeterministic until proven otherwise, and the cacheable prefix ends
there. [unknown-callable-is-nondeterministic](./techniques/unknown-callable-is-nondeterministic.md)
states the rule and why the tempting alternative — assume pure, it is probably a
squeeze — produces a cache that is wrong for exactly one user, silently, in a way no
test in the library can catch.

The one rule an author must learn follows directly: **put deterministic stages first.**
A random stage placed second in a ten-stage chain caches one stage and recomputes nine;
the mechanism is correct either way, but it is only worth having when the author has
sorted the chain, and the dataset's documentation says so once, near the top, with an
example that shows the split. The seam is also not only a dataset-level idea: a
pipeline that yields many patches from one record has a deterministic head at the
record level and a random tail at the patch level, and the same scan caches the
record once and replays only the tail per patch.

## What is cached is a derived value, and it names its recomputation

The cached entry for a record is the output of the head applied to that record. It is a
derived value, and everything that applies to derived values applies to it: it is keyed
by the inputs that determine it, recomputed from those inputs on demand, and
invalidated when any of them changes. The inputs are two — the record (a path, an
identifier, a row of a manifest) and the head itself. The record is easy to key. The
head is not: a transform is an object with parameters, closures and references to
code, and no hash of it is guaranteed to change when its behaviour changes or to stay
fixed when its behaviour does not. The standard is to hash it anyway, best-effort, to
say in the mechanism's own documentation that the hash is advisory, and to give the
operator a single command that clears the cache — because an operator who has changed
a parameter and is not sure whether the hash noticed must be able to take the safe
action in one line. [hash-inputs-and-pipeline](./techniques/hash-inputs-and-pipeline.md)
owns the key, what goes into it, and the wording of the disclaimer.

Changing the data source is a full invalidation. A dataset whose records are replaced
after construction — a new fold, a new manifest — cannot keep its cache: an in-memory
cache refills, a disk cache removes its directory and starts over. The mechanism does
this itself rather than asking the caller to remember, because "the cache dir from the
previous fold is still there" is a bug that produces plausible training curves.

## The substrate is chosen by two numbers

There are three places to put the head's output, and the choice compares the head's
output size against memory and the epoch's length against the time it takes to
compute a replacement entry.

**In memory** when the whole cached set fits with room for the model: fill once at
construction on a pool of threads, then serve every epoch from the fill. The fill
blocks construction for as long as the head takes over the whole set, so it accepts a
fraction and a count and runs over a subset when asked. The fill may instead be
deferred to first access, and that variant carries a trap: under worker processes a
lazily filled cache is a private cache per worker, so a deferred fill must write into
a store the workers share or it multiplies the head's cost by the worker count.

**On disk** when the set does not fit in memory, or when the cache must survive the
process — a second run, a second machine, a sweep whose every job shares one head.
The entry for a record is a file named by the key, written on first miss and read on
every later hit. The cost is serialisation: any field the format cannot represent
turns every read into a miss that looks like a hit, and anything in the head's output
that refers to *this* process — an object identity stamped into a provenance journal
so a later inverse can find the stage that produced it — must be normalised before
the write, or the entry loads and then fails the first operation that trusts the stale
reference. Persistence also buys a concurrency problem, since the second run and the
second machine both try to write the same entry, and
[atomic-write-then-move](./techniques/atomic-write-then-move.md) makes many writers
safe without a lock.

**A rotating window** when the set does not fit in memory and the epoch is long enough
that a background thread can compute replacement entries faster than the epoch
consumes them: a fixed-size subset in memory, a fixed fraction replaced per epoch from
a separate thread, every record seen over enough epochs. This is the only substrate
that changes the training semantics — an epoch sees a subset, not the set — and
[running-window-replacement](./techniques/running-window-replacement.md) owns the
arithmetic that says when the thread keeps up and what happens when it does not.

The choice is a rule, not a preference: fits in memory, in memory; does not fit and
the head is expensive relative to the epoch, rotating window; does not fit and must
persist or be shared, on disk. A team that picks disk because "it is the general one"
pays serialisation on every hit for a dataset that would have fit in memory twice.

## The tail runs on a copy, and the fill runs on copies

Two aliasing hazards sit at the seam, and both are silent. The first: the random tail
receives the cached head output, and a tail stage that modifies its input in place has
modified the cache; the next epoch's "deterministic" head output is the previous
epoch's random crop. The standard is to deep-copy the entry before the tail runs, and
to let the operator switch the copy off only on a claim they own — the tail does not
mutate, or forked workers each hold a copy-on-write image of the cache and serve every
entry exactly once per process lifetime, so the mutation lands in a copy the operating
system already made. The copy costs a traversal of the entry per sample; the default
is the safe direction, and neither condition is detected by the mechanism.

The second: a threaded fill applies the head to many records concurrently, and a
transform that holds mutable state between calls — a buffer, a cursor, a lazily-built
kernel — is not safe to share across those threads. The fill must know which stages
are thread-unsafe (a second capability marker, declared like the random one) and give
each thread its own copy; one shared instance produces entries computed with another
entry's scratch state, and the only diagnostic is a slightly worse training curve.

## The mechanism says where it does not work

Every substrate assumes something about the process model it runs under. An in-memory
cache filled in the parent reaches forked workers for free and is serialised into
spawned workers at every epoch, so the "cache" costs more than the head it replaced. A
window replaced by a thread in the parent is invisible to workers kept alive across
epochs; they train on the first window forever. A per-worker seed that leaks into the
head gives every worker a different disk key and a cache that is all miss. None of
these raises; each produces a run slower than expected or trained on less data than
the operator believes, discovered weeks later if at all. The standard is that the
mechanism's own documentation carries an explicit list of the process-start and worker
configurations under which it misbehaves, beside the constructor rather than in a
troubleshooting page.
[enumerate-the-non-working-cases](./techniques/enumerate-the-non-working-cases.md) is
that list as a discipline: what earns a place on it, and why a mechanism that cannot
detect its own misconfiguration must at least name it.

## Failure modes of the naive reading

The whole chain cached: augmentation frozen, a model that sees one sample of a random
process per record, an excellent loss curve and a poor validation curve — usually a
random stage that did not carry the marker. The seam by name or by index: right for
every pipeline but one, and reported as "the model overfits on my data" rather than
"the cache is broken". The hash trusted: a parameter changed, the hash did not notice,
and the cache served the old head for a week — not a bug that can be fixed but a
property of hashing arbitrary objects, which is why the disclaimer and the cheap clear
exist. The cache mutated: the tail wrote into the entry and every epoch after the
first trained on the previous epoch's augmentation. The disk cache that never hits: a
field the format cannot serialise, every read failing through to recompute, a full
directory and an uncached epoch time — the read path must distinguish "no entry" from
"entry unreadable" and say which. The window that never rotates: persistent workers
serving the original subset for the whole run, nothing failing, a fraction of the
data seen. That last one is the case the enumeration exists for.

## Boundaries

A prompt sent to a language model has the same shape — a stable prefix of identity,
policy and capability, then a variable tail of context and task — and the neighbour
[prompt-assembly](../../../llm-agent/prompt-and-context/prompt-assembly/prompt-assembly.md)
caches that prefix too, with a fingerprint that decides whether a session is stale and
breakpoints that cut the stack into cached blocks. The discriminator is what makes the
tail variable. In a prompt the tail varies because the caller chose different inputs,
and the prefix is stable because the assembler is deterministic by construction; the
cut is placed by the author at a boundary of change cadence, and the cached prefix is
byte-identical text. In a transform chain the tail varies because a stage draws from a
random source, and the cut is discovered by scanning for that capability rather than
placed by the author; the cached value is the output of arbitrary computation, not the
input to it, and it can be invalidated by a code change the key cannot see. When the
variability is chosen by a caller and the prefix is text the assembler wrote, the
neighbour owns it; when the variability is a property a stage declares and the cached
thing is a computed derived value, this subject does.

[build-economics](../../../engineering-process/build-and-release/build-economics/build-economics.md)
owns build caches — incremental state, dependency artifacts, per-variant object files —
under a byte budget with a measured hit rate and keys that include toolchain identity.
That subject's invalidation discipline is stricter than this one's and correctly so: a
build cache can key on everything that changes the answer because its inputs are files
and settings, and a poisoned entry is a wrong binary. This subject's inputs include a
live object graph that cannot be keyed soundly, so its discipline is an advisory hash
plus a one-command clear, and its poisoned entry is a slightly wrong training sample.
The rule for a reader: a cache whose entries are produced by a build graph from files
belongs next door; a cache whose entries are produced by a runtime pipeline from
records, with a random suffix that must stay live, belongs here. A build cache's
budgeting and pruning discipline transfers to the disk substrate unchanged, and this
subject does not restate it.

The sibling in this wave, keyed-sample-transforms, owns the randomness itself — how a
random stage derives its draw from a per-sample key so that a sample's augmentation is
reproducible and independent of worker assignment, and how the seed is threaded
through a chain. This subject does not care how the tail draws its randomness, only
that it does, and where; the sibling does not care what is cached, only that the
tail's draws are governed. A question about which stage the cache stops at is this
subject's; a question about what a stage does with its random source after the cache
has stopped is the sibling's. A keyed stage is still a random stage, and the scan
stops at it.

## The techniques

- [capability-marker-boundary-scan](./techniques/capability-marker-boundary-scan.md) —
  find the seam by walking the chain for a self-declared randomizable trait, never by
  name, index or configuration.
- [unknown-callable-is-nondeterministic](./techniques/unknown-callable-is-nondeterministic.md)
  — anything outside the pipeline's transform interface ends the prefix; the argument
  against assuming purity; how an author opts a bare function in.
- [hash-inputs-and-pipeline](./techniques/hash-inputs-and-pipeline.md) — the key as the
  record plus an advisory hash of the head; the disclaimer; the one-command clear.
- [atomic-write-then-move](./techniques/atomic-write-then-move.md) — temporary path then
  rename; many writers of one entry; unlink and recompute a corrupt entry.
- [running-window-replacement](./techniques/running-window-replacement.md) — a fixed
  subset with a fraction replaced per epoch on a background thread; the arithmetic of
  keeping up; when the window is the wrong substrate.
- [enumerate-the-non-working-cases](./techniques/enumerate-the-non-working-cases.md) —
  the mechanism's own documentation lists the start methods and worker configurations
  under which it silently misbehaves.
