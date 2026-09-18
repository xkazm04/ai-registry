---
layer: golden-path
type: golden-path
subject: agent-run-budgeting
status: draft
use_when: [setting wall-clock or attempt ceilings for unattended runs, handling a provider refusal mid-queue, sharing a rate-limited seat between agents and judges, pacing a long benchmark or migration queue]
techniques:
  - ceiling-as-measurement-boundary
  - refusal-detection-and-requeue
  - allowance-budgeting-across-workloads
---

# Agent run budgeting

An unattended fleet spends three budgets at once: **wall-clock**, because runs occupy a
queue; **allowance**, because seats and keys are rate-limited per window; and
**attention**, because every run that needs a human to interpret it is a cost the fleet
was meant to remove. Budgeting is not cost control in the accounting sense — on a
flat-rate seat there is often no invoice at all — it is the discipline that decides what
happens at the edges: when a run runs long, when the provider says no, and when two
workloads want the same allowance.

Those edges are where most of a fleet's bad data comes from. A run killed by a ceiling, a
run refused by a seat and a run suspended by a sleeping host all produce artefacts that
look enough like results to be scored, and each one, scored, becomes a confident false
statement about a model.

## The three budgets, and what each protects

- **Wall-clock ceilings** protect the queue from a single stuck run and make runs
  comparable. A ceiling is chosen from the distribution of honest runs of that task shape,
  not from patience, and it is part of the measurement: a run that hits it is reported as
  having hit it.
- **Allowance** is the shared, windowed capacity of a seat. It is consumed by every
  workload on that seat — the agents, the judging, and any interactive session the operator
  is running. A fleet that budgets only its agents will exhaust the window and then discover
  it cannot score what it produced.
- **Attention** is protected by making refusals, ceilings and environment faults
  self-evident in the log, so the operator reads a queue's health in seconds rather than
  reconstructing it from artefacts.

## Refusals are not results, and they rarely look like errors

A provider refusal — rate limit, session limit, capacity, quota — arrives in whatever shape
the runner chooses. It may be a non-zero exit, or a success envelope whose text explains
the refusal, or a normally-shaped result that is simply empty. The fleet's detector reads
the text, not only the status, because a refusal recorded as a finished run is the most
expensive single failure mode available: it is cheap to produce in bulk, it is invisible
in aggregate, and it lands as a zero-output run attributed to a model.

The handling is the same in every case: do not store it, pause the queue for the window
the provider named, and requeue. A pause that is shorter than the provider's window is a
retry loop; one much longer wastes the seat's recovery.

## Ceilings interact with the host, not just the model

A ceiling measured in wall-clock assumes a clock that only advances while the run does.
Suspended hosts, hibernating laptops and paused containers break that assumption in two
directions: a run that was asleep reports a duration it did not spend, and a ceiling can
fire the instant the host wakes, killing work that was never given its time. Both outcomes
are host artefacts. A fleet that treats wall-clock as ground truth will publish them as
model behaviour.

## Sharing one seat between producing and judging

Where the same seat runs the agents and the judges, ordering matters. Judging after each
run keeps results fresh but burns allowance the queue may need; judging in a deferred batch
keeps the queue moving and concentrates the risk that the window closes before anything is
scored. Neither is wrong, but the choice is explicit, and the fleet always keeps enough
allowance to *score what it has already produced* — unjudged runs are inventory, and
inventory that expires is waste.

When a judge seat refuses mid-verdict, nothing partial is recorded. A verdict produced by
half the intended judges is not a cheaper verdict; it is a different measurement wearing
the same name.
