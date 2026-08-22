---
layer: technique
type: technique
subject: design-canon-as-executable-law
technique: archetype-aware-envelopes
status: forged
laws: [grade-against-what-ships-not-on-a-curve, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [one band is wrong for half the content it grades, adding a new content kind to an existing checker, a check that never fires or always fires]
---

# Archetype-aware envelopes

The named concern: **a single band applied to categorically different things.** The
symptom is one of two extremes — a band tight enough to be meaningful for one kind and
therefore firing constantly on another, or a band widened until it admits everything and
fires on nothing. Both end the same way: the check is muted, and muting is permanent.

The fix is not a wider band. It is **an envelope selected by the kind of thing being
graded, where each kind is judged on the axis that actually governs it.**

## The canonical example

Two effects applied to a target. One is a sustained damage-over-time: its whole design is
magnitude per unit time against a duration, so it is graded as a rate inside a tolerance
of the tier's target rate. The other is a control effect — a knockback, a stun — where a
rate is meaningless. Nobody cares what damage a knockback does; what matters is a bundle
of quite different properties:

- **a real magnitude** — a displacement or impulse strictly above zero, because an effect
  declared as control that moves nothing is a defect that a damage check would never see;
- **a duration inside a hard ceiling** measured in seconds, taken from the canon rule that
  caps control time;
- **an immunity tag plus a positive immunity window**, without which the effect can be
  chain-applied and the target never acts again — the failure that makes control effects
  the most-complained-about system in any game that gets them wrong;
- **a clears-on-landing condition** for kinetic displacement, so the effect ends when its
  physical premise ends.

Four independent conditions, none of them a band around a number. Grading that against a
rate band is not "a bit loose"; it is a category error, and no tolerance value fixes it.

## Dispatch on declaration, never on inference

The kind is **declared by the artifact** and the checker dispatches on the declaration.
The natural implementation is often structural: the presence of the control-budget block
*is* the declaration, and its absence selects the rate path. That is good design — it
makes the two paths mutually exclusive by construction. A control effect cannot accidentally
satisfy the rate line, and a damage effect cannot pass on an empty control budget.

Inference is the trap. A checker that guesses the kind from a name or a keyword will guess
wrong precisely on the artifact that most needs grading — the unusual one, the one someone
built to sidestep a band. And it will guess generously, because whoever wrote the inference
tuned it until the corpus in front of them classified correctly.

Two consequences follow:

- **A missing declaration is not-measured, with a reason naming both paths.** "This needs a
  rate within the tier band, or a declared control budget" is a complete instruction. An
  unadorned failure is not.
- **A declaration that contradicts its content is a finding.** An artifact declaring itself
  control while carrying a large sustained rate is either mis-declared or is quietly two
  effects; either way someone should look. Mis-declared kind is the main way content
  escapes the envelope that should have caught it.

## Envelope arithmetic has its own hazards

A band is not always a percentage. Two failures recur:

**The signed-target inversion.** A tolerance expressed as a percentage of the target flips
its ordering when the target is negative. A loudness target of minus sixteen with a
plus-or-minus band computes a lower bound above its upper bound, and every value fails or
every value passes depending on which way the comparison was written. Any quantity that
can legitimately be negative — a loudness level, a temperature, an offset, a modifier —
needs an **absolute tolerance** band, gating on the signed value directly. Choosing the
percentage form by habit is the bug.

**The missing basis.** A percentage without its reference case is not a number. A
mitigation figure for a defence that soft-caps against the size of the incoming hit does
not exist except relative to a stated reference hit; a band on it without that reference
grades noise. State the basis in the rule and carry it into the envelope's identity.

## Procedure

1. **Find the bands that are muted, always-firing, or carry a suspiciously wide tolerance.**
   Each is a candidate for an envelope that is grading two kinds at once.
2. **Name the kinds.** Usually two or three, and they are already visible in how designers
   talk about the content.
3. **For each kind, ask what actually governs it.** Not "what number do we have" — what
   would a lead reject this for. That question produces the conditions.
4. **Give each kind a declaration** and make the declarations structurally exclusive where
   possible.
5. **Write each path as a sequence of specific conditions with specific messages.** One
   condition per failure mode; never a compound boolean that reports a single generic
   failure.
6. **Take every threshold inside the envelope from the canon**, the same as any other
   content invariant. Archetype-awareness changes which band applies, not where bands
   come from.
7. **Grade each band against shipped comparable work**, not against the batch under
   review. A group of uniformly overtuned artifacts must not normalize each other into a
   pass, and a band derived from the current corpus does exactly that.

## Decision rules

- **When one band would be wrong for a kind you can name, split the envelope.** Do not
  widen. Widening trades a false positive for a permanent blind spot.
- **When a kind has fewer than roughly five members, do not give it its own envelope yet.**
  A band derived from four examples is a description of four examples. Let it accumulate,
  or grade it by review.
- **When the two paths share a threshold, they share the parsed constant** — one authority
  per quantity, even across envelopes.
- **When the target can be negative, use an absolute tolerance.** Percentage bands are for
  strictly positive targets.
- **When a new kind appears, the checker must not silently classify it as an existing
  one.** Unknown kind is not-measured, loudly, and appears in the coverage report as an
  unenforced class.
- **When someone asks to widen a band for one artifact, ask what shipped work justifies
  it.** If the answer is "everything else we made is like this", that is the batch grading
  itself and the answer is no.

## When not to use this

- **Genuinely homogeneous content.** If everything in a class is judged on the same axis,
  one envelope is correct and archetype machinery adds branches nobody needs.
- **Before the kinds are stable.** Splitting an envelope hardens a taxonomy. If designers
  are still arguing about what the categories are, the checker will freeze a bad one.
- **As a way to make failures go away.** Introducing a kind whose envelope happens to admit
  the artifacts that were failing is threshold-widening with extra steps, and it is harder
  to spot in review. The test: was the new kind named by a designer before it was needed by
  a checker?
- **For qualities that need judgment rather than a band.** Whether an effect *reads* clearly
  on screen is not an envelope; it is a judged verdict against shipped reference work.
  Deterministic envelopes are a floor beneath that, and pretending they cover it is how a
  fully conformant, entirely generic system ships.
