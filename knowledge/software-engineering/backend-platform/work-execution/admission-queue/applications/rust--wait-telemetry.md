---
layer: application
type: application
subject: admission-queue
technique: wait-telemetry
stack: rust
verified_on: 2026-08-31
verified_against: rust@1.85
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Rust — the wait is in every row and nothing subtracts it

How a Rust job runner stands against
[wait-telemetry](../techniques/wait-telemetry.md), and against its two additions:
the sizing identity, and the gap between an entry-averaged wait and the wait a
caller had.

## The seams

Two, and they are the same omission from opposite ends.

A hardcoded in-flight bound — four, with a comment saying "max jobs running at
once, across all apps" — derived from nothing. And an availability stamp and a
start stamp, both present in every row, whose difference is computed by no
query, no log line, no gauge and no route anywhere in the tree.

## The arms

The same 160 completed jobs, read two ways for each mechanism.

**The caller gap.** A = the entry-averaged mean any `AVG()` rollup produces.
B = the length-biased figures over the same rows.

| quantity | entry-mean | length-biased | ratio |
| --- | --- | --- | --- |
| wait | 263.7 s | **952.1 s** | **3.6×** |
| service | 50.1 s | 136.7 s | 2.7× |
| time in system | 313.8 s | 939.3 s | 3.0× |

The amendment's exact claim, instantiated: **no starvation anywhere** — every
job drained, maximum wait twenty minutes — and a caller lands in a stretch 3.6×
the reported mean. The two-figure ambiguity the technique warns about is live
and large here: 952 s against 476 s for the remaining-wait form, so a report
that does not say which it means is off by eight minutes.

The aggregate is worse than merely biased. Mean wait 263.7 s, **median 0.01 s**:
one number describing a population where nineteen of twenty work kinds waited
essentially not at all and one waited ten minutes. It overstates nineteen kinds
by four orders of magnitude and understates the victim by 2.2×.

**The sizing identity.** A = the shipped constant. B = arrival rate × time in
system, over the one window that actually saturated.

Over that burst: arrival rate 0.0416/s, time in system 868 s, service 96.1 s.
So the population the system must hold is **36.1**, of which **32.1 is queue**
and **3.99 is running** — against a configured four slots, at utilisation 1.00.
The identity derives the shipped constant to two decimal places, and was
validated against direct integration over the full span.

The useful half is what the constant cannot see: the system held thirty-six
jobs while sized for four, and 89% of that held population is queue — memory,
rows, callbacks, budget holds — that no configured number in this project
describes. The constant sizes the eleven percent.

**Verdict: better**, on both mechanisms, on real rows.

## The result that changed the technique

The same population computed over three windows — the burst, the day containing
it, and the month — comes out at **36.1**, **1.53** and **0.021**: a spread of
seventeen hundred. Averaged over the day the identity says two slots would do;
the burst says four were exactly saturated with thirty-two entries waiting.
Averaging occupancy over a window no arrival experienced is the caller-versus-entry
error in the capacity direction, which makes the technique's two new sections
one error told twice. That sentence is now in the technique, and this seam is
where it came from.

## The structural fact

**The wait is stored and nothing reads it, and the storage is an accident of
retry.** The availability stamp exists because failure handling pushes it
forward for backoff; the start stamp exists because the claim update needs a
lease stamp for the reaper. Neither was written to measure waiting. Their
difference is this technique's entire stamp pair, complete and correct in every
row, and nothing subtracts them.

Meanwhile the one place the project *does* reason about elapsed time measures
execution only — a run duration split into indexing, hooks and alerts — and that
table is empty in the live store. So the project instrumented the executor and
left the queue unmeasured, which is precisely the fast-executor-slandered
incident this technique opens with, pre-arranged and not yet triggered.

## Return condition

None owed for the verdict. Two follow-ups: the entry-versus-caller ratio was
measured on a store whose only congestion is a single fan-in, so re-read it once
the runner sees a mixed sustained arrival stream — the ratio should fall if the
tail is fan-in-shaped and hold if it is upstream-latency-shaped, and that is the
falsifier. Separately, a second tree gave a 4.8× ratio in the same direction but
on 35 of 504 rows, because 469 carry a null duration; that null rate is its own
finding against whatever writes that table.

## What this realization cannot do

The identity sizes occupancy and says nothing about what the occupancy costs.
It shows thirty-two entries were held that no configured number describes, and
cannot show what holding them consumed, because nothing in this store records
per-entry memory or connection footprint.
