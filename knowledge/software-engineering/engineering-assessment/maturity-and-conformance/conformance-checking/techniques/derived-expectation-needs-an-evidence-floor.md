---
layer: technique
type: technique
subject: conformance-checking
technique: derived-expectation-needs-an-evidence-floor
status: forged
laws: [failure-not-empty-success, count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [a check computes its expected value from the artifact under test instead of from a fixture, writing a drift check between a published manifest and the code it describes, a suite is green and nobody can say how much evidence it read, the population under check legitimately contains empty cases]
---

# A derived expectation needs an evidence floor

[declared-then-proven](./declared-then-proven.md) ranks checks by how they
verify a declaration: presence, shape, execution. All three assume the
declaration's *subject* is reachable — a path to stat, a module to load, a
command to run. A fourth shape appears when it is not, and the ladder has no
rung for it: the check **derives what the declaration should say** from the
source of the thing it describes, and asserts equality.

This is the only move available when the subject cannot be resolved at check
time. A manifest of optional dependencies is the standard case: the packages
are deliberately not installed, so nothing can be loaded, run, or stat-ed —
the only evidence in the room is the source text that imports them. Deriving
the expectation from that text and diffing it against the published manifest
is a real and strong check. It is also the one shape that **fails toward
silence**, and the reason is structural rather than careless.

## Two ways to satisfy a derived assertion

`declared ⊇ derived` is true when the declaration is right. It is also true
when `derived` is empty — and an empty derivation is not an error, it is the
same green as a correct one. Every derivation has a failure mode that returns
nothing: the pattern stopped matching after a rename, the traversal stopped
following a moved file, an argument order changed, a formatter split the call
across lines. None of those throw. They subtract evidence, and subtracting
evidence from a superset assertion makes it *easier* to pass.

The trap closes when the population **legitimately contains empty cases** —
which it almost always does, because the reason to derive rather than declare
is that most members have nothing to declare. Measured on a store adapter
library that publishes exactly this kind of manifest: 33 adapters, 24 derived
dependency facts, 14 adapters legitimately deriving nothing. Renaming the one
helper the derivation pattern keys on — an ordinary refactor, in the
implementation, not the check — moved it to 0 derived facts across all 33.
The report was identical in both arms: 33 passed, 0 failed. The number that
separated a working check from a disarmed one appeared nowhere in its output.

A per-case negative control does not catch this and is worth understanding
why, because it is the reflex.
[negative-control-tests](../../../../engineering-process/build-and-release/test-harness/techniques/negative-control-tests.md)
says to break the thing under test and watch the assertion fire; mutate one
adapter's declaration and the check does fail, correctly, so the instrument
certifies as validated. But the mutation exercised one case's *comparison*,
and what breaks in the field is the *derivation shared by every case at
once*. The control proved the arm that was never in danger.

## The floor

**A check that derives its own expectation must assert the size of what it
derived, and that assertion belongs to the population, not to the case.**

- **Publish the count.** The check reports how many facts the derivation
  produced, beside pass and fail. A count with no predicate is the thing this
  corpus already has a law about
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate));
  the predicate here is *what the derivation matched, over what population*.
- **Fail below a floor.** Not a floor per case — the empty cases are real —
  but one over the whole run: this population has yielded 24 facts across
  every commit for a year, and a run yielding 3 is a broken derivation, not a
  refactor that deleted 21 dependencies. A crude absolute floor catches the
  total-collapse case, which is the one that actually happens; a floor
  expressed as *last known count, minus a tolerance* catches partial decay
  too and costs one committed number.
- **Separate "derived nothing" from "derived and matched" in the per-case
  result.** Two green marks that mean different things are undifferentiated
  green, which
  [declared-then-proven](./declared-then-proven.md) already names as the
  defect; here the two spellings are *no evidence* and *evidence agreed*, and
  a reader cannot tell fourteen honest empties from thirty-three broken ones
  without them.
- **Pin the derivation's own contract.** The derivation depends on facts
  about the source that no compiler is protecting — a helper's name, its
  argument order, that its arguments are literals. Assert at least one of
  them directly, so a rename breaks a check that names the rename instead of
  quietly widening the assertion.

## Where the floor goes, and where it does not

The floor is a property of the run, so it lives with the harness that
enumerates the population — not inside the per-case assertion, which cannot
see its siblings and is exactly the scope where the empty case is legitimate.
This is the same split
[rule-registry-enumerated-fixtures](./rule-registry-enumerated-fixtures.md)
makes for a rule registry: the harness enumerates and asserts something no
individual rule can, and the enumeration is what turns an omission into a red
build instead of a review item. There, the harness asserts each rule *can*
fire. Here it asserts the derivation *did* find something. Both are the same
observation — that a suite of green cases is not evidence its instrument ran
— applied to the two shapes where the instrument is shared.

Do not reach for this when the expectation is a **fixture**. A committed
expected value cannot silently become empty; it is in the diff. The floor
exists specifically because a computed expectation has no diff, and its
degradation to nothing is invisible in exactly the artifact a reviewer would
consult.

Do not use a floor as a substitute for making the derivation robust where it
can be. If the declaration's subject *is* reachable — the module loads, the
symbol resolves — resolve it through the project's own indirection and skip
this entirely; that is
[declared-then-proven](./declared-then-proven.md)'s wiring rule and it is
strictly better evidence. The derived shape is for when that road is closed,
and the floor is the price of taking the road anyway.
