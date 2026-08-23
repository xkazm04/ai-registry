---
layer: technique
type: technique
subject: conversation-orchestration
technique: layered-avatar-state-machine
status: forged
laws: [one-authority-per-vocabulary, creation-names-reaper]
shared_with: []
use_when: [a permanent companion presence looks switched off, the face disagrees with the conversation, reduced motion removes the only busy signal]
---

# The presence as layered architecture

A companion that is on screen permanently is looked at permanently, which sets
a bar no static glyph clears: a face that never moves reads as switched off, and
a product whose companion looks switched off is a product whose companion is not
used. The temptation is to solve this with one rich animated component driven
by whatever state is nearby. That produces something that is expensive to
change, impossible to degrade, and — the defect that actually kills it —
frequently out of sync with the conversation it represents.

The standard is **three layers with different costs and different jobs**, and a
**state machine driven by turn events** deciding what they show.

## The three layers

- **The ambient layer** carries the expensive character: the idle motion, the
  breathing, the personality. It is a small set of **pre-rendered loops** —
  produced once, ahead of time, by whatever pipeline the product can afford —
  because generating this quality live on every frame is the single largest
  cost in the presence and the one with the least per-frame variation to
  justify it. Loops are seamless, short, and few; a library of twenty states
  is a library nobody keeps consistent.
- **The reactive layer** is a thin, cheap overlay drawn live on top: the ring
  that pulses while a turn runs, the level that follows the voice, the glow
  that answers a hover. It is the only layer that reacts within a frame of
  anything, and it is deliberately simple enough to be rewritten without
  re-rendering the character.
- **The chrome layer** is ordinary interface on top of both: a badge, a count,
  a status label, an affordance. Everything that must be *read* lives here, not
  in the art — text baked into a loop cannot be localized, cannot be selected,
  cannot be resized, and cannot be announced.

The layering is not organization for its own sake. It is what makes the
presence **degradable**: the ambient layer can be dropped entirely — on reduced
motion, on a constrained device, when an asset fails to load, in a test — while
the reactive and chrome layers keep carrying the information. A presence whose
only channel for "I am working" is an animation has no fallback the moment
animation is off, and reduced-motion users are then the only ones who cannot
tell whether the companion is doing anything.

## The state set is small, named for the user, and has one authority

Name states for **what the user is being told**, not for internal phases:
resting, listening, working, speaking, blocked. Five is a good ceiling. Every
additional state is an art asset, a transition, a test, and one more thing that
can be wrong; a state the user cannot distinguish on sight is not a state, it is
a comment.

That set is a closed vocabulary with exactly one definition
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
consumed by the loop selector, the reactive overlay, the accessible label, and
anything else that cares. The version of this that goes wrong is not exotic: an
extra state added for the loop selector and not for the label, and the presence
now animates something it cannot say.

## Transitions are driven by turn events, not by local flags

The machine's inputs are the same turn lifecycle events the conversation
renders: a turn was submitted, first output arrived, a terminal state was
reached, capture started, speech started. Driving the face from the same source
as the transcript is what guarantees they cannot disagree — and disagreement is
the specific defect that destroys the illusion faster than any missing frame:
the presence idles while the answer is streaming, or keeps working after the
turn ended, and the user learns in one glance that the face is decorative.

Three rules keep the machine well-behaved:

- **Sticky states swap at a loop boundary; one-shot reactions swap
  immediately.** This is the rule nobody anticipates and everybody learns the
  same way. A good ambient loop has an arc — it builds and returns — so
  crossfading out of it halfway shows a pose that only makes sense in context,
  and the user reads it as the video breaking. Track *what is displayed*
  separately from *what the machine wants*, and commit a sticky transition when
  the current loop ends. The exception is a reaction fired at a moment the user
  caused: an answer landing, a message arriving. Those cut in at once, because
  a delayed reaction is not a reaction.
- **Entry is debounced, exit is prompt.** A working state entered on every
  hundred-millisecond flicker of activity is a strobe. Require a short dwell
  before entering an active state, and leave it immediately when the turn
  terminates — the asymmetry matches what the user notices, which is a face
  still working after the answer arrived.
- **Every state has an exit.** A presence stuck in *working* because a terminal
  event was missed is the eternal-spinner defect with a face on it. The machine
  has a timeout back to resting from every active state, and reaching it is
  worth reporting, because the only thing that noticed a lost terminal event is
  the animation.

The loops, timers, media elements and observers the presence creates are reaped
by its teardown
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)), and the
reaping is more aggressive than usual because this component never unmounts.
Three rules earn their keep: exactly one loop is playing and the rest are parked
at their first frame; playback stops entirely while the window is hidden and
resumes on return; and the presence is mounted at one size in one place rather
than twice at different sizes, because a second decoder for a decorative copy is
the whole cost again for none of the value.

## The legibility floor

Whatever the art does, these hold:

- The presence's state is available as **text** — a label, a title, a status
  line — so "working" survives the loss of the animation that usually carries
  it, and so a reader that cannot see the face is not excluded from the one
  signal that says whether the companion is alive.
- Motion respects the platform's reduced-motion preference **by falling back to
  a still frame plus a legible state indicator**, never by falling back to
  nothing. Reduced motion is a request to stop moving, not a request to stop
  informing — and the fallback is a real fallback: mount no moving media at all
  rather than mounting it and hiding it, so the preference also buys back the
  decode.
- **A named state with no art is a bug, not a feature.** Where the state set
  outgrows the loops, the honest choices are to render the nearest loop *and
  keep the state's own text label accurate*, or to drop the state. What must
  never happen is a state that exists in the vocabulary, cannot be seen, and is
  also not announced — that is a distinction the product believes it is making
  and the user cannot perceive.
- The presence is never the only path to anything. It is an indicator and an
  entry point; every action reachable through it is reachable elsewhere.

## When not to use this

- **When the companion is not permanently visible.** A presence that appears
  only inside its own panel does not need ambient life; a busy indicator is
  enough, and the whole loop pipeline is unearned cost.
- **When the product cannot produce or maintain the assets.** Two well-made
  loops beat six bad ones, and one still frame with an excellent reactive layer
  beats a stuttering character. Choose the layer you can execute.
- **When the state cannot be derived from real events.** A face animated on
  guesses is theater, and it will contradict the conversation on the first turn
  that behaves unusually.
