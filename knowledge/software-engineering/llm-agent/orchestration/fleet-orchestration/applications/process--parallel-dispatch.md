---
layer: application
type: application
subject: fleet-orchestration
technique: parallel-dispatch
stack: process
status: forged
verified_on: 2026-09-17
applied: experiment
ab_verdict: better
proof: measured-history
---

# Process - three weeks of one operator's fleet, and the number nothing counted

A single-operator agent fleet on one workstation, with a durable session registry, a
configured parallel-execution ceiling, a live-session ceiling that was never switched
on, and a review table where work raised for a human verdict waits with a created and
a resolved timestamp. Three weeks of its own history, replayed read-only from a static
snapshot of its store. No product code was changed and nothing was written to it.

## What the machine side did

- Peak simultaneous live sessions: **15**, on a door whose live-session ceiling was
  absent from settings, which for that door means off. The figure lands inside the
  range a practitioner independently reported for the same job, which is a
  corroboration and not a derivation.
- Peak simultaneous runs against the one ceiling that *was* configured (ten): **11**.
  So the machine ceiling is real, it engages, and it engages at ten or eleven.
- 636 runs passed through those ten slots in the period. Every one of them released
  its slot, and every one that produced something raised an item for a person.

## What the supervisory side did, over the same hours

- Peak items simultaneously open for a human verdict: **34**, at 08:33 on the busiest
  day. Ten or more on eight of the ten active days; six or more on nine of them.
- On five of those days the machine ceiling did not bind at all. **The machine ceiling
  bound first and bounded nothing downstream.** That is the whole finding: the slot cap
  protects simultaneous machine load and releases on completion, and a bound on a
  releasing stock places no bound on a non-releasing one behind it.

## The release test

The distinguishing property of this third bound is that completion does not release
it, so it was measured directly: for every item, the interval between the machine
finishing and the hold closing.

| interval | items |
|---|---|
| under a second | 1 |
| a second to a minute | 7 |
| a minute to an hour | 92 |
| an hour to a day | 75 |
| over a day | 15 |
| never closed | 22 |

Median 0.86 h, p75 7.8 h, maximum 168.6 h. A stock released by completion would sit in
the first row; 47.6% of the closed holds outlived completion by more than an hour and
7.9% by more than a day. The five longest all closed at almost exactly 168 hours,
which is a weekly sweep rather than a decision - where the release *is* observable it
is usually an expiry, and the two must not be recorded as the same outcome.

## The prescription, armed separately - and it is the breach, not the remedy

The rule this application was written to test prescribes grouping: bucket the threads
so the supervisor tracks buckets rather than threads. Applied literally to the same
history, grouping verdict acts that landed within two seconds of each other:

- 190 items resolved in **97** acts, so grouping did halve the count: 0.51 acts per
  item. As a behaviour, "the supervisor tracks buckets, not threads" is confirmed.
- 28 of those acts covered more than one item. **18 of the 28 spanned more than one
  severity class**, and the largest covered 28 items across four severity classes and
  seven distinct work streams - 8 minutes after the stock peaked at 34.

The paired assertion is what separates the remedy from the breach: a group must
shrink the count where one verdict honestly serves it (ten of the twenty-eight were
single-class, one of them nine items of one class across seven streams), and must
**not** shrink it where the group spans classes. Two thirds did the second thing. So
bucketing under load is the overflow discharging itself, and the level at which it
starts is this operator's ceiling - a derived number, recomputable from the ledger
the review surface already writes, and specific to the person.

## The number that was derived from the wrong thing

A second dispatcher in the same fleet's tooling sizes its human-facing waves at eight
workers. The written derivation is the runtime's own concurrency cap of twenty divided
by the fan-out each member would spawn. Seven waves of eight ran; the machine cap
never came close to binding; one person read all fifty-six returns serially and
rendered a landing verdict on each. The supervisory number was never written down, and
the number that stands in its place tracks the process table.

## Controls

- The concurrency instrument reports 1 for twenty strictly serial intervals and 20 for
  twenty fully overlapping ones, so it can read both a floor and a ceiling.
- The lag instrument read a real 0.0027 s resolution, so it can report a zero.
- The grouping instrument reduced a synthetic twelve-item homogeneous set to one group,
  so its failure to reduce elsewhere would have meant something.
- The three series come from three different tables, and the wave series from a
  different system entirely, so no assertion here is certified by the instrument that
  produced it.
