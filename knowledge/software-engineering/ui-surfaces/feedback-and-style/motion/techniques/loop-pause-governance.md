---
layer: technique
type: technique
subject: motion
technique: loop-pause-governance
status: forged
laws:
  - one-authority-per-vocabulary
  - creation-names-reaper
shared_with: []
use_when: [several conditions independently want to suspend the same loop, a tap-to-pause never resumes on a touch device, a cycle jumps or stalls after the surface was backgrounded]
---

# Loop pause governance

A looping gesture is not asked to stop by one thing. It is asked by the
reduced-motion preference, by the surface scrolling out of view, by the
application window going to the background, by a user who pressed pause, and
in some products by a capability verdict that this device should not be
running the effect. Each of those is easy to implement alone, which is
exactly the trap: implemented alone and repeatedly, they become five
booleans in every animated component, and the loop is correct only where
somebody remembered all five.

This technique is the control plane above the primitives. It owns the
**merged pause signal** — one answer, derived from a closed set of named
deciders, consumed by every loop — and the four mechanics that decide
whether a pause can actually be lifted again.

## One signal, a closed set of deciders

The structure is
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
applied to a boolean: the deciders are **enumerated once, in one place**,
merged there, and every loop reads the merged result rather than the inputs.
Three properties make that worth the indirection:

- **A decider is a veto, and the merge is a disjunction.** The loop runs
  only when no decider objects. This is the whole merge, and stating it as a
  fixed shape is what lets a sixth decider be added later as one edit rather
  than as a sweep across every animated surface.
- **The set is closed and written down.** Naming the deciders as a list —
  preference, in-view, foregrounded, user stop — turns "why is this thing
  not moving?" into a question with a finite answer. An unlisted decider
  implemented locally in one component is how two surfaces on the same
  screen end up with different pause behavior for reasons no one can
  reconstruct.
- **Consumers stay ignorant of the inputs.** A loop that reads the
  preference itself, or attaches its own visibility listener, has re-derived
  half the vocabulary and will miss the half it did not think of. It asks
  one question: am I allowed to run?

Note what is *not* a decider here. Whether the device can afford an effect
is a measured capability judgment owned by the adaptive-fidelity doctrine;
if a product has one, it enters this merge as one more veto, and its
internals stay over there.

## Every pause names what lifts it

A pause is a created thing, and
[creation-names-reaper](../../../../_laws.md#creation-names-reaper) applies
to it exactly: **whatever arms a pause states what disarms it, at the moment
it is armed.** Skipping that question is how loops wedge, and the wedge has
a canonical form.

The pattern is a pause armed when a pointer enters the surface and disarmed
when it leaves. On a pointing device the pair is symmetric and it works. On
a touch surface, a tap fires the entering half and there is no leaving half
to come — the pointer does not travel out, it simply ceases to exist — so
the pause is armed with nothing in the world that can lift it. The loop
stops permanently, on a control the user did not know they had pressed, and
the surface reads as broken rather than paused.

The fix is not to detect the input class; it is to make the pause
**self-limiting**. A pause armed by a transient input signal carries its own
expiry — it lifts after a bounded interval unless something re-arms it —
so the worst case on any device is a loop that resumes a few seconds later
rather than one that never does. The general rule: a pause whose disarm
depends on an event that particular device may never produce must be timed.
Only pauses whose lifting condition is *observable state* — the surface is
out of view, the window is backgrounded, the user's stop is set — may be
open-ended, because the state itself will change and can be read at any
moment.

## Resume where you stopped, not where you started

A loop that restarts its interval on every resume never finishes it. A user
who rests the pointer on a carousel three times, or a surface that leaves
and re-enters view while the reader scrolls, resets the countdown on each
pause and the next item never arrives. The loop looks stalled while being
technically alive.

So **remaining run time is banked across a transient pause**: when the pause
arms, the loop records how much of the current interval is left; when it
lifts, it schedules that remainder. The user's experience becomes continuous
— the cycle proceeds at its designed pace, minus the time it spent stopped —
and the pathological case (a pause and resume every second) degrades to a
slow cycle rather than to a frozen one. Banking also fixes the mirror-image
bug on any pause that gates a *delivery* rather than a loop: without a
banked remainder, a result timed to land after a sequence lands on schedule
regardless, so the user watches the answer appear on a surface they had
paused.

The banking rule applies to transient pauses only, and the exception is
worth stating because it looks like an inconsistency. When the **user**
resumes deliberately, the interval restarts from the beginning rather than
from a remainder — they just chose to watch, and handing them the last two
hundred milliseconds of an interval they did not see the start of is a jump,
not a continuation. Machine-owned pauses continue; user-owned resumes begin.

Two mechanics travel with this:

- **The floor.** Any banked remainder is clamped to a minimum before it is
  scheduled, or a pause that lifts near the end of an interval fires the
  next step instantly and reads as a jump. Because remainders are computed
  by subtracting times, this is also where a units mismatch hides — a value
  in seconds subtracted from a value in milliseconds produces a plausible
  number and a wrong one, so the unit belongs in the name of anything that
  crosses this boundary.
- **The index clamp.** A cycle stepping through a list may resume against a
  *shorter* list than it paused against. Clamping the active position into
  the current bounds at resume costs one comparison and removes a whole
  class of empty-render bug that only appears when data changes during a
  pause.

## Recovering from a clock the background froze

Frame-driven progress and wall-clock progress diverge the moment a surface
is backgrounded, because the frame clock stops ticking while wall time keeps
running. On return, a loop that trusts its frame clock believes almost no
time has passed and continues from where it was — visibly behind — while a
loop that trusts a raw wall-clock delta receives one enormous step and
either jumps or, for anything integrating physically, detonates. (Clamping
that delta centrally is
[performance-discipline](./performance-discipline.md); the choice of which
clock to resume *from* is this technique's.)

The rule that survives both: **resume from the state the user can see, not
from the clock.** A progress indicator resumes from the value currently
displayed; a cycle resumes from the step currently shown, with its banked
remainder. The displayed state is the one thing that did not lie during the
suspension, and re-deriving from it makes the recovery correct without
needing to know how long the gap was.

## The pause must reach every engine, and every consumer must find it

Two structural details decide whether the merged signal is actually
authoritative.

**It has to reach declarative motion.** A signal a script reads governs
script-owned loops only; motion owned by the style layer keeps running
underneath it, because nothing told the style layer anything. The projection
is a single marker set on a root element by the same merged signal, which
declarative rules key off — one channel, both engines. Without it, a product
pauses the half of its motion it can see and reports full coverage.

**The signal has one subscription, not one per consumer.** The underlying
platform notifications are global; attaching a listener per animated
component means dozens of listeners for one event, and in a development
environment that swaps modules in place, a stale listener per swap that
nothing ever detaches. One module-scoped subscriber, created once, holding
the current value and fanning it out, is the shape — and it names its own
teardown for the same reason every created resource does.

**And a component outside the coordinator has a documented answer.** Loops
render in places the coordinator does not wrap: an isolated preview, a test
harness, a surface someone mounted standalone. That case must not throw —
a motion component that refuses to render without its provider is a
component nobody can drop anywhere — and it must not silently choose "paused
forever", which is dead in exactly the environments where somebody is trying
to look at it.

The fallback that holds up is neither of the two obvious defaults. It is a
**partial merge**: the deciders that can still be evaluated without the
coordinator are evaluated, and the ones that only the coordinator can answer
default to *no objection*. The preference and the foreground state are
globally readable, so they keep vetoing; in-view and the user's stop are
coordinator-scoped, so outside it they abstain and the loop runs. That
degrades along the axis that matters — the accessibility and battery
deciders never silently switch off — while keeping a stray mount alive.
Write the choice down where the fallback lives, and write the decider list
down beside the merge, because a list that says *three signals* over a merge
of four is the one place a reader will trust and should not.
