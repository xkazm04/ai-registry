---
layer: application
type: application
subject: client-fetch-cache
technique: in-flight-dedup
stack: next
status: forged
verified_on: 2026-11-16
verified_against: next@16
---

# In-flight dedup on a serverless request path: identity at settle, and the invalidation door left open

This tree coalesces expensive repository scans — a provider ingest plus an LLM
completion, minutes long — behind one keyed registry, and it is a useful
application precisely because it lands the technique's settle-time identity
rule *and* leaves its invalidation-reach obligation unmet at the same commit.
Both halves are legible in one file.

Re-pinned 2026-11-16 at the public tree's HEAD `54a9800dd` (2026-11-11; `next` ^16.3.8),
read-only through a shallow clone. Every line below is at that commit. The registry
gained a linger window on 2026-10-05 (`206f58bd`), described in its own section below.

## The registry, and the identity check at settle

`src/lib/cache.ts:252` holds the registry as a `Map<string, InflightScan>`
where the value carries the shared promise, an `AbortController`, a waiter
refcount, and a listener set. The entry is registered *before* the factory
runs (`src/lib/cache.ts:349`), which is the technique's "synchronously,
before any suspension point" rule taken one step further: the comment at
`src/lib/cache.ts:343-344` records the reason — a frame emitted synchronously
inside the factory must have a listener set to fan out to. Registering that
early creates its own hazard, and the tree names it: a factory that throws
*synchronously* would strand a promise-less entry that every later caller
joins and hangs on forever, so the `catch` at `src/lib/cache.ts:371` evicts
before rethrowing.

The settle-time reaper is the identity-checked form:

```ts
const evict = () => {
  if (inflightScans.get(key) === e) inflightScans.delete(key);
};
```

(`src/lib/cache.ts:355-358`, wired to both settle paths at
`src/lib/cache.ts:379`; it now also cancels a pending linger timer.) The comparison is object identity of the entry
record — a positional stand-in for the technique's per-flight identity token,
sufficient here because a new flight always allocates a fresh record. It is
what stops a slow loser's settle from evicting the newer flight that has
since taken the key, and callers already joined to that newer flight from
being joined to an entry the registry no longer admits.

The same guard is repeated on the abort path
(`src/lib/cache.ts:402`, re-checked when the linger timer fires at
`src/lib/cache.ts:292`): the shared controller aborts only when the waiter
refcount is zero **and** the record is still the live occupant of the
key. That second conjunct is the identity rule again, and without it a
straggler releasing after replacement would abort a flight it is not part of.

Refcounted abort is also this tree's answer to the technique's
"joiners abandon locally" rule, in the stronger form available to a server:
the abort is not local-only, it is deferred until the last interested caller
leaves, so a client disconnect cannot kill a scan an open stream still wants
(`src/lib/cache.ts:217-221`). A joiner's dead progress sink is likewise contained
— the fan-out wraps each listener call in its own `try` so one closed stream
cannot break the shared run (`src/lib/cache.ts:363-368`).

## Failure fan-out, and the metering consequence

Rejection reaches every joiner unchanged: all callers return
`e.promise.then(...)` with a shared `detach` on both paths
(`src/lib/cache.ts:413`). The tree found the accounting consequence the
technique predicts in the other direction — not error counts, but *cost*
counts. The scan routes consume a monthly quota slot before coalescing, so a
joiner would be charged for a run it merely joined; `onJoin` fires
synchronously for joiners only (`src/lib/cache.ts:381`) so the route can
refund. This is the same fact as "N joiner failures are one flight failure",
seen from the billing side: one flight, one charge, and the fan-out has to be
visible to whatever is counting.

The behaviour is pinned by tests at `src/lib/cache.test.ts:30` — one factory
call for concurrent same-key callers with a shared result
(`src/lib/cache.test.ts:62`), a fresh run for a call arriving after settle
(`src/lib/cache.test.ts:78`), the refcounted abort where the first waiter's
cancellation leaves the signal unaborted (`src/lib/cache.test.ts:85`), joiner-only
`onJoin` (`src/lib/cache.test.ts:226`) and the synchronous-throw eviction
(`src/lib/cache.test.ts:346`).

## The unmet half: invalidation stops at the stored value

The report cache exposes a single-key invalidation entry point,
`cacheDelete` (`src/lib/cache.ts:206-208`), called after a fresh scan row commits
so a warm instance stops serving the prior report under the same key. Its
body is one line — `store.delete(key)` — and `store` is the TTL/LRU value
map only. Nothing touches `inflightScans`. At this commit the two structures
are keyed alike and invalidated apart, which is exactly the shape the
technique now names: an invalidation issued while a scan is in the air drops
the stored answer and leaves the flight free to write the pre-invalidation
report back on settle, and free to be joined by any caller arriving in the
window between.

The exposure here is bounded rather than absent, and the bound is worth
recording because it explains why this has not surfaced as a bug. The key
folds in the head commit sha and a scoring-identity fingerprint
(`src/lib/cache.ts:177-189`), so the invalidations that matter most — a new push,
a model swap, a rubric bump — change the *key* rather than dropping an entry,
and a key change retires the in-flight work by not matching it. What remains
uncovered is the case `cacheDelete` was written for: a forced re-scan of an
unchanged commit under an unchanged scoring identity, where the key is
stable and the flight is joinable across the invalidation.

## The abort waits for a returning caller (added 2026-11-16)

At `54a9800dd` the refcounted abort no longer fires when the count reaches zero.
The comment at `src/lib/cache.ts:224-237` records why: a reload closes the old
stream connection strictly before the new request opens, so the count always
passes through zero, and an instant abort "threw away a multi-minute scan for a
page refresh". `release` now starts a 30-second window instead
(`INFLIGHT_LINGER_MS`, `src/lib/cache.ts:238`; `scheduleLingerAbort` at
`src/lib/cache.ts:282`). A caller arriving inside it joins and cancels the timer
(`src/lib/cache.ts:335`). A window that closes unwatched aborts **and** evicts in
one call (`abortAndEvict`, `src/lib/cache.ts:268`). An entry whose controller is
already aborted is skipped rather than joined (`src/lib/cache.ts:333`), and the
test at `src/lib/cache.test.ts:31` pins that the replacement run is the one later
callers join. The window is bounded, and its comment names the rollback (set it
to 0). The tests at `src/lib/cache.test.ts:123-224` cover four paths: the run
kept alive and mapped, a join inside the window, the timer not firing after a
join, and abort plus eviction when nobody returns. This tree is the source of
the technique's last-leaver grace clause.

## Its own persistence deletes the entry it just wrote (found 2026-11-16)

The invalidation surface has a second defect, and this one runs on every new
scan. `cacheAndPersistScan` writes the fresh report into the memory tier first
(`src/lib/scan-finalize.ts:147`) and only then persists it
(`src/lib/scan-finalize.ts:162`). When the persist writes a new row, it calls
`cacheDelete` for the pinned and the sha-less key of both modes
(`src/lib/db/scans-persist.ts:742-751`). The pinned key it builds is the key the
lookup built (`src/lib/scan-cache.ts:164`): the same normalized owner and repo,
the same head sha, the default scoring identity. So the delete removes the
report this run just cached. Its comment still describes an ordering in which
the memory tier "still holds the prior report". The cost is a wasted write and,
on the next read, a memory miss that falls through to the durable tier, which
rebuilds the report and writes it back (`src/lib/scan-cache.ts:181-193`). It is
not a wrong answer. A joiner's own finalize persists as a commit dedup, which
returns before the delete, so a coalesced run usually ends with the entry
present and a solo run ends without it. This was read, not run. The fix is an
ordering: delete before the write, or skip the key this run wrote. The ordering
is already present at the earliest commit the shallow history reaches
(`c2696d85`, 2026-08-31).

## What the key already gets right

The delimiting discipline is present in the fingerprint, where the three
scoring fields are joined on a byte no field can contain, with the collision
it prevents written out in the comment (`src/lib/cache.ts:138-143`). The optional
components in `makeCacheKey` are rendered positionally instead
(`src/lib/cache.ts:185-186`): an absent sha or scope collapses to the empty
string, so the key's segment count varies with which options were supplied.
It holds only because the sigils `@` and `!` cannot occur in the provider's
owner, repo or path vocabulary — a constraint the builder relies on without
stating, and the exact situation the key technique's absent-sentinel rule
asks to be made explicit rather than inherited from an upstream naming rule.
