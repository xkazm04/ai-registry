---
layer: application
type: application
subject: admission-queue
technique: zero-depth-admission
stack: python
verified_on: 2026-09-04
verified_against: python@3.12
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# Python — the ratio, not the shape, and the arithmetic was right all along

How a CPU speech-synthesis service stands against
[zero-depth-admission](../techniques/zero-depth-admission.md). The witness for
the version is the tree's own compiled test artifacts (`cpython-312`), and the
harness below is the project's existing fake-model test rig, so the *real*
admission path runs with no model loaded.

This document exists because the technique was **refuted here**, and the
refutation is what the technique now says.

## The seam

The service admits through a bounded semaphore sized `workers + queue_max`,
acquired non-blocking, refusing with a 429 that carries a predicted wait and a
retry-after. `queue_max` is an environment knob defaulting to 32. Zero-depth
admission is therefore not a code change in this tree at all — it is
`queue_max = 0`, which makes the two arms differ on exactly one variable and
makes this measurable without touching product code.

The tree also already counts the pathology the technique predicts: a queued
job whose caller gave up before a worker reached it is tallied as `abandoned`,
distinct from errored and from completed, and its admission permit is released
at the moment of abandonment rather than whenever a worker finally dequeues it.

## Arms

Both arms replay one seeded arrival schedule — 90 callers over 1.5 s, ~60/s
against 2 workers × 10/s = 20/s capacity, so offered load is 3× capacity — with
a deterministic 100 ms model. Only `queue_max` differs (32 vs 0). Each caller
waits for its own deadline and then signals abandonment exactly as the HTTP
layer does on a 504 or a disconnect.

At the shipped configuration — caller deadline 1.5 s, fifteen service times:

| | queue_max=32 | queue_max=0 |
| --- | --- | --- |
| completed | **41** | 24 |
| abandoned | 21 | 0 |
| refused (429) | 28 | 66 |
| mean time to any answer | 723 ms | 27 ms |

**The technique lost, and it lost on the number that matters.** Zero depth
halved useful throughput. The pre-registered falsifier — "B materially lower
falsifies the technique" — fired.

## What the tree knew that the technique did not

Sweeping the one variable the technique's original rule ignored, everything
else held fixed:

| deadline ÷ service time | completed, queue_max=32 | completed, queue_max=0 | abandoned (A) |
| --- | --- | --- | --- |
| 1 | 2 | **20** | 88 / 90 |
| 2 | 4 | **24** | 86 / 90 |
| 3 | 7 | **24** | 83 / 90 |
| 5 | 12 | **24** | 76 / 90 |
| 10 | **26** | 24 | 38 / 90 |
| 15 | **43** | 24 | 19 / 90 |

The crossover sits between 5 and 10, and it is not a surprise once seen:
`depth-bounds-and-shed`'s wait-time-honesty formula — tolerable wait ÷ service
time × concurrency — returns 2 at ratio 1 (i.e. the worker count, no waiting
room) and 30 at ratio 15. **The tree ships 32.** The subject's existing
arithmetic already prescribed this configuration, and the technique's proposed
structural selector ("the caller is synchronous and holds a deadline") was a
strictly worse instrument: it is true in every row above while the correct
answer flips.

That is the amendment the technique now carries, and the seam class it names
is *a synchronous caller whose deadline spans many service times* — the case
where a queue converts patience into throughput and refusing it away is the
waste. A later run should not re-run this test against a service of that shape.

## The structural fact, which points the other way

Reading the admission path for why the tree is right also found where it is
wrong, and the two are the same line.

At admission the engine computes `queue_wait + est_synth_s` and compares it to
the caller's `deadline_s`. When that sum exceeds the deadline and no cheaper
quality rung fits, it records the unmeetable deadline as a metric — **and
admits the job anyway**. The gate has computed, from numbers already in local
variables, that this arrival cannot be served in time, and it issues a position
regardless.

That is `resource-denominated-bounds`'s unsatisfiable arrival with time as the
denominating resource: *"queueing it is a promise the gate has already decided
to break — the entry waits for capacity that cannot exist, ages past its own
deadline, and occupies a position that a serviceable item could have used."*
The corpus already owns the rule; the tree applies it to the *quality* decision
and not to the *admission* decision.

The sweep sizes the consequence. The abandonment column is that promise being
broken, counted: 88 of 90 arrivals at ratio 1, still 19 of 90 at the shipped
ratio. Every one of those held a permit a serviceable caller could have used.

Nothing was shipped for this. The finding is a per-request refusal at a seam
that already holds both numbers, its arms are a different experiment from the
one above, and the correct next step is a paired run against deadline-bearing
traffic — which this run did not have, because its callers passed no deadline.

## What this realization cannot show

The harness drives the real admission path against a fake model with a fixed
service time. It therefore cannot see what variance does to the crossover, and
variance is exactly what makes a predicted wait a guess: the tree's own cost
model refuses to promise from a cold window for that reason. The crossover
above should be read as the location of a boundary under deterministic service,
not as a threshold to configure against.
