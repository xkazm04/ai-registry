---
source: youtube:EdCUpP4_8y4
kind: youtube
url: https://www.youtube.com/watch?v=EdCUpP4_8y4
title: "I Built an Opening Cinematic for My Game Using AI (Full Process)"
author: Building Aeon
words: 1080
class: first-party practitioner account (build-walkthrough form)
domain: media-generation
extracted: 12
accepted: 2
declined: 0
already_covered: 7
folded: 1
leads: 1
untriaged: 1
dispatched: 0
applied: 2
shipped: 1
fetches: 0/3
run_id: intake-EdCUpP4
siblings: 0
skill_version: 2.7.0
---

# Grimstone opening cinematic - a still-first pipeline that climbed one rung and paid for it

Operator brief: `domain media-generation`. **Class: first-party practitioner
account in build-walkthrough form** - the creator built a one-minute opening
cinematic for their own game and narrates what happened, not what the tools do.
1,080 words on a real subtitle track (container checked: prose, two subtitle
files, the `en-orig` track). **Expected yield said before the table: LOW** - one
landing at most, several catches, no subject. It came in at two amendments, both
from the operating half, which is the class working as the reference describes.

**Declared focus (round 36) applied:** (1) subjects were claimed on the board by
the address `research-map` printed (`media-generation/production-ops/video-assembly`,
`media-generation/visual-generation/cinematic-language`), and the file check before
the first write compared those same strings - clear, 0 siblings live for the whole
run, so the check that the focus item asks for ("did a claim and an index address
agree") passed trivially and proves nothing about the instrument. (2) Before running
the first arm the note below says what a caught result would have taught; it was not
caught, and the pre-check is what makes that a confirmation worth having. (3) No
fetch was needed - the corroboration was code read in a connected tree plus
training-data convergence, sixteenth consecutive corpus-internal run - so the
under-a-month-old-release rule did not apply. Round 35's premise hunt fired: the
larger landing is an enumeration's unstated premise (every rung on the conditioning
ladder makes a generation).

## The pipeline the source describes

Story in a chat model -> rough shot list with narration per shot -> **screenshots
captured from the game's own scene** as the foundation -> variations and a separate
painterly editing pass in an image model -> stills on a timeline under a slow zoom
-> an image-animation feature to "push the zoom further" -> a reused generated
music track -> generated ambient bed and spot effects -> a cast synthetic narrator
-> layered per scene. Retrospective: style consistency was the hard part.

The discriminating question sorted every row. Everything the creator *did* to the
tools (story first, capture, restyle, references, cast a voice) the corpus already
owns and states with a rationale the source lacks. Everything that *happened to*
the creator - the zoom read as static, the animated figures moved when they should
not have, several re-rolls under stillness directives - is where the two landings
came from.

## Triage (v2.5 scored gate)

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | golden-path | S | Story and shot list before any asset | production-pipeline-phasing (order phases by what each settles) | none | likely catch | - | already covered |
| 2 | K | technique | M | Capture the world from the engine, then restyle | motion-plate-library (built previz), generated-shot-sourcing (the anchor imports its maker's texture; grade stills before animating) | none | partial -> catch | - | already covered (promoting question below) |
| 3 | K | golden-path | S | Pick content first, fight style per image after | visual-style-locking (style is a property of the project; ratify first) | none | likely catch, source contradicted | - | already covered - corpus right |
| 4 | K | technique | S | Several already-styled outputs as style references | approved-reference-sheet; both channels every call; the unlabeled reference | none | likely catch | - | already covered |
| 5 | K | amendment | M | Rung zero: the still moved by the editor is below text-only | generated-shot-sourcing / the conditioning ladder | corrects-claim | real gap | 3/0/2 | **accept** |
| 6 | K | amendment | M | Zero-beat performance; anti-freeze negatives and poster judges cannot see directed stillness | performance-direction (rule 5, beat starvation); movement-motivation (locked-off is a decision) | corrects-claim | real gap | 3/1/2 | **accept** |
| 7 | K | amendment | S | Re-roll for stillness, pick the take with least figure motion | cost-per-usable-output | none | folded into 6 | - | folded |
| 8 | K | technique | S | Reuse an earlier generated track | asset-vs-disposable-render; reference-track-anchoring | none | likely catch | - | already covered |
| 9 | K | technique | S | Ambient bed plus spot effects; wind rises as tone shifts | layered-element-assembly; "sound leads, picture confirms" | none | likely catch | - | already covered |
| 10 | K | technique | S | Cast the narrator by descriptor | spoken-delivery-direction ("casting a synthetic narrator") | none | likely catch | - | already covered |
| 11 | K | technique | M | A cinematic must still look like the playable world: location identity across generated shots | character-identity-continuity (faces); reference-role-map (a location role, no continuity rule) | new-technique? | thin | 2/2/2 | lead |
| 12 | - | currency | S | Image-animation feature in an image tool; a web editor "worked well" | no application cites either | none | thin | - | untriaged |

`auto=2/1/0`, `fp=0`. Threshold +2; row 5 at +3, row 6 at +2. The one
scored reject (row 11) is banked as a lead, not declined - nobody looked at it and
said no.

**Row 5 scoring.** GAIN: an amendment that inverts a stated rule - the ladder says
text-only is "cheapest to brief, least controlled" and the lowest rung, and a rung
below it is both cheaper and *more* controlled - 2; +1 convergence, because the
fleet's own studio holds a frame as a still plus an authored move with no renderer
(`frames.ts:88-90` in its own words: "a clip in this app is AUTHORED, never
rendered"), reached with no sight of this source. RISK: code read in a tree - 0;
append (every ladder sentence stays true) - 0; home uncontested (the ladder lives in
one file) - 0. COST M.

**Row 6 scoring.** GAIN: inverts what performance-direction and the harness both
assume - "inert standing" is listed only as a defect, and the zero-beat case is the
one the enumeration's members all silently exclude - 2; +1 convergence: the fleet's
own video cycle briefed a near-still shot in motion-intent-authoring's exact phrasing
independently of this source, and its judge penalised it. RISK: the director opened
the tree and ran the measurement - 0; append - 0; **home contested** between
performance-direction, movement-motivation and motion-intent-authoring - +1. Chosen
by stated job: the figures are the performer channel, and rule 5 ("state what the
performer does not do") is the sentence the amendment completes. Movement-motivation
already owns camera stillness ("locked-off is a decision, and models need it named")
and is not touched; the subject note records the boundary. COST M.

**Row 2's promoting question**, executed: *does any technique say that when the
world exists as a renderable scene, the anchor is captured from it rather than
generated?* Motion-plate-library's "built previz" covers the motion plate; the
anchor-texture section of generated-shot-sourcing predicts the source's exact
difficulty (the game-engine finish rides into every derived frame and had to be
restyled) and prescribes what the creator did (grade the stills before animating).
The appearance-capture case is the still-image reading of those two, not a missing
mechanism. Not promoted; recorded as a catch with the observation.

## What landed

**Amendment 1 - `video-assembly/generated-shot-sourcing`, "Rung zero: the still
that is moved, not generated."** Every rung on the conditioning ladder shares a
premise it never states: a generation is made. Below text-only sits the accepted
still moved by the editor - the most controlled rung, not the least, because nothing
in it is sampled - and what it cannot give (parallax, atmosphere, life in the
figures) is the only reason to climb. The source is the price stated plainly: the
creator left rung zero because the zoom "felt static", the empty establishing shot
came back right at rung two, and every populated frame came back with its figures
moving, unasked, and took several re-rolls under stillness directives to return to
what rung zero gave for free. Rule: start at rung zero and climb for a named reason;
and a still-first pipeline with no renderer is rung zero by construction, so the day
a renderer arrives the decision to generate must become a field, not the absence of
one. Corroboration: code read in a connected tree + training-data convergence. One
`use_when` line added.

**Amendment 2 - `cinematic-language/performance-direction`, "The zero-beat
performance."** Figures that are set dressing under a camera move are beat
starvation at its limit: zero beats over five seconds is five seconds of the prior,
and the prior animates any figure it recognises. Stillness is briefed like a
performance (name the figures, say they hold, say what the only move is) and the take
is chosen by least figure motion. Then the harness half, which the source could not
have given: a global anti-freeze negative is written against a failure (the dead
clip) and cannot tell it from a direction, and a three-poster judge cannot see a
directed near-still and calls it frozen. One decision rule, one failure mode ("the
silent hold"), two `use_when` lines.

## Apply and ship

**Row 6 - gravity, `experiment`, `better`, ship 1 (`577524b` + ledger `5a8550e`).**
The seam was chosen to falsify: gravity's video lane carries a global negative
"static frame, frozen image, no motion, jitter, flicker" (`dojo_video.py:39`) and a
rubric that asks whether one readable move happened, read from three posters. Its
own first video cycle (`2026-08-31-video-compose`) had briefed a challenger "almost
still - a thin band of mist drifts a fraction; the window light flickers once; the
camera does not move" - motion-intent-authoring's own example, quoted - and the
chokepoint judge picked against it with the reason "the same frozen wide of a lit
hut with nothing advancing".

*Said before arm one:* a CAUGHT result - the challenger at the frozen floor - would
have inverted the finding: the negative failed to prevent freezing and "almost
still" collapses to still at this model scale, a boundary on the directive rather
than on the judge. The arm could change what the landing said, so it was worth
running. Instrument asserted first on a known positive (the advancing clip) and a
known zero (one of the clip's own posters looped through the same VP9 encode):

| clip | mean consecutive-frame luma delta |
| --- | --- |
| frozen floor (looped PNG, same codec) | 0.000 (max 0.0025) |
| reset-still challenger, "almost still" | **0.210** |
| reset-still baseline, bare sentence | 0.558 |
| rung-advance challenger, three slow steps | 3.129 |
| rung-advance baseline, bare sentence | 8.547 |

Not caught. The clip obeyed - two orders of magnitude above frozen, a third of its
undirected baseline - and the three-poster instrument was blind to it. Shipped:
`motion_energy.py` (stdlib + ffmpeg, floor calibrated and written beside the number),
a `motion` pre-filter in the lane's measurement script writing `measures.json` beside
the readbacks, a self-test case pinning frozen / not-frozen / unmeasured under the
CI gate that already runs the file; 7 cases green; the shipped command reproduces the
table above exactly. The negative was **not** changed - that is a prompt change with
no paired proof, and the ruler is what now permits one (the return condition).

**Row 5 - gravity, `simulation`, `better`, ship 0 with the reason stated.** Three
real cases from the tree (the explainer fixture whose spec validator refuses to move
text; the read-only shots lane for promotional cuts; deck 03 "still built to move")
under the ladder as it stood versus rung-zero-first. Structural fact: the decision
to generate at all is made in that tree by the *absence* of a renderer - nothing on
the frame can say "stays a still by choice" as distinct from "no render seam yet".
Not shipped because adding the field with nothing to read it is exactly the
authored-but-unread shape the tree's own type file was scoped to remove; the return
condition names the moment it becomes a field. The existing `react--generated-shot-
sourcing` application was extended rather than duplicated, its citations
re-resolved at HEAD before `verified_on` moved.

## Already covered - the seven catches

1. **Story first, shots with narration per shot** - `production-pipeline-phasing`:
   "order phases by what each one settles"; script settles what is said, visual
   selection what is seen.
2. **Engine capture as the foundation** - see the promoting question above; the
   corpus predicts the restyle cost the creator paid.
3. **Content chosen first, style fought per image after** - the source's order is
   the failure `visual-style-locking` names ("style is a property of the project,
   not of the shot"; ratified before generation). The creator reports the pain the
   subject's order avoids: "quite a bit of back and forth". Corpus right.
4. **Multiple already-styled images as references** - `approved-reference-sheet`
   accumulating from accepted renders, plus "both channels, every call" and the
   unlabeled-reference hazard; the source found the sheet by trial.
5. **The earlier music track reused** - `asset-vs-disposable-render`: an accepted
   asset is kept and reused; `reference-track-anchoring` for the brief.
6. **Ambient bed, spot effects, "wind picking up as the tone shifts"** -
   `layered-element-assembly`, `envelope-first-briefing`, and the golden path's
   "sound leads, picture confirms".
7. **A narrator cast by descriptor** - `spoken-delivery-direction` ("casting a
   synthetic narrator for a script").

## Lead

- **World identity continuity for a cinematic that must match a playable scene**
  (row 11, `[00:01:42]` "they still needed to look like Grimstone"). The corpus
  models identity continuity for *characters* and gives a *location* a reference
  role, but no technique states when a generated establishing shot has stopped being
  the place the player will enter, or what ruler would say so. Return condition: a
  second independent source with the same requirement, or a fleet project that
  generates shots of a scene it also renders - gravity's shots lane is the nearest
  and has no path from a shot to an image yet.

## Untriaged

| # | Title | Anchor | Why nobody verified it |
| --- | --- | --- | --- |
| 12 | An image tool's new animation feature and a web editor "worked surprisingly well" | `[00:02:58]`, `[00:02:33]` | Vendor movement with no application in this corpus citing either tool; nothing to reset, nothing to land |

## Boundaries recorded, not linked

`movement-motivation` owns camera stillness ("locked-off is a decision, and models
need it named"; "if nothing in the beat changes, hold still") and `motion-intent-
authoring` owns near-stillness as authored intent ("almost still: the horizon drifts
a fraction right"). Amendment 2 sits on the *performer* channel between them and
names both in prose. The three are one finding seen from three channels; a later run
should not re-litigate which file owns it.

## Run facts

0 siblings at claim and at Phase 9. 0 of 3 fetches - sixteenth consecutive
corpus-internal run, as the class predicts. `index.json` and `catalog.json`
regenerated under the lock; no sibling content was uncommitted in the checkout, so
both are committed with this run's content. `directions=n/a` - a video carries no
design record, no routing count, no handoff. Scratch directory `intake-EdCUpP4`
deleted by name.
