---
layer: technique
type: technique
subject: cross-runtime-rules-conformance
technique: planted-mutation-proves-the-suite
status: draft
laws: [no-gate-self-certifies, unmeasured-is-not-a-pass, an-instrument-proves-it-had-input]
shared_with: []
use_when: [a conformance suite has never failed, a suite is about to be cited as evidence of equivalence, the vectors were generated from the port itself]
---

# Planted mutation proves the suite

The general rule, that a check which has never failed anything is unmeasured rather than
passing, is owned by
[flag-your-own-shipped-defaults](../../../systems-canon/design-canon-as-executable-law/techniques/flag-your-own-shipped-defaults.md).
It is not restated here. This technique applies that rule to a cross-runtime conformance
suite, where the question is narrower: **which vectors would notice if the port got a rule
wrong?**

The named concern: a conformance suite goes green on its first full run and is cited as proof
that the port matches the reference. Green on an unmodified port is one half of a
measurement. The other half is the same suite on a port known to be wrong.

## Where to plant

In the port's rules, not in the vectors and not in the replayer. Mutating a vector tests the
comparison code. Mutating the port tests whether the vectors exercise the rule.

- **One fault per run.** A constant changed by one step, a comparison flipped from strict to
  inclusive, a clamp removed, a tick offset by one. Each is the kind of mistake a port
  actually makes.
- **Pick faults across rule families.** A fault in a cap, a fault in a rate, a fault in an
  ordering. One family proven sensitive says nothing about the others.
- **Never in the pinned data.** A data mutation is caught by the pin check before the vectors
  run, so it proves the pin, not the suite.

## The three runs

1. **Green.** The unmodified port, every vector. Record the count and the exit code.
2. **Planted.** One fault, rebuilt, every vector. Record which vectors failed and the first
   failing tick and field of each. A planted fault that fails nothing is a finding about the
   suite: no vector reaches that rule, or none reaches it far enough.
3. **Restored.** The fault removed, the source confirmed identical to the starting revision,
   rebuilt, every vector. Green again. Without this run, nobody can rule out that the planted
   run failed because of something else that changed during the rebuild.

## Reading the result

The output is a **sensitivity map**: for each planted fault, the vectors that caught it. Read
it in both directions.

- **The catching vectors** are proven able to fail on that rule. They are not proven able to
  fail on anything else.
- **The vectors that stayed green** are not shown to catch anything by this run. If a vector
  is named after the mutated rule and stayed green, look at its length and setup: it probably
  stops before the rule's limit matters.
- **A fault caught only by long mixed bouts** means no short, isolated vector covers that
  rule. Add one, so the next failure names the rule directly.

A fault caught by a few vectors meets a bar of "the suite can bite". It does not support a
claim of "the suite catches porting errors". That claim needs a fault per rule family and a
map with no empty rows.

## Decision rules

- **When the suite is cited, cite the map beside the green count.** Name how many faults were
  planted and how many vectors caught each.
- **When a rule family has no planted fault yet, list it as unproven.** Do not average it into
  the families that have one.
- **When the vectors were generated from the port**, a planted fault in the port changes the
  expectations at the next regeneration, so it can never fail. Regenerate from the reference
  before planting anything.
- **When the planted fault is caught, put it back by restoring the file, not by retyping it.**
  Then compare the file with the starting revision.

## When not to use it

- **As a one-off at launch.** Repeat at least when the pin moves or a rule family is added.
- **When each run costs a full engine rebuild and the schedule cannot hold three.** Plant
  fewer faults, but never drop the restored run.
