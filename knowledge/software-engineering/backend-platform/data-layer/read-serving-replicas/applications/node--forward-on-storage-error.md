---
layer: application
type: application
subject: read-serving-replicas
technique: forward-on-storage-error
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@22
---

# A classifier in front, the store's refusal behind it, in emdash

How emdash (a TypeScript CMS on Cloudflare Workers, `emdash-cms/emdash` at
`e0270dc02fa96fba794a7ae0fb2d919e48f19a9f`, committed 2026-09-26; `engines.node >=22.16`,
TypeScript 6, wrangler 4) realizes
[forward-on-storage-error](../techniques/forward-on-storage-error.md) on two
replicated SQLite backends. Paths are relative to the tree root. Both backends
put a write classifier in front of the replica. Neither lets the classifier
decide correctness: the first retries on the store's own refusal, and the
second relies on the platform forwarding every write. This is the tree
behind the technique's condition that a classifier is a latency route and
never the gate.

## 1. Durable Object replicas: a prefix heuristic, backed by the readonly error

The Durable Object adapter's `query()` (`packages/cloudflare/src/db/do-sql-class.ts:143-196`)
routes each SQL statement by a prefix pattern,
`/^\s*(?:select|pragma|explain|with)\b/i` (`do-sql-types.ts:103`). A statement the
pattern calls a write goes to the primary's RPC stub before it runs. A statement
it calls a read runs on the local replica. The pattern is knowingly wrong in one
direction, and the comment above it says so (`do-sql-types.ts:111-115`):

> `WITH` is treated as a read because read CTEs dominate; a write-CTE misrouted
> to a replica throws a "readonly database" error, which the DO catches and
> retries on the primary (see `EmDashDB.query`), so the heuristic only affects
> latency, never correctness.

The catch is the technique's shim, one layer down. The replica's SQLite store
refuses the mutation. `isReadonlyError` matches `/readonly database/i` on the
error message (`do-sql-class.ts:60,73-75`), and the handler re-issues the same
statement on the primary (`:163-171`). The whole unit that was attempted is
forwarded. Here that unit is one statement, and a statement the store refused
left nothing behind, so replaying it is safe.

Two details carry the technique's other rules into this shape:

- **The write decision is observed, not classified.** After a statement runs,
  it counts as a write if the heuristic said so, if `cursor.rowsWritten > 0`, or
  if it is a PRAGMA (`:180-191`). Only a write mints a replication bookmark for
  read-your-writes. A write-CTE that the heuristic misread therefore still
  returns the bookmark its follow-up read needs.
- **The sentinel is a message match, not a type.** The platform surfaces the
  refusal as a generic `Error` whose text is matched by a regular expression.
  That is weaker than the technique's typed sentinel
  ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
  If a platform release rewords the message, every misrouted write-CTE becomes
  a thrown error, not a silent stale write, so it fails loudly. Nothing in the
  tree pins the message text with a test.

## 2. D1 sessions: verb routing for latency, platform forwarding for correctness

On D1 the request middleware classifies by HTTP verb:
`isWrite = request.method !== "GET" && request.method !== "HEAD"`
(`packages/core/src/astro/middleware.ts:708`). A write opens its D1 session with
`"first-primary"` (`packages/cloudflare/src/db/d1.ts:417-419`), with the stated
reason "we don't want a write plus a follow-up read racing across replicas"
(`:411-416`). The verb table is not what keeps a GET that writes off a
replica. The platform forwards every write regardless of where the session
started. From Cloudflare's read-replication page, fetched verbatim on
2026-09-26: "All write queries are still forwarded to the primary database
instance." The forwarded write advances the session's bookmark, so the
session's later reads wait for it. The unit forwarded is the statement, and the
session's sequential consistency, not a whole-request replay, keeps the order.

Scheduled and event work runs with `isWrite: true`, "a write workload", so its
session opens at the primary (`middleware.ts:404-413`). Queries outside any
session never reach a replica: without the Sessions API, "all queries will
continue to be executed only by the primary database" (same page).

## 3. Replay safety where the local attempt did not finish

The D1 session guard (`packages/cloudflare/src/db/d1-session-guard.ts`) handles
an environment where session queries hang (issue #1273). After a timeout it
re-runs SELECTs on the direct binding and **refuses to re-run anything else**:
"the hung call might still complete, which would execute the write twice"
(`:121-130`). This is the technique's replay condition, stated for the case
where the local attempt's outcome is unknown instead of refused. A refusal
proves the attempt did nothing. A hang proves nothing, so only reads replay.

## Where it departs from the technique

- The forwarded unit is a statement, not the whole request. That is correct
  here only because each backend makes statements the atomic unit: SQLite's
  refusal is per statement, and D1's session carries order across forwarded
  statements. A handler with effects outside the database before its first
  write gets no protection from either path.
- The refusal is detected by message text (section 1).
