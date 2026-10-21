---
subject: talking-avatar
domain: software-engineering
last_touched: 2026-10-22
touched_by: deepen
dry_streak: 0
---

# talking-avatar (software-engineering / llm-agent / companion)

Forged three times between 2026-10-17 and 2026-10-18 from athena-portable's shipped
face: nine techniques, five applications (process, python, react), citations verified
2026-10-18 with a licence table checked against primary sources that day.

## Pass 2026-10-22 (curator, /deepen subject form, run ta-deepen-1022)

Dispatched on "never swept by the librarian" at HEAD 036da931. The finding was real: no
note existed. `check-currency --volatile --subject talking-avatar` listed 6 documents, all
local measurements (fps, coverage %, MB), none platform-set and none older than 4 days.
Research went to the general figures in the upper layers instead.

Lanes: web counter-evidence and blind training-data. Results:

- **Corrected (convergent):** "lip closures last 25-50 ms" became a visibility floor. A
  bilabial closure in running speech averages ~70 ms (Yao 2007, Buckeye, sd 36; Byrd 1993,
  TIMIT, 69 ms), and the blind lane put it at 60-100 ms. /f v/ in connected speech: not
  found by the web lane.
- **Corrected:** blink phases close 75-100 ms and open 170-220 ms (Nakamura 2008, 1 kHz
  camera: ~100 / 220 / 320 ms). The rate is ~17/min at rest and ~26/min in conversation
  (Bentivoglio 1997). The 35 ms hold was dropped: no source was opened for it.
- **Corrected label:** learned head pose "bobs at syllable rate" was wrong. The 1-1.5 Hz band
  tracks phrase-level head motion and syllables run near 4 Hz (PMC9295967). Natural head
  motion runs 0.2-7 Hz (Hadar, via Frontiers 2023), so the 2 Hz cut is now stated as a
  design choice whose lost nods come from text gestures. The application still quotes
  athena-portable's own comment, "~1-1.5 Hz bobble at syllable rate", verbatim. That is the
  source's wording, kept as cited.
- **Confirmed untouched:** ITU-R BT.1359 +45/-125 ms detectability (+90/-185 ms
  acceptability; minus signs lost in extraction); greater tolerance for late audio (van
  Wassenhove 2007, fusion -30 to +170 ms); breath ~0.25 Hz (12-20/min); the 15-shape viseme
  set.

Consumer check (athena-portable 9beaef31) found no deviations:
- `MIN_SEG_S` 40 ms plus a 120 ms pre-closure absorb.
- `BLINK_GAP_S` 2.2 s, a ceiling of ~27/min.
- A 2 Hz filtfilt, with text nods in `driver.ts`.

Banked lead: `driver.ts` drifts with summed sines at incommensurate rates, which the
technique advises against ("sines repeat visibly within a minute"). Incommensurate rates
do not repeat exactly, so the rule may need that condition. Return: a viewer test or a
period measurement of that drift.

Impact (build-registry-map after c27f73d0): talking-avatar stale in personas (4), kp (5),
overlord (4), athena-everywhere (2), personas-web (1), ascent (1). Those form the `/conform
--stale` queue. Applied rows: 2, both unmeasurable (the seam already conforms). Depth L2,
plus L3 from the forge's own measurements. Dry-streak 0. Clocks: derived per stack, none
set.
