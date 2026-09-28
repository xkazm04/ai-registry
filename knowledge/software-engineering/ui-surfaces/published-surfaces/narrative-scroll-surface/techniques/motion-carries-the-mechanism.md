---
layer: technique
type: technique
subject: narrative-scroll-surface
technique: motion-carries-the-mechanism
status: forged
laws: [derivation-names-recomputation, deletion-is-not-repair]
shared_with: []
use_when: [animating how a process works rather than revealing a finished picture, an explainer animation shows steps that overlap wait or block, deciding what a mechanism animation shows under reduced motion or as a still, exporting an explainer animation to video or a filmstrip, having a model author the same explainer in several art styles]
---

# Motion carries the mechanism

Most motion on an explanatory page reveals something: a mockup rises into
place, a figure counts up, a station grows as the reader reaches it. The
payload of that motion is its last frame, and the rest of the gesture is
delivery. A second kind of motion exists, and it is the reason explainers
animate at all: motion whose payload is **the trajectory itself**. A parser
stops while a second reader runs ahead of it. Three downloads overlap, and a
fourth starts only after the first one finishes. A message leaves one box and
arrives in another. In these the order, the overlap and the waiting *are* the
explanation, and the final frame usually shows none of them: every download
finished, every cursor at rest, everything delivered.

This technique is for that second kind. Its sibling
[illustration-carries-the-claim](./illustration-carries-the-claim.md) asks
whether a *picture* would change if the claim were false. This one asks the
same question of *time*.

## The timeline is a claim

An animation that shows a process makes temporal claims whether its author
meant to or not: that A starts before B, that B and C run at once, that D
waits for A to finish, that nothing happens during a pause. A reader takes
every one of them as a statement about the mechanism, because that is what an
explainer is for.

The litmus: **if the mechanism behaved differently, would the motion be
different?** If the downloads were sequential, would the bars stop
overlapping? If the second reader did not exist, would anything run ahead
while the first one stopped? Motion that passes carries the mechanism. Motion
that would look the same either way is decoration, however well it moves.

Three rules keep the timing faithful:

- **Every overlap, order and wait on screen is true of the mechanism.** A
  staggered entrance applied to steps that actually happen at once teaches a
  sequence that does not exist. A convenient simultaneity applied to steps that
  actually wait teaches the opposite. Timing borrowed from the product's
  entrance vocabulary is the most common way this goes wrong, because those
  presets stagger by default.
- **Ornamental physics implies behaviour, so it is spent carefully.** An
  overshoot says the thing went too far and came back. A bounce says it was
  stopped by something. On a gesture that means "this arrived", both are
  harmless. On a gesture that means "this is what the system does", they are
  claims the system does not make.
- **Compressed time is labelled as compressed.** A process that takes
  milliseconds shown over two seconds is fine and expected. Relative durations
  are what the reader reads: if one stage is drawn three times longer than
  another, the reader learns that it *is* three times longer. Scale all stages
  together or say which ones were not.

## Give time an axis, and any frame explains

The strongest single decision in a mechanism explainer is to **put time on a
spatial axis somewhere in the art**: a waterfall of bars against a time scale,
a track the actors move along, a spine the steps hang from. Motion then writes
the trajectory into space as it plays, and the order, overlap and waiting stay
readable after the motion has stopped.

This matters because most readers of an explainer never see the motion:

- the thumbnail, the link preview and the slide screenshot each take one frame;
- a reader with reduced motion has asked for no travel;
- a reader who scrolls past at speed sees two frames.

An explainer with a time axis serves all of them from its last frame. One
without an axis serves none of them, and its only honest degraded form is a
sequence of frames. When a loop shows a *flow* rather than a sequence, the
same move applies: draw the path with its direction marked, so the still
frame says where things go even though nothing is going there.

## The beat list is the single source

A mechanism explainer is a small, ordered list of **beats**: numbered states,
each with a title, a caption stated as real text, and the values every actor
holds at the end of the beat. The animation is a pure function from time to
state, interpolating from one beat's values to the next. Nothing in the art
runs on a clock of its own.

Everything the explainer needs then derives from the one list, and nothing
maintains a copy of it
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)):

| Derived form | How it is made from the beat list |
| --- | --- |
| Live playback | render(t) on each frame, t advanced by a clamped clock |
| Step and scrub | render(t) at a chosen t, driven by the reader |
| Filmstrip | render(end of beat k) for every k, side by side, numbered, captioned |
| Frame-exact video | render(i / fps) for i = 0..N, captured, encoded |
| Captions and transcript | each beat's caption, in order |

The reason this is a rule and not an implementation preference is that the
other ways of animating break at least one of those rows. Gestures started by
state changes and left to run on their own timing can be watched, but they
cannot be scrubbed to a moment, laid out as stills, or captured frame by frame.
A screen recording of them drops and duplicates frames according to the
machine's load. An explainer built that way has one form, the live one, and
every other reader gets a copy that was never checked.

A pure function also makes the explainer testable in the one way that matters
here: render each beat's end state and check that the claim is visible in it.
That is a check on the claim, not on the motion.

## The reader operates it

A mechanism explainer is short, dense and usually watched more than once. It
owes the reader:

- **Step controls and a readout that names the step**, not only a play
  button: "Step 3 of 7 · The scanner reads ahead". A step is something the
  reader may want to stay on.
- **Scrubbing**, because the moment that matters is usually a transition
  between two beats, and the reader should be able to hold it.
- **One autoplay at most**, when the explainer first becomes visible and only
  if the reader has not asked for reduced motion. It plays to the end and
  stops. A mechanism explainer that loops keeps moving whether anyone is
  watching and owes a stop control for as long as it runs.
- **The filmstrip as a first-class view**, not only as a fallback: a reader
  comparing two steps wants them side by side, and under reduced motion the
  filmstrip is the default.

## The art style is a skin over the beats

Once the beat list owns time and the engine owns the geometry of movement,
**the art style owns paint and nothing else**. A style is a drawing of the
same actors at the same fixed positions, bound to the same state values by
role: this group is the parser, this bar is the third download, this mark
appears when the scanner finds something. Swapping the style swaps every
colour, line, texture and typeface. It cannot change the order, the overlap or
the timing, because it never sees them.

That separation makes new styles cheap and makes them safe to delegate. It
also makes it possible to produce one explainer in several visual registers,
for a playful onboarding surface and a sober reference page, without
re-deriving or re-checking the claim each time. Three conditions make it hold:

- **The contract states budgets in the units the style works in.** A style
  author told "keep the line inside the panel at a readable size" will choose
  the size and discover the width does not fit. Give the characters-per-width
  budget directly. Give the travel range of every moving element so a label
  attached to it can be placed to fit the whole range.
- **The style may not animate anything itself.** No transitions, no keyframes,
  no in-document animation elements, no script. A style that adds its own
  shimmer has added a clock the filmstrip and the video cannot reproduce.
  Texture, noise and glow sit on static layers only. A filter re-rasterized
  under a moving element every frame is the most expensive thing on the page.
- **Every style is checked by rendering it at every beat.** Automate two
  checks: every required role is present, and the page raised no errors. A
  person or a model then looks at the rendered beats for overlap, clipping and
  contrast. A style that passes one beat and fails another is common, because
  actors move into each other's space.

When a model authors the style, the same three conditions are its brief: the
contract, one working reference style to match in structure but not in look,
and a render-and-look loop with a small cap on fix rounds. The model does not
receive the beat list as something it may edit.

## Degraded forms, in order of preference

For a reader who will not see the motion, choose the first that applies:

1. **The last frame, when the art gives time an axis.** It already carries the
   order.
2. **The filmstrip**, when the trajectory lives in positions that the last
   frame overwrites: a cursor that moved, a state that was replaced in place,
   a pause that ended.
3. **The path with direction marks**, when the motion is a continuous flow
   with no beats.

The last frame alone, when nothing in it encodes time, is not a degraded form
of a mechanism explainer. It shows that the process finished, which the reader
already assumed. Choosing it deletes the explanation while keeping the picture
([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair)).

## When not to use this

- **Reveal motion.** An entrance whose last frame says everything is governed
  by the page's reveal and motion-vocabulary rules. Giving it a beat list and a
  filmstrip is ceremony.
- **Processes with no order worth teaching.** If the steps could happen in any
  order and the reader loses nothing by not knowing, draw the finished
  structure and leave time out.
- **Real telemetry.** A surface animating live measurements is showing data,
  not explaining a mechanism. Its timing belongs to the data, and this
  technique's authored beats would falsify it.

## What this technique refuses

- An explainer whose overlap, order or waiting is not true of the mechanism it
  explains.
- Timing borrowed from an entrance preset for steps that happen at once.
- An explainer that can only be played live: not scrubbable, not steppable, not
  reproducible as stills or as a frame-exact capture.
- A caption, step name or number that exists only inside the art.
- A mechanism explainer that loops without a stop control.
- A style that runs its own clock, or puts a filter on a moving element.
- A reduced-motion form that shows only the finished state when that state
  encodes no time.
