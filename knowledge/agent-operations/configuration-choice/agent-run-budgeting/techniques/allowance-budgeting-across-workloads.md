---
layer: technique
type: technique
subject: agent-run-budgeting
technique: allowance-budgeting-across-workloads
status: draft
laws: [a-refusal-is-not-a-result, the-judge-never-grades-its-own-family]
shared_with: []
use_when: [one seat serves agents and judging, planning a long queue against a windowed limit, deciding whether to judge inline or in a deferred batch]
---

# Allowance budgeting across workloads

The concern: a rate-limited seat is a single shared resource, and a fleet usually plans
only its most visible consumer — the agent runs. The other consumers are real and arrive at
the worst time: the judging that turns runs into results, the operator's own interactive
session, and any retry storm. When the window closes, the fleet is left holding unjudged
inventory it cannot score, which is worse than having produced fewer runs.

## The budget

Treat a window as capacity to be allocated, not discovered:

- **Producing** — the agent runs themselves, the largest and most elastic consumer.
- **Scoring** — judging, which is small per unit but multiplies by the number of judges,
  and which is *mandatory* for the work to have value.
- **Operating** — the interactive session driving the fleet. On a shared seat this is not
  free, and exhausting the window locks the operator out of their own console.
- **Slack** — headroom for reruns of refused and truncated cells, which are guaranteed.

## Inline versus deferred scoring

**Inline** (score each run as it finishes) keeps results fresh, surfaces defects early and
leaves no inventory. It spends allowance while the queue still needs it, and a judge
refusal stalls the producing queue.

**Deferred** (produce now, score in a batch) keeps the queue moving at full rate and
concentrates scoring where it can be watched. It creates inventory: if the window closes
before the batch runs, nothing produced is scored, and the inventory may need re-scoring
anyway if the measurement changes in between.

Choose deferred when one workload's seat is constrained and the other's is not, or when a
judge's counterpart family is unavailable and verdicts would have to be withheld anyway.
Choose deferred as well where judging runs on API keys with a batch interface: batch
requests are priced below interactive ones (half, at one major provider) and draw on their
own limit pool, so deferral stops scoring from competing with producing at all. And where
the judge's model or rubric may move during a long queue, a deferred batch judges every run
against one snapshot; inline judging of a multi-day queue must pin both.

Otherwise - one shared subscription seat, a pinned judge - choose inline by default: fresh
results are what make a long queue steerable.

## Decision rules

- **Never let producing consume the scoring budget.** Reserve it explicitly; the queue that
  cannot be scored produced nothing of record.
- **A withheld verdict is preferable to a partial one.** When one judge's seat refuses,
  record no verdict rather than a single-judge score dressed as a full one — and requeue.
  Partial votes may be kept as pending inventory with their judge count, never as a
  verdict. Count withheld verdicts per arm: if they are not spread evenly they bias what
  remains. And keep two refusals apart: a judge whose *seat* refused is missing data and is
  requeued; a judge that refused *the content* has said something about the work.
- **Cap parallelism at the lower of the window's limit and the machine's.** For a
  fixed-volume window the seat usually binds: more workers spend the same allowance sooner
  and raise the refusal rate. Parallel coding agents also build and test, so memory, disk
  and working-tree contention can bind first; and under a per-minute token bucket the rate,
  not the volume, sets the useful concurrency. Hold concurrency constant across compared
  configurations regardless - it is a confounder of the measurement, separately from the
  budget.
- **Watch the host as well as the seat.** A queue sized for the seat can still exhaust
  memory or disk on the machine, and a runner killed for host pressure loses whatever it
  was producing — budget the local resources with the same explicitness.
