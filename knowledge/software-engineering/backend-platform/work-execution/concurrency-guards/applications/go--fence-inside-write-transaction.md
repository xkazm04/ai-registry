---
layer: application
type: application
subject: concurrency-guards
technique: fence-inside-write-transaction
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# Fencing and renewal in OpenBao's PostgreSQL HA backend (Go)

How a secrets server fences its active-node writes over a store that accepts
writes from anyone, and how the same backend's lease renewal is bounded. This
application covers `fence-inside-write-transaction` and reconciles
`renewal-deadline-two-thirds-ttl` in §4-§5, because both live in one file.
Citations are against the OpenBao tree at commit `6b5f82e1` (`go 1.27.0`);
paths are relative to the tree root.

## 1. The fence is armed at registration, and checked at every door

`internal/vault/ha.go:764-775` registers the acquired lock with the backend
when it is a `FencingHABackend`, "so it can correctly fence all writes from
now on"; failure to register gives up active state. `RegisterActiveNodeLock`
(`internal/physical/postgresql/postgresql.go:547-558`) stores the lock as
`p.fence`. `validateFence` (`:560-580`) returns nil when no fence is
registered (`:564-566`) — writes before registration pass, so bootstrap needs
no exception — and otherwise calls `IsActivelyHeld`. It is called from `Put`
(`:420`), `Delete` (`:459`), and from the transaction's `Commit`
(`internal/physical/postgresql/transaction.go:232`), after the read-only and
already-finished checks and before `t.tx.Commit()` (`:236`). Both doors carry
the check, per the technique.

`IsActivelyHeld` (`postgresql.go:655-674`) asks the store, not memory: a
`COUNT(*)` over identity, key, value and `valid_until > NOW()`
(`haCheckLockHeldQuery`, `:252-255`), returning held only for exactly one row.
The doc comment names the relation to the loss channel: `leaderLossCh` "is
the ultimate notification of lock loss", this "is a online check and goes to
the database" (`:652-654`).

## 2. Deviation: the check is adjacent to the write, not atomic with it

`validateFence` runs its `SELECT` on `pg.client` and returns; the write then
executes as a second statement (`Put`, `:420-424`), and in the transactional
path the `SELECT` runs on the pool connection while the commit happens on the
transaction's own connection (`transaction.go:232-238`). Nothing conditions
the write on the lock row inside one atomic unit, so ownership can change
between the check and the write. The `ha.go` comment's phrase "atomically
with each write" (`:766`) overstates what the code does: the window is
narrowed from acquire-to-write down to check-to-write, which is a real
improvement and not closure. Recorded as a **deviation** from the technique's
atomicity rule; the fix would condition the write on the lock row in the same
statement, or read the lock row `FOR SHARE` inside the committing transaction.
The standard stays.

## 3. The unfenced allowlist has a door and zero members

`UnfencedWriteCtx` and `IsUnfencedWrite` (`sdk/physical/physical.go:151-163`)
mark and read a context value; `validateFence` steps aside on the mark
(`postgresql.go:568-570`). The interface comment names the one intended
member — clearing and re-initialising a secondary cluster while sealed
(`sdk/physical/physical.go:121-129`). In this tree `UnfencedWriteCtx` has **no
non-test caller**: the allowlist is the door alone. That is the technique's
"greppable from one marker" property working — the set is enumerable and
currently empty — and it is worth a line in the interface comment, since the
case it describes belongs to a feature this fork does not ship. Confirmed:
mark on the call's context, fence reads it, default is fenced.

## 4. Renewal: two thirds of the TTL, in the database's clock

The constants (`postgresql.go:31-40`): TTL 15 s, renewal every 5 s, retry
every 1 s. `writeItem` (`:734-747`) wraps every steal and renewal in a
context timeout of `PostgreSQLLockTTLSeconds*2/3` seconds (`:746`), with the
comment giving the technique's invariant verbatim: "ensure that we notify on
leadership loss before the other node could acquire the lock" (`:744-745`).
Expiry lives entirely in the store's clock: the upsert writes `NOW() + $4 *
INTERVAL '1 seconds'` and steals only `WHERE t.valid_until < NOW()`
(`:233-239`); the renewal updates only `ha_identity = $1 AND ha_key = $2` and
never creates (`:240-248`); the held check compares `valid_until > NOW()`
(`:255`). The TTL travels as `$4` seconds. The file header records the
motive: "central postgres clock, hereby avoiding possible issues with multiple
clocks" (`:49-51`). Steal and renew are two statements, per the technique.

`periodicallyRenewLock` (`:703-719`) reads the renewal's result: `!gotlock`
or an error closes the loss channel and stops the ticker; an error is logged
with key and cause first (`:712-714`). A store error is treated as lost, the
cluster-lock posture the technique states.

## 5. Deviation: the sum is exactly the TTL

Cadence 5 s plus deadline 10 s equals the 15 s TTL. A renewal that starts on
the tick after the last success and hangs to its deadline gives up at the
instant the row expires and becomes stealable; the "little grace period" the
comment claims (`:741-742`) is not in the arithmetic. Recorded as a
**deviation** from the technique's strict-inequality rule; the contender's
1 s retry cadence is the only margin. The reserved connection is confirmed:
`txnMaxParInt = maxParInt - 1` with the comment "Leave one for lock renewal"
(`:146-149`), the fix job-coordination's lease-renewal section records.

## Reconciliation summary

Confirmed: fence armed on registration, checked in direct writes and at
transaction commit, from the store's own row; unfenced writes only through a
context mark, default fenced, allowlist enumerable (and empty); renewal
deadline at two thirds of the TTL with the invariant stated; expiry set and
evaluated in the database clock with the TTL sent as an interval; steal and
renew as separate statements; renewal reads its result and logs errors; one
connection reserved. Deviations: the fence check is a separate statement from
the write, not atomic with it; cadence plus deadline equals the TTL with no
margin.
