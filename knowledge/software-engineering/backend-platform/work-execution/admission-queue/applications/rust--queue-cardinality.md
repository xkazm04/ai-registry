---
layer: application
type: application
subject: admission-queue
technique: queue-cardinality
stack: rust
verified_on: 2026-08-31
verified_against: rust@1.85
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# Rust — twenty kinds of work, four fungible permits, and one line that is right

How a Rust job runner stands against
[queue-cardinality](../techniques/queue-cardinality.md). This is a **rejection**,
and it is the row that produced the technique's coexistence test.

## The seam

One global permit pool of four, and a single claim statement ordering the whole
table by priority then arrival, taking one row. Twenty distinct work kinds share
it, each bound to its own upstream host by a per-host rate governor. The
per-kind split the technique argues for is **already implemented** — an
exclusion list in the claim query, a per-kind cap, a config key — and shipped
in the off position, defaulted to zero.

That last fact is what makes this seam worth testing rather than building: the
alternative arm exists in the tree.

## The arms

A discrete-event replay of the runner's exact claim loop over its **160 real
completed jobs**, using each row's recorded availability stamp as arrival and
its recorded execution span as service time.

- **A** — as shipped: four permits, per-kind cap disabled, one undifferentiated
  line.
- **B** — the rule applied: same four permits, per-kind cap at 1, 2 and 3.

The model was validated against history before either arm was read: arm A
reproduces the recorded aggregate wait to within 0.03 s over 160 jobs, the
recorded maximum to within 0.03 s, and agrees with the record on all 160
did-this-job-wait decisions.

## What the arms said

| arm | aggregate mean wait | the one kind that waits | the other nineteen |
| --- | --- | --- | --- |
| **A (shipped)** | **263.6 s** | 577.8 s | 0.04 s |
| B, cap 3 | 359.5 s | 788.0 s | 0.04 s |
| B, cap 2 | 549.9 s | 1205.1 s | 0.04 s |
| B, cap 1 | 1124.4 s | 2464.3 s | 0.04 s |

Splitting the line is **4.3× worse in aggregate**, 4.3× worse for the only kind
that ever waits, and changes the other nineteen by nothing at all.

**Verdict: not-better.** And the technique's own discriminator, applied
honestly, agrees with the measurement: the four permits are genuinely fungible —
any permit runs any kind, and the non-interchangeability lives *downstream* in
the per-host governor rather than in the slot. "Count the sets of servers an
arrival could be served by" returns one. One line is correct here, and the tree
had already reached that answer.

## Why, measured directly

The mixed-class instant the penalty requires **never occurred**. Of 159 jobs
that waited at all, five overlapped a different kind's waiting entry, and the
largest such overlap was 0.035 s. Over the month, the queue was non-empty for
1,610 seconds, of which **zero** held more than one kind. Every congestion event
was one kind fanning out against itself — the single real event was a
fifty-state fan-in enqueued within 100 ms of itself.

Head-of-line blocking cannot exist in a line that only ever contains one head's
class. That is the condition the technique now carries as its coexistence test,
and this seam is where it came from: the rule's cost claim ("splitting costs
nothing where servers are non-fungible") is true of the steady state and false
under class-clustered arrivals, which is a common shape rather than an exotic
one.

## The structural fact

The tree could not have been built to prove the shared queue is correct here,
and it proves it anyway — by shipping the alternative and leaving it off. The
exclusion list, the cap and the config comment calling it a fairness cap are a
complete, tested per-kind-line implementation, disabled by default. The replay
says enabling it costs 4.3× and buys nothing, because the fairness it would buy
was never owed. **A disabled feature is usually a lead; here it was a control
arm somebody had already built.**

A second structural fact, unsought: this project has two bounded queues and the
bound landed on the wrong one. The job queue serves twenty non-interchangeable
kinds and has **no depth bound at all** — enqueue never refuses — while a
fan-out queue serving exactly one kind of unit carries a documented cap with a
written sizing rationale. All the heterogeneity is on the unbounded side. The
two were written independently and nobody chose that arrangement.

Noticed while measuring: the priority column is zero on 159 of 161 rows, so the
aging expression in the claim statement is computing a decay over a constant.
The ordering machinery is inert alongside the cardinality machinery.

## Return condition

Re-test where class coexistence is non-zero. This measurement was taken on a
store whose only congestion is a single-kind fan-in, so it bounds the technique
rather than refuting it — the coexistence fraction is the number to read first
in the next tree, and it is computable from any store keeping an arrival stamp
and a promotion stamp.

## What this realization cannot do

The replay reproduces waiting and cannot see cost. It shows that splitting the
line raises wait 4.3× and cannot show whether the per-kind cap would have
protected an upstream host from a burst it could not absorb — the governor that
would answer that sits downstream of the queue and was held fixed in both arms.
