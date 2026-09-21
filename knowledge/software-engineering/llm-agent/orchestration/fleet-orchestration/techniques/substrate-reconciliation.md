---
layer: technique
type: technique
subject: fleet-orchestration
technique: substrate-reconciliation
status: forged
laws: [creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [deleting a fleet entity must reach the machines that host it, containers or worktrees survive the records that justified them, two installations share one substrate daemon, a cleanup sweep is about to act on a partial listing]
---

# Substrate reconciliation

The registry is the fleet's memory; the **substrate** — the containers,
volumes, worktrees, and processes that sessions actually occupy — is somebody
else's daemon with its own opinions about what exists. Nothing keeps the two
aligned by itself: an executor that dies mid-delete leaves the container
running; a database reset leaves a fleet of resources no record justifies; a
crash between "create the row" and "create the container" leaves the inverse.
The alignment is a job, and this technique gives it its shape: **a periodic
pass that lists what the substrate holds, asks the registry what should
exist, and converges the substrate toward the registry — never the other way
around.**

## Deletion is a registry act that reaches compute by convergence

The load-bearing consequence: **deleting a fleet entity is an edit to the
registry, and the reconcile pass is how that edit reaches the machines.** The
alternative — sending a teardown command to the executor — fails in exactly
the cases deletion exists for: the executor that is offline, mid-crash, or
already replaced never receives the command, and the resource outlives its
record indefinitely. A convergence loop can retry incomplete deletion when the authority and
substrate become available. This requires idempotent teardown, retained deletion
intent, correct ownership and a supervised retry policy; permanent outages or
permissions failures can prevent convergence and must remain visible.

This is [creation-names-reaper](../../../../_laws.md#creation-names-reaper) at
fleet scale: the registry that justifies a resource's existence is also the
authority whose confirmed deletion intent retires it. Absence from an authoritative complete snapshot can be a reap predicate under
an explicit inventory contract. A reset, stale replica or authorization-filtered
list is not necessarily deletion intent. Preserve tombstones or a registry epoch
and require explicit reset policy before reaping resources from an earlier epoch.

## The fences, each load-bearing

A pass that destroys what it cannot account for is a weapon pointed at live
work. The discipline is a stack of fences, and every one has a failure it
exists to prevent:

- **Authority first, destruction second — never on a partial answer.** The
  pass asks the registry *before* touching anything, and any failure to get a
  full answer — an endpoint that 404s, a transport blip, a listing that
  errored — **aborts the whole sweep with zero destruction**. A partial
  listing read as a full one converts an outage into a purge; per
  [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success),
  "could not list" and "listed nothing" must never share a spelling.
- **The installation fence.** A substrate daemon is routinely shared — two
  installations on one host enumerate each other's resources, each unknown to
  the other's registry. Every resource is labeled with an installation
  identity **stable across a registry reset and distinct per installation**
  (a durable random identifier or a stable derived fingerprint with a collision
  and rotation policy), and a resource labeled by another
  installation — or not labeled at all — is never this pass's business.
- **Unidentifiable and unageable resources are logged, never deleted.** A
  resource missing the label that names its owner, or the timestamp that
  makes a grace window computable, cannot be safely acted on. The honest
  output is a warning an operator will see.
- **A grace window spares the mid-spawn.** Creation is not atomic across the
  record and the resource; a freshly created resource whose row is still
  landing looks exactly like an orphan. A grace window reduces this race but does not prove safety when creation
  can stall. Use creation reservations or generation-aware revalidation against
  a complete authoritative snapshot immediately before destructive work.
- **A kill-switch that detects but does not destroy.** Reconciliation's first
  deployment runs with reaping off, logging what it *would* delete. The gap
  between "would reap" logs and operator expectations is the fence-tuning
  feedback loop, run at zero blast radius.

Deletion must target the exact owned resource incarnation, not a reused name.
Recheck ownership and deletion generation at the substrate boundary, use a
conditional delete where supported, and fence a continuing writer before releasing
its resources. Record partial teardown instead of claiming success for the whole
container-and-volume group.

## One pass, both directions of drift

The same pass that reaps the recordless resource should surface the
resourceless record — the registry row whose substrate is gone. The verdict
for that direction belongs to the registry's own state machine (the session
is marked failed or expired through the one door, with the pass as the named
actor), never to a direct status edit; the job-coordination subject's
boot-recovery discipline owns that verdict table, and this pass is one of its
triggers. What this technique adds is the outward half nobody else owns: the
substrate side, where the resources live and the records cannot see.

## When not to use this

When the substrate is in-process — tasks in the orchestrator's own memory —
there is nothing to converge; process exit is the reaper. And when resources
are provably tied to their records by the platform itself (a managed service
that cascades deletes), reconciliation reduces to an audit: run it read-only,
and let its findings be alerts rather than destruction.
