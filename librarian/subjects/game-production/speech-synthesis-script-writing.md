---
subject: speech-synthesis-script-writing
domain: game-production
last_touched: 2026-10-10
touched_by: deepen
dry_streak: 0
---

# speech-synthesis-script-writing

A narrative-and-dialogue subject forged on 2026-10-04 with six techniques and two `process`
applications, both reading Death Ride's dialogue dossier and voice wave. It had no subject note.

## Touch log

### 2026-10-10 - `/deepen`, single subject (run dp-ssw-1010)

Dispatched by Curator's projection of the attention scan on **single stack (process)**. Three
lanes ran:
- a field lane on the firetv `deathride/main` tree at `d9990777`. It read the audio meter, the
  mastering and owner-audio validators, the cue manifest, the owner's decisions of 2026-10-03,
  the 518-line `lines.csv` and its Kotlin loader and director. It ran two scratch scripts
  outside the tree: a leave-one-out fit of text shape against the 14 rendered clips, and a
  census of the Mechanic's 91 lines in play.
- a counter-evidence web lane. It read the vendor's raw doc pages, the audio-tags blog and
  pause-modelling papers. I re-fetched every quote that landed myself: the best-practices,
  models, changelog, v4 and playground pages, the v3-audiotags blog, and the SwanVoice HTML.
- a training-data-only blind lane.

The rank was real: the subject's techniques have a code seam, the audio pipeline (Python) and
the script table (Kotlin).

**Widened: two code-stack applications.** All 23 anchors hold under `check-anchors`.
- **`kotlin--length-and-breath-budget`** (experiment, better, kotlin@2.0.21). The script's
  `duration_s` is a cast-wide 0.377 s/word + 0.316 s/sentence rule, read by `Script.kt:82` and
  held as caption time by `ScriptDirector.kt:49`. Against the 14 rendered clips it overestimates
  every line, and it is closest on the line that failed. A per-voice price, scored leave-one-out
  (boundary: Announcer 0.17 s, Mechanic 0.70 s), cuts the median error from 1.31 to 0.48 s.
- **`python--hesitation-marks-can-silence-a-line`** (experiment, unmeasurable). The meter
  states its basis, and edge trim is kept apart from interior pauses. The owner kept the failed
  clip on 2026-10-03, and the validator guards keep plus failure with a mutation case. The
  rewritten script dropped marks (none of the Mechanic's lines has more than one) but kept
  fragments: 7 of 91 are predicted over the 45% ceiling, 5 of them with no mark. On the 14
  rendered clips, boundaries and marks tie, with one failure. The bundle now declares the
  `python` stack.

**Corrected.** Both `process` applications said no listener had judged the clips, citing an
`acceptance.json` status written before the owner's pass. The owner kept all 14 on 2026-10-03,
the day before they were written. The manifest's `identityAndDelivery` still says `owner
listening pending` on all 14 voice cues, and that stale field is the trap. All 47 anchors were
re-checked at `d9990777` and `verified_on` moved to 2026-10-10.

**Conditioned (no new technique).**
- *length-and-breath-budget*: a cast-wide estimate hides the failure (measured). The boundary
  price is an average, not a pause at every mark: SwanVoice, arXiv 2605.30993 (verbatim), and
  the clips themselves, where some full stops left no gap and commas paid on the slow voice.
- *hesitation-marks-can-silence-a-line*: a marks-only rule gets marks removed and fragments
  kept (census). A listener's keep is recorded beside the failure and guarded. Pre-render
  gates count boundaries beside marks, and neither count passes a line alone. The vendor's
  "different voices may handle pauses differently" was re-read verbatim.
- *text-carries-the-emotion-not-the-settings*: style at 0 is "the most common setting", with
  a warning that raising it makes the model "slightly less stable". It is not a flat
  recommendation. The stability presets are absent from primary pages. The v4 generation
  (2026-09-28) keeps only stability and similarity.
- *tags-depend-on-the-model-generation*: a tag can be misread in kind, delivery against sound
  effect (primary). Pause markup is unsupported on both newer generations (verbatim), so a
  script on the older one is two generations behind the vendor's default.
- *golden path*: the "what this subject knows" paragraph gains the measurement, the keep, and
  what stays unmeasured.

**Verified and left untouched.** Too many break tags cause instability (verbatim). The speed
range of 0.7 to 1.2, with extreme values degrading quality (verbatim). A v3 tag read aloud when
the voice does not suit it (verbatim). The training lane converged on per-voice pause pricing,
on a cast-wide rate being inadequate, and on recording an override beside the screen's verdict.

**Not found / declined.** No study measures total silence against sentence count; the lane
found only pause-prediction work. The 250-character minimum for v3 is absent from primary pages
and appears only in third-party guides. The subject never repeated it, so nothing changed. The
PauseSpeech quote the lane reported could not be confirmed in the abstract and was not used.

## Impact

The subject joins **0 contexts** across the mapped fleet. The check was `build-registry-map
--dry-run --json` (no pair anywhere), plus `--project firetv --out` to a scratch file: `voice-io`
10 hits as the known positive, `game-production` 0, this subject 0. No verdict went stale, and no
`/conform --stale` queue exists. No project map was written, because this landing changes none.
Return: when firetv declares game-production, or Death Ride gets its own manifest.

## Applied

Three rows in `librarian/applied.md`: 1 better (experiment), 1 unmeasurable (experiment) and 1
unapplied (settings and generation changes need a paid re-render). There were no project
commits. Recorded for Death Ride's owner, not patched:
- the 14 stale `identityAndDelivery` fields;
- the 7 flagged Mechanic lines, which should be rendered and heard first;
- caption time for voiced rows taken from the measured clip, not `duration_s`.

A script change in a game in active development is the owner's call, and the renders cost
credits from a shared pool.

## Saturation

Depth rung L3: empirical, a leave-one-out fit over 14 measured clips and a census of 91 lines.
Yield this pass: two applications, two corrections, and conditions in four techniques plus the
golden path. Dry streak 0. Clocks: vendor claims re-read 2026-10-10; a vendor landscape moves
in about 3 months, so re-read by 2027-01-10 or at the next generation release. The census
figures move whenever `lines.csv` or the Mechanic's settings change.

## Banked leads

- **Render the seven.** This is the instrument that settles boundaries against marks: the 7
  flagged Mechanic lines beside the other 84, under the same -50 dBFS / 0.1 s screen. Return:
  when Death Ride next synthesises Mechanic lines (ask before spend).
- **Settings against the price.** Re-baselining the Mechanic to style 0 at the Announcer's
  stability would separate voice from settings in the boundary price, which neither application
  can do. Return: when the owner re-baselines a voice.
- **A pre-render script lint.** A boundary-plus-marks count over `lines.csv` per voiced
  speaker, priced per voice, is a short script beside the reachability lint banked under
  short-form-cards-and-barks. Return: when a project asks for a script lint.
- **Newer generation.** v4 accepts no pause markup and no style or speed. A script moved there
  re-auditions every line. Return: when a project moves a voiced script off
  `eleven_multilingual_v2`.
