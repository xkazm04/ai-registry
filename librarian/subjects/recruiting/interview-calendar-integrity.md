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

### 2026-09-29 - `/deepen`, second pass (dp-ica-0929)

A twin dispatch from the same HEAD ran concurrently and landed the tree side first
(above). This pass found that commit mid-run, kept it, and covered what it recorded as
not evaluated: kp's collision and agenda commits, and three Google documents (free/busy
errors, `sendUpdates`, refresh-token expiry). No blind lane ran, so nothing earned
technique placement by convergence.

**Conditioned or corrected**
- **"Use the coarse hour key against your own bookings"** (real-duration technique,
  golden path). Now interval OR bucket, refused inside the write transaction. The
  bucket alone passes a 15:00 slot beside a 90-minute 14:00, and store equality guarded
  only the fixed grid (kp `671d424e1`).
- **"Most providers email every attendee by default"** (orphan technique, golden path).
  Google's reference gives the omitted `sendUpdates` default as `false`, so kp's silence
  is quiet today. Rewritten to name the parameter and pin it in a test; "most" was
  unsourced and is dropped. That corrects the twin's "no provider `sendUpdates`,
  confirmed": it holds by default, not by statement.

**Added**
- Per-calendar errors arrive inside a successful free/busy answer, so they are unknown,
  never an empty list.
- The dead-grant rules behind `needs_reconnect`: stop asking a revoked grant, do not
  latch a decrypt failure, do not record on a timeout or 5xx, and the causes beyond
  revocation (six months unused, testing status, admin restriction, token cap).
- One agenda owner with write-through (lifecycle technique, golden path; kp
  `074dd8b92`), and a count of unsynced upcoming interviews at the reconnect prompt.
- One application, `node--real-duration-conflict-window`, verified 2026-09-29 against
  node@24.

**Applied:** one row in `applied.md`, experiment, kp, better. kp's real predicate over four
cases from its own fix commit: bucket-only refuses 2 of 3 true collisions, the union all
3, and both allow the back-to-back pair. kp already ships the union, so the technique was
the side out of step. Scratch file removed from the kp tree.

**Banked:** whether free/busy counts all-day and transparent events (Google's reference is
silent; the technique's "prefer bounded entries" advice stands unverified); Microsoft
Graph's notify and free/busy behaviour (Google is the only provider the subject was
checked against). Return: a live free/busy call on a test calendar, or a project that
integrates a second calendar.

## Impact

`build-registry-map` printed no stale verdict for this subject; no project holds
a judged verdict against it. kp's map committed locally (8f7196a99), not pushed
(kp main carries unpushed sibling work). The other eleven fleet maps were
regenerated but left uncommitted.

## Applied

The first pass owed no row. The second pass flipped the own-bookings collision rule and
recorded one (above). The `needs_reconnect` split is itself kp's field application.

## Open

- Return when: a second consumer of calendar write-back appears, or by
  2026-12-29 (application clock).
