---
layer: technique
type: technique
subject: runner-fleet
technique: shared-resource-serialization
status: forged
stage: team
laws: [identity-survives-reuse, creation-names-reaper]
shared_with: []
use_when: [two deploys ran at once, a migration needs exclusive access, adding a deployment lock, builds queue behind each other unnecessarily]
---

# Shared resource serialization

Some work must not run twice at once: deploying to one environment, migrating one database,
publishing one version, touching any resource that does not tolerate concurrency. Parallelism
is the fleet's entire purpose, which makes the fleet the correct place to hold the exception.

Express it as a property of the work — a **named exclusion** with a limit — enforced by the
thing that schedules the work.

## Why the delivery system holds it, not the job

The tempting alternative is a lock taken inside the job: acquire at the start, release at the
end. It fails in a specific and expensive way.

A lock inside the job is not held by the job's *queue position*. So two runs both start, both
occupy runners, both reach the lock, and one waits — burning capacity to wait. Then the waiting
one times out, and a timeout mid-deployment is the worst available outcome: a partial
deployment, rather than a refused one. The failure is not that locking is wrong; it is that the
lock was acquired after the point of no return.

Held at the queue, the second run simply does not start. No runner occupied, no partial state,
no timeout, and the situation is visible in the queue where somebody is already looking.

## The name is the identity

The exclusion is identified by a name, and per
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse) that name must be stable
and must mean exactly one thing:

- **Name the resource, not the pipeline.** `deploy-to-<environment>` rather than
  `<pipeline>-deploy` — two pipelines deploying to one environment must share the name, and a
  name derived from the pipeline guarantees they will not.
- **Be specific enough not to over-serialize.** A single name covering every deployment in the
  organization makes unrelated teams queue behind each other, and the usual response is that
  somebody removes the lock rather than narrowing it.
- **Be broad enough not to under-serialize.** Two names for one resource is no exclusion at all,
  and it is the failure that only appears under load.
- **Derive it from a declared source**, not from a string typed into each pipeline. The
  environment names live in one place; the exclusion name is computed from them.

Getting the granularity right is the whole difficulty, and the test is direct: *what is the
resource that cannot tolerate two simultaneous writers?* That, and nothing coarser.

## Ordering

Two behaviours, and the choice depends on what the work is:

- **Strictly ordered** — work runs in the order it was created. Correct for deployments, where
  running an older change after a newer one leaves the environment holding the older code with
  a newer version recorded. Costs latency: a slow item blocks everything behind it.
- **Unordered** — any waiting item may take the free slot. Correct for contention over a shared
  test resource, where the items are independent and only exclusivity matters. Higher
  throughput, no ordering guarantee.

Default to ordered for anything that changes a persistent state, and unordered for anything that
merely borrows a resource.

## Supersession, which matters most at machine pace

When several changes queue for one environment and each supersedes the last, running all of them
in order deploys obsolete code repeatedly, slowly, and the environment is briefly wrong each
time.

The rule: **for the deployment class of work, keep the newest waiting item and cancel the
superseded ones**, rather than draining the queue in order. This is not the same as unordered —
order is preserved among what remains; what changes is that obsolete items are discarded rather
than executed.

It needs care. Superseding is correct when each item fully replaces the previous state. It is
wrong when items are cumulative — a migration sequence must run every step, and discarding one
because a newer one arrived is data loss. Decide per exclusion, and write which it is.

At human pace this is an optimization. At machine pace, where a queue of twelve superseded
deployments is ordinary, it is the difference between a working environment and one that spends
its afternoon deploying history.

## Waiting names its end

Per [creation-names-reaper](../../../../_laws.md#creation-names-reaper), every exclusion states
what happens when the wait does not end:

- **A maximum wait**, after which the item fails rather than queueing indefinitely. An
  indefinite queue is a stall that reads as slowness.
- **Release on every terminal outcome** — success, failure, cancellation, and the run being
  abandoned. A slot leaked by a crashed run blocks the resource until someone finds the manual
  release, usually during an incident, usually not quickly.
- **A visible holder.** Which run holds the slot and since when, in the same surface as the
  queue. "Why is nothing deploying" must be answerable in one look.

## What belongs in a serialized lane

- Deployments to a specific environment.
- Migrations against a specific store.
- Publishing a specific artifact identity.
- Anything acquiring an exclusive external resource — a test account, a device, a licence seat.

What does not: builds, tests, and analysis. If those need serializing, the real problem is
shared mutable state between them, and serializing is hiding it — at a throughput cost that
grows with the team.

## Decision rules

- Hold the exclusion at the queue, never as a lock inside the job.
- Name the resource, not the pipeline; derive names from one declared source; granularity is the
  resource that cannot take two writers.
- Ordered for work that changes persistent state; unordered for work that borrows a resource.
- Supersede for the deployment class; never for cumulative work; write down which each exclusion
  is.
- Every exclusion has a maximum wait, releases on every terminal outcome, and shows its current
  holder.
- Serialize deployments, migrations, publishes and exclusive external resources — not builds and
  tests, where serialization hides shared mutable state.
