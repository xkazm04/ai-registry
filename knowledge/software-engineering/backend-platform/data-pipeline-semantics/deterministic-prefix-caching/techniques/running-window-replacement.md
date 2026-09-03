---
layer: technique
type: technique
subject: deterministic-prefix-caching
technique: running-window-replacement
status: forged
laws: [limits-are-derived, creation-names-reaper]
shared_with: []
use_when: [the cached head output does not fit in memory and the epoch is long, choosing the replacement fraction for a windowed cache, a windowed cache whose background thread falls behind]
---

# Running-window replacement

When the head's output for the whole dataset does not fit in memory and the disk
substrate is too slow — every hit pays a deserialisation, and the head is cheap
enough that recomputing it on a background thread costs about the same — there is a
third arrangement. Hold a fixed-size window of cached entries in memory. Train each
epoch on the window. During the epoch, on a separate thread, compute the head for the
next slice of records that are not in the window; at the epoch boundary, swap that
slice in for a same-sized slice that has been in the window longest. Over enough
epochs every record has been in the window, and no epoch waited for the head.

The mechanism is simple; the discipline is in three numbers and one thread.

## The three numbers, and their derivation

The window size `W` is a memory budget: entry size times `W` plus the model's working
set must fit. It is derived from a measured entry size — the head output's bytes, not
the source file's — and the machine's memory, and the derivation is written beside
the parameter, because a `W` chosen by feel is raised by feel and the run that then
swaps to death does so at the second epoch, after the fill succeeded.

The replacement fraction `r` is the share of the window replaced per epoch. It is
bounded above by the replacement thread's throughput: the thread must compute `r · W`
head outputs within one epoch, so `r ≤ (epoch seconds × entries the thread computes
per second) / W`. Above that bound the epoch boundary arrives before the slice is
ready and the swap either waits (the epoch stalls, and the cache has become a slower
version of no cache) or proceeds with a partial slice (and the coverage arithmetic
below is wrong). The bound is computed from measured numbers, at construction or in
the first epoch, and a chosen `r` above it is refused or clipped with a warning.

The replacement count itself is derived, not configured: it is `ceil(r · W)` clipped
to `N − W`, the number of records outside the window, because there is nothing else to
replace with. The clip is what makes the two degenerate configurations honest — a
window as large as the dataset has nothing to rotate and is a plain in-memory cache,
which the mechanism says with a warning rather than by spinning a thread that
replaces entries with themselves; and a replacement fraction of zero is refused
outright, since an operator who wants no rotation wants the other substrate.

The coverage horizon follows: with `N` records, `W` in the window and `r · W`
replaced per epoch, a record enters the window on average every `(N − W) / (r · W)`
epochs and stays for `1 / r` epochs. A run shorter than the horizon has trained on a
subset, and the mechanism's documentation states the horizon formula so an operator
can compute it for their run before starting, rather than discover afterwards that a
third of the data was never seen.

## The one thread

The replacement thread is a created resource. It is started by the mechanism when the
window is first filled and it must be stopped by the mechanism when training ends,
when the dataset is replaced, and when the process exits — the creating call names
the stopping one, and the documentation shows both in the same example. A replacement
thread that outlives the run holds the window's memory, keeps a handle on the
records, and keeps computing heads for an epoch that will never start.

The thread's work is the head only, and the head is deterministic by construction —
the same boundary scan that fixes the seam for the other substrates fixes it here.
Transforms in the head that are not safe to share across threads are copied for the
replacement thread, as they are for the fill's threads; the window's entries are
computed with a private copy of every thread-unsafe stage.

The swap itself is the one moment of contention. The training thread reads the window
during the epoch; the replacement thread writes the incoming slice into a staging
area; at the boundary the swap exchanges references under a lock held for the
duration of an assignment, not a computation. The training thread never blocks on a
head computation, and the replacement thread never writes into an entry the training
thread might be reading.

## What the window changes about training

Every other substrate serves the whole dataset every epoch, and the model's
optimiser sees the data distribution the dataset defines. The window serves a subset
per epoch and the sequence of subsets is a rotation, not a sample. Two consequences
follow and both must be said in the documentation rather than discovered.

First, an epoch is no longer a pass over the data; it is a pass over the window, and
learning-rate schedules and evaluation cadences that count epochs must be rescaled by
the coverage horizon. Second, the rotation means consecutive epochs share most of
their records — `(1 − r)` of them — so the effective batch diversity across two
epochs is lower than under a full-dataset shuffle, and a training recipe tuned on the
full dataset does not transfer without retuning. Neither is a defect; both are the
price of the substrate, and a mechanism that hides the price has chosen a default on
the operator's behalf.

## Procedure

1. Measure entry size and per-entry head time on a sample; derive `W` from memory and
   the upper bound on `r` from epoch time; write both derivations in the constructor's
   documentation.
2. Fill the initial window on the fill's threads, as the in-memory substrate does.
3. Start the replacement thread. It computes the next `r · W` entries into staging.
4. At each epoch boundary the training loop calls the mechanism's advance; the advance
   swaps staging into the window, evicts the longest-resident slice, and signals the
   thread to begin the next slice. If staging is not ready, the advance reports it —
   a count of epochs that stalled is a number the operator needs.
5. At the end of training the loop calls the mechanism's shutdown; the shutdown joins
   the thread and releases the window. The documentation's example shows the start,
   the per-epoch advance and the shutdown together.

## Decision rules

When the head is so cheap that a plain uncached loader keeps the accelerator busy,
the window is overhead and the answer is no cache. When the dataset fits in memory
after all — measured, not assumed — the window's semantics are a cost with no return,
and the in-memory substrate wins. When the replacement thread's measured throughput
gives an `r` under a few percent, the coverage horizon is hundreds of epochs and the
window is the wrong substrate; use disk, or a cheaper head. When the loader uses
worker processes that are kept alive across epochs, the window's swap happens in the
parent and the workers never see it — that configuration is on the list
[enumerate-the-non-working-cases](./enumerate-the-non-working-cases.md) maintains,
and it is the one that produces the most convincing wrong run.

## When not to use it

Short runs — fewer epochs than the coverage horizon — should not use the window; they
will not see the data. Datasets whose records vary widely in head output size make
`W` a poor memory bound and the window unpredictable; bucket by size or use disk.
Any setting where an epoch must be a full pass by definition — a validation set, an
evaluation harness, a run whose metrics are reported per epoch to a third party —
must not use it, because the epoch it reports is not the epoch the reader assumes.
