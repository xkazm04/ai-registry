---
layer: technique
type: technique
subject: motion
technique: gesture-decomposition
status: forged
laws: []
shared_with: []
use_when: [a prototype video arrives and no preset fits it, a gesture needs several properties moving on different curves, deciding what a gesture's input actually is]
---

# Gesture decomposition

The vocabulary says what a preset must **declare**; it does not say how you
arrive at a gesture worth declaring. That gap is where motion systems
quietly lose: a composite movement arrives — as a prototype recording, as a
sentence in a ticket, as something someone can picture and not describe —
and because it matches no existing preset and resists being written as one
curve, it gets authored inline as per-component keyframes. The vocabulary
did not fail to cover the case; nothing owned the step where a movement
becomes a candidate for the vocabulary at all.

That step is mechanical, and it runs before any curve is chosen.

## Every animation is a graph, and the first question is its input

An animation is one thing: a value changing as a function of some input.
Drawing it makes the design tractable — the vertical axis is the property,
and the horizontal axis is **the input, which is not necessarily time**.
Naming that input is the first decision, because it constrains every
decision after it:

- **Time-driven.** The gesture advances on its own once started; the input
  is elapsed time. Entrances, settles, success gestures, ambient life —
  the class the rest of this subject is largely written for.
- **Value-driven.** The input is a quantity the user moves continuously:
  scroll offset, pointer position, drag distance. The gesture has no
  duration and no beginning or end of its own; it is a pure mapping, and
  the user is the clock.
- **Event-driven.** A trigger selects a new target and the transition
  between targets is itself usually time-driven. A hybrid, and the one most
  often mis-specified — the trigger gets designed and the transition gets
  defaulted.

The axis is not a taxonomy for its own sake. It decides which engines are
eligible ([engine-selection](./engine-selection.md)), whether the gesture
can even declare a duration
([preset-vocabulary](./preset-vocabulary.md)), and whether one-shot policy
applies to it at all
([unprompted-motion-lifecycle](./unprompted-motion-lifecycle.md)). A team
that skips this question answers it by accident, in code, once.

## Split the graph before choosing a curve

Complex movement resists a single expression, and the reflex — reach for a
physics simulation and let the movement emerge — trades one problem for a
worse one. Simulation produces a plausible whole and **no handle on any
part of it**. The alternative is to cut the graph into segments, each of
which is simple, and design them independently: a marker that drops,
bounces twice and settles is four short graphs joined end to end, not one
equation.

The payoff is tunability, and it is worth stating plainly because it
inverts a common instinct: **natural is not the goal, intended is.** A
physically faithful bounce and a designed bounce differ, and the designed
one is usually what was asked for — the second bounce deliberately lower
than physics would make it, the final settle deliberately softer. Only a
segmented graph gives you somewhere to make that edit. A simulation gives
you constants to perturb and a result to re-judge in full.

## Three ways the pieces assemble

Once a gesture is in pieces, exactly three patterns put it back together,
and they are composable within one gesture:

- **Sequencing along the axis.** Pieces placed in order on the input axis.
  Placement is itself a design choice rather than a consequence: strictly
  sequential; **overlapped**, where the next piece begins before the
  previous one finishes, which is what removes the visible seam between
  them; simultaneous on different properties; or staggered across sibling
  elements. Overlap is the default worth defending — back-to-back segments
  read as a stutter at every joint.
- **State transition.** Pieces selected by a **condition** rather than by a
  position on the axis. Each state names what it changes, the graph it
  changes on, and — non-negotiably — the condition that exits it. This is
  the pattern for gestures whose timeline genuinely cannot be known in
  advance: physics-carried motion, user-steered motion, anything whose next
  phase depends on what the current one produced.
- **Property separation.** One gesture, several properties, each on its own
  **independent track** with its own curve and its own timing, none of them
  aware of the others.

The discriminator between the first two is one question: does the next
piece begin at a **place on the axis**, or on a **condition being met**?
Knowable in advance means sequencing; not knowable means state transition.
Choosing sequencing for a gesture whose duration is emergent is how
products end up with a hard-coded delay that is wrong on slow devices.

## Property separation is the common case

The pattern most often skipped is the one most often needed. A card
becoming selected does three things at once: its border takes on the
selected color, its size lifts slightly to claim emphasis, and a detail
region opens. Those are three different communicative jobs with three
different characters — the border wants to be quick and flat, the lift
wants weight, the disclosure wants to be unhurried enough to read. Fusing
them into one duration and one curve serves none of them, and the result is
the specific mediocrity of a gesture that is not *wrong* anywhere and not
right anywhere either.

Independent tracks also make the gesture editable by someone who did not
write it: **each track can be retuned without reading the others**, and a
fourth property can be added without renegotiating the three that exist. It
is the same argument the vocabulary makes for presets over inline
keyframes, applied one level down, inside a single gesture.

## What decomposition hands to the vocabulary

The output of this step is a preset proposal complete enough to argue
about: the gesture's **intent**, its **input axis**, its **tracks**, each
track's curve and timing (or its physics parameters, where the track is
continuous), the **transition conditions** where the gesture is
state-based, and the reduced-motion fallback designed alongside rather than
after. That is the form [preset-vocabulary](./preset-vocabulary.md) can
accept or reject on its merits.

A gesture that cannot be written in that form is not thereby disqualified —
it is evidence about the engine. Movement that resolves into neither
tracks nor states, because it is continuous character work or dozens of
interlocking layers, is the signal to stop authoring and export, which is
the fourth engine in [engine-selection](./engine-selection.md).
