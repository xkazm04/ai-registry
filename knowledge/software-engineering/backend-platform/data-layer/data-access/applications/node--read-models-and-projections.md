---
layer: application
type: application
subject: data-access
technique: read-models-and-projections
stack: node
verified_on: 2026-08-29
---

# Read models and projections in two Next.js data layers (ascent, pof)

Tree A is `ascent` at `10cbd8fa` (2026-08-29), `@prisma/client@6`, data
layer under `src/lib/db/`. Tree B is `pof` at `b3ebab44` (2026-08-26),
`better-sqlite3@12`, data layer as `src/lib/**/*-db.ts`. Between them they
show every part of the technique: a stored read model with a parity read, a
snapshot projection that refuses to parse its own payload, a recount kept
in the writer's transaction, and the one obligation neither tree meets.

## Tree A — a cached balance with a ledger that can contradict it

`Organization.scanCredits` (`prisma/schema.prisma:45`) is a stored read
model: the running balance, kept beside the aggregate because every scan
reads it. The source it is derived from is the append-only `CreditLedger`
(`:156-176`), whose header calls itself "the trustworthy record behind
Organization.scanCredits" and whose `balanceAfter` column (`:164`) stamps
the balance "immediately after applying this row (within the same txn)".
The propagation contract is therefore *synchronous*, and the code keeps it:
every movement is one transaction that increments the balance and appends
the row (`src/lib/db/credits.ts:143-175`, `:349-391`), with the post-write
balance **re-read inside the transaction** before it is stamped (`:370-377`)
— the comment explains that deriving it from the initial read "races with
concurrent debits: under READ COMMITTED each tx's stale snapshot would
stamp the same balanceAfter, corrupting the reconciliation trail".

The parity read exists: `getCreditReconciliation`
(`credits.ts:487-…`) sums ledger deltas over a window and reports debited,
refunded, granted, net — and its comments record two defects that only a
parity read could have surfaced: the sum previously ran over "the newest
200 rows" and "silently lost every row beyond" that on a busy fleet
(`:492-496`), and a refund clawback was being counted as scan spend because
the bucket was chosen by sign instead of reason. Both are the technique's
count-carries-predicate rule failing in a projection and being repaired by
naming the predicate. What is missing is the last step: nothing compares
`net` against `scanCredits`. The recomputation is invokable and the stored
value is beside it, and the arbiter — "which of these is right" — is never
asked. A stored read model with a parity *read* but no parity *check* is
the technique's gap named exactly.

`TeamStandingSnapshot` (`src/lib/db/team-standings.ts`) is the other
shape: an append-row projection of a derivation (`explainTeamStandings`)
captured at scan time (`:30-58`), with the headline fields denormalised
into columns beside the full JSON. The read (`:64-92`) selects only those
columns — "so a corrupt `standingsJson` can never break the page" (`:59-63`)
— which is the projection-surface rule that the display read does not load
what it does not render. It is *asynchronous by design*: the page renders
the live derivation and uses the snapshot only to stamp when it was
captured, so staleness is a labelled fact ("captured by the org scan at …")
rather than a surprise. Both writes are best-effort and never throw
(`:52-56`, `:88-91`) — correct for a snapshot nothing depends on, and worth
stating because the same posture on `scanCredits` would be a money bug.

## Tree B — the recount that lives in the writer's transaction

`game_director_sessions.findings_count` (`src/lib/game-director-db.ts`) is
a stored count with the strongest possible propagation contract: it is not
incremented, it is **recomputed from the source inside the same
transaction as every write that can change it** —
`SET findings_count = (SELECT COUNT(*) … WHERE session_id = ? AND
${TRIAGE_EXCLUDED_SQL})` in `addFinding` (`:243-271`) and again in
`updateFindingTriage` (`:287-300`). The predicate travels with the number:
`TRIAGE_EXCLUDED_SQL` is one constant, so "findings" means the same thing in
the stored count and in any live count, and the comment at `:260-261` says
which findings are excluded and why. This is derivation-names-recomputation
satisfied by construction — the recompute *is* the write — with the
consequence that no separate repair function is needed and none exists.
The residual obligation is smaller than Tree A's but the same kind: nothing
recomputes when a finding is deleted through a path that does not pass
these two functions, and the layering survey found routes in this tree
that reach the store directly.

## Where the two trees leave the technique

Neither tree hands a projection back to a write — the projections here
are counts, snapshots and balances, none of which any handler edits and
returns. Neither tree has a projection *module* as such: read-shaped
queries sit inside the aggregate modules they read from (`org-nav-counts`,
`team-standings`, `getCreditReconciliation` beside `grantCredits`), which
is the mirror-trap pressure the technique predicts and which neither tree
has yet felt enough to partition. And on stored read models both trees
have the recomputation and neither runs the comparison: Tree A has the
sum and the balance and never subtracts them; Tree B recomputes on write
and never audits. The technique's third obligation — a parity check that
actually runs, in test or on a schedule — is the one gap common to both.
