---
layer: application
type: application
subject: index-free-random-access
technique: segment-then-parallelize
stack: rust
verified_on: 2026-09-07
verified_against: rust@1.85
---

# Parallelism retrofitted onto sixty-seven streaming commands

A command-line data tool whose commands were all written as single-threaded
streaming programs, later given segment-based parallelism over one artifact
without rewriting any of them. The version witness is the toolchain file
pinning the channel to `1.85.0`.

## What confirms the technique

**The reasoning is stated, and it is the technique's discriminator.** The
tree's own design write-up gives the reason for segmenting rather than
broadcasting in one sentence — that record processing is more often IO-bound
than CPU-bound, and that reading linearly while distributing computation to
threads is counterproductive because the per-record work does not justify the
inter-thread communication. That is the comparison the technique asks a reader
to make, made explicitly, by a team that then built the other topology.

**The thread-count warning is present and independently derived.** The same
document records that more threads can be counter-productive by pressuring IO,
and that the optimum is a balancing act rather than the core count — reached
from measurement rather than from the principle, which is the more convincing
direction.

**The measurements carry their protocol.** The published figures state the
artifact size (~11GB, ~3M records), the operation (a frequency table over one
field), the storage medium (SSD, called out explicitly), and the thread count:
2.326s at one thread against 0.643s at four. The write-up then says the result
depends on the filesystem's scheduling and concurrency characteristics and
should not be assumed to transfer. This is the discipline the technique asks
for, and it is unusual enough in a performance claim to be worth recording.

## The ordering cost, and the third response

The technique names three honest responses to the ordering that segmentation
spends. This tree implements all three, and the third one is where it is most
instructive.

Its parallel concatenation subcommand flushes rows to standard output as they
are produced, taking a lock to serialize writes, and the documentation states
plainly that output order is therefore arbitrary. That is response one:
unordered, and said so.

The `--source-column` flag adds a column naming which input each row came
from — response two, an ordinal by another name, letting a consumer regroup
without the producer buffering.

Response three is a flag, `--buffer-size -1`, meaning *hold a whole segment's
output before flushing*. The pipeline documentation is explicit about the
precondition that makes it affordable, and states it as the technique
requires — because the pipeline is a breakdown search producing one row per
group per input, the number of rows per input is known in advance, so buffering
all of them is bounded. **The condition is derived from the shape of the
pipeline, not from a guess about size**, which is exactly the distinction
between the third response and the fourth one the technique rejects.

## The structural fact: the flag that admits the failure mode

The buffer flag's own contract is the interesting part. It is not a size in
bytes or rows with a default somebody tuned; `-1` is a sentinel meaning
unbounded-for-this-segment, and its documentation earns it by naming the
property of the pipeline that bounds it. A tool that offered `--buffer-size
100000` instead would be offering the fourth option — buffering "enough" —
with no way for the caller to know whether enough is enough.

Read the other way, this is also the limitation: the flag is only correct for
pipelines whose per-segment output cardinality is structurally bounded, and
nothing in the tool checks that it is. A caller who sets it on a filtering
pipeline over a large input gets an out-of-memory failure at a scale that
depends on their data. The precondition lives in prose, which is where this
tree puts it and where a reader adopting the pattern should expect to have to
put it too, unless their pipeline description is machine-readable enough to
check.

## What this realization cannot do

The parallel path is opt-in per command (`--parallel`, `--threads`) rather than
a property of the runtime, so nothing prevents a caller from requesting threads
for an operation whose per-record work is expensive enough that a pool would
have been the right topology. The tool has no instrument that would notice; the
discriminator is applied once, by the authors, for the whole command set.

The published figures are single measurements rather than distributions, and
the write-up does not say whether the one-thread baseline ran on a cold page
cache. On an 11GB artifact against a machine's likely memory that matters less
than usual, but it is not stated, and the technique's warning about warm-cache
speedups is unaddressed here rather than answered.
