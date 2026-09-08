---
layer: technique
type: technique
subject: narrative-scroll-surface
technique: scroll-bound-progression
status: forged
laws: [creation-names-reaper, deletion-is-not-repair, limits-are-derived]
shared_with: []
use_when: [an entrance animation plays on a timer and is always at the wrong moment, a station should grow as the reader reaches it, scroll-driven motion strobes on a fast wheel, a scaled element overlaps its neighbour at peak]
---

# Scroll-bound progression

The motion on an explanatory page is a function of the reader's scroll
position, not of a clock. Every gesture takes a single input — *how far
through this station is the reader* — and every visible property is a curve
over that input. Nothing starts, nothing finishes, nothing has a duration. The
reader moves, and the page moves with them.

## Why the clock is always wrong

A timed entrance fires when its trigger fires and then it is over. The reader
arrives at the station some time later, or some time earlier, and the two
events are related only by chance. On a fast scroll every station's gesture is
finished before it is seen; on a slow one every gesture is finished before it
is reached. The page's most expensive craft plays to an empty room, and the
defect is invisible to its author, who scrolls at the one speed that happens
to work.

Binding to position removes the failure by construction: the peak of a
station's gesture *is* the reader's arrival, because it is defined as that
position rather than triggered near it. Two properties follow that no timed
animation can buy. The motion is reversible — scrolling back plays it
backwards, which is what a reader re-reading expects. And it is operable — the
reader controls the rate, so the page responds rather than performs.

## Progress is per station, not per page

The input is **the station's own progress**: a normalized value that is zero
before the station is anywhere near the reading position, one at some point
after, and continuous between.

A page-level progress value — how far down the whole page the reader is — is
the wrong input and is the commonest early mistake. Fed to a station, it makes
every station move at once, in lockstep, at a rate set by the page's total
length. Add a station and every existing gesture retunes itself. The page is
one animation with N copies of it rather than N stations each responding to
their own reader.

Page-level progress has exactly one legitimate consumer: a page-level readout
— the painted portion of the spine, a progress bar. Even there its predicate
matters: progress through the *sequence*, measured from the first station to
the last, not through the document, or the readout is at ninety percent while
the reader is mid-argument with a footer below them.

## The envelope: in, peak, out

The gesture's shape over station progress is **not a ramp**. A ramp — start
small and dim, end large and bright, stay there — leaves every station the
reader has passed at full volume behind them, so the page accumulates shouting
and the reader's own position is the one thing the page does not indicate.

The standard envelope has three phases:

- **In.** Entering from below: reduced scale, reduced opacity, slight offset.
  The station is visibly *approaching* rather than merely present.
- **Peak.** At the station's reading moment the station is at full scale, full
  opacity, no offset. This is the anchor of the whole technique: the peak is
  placed at the position where a reader would actually be reading the station,
  which is not the moment it enters the viewport and not the moment it is
  centred by an arbitrary measure — it is where the station's claim sits in
  the comfortable reading band, above centre.
- **Out.** Leaving upward: recede. Slightly smaller, slightly dimmer, never to
  nothing. The receding station is still legible — a reader who glances back
  must be able to read it — but it has yielded the page to the one below.

The out phase is what makes the page feel like it is being read rather than
being assembled, and it is the phase almost every implementation omits,
because omitting it looks fine while you are scrolling downward for the first
time.

## Smoothing, because raw position is not a smooth signal

Scroll position arrives coarsely and unevenly: a wheel notch is a jump, a
trackpad fling is a burst, a keyboard page is a discontinuity. A property
mapped directly onto raw progress inherits all of it, and the page strobes on
exactly the input a reader is most likely to give it.

The fix is to drive the visible properties from a **smoothed** value that
follows the raw progress with a spring-like lag, rather than from the raw
progress itself. Two consequences worth knowing before tuning: the smoothed
value overshoots slightly at a direction change, which reads as liveliness and
is desirable; and it never quite reaches its target, so nothing may be gated
on the value having *arrived* at an exact endpoint.

Tune the lag by feel and then state it once, centrally. A stiffness number
inlined per component is how a page ends up with six subtly different
personalities.

## Different weights get different curves

Within one station, elements do not all deserve the same gesture. The
evidence — a large illustration — carries most of the visual weight and can
afford a slower, larger movement; the claim needs to become readable early and
stay readable; a small marker or numeral can be crisper and faster.

Giving each its own curve over the same station progress is what makes a
station read as one thing arriving rather than one block sliding. Giving them
each their own *input* is not: they must all be functions of the same station
progress, or they desynchronize and the station comes apart. One input,
several curves.

The cheapest way to hold that discipline while still differentiating is to
vary **one number** between the columns and keep everything else identical —
the same progress input, the same keyframe positions, the same smoothing — so
that only the peak value differs. The in-ramp and the recede keep their shape
by construction, and the difference between the two columns is a single value
a designer can argue about. Two independently authored curves over the same
station drift apart at every subsequent edit, and the drift shows up as a
station whose halves arrive at slightly different times, which reads as
sloppiness with no identifiable cause.

## Transform-only, and the collision it does not prevent

Confine the animated properties to those that do not force the page to
recompute its layout — position offsets, scale, opacity, all of which the
compositor can handle. This is standard performance hygiene and the motion
system owns the general rule.

What is specific to this technique is the failure that hygiene *creates*. An
element scaled beyond its resting size does not push its neighbours — that is
the point — but it does **paint outside the space it was measured in**. On a
two-column station, an illustration peaking above its rest size grows into the
gutter and, if the gutter is narrower than the growth, into the copy beside
it. Nothing reflows, nothing errors, no test fails; the page simply has
overlapping content at the exact scroll position where the reader is looking
at it, and only at that position, which is why it survives review.

So a peak above rest size is a **derived** number, not a chosen one
([limits-are-derived](../../../../_laws.md#limits-are-derived)): the maximum
overshoot is the measured gutter divided by half the element's width, at the
narrowest viewport where the two-column layout still applies. Measure it, write
the derivation beside the number, and re-check it when the column widths
change. A peak factor picked because it looked good on one screen is a
collision waiting for a narrower one.

## The reduced-motion collapse resolves; it does not hide

A reader who has asked for reduced motion gets every station at its **peak
state** — full scale, full opacity, no offset — with no dependence on scroll
at all. The whole page is simultaneously at its resolved end state.

The failure to avoid is collapsing to the *initial* state instead, which is
the mechanically easier option because the initial state is what the markup
already declares. That renders the page small, dim and offset forever, and for
a reveal implemented as an opacity ramp from zero it renders the page blank.
Turning off motion must never remove content
([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair)); the
resolved end state is the content, and the motion was only the route to it.

Check the preference at the point where the gesture is composed, not inside
every property, and make sure the collapse is the *first* thing decided — a
subscription created and then bypassed is still a subscription.

Two mechanics that make the collapse safe rather than merely present. **The
preference is read as live external state**, not sampled once into a local
value: a reader who changes the setting mid-session, or an assistive
configuration that applies after first paint, must reach a page that responds
rather than one holding an answer from the moment it happened to look.
**Nothing branches the served markup on it**, because the server cannot know
the preference and a first client render that disagrees with the served
document can cost the whole page a re-render — the maximum amount of work, for
precisely the reader who asked for less of it. Gate what a gesture *does*, not
whether the element exists: the reduced rendering is a stopped animation, not
a missing element.

## Everything subscribed names what stops it

A scroll-bound page attaches listeners, observers and frame loops, one set per
station, and every one of them outlives its station unless something removes
it ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)). Two
specifics beyond the general rule:

- **A smoothing loop must stop when it has settled.** A spring that keeps
  requesting frames after it has effectively arrived is a page that never goes
  idle, which costs battery on a surface the reader has stopped looking at.
- **Nothing may write to component state per frame.** A station that re-renders
  at frame rate makes the smoothing itself the page's most expensive
  operation; frame writes go to the element directly.

## When not to use this

- **Content the reader must be able to read at any scroll position.** Legal
  text, pricing tables, anything a reader will screenshot or compare. Their
  correct state is always the resolved one.
- **Short pages.** One or two screens do not have enough scroll range to
  express an envelope, and the reader reaches the bottom before any station
  has completed its arc. The result is a page that seems to be mid-animation
  permanently.
- **Long uniform lists.** A hundred rows each with an envelope is a page that
  breathes at the reader; the technique is for a handful of deliberate
  stations, not for repetition.
- **Anything whose *state* is being communicated.** Motion tied to scroll says
  "you are here". It cannot say "this is loading" or "this succeeded" — those
  are the motion vocabulary's job and they must not be expressed by a curve
  the reader is unknowingly driving.

## What this technique refuses

- A timer anywhere in the station's gesture.
- Page-level progress as a station's input.
- An envelope with no out phase.
- Visible properties driven from raw scroll position without smoothing.
- Several elements of one station animated from several different inputs.
- A peak scale factor that no measurement derives.
- A reduced-motion path that collapses to the initial state.
