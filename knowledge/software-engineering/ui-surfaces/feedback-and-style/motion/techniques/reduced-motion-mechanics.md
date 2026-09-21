---
layer: technique
type: technique
subject: motion
technique: reduced-motion-mechanics
status: forged
laws:
  - deletion-is-not-repair
shared_with: []
use_when: [designing the reduced fallback for a motion preset, placeholders flash after reduced motion is enabled, an exit animation never unmounts, page transitions still animate under a universal reduced-motion reset, a framework takes over starting document transitions]
---

# Reduced-motion mechanics

Every platform exposes a reduced-motion preference, and honoring it is
non-negotiable — vestibular disorders make travel, scaling, and parallax
genuinely harmful, not merely annoying. The *contract* (how the preference
is read, propagated, and what policy the product owes the user) is
accessibility territory. What the motion system owns is the **mechanics of
honoring it well** — and the central finding of this technique is that the
obvious mechanism, a global kill, is the wrong one.

## Per-preset fallbacks: reduction as design

The correct unit of reduction is the preset. Every entry in the vocabulary
ships **its own fallback**, designed with the motion, answering one
question: *what information does this gesture carry, and how does that
information survive without travel?*

- An entrance that draws an element in falls back to a **plain, brief
  fade** — arrival is still marked; nothing flies.
- A success settle falls back to an **instant state change** — the color
  lands, the checkmark appears, no bounce.
- An ambient float falls back to **stillness** — it carried no
  information; it can simply stop.
- An attention pulse falls back to a **static highlight** — emphasis
  without oscillation.

Two properties make this shape work:

- **Reduced is not none.** The preference suppresses travel, scaling, and
  parallax; it does not revoke feedback. Opacity fades are generally safe
  and usually survive — *for one-shot gestures*. The safety argument does
  not transfer to loops: a forever-repeating opacity pulse is not a gentle
  cross-fade, it is a flashing element, which is precisely the class of
  stimulus the preference exists to suppress. So the fallback split runs
  along lifetime, not property: one-shot gestures reduce to a fade or an
  instant settle; **infinite loops reduce to stillness**, whatever property
  they animate. And a reduced-motion mode that deletes all state-change
  feedback replaces one accessibility failure with another — the user who
  asked for calm now gets a product where things change with no
  acknowledgment at all. Reduction is a *redesign* of each gesture, and
  a global deletion posing as one is
  [deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair): it
  removes the artifact instead of doing the work.
- **The fallback is the same code path.** The preset resolves to its
  reduced variant at definition level — one branch, where the preset
  lives. It must not be a parallel implementation scattered at call sites,
  which drifts, gets forgotten on new surfaces, and turns "do we honor
  reduced motion" into an unanswerable question. With per-preset fallbacks
  in one home, the audit is a table read: every preset, its full form, its
  reduced form, done.

## Every reduction mechanism is engine-scoped

Before the trap, a structural fact: **a reduction mechanism reaches only
the engine it lives in.** A declarative stylesheet reset governs only
animation the stylesheet owns — a scripted frame loop writing values
directly to elements is invisible to it. An animation library's global
reduce switch governs only that library's animations — platform keyframes
run untouched beneath it. A product with two engines and one reduction
rule has covered the half the rule can see and gained maximum confidence
about the half it cannot. This cuts both ways: it is how coverage gaps
ship, and it is also a deliberate escape hatch — a vocabulary can move a
preset to the engine a too-aggressive global switch does not reach (the
ownership analysis is [engine-selection](./engine-selection.md)). Either
way, the audit unit is the *engine inventory*, never the rule: enumerate
every engine that can move a pixel, and show each one's reduction path.

Two adjacent mechanics follow from the same fan-out logic. The preference
signal is often composite — a system setting *and* a product-level
control — and any mechanism reading only one of them silently exempts
itself from the other; exactly one resolver reads the signals and every
consumer derives from it. And the preference is *live*: a resolver that
samples once at startup delivers the accommodation on the next restart,
which is a trap in every usage — subscribe, and where the platform's own
reader does not subscribe, wrap it and forbid the raw one. (The contract
itself — which signals exist and how they compose — is accessibility
territory; the mechanics of not fanning it out are this technique's.)

Subscription is sufficient for a consumer that re-derives when it is
notified. It is one rung short for an engine that **resolves the preference
into a committed target**: a scripted loop that computes an end state at
registration time holds, from that moment, a copy of the preference no
notification reaches — travel already in flight runs to completion, and an
entry whose target is never set again never re-reads it at all. There the
mechanism is a third liveness shape: re-evaluate the merged signal **once
per tick, inside the loop, before any integration runs**, so a change lands
on the very next frame for everything currently moving. State its cost, since
it is the objection: one read of the merged signal per frame, paid only while
something is animating — and the engine is already awake then, which is the
argument for putting the read in the loop rather than at every registration.

## The transition layer a universal rule cannot name

Engine scope has a second axis, and it bites inside the stylesheet's own
engine: **a reduction rule reaches only the nodes its selector can match.**
The standard universal reset — every element, plus its before- and
after-generated content — reads as total. It is not total for a
document-level snapshot transition, where the platform captures the old and
new state as images and animates them on a separate tree of generated nodes
layered above the page. Those nodes are neither elements nor before/after
content, the universal selector does not match them, and the transition
plays at full duration for exactly the user the reset was written for.

This is measured, not argued. In a current browser engine with the
preference emulated, a universal reset collapsed an ordinary infinite
keyframe animation (the positive control) and left a transition's
cross-fade running at its full default duration: frozen halfway through,
the entering element sat at 80% opacity, pixel-identical to a page with no
reduction rule at all. A rule naming the transition tree's generated nodes
removed every animation longer than a millisecond, and the element painted
settled. The result was the same when the reset was a shipping product's
block copied verbatim.

A rendering framework that adopts the transition as a component makes the
gap worse, in two ways that compound:

- **The call-site gate disappears.** A hand-rolled transition is started by
  application code, and the natural guard sits there: skip the call when
  the preference is set. Once the framework owns the transition, the
  framework makes the call. The platform runs one transition at a time, so
  application-initiated calls become forbidden, not merely redundant. The
  one gate a product already had is removed by the migration, and nothing
  announces it. The framework does not consult the preference on its own
  behalf either; its documentation says so.
- **Whether a gesture plays is decided by how the update was scheduled**,
  not by the markup. A deferred update animates, an urgent one does not,
  and a synchronous flush produces no transition at all. "Which of our
  surfaces animate" is no longer answerable from the component tree. The
  answer is spread across every call site that schedules an update.

The fix follows from this technique's own rules rather than from anything
new. Once the call is gone, two reduction paths remain: a per-boundary
property that switches the transition off where it is declared, and one
stylesheet rule naming the generated transition tree. Both removed the
visible motion when measured. Only the second is honored in one place. The
first is a parallel implementation at call sites, which drifts and is
forgotten on the next boundary someone adds. So **the reduced-motion rule
set names the transition tree explicitly, beside the universal reset**, and
the engine inventory lists the snapshot transition as its own line even
though it runs on keyframes, because the reset that governs keyframes
cannot see it. The per-preset fallback logic still holds inside that rule.
An enter or exit cross-fade is opacity-only and may survive as a brief
fade, but a moved or resized element animates position and size on the
tree's group nodes. That is travel, and travel is what the preference
suppresses.

## The global-kill trap

The tempting mechanism — one universal rule zeroing every animation and
transition duration when the preference is set — looks like the
token-layer ideal: one door, every consumer complies. It fails on two
mechanics:

**Timing-load-bearing invisibility windows.** Mature interfaces encode
*time* in animation machinery, deliberately: a loading placeholder whose
appearance *delay* is implemented as a pre-animation invisible period, a
reveal debounced behind an animation-driven wait, a toast that holds
before dismissing. These animations are not decoration — their duration IS
the feature. A global zero collapses the invisibility window to nothing:
placeholders now flash on every warm load, delayed reveals fire instantly,
and the reduced-motion user — who asked for *less* flicker — receives
strictly more. The global kill cannot distinguish "motion" from "timing
that happens to ride the animation system", and only the preset author
knows which is which. That knowledge lives per preset, which is why the
fallback must too.

**Completion events that never fire.** Code legitimately awaits an
animation's end — to unmount after an exit, to chain a sequence, to
release a lock when a transition settles. Animations forced to exactly
zero may never start, so their completion never fires, and the awaiting
code hangs: the exit that never unmounts, the sequence stuck on step one.
Where a duration must be collapsed rather than redesigned, it collapses to
a near-zero epsilon — a few milliseconds — preserving the event contract
while removing the perceived motion. Exact zero is a different behavior,
not a faster one.

## The mechanics, summarized

1. **Reduction resolves at the preset layer** — each preset declares its
   reduced form; consumers stay ignorant of the preference entirely.
2. **A vocabulary-level switch selects the variant** — one place reads the
   preference (per the accessibility contract) and rebinds the presets;
   call sites never branch.
3. **Timing-load-bearing durations are marked as such** in the vocabulary
   and survive reduction untouched — an invisibility window is not motion.
4. **Collapsed durations are epsilon, never zero**, so completion
   contracts hold.
5. **Bespoke, non-vocabulary motion carries its own fallback obligation**
   — the exception path documented in the preset library applies here
   doubly: a bespoke gesture without a designed reduced form is not
   finished.
6. **The reduction rule names every node tree that animates**, including
   the generated snapshot-transition tree a universal selector does not
   match; a framework-owned transition is reduced there, not at its call
   sites.
7. **Test in the reduced mode, not just about it.** Run the product's
   loading, entrance, and success flows with the preference on; the trap
   cases above (flashing ghosts, hung exits) are all visible in one manual
   pass and nearly invisible in code review.
