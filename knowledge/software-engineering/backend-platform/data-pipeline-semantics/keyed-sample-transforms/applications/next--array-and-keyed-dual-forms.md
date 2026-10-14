---
layer: application
type: application
subject: keyed-sample-transforms
technique: array-and-keyed-dual-forms
stack: next
status: forged
verified_on: 2026-10-14
verified_against: next@16
applied: code
ab_verdict: better
---

# Dual forms in a watch-list delta library (TypeScript)

A civic-data application derives "what changed since your last visit" for one
followed entity and for a whole watch list. The entity form takes an input
bag (records, optional forensic records, an optional recomputation fact, a
cap, a since-day) plus one key and returns that entity's delta. The list form
takes the same bag plus a list of keys, de-duplicates and validates the keys,
calls the entity form once per key by spreading its own input, and owns only
the final ordering. The shape already matches the technique: the list form
holds no operation logic, and the single-entity form is separately callable.

## What was tested

The seam was chosen to falsify "the shape alone is enough". Spreading the
whole input into the delegate forwards every parameter, so parameter drift
cannot occur today; the question was whether anything would notice if a later
edit replaced the spread with an explicit parameter list. A mutant of the list
form that forwarded only records, since-day and the recomputation fact left
all 38 existing tests green: neither the cap nor the forensic records were
covered by any list-form test.

Arm B added a parity test: for each parameter (cap, forensic, recompute,
defaults) build both forms from one argument set and compare outputs on a
one-key list. Against the same mutant it fails 2 of 42; against the real code
it passes. A mutant dropping every optional parameter fails 4 tests, one of
them an existing recompute test, so the old suite caught one of the three
parameters and the new test catches the other two.

Target: parameter-drop mutants caught, 1 of 3 to 3 of 3. Floor: the schranka
suite (131 tests), the type check and the linter stayed green.

## Limits

The parity test pins drift in the forwarding, not drift in the operation, and
it lists the optional parameters by hand: a parameter added to both forms
still needs a case here. The technique's own parameter rule held unchanged;
this application only supplies the mechanical catch it recommends.
