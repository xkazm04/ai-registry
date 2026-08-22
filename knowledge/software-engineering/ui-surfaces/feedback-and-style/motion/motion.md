---
layer: golden-path
type: golden-path
subject: motion
status: forged
techniques:
  - preset-vocabulary
  - engine-selection
  - performance-discipline
  - taste-budgets
  - one-shot-guarding
  - reduced-motion-mechanics
  - content-bearing-degradation
  - unprompted-motion-lifecycle
  - loop-pause-governance
---

# Motion system

Motion in an interface is a language the product speaks whether or not anyone
designed it. Every duration, easing curve, and entrance a component ships is a
sentence in that language, and a product that lets each component improvise
its own converges on the same accent problems every time: a dialog that
springs while a panel slides, entrances that replay on every poll, ambient
decoration that competes with the data it decorates, and one imported
animation library whose global configuration can silently switch the whole
vocabulary off. A motion *system* is the decision to speak deliberately — a
small, named, centrally owned vocabulary of movement, with budgets on taste,
architecture behind performance, and guards on repetition.

The system is not the token layer beneath it and not the choreography
semantics above it. Duration ladders and easing roles — the raw *how long*
and *with what character* — are design-token territory, owned by the
[motion-tokens](../design-tokens/techniques/motion-tokens.md) vocabulary.
*When* an arrival cascade is allowed to play at all is async-surface
territory, owned by
[arrival-choreography](../async-ui-states/techniques/arrival-choreography.md).
The reduced-motion *preference contract* — how the user's setting is read,
propagated, and honored as a matter of accessibility policy — is owned by the
accessibility subject. What the motion system owns is everything between:
the composed gestures themselves, the engine that runs them, and the
mechanics that keep them fast, restrained, and unrepeated.

## Motion is a vocabulary, not decoration

The unit of the system is the **named preset**: a complete, reusable motion
gesture with an intent ("this element is being drawn into existence", "this
value just succeeded", "this surface breathes while idle"), a duration class
drawn from the token ladder, an easing role, and — non-negotiably — **its own
reduced-motion fallback** designed at the same moment as the motion itself.

A preset library beats per-component keyframes for exactly the reasons a
token palette beats inline hex values:

- **Consistency is structural, not disciplinary.** Two surfaces that both say
  "fade-pop" move identically because they reference one definition, not
  because two authors happened to pick the same numbers.
- **Retuning is one edit.** Slowing every entrance by ten percent, flattening
  an easing family, or redesigning the success gesture touches one file, not
  a grep across the product.
- **The accessibility story is enumerable.** When every gesture is a named
  preset and every preset declares its fallback, "does this product honor
  reduced motion" becomes an audit of a list, not a hunt through components.
- **Requests become vocabulary questions.** A new surface wanting motion asks
  "which preset?" first, and only when no preset fits does it open the
  argument for a new word — an argument had with the vocabulary's owner,
  in the vocabulary's home, where the whole language is visible.

Per-component keyframes are the hex values of motion: locally reasonable,
globally incoherent, and unauditable. The full shape of the library — what a
preset must declare, and when a new one earns existence — is
[preset-vocabulary](./techniques/preset-vocabulary.md).

## Taste is budgeted

Motion spends the user's attention, and attention is not the product's to
spend freely. A system without budgets drifts toward more — longer
entrances, bigger travel, one more idle shimmer — because each addition looks
good in isolation and the cost only appears in aggregate. The budgets are
therefore *numbers*, owned centrally, not sensibilities:

- **Entrance durations are capped.** A full entrance — stagger included —
  completes in roughly a second; beyond that the choreography is delaying
  data for theater.
- **Ambient movement is bounded in distance.** Idle motion that exists to
  make a surface feel alive travels a few pixels at most, slowly; anything
  larger competes with content for the eye.
- **Easing families are consistent.** Enters decelerate, exits accelerate,
  and the one expressive curve is reserved for moments that earn it — a
  product where every component picks its own curve has no easing family,
  only easing incidents.
- **Attention-drawing motion must deserve the attention.** Movement is the
  strongest visual signal an interface commands; a gesture that pulls the eye
  toward something unimportant has taxed the user and paid them nothing.

The ladders, caps, and the class hierarchy that decides which motion is even
eligible for a surface are [taste-budgets](./techniques/taste-budgets.md).

## Performance is architectural

Smooth motion is not achieved by optimizing animations after they stutter; it
is achieved by choosing, once, an architecture in which stutter is hard to
produce:

- **Animate compositor-friendly properties.** Transform and opacity can be
  animated without recomputing layout or repainting content; nearly
  everything else cannot. A vocabulary whose presets are built exclusively
  from compositor-friendly properties makes the fast path the only path.
- **Frames bypass reactive state.** A frame value routed through the UI
  framework's state system schedules a full re-render sixty times a second.
  Frame writes go directly to the element through a mutable reference; the
  reactive layer hears about the animation twice — start and settle — not
  per frame.
- **One shared frame engine.** N components each running a private spring
  loop means N clock subscriptions, N wake-ups per frame, and N places to
  leak one. A single engine drives every scripted animation from one clock
  tick, batches its writes, and is one place to pause, profile, or kill.

These are structural decisions — visible in where animation code lives, not
in how carefully it is written — and they are
[performance-discipline](./techniques/performance-discipline.md).

## Know what owns your keyframes

Every motion system runs on an engine, and the engine choice is an ownership
decision before it is a feature comparison. Declarative stylesheet keyframes,
hand-rolled scripted springs, and full animation libraries differ in
interruption behavior and expressiveness — but the risk that decides
architectures is quieter: **a library with global configuration is a single
point of invisibility.** One provider-level setting, one ancestor context,
one version's changed default can disable every reveal in the product
silently — no error, no log, just entrances that stop happening, discovered
by a user. A system must be able to answer "what owns this gesture, and what
can turn it off?" for every preset in the vocabulary; where the answer
includes "a global switch outside our code", the system has a kill switch it
did not install. The trade space — and the interruption story each engine
buys — is [engine-selection](./techniques/engine-selection.md).

## One-shot means one-shot

Entrance motion is a *first-arrival* gesture, and any mechanism that replays
it on poll, refresh, scroll-back, re-render, or resort has converted a
welcome into a tic. This is a bug class, not a bug: it recurs wherever
entrance is coupled to an implementation event (mounting, data delivery)
instead of to the one semantic event it belongs to — *this identity appearing
before this user for the first time*. The guard is identity: a
surface-scoped record of what has already entered, keyed by the stable
identity of each item, consulted before any entrance plays.

The *semantics* — which load-cycle edge may trigger a cascade, what counts as
a legitimate reset — are owned by
[arrival-choreography](../async-ui-states/techniques/arrival-choreography.md)
and are not restated here. The motion system owns the *mechanics* that make
those semantics enforceable: where the seen-record lives, what writes it,
what may clear it, and how the guard composes with windowed rendering and
surface reuse — [one-shot-guarding](./techniques/one-shot-guarding.md).

## Reduced motion is designed per preset, honored in one place

The user's reduced-motion preference is a contract the accessibility subject
owns; the motion system owns making it *honorable*. Two mechanics matter:

- **Every preset ships its own fallback.** "Reduced" does not mean "deleted".
  A draw-in entrance may fall back to a plain fade; a success gesture to an
  instant color settle; an ambient float to stillness. The fallback preserves
  the preset's *information* — the thing arrived, the action succeeded —
  while removing its travel. A preset without a designed fallback gets one
  improvised at the worst possible time, by a global rule, uniformly.
- **The global kill is a trap.** The tempting one-liner — a universal rule
  zeroing every animation and transition — destroys more than decoration.
  Systems legitimately encode *timing* in animation: a placeholder that stays
  invisible for its appearance delay, a control that debounces its own
  reveal. Zero those durations globally and the invisibility window becomes
  zero too — ghosts flash on every warm load, delayed reveals fire instantly
  — and the product is *worse* for reduced-motion users, who were promised
  calm and given flicker.

The fallback design rules, and the taxonomy of what breaks under a global
reset, are [reduced-motion-mechanics](./techniques/reduced-motion-mechanics.md).

## Degrading a gesture may not delete its payload

Reduction is only one of several reasons a gesture ends up not playing: a
loop may be held, a surface may never have come into view, a page may never
have started its animation machinery at all. Whatever the reason, the
degraded branch renders *something*, and the rule that governs it is not the
one most products learn first. The decorative rule — when motion is off,
render nothing — is correct for the surface it was learned on and
catastrophic one folder over. A component whose animation *reveals content*
— a headline typed out, a figure counted up from zero, a build-up that ends
on the data the reader came for — must render its resolved end state
immediately: never nothing, never a skeleton that will not resolve, never a
confident zero. The corollary most implementations miss is that a surface's
own labels are claims about a running loop, so copy reading *live* or
*auto-refreshing* has to relabel itself when the loop was never started, or
the degraded surface goes on asserting a currency it no longer has. The
litmus, the three failure shapes, and the relabelling discipline are
[content-bearing-degradation](./techniques/content-bearing-degradation.md).

That technique answers the *permission* question and stops at the budget
one: how much fidelity a particular device can afford is measured, tiered
work owned by the adaptive-fidelity doctrine, while this subject decides
whether a gesture may run at all and what degrading it is allowed to delete.

## Motion nobody asked for owes the user a lifecycle

Motion divides by who started it, and everything difficult lives on one
side of that line. A gesture answering a press is over before the user could
object and owes them nothing beyond being fast. An autoplay carousel, an
attract loop, a scroll-triggered reveal — nobody asked for those, and motion
that starts itself must name what stops it and who may start it again.
Three rules carry most of the weight. Past five seconds of running, a
visible and operable stop is required rather than recommended — pausing on
hover is not a control, because it does not exist for a keyboard and never
completes on a touch surface. A stop is a stop,
never a toggle, wherever the affordance can be triggered without deliberate
aim: a keyboard user who presses the stop key twice must not have restarted
what they just silenced. And a scroll reveal is a one-shot, because coming
back into view is a reader returning to re-read, not a first arrival — a
stagger replayed on every scroll-past reads as a glitch rather than a
flourish. The lifecycle, the threshold, and the separation of a user's stop
from a machine's transient pause are
[unprompted-motion-lifecycle](./techniques/unprompted-motion-lifecycle.md).

## Pause is one merged signal, not fifteen local ones

A looping gesture is asked to stop by several independent deciders — the
reduced-motion preference, the surface leaving the screen, the application
window going to the background, a user pressing pause — and each is easy
enough to implement locally that products implement all of them, repeatedly,
in every animated component. The result is a loop that is correct only where
somebody remembered every signal. The system instead merges a **closed,
named set of deciders into one answer** that every loop reads, so a new
decider is one edit and a stopped loop has one place to interrogate. Two
mechanics decide whether such a pause can ever be lifted again: a pause
armed by a signal the device may never un-fire has to be *timed*, or a
tap-to-pause on a pointerless surface wedges the loop permanently; and a
resumed loop recovers from the state the user can see, banking its remaining
run time, because a clock that a backgrounded window froze will otherwise
resume either far behind or in one enormous step. The merge, the fallback
for a component mounted outside the coordinator, and the recovery rules are
[loop-pause-governance](./techniques/loop-pause-governance.md).

## The techniques

- [preset-vocabulary](./techniques/preset-vocabulary.md) — the named preset as
  the unit of the system: intent, duration class, per-preset fallback, and
  the bar a new preset must clear.
- [engine-selection](./techniques/engine-selection.md) — declarative keyframes
  vs scripted springs vs animation libraries: ownership, kill-switch hazards,
  and what each buys you when a gesture is interrupted.
- [performance-discipline](./techniques/performance-discipline.md) —
  compositor-friendly properties, frame writes outside reactive state, the
  shared engine, and the layout-thrash audit.
- [taste-budgets](./techniques/taste-budgets.md) — the motion class hierarchy,
  duration caps, ambient distance bounds, and easing-family rules.
- [one-shot-guarding](./techniques/one-shot-guarding.md) — identity-keyed
  entrance tracking, the replay bug class, and reset policy mechanics.
- [reduced-motion-mechanics](./techniques/reduced-motion-mechanics.md) —
  per-preset fallbacks over global kills, and the timing-window trap.
- [content-bearing-degradation](./techniques/content-bearing-degradation.md)
  — the decorative-versus-content-bearing litmus, the resolved end state a
  degraded gesture owes its reader, and the liveness labels that must
  relabel with it.
- [unprompted-motion-lifecycle](./techniques/unprompted-motion-lifecycle.md)
  — the visible-control threshold, stop-is-not-a-toggle, no implicit
  re-arm, and one-shot discipline for scroll reveals.
- [loop-pause-governance](./techniques/loop-pause-governance.md) — the
  merged pause signal over a closed decider set, the timed pause that keeps
  touch from wedging a loop, and recovery from a frozen clock.
