---
subject: seated-in-world-reading
domain: game-production
last_touched: 2026-11-03
touched_by: deepen
dry_streak: 0
---

# seated-in-world-reading

First touch: 2026-10-26. The subject was born from an `/intake` of the bp VR fidelity sprint
([[../../sources/2026-10-26-bp-vr-fidelity-sprint]]); its spec is `librarian/specs/2026-10-26-seated-in-world-reading.md`.
It sits in `couch-and-tv-play/immersive-interaction`, which now holds 5 subjects.

## State

Draft: a golden path, 4 techniques, and 4 cpp applications against bp. Primaries opened so far:
- one headset vendor's typography guidance: minimum legible text at 0.35-0.5 degrees, comfortable text at 0.6-0.8
  degrees;
- that vendor's display/comfort page (last_updated 2026-03-11): fixation of 0.5 m or more for extended viewing, and
  1 m comfortable for menus;
- a mixed-reality platform's comfort page (updated 2026-10-26): an optimal zone of 1.25-5 m, never closer than 40 cm,
  immersive focal distances of 1.25-2.5 m, depth switches costing more than a steady near depth, a depth budget of
  about 25%, and a resting gaze of 10-20 degrees below the horizon.

Applied verdicts:
- floor: better;
- placement: not-better (the committed deck was placed by nominal distance);
- fade: unmeasurable (no headset comfort session);
- reading depth: simulation, unmeasurable (open trade between 75 cm and 1 m).

## Passes

- **2026-11-03, /deepen (directed; ranked by 3 techniques against a floor of 4).** Lanes:
  - a web primary lane, run by the director, with both vendor pages opened verbatim. It doubled as the
    counter-evidence lane, aimed at the placement technique's 60-75 cm distances;
  - a blind training-data lane, run by a subagent.

  Convergence: both lanes agree that a sustained-reading panel sits at 0.5 m or more, preferably about 1 m,
  because of the conflict between where the eyes point and where they focus. That earned the new technique
  `one-reading-depth-in-the-comfort-zone`. The placement technique was widened with the depth floor and the resting
  gaze band (bp's deck at 11.2 degrees below the horizon confirms the band). The golden path gained a depth section.

  The placement application's return condition has half fired: the re-placement was committed in bp `f2c5170`, so the
  application was re-read at `202883f` and verified_on moved. The blind read is still owed.

  Declined:
  - a separate compositor-layer technique, because the golden path and the floor's when-not-to-use already carry it
    and no project seam exists;
  - the blind lane's 0.5 D comfort-zone figure from the vision literature, because the paper was not opened;
  - the blind lane's per-headset focal planes, because they are volatile and unsourced. The vendors' 1.25-2.5 m band
    stands instead.

## Impact

- pof: 4 pairs, 0 judged, 0 stale. The map was regenerated and committed locally (`5cfaf420`) and not pushed, because
  pof master has diverged from its remote.
- bp is not in the map, because it has no registry-map. Its own `.ai/applied.jsonl` gained the simulation row, pushed
  to origin as `441e566`.

## Open

- **Ledger disagreement.** bp's `.ai/applied.jsonl` records placement as `better`, judged at `f2c5170`. The registry
  row is `not-better`, judged at `6bc4f02`. They judged different commits. A blind read of `f2c5170`'s deck settles
  the registry row.
- **Evidence base.** One project, one tethered headset, all flat captures. A second seated VR project is the
  corroboration owed.
- **Comfort.** Needs a measured session. One headset session can answer both open questions:
  - a sickness questionnaire across room switches, for the fade technique;
  - the deck at 75 cm against 1 m, for the reading-depth technique.
- **Text size.** The comfortable-band rule is unapplied: bp's deck body sits at about 33-35 arcmin.
- **Other bundle.** The software bundle's design-tokens density technique holds the flat-screen form of the
  minimum-size rule. The discriminator (an angle against points) is stated here in prose, with no link.
- **Clocks.** The vendor comfort figures are volatile. Re-open both pages by 2027-05-03.
