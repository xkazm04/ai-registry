---
subject: seated-in-world-reading
domain: game-production
last_touched: 2026-10-26
touched_by: intake
dry_streak: 0
---

# seated-in-world-reading

First touch: 2026-10-26. The subject was born from an `/intake` of the bp VR fidelity sprint
([[../../sources/2026-10-26-bp-vr-fidelity-sprint]]); its spec is `librarian/specs/2026-10-26-seated-in-world-reading.md`.
It sits in `couch-and-tv-play/immersive-interaction`, which now holds 5 subjects.

## State

Draft: a golden path, 3 techniques, and 3 cpp applications against bp (22 anchors held). One primary was fetched, a
headset vendor's typography guidance (minimum legible 0.35-0.5 deg, comfortable 0.6-0.8 deg). Applied verdicts:
- floor: better;
- placement: not-better (the committed deck was placed by nominal distance);
- fade: unmeasurable (no headset comfort session).

## Open

- **Evidence base.** One project, one tethered headset, all flat captures. A second seated VR project is the
  corroboration owed.
- **Comfort.** Needs a measured session: a sickness questionnaire across room switches.
- **Text size.** The comfortable-band rule is unapplied: bp's deck body sits at about 33-35 arcmin.
- **Other bundle.** The software bundle's design-tokens density technique holds the flat-screen form of the
  minimum-size rule. The discriminator (an angle against points) is stated here in prose, with no link.

## Architecture review - 2026-10-31

First review, against `f4eafdd91`. The draft's one fetched primary turns out to be distance-banded,
and the bands at arm's length are stricter than the ones quoted; the golden path and the floor
technique are clarified to say so. The panel application's "uncommitted" next round has landed
upstream. The 2026-10-26 open items stand: a second seated project, a measured comfort session,
the comfortable-band constant in bp, and the link to the software bundle's density technique are
all still owed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/seated-in-world-reading",
  "date": "2026-10-31",
  "baseline": "f4eafdd91",
  "digest": "sha256-b2:c7f18a3222f4f56c",
  "disposition": "clarify",
  "coverage": "All 7 documents read in full; one primary opened per load-bearing number; all 22 application anchors re-fetched at the pinned commit. Single project, flat captures only.",
  "counterexamples": [
    "A seated person reading at arm's length (45 cm) meets the vendor's near minimum of 24 arcmin, so a 22-arcmin floor that is 'right' at 2 m is under it there.",
    "A 1600-px capture across 90 degrees averages about 18 px/deg; the 14 px/deg in the text holds only at the centre of a perspective projection.",
    "Rest-frame support is mixed: horizon studies help, an earth-stationary fixation point did not; a cross-fade's comfort benefit remains unmeasured.",
    "A standing room-scale or head-locked panel falls outside the placement technique's fixed-seated-eye scope."
  ],
  "sources": [
    {
      "url": "https://learn.microsoft.com/en-us/windows/mixed-reality/design/typography",
      "result": "Opened. Supports the bands and makes them distance-dependent: minimum 'around 0.35\u00b0-0.4\u00b0' at 2 m and '0.4\u00b0-0.5\u00b0 / 3.14\u20133.9mm' at 45 cm; comfortable 0.6\u00b0-0.75\u00b0 at 2 m, 0.65\u00b0-0.8\u00b0 at 45 cm. Supports the thin-weight rule: 'thin vertical strokes will vibrate and degrade legibility'."
    },
    {
      "url": "https://developers.meta.com/horizon/design/styles_typography/",
      "result": "Opened. States sizes in pixels only ('no smaller than 14px ... minimal legibility', '18px or larger' comfortable) and 'Heavier weights are more legible'; gives no angle, so it is not the source of the degree bands."
    },
    {
      "url": "https://www.meta.com/blog/vr-display-optics-pancake-lenses-ppd/",
      "result": "Seen through search: Meta's own '25 PPD' for Quest 3; whether centre or average is not stated. Supports 'about 25'."
    },
    {
      "url": "ANSI/HFES 100-2007 (desktop character height)",
      "result": "Not reachable (paywalled; standard no longer maintained). Secondary sources cite 16-22 arcmin, partly attributed to ISO. The '20 to 22 arcminutes' line stays unverified."
    },
    {
      "url": "https://www.frontiersin.org/articles/10.3389/frvir.2020.582095/full",
      "result": "Opened (Hemmerich, Keshavarz, Hecht 2020). Defines rest frames and the independent visual background and reports horizon benefits with limits ('could not be found for an earth-stationary fixation point'). Consistent with the technique's 'predicts' wording; not a confirmation for seated content cross-fades."
    },
    {
      "url": "https://github.com/xkazm04/bp/tree/6bc4f02",
      "result": "Raw files fetched at 6bc4f02: all 22 cited anchors in BpType.h, BpTable.h, BpDeck.cpp, BpRoom.cpp and BpPawn.h hold verbatim."
    },
    {
      "url": "https://github.com/xkazm04/bp/blob/d1f37d77b623ef822251589a937a94e5cd309638/apps/vr/Source/bp/BpTable.h",
      "result": "master read 2026-10-31: the re-placement the panel application described as uncommitted has landed (DeckDistanceCm 75, DeckYawDeg 0, spines to the right, 40 x 22.5 cm)."
    },
    {
      "source": "Applications' run evidence (fit log, judge panels, deck cap logs)",
      "result": "Private run output; not reopened. Arithmetic re-checked: 6 px at about 14 px/deg is about 26 arcmin, 7.6-8.1 px is 33-35 arcmin, 60 to 75 cm is a 1.25 scale."
    }
  ],
  "documents": {
    "seated-in-world-reading.md": {
      "disposition": "clarify",
      "reason": "The vendor bands are distance-dependent (0.35-0.4 deg at 2 m, 0.4-0.5 deg at 45 cm); say so, since seated reading is near-field. '14 px a degree' for 1600 px over 90 deg is the perspective centre, not the 18 px/deg average. Desktop 20-22 arcmin unverified."
    },
    "techniques/angular-legibility-floor.md": {
      "disposition": "clarify",
      "reason": "Same distance split in the basis; 'a floor near 22 arcmin is the bottom of the legible band' is under the published near minimum (24 arcmin at 45 cm) and should say so; 14 px/deg is centre-of-capture."
    },
    "techniques/panel-placement-in-the-view-band.md": {
      "disposition": "keep",
      "reason": "Geometry internally consistent (60 to 75 cm = 1.25 scale; far half at 75 cm makes 60 cm stand over the near half). Scope limits stated. Single-project evidence disclosed."
    },
    "techniques/fade-the-content-not-the-view.md": {
      "disposition": "keep",
      "reason": "Rest-frame claim is worded as a prediction, which the 2020 review supports; durations are stated as practice. Comfort is unmeasured, and the application says so."
    },
    "applications/cpp--angular-legibility-floor.md": {
      "disposition": "keep",
      "reason": "All anchors hold at 6bc4f02; arithmetic (7.6-8.1 px = 33-35 arcmin; 36-48 arcmin comfortable) checks. Deviations disclosed. Citations re-checked, so verified_on may move."
    },
    "applications/cpp--fade-the-content-not-the-view.md": {
      "disposition": "keep",
      "reason": "Anchors hold; verdict honestly unmeasurable with a concrete return condition (15-min session, 10 switches, SSQ). Citations re-checked."
    },
    "applications/cpp--panel-placement-in-the-view-band.md": {
      "disposition": "clarify",
      "reason": "Anchors hold at 6bc4f02, but 'that round was uncommitted' is now stale: master d1f37d7 has the deck at 75 cm, yaw 0, spines to the side. Record it without changing the measured verdict."
    }
  }
}
```

## Architecture review - 2026-10-31 (after apply)

The three clarify items were applied in the documents' own voice, and every application's
`verified_on` moved after its anchors were re-fetched. Open: the desktop 20-22 arcmin figure
(primary not reachable) and the evidence-base items above.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/seated-in-world-reading",
  "date": "2026-10-31",
  "baseline": "f4eafdd91",
  "digest": "sha256-b2:7cb71889f51f2935",
  "disposition": "keep",
  "coverage": "All 7 documents read in full; one primary opened per load-bearing number; all 22 application anchors re-fetched at the pinned commit. Single project, flat captures only.",
  "counterexamples": [
    "A seated person reading at arm's length (45 cm) meets the vendor's near minimum of 24 arcmin, so a 22-arcmin floor that is 'right' at 2 m is under it there.",
    "A 1600-px capture across 90 degrees averages about 18 px/deg; the 14 px/deg in the text holds only at the centre of a perspective projection.",
    "Rest-frame support is mixed: horizon studies help, an earth-stationary fixation point did not; a cross-fade's comfort benefit remains unmeasured.",
    "A standing room-scale or head-locked panel falls outside the placement technique's fixed-seated-eye scope."
  ],
  "sources": [
    {
      "url": "https://learn.microsoft.com/en-us/windows/mixed-reality/design/typography",
      "result": "Opened. Supports the bands and makes them distance-dependent: minimum 'around 0.35\u00b0-0.4\u00b0' at 2 m and '0.4\u00b0-0.5\u00b0 / 3.14\u20133.9mm' at 45 cm; comfortable 0.6\u00b0-0.75\u00b0 at 2 m, 0.65\u00b0-0.8\u00b0 at 45 cm. Supports the thin-weight rule: 'thin vertical strokes will vibrate and degrade legibility'."
    },
    {
      "url": "https://developers.meta.com/horizon/design/styles_typography/",
      "result": "Opened. States sizes in pixels only ('no smaller than 14px ... minimal legibility', '18px or larger' comfortable) and 'Heavier weights are more legible'; gives no angle, so it is not the source of the degree bands."
    },
    {
      "url": "https://www.meta.com/blog/vr-display-optics-pancake-lenses-ppd/",
      "result": "Seen through search: Meta's own '25 PPD' for Quest 3; whether centre or average is not stated. Supports 'about 25'."
    },
    {
      "url": "ANSI/HFES 100-2007 (desktop character height)",
      "result": "Not reachable (paywalled; standard no longer maintained). Secondary sources cite 16-22 arcmin, partly attributed to ISO. The '20 to 22 arcminutes' line stays unverified."
    },
    {
      "url": "https://www.frontiersin.org/articles/10.3389/frvir.2020.582095/full",
      "result": "Opened (Hemmerich, Keshavarz, Hecht 2020). Defines rest frames and the independent visual background and reports horizon benefits with limits ('could not be found for an earth-stationary fixation point'). Consistent with the technique's 'predicts' wording; not a confirmation for seated content cross-fades."
    },
    {
      "url": "https://github.com/xkazm04/bp/tree/6bc4f02",
      "result": "Raw files fetched at 6bc4f02: all 22 cited anchors in BpType.h, BpTable.h, BpDeck.cpp, BpRoom.cpp and BpPawn.h hold verbatim."
    },
    {
      "url": "https://github.com/xkazm04/bp/blob/d1f37d77b623ef822251589a937a94e5cd309638/apps/vr/Source/bp/BpTable.h",
      "result": "master read 2026-10-31: the re-placement the panel application described as uncommitted has landed (DeckDistanceCm 75, DeckYawDeg 0, spines to the right, 40 x 22.5 cm)."
    },
    {
      "source": "Applications' run evidence (fit log, judge panels, deck cap logs)",
      "result": "Private run output; not reopened. Arithmetic re-checked: 6 px at about 14 px/deg is about 26 arcmin, 7.6-8.1 px is 33-35 arcmin, 60 to 75 cm is a 1.25 scale."
    }
  ],
  "documents": {
    "seated-in-world-reading.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the 2 m / 45 cm split of the vendor bands and qualified 14 px/deg as the capture centre. Desktop 20-22 arcmin still unverified (standard not reachable)."
    },
    "techniques/angular-legibility-floor.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: basis bullets carry the distance split; the 22-arcmin floor now says it sits under the 24-arcmin near minimum and suits glanced labels only; 14 px/deg qualified as centre."
    },
    "techniques/panel-placement-in-the-view-band.md": {
      "disposition": "keep",
      "reason": "Geometry internally consistent (60 to 75 cm = 1.25 scale; far half at 75 cm makes 60 cm stand over the near half). Scope limits stated. Single-project evidence disclosed."
    },
    "techniques/fade-the-content-not-the-view.md": {
      "disposition": "keep",
      "reason": "Rest-frame claim is worded as a prediction, which the 2020 review supports; durations are stated as practice. Comfort is unmeasured, and the application says so."
    },
    "applications/cpp--angular-legibility-floor.md": {
      "disposition": "keep",
      "reason": "All anchors hold at 6bc4f02; arithmetic (7.6-8.1 px = 33-35 arcmin; 36-48 arcmin comfortable) checks. Deviations disclosed. Citations re-checked, so verified_on may move. applied 2026-10-31: verified_on moved to 2026-10-31 after re-checking every anchor."
    },
    "applications/cpp--fade-the-content-not-the-view.md": {
      "disposition": "keep",
      "reason": "Anchors hold; verdict honestly unmeasurable with a concrete return condition (15-min session, 10 switches, SSQ). Citations re-checked. applied 2026-10-31: verified_on moved to 2026-10-31 after re-checking every anchor."
    },
    "applications/cpp--panel-placement-in-the-view-band.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the landed re-placement at master d1f37d7 (three anchors) with the verdict left on the measured placement; verified_on moved after re-checking every anchor."
    }
  }
}
```
