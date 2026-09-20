---
layer: application
type: application
subject: table
technique: pagination
stack: next
status: forged
verified_on: 2026-09-20
verified_against: next@16
---

# A keyset cursor that crosses an HTTP boundary — and what opacity has to earn once it does

Read in the `ascent` tree (Next.js 16.3.3, Prisma 6.19.x over Postgres) at HEAD
`62c252dd`; every citation below was resolved against that tree on 2026-09-20.

The sibling application `rust--pagination` documents the same technique where
the cursor never leaves the process and the standard's opacity requirement is
therefore satisfied by scope. This one is the other case: the same cursor
design, but minted by a server, handed to a browser, replayed through a public
query string, and reused by a second consumer that walks the whole set. That
change of audience is where the interesting differences are.

## The cursor

`src/lib/db/scans-audit.ts` encodes the ordering tuple of the last delivered
row and nothing else:

```ts
// scans-audit.ts:317-319
function encodeAuditCursor(row: { at: Date; id: string }): string {
  return Buffer.from(`${row.at.toISOString()}|${row.id}`).toString("base64url");
}
```

The comment above it (`:315-316`) states the reason the standard gives, in the
standard's own terms: "`at` alone isn't unique, so the id tie-breaker
guarantees a stable, gap-free page boundary."

Every element of the cursor-design rules is present:

- **Tuple predicate** (`:367`) — `[{ at: { lt: cursor.at } }, { at: cursor.at,
  id: { lt: cursor.id } }]`. The query builder has no row-value comparison, so
  the OR-expansion is the portable spelling of `(at, id) < (cursor_at,
  cursor_id)`, exactly as the Rust/SQL sibling spells it for SQLite.
- **Composite order matching the predicate** (`:373`) — `[{ at: "desc" }, { id:
  "desc" }]`, both terms, same direction as the comparison.
- **`limit + 1` standing in for a count** (`:374-377`) — one extra row fetched,
  `hasMore` derived from the overflow, the extra row sliced off before it can
  reach a caller. The page's continuation is minted from the last *delivered*
  row, not the probe row (`:426-427`), which is the off-by-one this shape
  invites.
- **A bounded window** (`:355`) — `Math.min(100, Math.max(1, query.limit ?? 25))`.
  The route accepts a free-form `limit` (`src/app/api/audit/route.ts:130`, with
  `Number(...) || 25` absorbing garbage into the default), and the clamp sits in
  the data function rather than the route, so every caller inherits it rather
  than each one remembering.

**There is no total, anywhere.** The page type carries `entries` and
`nextCursor` and stops; the surface renders "N shown" rather than "N of M".
That is the technique's honest-bound advice taken to its conclusion — the
cheapest way to never render a count beside a predicate it does not belong to
is to never mint one.

## The surface pattern

A load-more button, which the technique names as the safest default for tables.
Both detachment conditions hold without any extra machinery: the button is not
rendered at all when `cursor` is null (`src/features/admin/audit/AuditLogTable.tsx:119`)
and is disabled while a fetch is in flight (`:123`), so it cannot fire
overlapping requests into the same window. The scroll-trigger clause about a
first window that does not fill the viewport does not apply — there is no
trigger, only a control the user presses.

The client holds the cursor as state seeded from the server-rendered first page
(`useAuditLogFilters.ts:20`) and attaches it only on a continuation
(`:53` — `if (!reset && nextCursor)`), so a new predicate starts a fresh
sequence rather than resuming a stale one. That reset is the client's
discipline, which matters below.

## The second consumer: the export walks the same cursor

`src/app/api/audit/route.ts:37-62` loops the identical function to stream a CSV
of the whole filtered trail — `let cursor = null`, page at a time, `cursor =
page.nextCursor`, until it runs out. This is the technique's "keyset cursors
also serve resumable feeds — pollers, bridges, exporters walking forward",
realized without a second query shape. Two things about it are worth
transplanting:

- **The export walks from the origin, not from the UI's window.** It takes the
  applied predicate and ignores the cursor entirely. The window is a property
  of the viewport; the predicate is the property of the data, and it is the one
  an export inherits.
- **The cap announces itself.** `CSV_MAX_ROWS = 10000` (`:29`) stops the loop,
  and because the order is newest-first the rows dropped are the oldest — the
  evidence an auditor most wants. The code refuses to let that pass silently
  (`:64-69`): a still-set cursor after the loop means rows remained, and the
  response says so in three places at once — a `-PARTIAL` suffix in the
  filename (`:78`), an `x-ascent-truncated` header and an `x-ascent-row-cap`
  header (`:85-86`). The comment names the failure it is avoiding precisely:
  the file's integrity hash "signs whatever bytes we emit, so a truncated file
  would otherwise be filed as complete compliance evidence with a valid
  integrity hash — false confidence."

  The cap itself is a round number with a one-line justification rather than a
  derivation from anything measured, which is the ordinary state of such
  constants; what makes this one safe is not its value but that exceeding it is
  reported rather than absorbed.

## Where it falls short: opaque, but not self-describing

The standard asks a cursor to be "opaque to the client and self-describing to
the server", so that "a cursor minted under one sort cannot be replayed against
another". This cursor is the first half only.

`decodeAuditCursor` (`:321-332`) validates the *shape* — both halves present,
the timestamp parses — and nothing about provenance. There is no version
discriminator and no binding to the query it was minted under. Concretely:

- **A cursor minted under one filter is accepted under another.** The route
  takes `cursor` and `action`/`actorId`/`since`/`until` as independent
  parameters and hands both to the same function. The result is well-formed and
  wrong in a way nothing can detect: rows matching the *new* predicate that sit
  *before* the old cursor's position are skipped, silently. Correctness rests
  entirely on the client resetting the cursor on every commit — which it does,
  deliberately, but it is a browser-side convention protecting a public
  read endpoint.
- **The cross-sort case is structurally absent rather than handled.** This
  table offers no sortable columns; the order is fixed at the query. So the
  hazard the self-describing rule exists for has never fired here, and would
  fire the day someone adds a sort control, in a file that has no reason to
  mention cursors.
- **Base64url of plaintext is a convention, not a seal.** It stops a client
  reading the encoding by accident and nothing more — positions are trivially
  fabricable, and because nothing carries a version, the encoding cannot be
  changed without breaking whatever cursors are in flight. The standard's two
  stated reasons for opacity are exactly those two, and neither is met.
- **A malformed cursor silently restarts.** `decodeAuditCursor` returns `null`
  on any failure and `getAuditLog` treats null as "no cursor", so a corrupted
  token yields the newest page rather than an error. In a load-more flow that
  is the head of the list appended to its own tail — duplicate rows, and
  duplicate keys, presented as a continuation. An unreadable resumption point
  is a failure to resume, not a request to start over, and the two must not
  produce the same response.

None of these is costing the product anything today; all four are the same
omission, which is that the cursor says where but never says *of what*. The
transplantable version of the fix is small — prefix a version byte and fold a
digest of the ordering-and-filter into the token, reject on mismatch — and the
reason to do it before it hurts is that the code which would have to remember
is not the code that will add the sort.
