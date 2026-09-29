---
domain: recruiting
subject: interview-calendar-integrity
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L2
---

# interview-calendar-integrity

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (dp-ici-0929)

Dispatched on "never swept by the librarian", registry HEAD 2cfe873e. Read the one
tree the applications cite, kp at ec99bc406 (Node 24, Next 16, React 19). No
external research lanes: the claims are design rules, and the only measurable
drift was in the tree. Depth stays at the rung the forge reached, L2.

**Landed (fcbd045f):**
- kp's `CALENDAR_STATUSES` is now four members. `needs_reconnect` (revoked or
  undecryptable grant) was split out of `unavailable`. Golden path and the
  three-valued technique gain the refinement; the application records the
  first-folded-then-split history. Not a new technique: one consumer, no lane
  convergence.
- All three applications re-verified against the tree (`verified_on`
  2026-09-29, `verified_against` set). Their `file:line` citations had drifted
  by up to ~70 lines (`google-calendar.ts:164` is now near 233), so they are
  anchored to symbols instead.

**Confirmed, untouched:** the write-back axis (five states), the null-means-
proceed confirm-time re-check, narrow `calendar.freebusy` scope, no provider
`sendUpdates`, the union of hour rows, the lifecycle bucketing.

**Not evaluated:** the reminder look-ahead/short-notice-floor claims and the
six-technique body against external literature; no counter-evidence lane ran.

## Impact

`build-registry-map` printed no stale verdict for this subject; no project holds
a judged verdict against it. kp's map committed locally (8f7196a99), not pushed
(kp main carries unpushed sibling work). The other eleven fleet maps were
regenerated but left uncommitted.

## Applied

No new technique and no flipped rule, so no `applied.md` row is owed. The
`needs_reconnect` split is itself kp's field application.

## Open

- Return when: a second consumer of calendar write-back appears, or by
  2026-12-29 (application clock).
