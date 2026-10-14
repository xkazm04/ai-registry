---
layer: application
type: application
subject: cross-provider-benchmark-operations
technique: async-run-queue-with-cancel
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@2021
applied: code
ab_verdict: better
---

# Rust: the cancel that nothing ever finished

LightTrack's job queue implements the technique almost clause for clause: one
atomic claim statement, a stale reclaim counted apart from run failures, a
`cancelling` state outside the claimable set, a fenced finish, an honest
unsupported refusal on a backend that cannot cancel atomically, and a shared
conformance suite that pins the contract across the SQLite, Postgres and
Firestore stores. That makes it a poor place to look for the technique
working and a good place to look for where the technique stops.

## The seam chosen to falsify it

Rule 3 of the technique keeps `cancelling` out of the claimable set so a dead
worker's cancelled run is never handed to the next worker. The conformance
test pinned exactly that, and it also pinned its consequence: with every lease
stale, the job stayed `cancelling`. Nothing in the claim path, the finish path
or any sweep ever ended it. A cancel whose worker died before reaching a case
boundary therefore read as a live run forever, with frozen progress and no
terminal record. Had a caught outcome taught nothing, this would not have been
worth running; it taught that the technique specified who must not restart a
cancelled run and never specified who finishes it.

## A and B

A, the tree as it stood: the strengthened assertion (a cancelling job with a
stale lease is settled) failed with `cancelling` where `cancelled` was
expected. B: the claim path of each store settles a `cancelling` job whose
lease is stale as `cancelled`, stamping a dedicated marker error distinct from
the worker-lost marker, and not counting it as a stale reclaim. Renewal already
accepts `cancelling`, so a live worker winding down keeps a fresh lease and is
left alone; the conformance suite now asserts that half too. The SQLite
conformance and unit suites pass; the Postgres and Firestore stores carry the
same contract but were not run (no backend available), and the workspace
clippy and format gates are green.

## What the technique gained

An amendment: a job in the cancelling state needs a settler. The reclaim path
that refuses to restart it should end it, as cancelled, with a marker saying
the stop was finished on the worker's behalf.
