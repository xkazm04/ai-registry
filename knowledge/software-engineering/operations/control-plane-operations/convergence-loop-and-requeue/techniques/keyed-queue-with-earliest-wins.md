---
layer: technique
type: technique
subject: convergence-loop-and-requeue
technique: keyed-queue-with-earliest-wins
status: forged
laws: [identity-survives-reuse, limits-are-derived]
shared_with: []
use_when: [a burst of triggers for one key is doing N passes for one outcome, an urgent trigger arrives for a key already scheduled far out, a churning key should be converged once after the churn, a scheduled time from a caller crashed the timer]
---

# Keyed queue with earliest-wins

The queue in front of a convergence loop is not a buffer of events; it is a
**map from key to next-look time**, with a timer attached. Every arrival is a
statement — *this key should be looked at no later than T* — and the queue's
whole job is to hold at most one such statement per key, always the strongest
one. That reframing is the technique: once the queue's unit is a key rather
than an arrival, deduplication is not a feature added to a queue, it is the
only thing the queue does.

## The four rules, in the order they fire

**One slot per key.** An arrival for a key with no entry inserts one. An
arrival for a key that already has an entry never inserts a second; it acts on
the existing one. The key is composed exactly as
[guard-key-design](../../../../backend-platform/work-execution/concurrency-guards/techniques/guard-key-design.md)
prescribes and carries nothing per-invocation — no timestamp, no trigger
identity, no reason
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). A
key that varies per arrival makes every arrival unique, the map degenerates
into a list, and the queue silently becomes the thing it was built to replace.

**Earliest wins.** When an arrival names a time earlier than the stored one,
the entry moves earlier. When it names a later time, the arrival is discarded —
not stored, not appended, not made into a second pass. This is the rule that
lets an operator's "do this now" overtake a routine hour-long requeue without
producing two passes, and it is the rule most often implemented backwards:
last-write-wins is the natural thing to type, and it lets a routine requeue
issued microseconds after an urgent trigger push the urgent pass an hour into
the future. The symptom is a converger that responds instantly under light load
and mysteriously slowly under churn, which reads as a capacity problem.

**Park, do not run, behind an in-flight twin.** A key whose expiry arrives
while an equal key is executing is moved to a parked set rather than started,
and taken from that set the moment the executing pass finishes. Parking is not
queueing: it has no position and no ordering, because there is at most one
parked entry per key by construction.

**A second arrival for a parked key is dropped entirely.** This is the rule
that looks like a bug and is the point. The parked entry represents a pass that
has not started; when it starts it will read the world as it is then, including
whatever the second arrival was telling it about. Storing the second arrival
would schedule a pass to observe changes the already-scheduled pass is going to
observe anyway. Under a hot key this rule is the difference between bounded and
unbounded work, and it is safe only because the pass is full-state — which is
the dependency between this technique and
[told-that-not-why](./told-that-not-why.md), and the reason neither is sound
alone.

## Trailing debounce: added to the expiry, never replacing it

A key in a rapid phase transition emits arrivals faster than any pass can be
useful. Debounce is the answer, and its correct form is a delay **added** to
the entry's expiry on every arrival, so the entry expires only after the key
has been quiet for the debounce period. That is a trailing edge: one pass,
after the churn, seeing the settled state — as opposed to a leading edge, which
fires on the first arrival and sees the state at its least settled.

Two rules and one hazard:

- The debounce is added at scheduling time, so the entry's stored expiry
  already contains it, and an arrival naming an earlier time still wins. The
  interaction is deliberate: an urgent trigger can shorten a debounced entry,
  it just cannot escape the debounce.
- **Debounce is per queue, not per key**, in every implementation worth having,
  because a per-key debounce is a second tuning surface that nobody revisits.
  Which means the value must be chosen against the *busiest* key the loop
  watches, not the typical one.
- The hazard is permanent postponement. A debounce longer than a key's
  inter-arrival interval means the entry's expiry is pushed forward faster than
  the clock advances, and the pass never runs at all. On a key that updates
  every few seconds — a heartbeat-carrying record, a status field written by
  another party — a debounce tuned on a calm object hides changes indefinitely,
  and the loop looks idle rather than broken. Write the hazard beside the knob;
  a debounce with no stated ceiling relative to the watched key's update rate
  is a configuration that will eventually be set to a number that stops the
  system.

## Clamp every deadline before it reaches the timer

A queue entry's time comes from arithmetic on a caller's interval, and callers
supply absurd intervals: an overflowed addition, a "never" expressed as a very
large number, a unit confusion, a configuration read as seconds and meant as
milliseconds. Timers have limits, and the failure mode of exceeding one is
usually not a rejection but a crash inside the timer — which takes down the
whole loop for one bad interval on one key.

So the scheduling path clamps: the computed time is reduced to a ceiling before
insertion, and the ceiling is **derived from the timer's own documented bound
with a stated margin**, written beside the constant along with the incident or
limit it comes from ([limits-are-derived](../../../../_laws.md#limits-are-derived)).
A ceiling chosen by feel is raised by feel; a ceiling that says "the timer
panics past two years, so we clamp at six months" survives the next person.
Clamping rather than rejecting is the right verdict here because the clamp is
harmless: a key clamped to the ceiling is looked at far later than any real
policy wants, which is indistinguishable from the caller's intent and cannot
break correctness, since the pass is full-state whenever it eventually runs.

## The rejected alternative: a channel plus a semaphore

The shape almost everyone builds first is an unbounded channel of trigger
messages with a semaphore-limited pool of workers draining it. It is fewer
moving parts, it needs no timer, and it has honest advantages: strict arrival
ordering, trivially inspectable, and no chance of the parked-set bugs above.
The forces that defeat it are two. It has **no deduplication** — ten arrivals
for one key are ten passes, so work is proportional to notification volume
rather than to changed keys, and the amplification is worst exactly when a
dependency is flapping. And it has **no per-key exclusion** — two messages for
one key can be drained by two workers, so the pass races itself, and the
semaphore that looks like a concurrency control is a global cap wearing the
costume of a guard (see
[per-key-exclusion-under-a-global-cap](./per-key-exclusion-under-a-global-cap.md)).
Bolting dedup onto it means an auxiliary set beside the channel, which is this
technique's map arrived at by a longer road and with a race between the two
structures.

Choose the channel when the work items are genuinely distinct units that must
all execute — that is a job queue, and it belongs to a different subject
entirely. Choose the keyed map when several arrivals mean the same thing.

## Boundary

This technique owns queue-time coalescing: what happens between an arrival and
an execution.
[single-flight-primitives](../../../../backend-platform/work-execution/concurrency-guards/techniques/single-flight-primitives.md)
owns the second-caller policy at the *call* — refuse, join, queue, coalesce,
merge — and its coalesce option is the nearest neighbour to the rules above:
"run once more after this finishes". The difference is where the decision lives.
There a caller arrives at a running operation and a policy decides what that
caller gets; here nothing is calling, the arrivals are notifications with no
waiter, and the queue decides what the *system* does. That is why there is no
"join" here and no result to return: nobody is waiting for the answer, which is
also why dropping arrivals is permissible at all. And the bound on how many
distinct keys may wait belongs to
[admission-queue](../../../../backend-platform/work-execution/admission-queue/admission-queue.md)'s
depth discipline — this technique bounds the arrivals per key at one, which is
a different and complementary bound, and a converger watching an unbounded
number of records still needs theirs.
