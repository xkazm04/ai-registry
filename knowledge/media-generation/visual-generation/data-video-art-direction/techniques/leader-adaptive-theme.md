---
layer: technique
type: technique
subject: data-video-art-direction
technique: leader-adaptive-theme
status: draft
laws: [style-is-restated-not-remembered, output-never-outruns-evidence]
shared_with: []
use_when: [choosing a background and palette for a data video, designing what happens visually at a lead change, giving each case a distinct look while keeping a house identity]
---

# Leader-adaptive theme

The far plane of the frame belongs to **whoever leads right now**. It might
show a brand's colours as soft light, a team livery as bands, a nation's flag
colours with a blurred crowd photo, a landscape at the leader's end of a map,
or a fight-poster ground in the champion's colour. The viewer knows who is
winning before reading a bar, and a lead change gets a built-in motion
moment: the world itself changes.

## Procedure

1. **Name the world of the case**: the brands, teams, nations, era or genre
   the story lives in.
2. **Derive one theme per entity that can lead.** Each theme has a palette
   (4 to 6 colours), a background idea (light leaks, bands, a blurred photo
   plane, rays, a texture) and optionally a type treatment (coloured digits,
   an outline giant numeral on the far plane).
3. **Keep the house invariants fixed** across themes: the clock position, the
   progress bar, the source line, the type families and the safe box. The
   theme changes the world, not the furniture.
4. **Tie the theme to the leader in the engine**, not to the case. On a lead
   change, cross-fade or wipe the far plane over a few frames. Make that
   transition one of the frame's two motion cues.
5. **Keep the data plane neutral enough** that every entity's identity
   colour stays readable on every leader's theme. Test the worst pair.
6. **Write the theme down per case** (palette hex, background recipe, what
   it evokes) so it is restated at every render, not remembered.

## Decision rules

- When the leader never changes (a monopoly), theme by the **story** instead
  (the challengers' fight, the era), and spend the motion on the race for the
  places below.
- Brand palettes evoke trademarks. Use colour and coloured type, never logos,
  and flag the case for a legal check before publishing.
- A theme must not claim more than the data does. Do not dress a projected
  leader in the winner's world before the data crosses.
- An off-brand case look is allowed and often wins. The house survives in
  the invariants.

## When not to use it

- **Many-leader churn** (the lead changes every few steps). The world would
  flicker. Theme by the story and mark leads with a badge instead.
- **Cases where the leader's world is a sensitive identity** (a party, a
  religion, a conflict side). Use a neutral story theme.
