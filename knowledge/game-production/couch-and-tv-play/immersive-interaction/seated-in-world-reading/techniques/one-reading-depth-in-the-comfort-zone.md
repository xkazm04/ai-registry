---
layer: technique
type: technique
subject: seated-in-world-reading
technique: one-reading-depth-in-the-comfort-zone
status: draft
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [choosing how far from the eye a panel a person reads for minutes should stand, a reading panel sits closer than a metre over a work surface, a panel swap or a queue moves text toward or away from the eye, deciding whether a body-anchored panel may carry text to read]
---

# Hold one reading depth inside the comfort zone

The named concern: a headset's optics show every image at one fixed focal distance. The eyes
focus there to keep the image sharp, and they also turn inward to wherever the rendered
object stands. In the physical world those two distances are the same. In a headset they
part, and the further they part, the sooner the eyes tire. A reading panel is the thing the
eyes hold longest, so its depth is the depth the whole session is spent at. The angle of the
text says whether it can be read. The depth of the panel says how long it can be read for.

## Count the conflict in diopters

Work in diopters, one over the distance in metres, because the conflict grows that way and
not linearly. The conflict at a panel is the difference between one over its distance and
one over the display's focal distance:

| Panel distance | Vergence | Against a 1.25 m focal plane | Against a 2.5 m focal plane |
| --- | --- | --- | --- |
| 0.5 m | 2.0 D | 1.2 D | 1.6 D |
| 0.75 m | 1.33 D | 0.53 D | 0.93 D |
| 1.0 m | 1.0 D | 0.2 D | 0.6 D |
| 1.3 m | 0.77 D | 0.03 D | 0.37 D |

The same step costs more the nearer it is. Going from 1 m to 0.75 m adds a third of a
diopter. Going from 0.75 m to 0.5 m adds two thirds.

## The published bounds

Two platform vendors' comfort guidance agrees on the shape. Both pages were opened on
2026-11-03.
- **A floor for sustained fixation.** Content a person fixates on for a long time, such as a
  menu or an object of interest, is rendered at least 0.5 m away.
- **About a metre or more for reading.** One vendor reports that 1 m is a comfortable distance
  for menus and panels read for long periods. The other tells immersive apps to keep most
  content 1 m or farther away. It puts those displays' focal distances between 1.25 and
  2.5 m.
- **Never under 0.4 m.** The second vendor recommends never presenting content closer than
  40 cm. It fades content out at that distance and clips it at 30 cm.

Read those numbers as the stated basis of a constant, not as a law of optics. A headset's
own focal distance moves the whole table, and a vendor that has not published one has to be
treated as anywhere in the 1.25 to 2.5 m band.

## Depth swings cost more than a steady near depth

The second vendor's guidance makes a point that the distance bounds alone miss. Discomfort
from the conflict is greatest when the gaze switches back and forth between depths. A
stationary object at 50 cm is far more comfortable to look at than one at 50 cm that moves
toward the eye and away from it. Three rules follow:
- **A reading panel holds one depth.** A swap slides the panels sideways or cross-fades
  them. It never flies a panel toward the eye or away from it.
- **A queue steps back by centimetres, not tens of centimetres.** A spine 4 cm behind the
  front panel at 75 cm differs by less than a tenth of a diopter.
- **Count the swing between the panel and the work surface**, because a seated person's gaze
  goes back and forth between the two all session. The same vendor suggests a "depth budget":
  near content seen for no more than about a quarter of the time. Beyond that budget, test
  with users.

## A seated work surface forces a trade

A table in front of a chair is near-field by anatomy. Its near edge is about half a metre
from the eye, and its far edge is little more than a metre away. A reading panel above it has
two honest homes, and each one pays a different cost:
- **Over the surface, near its middle depth.** The swing to the surface is small. The conflict
  against the focal plane is larger, because the panel is closer than a metre.
- **Beyond the surface's far edge.** The panel sits near the focal plane, so the conflict is
  small. The swing to the near edge is large.

Compute both, in diopters, from the measured eye and surface, and write down which one was
chosen and why. Neither one is right in general. The choice is decided by a seated headset
session, not by a capture. Until such a session has run, the choice is unmeasured, and an
unmeasured choice is not a pass.

Whichever home is chosen, a move in depth rescales the panel by the ratio of the two
distances, so its text keeps the same angle. The legibility floor is re-checked at the
panel's farthest corner after every move, as
[the legibility floor](./angular-legibility-floor.md) and
[the placement procedure](./panel-placement-in-the-view-band.md) require.

## A body-anchored panel sits under the floor

A forearm held up toward the face puts a wrist panel about 40 to 50 cm from the eye. That is
under the floor for sustained fixation at every comfortable arm pose. So a wrist panel
carries glances: status, a count, a few rows. The anatomy that makes it small and oblique
also makes it near, and both point the same way.

## Procedure

1. Write the focal distance as a constant with its basis. If the headset does not publish
   one, write the band the vendors give (1.25 to 2.5 m) and say that it is a band.
2. For every panel read for more than a glance, log its distance and its conflict in diopters
   against both ends of the band.
3. Put sustained reading at 0.5 m or farther, and prefer 1 m or farther where the furniture
   allows it.
4. For a seated work surface, compute the swing from the panel to the near and far edges of
   the surface at each candidate depth, and record the trade that was chosen.
5. Check that no transition moves a reading panel in depth.
6. Mark the result `unmeasured` until a seated session with a comfort questionnaire has read
   it.

## Decision rules

- **When a reading panel stands closer than 0.5 m**, move it out and scale it. Or demote it to
  a glance surface and move the reading to a panel farther away.
- **When a panel already clears the floor and stands under a metre over a work surface**, keep
  it there unless a session says otherwise. Moving it farther lowers the conflict and widens
  the swing, and only a measurement can say which one costs more.
- **When a swap animates a panel's depth**, change the animation to a sideways slide or a
  cross-fade.
- **When a focal distance is quoted from memory**, open the vendor's page before it becomes a
  constant. Focal distances differ between headsets and change between generations.

## When not to use this

- For brief touch interaction at arm's reach, such as pressing a button or grabbing a handle.
  Near content is allowed there, inside the depth budget.
- For a varifocal or light-field display whose focal distance follows the gaze. The conflict
  that this technique counts is what such a display removes.
- For text the person only glances at. The legibility floor binds there, and the depth floor
  is for fixation that lasts.
