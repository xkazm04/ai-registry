---
layer: application
type: application
subject: audit-logging
technique: tamper-evidence
stack: node
status: forged
verified_on: 2026-10-27
---

# A serialized chain and an index that verifies before it trusts (afterlife)

Project `afterlife`, https://github.com/xkazm04/afterlife at main, commit 009c7893 (the same
tree as the hackathon mirror on GitLab). The ledger is rung three of the tamper-evidence
ladder — a chain across records — and its module header says what it is not:
"Append-only, hash-chained ledger: tamper-evident, not third-party anchored"
(`src/schemas/ledger.ts:1`). Two halves make the rung honest: the writer serializes, and the
importer treats its index as a cache that must earn every row.

## The writer: verify first, and one tail at a time

The technique's warning about rung three is that concurrent writers fork the chain. The
append command answers it in its header: "The chain is verified first: a broken chain is never
extended. With --write the read, verify and append all run under `<chain>.lock`, so a
concurrent append waits or is refused, never forks." (`engine/commands/ledger.ts:2-3`). The
lock is an exclusive create (`engine/commands/ledger.ts:65` "fs.closeSync(fs.openSync(lock,
'wx'))"), retried a bounded number of times (`engine/commands/ledger.ts:53` "LOCK_TRIES = 20"),
and a lock still held is a named refusal rather than a fork
(`engine/commands/ledger.ts:69` "the chain is locked by another writer").

## The importer: the index is a cache, so verify from genesis

The chain file in the repository is the source of truth and the database row set only a copy:
"the whole file must verify before anything is appended: a ledger that was edited, shortened or
forked is rejected (LedgerChainError) and the index keeps what it had"
(`src/server/ledger/importLedger.ts:1-3`). The steps, in order:

- **Skip on unchanged content id.** If the index already holds a tail and the file's blob id is
  the one imported last time, nothing is read (`src/server/ledger/importLedger.ts:37`); an idle
  ledger costs one tree listing (`src/server/ledger/README.md:14-15`).
- **Verify the whole file from genesis**, not just the new suffix
  (`src/server/ledger/importLedger.ts:43-44` "the file does not verify from genesis"). A suffix
  check would accept a history rewritten above the stored tail.
- **Reject foreign and rewound files**: events of another project
  (`src/server/ledger/importLedger.ts:46-47`) and a file shorter than what is stored (`:49-50`
  "(rewound)").
- **Detect a fork at the overlap.** Events from the stored tail onward, the tail included, are
  appended; an identical event is skipped and a different one at a stored sequence number is
  refused (`src/server/ledger/importLedger.ts:53` "appendLedgerEvents skips an identical event
  and rejects a different one"). The test `src/server/ledger/__tests__/ledger.test.ts:77` "a
  rewritten history that still verifies (a fork) is refused" is the case a from-genesis check
  alone would miss: the new file is internally valid, it just is not the history the index saw.

A rejection writes nothing, and the poller shows it as a failed feed for that project while the
rest of the poll lands (`src/server/ledger/README.md:21-22`), so tampering surfaces as a
visible failure rather than a quiet stale view — the technique's verify-on-read applied at the
import boundary.

## Deviations recorded

- No anchoring: the writer, the repository and the importer are one operator's, so a party
  with write access to the ledger repository can rewrite a chain from genesis before any index
  has seen it. The header's "not third-party anchored" states this honestly; rung four is not
  built.
- The blob-id cache is an in-memory map (`src/server/ledger/importLedger.ts:24`), so a restart
  re-verifies every ledger once. That is the safe direction, at the cost of one full read per
  project after each restart.
