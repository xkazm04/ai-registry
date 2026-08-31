---
layer: technique
type: technique
subject: admission-queue
technique: wait-telemetry
status: forged
laws: [count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [fast executor reads as a slow executor, deciding what a depth count actually counts, mean wait flat while one entry ages forever]
---

# Wait telemetry

A queue that does not measure waiting hides the one number that explains
the user's experience. The request's owner sees a single duration —
"I asked at T, I got an answer at T+42s" — but that duration is a **sum of
two numbers with different owners**: time spent waiting for admission
(the queue's) and time spent executing (the executor's). Telemetry that
reports only the sum guarantees the wrong component gets optimized.

## The split: wait time is its own measurement

The queue stamps three instants on every entry: **arrived** (verdict
requested), **promoted** (execution began), and where relevant **exited
otherwise** (cancelled, shed, revoked). Wait time is promoted − arrived,
recorded as a first-class measurement, attached to the run so it travels
wherever the run's record travels, and reported *separately* from
execution time — never pre-summed.

The failure this prevents has a recognizable face: a fast executor behind
a slow queue **reads as a slow executor**. Users report "runs take a
minute"; the executor's own numbers say twelve seconds; without the split,
the team profiles the executor, ships an optimization, and the minute
persists — because forty-eight seconds of it was queue wait, invisible in
every place anyone looked. The split makes the same incident a one-lookup
diagnosis: wait 48, execute 12, fix the admission side (capacity, caps,
a closed pressure gate) instead of the execution side.

One trap deserves its own sentence: **a wait number computed but never
exported is telemetry that does not exist.** A queue that stamps the wait,
logs it once at promotion, asserts it in a test, and hands it to no
persistent record and no consumer-facing event has done all the work of
measurement and none of the work of telemetry — the number must land where
diagnosis happens (the run's durable record, the status surface, the
metrics stream), or the fast-executor-slandered incident proceeds exactly
as if the wait had never been measured.

The split also *composes*: what the executor calls "execution" often
contains further waits (a slot inside the runner, a rate window at a
provider). Each waiting layer owns its own stamp pair; the discipline
recurses, and end-to-end latency becomes a sum of named segments instead
of one unattributable blob.

## Depth, with its predicate

Depth is the queue's most-quoted and most-misquoted number. "Depth 30"
is not a fact until it carries its predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
waiting entries, waiting-plus-promoting, or everything-not-finished are
three different counts, and they diverge exactly when the system is under
the load that made someone ask. The queue reports:

- **depth by state** — waiting, promoting, running counted separately;
- **depth by class and by origin** — because a healthy aggregate can
  conceal one starving class or one origin holding every position (the
  fairness pathology is only visible in the decomposition);
- **depth against bound** — 47 alone alarms nobody; 47-of-50 is a fact
  with a consequence attached.

And the counters must observe the real population
([gate-sees-target](../../../../_laws.md#gate-sees-target)): a depth gauge
maintained as an increment/decrement ledger drifts from the actual entry
set whenever an exit path forgets its decrement — after which every
number in this technique quietly lies. Either derive counts from the
entry set itself, or reconcile the ledger against it on a cadence.

## Oldest-wait: the starvation instrument

Averages forgive; maxima accuse. Mean wait stays flat while one entry
ages forever — starvation is invisible in every average by construction.
The instrument that sees it is **oldest current wait, per class and per
origin**: the age of the longest-waiting entry now in the queue. Growth
without bound in any slice is the definition of starvation, whatever the
scheduling policy claims about itself. This is the number
[priority-and-fairness](./priority-and-fairness.md) is verified against —
a fairness policy without this gauge is a fairness *intention*.

## Wait objectives

A wait measurement earns its keep when a target stands next to it: each
class declares a wait objective (interactive: seconds; bulk: hours) drawn
from the same tolerance analysis that sized the depth bound in
[depth-bounds-and-shed](./depth-bounds-and-shed.md). The objective turns
telemetry into decisions three ways:

- **Alerting** — sustained objective violation pages capacity, not the
  executor team;
- **Honest promises** — position and expected wait shown to the waiting
  caller come from measured service rate, not optimism; a queue that can
  compute "position 4, typically ~2 minutes" converts an anxious poll
  into a calm wait, and a queue that cannot should show position alone
  rather than invent a number;
- **Shed pressure** — when measured wait at the tail exceeds the class
  objective, the depth bound is too deep: entries are being promised
  what the numbers prove cannot be delivered.

There is a fourth use, and it is the one that turns this telemetry from a
symptom report into a sizing instrument. **Time in the system multiplied by
arrival rate is the concurrency the system must hold.** At a steady arrival
rate, the number of requests in flight is arrival rate × time in system — so a
wait measurement and an occupancy requirement are the same fact stated twice.
Cutting wait at fixed demand *is* a capacity reduction: fewer slots, fewer
connections, less memory held, less of whatever
[resource-denominated-bounds](./resource-denominated-bounds.md) spends its
budget on. A wait regression is capacity the system is already buying without
anyone raising a purchase order. Every number this technique collects is
already one side of that identity; turning the crank is what makes the queue's
own measurements answer "how large must the pool be", instead of only "is
something wrong". The saturation curve and the utilisation knee are a different
subject's ground and should not be re-derived here — what belongs to the queue
is the population identity.

## The mean you report is not the wait anyone had

The section above warns that averages forgive and names oldest-current-wait as
the instrument that sees what they hide. That instrument catches starvation —
one entry aging forever — and it is blind to a second, more common way the mean
misleads, because this one is not a defect in the queue at all.

**An average over entries and an average over affected callers are different
numbers.** The queue computes per entry: sum the waits, divide by the count.
But a caller is exposed to a slow period in proportion to how long it lasts, so
callers land disproportionately inside the long stretches, and the wait a
randomly chosen *caller* experiences exceeds the wait of a randomly chosen
*entry*. The gap is the variance-to-mean ratio of the wait distribution, so it
is negligible when waits are tight and unbounded when they are heavy-tailed —
which is exactly the regime this subject exists for. A queue with no starvation
at all, every entry draining, oldest-wait flat, can still be delivering callers
several times its reported mean.

Two figures follow from this and they are not the same number, so say which one
is being reported. For a distribution of period lengths `X`, the mean length of
the period a caller lands in is `E[X²]/E[X]`; the mean *remaining* time from
the caller's arrival to the end of that period is half of it, `E[X²]/(2E[X])`.
The first answers "how bad was the stretch I was in", the second "how long did
I personally wait". Conflating them is a factor-of-two error in whichever
direction was not intended.

The consequence lands on the honest-promise rule above. An expected wait
computed from a correctly measured mean is still optimism when the distribution
is heavy-tailed — the measurement was not wrong, the population was. Where a
caller-facing estimate is shown, derive it from the wait distribution's tail
rather than its mean, or show position alone and promise nothing, which the
rule above already prefers. The same correction applies to a class wait
objective: an objective set against the mean is set against a number no caller
experienced.

**The two sections above are one error at two timescales, and the second is
easier to miss.** The sizing identity is exact only over a window in which the
arrival rate is what it is; averaged over a longer window it under-counts the
occupancy the system must actually hold, for the same reason an entry-averaged
wait under-counts the caller's — the quiet stretches contribute most of the
denominator and none of the load. One measured store gives the spread directly:
the same population computed over the burst that saturated it, over the day
containing that burst, and over the month, comes out at **36.1**, **1.53** and
**0.021** — a factor of seventeen hundred. The month figure says a fraction of
one slot; the burst says four slots were exactly saturated and thirty-two
entries were waiting behind them. **Averaging occupancy over a window no
arrival experienced is the inspection paradox in the capacity direction.** Size
against the busy period, and state the window beside the number, because a
concurrency figure without its window is not a smaller claim than a wrong one —
it is the same claim with the disagreement hidden.

## Verdict counters close the loop

Alongside the durations, count the verdicts: admissions, queue-fulls,
over-quotas, pressure refusals, sheds, cancellations — each by reason,
over time. The refusal-rate trend is the earliest capacity-planning
signal the system produces (it moves before wait times do, because the
bound clips the queue *before* waits explode), and a shed counter that
jumps is an incident announcing itself. The vocabulary technique makes
these countable; this technique insists they are counted.
