---
layer: technique
type: technique
subject: invariant-placement
technique: string-keyed-context-is-an-unchecked-join
status: forged
laws: [absent-guard-is-loud, failure-not-empty-success, gate-sees-target]
shared_with: []
applied: experiment
ab_verdict: unmeasurable
use_when: [steps pass data through a per-request map from a string to an untyped value, a guard reports success and its timing looks healthy but it has stopped checking, commands cross a boundary as untyped documents, a configurable action reports success and nothing reads what it wrote, a test seeds a context with the key it expects]
---

# A string-keyed context is an unchecked join

A per-request bag that maps a string to a type-erased value lets any step pass data to any other without a
shared declaration. That is why teams reach for it. It also means writer and reader agree only by spelling,
in two files the compiler never relates.

The read returns nothing both when the key is absent and when the stored type differs, and the caller
supplies a default. So a mismatch does not fail. It takes the default branch, and for a check, a filter or a
guard the default branch is the pass path. The step reports success, its timing looks healthy, and the
feature it implements has stopped existing. Measured on our own bag: a guard reading one spelling while the
writer used another returned "nothing to check", and so did a right spelling holding the wrong type. The
control with both right refused.

Unit tests do not see this. They call the step's inner functions directly, or seed the bag with the key they
expect, so they repeat the misspelling.

## Close it in the type

Choose by how open the set of steps is.

- **A closed set of steps:** give the context named fields. A missing writer becomes a compile error or a
  visibly unset field.
- **An open set:** bind the name to its value type in a typed key constant that the writer declares, so a
  reader must import what the writer declared. On the same bag, a reader naming a key nobody declared and a
  writer storing the wrong type each stopped compiling, and the right pairing returned the value.
- **A map keyed by value type alone** removes spelling but lets two steps collide on a common type, so wrap
  each value in its own type.

## Where the bag must stay

Make it auditable. Diff the literal keys written against those read and gate on the result. Read-never-written
is a failure. Written-never-read depends on where the bag sits:

- **Inside one request's handlers** it may stay a report. It is the "dead knob" class in
  [instrument-per-orphan-class](../../../codebase-stewardship/dead-code/techniques/instrument-per-orphan-class.md):
  a settable action whose written key has no reader.
- **Across a command boundary** it is a failure. There the writer is expressing an intent, and a reader that
  ignores it acts without it: a scoping argument nobody reads turns a narrow operation into a broad one, and an
  identifier nobody reads turns an exact approval into a general one.

Say what the diff cannot see. A key built at runtime escapes it, and a one-line pattern misses a chained call
that breaks before the read; two scans of this kind reported false survivors until each key was re-checked by
a literal search.

A safety step should also refuse, not pass, when the input it exists to inspect is absent while its
configuration says it should run. "Nothing to check" is a valid answer only if something proves there was
nothing ([_laws: failure-not-empty-success_](../../../../_laws.md#failure-not-empty-success)).

## When not

A bag read only for diagnostics, where a miss costs a blank field in a log. A store with one typed accessor
per key is already closed, which is [typed-accessors](../../../../operations/governance-and-records/settings/techniques/typed-accessors.md).
