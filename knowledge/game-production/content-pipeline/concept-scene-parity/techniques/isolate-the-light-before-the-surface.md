---
layer: technique
type: technique
subject: concept-scene-parity
technique: isolate-the-light-before-the-surface
status: forged
laws: [unmeasured-is-not-a-pass, one-authority-per-quantity]
shared_with: []
use_when: [a region reads too bright, too grey or the wrong colour against the concept, a material has been retuned twice and the region still reads wrong, making a scene darker made it read empty, adding haze greyed the walls]
---

# Isolate the light before you touch the surface

The named concern: a region of the frame reads wrong (a wall too bright, a sheet too cyan, a
panel too pale), and the team's reflex is to retune the material of whatever sits there. In a
lit scene a pixel's value is a sum of contributions:
- the surface's own emission;
- each light's direct contribution;
- baked bounce;
- every light that scatters in fog between the surface and the eye;
- a translucent veil standing in front;
- bloom from something bright nearby;
- a reflection or sheen.

Retuning the material moves one term of that sum. When the material was not the term that put the
pixel there, the retune does nothing, or it makes the surface wrong in every other light it will
ever stand in.

## The procedure

1. **Measure the region.** Use one number at the scoring camera: the median brightness of a fixed
   patch, beside the concept's value for the same patch. Without the number, "too bright" cannot
   be divided between contributors.
2. **Switch the contributors off one at a time,** at the same camera, and re-measure after each.
   That means every light's direct term, every light's fog scattering, the baked bounce, the sky
   term, any veil or haze plane, and the surface's own emission. Record the drop each one makes.
3. **Assign the region's value to its contributors.** The list usually has one or two dominant
   terms, and they are often not the surface.
4. **Cut or move the dominant term,** then re-measure the region and every neighbouring region the
   term also reached.
5. **Retune the surface last,** and only against what is left.
6. **Reset every toggle.** Some engines keep a console setting changed during one play session into
   the next. A later capture taken with the fog or the bloom still off is a capture of a different
   scene. Make the toggles in the editor's world or a script that restores them, and discard any
   frame taken while one was left off.

## What one project's isolations found

Four isolations in one sprint each pointed away from the obvious surface:

| Region | Obvious suspect | What carried it |
| --- | --- | --- |
| Back wall, 111 against the concept's 18 | wall albedo | about 35 from a translucent haze plane, 16 from fog lit by baked light, 30 from movable lights' scattering; the albedo almost nothing |
| Glowing sheet, too bright and too cyan | the sheet's emissive | with its emission at zero it still read 40; one air light under the sheet, scattering upward, made the veil (14 with it off) |
| Left of the room, lifted 19 | shelf lamps | the table frame's fill light, scattering through the whole room |
| A pale panel, 117 against the concept's 20 | its texture | a sheen: darkening the albedo alone reached 98; removing the specular as well reached 35 |

None of the four was fixed by the material that looked responsible.

## Darkness is subtraction by source, not a global dimmer

The same isolation explains a common oscillation. A judge asks for a darker room. The team lowers
everything, and the next judge calls the room empty. A dark, dressed concept is a near-black room
with small warm pools: the shelves, the desk and the drawings, each lit by its own practical
light. The way there is to cut the global terms (sky, bounce, static scattering, broad fills) to
near zero, and then light the dressing with small local sources. Turning one master dimmer down
cannot produce that, because it lowers the pools with the walls.

The same holds for haze. Fog that scatters every light greys the walls. Fog that scatters only
the lights meant to show in the air (the character's glow, the beam, a lamp's cone) gives soft air
around them and leaves the walls dark. Choose the scattering lights by name, and never let the
baked light scatter in a dark scene.

## Decision rules

- **When a region reads wrong, measure and isolate before editing any material.** One isolation pass
  is cheaper than two material rounds.
- **When a surface reads bright with its own emission at zero**, the light is coming from somewhere
  else. Find it.
- **When darkening made the scene read empty**, restore the local pools and cut the global terms
  instead.
- **When haze greyed the walls**, cut the scattering from baked and fill lights, and keep it on
  the chosen ones.
- **When a capture was taken after a toggle**, check that every toggle was reset before the frame is
  scored.

## When not to use this

- When the region is wrong in an asset review under neutral light as well. Then it is the
  surface, and the destination-light review owns the fix.
- For a single-light scene, where there is nothing to isolate.
