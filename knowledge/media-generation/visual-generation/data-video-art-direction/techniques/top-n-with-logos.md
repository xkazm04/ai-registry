---
layer: technique
type: technique
subject: data-video-art-direction
technique: top-n-with-logos
status: draft
laws: [output-never-outruns-evidence, checkability-routes-the-pixel]
shared_with: []
use_when: [choosing how many entities a race shows, labelling bars with brand logos, a market with one dominant player]
---

# Top 10 with logos

A top 5 hides the story of the long tail; a top 10 with recognisable logos
shows it and reads faster than names.

## Procedure

1. **Show the top 10** from the real data, with every entity that ever
   enters prepared (logo + identity colour).
2. **A dominant #1 gets its own true-scale treatment** (a 0–100 % strip plus
   an odometer). The rest race on their own honest axis (e.g. 0–6 %), and
   the screen says so. Never use a broken bar.
3. **Logos:** transparent SVG/PNG from Wikimedia Commons first. Record the
   file, page, licence, author and trademark flag per logo, and label them
   on screen as trademarks used for identification. Avoid share-alike
   files. If no free logo exists, use a clean wordmark in the identity colour.
4. **Normalise optical size** per logo (a per-logo scale factor and a max
   width). Check small marks (e.g. Sogou, "Microsoft Bing") at phone size.

## Decision rules

- Row height ≥ 52 px at 1080 wide for 9–10 rows; logo height ≈ 34–48 px.
- Values: one consistent decimal count (2 for sub-1 % tails).
- Merge renamed products into one entity and label the old name until the
  rename (e.g. "Live Search" → Bing).

## When not to use it

- **Entities without brand marks** (countries, people). Use flags or
  portraits under their own rules.
