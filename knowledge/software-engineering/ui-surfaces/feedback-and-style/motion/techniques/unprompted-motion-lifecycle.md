---
layer: technique
type: technique
subject: motion
technique: unprompted-motion-lifecycle
status: forged
laws:
  - creation-names-reaper
shared_with: []
use_when: [adding an autoplay carousel or attract loop, deciding whether a surface owes a visible pause control, a scroll reveal replays every time a section passes]
---

# Unprompted motion lifecycle

Motion divides cleanly by who started it. **Prompted** motion answers an act
the user just performed — a press, a drag, a submit — and is over before
they could think to object; it owes them nothing beyond being fast. **Unprompted**
motion starts on its own: the carousel that advances every five seconds, the
attract loop cycling a feature grid, the reveal that fires when a section
scrolls into view, the counter that ticks up because the surface loaded.
Nobody asked for it, and everything difficult about motion lifecycles lives
on that side of the line.

The obligation is the one
[creation-names-reaper](../../../../_laws.md#creation-names-reaper) states,
applied to attention rather than to memory: **motion that starts itself
names what stops it, and who may start it again.** A loop shipped without
those two answers is not a loop with a missing feature; it is a loop the
user cannot get out of.

## The threshold for a visible control

Not every unprompted gesture owes the user a control. The line is
*duration*, and it is a real threshold rather than a taste call:

- **A gesture that completes and stops owes nothing.** A one-shot reveal, a
  single count-up, an entrance cascade — by the time a user could reach for
  a pause control, there is nothing left to pause. Its obligations are
  one-shot-ness and a reduced form, not a button.
- **A gesture that runs longer than five seconds owes a visible, operable
  stop.** The number is not a preference; it is the threshold the published
  accessibility criterion sets for motion that starts automatically, runs
  alongside other content, and is not itself essential. Past it, a control
  the user can see and reach is required, not recommended. Auto-advancing
  content raises the bar further: it is not only a motion problem but a
  reading problem, because content that changes under someone mid-sentence
  is content they cannot finish.

*Visible and operable* is the load-bearing half. Pausing on hover is not a
control: it does not exist for anyone navigating by keyboard, and on a
pointerless device the entering half of hover fires while the leaving half
never does — which is a wedge, not an accommodation (the mechanics of that
are [loop-pause-governance](./loop-pause-governance.md)). A control that
only some input classes can operate is an exemption granted to everyone
else's users.

## A stop is a stop, never a toggle

The rule that separates a considered implementation from a plausible one:
**the affordance that stops unprompted motion must not be the same
affordance that restarts it**, wherever that affordance can be triggered
without deliberate aim.

A visible button carrying visible state may toggle honestly — the label
reads *pause*, then reads *play*, and the user sees which one they are
pressing. A key binding cannot. A keyboard user who presses the stop key
expects silence; if the same key restarts the loop, then repeating the key
— which people do, because the first press produced no visible
confirmation — reanimates exactly what they just silenced, and they now
believe the control does not work. So the convention worth writing down and
holding: **the stop path is one-directional, and restarting requires a
different, labeled act.** State it as a convention where the control lives,
because the next author will otherwise implement the obvious toggle.

## Taking control is itself a stop

The user does not have to press the stop control to have stopped the loop.
The moment they steer an auto-advancing surface themselves — choosing an
item, stepping with the keyboard, selecting a chip — they have taken over,
and a loop that keeps advancing underneath them is now moving them off the
thing they just chose. So **the first deliberate interaction with an
auto-advancing surface stops the autoplay**, permanently, and the visible
control is what brings it back.

That gives unprompted motion a lifecycle short enough to write down beside
it, and worth writing down because every clause of it is a decision someone
will otherwise re-litigate: *starts on its own; stops on the first
deliberate interaction or on the stop control; resumes only through the
visible control.* Three states, one arrow each way, and the arrow back
labeled.

## Nothing re-arms a loop implicitly

An explicit stop is a *user-owned* state, and the only thing that may lift
it is the user. Every implicit re-arm is a bug wearing a feature's clothes:

- A timer that resumes the loop "after a period of inactivity" converts the
  stop into a snooze.
- A data refresh, a re-render, or a remount that reinitializes the loop's
  state discards the stop silently — the surface simply starts moving again
  and the user never learns why.
- Scrolling away and back re-arms nothing. Coming back into view is a reason
  to *resume* what was transiently paused; it is not a reason to undo a
  decision.

That last distinction is the one to hold precisely, because it is the one
that gets collapsed. A **transient pause** is machine-owned — the surface
left the screen, the window went to the background, a pointer is resting on
it — and it lifts by itself when its condition clears. An **explicit stop**
is user-owned and lifts only by user act. Store them separately. Merged into
one flag, the sequence *user stops, then hovers, then moves the pointer
away* restarts the loop, and no reading of the code makes that look wrong.

## Scroll is not a first-appearance event

Scroll-triggered reveals are the most common unprompted motion in a long
surface, and the most common way to build one is to fire the reveal whenever
the surface comes into view. That is wrong in one specific, cheap-to-fix
way: the user scrolls back. On the way back the content re-hides and
re-staggers itself, and the effect does not read as a flourish; it reads as
a glitch, because the user was returning to *re-read something* and the
surface took it away to show them an animation they already saw.

The rule: **a scroll reveal plays once per surface, per visit, and holds its
revealed state afterward.** Coming into view is an implementation event, not
a first-appearance event — the same confusion catalogued in
[one-shot-guarding](./one-shot-guarding.md), which owns the guard mechanics.
What this technique adds is the *policy*: for unprompted reveals the answer
is always one-shot, and a surface that wants replay on every pass needs an
argument, not a default.

Two adjacent rules complete the shape:

- **A degraded decorative reveal is off, not fired once.** When a reveal is
  not going to run as designed, do not play it a single time and stop.
  Half-a-gesture is indistinguishable from a defect; absence is legible.
- **A value the engine cannot interpolate does not get animated at all.**
  Some properties have no meaningful midpoint. Attempting to tween them
  produces a jump the user reads as a flicker, so the honest form is an
  instant switch, stated as such rather than discovered by the animation
  engine at run time.

## Cadence comes from elapsed time, not from counted ticks

An unprompted loop that advances by incrementing a counter each tick is
double-vulnerable: two mounts of the same surface advance it twice as fast,
and a suspended surface resumes with its counter exactly where it was while
the visible world moved on. Deriving the current step from **elapsed time
since the loop's start** makes both classes unrepresentable — a duplicate
driver computes the same step rather than adding one, and a resumed loop
lands where the wall clock says it should. The cost is one subtraction; the
bug it prevents is the one that reproduces only on a double mount and is
therefore found in production.

## What this technique does not decide

Whether a loop is currently allowed to run at all — the merge of the
preference, the visibility signals, and the user's stop into one answer — is
[loop-pause-governance](./loop-pause-governance.md). What the surface
renders when the loop is not running is
[content-bearing-degradation](./content-bearing-degradation.md). This
technique decides only the *lifecycle*: that unprompted motion is entitled
to start, what it owes the user while it runs, and the fact that a stop,
once given, is kept.
