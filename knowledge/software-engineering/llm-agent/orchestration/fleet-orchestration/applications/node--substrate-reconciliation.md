---
layer: application
type: application
subject: fleet-orchestration
technique: substrate-reconciliation
stack: node
verified_on: 2026-08-22
---

# Node — reconcile as the teardown path in an open-source agent platform

A public reference implementation of
[substrate-reconciliation](../techniques/substrate-reconciliation.md) (with
[outbound-compute-plane](../techniques/outbound-compute-plane.md) as its
surrounding topology) is the runner daemon of
[onecli](https://github.com/onecli/onecli) — an open-source platform that
gives every team member a sandboxed agent. Citations are against the public
tree at commit `ff7a192`; the tree was read for this document on the
`verified_on` date.

## The stance, stated in the code's own words

`apps/runner/src/runner.ts:20-35` opens with the three behaviors in priority
order, and the second is this technique verbatim: *"**Reconcile is the truth**
(and the teardown path). What the control plane says this runner should host
is authoritative; anything labeled as ours and absent from that list is
destroyed — container and volume. This is how deleting an agent reaches the
compute plane, and it is crash-safe by construction: a runner that died
mid-delete cleans up on next boot."* The loop interface (`runner.ts:117-129`)
exposes `reconcile()` beside the poll cycle as a first-class, separately
testable operation (`orphan-sweep.test.ts` drives it deterministically
against the in-memory backend).

## The fences, as shipped

The stale-orphan sweep (`runner.ts:737-840`) implements the technique's fence
stack and documents each as load-bearing:

- **Authority first, destruction second, never on a partial answer** — the
  doc comment states the order, and *"any check failure (an older control
  plane 404s the endpoint, a transport blip) aborts the whole sweep with zero
  destruction"*.
- **The installation fence** — resources carry an installation fingerprint
  that is *"a hash of the runner token — stable across a database reset (so
  the SAME install's dead-runner-id objects are still reaped) and different
  per install"*; another installation's objects, and pre-fix objects with no
  label, are never touched. The comment names the shared-daemon disaster the
  fence prevents: two installs on one host reaping each other's live
  sandboxes.
- **Unidentifiable and unageable objects are logged, never deleted**
  (`runner.ts:775-790`).
- **A grace window** (default one hour) *"spares mid-spawn siblings and
  freshly created objects whose rows are still landing"*.
- **The kill-switch** — `RUNNER_ORPHAN_REAP=false` detects and logs what it
  would destroy, deleting nothing (`runner.ts:828-837`).

## What the structure proves beyond the technique

Two adjacent decisions confirm the surrounding claims:

- **Single-use bootstrap credentials force replace-not-restart.**
  `runner.ts:277-295` recreates the container on *any* start of an existing
  sandbox, because the control-channel token (`ws/server.ts:17,36,55` —
  minted per spawn, consumed on connect) is baked into the container's
  environment and spent: *"starting it instead of replacing it produces a
  sandbox that runs but can never report, and the control plane re-dispatches
  it forever."* The durable home volume is untouched, so replacement is
  cheap. The failure the comment names is the exact shape the
  outbound-compute-plane technique warns about.
- **The compute plane never touches the store.** The runner's own README
  states it *"never touches the database: the migrations one-shot owns
  migrations, the api every read"* — the one-door rule holding at the plane
  boundary, not just the module boundary.

## What this realization cannot show

The sweep converges containers and volumes under one substrate backend
(Docker, behind the `SandboxBackend` seam). It has not been exercised against
a substrate with cascading deletes, and its inward direction (rows whose
containers vanished) is handled by start-time convergence rather than by a
verdict through a job-style state machine — a reader copying this shape into
a system with a formal session state machine still owes that verdict lane.
