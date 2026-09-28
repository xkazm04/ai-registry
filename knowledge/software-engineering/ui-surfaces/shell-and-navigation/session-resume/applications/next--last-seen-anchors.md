---
layer: application
type: application
subject: session-resume
technique: last-seen-anchors
stack: next
status: forged
verified_on: 2026-09-26
verified_against: next@16
applied: code
ab_verdict: better
---

# Last-seen anchors in two App Router trees: a local visit anchor with a seen watermark, and two per-member anchors on the server

Three anchors in two Next 16 / React 19 trees, all read and two of them changed in
this pass. Between them they cover both species the technique names, both storage
homes (the browser and the account), and the two ways the tree got the *advance*
wrong. The read-then-advance ordering was right in all three.

## politicas `/schranka` - a local presence anchor and a consumption watermark, side by side

politicas is an anonymous civic site. There are no accounts, so the anchor lives in
`localStorage` under one versioned key, beside the list of followed entities
(`features/schranka/followCodec.ts`, `SchrankaState.lastVisit` and `.seen`).

- **Read before advance, guarded against a double-invoked updater.** `openVisit`
  (`visitWindow.ts:58`) reads the previous stamp exactly once through a one-shot
  guard held in a ref (`SchrankaPage.tsx:213`). The comment explains why: StrictMode
  calls a state updater twice. A stamp taken inside the updater makes the second call
  read the value the first one just wrote, and the "since your last visit" window
  closes silently. This is the self-erasing bug from the technique, reached through
  the framework's own double render rather than through code order.
  `visitWindow.test.ts` reproduces the naive form and shows the window collapse.
- **The consumption watermark advances from observed data.** The badge in the site
  chrome cannot use the page's day-granular rule, because it would stay lit until
  midnight. So the page records a `SeenWatermark {day, count}`: how many of that
  day's entries it actually delivered (`countSeen`, `visitWindow.ts:94`, written at
  `SchrankaPage.tsx:249` only over loaded data). The badge subtracts it only while
  the day matches (`badgeCount`, `:105`). This is the "max of consumed, never the
  clock" rule applied to counts. The page tells the reader that the badge and the
  page count differently.
- **The deviation, fixed (politicas `6f6f97a`).** The anchor itself was stamped on
  mount, in the same animation frame that opened the window and before the fetch.
  A failed load, or a tab closed before the response arrived, still moved
  `lastVisit` to that moment. The next visit's threshold became that day, and every
  entry between the last good visit and that day was never shown. The watermark
  three lines below already waited for data; the anchor did not. Now the stamp is
  split in two. `peekVisit` (`useSchranka.ts:127`) only reads. `commitVisit`
  (`visitWindow.ts:79`, called at `SchrankaPage.tsx:255`) writes once, and only after
  the response has landed or when there was nothing to fetch. The store write never
  moves the stamp backwards (`useSchranka.ts:134`), so a second tab that got further
  wins. A/B, in the repo's own test: last visit 1 Aug, entries on 2 and 3 Aug, a
  failed load on 4 Aug, next visit 6 Aug. The stamp-on-open form shows **0 of the 2**
  entries on 6 Aug; the commit-over-data form shows **2 of 2**.

## ascent - two per-member anchors on the Membership row

ascent is a multi-user organisation dashboard with a database, and both of its
anchors are per user, per organisation, on the server. That is the storage choice the
technique's "local" rule did not cover: a member who reads on a laptop and a phone has
one read state, and a new browser is not a false first run.

- **The Alerts chip** (`src/components/org/shared/AlertsMovement.tsx`) keeps
  `Membership.alertsSeenAt` (`src/lib/db/members.ts:303,327`). The chip fetches
  "what moved since you last looked" on mount, capped at 9 with a `take: cap + 1`
  probe, so it reads "9+" rather than a false total (`src/lib/db/org-movement.ts:20,77,119`).
  Opening the popover is the acknowledgment.
- **The live ledger** (`src/features/inflight/live/ledger/`) keeps
  `Membership.liveSeenAt`. Its snapshot is taken by the server: `loadLedger` reads the
  anchor with the rest of the page in one server load (`ledgerLoad.ts:105`), and the
  briefing is a pure derivation over that load (`Ledger.tsx:33`). The client-side
  lazy-initializer trick has no job here; the RSC render *is* the snapshot. The
  presence stamp is a client hook (`useSeenStamp.ts`). It fires once per mount, only
  after `SEEN_DWELL_MS = 5_000` continuous visible milliseconds, re-checks
  `document.visibilityState` when the timer fires (`:18,25,27`), and does not stamp
  at all when the briefing could not be derived (`enabled: false`). That is the
  technique's presence gate, implemented as a dwell.
- **The deviation both shared, fixed (ascent `9789b04b`).** Both routes stamped
  `new Date()` at acknowledgment. What they acknowledged had been evaluated earlier:
  the chip's list at mount, the ledger at its server load. A ledger loaded in a
  background tab and brought forward three hours later stamped "seen until now", and
  whatever finished in those three hours was never on screen and dropped out of the
  next briefing. The client now sends `through`: the chip its newest listed movement
  (`AlertsMovement.tsx:89`), the ledger its load time (`Ledger.tsx:47`). The server
  stamps `seenThrough(through, now)` (`src/lib/org/seen-through.ts`; routes at
  `alerts/route.ts:220`, `loop/seen/route.ts:43`), clamped to now and falling back
  to now for an older client. The loader reads its clock *before* its reads
  (`ledgerLoad.ts:101`). A read after them would claim rows that landed mid-load,
  which is the technique's clock-read-after-processing skip in miniature. Because
  the stamp is no longer the clock, both stores became forward-only: the guard sits
  in the `updateMany` WHERE, so it is still one write with no read-modify-write race
  (`members.ts:337`). A/B in `seen-through.test.ts`: load 09:00, a run finishing
  10:30, the look at 12:00. The clock stamp leaves that run in the next briefing
  **0** times; the through stamp leaves it there **1** time.
- **Not fixed: the cap still erases.** The chip lists the newest 9. Stamping through
  the newest also acknowledges the older capped rows the reader never saw. The chip
  discloses them as "+ more since <date>" (`AlertsMovement.tsx:145`) and the
  destination lists them in full, so this is disclosed rather than hidden.

## What the framework changes about the protocol

- **The snapshot site moves to the server load** when the page is server-rendered:
  one read per request, and nothing on the client can advance the value under it.
  Where the anchor is client-only (politicas), it is read in an effect after
  hydration, because the server has no `localStorage`. The first client render is
  the empty server snapshot, and the window opens a frame later.
- **Once per mount is not once per return.** Next 16 with `cacheComponents` keeps up
  to three recent routes alive under React's `<Activity>`. Effects are cleaned up
  when a route is hidden and run again when it is shown. A route beyond the third is
  evicted and mounts fresh, re-running any initializer after the anchor has already
  moved. A back/forward-cache restore (`pageshow` with `persisted: true`) is a
  return with no render at all. Neither tree listens for `pageshow`. Both treat a
  return as a new load, which holds only while the page is not bfcache-eligible or
  Activity-kept. Recorded, not changed.
- **No departure write, by design.** Neither tree writes on leaving: politicas
  commits on data, ascent on dwell and on open. That avoids the web's unreliable
  exit events. On the web, the transition to hidden is the last reliably observable
  event. `beforeunload` does not fire on a mobile close, and Chrome stopped firing
  `unload` for all page loads on 2026-09-22 (M154). A heartbeat-style anchor on
  this stack writes on `visibilitychange` to hidden (plus `pagehide`), never on
  unload. None of the fleet's Next trees writes a presence anchor on departure
  today; every `beforeunload` in them is an unsaved-changes guard.

Sources, resolved 2026-09-26: politicas `master` at `6f6f97a`; ascent `master` at
`9789b04b`; Chrome's unload deprecation timeline
(developer.chrome.com/docs/web-platform/deprecating-unload, updated 2026-06-29); the
Page Lifecycle guide (developer.chrome.com/docs/web-platform/page-lifecycle-api);
Next's preserving-UI-state guide (nextjs.org/docs/app/guides/preserving-ui-state,
16.3.6).
