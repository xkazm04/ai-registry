---
layer: technique
type: technique
subject: scale-investment-timing
technique: execution-model-concurrency-threshold
status: forged
laws: [count-carries-predicate, limits-are-derived]
shared_with: []
use_when: [adopting a cooperative multiplexing execution model, a proposal argues that dedicated workers are too expensive, choosing the flow-control model for a new service, deciding whether concurrency is a capacity problem yet]
---

# Size the execution model to measured concurrency

The subject's other techniques quantify one axis: how many machines. This one
adds the axis that decides a system's *internal* shape — **concurrent
in-flight operations** — and it is decided the same way, with a number stated
before the investment rather than a preference stated after it.

> **Adopting a cooperative multiplexing execution model — where many units of
> work share few workers by yielding at explicit suspension points — is a
> capacity decision with a stated threshold on a named axis. Below the
> threshold, one worker per unit of work drawn from a pool is simpler and fast
> enough. The threshold is written down before adoption, together with the
> per-worker cost that sets it.**

## The threshold, and the cost model that produces it

The honest crossover is **roughly one to ten thousand concurrent, mostly idle
connections.** That is where per-unit resident cost and switch volume become a
real fraction of the machine, and where the multiplexing model starts paying
for its complexity. Most services never operate there.

The lower bound matters as much and is quoted far less: **below about ten
concurrent input/output operations, profile before committing to anything.**
In that region the model's overheads — the per-suspension bookkeeping, the
indirection where the unit's shape must be erased, the scheduler's own queue —
are a larger share of the work than the waiting they were adopted to overlap.
A measurement takes an afternoon and routinely comes back saying the simple
model is faster.

Between the two bounds sits the region where the answer is genuinely "either,"
and it is decided by the per-worker cost of the dedicated model
([limits-are-derived](../../../../_laws.md#limits-are-derived) — the threshold
is *computed* from these, not chosen):

- **Resident memory per idle worker: tens of kilobytes**, on the order of
  20–80KB. The much larger figure usually quoted — several megabytes — is
  **reserved address space, not committed memory**, and pages are committed
  only as they are touched. Quoting the reservation as the cost is the single
  most common error in this argument, and it overstates the true figure by two
  orders of magnitude.
- **Switch cost: single-digit microseconds**, roughly 1–5µs. At fifty
  concurrent operations this is noise. At a hundred thousand switches a second
  it is measurable, and that rate — not the concurrency count — is the thing
  to measure.
- **Creation cost: tens of microseconds**, roughly 10–30µs, and **a pool
  amortizes it to zero.** A proposal that cites creation cost without saying
  whether a pool was tried has not costed the alternative.

Each of these numbers travels with its predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): the
platform, the workload's idle fraction, and the date. They are the right order
of magnitude on current commodity hardware; they are not a substitute for
measuring the system in hand, and a threshold quoted from this document
without its own measurement is the imitation failure the golden path names,
arriving on a new axis.

## Why the asymmetry argument reproduces here exactly

The subject exists because over-building fails silently and continuously while
under-building fails loudly at a dated moment. The execution-model decision has
the same shape, and it is worth stating in its own terms because the costs look
nothing like a cloud bill:

- Delivery runs slower, permanently, because every function that touches the
  model constrains every caller above it.
- Diagnostics degrade: a five-frame call stack becomes twenty-five, half of it
  runtime internals, and every subsequent incident is investigated through
  that.
- Every test needs a runtime, and the test suite acquires a dependency on the
  scheduler's behaviour that it did not have.
- Shared state changes shape — ownership becomes reference-counted and
  guarded — and the exclusion primitive is now a decision rather than a
  default.

None of that generates an incident. Nobody is paged for a service whose
concurrency model is one order of magnitude too clever, so the feedback that
would calibrate judgement never arrives — which is the whole argument for
writing the threshold down instead of holding it as taste.

The under-built direction does page: at real concurrency, a dedicated worker
per unit saturates memory or the scheduler and the failure is dated,
attributable, and fixable with the migration that this technique's threshold
was supposed to schedule. That is the correct asymmetry to design against.

## When the threshold is crossed, it is crossed on a measurement

The instrument is concurrent in-flight operations, sampled at peak, not
requests per second — a thousand requests a second each lasting a millisecond
is one concurrent operation, and a hundred requests a second each waiting a
minute is six thousand. **The axis is occupancy, and the number teams quote is
almost always throughput.** Alongside it, measure the idle fraction: the model
pays off on operations that are *mostly waiting*, and a workload that is busy
rather than waiting gets no multiplexing benefit at any concurrency, because
there is nothing to overlap.

State the threshold with its axis and its method, the way the subject states
every other ceiling, and treat it as
[a deadline rather than a starting gun](./ceiling-as-deadline-not-trigger.md):
the migration between execution models is contagious through the call graph
and needs runway, which is exactly what a team has none of at the moment the
threshold is reached.

## Inversions

Three cases override the threshold, and all three are legitimate:

- **Per-connection state is trivial and connections are numerous and idle.**
  A front door holding tens of thousands of open connections that do almost
  nothing is the shape the multiplexing model was built for; adopt it at that
  boundary without a debate, and note that adopting it *at the boundary* does
  not license it through the core.
- **The platform makes cheap multiplexing free.** Where the runtime
  multiplexes lightweight units itself — code written in the ordinary
  sequential style, multiplexed onto few workers underneath — the trade this
  technique arbitrates does not exist. There is no complexity to weigh against
  the capacity, so there is no threshold to state. This is the direction the
  industry has been moving, and a team on such a platform should not import
  the argument.
- **The model is mandatory for ecosystem reasons.** The libraries the system
  must use expose only the multiplexing form, or the surrounding platform
  requires it. That is a real constraint and it can carry the decision alone —
  but it is a second-column reason in the sense
  [migration-reason-audit](./migration-reason-audit.md) means, and it must be
  **stated**, because an unstated ecosystem compulsion gets rehearsed later as
  a capacity argument that was never made.

## When not to apply it

**When there is no observed concurrency at all.** A system with no traffic has
no occupancy figure, and the analysis produces an argument. Keep the
irreversible parts conservative — the boundaries the model would contaminate —
and come back when there is a measurement.

**When the model is confined to the edge.** A boundary layer that multiplexes
connections while the logic beneath it stays in the simple form has not made
the investment this technique interrogates; it has made a much cheaper one.
Where that boundary belongs, and how to tell plumbing from logic, is
[concurrency-at-the-edge](../../../../engineering-process/codebase-stewardship/module-design/techniques/concurrency-at-the-edge.md)'s
question, not this one's.
