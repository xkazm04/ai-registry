---
layer: application
type: application
subject: animatable-character-design
technique: functional-animation-slots
stack: process
status: forged
verified_on: 2026-10-18
use_when: [rewriting an anatomy-phrased rig constraint list as functions, comparing a rejected character brief with the one that replaced it, writing the animation note and rest-state edit for a prompt card]
---

# Athena's face, round 1 against round 2

Read on 2026-10-18 against the athena-portable tree: two prompt-writing
contests run back to back on 2026-10-17 and 2026-10-18 to give the desktop
agent Athena an animated presence, each brief handing several AI seats the
same data folder and asking for ten Leonardo.ai prompts. Paths below are
relative to the athena-portable root. Nothing was regenerated here; this
records what each brief said and what came back, n = 2 rounds.

## Round 1: the constraints spoke anatomy, and the field was a field of humans

The round-1 rig constraints were written for a mesh rig over an automatic
layer split, and every line names a human part:

- `.contest/arena/athena-face/data/rig-constraints.md:14` "Neutral, relaxed expression; lips closed or barely parted, teeth not showing."
- `.contest/arena/athena-face/data/rig-constraints.md:16` "Eyes fully open, both visible, nothing crossing them"
- `.contest/arena/athena-face/data/rig-constraints.md:18` "Hair clear of the face"

The brief's freedoms then defined the field on human axes:

- `.contest/arena/athena-face/BRIEF.md:37` "Athena reference is (or whether there is one at all), age, ethnicity, wardrobe"

Nothing in the brief banned the human default, and the palette, which
already carried the state hues, was offered as decoration rather than
material: `.contest/arena/athena-face/data/palette.md:20` "A palette nod in wardrobe, eyes or accents is welcome; it is not required."
Every seat answered the brief faithfully. The round-2 brief records the
outcome and the owner's verdict:

- `.contest/arena/athena-face-2/BRIEF.md:15` "Every seat wrote ten realistic or painted human women in sweaters."

This is default-attractor-rejection's brief failure exactly: independent
writers converging on the default because lips, eyes, hair, age and wardrobe
were the only vocabulary the brief supplied.

## Round 2: the same pipeline needs, written as functions

The round-2 animation constraints carry the same eight needs, rewritten:

- `.contest/arena/athena-face-2/data/animation-constraints.md:16` "region, frontal and centred** - where the viewer meets her"
- `.contest/arena/athena-face-2/data/animation-constraints.md:19` "A speaking element** the rig can drive with her voice: a mouth, a seam of light, a glowing"
- `.contest/arena/athena-face-2/data/animation-constraints.md:21` "closed mouth or a dimmed/neutral speaking element (it will be opened by animation)."
- `.contest/arena/athena-face-2/data/animation-constraints.md:24` "Nothing crosses in front of the focal region."
- `.contest/arena/athena-face-2/data/animation-constraints.md:30` "Light baked into her, not onto her"

The card format also changed: the round-1 "rig note" became an "animation
note" that has to say what moves on speech, blink and breath, and the
follow-up edit became a rest-state edit rather than an eyes-closed edit:

- `.contest/arena/athena-face-2/BRIEF.md:69` "image will move when she speaks / blinks / breathes"
- `.contest/arena/athena-face-2/BRIEF.md:71` "produce the same image in her **resting** state (eyes or eye-lights closed or dimmed, the"

## What came back

The two stills the owner generated and kept were both answers no round-1
constraint could have produced. Entry B's prompt 04, the Fiber-Optic Owl,
has no mouth at all; its speaking element is a seam of light, and its
animation note says so:

- `.contest/arena/athena-face-2/judging/entries/B/variant-1/index.html:400` "the vertical seam brightens per syllable"

Entry D's prompt 08, the Origami Axiom, names its slots as facets:

- `.contest/arena/athena-face-2/judging/entries/D/variant-1/index.html:899` "Hexagonal hinged voice-chamber facet on the lower mask plane"

Both notes then proved accurate enough to build from: the parametric rig
that animated them drives exactly the parts the notes named.

- `.claude/worktrees/spark-athena-avatar/spikes/avatar/t1-rig/README.md:101` "crystal crisply; seam brightness and D08 two-half hinge + slit light from `mouth.open` (visemes,"

## Residue and deviations

Anatomy did not leave entirely. The winning D08 prompt still opens with
"half-body portrait" and places its wreath at the "collarbone" and its star
at the "sternum"; it worked because the speaking and
gaze slots were functional, but the body words are the default's foothold
and a stricter brief would have caught them.

- `.contest/arena/athena-face-2/judging/entries/D/variant-1/index.html:904` "Centered frontal half-body portrait on pure #000000 black"

The round-2 brief also lists no resolution floor for the focal region itself,
only for the canvas:

- `.contest/arena/athena-face-2/data/animation-constraints.md:32` "at least 1024 px on the short side"

The neural trial's crop around the
crystal face rendered its facet lines "softer than the untouched frame
around it", which is the cost of a small focal region at drive resolution —
recorded as a gap against the slot standard, not as a reason to drop it.
