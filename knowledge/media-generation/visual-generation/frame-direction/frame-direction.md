---
layer: golden-path
type: golden-path
subject: frame-direction
status: forged
use_when: [deciding what appears on screen for each narration beat, reviewing generated scene specs for a narrated video, designing the script-to-frames handoff in a video pipeline, diagnosing a cut that feels like a slide deck]
techniques:
  - visual-function-vocabulary
  - one-function-per-visual
  - plate-elements-text-split
  - motion-intent-authoring
  - motif-establish-vary-payoff
  - per-beat-rejection
---

# Frame direction

Frame direction is the job of deciding **what a viewer is looking at while a
sentence is spoken**. It is not illustration. Illustration answers "what does
this sentence mention?"; direction answers "what should the viewer's eye be
doing while this sentence lands, and why?" Those are different questions, and
the second is harder, because its answer depends on the beat's role in the
argument, on the frames around it, and on motifs the cut established a minute
earlier. A directed frame carries the beat's *specific* argument in shape. The
working test is unforgiving: **if the picture would serve equally well under a
different beat, it is the wrong picture** — however handsome it is.

The subject covers the vocabulary for saying what a picture *does* (not what
it depicts), the discipline of one job per frame, the epistemic split between
what a generative model may draw and what deterministic code must draw, the
authoring of motion as intent, the management of visual motifs across a whole
cut, and the validation posture that keeps a machine-directed run honest
without throwing away its good work.

## The two failure modes, and why they are opposites

Every naive frame-direction system collapses into one of two attractors, and
they sit on opposite sides of the correct behaviour.

**The narrated slide deck.** A template per rhetorical role: every "turning
point" beat gets two opposed arrows, every hook gets a line chart, every
mechanism gets the same cycle diagram. It is fast, it is consistent, and it
produces narration laid over a deck — the exact artifact the medium exists to
be better than. The diagnostic tell is swappability: if you can exchange the
visuals of any two beats of the same rhetorical kind and nobody would notice,
the direction is template output. The template failed because it keyed the
picture to the beat's *category* instead of its *argument*.

**The literal noun illustration.** The opposite reflex: draw whatever noun the
sentence mentions. The script says "reservation book", so the frame shows a
reservation book. This fails twice. First, nouns are not arguments — the beat
about the reservation book is arguing that a booking is not a meal, and the
noun alone carries none of that. Second, and more mechanically: nouns are
**text magnets**. Ask a diffusion model for a named object and it will
helpfully write the name on it — a defect measured to leak across every style
tested. Shapes do not attract glyphs; named objects do. Describing what the
shapes *do* rather than what the objects are *called* avoids both failures at
once.

The correct behaviour between the attractors: derive the picture from the
beat's function in the argument, then express it as form. "Two stacks of
discs, the left twice the height of the right, the right visibly toppling"
carries a specific claim about relative magnitude and instability. "A company
balance sheet collapsing" is a noun phrase waiting to grow a caption.

## Direction is a layered contract, not a prompt

A directed frame decomposes into layers with different authors and different
epistemic standing, and the decomposition is the load-bearing structure of the
whole subject:

- **The plate** — what a generative model draws. Shape, colour, atmosphere.
  Never text, never a checkable quantity. It carries the *shape* of the
  argument.
- **The elements** — geometry drawn by deterministic code because it means
  something: the arrow that reverses, the bar whose height *is* the magnitude.
- **The texts** — also code-drawn: an orienting kicker, a short caption, and
  figures that must each cite the sourced fact behind them.
- **The motion** — what the plate does over the beat's duration, authored with
  the composition even when no renderer exists yet, because a move decided
  apart from the composition fights it.

The split is epistemic, not aesthetic: **if a viewer could check it, code
draws it; if it only has to feel right, a model may.** A plate never contains
a number — it contains the shape of the number, and the figure layer states
it, bound to its source. This single rule resolves most arguments about where
a given mark belongs.

## The director sees the whole cut

A frame director is handed every beat, and is therefore responsible for the
*arc*, not just the frames. Three obligations follow:

1. **Establish, then vary, then pay off.** A motif introduced early — a
   shape, an axis, a repeated mark — can return at the turning point and mean
   something it could not have meant on first appearance. Motifs are managed
   as named threads with explicit lifecycle operations, so a "change" or a
   "reprise" provably refers to something the viewer has already seen.
2. **The turns are the spine.** The reversal beats should be the most
   visually distinct frames in the cut. If a turn looks like the passage
   before it, the video has no shape — the argument reversed and the screen
   did not.
3. **Quiet beats earn quiet frames.** A question, or a thesis sentence, is
   best served by a frame that refuses to compete with it. Density everywhere
   is density nowhere; near-emptiness is a direction, chosen and written down,
   not an omission.

Neighbour-variation is the local form of the same duty: a director who can see
the previous and next frame must change camera, count, or axis when a
composition repeats one of them. A cut is a rhythm, and three centred
symmetrical frames in a row is a stall.

## The division of labour with the script

Direction sits between a script step (which knows what each beat argues) and a
rendering step (which knows how to make pictures). The boundary is a genuine
contract with obligations both ways, and eroding it in either direction is a
named failure:

- The script step assigns each beat a **visual function** — what the picture
  must *do* — plus the material it may draw on and any precision limits
  inherited from the evidence. It does not describe appearance. A function
  statement reads like a note to a collaborator; a good smell test is whether
  it contains any adjective about appearance. If it does, it is a generation
  prompt with the syntax removed, and it will not survive a change of
  rendering model.
- The rendering step decides freely how many stills discharge each
  obligation, all composition and style — but it may not change a beat's
  function unilaterally (that is a script edit), may not exceed a precision
  limit because a cleaner chart looks like better work, and may not silently
  downgrade an unrenderable beat to background texture. Unrenderable beats
  surface as escalations, so the script can be rewritten rather than shipped
  weak.

The most important consequence of this split: budgets that live at the script
level — such as a cap on metaphors per video — are invisible to a rendering
step that only sees one beat at a time. A renderer left to its own judgment
will invent a metaphor for every hard beat, because that is what makes a good
picture, and it will blow the cap silently. Function assignment upstream is
what makes the budget enforceable at all.

## Validation is per beat, and it measures rather than opines

Machine-directed runs need a gate, and the gate needs two properties. First,
**granularity**: rejection is per beat, never per run. One malformed scene is
dropped, reported with its reason on its own row, and every other scene is
applied — fifteen good scenes are worth having when the sixteenth never
arrived, and a rejected beat keeps whatever it had before, which is usually
the template output the pass exists to replace. That asymmetry is itself a
pressure toward care: a doubtful choice costs one beat; sixteen careless ones
cost the run. Second, **restraint**: the validator enforces only what has
been measured to be a defect — text requested of the generative layer, a
figure with no cited fact, a motion that merely restates the subject. It does
not enforce taste it cannot measure; a validator built on an impression
rejects good direction with total confidence.

## What a principal practitioner holds true

- The unit of direction is the beat's argument, not its nouns and not its
  rhetorical category. Both attractors are category errors in opposite
  directions.
- Form-only description is not a stylistic preference; it is the mechanism
  that keeps glyphs out of generated plates and arguments in them.
- A frame with nothing new on it can be the strongest direction in the cut —
  provided it is a decision, written as one.
- Direction that names a specific rendering technology, or an appearance
  adjective, has leaked downstream concerns upstream and will rot at the
  first model change.
- The whole cut is the design surface. Frame-local excellence with no thread
  management produces thirty good pictures and no film.
