---
layer: application
type: application
subject: ability-authoring-to-engine
technique: refinement-mode-minimal-diff
stack: next
status: forged
verified_on: 2026-10-14
verified_against: next@16
applied: code
ab_verdict: better
---

# A refine mode whose diff could not see the fields it told the model to keep

The PoF ARPG project's Ability Forge already had a distinct refine mode: a separate task
framing in `src/lib/prompts/ability-forge.ts` carries the prior artifact whole as JSON,
the original concept alongside it, "keep the same className unless the identity changes",
and an explicit list of implied re-derivations (cost falls, so the field and the constructor
value fall). The forge UI keeps the prior and renders a "what changed" panel after each
refine. Steps 1, 2, 4 and 5 of the technique were met by prompt text.

## The seam, chosen to falsify "the mode is conformant"

Step 7 asks that the comparison, not the instruction, be the enforcement. The comparison
here covered numeric and categorical stats, tag sets and a line diff of both code files.
It covered none of `className`, `displayName` or `description`, which are exactly the
fields the prompt says to preserve. Two consequences were reachable:

- A refine that re-picked the display name or rephrased the description produced a panel
  reading "identical ability - no changes detected", and the changed prose shipped past the
  review the panel exists to enable.
- A className change is the one edit the technique classifies as a new generation, and
  nothing marked it as such.

## What A and B were

- **A**: the diff before the change. Three new tests (identity fields reported, empty when
  untouched, a wording-only refine counted as a change) against the old module: 3 of 3
  fail. Floor: the 16 existing diff tests.
- **B**: a pure `diffAbilityIdentity` over the three fields, included in the
  "any change" predicate, and a warning section in the panel that reads "Identity
  changed - this may be a new ability, not a refinement" when the class name moved and
  "Wording changed" otherwise. 19 of 19 tests pass, type check clean, push gate green.

## What was left alone

Detection only. The result still replaces the prior immediately, there is no change-size
threshold, no stale-base check and no hold, because the forge is a single-user session
with no concurrent writer and the prior is kept in history. The technique's rule to stop
and surface a change set over a threshold is therefore met by the panel, not by a gate.
Return condition: when the forge persists a refined ability directly (the adopt path), add
the threshold and the hold there.
