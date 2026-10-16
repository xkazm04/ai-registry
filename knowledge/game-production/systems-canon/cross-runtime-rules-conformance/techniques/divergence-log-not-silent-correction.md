---
layer: technique
type: technique
subject: cross-runtime-rules-conformance
technique: divergence-log-not-silent-correction
status: draft
laws: [one-authority-per-quantity, every-effect-on-the-rules-is-visible, refuse-rather-than-destroy]
shared_with: []
use_when: [the runtimes disagree in a live session, a port quietly adopts the reference's value, deciding which runtime is authoritative after a mismatch]
---

# Divergence log, not silent correction

The named concern: when the reference and the port disagree, the quickest way to green is to
change whichever runtime is easier, usually the port, to match the other. If the reference
was wrong, the port just discarded the evidence of a design bug. If the port was wrong, the
fix is correct but nobody learns which kind of mistake the port makes. Either way, authority
starts moving to whoever edits first.

## The entry

Every mismatch gets an entry before either runtime changes:

- **Where.** The vector or session, the first differing tick, the field, expected and actual
  values, the pin and the builds of both runtimes.
- **Classification.** Data drift (the pin check fails), logic drift (a rule is computed
  differently), arithmetic drift (a rounding difference crossing a boundary), or intended
  divergence (a deliberate per-runtime difference that was never declared).
- **Verdict.** Which runtime is right, and why, in one sentence. "The reference is the
  authority" is a default, not a reason. A reference that applies damage after a shield has
  expired on the same tick is wrong even if it came first.
- **Action.** Fix the port, fix the reference and move the pin, or declare the difference as
  intended and exclude the field from the vectors with the entry as its justification.
- **Status.** Open until the action has landed and the vectors are green against it.

## Procedure

1. Keep the log beside the vectors, in the port's tree, versioned with them.
2. When a vector fails, write the entry from the replayer's output before opening an editor
   on either runtime.
3. When the verdict says the reference is wrong, the fix goes to the authoritative source and
   reaches the port through the pin and a regeneration, never by hand.
4. When the verdict says the port is wrong, fix the port and keep the vector that caught it.
5. Review open entries at each pin move. An entry that stays open across a pin move is a
   known difference shipping.

## Decision rules

- **When the tolerance is the proposed fix, the entry is mandatory.** Loosening a tolerance is
  a declared divergence, not a correction.
- **When the same field diverges twice, classify by pattern.** Repeated arithmetic drift on one
  comparison means the rule needs a stated boundary.
- **When a live session diverges and no vector covers it, add the vector first.** The session
  is the report; the vector is the test.
- **When nobody can say which runtime is right, the design is underspecified.** Take it to
  whoever owns the rules, not to whoever owns the port.

## When not to use it

- **Prototype ports that will be thrown away.** Even then, keep the verdicts if the
  prototype finds reference bugs.
