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

## When prose cannot hold the geography

Axis and eyeline discipline carries screen *direction* across clips; it does
not carry *position and scale*. A scene whose meaning depends on where things
stand — a landmark the character approaches, an object with a fixed spot and
a fixed size relative to a person — will scatter take to take no matter how
carefully the prose states it, because positional language ("to the right of
the hydrant, twice a person's height") is re-interpreted per generation. The
fix is to stop asking language to do a drawing's job: **author a schematic —
the location plate with positions marked and sizes stated as ratios to a
person — and attach it as a reference on every take, with the prompt
rewritten around it.** Then pin the characters to named landmarks in the
frame ("he stands under the tree, frame left") rather than to abstract
directions. The schematic is generated in seconds from the location image;
what it replaces is the brute-force lottery of re-rolling until geography
happens to hold, which is the expensive way to buy the same consistency.

## The seam can be an action, not only a frame

Anchoring a shot's head to the previous shot's tail holds a seam inside one
location; it cannot cross a scene change, where the next clip shares no
pixels with the last. The grammar that survives the crossing is the match
cut, and for generated material it is *briefed*, not found in the edit:
**state the boundary action identically in both briefs** — "open on the same
gesture that closes the previous scene: same hand, same motion, same
framing" — then cut on the action. The repeated beat carries continuity
across the location change the way a tail anchor carries it within one, and
it costs two sentences instead of a conditioning input.

## Failure modes

- **The mood reel** — beautiful unrelated clips; no establishment, no
  progression, no scene.
- **The teleporting cast** — sides and gazes flipping between clips
  because no brief carried the axis.
- **The stutter cut** — consecutive near-identical framings read as a
  glitch rather than an edit.
- **Full-coverage habit** — generating a traditional coverage package
  per beat and paying for shots the scene's meaning never needed.
