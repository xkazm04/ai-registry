---
layer: application
type: application
subject: data-video-art-direction
technique: photo-to-poster-portrait
stack: process
status: draft
verified_on: 2026-10-03
---

# Boosted champion portraits without generation: the heavyweight-belt experiment

The data-video studio from `process--leader-adaptive-theme.md` tested a
succession format: "Heavyweight boxing champions over time", following one
belt (the WBC heavyweight title, 1963–2026) on a lineage strip. The current
champion's boosted portrait fills the frame, title defences pop up as
cards, and a winning challenger's portrait wipes over the old one. Hard
rule: no generated image of any real person.

## Photos used (all from a free-licence photo archive)

- Champion portrait: a ring-walk photo from Oct 1987. It is tagged public
  domain under a US "published 1978–89 without a valid notice" rationale
  (magazine scan).
- Defence evidence: a photo from the night of defence #7 (27 Jun 1988,
  KO in 91 seconds). Same rationale, but it is a **wire-agency photo**.
  High risk.
- Challenger portrait: a 1990 photo of the new champion with the belt,
  from a public library's digital collection, under a "No Copyright – United
  States" rights statement.
- Portrait variant: a Dec 1987 magazine portrait, same US rationale.
- No free photo of the upset fight itself was found. The upset card is
  typographic: a clipping with the round, the time, the knockdown and the
  scorecards.

## Pipeline that worked

- Two segmentation models unioned for one photo (the first left the lower
  torso semi-transparent). Holes smaller than 2 % of the subject were
  filled, and a feather of 1.6 px applied. A third, larger model ran out of
  memory on the shared machine.
- Bilateral filter and stylisation, then CLAHE, posterize (4–5 levels, 25 %
  continuous tone blended back), a gradient map in the holder's palette
  (champion red→orange→cream, challenger navy→cyan, outgoing holder grey),
  difference-of-Gaussians ink, an amplitude halftone (22° or 45°), paper
  texture, and plate mis-registration.
- A screenprint variant: a black halftone key plate plus line art over a
  flat red plate offset by a few pixels, on cream paper. It read best at
  phone size.
- The ground was built in CSS and SVG: sunburst rays, halftone dot fields,
  extruded skewed 1980s type, a torn-paper strip, and a generic code-drawn
  belt (no sanctioning-body marks). It was a late-1980s fight-poster world.

## Lessons

- **Skin taste gate:** sweat highlights posterized into cream blotches that
  read like skin damage. Clipping tones above about 0.82 before halftoning
  fixed it. Tune per photo.
- **Mid-wipe frame:** a jagged seam with a hot white edge and sparks, the
  outgoing champion desaturated, and the background world changing from red
  to blue with the seam. The colour change carries the beat.
- **Two timelines on one frame** (the zoomed lineage and the full-run bar)
  were confusable. Keep one, or style them far apart.
- **Scaling risk is photos, not code:** a full run has 26 distinct
  champions. Recent decades have plenty of attribution or share-alike event
  photos. The 1980s–90s are thinnest, often only magazine scans under a
  country-specific rationale, or later photos of the retired fighter. Plan
  per-champion tiers (A era-matched and free, B captioned context, C
  labelled placeholder) before building, and get a publicity-rights check
  for living people.
