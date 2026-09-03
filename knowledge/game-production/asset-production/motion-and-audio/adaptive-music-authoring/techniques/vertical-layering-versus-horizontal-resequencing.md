---
layer: technique
type: technique
subject: adaptive-music-authoring
technique: vertical-layering-versus-horizontal-resequencing
status: forged
laws: [a-budget-shapes-the-output, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [choosing how a piece of content should adapt, a layered score cannot change key or cadence, a segmented score costs more transitions than anyone can compose]
---

# Vertical layering versus horizontal resequencing

## The concern

There are two mechanisms for making music respond to a game and everything else is a
combination of them. Teams treat the choice as stylistic, decide it by whichever the
composer last worked with, and then spend the project fighting a cost curve they did not
choose. The choice is not stylistic. The two forms answer different questions, and their
costs run in opposite directions.

## Vertical layering

Several parts of one piece run simultaneously, in sample lock, and their gains move. Drums
enter as the fight starts; strings drop away as it calms; the texture thickens and thins
continuously.

**What it requires.** Every layer in a set is rendered from one session at one tempo with
one grid, and every layer has an **identical sample count**. A set whose members differ by
a handful of samples drifts apart over minutes of play, and there is no runtime fix once it
has shipped. Layers start together from one clock and keep running; a layer that was
stopped cannot be restarted in phase, so "muted" means gain at silence, not stopped.

**What it costs.** A voice and a stream per layer, at all times, including the silent
ones. Memory and streaming bandwidth scale linearly with layer count. Authoring cost is
roughly constant in the number of game states, because adding a state usually means adding
a threshold rather than composing new material.

**What it can do that resequencing cannot.** Respond on any frame, with no wait. A gain
ramp needs no musical boundary — that is the entire point of the form, and quantizing a
layer ramp throws it away while still paying for it.

**What it structurally cannot do.** Change key. Change theme. Cadence. Resolve. Layering
varies density and colour over a fixed harmonic bed; if the bed must change, no amount of
layering will change it, and a score that tries reads as one long piece that gets busier
and quieter forever.

**Where it goes wrong.** Layers separated out of a finished mix rather than composed to
stand alone. Muting the drum layer of such a set does not produce a calmer arrangement, it
produces the same arrangement with a hole in it, because the remaining parts were
performed and mixed to sit against a drum part that is now absent. This is the single most
common defect in machine-generated layer sets, and it is invisible in the full mix — the
only audition that catches it is auditioning the *subsets*.

## Grid alignment is not phrase alignment

The rule that a silent layer keeps running has a tempting escape: demand-load the layer
when its tier is entered and start it on the next bar boundary, saving its stream and its
voice for the whole time it is unheard. This is a real option and it has a real cost that
is easy to miss, because the result is *grid-correct*. The new layer's downbeat lands on
the bar; nothing is out of time.

It is nevertheless in the wrong place in the form. The layers already sounding are three
bars into an eight-bar phrase; the newcomer is at its own bar one. Its cadences, its
harmonic motion and its arrival points are now offset from everyone else's by five bars,
permanently, until something restarts the set. In material with a strong phrase shape this
is instantly audible and sounds like a mistake nobody can find, because every individual
event is on the beat.

Three ways out, and the choice is a composition decision, not an engineering one:

- **Keep the layer running silently.** Costs the voice and the stream; phrase alignment is
  free and permanent. The default.
- **Start the newcomer at the shared loop origin**, meaning the tier can only be entered
  once per loop cycle. Saves the resource; costs response time up to a full loop, which for
  an eight-bar loop is far outside any attribution window.
- **Author every bar to be interchangeable** — no phrase shape, no cadence, no arrival
  points. Then bar alignment *is* phrase alignment and demand-loading is free. This is a
  severe constraint on the writing and it must be a stated brief, not a discovery.

## Horizontal resequencing

Composed segments are chosen and transitioned between: exploration gives way to combat,
combat resolves to a victory cadence, a boss reveal interrupts everything.

**What it requires.** Per segment: entry points, exit points, and a declared meter. Across
segments: a transition matrix saying which segment may follow which, on what boundary,
with what overlap, and through what connecting material if any.

**What it costs.** One voice, plus the overlap during a transition. Memory scales with the
number of segments but only the active one streams. Authoring cost grows with the *square*
of the segment count in the worst case, because every permitted move is a composed
transition somebody writes. Five segments fully connected is twenty transitions; ten is
ninety. This is the cost that surprises teams, and it surprises them in the last month.

**What it can do.** Everything layering cannot: modulate, cadence, change theme, end.

**Where it goes wrong.** The matrix is left implicit and each transition is improvised in
integration code, so nobody can say which moves are legal, and the illegal one ships
because no one enumerated the legal ones.

## The decision rule

**When the state change is one of magnitude, layer. When it is one of kind, resequence.**

Magnitude is continuous and additive: more enemies, less health, closer to the thing you
are afraid of, deeper into a wave. The music should move continuously with it, and a
continuous change is what gain automation is.

Kind is discrete and structural: a different place, a different act, a boss revealing
itself, a fight that just ended. A change of kind wants a cadence, and gain automation
cannot cadence.

**When both, do both.** Resequence between sections and layer within them. That two-level
structure is what most shipped adaptive scores actually are, and it is worth adopting as
the default rather than arriving at it after two rewrites.

A second rule handles the budget, which is where the first rule gets overridden by
reality: **layering costs voices and memory linearly and authoring constantly;
resequencing costs authoring quadratically and voices constantly.** So a project with a
tight playback reservation and many discrete states resequences; a project with headroom
and one continuous driving state layers. The reservation is an instruction about the
target, not a ceiling to approach
([a-budget-shapes-the-output](../../../../_laws.md#a-budget-shapes-the-output)) — being told
four layers up front produces a different and usually better arrangement than being told
twelve and cut to four in integration.

## The hybrid's hidden constraint

Layering across a segment boundary — holding a pad through a transition while the segments
change beneath it — requires both segments to share a grid. Do that in more than one place
and the whole score is quietly locked to one tempo and one meter, which is a large
compositional decision that nobody made deliberately. State it up front: either the score
has one tempo and cross-segment layers are available, or segments may differ in tempo and
every transition is a clean handover. Both are fine. Discovering which one you chose in
month nine is not.

Where tempo does vary between segments, every duration crossing a boundary — an overlap, a
fade, a hold — carries **both** its musical value and its wall-clock value at the tempo it
was authored against
([a-number-carries-its-unit-and-basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)),
because a two-beat crossfade authored at one tempo is a different amount of time at
another and will straddle a downbeat at exactly one of them.

## When not to use either

A context with a single fixed state — a menu, a credits roll, a fixed cutscene — needs no
adaptation. Building a layer set or a segment matrix for it is ceremony that a later
maintainer will read as intent and preserve forever. Deliver one piece with a loop
contract and say in the declaration that it does not adapt.
