---
domain: media-generation
subject: generated-music-acceptance
last_touched: 2026-11-16
touched_by: deepen
dry_streak: 2
---

# generated-music-acceptance

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-26 - `/intake`, forged as part of the new audio-generation category

Born with 5 techniques (`brief-conformance-listen`,
`loudness-and-peak-acceptance`, `generated-audio-defect-taxonomy`,
`structure-verification-against-plan`, `rights-and-provenance-record`) and 1
application (the dated 2026-08 rights landscape, `refresh_by` 2026-11-26 -
plan-tier commercial grants, the non-retroactivity trap, registration
doctrine). Source: [[2026-08-26-composer-song-editor]].

Boundary: modality-general grading craft (trial matrices, grader
disagreement, regrade-without-regenerate) stays with
`generated-output-grading` in the visual category and transfers whole; this
subject adds only what is audio-specific - the measured gates (LUFS, dBTP,
structure offsets), the defect names, the rights record. The GP says so
explicitly to keep a later run from duplicating the grading subject here.

First live corroboration same-day: a vendor delivered 192 kbps where 128 was
requested (duration on spec to 32ms) - the measure-don't-trust doctrine
demonstrated by the vendor unprompted, recorded in the consumer-tree
application under the composition subject.

## Open leads

- No scripted acceptance pass exists yet anywhere in the fleet (duration /
  boundary / loudness in one run). The consumer tree is the natural home;
  when it lands, this subject gets its node application.
- The rights application's refresh clock (2026-11-26) is the category's
  first currency obligation - vendor terms move faster than craft.

## 2026-11-16 - /deepen loop of 3 (run `filler-deepen-20261116d`, /shift filler)

First deepen. Round 1 landed; rounds 2 and 3 were dry (dry_streak 2,
saturated until the rights clock or an event).

Flips:
- **When a grant attaches is set by each vendor, and vendors disagree**
  (golden path + rights-and-provenance-record). "Routinely non-retroactive"
  was refuted from the vendors' own pages, read 2026-11-16:
  - one music vendor's terms (2026-10-09, §1.5) lift existing output on an
    upgrade and pin it to the creation-time plan on a downgrade;
  - another's terms (effective 2026-09-03) anchor commercial use to a
    counted download that is perpetual once made, and that vendor's help
    center keeps free-plan songs non-commercial after a later upgrade.
  The record now holds the anchor event and every plan change.
- **A plan is a prompt, not authorship** (rights-and-provenance-record):
  - Copyright Office Part 2 (2025-01-29): prompts alone are not enough;
  - Thaler certiorari denied 2026-03-02.
  The claim rides on human material perceptible in the output, and on
  human edits.
- **Section re-render needs a generator that holds the untouched bars**
  (golden path + defect taxonomy). Read lane: gravitone's YuE2 guide at
  `fc26e172` measured a one-chord edit moving the whole song as far as a
  new seed, and the operator's listen agreed. Where the generator moves
  every bar, the remedy is a splice. Broken endings gained a measured
  cause: a length ceiling stopped one take at -10 dB.
- **The ceiling belongs to the encoded file** (loudness-and-peak-acceptance):
  - gravitone measured a -1 dBTP limiter landing at -0.8 after AAC;
  - Spotify's page ties -2 dBTP to masters louder than -14.
  Gates judge LUFS and true peak together.

Applications:
- `process--rights-and-provenance-record` re-sourced and re-dated
  2026-11-16, `refresh_by` 2027-02-16. Udio was not re-checked (the terms
  page was unreadable), and the page says so.
- New: `node--loudness-and-peak-acceptance` (gravitone `fc26e172`). The
  scripted acceptance pass this note's open lead said was missing has
  existed since 2026-10-24 (`da2b8b63`).
- New: `node--rights-and-provenance-record` (gravitone `fc26e172`).

Project defects (gravitone, read not run):
- the ads finish gate judges loudness only, never true peak
  (`lib/cut/ads/finish.ts:165-176`);
- a music-only cut is never measured (`lib/cutExport.ts:378`);
- the cover record's vendor remix keeps no account, tier or download date
  (`packages/domain/src/cover.ts:94`).

Applied: 4 simulation rows, all `better`, against gravitone.

Banked:
- A codec-ceiling defect class: band-limited lossy deliveries. Training
  data only, no second lane. Return: when a delivered take's spectrum is
  measured.
- Whether registration applications must disclaim AI material. Training
  data only. Return: when the Office's registration guidance page is
  opened.
- The ATSC -24 figure and YouTube's target: secondary sources only.
  Return: when the primary pages are opened.

Impact: not computed. The map regeneration is owed (Director's step 4).

## Open leads (2026-11-16)

- The rights application's clock is now 2027-02-16. Udio's terms remain
  unread.
- The first lead above is closed: gravitone's `audio.accept` judge is the
  node application.
