---
layer: technique
type: technique
subject: cinematic-language
technique: scene-grammar-progression
status: forged
laws: [causality-over-sequence]
shared_with: []
use_when:
  - assembling multiple generated clips into a scene that reads as directed
  - planning a shot list for a beat sequence before generation
  - characters teleport or flip sides between consecutive clips
  - deciding whether a beat needs a cut or a camera move
---

# Scene grammar progression

## The concern

Shots become a scene through a grammar a century of viewers has been
trained on, and a set of individually beautiful clips that ignores it
reads as a mood reel, not a film. The grammar matters doubly for
generation: each clip is born in isolation, so continuity of space,
eyelines, and size progression must be *planned into the briefs* — the
editor's discipline moves upstream into prompting.

## Procedure

1. **The establishing contract.** A scene classically opens wide enough
   to teach where we are and how the players relate in space; once
   established, the scene has permission to stay tight. Withholding the
   establishment (opening on a close-up, establishing late) is a real
   device — for disorientation — spent knowingly, not by accident.
2. **Coverage progression.** Build the scene's shot list as master →
   mediums → over-the-shoulder pairs → singles → inserts, and escalate
   size with tension: wide when stakes are low, tighter as they rise.
   The insert close-up (the letter, the ring, the gun in the drawer) is
   how an object is promoted to plot.
3. **Axis discipline.** Keep the camera on one side of the line of
   action across a scene's clips so screen direction holds: if she faces
   screen-right in her single, he faces screen-left in his, and the
   audience stitches the room together. Cross the line only via a move
   shown on screen, a neutral head-on shot, or deliberately — for
   confusion at a confrontation beat.
4. **Eyeline continuity between clips.** State gaze direction in every
   brief ("he looks screen-left", "she looks screen-right, slightly
   down") — it is the glue of shot-reverse-shot and the first thing
   isolated generation loses.
5. **Change enough between shots.** Consecutive shots of the same
   subject must differ decisively in angle or size, or the cut reads as
   a stutter. When a beat's time must stay unbroken — tension, spatial
   revelation, virtuoso immersion — move the camera instead of cutting:
   a cut asserts a new idea; a move transforms the current one.
6. **Re-establish after geography changes.** New arrangement, new wide.

## Decision rules

- Write the scene as beats first, assign each beat a size/angle from its
  meaning (per camera-position-semantics), then check the list top to
  bottom for axis, eyeline, and progression violations — before any
  generation is spent.
- Per-shot cost makes coverage expensive; generate the master and the
  two or three frames the beat structure actually needs, not the full
  traditional package.
- In-clip cuts (timeline-block prompting) obey the same grammar: a block
  boundary is a cut and needs its size change and its held eyeline.
- Screen-direction words belong in the prompt vocabulary: "screen-left",
  "screen-right", "toward camera", "away from camera".

## Failure modes

- **The mood reel** — beautiful unrelated clips; no establishment, no
  progression, no scene.
- **The teleporting cast** — sides and gazes flipping between clips
  because no brief carried the axis.
- **The stutter cut** — consecutive near-identical framings read as a
  glitch rather than an edit.
- **Full-coverage habit** — generating a traditional coverage package
  per beat and paying for shots the scene's meaning never needed.
