---
layer: application
type: application
subject: watch-cache-and-resync
technique: read-phase-before-write-transaction
stack: node
status: forged
verified_on: 2026-10-27
---

# A polled GitLab replica with a read phase and per-source freshness (Node)

afterlife (https://github.com/xkazm04/afterlife, commit `009c7893`, the same tree as the
GitLab hackathon showcase) keeps a local index of one GitLab group — projects, merge
requests read as agent tasks, proofs, trust tiers — by polling, because the REST API it
reads has no change stream. Every cycle re-reads the group (`src/server/poller/cycle.ts`)
and each project (`src/server/poller/project.ts`) into an embedded Postgres. It realises
read-phase-before-write-transaction and, beside it, per-source-freshness-rows.

## 1. Reads first, one transaction per project

The file header is the rule: "read GitLab (MRs, notes, deployments, agent MRs' sizes and
pipelines, the CI file's arm markers, the ledger), then write every derived row in one
transaction. Reads come first, so a failed read writes nothing and the project keeps its
last good rows." (`src/server/poller/project.ts:1-2`). The unit of consistency is the project; the reads
(`:117-149`) include the derivation (`deriveTask`, `:126`) and the optional facts
(`addMrFacts`, `:132`). The write phase is `await db.transaction(async (tx) => {` (`:151`),
ordered parents first — `await upsertTasks(tx, rows); // before the proofs: proof.task_id
references task` (`:166`) — and roll-ups after ("pollClasses after the tasks: its counters
count this poll's merges", `:174`). Values only the store holds are read inside the
transaction and merged (`mergeTask`, `:92-104`), the technique's first decision rule.
Work whose rows reference the project's runs after commit: "after the project row:
stage_cell references it" (`:189`).

Optional facts degrade to unknown on their field: the poller README says "a failed read is
null with an issue, never 0" (`src/server/poller/README.md:31`) and, for the CI file's
arm markers, "a failed read is `armed` null, never 0, and the poll's issue (the poll still
succeeds)" (`:39`).

The ledger import is the technique's importer case: `importLedger` (`src/server/poller/project.ts:137`)
appends to its own table before the transaction opens, but it is an append-only chain keyed
by sequence, where "appendLedgerEvents skips an identical event and rejects a different
one" (`src/server/ledger/importLedger.ts:53`), so a repeat after a failed project poll
rewrites nothing.

## 2. A failure keeps the last good time and marks the project stale

`src/server/index/repositories/pollState.ts:1-2`: "A stale feed must look stale: age is
computed from the last good poll, and a failed poll keeps the last good time (so "47 min
ago" stays true) while recording the error." `recordPollOk` sets `last_ok` and clears
`last_error` (`:29-35`); `recordPollError` updates only `last_error` on conflict
(`:37-43`). Sources are namespaced: `project:${projectId}` (`:13`) and `policy:${group}`
(`:19`).

A project's failure records its error and marks it stale: `await recordPollError(db,
projectSource(id), out.error);` then `if (existing || written.length > 0) await
setProjectState(db, id, 'stale');` (`src/server/poller/project.ts:195-196`). A group-level failure fails every
dependent with the upstream cause, "the group could not be read: ${error}"
(`src/server/poller/cycle.ts:42-48`), and a project that left the group is marked, not deleted: "the project
is no longer in the group (moved, archived or deleted)" and `setProjectState(db, gone.id,
'stale')` (`src/server/poller/cycle.ts:110-113`). The README states the same for the cycle as a whole
(`src/server/poller/README.md:10-14`).

Scoping is done on the view, not the store: `src/server/data/live/scope.ts:1-7` explains
that "a cycle marks a project it no longer lists stale, never deletes it", so after a group
change the snapshot is filtered by each project's page path, and "before one succeeded, a
restarted runtime keeps no linked project (it cannot tell whose they are)" — the
technique's step 6.

## Deviation recorded

**A ledger rejection fails the project after its transaction landed.** `src/server/poller/project.ts:190`
throws the ledger error after the transaction and the maturity scan, so the catch at
`:192-196` records a poll error and marks the project stale although every row of the
cycle is fresh. The README calls this intended ("a rejected ledger still lets the rest land,
then fails the feed", `README.md:34`). It is honest about the ledger but mislabels the
rows' age: the freshness row cannot say *rows fresh, ledger rejected*. A separate
`ledger:<project>` source would keep the two facts apart.
