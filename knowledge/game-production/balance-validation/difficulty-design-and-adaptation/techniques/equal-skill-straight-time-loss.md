---
layer: technique
type: technique
subject: difficulty-design-and-adaptation
technique: equal-skill-straight-time-loss
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass, structural-proof-is-never-sufficient]
shared_with: []
use_when: [a design promises that a capped-speed competitor pays for the cap, a lighter or nimbler competitor keeps winning where its numbers say it should lose, separating a skill result from a stat result, confirming that a trade-off in the specification survives contact with the simulation]
---

# Equal-skill straight-time loss

The named concern: the mirror of the skill swap. Where the swap varies skill and holds the
competitor, this check holds skill equal across every competitor and varies the competitor,
so that any difference in the outcome is attributable to the stat sheet alone. Its claim is
narrow and checkable: a competitor with a lower speed cap must lose measurable time on a
course section long enough for the cap to bind.

It is the control that makes the swap trustworthy. If an equal-skill field cannot show a
declared trade-off, a later skilled win cannot be told apart from an unannounced power
advantage.

## Why it is a separate test

A design that says "the nimble competitor trades top speed for handling" has made two
promises: that handling pays on technical sections, and that the cap costs time on open
ones. The first is easy to see because it produces wins. The second produces nothing a
player notices, so it is the one that silently lapses. Acceleration, grip or recovery
bonuses grow until the cap's cost is paid back in the first corner out, and the
competitor ends up with a free advantage that no document admits.

Only an equal-skill field exposes that, because with unequal skill the gap can hide
inside a driving-quality difference. Hold skill constant and the stat sheet has nowhere to
hide.

## The three declared quantities

**The minimum section length** at which the cap must bind, derived from physics rather
than chosen by feel: the distance over which the capped competitor reaches its cap, plus
enough remaining distance for the cap to open a gap the instrument can resolve. A section
shorter than this proves nothing, and a pass on one is reported as not applicable.

**The minimum time loss** over that section, in seconds, against a named reference
competitor with a higher cap, at equal skill. State the unit and the basis: lost per pass,
lost per lap, or lost per section traversed, and against which rival.

**The make-up bound.** The loss must not be cancelled by an acceleration or launch
advantage alone. Measure the loss both over the whole section and over the final stretch
after both competitors have settled at their caps; the second figure isolates the cap from
the launch. If the whole-section loss is small while the settled-stretch loss is large, the
cap is binding and a launch bonus is masking it, which may be a legitimate design and
should be a declared one.

## Procedure

1. **Fix skill across the field** at one tier, and say which. A pass at a skill tier where
   nobody reaches the cap proves nothing about the cap.
2. **Fix the section**: same geometry, same starting state, same seeds across the compared
   competitors, with no combat or interaction between them, so that position effects do not
   contaminate time.
3. **Time the settled stretch separately** from the whole section, as above.
4. **Compare against the declared minimum** and report the achieved loss with its sample
   size, not a bare pass.
5. **Run the mirror**: the same two competitors on a technical section, where the capped
   competitor must not lose. A trade-off that costs time everywhere is a handicap, not a
   trade-off.
6. **Report the skill tier the figures hold at**, and mark any other tier as unmeasured
   rather than extrapolating.

## Decision rules

- When the loss is below the declared minimum, the cap is not binding in play. Check
  whether the section is long enough, whether the competitor's drag or thrust curve makes
  the cap unreachable, or whether a free acceleration advantage has absorbed it; fix that,
  not the minimum.
- When the loss is far above the minimum and the mirror also shows a loss, the competitor
  has been handicapped rather than specialised. Reduce the cap's cost or the technical
  section's reward.
- When the loss appears only at the lowest skill tier, the cap is being confused with poor
  driving. The claim is about the stat sheet and must hold at a tier where the driver does
  not leave speed on the table.
- When the declared minimum was set after seeing results, discard the check and re-derive
  the minimum from the physics of the section.
- When the check is specified but has never run, say so. The invariant is design intent
  until a run has produced the figure with its sample size.

## When not to use this

- **For a contest with no open sections.** Where no section lets a cap bind, the claim has
  nothing to bind on. Say the trade-off is untested rather than passed.
- **Against combat interaction.** Collisions, slipstreaming and weapon effects change
  times for reasons unrelated to the cap. Isolate them for this check and test them
  elsewhere.
- **As a claim about how it feels.** A measured time loss in a deterministic run says the
  trade-off exists in the rules. It does not say a person notices the cap or experiences it
  as a fair price.
