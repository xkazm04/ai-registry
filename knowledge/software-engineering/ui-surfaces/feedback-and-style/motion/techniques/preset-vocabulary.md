---
layer: technique
type: technique
subject: motion
technique: preset-vocabulary
status: forged
laws:
  - one-authority-per-vocabulary
shared_with: []
use_when: [deciding whether a new gesture earns a preset, a preset inlines its own milliseconds, deciding if a gesture is shared or private]
---

# Preset vocabulary

The unit of a motion system is the **named preset**: one complete, reusable
gesture, defined once in the vocabulary's single home and referenced by name
everywhere it plays. This is
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
applied to movement — and like every closed vocabulary, its value comes from
what a preset is *required to declare*, not merely from being shared.

## What a preset declares

A preset is not a keyframe block with a name on it. Each entry in the
vocabulary carries four things, designed together:

1. **An intent.** One sentence naming the *communicative job*: "this element
   is being drawn into existence", "this action just succeeded", "this
   surface is idle but alive". The intent is the lookup key in practice —
   authors arrive with a job, not a curve — and it is the test for misuse: a
   success gesture on a neutral state change is wrong even if it looks fine.
2. **A duration class, not a duration.** The preset names a step on the
   token ladder (fast, base, deliberate…), so retuning the ladder retunes
   every preset. A preset that inlines its own milliseconds has forked the
   time axis of the design system.
3. **An easing role.** Enter, exit, move, or the one expressive curve —
   again by reference, so the families stay families.
4. **Its own reduced-motion fallback.** Designed at the same moment as the
   motion, by the same author, preserving the preset's information while
   removing its travel. A vocabulary where fallbacks are someone else's
   later problem produces a product where reduced motion means broken
   feedback (the mechanics and failure modes live in
   [reduced-motion-mechanics](./reduced-motion-mechanics.md)).

The library also fixes its **taste constants** — stagger steps, ambient
travel bounds, entrance caps — as named values beside the presets, so the
budgets (see [taste-budgets](./taste-budgets.md)) are enforced where the
gestures are defined, not remembered at call sites.

## Two of those four assume a timed curve

The duration class and the easing role presuppose something the vocabulary
never says out loud: that a gesture is **one curve parameterized by elapsed
time**. Most are. Two legitimate members of the vocabulary are not, and a
contract that cannot express them pushes exactly the gestures that most need
central ownership back out into per-component code.

- **A continuous, physics-carried gesture has no duration and no easing
  role.** A spring is parameterized by stiffness and damping, and it ends
  when it converges — how long that takes depends on where it started and
  how fast it was already moving, so the same preset legitimately runs for
  different lengths of time on consecutive plays. Demanding a duration class
  of it produces a fiction: a number written into the vocabulary that
  nothing reads and every author quietly disbelieves.
- **A multi-track gesture has more than one of each.** Where a gesture
  separates into independent property tracks (see
  [gesture-decomposition](./gesture-decomposition.md)), the timing and the
  character belong to the *track*, not to the gesture — that separation is
  the whole point, and a single declaration at the top collapses it.

So the contract is more precisely stated one level down. **Intent and
reduced-motion fallback are declared once, for the gesture. Timing and
character are declared per track**, and each track declares one of two
shapes: a duration class plus an easing role, or its physics parameters plus
a convergence rule. Both reference the ladder or the engine defaults by
name; neither inlines raw numbers, which is the property the original rule
was protecting.

Two consequences follow, and they are the reason this is not bookkeeping.

**A physics track needs a settle bound, or it escapes the budgets.** The
entrance cap in [taste-budgets](./taste-budgets.md) is written in
milliseconds, and a gesture with no duration cannot be audited against it —
which is how the one gesture with unbounded run time becomes the one gesture
nobody holds to the budget. A continuous track therefore declares the time
within which it must be **visually at rest** under its worst legitimate
starting conditions. That number is auditable, it is what the budget
actually cares about, and it is not the same claim as a duration.

**Its fallback is an instant settle, not a shorter curve.** Reducing a timed
gesture means less travel over less time; there is no "less" to ask of a
spring, because shortening it means changing what it is. The reduction is to
zero the velocity and place the element at its target — the information
arrives, the physics does not. A vocabulary that only knows how to shorten
durations has no fallback for its continuous presets and will improvise one
globally, which is the failure
[reduced-motion-mechanics](./reduced-motion-mechanics.md) exists to prevent.

## The vocabulary is small on purpose

A working motion vocabulary is startlingly short — typically well under a
dozen presets covering entrance, emphasis, ambient life, success, and a
hover/press response. Brevity is a feature with teeth: a vocabulary an
author can hold in their head gets *used*; a fifty-preset catalog gets
skimmed once and bypassed, and bypassing is how per-component keyframes
return. When the list starts feeling long, the right response is merging
near-duplicates, not better documentation.

## When a new preset earns existence

The bar for a new word in the language:

- **No existing intent covers the job.** Not "no existing preset looks
  right" — presets are retunable; if the *intent* matches, tune the preset
  for everyone rather than forking it for one surface.
- **At least a second consumer is plausible.** A gesture needed by exactly
  one surface, ever, is that surface's private choreography, and may live
  with the surface — the vocabulary is for the product's shared language,
  not for every animation that exists.
- **It arrives complete.** Intent, fallback, and the timing and character
  of every track on day one. A preset admitted without its fallback is a
  debt the whole vocabulary co-signs.
- **It fits the budgets.** A candidate that needs an exemption from the
  entrance cap or the ambient bound is not a new preset; it is a proposal to
  change the budgets, which is a different, bigger conversation.

## Private choreography is allowed — outside the vocabulary

Not all motion is vocabulary. A one-off signature moment (an onboarding
flourish, a celebration) may be bespoke, owned by its surface, budgeted
individually. The rule is not "all motion is presets"; it is "shared motion
is presets, and bespoke motion is *visibly* bespoke" — declared as an
exception where it lives, never a copy-paste of a preset with the numbers
nudged, which is the worst of both: unshared *and* pretending to be the
vocabulary.
