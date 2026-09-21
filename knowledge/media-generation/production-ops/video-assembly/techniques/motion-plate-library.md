---
layer: technique
type: technique
subject: video-assembly
technique: motion-plate-library
status: forged
laws: [cost-per-usable-output, edit-do-not-regenerate, style-is-restated-not-remembered]
shared_with: []
use_when:
  - a motion sequence will be reused across projects with different subjects or looks
  - sourcing a shot whose choreography is known but whose appearance is not final
  - a recurring shot class (product turn, drive-by, fight beat) is regenerated from scratch every project
  - deciding whether to generate a styled shot fresh or restyle an existing animation
---

# Motion plate library

Animation craft has always split motion from appearance: the layout reel and
the animatic decide what moves and how, long before final surfaces exist.
Generation pipelines collapse that split by default — every request asks for
choreography and appearance in one roll, so both are re-sampled together,
and a shot whose motion was already right is re-rolled entirely to fix its
look. The technique restores the split as a sourcing channel: **author the
motion once, as an appearance-free plate; bank it; bind appearance at use
time by restyling the plate with reference images.**

## The plate

A motion plate is a clip generated to carry *only* choreography, camera and
timing. Its brief strips appearance on purpose — minimal detail, flat
near-white surfaces, no materials, no lighting design — because everything
the plate does not specify is free for the binding pass to decide. Two
properties follow:

- **It is cheap by construction.** An appearance-free clip survives the
  lowest render tier, since the only judgments made against it are motion
  judgments; fidelity spent on a plate is fidelity spent on nothing.
- **It is reusable by construction.** A drive sequence with no car brand, no
  landscape and no palette fits every future project that needs a drive;
  the same plate has carried a rally car, a comically tiny buggy, and an
  armoured vehicle, because nothing in it said otherwise.

Plates come from four sources: a from-scratch brief in the stripped idiom;
an accepted styled clip whose motion earned reuse, normalized down to a
plate; **live footage** — a real recorded sequence run through the same
normalization, which imports real-world camera physics and blocking into
the library at the price of one conversion; or a **built previz** — a
blockout staged in an actual 3D scene, with the camera path and subject
motion authored to real numbers (height and offset in meters, travel at a
human pace over stated seconds) and the viewport render used as the plate.
Building is the only source that makes the motion *exact* rather than
sampled: the camera flies the path that was typed, to the meter — and with
a language model driving the 3D tool, the blockout costs a prompt, not a
modeling session. State every number in that prompt; a blockout is worth
building precisely because it leaves nothing to guess.

## The binding pass

At use time, the plate plus the project's reference images — subject sheets,
location, style — go to a video-editing generation that repaints the plate's
frames while keeping its motion. The plate answers *what happens and when*;
the references answer *who and how it looks*; the restated style and
identity blocks travel with the call like any other, because a plate is not
a style carrier and never exempts the contract. The bound output can depart
in shape from what the plate showed — a replacement subject need not match
the silhouette of the original — and the motion still transfers, which is
what makes the library general rather than a collection of templates.

## Library discipline

- **The plate is the asset; the bound render is the disposable.** Human
  acceptance of the motion is what promotes a clip to the library, and the
  plate then obeys asset rules — kept, versioned, never regenerated when an
  edit would do. Bound renders are per-project output judged per project.
- **File by motion class, not by project.** A plate's identity is its
  choreography — drive-by, product orbit, two-subject fight, destruction
  and rebuild — because that is the axis the next search runs on.
- **Provenance still travels.** The plate's brief (or source footage
  lineage) and the binding call's references and prompt are both part of
  any accepted output's record, exactly as for any sourced shot.

## When the plate was built, the scene is the asset

The library discipline above was written for plates that arrive *sampled* — a
clip briefed from scratch, a styled roll normalized down, converted footage.
For those the render genuinely is the asset, because nothing upstream of it
exists to keep: the brief and the seed reproduce the sample, and there is no
representation of the move to hold on to. A built blockout is the one source
where that stops being true, and banking it the same way silently demotes it
to the class it was built to escape.

The distinction is not reproducibility. A sampled plate with its brief, its
seed and its engine recorded *is* reproducible — re-running the record returns
the same frames. What a sampled plate can never be is **editable**: "the same
move, a third slower" and "the same move, from the other side" are not
available as changes, only as fresh rolls, and a fresh roll re-samples
everything the brief did not pin. A built plate's scene holds the move as
numbers a person can change, and changing one of them leaves the rest provably
untouched — the same inversion the assembly layer already runs on when it
compiles the cut from a composition instead of banking the render.

So a built plate has two artifacts and they are not interchangeable:

- **The scene is the asset.** It is what is versioned, what an edit names, and
  what the next style pass re-renders from. A library holding only the viewport
  render of a built blockout has kept the output and thrown away the only copy
  of the specification.
- **The render is a derivation, and still worth keeping** — it is what the
  binding pass consumes and what a search of the library actually looks at.
  Keep it beside the scene as a build product, dated to the scene revision it
  came from, never as the thing of record.

The failure is quiet, and it is a library-time failure rather than an
authoring-time one: the blockout is built exactly, the render is filed by
motion class, everyone is satisfied, and the first request months later to
adjust the move finds only frames. The plate is then re-authored from scratch,
at the cost the library existed to amortize.

Two consequences follow. A built plate's **prose is not its specification** —
where a sampled plate's brief is the closest thing to a source it has, a built
plate's prose is a summary of a scene that already states the numbers, and
filing the prose as the record reproduces the sampled case with extra steps.
And a plate whose motion channel is prose in a system that types every
dimension beside it is a built plate in name only: the dimension nobody typed
is the dimension nobody can re-render.

## Decision rules

- When a shot's motion is right and its look is wrong, restyle the clip
  rather than re-roll it — a fresh roll re-samples the half that was
  already accepted.
- When the move is known before it is seen — a specified camera, an approved
  path, a beat that must match a number — build the blockout rather than
  briefing or sourcing one, and bank its scene. Building is the only source
  that admits a later edit; the other three admit only another roll.
- When a motion class recurs across projects, spend one authoring pass on a
  plate instead of paying full-appearance generation per project — the
  plate amortizes; styled rolls do not.
- When a plate candidate exists as live footage, prefer normalizing it over
  briefing from scratch — real blocking and camera carriage survive the
  conversion and are expensive to fake.
- When the bound result must hold a graphic element from a reference (a
  display's contents, markings), say so in the binding prompt explicitly —
  the pass keeps what it is told is load-bearing and repaints the rest.

## When not to use this

A one-off shot with no reuse horizon does not earn the two-pass cost;
generate it styled and move on. Motion whose meaning is inseparable from
its subject — a performance beat written for one character's body and
props — binds poorly to substitutes, and belongs to per-shot sourcing. And
the plate library is not a substitute for the conditioning ladder on shots
that need frame-exact continuity with neighbours: a restyled plate joins
the cut through the same acceptance bar, seams and all.
