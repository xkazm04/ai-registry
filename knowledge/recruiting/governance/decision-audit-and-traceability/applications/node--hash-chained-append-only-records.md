---
layer: application
type: application
subject: decision-audit-and-traceability
technique: hash-chained-append-only-records
stack: node
verified_on: 2026-09-29
verified_against: node@24
applied: code
ab_verdict: better
---

# A head witness for a chain the product itself truncates (TypeScript / SQLite)

`app/_lib/decision-record-store.ts` chains consequential hiring decisions per workspace:
each row's `content_hash` covers its canonical payload and its predecessor's hash, and
`verifyDecisionChain` re-walks a workspace's rows in `seq` order. Read at kp `104a4b1b5`
(2026-09-29).

## Steps it already carries

- **Per-tenant chain identity (step 3):** "A seal links off the LATEST hash IN ITS OWN
  WORKSPACE ... the chain identity is (workspace_id, prev_hash)" (`:15-20`). Pre-tenancy
  rows backfilled to the default workspace, so the old chain verifies unchanged as that
  workspace's chain.
- **The tail serialized in the seal's transaction (decision rules):** reading the head
  and inserting happen in one transaction "so two concurrent seals can't both link off the
  same prev and fork the chain" (`sealDecisionRecord`, `:312-315`).
- **A structured verdict (step 7):** census, break position, and how much was re-hashed.
  See this subject's integrity application.
- **Verification is bounded rather than scheduled.** It runs on read (the records route,
  the journey projection, the palette preview). A process-memory checkpoint lets a read
  re-hash only the new links, and it expires after 15 minutes
  (`CHAIN_FULL_VERIFY_INTERVAL_MS`, `:182`). The checkpoint's comment gives the design
  reason this application rests on: "a checkpoint row in the DB is written by exactly the
  party the chain defends against ... Process memory is not in their reach" (`:167-170`).
  Nothing verifies a chain nobody reads, so step 6 is only partly met.

## The truncation the product performed on itself

kp's compliance doc already said "TRUNCATION IS NOT DETECTED, at any key setting". The
chain holds no commitment to its head or length. The dp-da-0929 tree lane found the
writer that makes this concrete. `resetSim` purges the guided demo's sealed rows from the
**real** workspace chain: `DELETE FROM decision_records WHERE candidate_ref IN (...)`
(`app/_lib/sim-store.ts:266`, added 2026-09-03). Its test asserts "the sealed demo
decisions are gone" and never verifies the chain. `restoreOrg` does delete-by-scope plus
insert on the same table, which rolls a chain back to the backup's head
(`app/_lib/db-portability.ts:503-535`).

A harness outside the tree drove the real modules (`resetSim`, `sealDecisionRecord`,
`verifyDecisionChain`) through four product resets. Before the change (arm A, kp
`004f0b475`), on the next read:

| Case | A: next read | A: `{ full: true }` |
| --- | --- | --- |
| demo sealed last, chain verified, reset | ok | ok |
| a real decision sealed after the demo's, reset | **ok** | broken |
| as the first row, on a keyed chain | ok, `keyed: true` | ok, `keyed: true` |
| no verify before the reset | ok | ok |

The second row is the checkpoint hiding an interior delete. The incremental run starts
above the checkpoint's anchor, which the delete did not touch, so only the scheduled full
re-hash would have found it, up to 15 minutes later.

## The change (kp `104a4b1b5`, local, not pushed)

The **head witness** (`:203-223`, used at `:505-520` and `:602-610`) is step 5's weakest
holder, built in the store's own idiom. Per workspace, in process memory, it keeps the
highest `seq` this process verified and the count of rows at or below it. On the next
read, a changed count or a missing head row does three things:
- voids the checkpoint, so an interior delete is found at its exact seq;
- fails the verdict at the witnessed head, `{ full: true }` included, because a clean
  re-hash of what is left cannot prove what was removed;
- keeps the witness, so every later read in the process says the same.

After the change (arm B), the first three cases read broken on the very next read
(`BROKEN@3`, `BROKEN@6`, `BROKEN@10`). The fourth still reads ok under both arms.

Three tests pin it in `decision-record-store.test.ts:481-532`: a tail delete under a
verified keyed head, an interior delete under a checkpoint, and the limit. The first two
fail against the old store and pass after. The limit test passes both ways by design: "a
truncation nobody witnessed is invisible". The store suite passes 24 of 24. The suites
that touch the chain (status decisions, hash, palette preview, reinstate, screen-wave
tenancy, sim store, sim reset route, decisions API, journey, trust posture) pass 193 of
193. `tsc` over the two files is clean, with a positive control reported.

## What it does not do, and what that leaves

The witness forgets on restart and is per worker. A deletion made while no process had
verified the chain is still invisible. That needs step 5's stronger holders: a keyed
per-workspace head record, which kp's own gap list names ("a per-tenant head pointer MAC'd
under the same key"), or an external anchor, which is the only one that also survives a
wholesale rewrite. It also changes what a demo reset looks like. In a process that had
verified the workspace chain, the reset now reads as a broken chain until restart. That is
the truth about the reset, and kp's README says so beside the remaining fix: a sim reset
that no longer deletes sealed rows, for example one that seals the demo onto its own chain
scope.
