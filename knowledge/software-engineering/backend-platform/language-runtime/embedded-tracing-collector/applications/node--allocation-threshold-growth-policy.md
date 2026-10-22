---
layer: application
type: application
subject: embedded-tracing-collector
technique: allocation-threshold-growth-policy
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# A constant reclaim threshold on a bounded TTL memo, in a hiring app

**Witness:** the tree's `package.json` declares `"engines": { "node": ">=24.0.0 <25.0.0" }`,
and the module is plain TypeScript run by Node's own test runner with type stripping. No
framework touches it. kp (`github:xkazm04/kp`, commit `48252ee89`) is a hiring app, and
`app/_lib/ttl-cache.ts` is its generic short-TTL memo. Analytics routes, calibration
routes, the decision-records route, profile reads and pipeline scores all build on it.

This is not a language runtime, and no managed project embeds one. Three earlier attempts
(2026-09-03, 2026-10-14 and 2026-10-22) searched the fleet for a traced heap and found
none. What the memo has is the technique's **trigger policy**, which is not specific to
collectors. An insert adds to a count. When the count reaches a threshold, the insert runs
a reclaim pass before it returns, and the threshold is a constant. The technique's
"failure of a constant threshold" section predicts what that does under a live set
sitting on the threshold. The memo was the closest real shape to test that prediction on.

## What the tree did

The memo holds at most `DEFAULT_MAX_ENTRIES = 256` entries, and every entry gets the same
`ttlMs` (20 s by default). On a miss, once `store.size >= maxEntries`, it walked the whole
Map deleting expired entries, then evicted oldest-first until it was under the bound. The
comment beside the constant explains why the bound exists: three call sites key the memo
on raw query parameters, which are not a closed vocabulary, and a long-lived `next start`
process otherwise kept one payload per distinct value forever.

The bound is right. The reclaim was the technique's failure exactly. When 256 distinct
keys are requested inside one TTL window, every key is live, so every following miss
walks all 256 entries, reclaims none, and evicts one. The walk's cost is linear in the
live set and its yield is zero.

## Why the growth rule does not apply here, and what does

The technique's remedy is to raise the threshold after a collection so that survivors
occupy a fixed fraction of it. **That remedy is unavailable when the threshold is the
memory contract itself.** This bound exists to stop growth, and raising it to 256/0.7
under load would undo the fix it was added for. So this tree is a boundary case for the
technique, and the amendment it produced is written into the technique under "When the
threshold is a hard cap".

The remedy here makes the reclaim cost proportional to what it reclaims. One `ttlMs` for
every entry means insertion order is expiry order: a stale hit is deleted before its key
is re-inserted, so the Map's head is always the entry that expires first. The expired
entries are therefore a prefix. The new reclaim pops that prefix, stops at the first live
head, and keeps evicting the head while the store is still at the bound. It deletes the
same entries the full walk deleted, and it touches only those plus one.

## The pair

Arm A is the module at the published default branch. Arm B is the same module with the
prefix reclaim. Both arms ran the same four replayed workloads through the real
`createTtlCache` with `ttlMs: 20000` and `maxEntries: 256`, under an injected clock. The
**target** was Map entries visited per `get()`, counted by wrapping `Map` iteration. The
**floor** was the sequence of returned values and the number of computes, which had to be
identical between arms.

| Workload | Gets | A: visits per get | B: visits per get | Floor |
| --- | --- | --- | --- | --- |
| live set held at the bound (one new key per ms) | 20,000 | 254.70 | 1.97 | identical |
| hot set of 50 mixed with unique keys | 20,000 | 177.99 | 1.38 | identical |
| expiry waves (a full cap, a jump past the TTL, refill) | 8,000 | 93.49 | 1.33 | identical |
| under the bound (about 100 live) | 5,000 | 1.59 | 0.98 | identical |

The harness asserted its own instrument first: arm A on the first workload had to show the
full walk (more than 200 visits per get) before any row counted. A new test in the
project's suite pins the property: one miss at a full, all-live bound may visit at most
four entries, and the evicted key must be the oldest. That test is red on arm A (258
visited) and green on arm B. Floor in the project: the three cache suites ran 29 of 29,
and a full type check was clean.

## What the tree's shape says

ascent, another fleet project, has the same failure on record in
`src/lib/rate-limit-window.ts` (`github:xkazm04/ascent`, commit `5ef778d6`, lines 8-14). Its comment describes an old reclaim of the form "if the
map holds more than 10,000 keys, walk it", fired on the admit path, and says that once
the map crossed the mark "EVERY admitted request pays a full O(n) scan". That tree
replaced the walk with a cadence, a per-sweep budget and a resumable cursor. Two trees
paid for the same mistake independently, and neither could use the growth rule, because
in both the threshold was a memory bound. Their remedies differ because their orderings
differ. The memo's entries share one TTL, so its expired entries form a prefix. The
limiter's keys age at their own rates, so it has no prefix to pop and needs a bounded,
resumable sweep instead.

## What this cannot do

The prefix argument depends on a clock that does not step backwards. If the clock steps
backwards, a later-inserted entry can expire before the head, and the reclaim then evicts
a live head instead of that expired entry. The bound still holds, and `get` still refuses
anything expired, so only the choice of victim changes. The application also says nothing
about the technique's other rules: there is no traced byte count, no host signal and no
bookkeeping to shrink.
