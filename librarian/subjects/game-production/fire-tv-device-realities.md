---
domain: game-production
subject: fire-tv-device-realities
last_touched: 2026-10-07
touched_by: forge
dry_streak: 0
depth: L1
---

# fire-tv-device-realities

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-10-07 - `/forge`, extension (run `forge-dro-1007`, branch `autopilot/technical-decision-capture-6e0ab333`)

Two realities added, each a symptom that points away from its cause: `startup-work-belongs-at-first-use` (an eager
content bake that a desktop finishes in a quarter second stalled the stick's startup; lazy slots; aggregate
accessors that undo the laziness) and `read-the-priority-before-requesting-one` (the platform already boosts the
foreground main and render threads to −10, so a requested display priority of −4 is a demotion). One kotlin and one
process application against `firetv-deathride` at `86cb512d`, from the 2026-10-06 optimize wave (S1, S14, L10, the
lazy-bin fix `54a66fcf`) and the P8 wave (2026-10-03). The golden path's realities heading went from six to eight and
gained two paragraphs; `abi-inspect-the-apk` gained one decision rule pointing at the shipping-gates trimming
technique.

**Outside hardening.** AOSP `Process.java` (`THREAD_PRIORITY_TOP_APP_BOOST` −10, `THREAD_PRIORITY_DISPLAY` −4) and
ART's `palette_android.cc` priority table (re-fetched 2026-10-07: Java priority 3 is `ANDROID_PRIORITY_BACKGROUND + 3`);
Android's startup guidance (lazy initialisation, cold start ≥ 5 s excessive); Amazon's Fire TV KPI page (cold-start
first frame < 2.0 s, foreground PSS < 300 MB at 1080p).

**Deviations recorded.** The device stall was reported, not timed; no startup phase was timed on the stick after it;
the link pool's `NORM_PRIORITY-2` lands at nice 13, in the background band, and its input-latency effect on the stick
is unmeasured. **Open:** a cold-start trace on the stick against the 2.0 s target, and a stick run with the link pool's
actual nice values in its receipt.

### 2026-10-07 - `/forge`, extension (run `forge-p9p10-1007`, branch `autopilot/technical-decision-capture-4b08c178`)

One reality added from the Death Ride P10 session: `price-the-durable-save-on-the-device` — a synchronous durable
profile save (encode, verify, temp file, `fsync`, verify-then-backup, atomic move) costs 49.5–156.1 ms per save on
the stick's flash, on the render thread, at every car pick and twice per race start and finish (four profiled 360 s
runs, 2026-10-07). Forged as a **measured constraint with alternatives, no fix claimed**: the save gates the race
ticket and the settled cash, and moving it is an open owner decision on the money path (finding S18, backlog). Five
alternatives, each with what it risks; the draft's fifth (a worker write while the transition waits) came from
reconciling with the source's save-gates-the-change contract. One kotlin application against `firetv-deathride` at
`4bbae5d2`, anchors held. Golden path: realities heading eight → nine, one paragraph. `startup-work-belongs-at-first-use`
gained one sentence in step 5 (every lazy structure inside a level counts) and an evidence update (the first-use bake
and the aggregate routes request were later timed on the stick, profiled); its kotlin application was re-pinned from
`86cb512d` to `4bbae5d2` (seven anchors moved or rewritten; S17 now diagnosed and removed; the routes endpoint's first
GET timed at 11.7–20.1 s, n = 4).

**Upward lessons from the source.** Verify the old save before it becomes the backup and set a corrupt one aside;
name whether the save gates its change before weighing any alternative; a save inside the simulation step is charged
to the simulation phase.

**Outside hardening (research worker, quotes re-fetched).** One `fsync()` on UFS phone storage is ~1.2 ms median,
33 ms at p99.99 (Won et al., arXiv 1711.02258, Table 1) — so the draft's "a flush costs tens to hundreds" became "the
multi-step save on the cheapest flash"; Android `StrictMode` Javadoc (disk access usually fast, occasionally
dramatically slower); `AtomicFile` keeps no backup (the backup is a choice to price); `SharedPreferences.apply()`
silent failures and the pending-`fsync` wait at pause (Android Developers blog 2020-09); SQLite's process-crash vs
power-loss distinction (pragma docs). Headsets: Meta's Unity lifecycle (unmount → pause after Auto Sleep), low-memory
kills of paused apps, stale frames on a missed refresh. **Headset reach:** holds with qualification — the mechanism and
the write-behind risk transfer; no headset storage timing was found or taken.

**Open, with return conditions.**
- **Per-step save timing on the stick.** The source times the whole save only. **Return:** a diagnostic run with one
  timer per storage step.
- **The owner decision on S18.** **Return:** the owner picks an alternative; then a stick A/B and a kill/power-cut
  recovery test.
- **Cold-start trace** (carried from the previous entry).
