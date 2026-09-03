---
layer: application
type: application
subject: job-coordination
technique: no-unrestorable-state-at-a-suspension-point
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.96.1
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# A job runtime that already satisfies the rule, by a convention nothing checks

The witness for `verified_against` is the repository's own toolchain pin
(`rust-toolchain.toml`, channel `1.96.1`), not a version anyone guessed — the file
pins the channel deliberately and records why (formatting drift from version skew
had reached ~190 files before the pin went in).

This realization is interesting for the opposite of the usual reason. The tree does
not violate the technique. It satisfies it across every one of its applications, and
the value of opening it is in *how* — because the mechanism that makes it safe is a
shape convention the runtime cannot enforce and never checks.

## What the runtime already owns

The worker implements the recovery half of interruption thoroughly, and the parts
that matter here are all present:

- A per-run cancellation token registry, so an external delete request reaches a
  running unit.
- A drain that distinguishes **finish** from **suspend**: inside the grace window
  units complete; past it, the token fires and the unit re-queues to its latest
  durable checkpoint rather than being marked cancelled.
- An attempt-lineage fence on every checkpoint write, so a task whose job was reset
  and re-claimed cannot overwrite the live attempt's state.
- Poisoned-checkpoint detection with a restored-attempt failure count, a
  resume-count bump, and a fail-open read so an unreadable checkpoint store never
  wedges a job.

All of that is the regime the corpus already modelled: the interrupted party
*survives to participate*. None of it is the regime this technique names.

## The involuntary regime, and how the tree answers it

Checkpoint writes are throttled — the first call writes, then no more often than a
fixed minimum interval, with a force flag for final and suspend snapshots. The
consequence is stated in the code rather than discovered: losing a few seconds of
progress on resume is the documented contract, because the state applications
checkpoint is idempotent to replay.

That is this technique's **reconstructible** category, chosen deliberately. A hard
kill between two throttled saves destroys work; the work is safe because re-running
it from the last durable snapshot lands in the same place.

What makes the answer hold is a shape, repeated in every application that
checkpoints: **the progress marker and the accumulators it gates live in one blob,
saved atomically.** Reading the twelve applications that checkpoint:

| Application | Marker | Accumulated beside it |
| --- | --- | --- |
| connector watch | `done` — slugs fully processed | `changes`, `errors` |
| grants harvest | `done` + `delta` — ids only, never record bodies | `capped`, `delta_total` |
| extractor backfill | `after` — keyset cursor of the last committed page | `scanned`, `loaded`, `batches`, `new`, `changed` |

Because the marker and the accumulator are written in the same snapshot, replay from
that snapshot re-derives both together and cannot double-count relative to the
marker. One application goes further and sorts its set before snapshotting, so the
blob is stable across flushes — a hash-ordered set would have produced a different
blob for identical state.

## The structural fact

Nothing in the runtime requires any of this. The checkpoint sink accepts an
arbitrary state value. Replay-idempotence is a property of each application's blob,
asserted in a doc comment on the sink and honoured by every author so far. The
runtime cannot inspect it, no test asserts it, and an application whose checkpoint
carried a counter *not* gated by its own marker would resume by double-counting,
silently, with every existing test green.

That is the shape of the finding: the safety is real, the compliance is total, and
the mechanism is convention. The tree could not have been built to prove that
distinction and proves it anyway — the doc comment on the sink has to *state* the
contract precisely because the type cannot.

## The paired comparison

**Measurable:** applications whose checkpoint state pairs its progress marker with
its accumulators in one atomic snapshot, over applications that checkpoint at all.

- **Arm A — the contract as prose.** The property is documented on the sink and
  honoured by convention. Result: **12 of 12 compliant, 0 violations.**
- **Arm B — the contract declared and checked.** The property is expressed so a
  violation is caught. Result: **the same 12, 0 additional findings.**

**Verdict: `not-better`.** Arm B is not an improvement on this tree today. It
detects nothing, because the population is fully compliant, and it would add a
declaration obligation to twelve call sites to catch a defect none of them has. A
count of zero violations is the honest reading of an enforcement proposal against a
compliant population, and it is worth recording so the next run does not re-run the
measurement.

The rejection is narrow and it names its own return condition: the convention is
unenforced, the population is small enough that unanimity is unsurprising, and the
cost of the first violation is a silent double-count on a resume path — the class of
defect that is cheapest to prevent and most expensive to find. **Return when the
checkpointing population grows past what one reviewer holds in their head, or when
an application first checkpoints an accumulator its own marker does not gate.**

## What this realization cannot do

It cannot say whether the convention would survive an author who had not read the
sink's doc comment, because no such author has written one of these applications
yet. Twelve compliant applications from a small team are evidence about the team as
much as about the design, and the technique's claim — that the design constraint is
separate from the recovery machinery — is supported here by the tree's shape rather
than by any failure it has suffered.
