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
