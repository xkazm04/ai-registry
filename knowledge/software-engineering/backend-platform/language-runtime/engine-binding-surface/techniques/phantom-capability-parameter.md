---
layer: technique
type: technique
subject: engine-binding-surface
technique: phantom-capability-parameter
status: forged
laws: [absent-guard-is-loud, unknown-is-not-a-value]
shared_with: []
use_when: [an operation is only legal after some foreign region has been entered, a wrapper has a method that panics when a precondition was not met, deciding whether a run-time state of a foreign runtime should become a type distinction, a type parameter is being added that carries no data]
---

# Phantom capability parameter

A foreign runtime tracks states that gate whole families of operations: a
region has been entered, a lock is held, a context is active. It keeps these in
a field and checks them at the top of every operation, refusing — or worse,
proceeding into undefined behaviour — when the state is wrong.

Mirroring that field in the binding layer reproduces the run-time check and
adds nothing. The alternative is to carry the state as a **type parameter that
has no representation**: the same wrapper type, parameterised by a marker that
says which capability the value currently has, with the operations that need
the capability implemented only for the parameterised form.

The value's size does not change and no code is generated for the marker. What
changes is which programs exist: a caller holding the version without the
capability cannot call the operations that need it, and the error arrives at
the call rather than at run time in the foreign runtime's own words.

## Where the capability comes from and where it goes

The mechanism only works if the parameter cannot be chosen by the caller, so
three things must hold together:

- **It is minted by the operation that establishes the state**, and by nothing
  else. Entering the region returns the parameterised form; the marker type's
  construction is not reachable from outside the layer. This is
  [initialization-proof-tokens](../../../../engineering-process/standards-and-gates/invariant-placement/techniques/initialization-proof-tokens.md)
  with the proof carried in the type of the thing it qualifies rather than
  handed over as a separate argument — the same placement, one fewer parameter
  at every call site, and worth preferring for exactly that reason when there is
  a natural value to attach it to.
- **The unparameterised form remains useful.** The point is a real distinction
  between two capability levels, not a marker bolted onto the only form anyone
  has. If every operation needs the capability, the state is not a distinction,
  it is an invariant of the type, and it belongs in construction.
- **Downstream signatures say which they need.** A routine written against the
  capable form documents its precondition in its own signature for free, and
  the checker enforces it at every caller. This is the whole return on the
  technique, and it is also its price: the parameter propagates through every
  signature that touches the value, which is the declaration cost
  [invariant placement](../../../../engineering-process/standards-and-gates/invariant-placement/invariant-placement.md)
  warns grows with the number of tracked properties. One such parameter reads
  well. Three on one type is a positional puzzle, and at that point the states
  wanted separate types.

## Why this beats the mirrored field

The mirrored field version has a specific, recurring failure: the operation
checks the field, finds the wrong state, and has to do something. It panics, or
it returns a refusal that most callers unwrap, or it silently does nothing. All
three are the guard being present and useless
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) in its
quieter form — the guard exists, and the caller's response to it does not).
Under the type parameter, there is no branch to get wrong because there is no
call to make.

It also removes a state the field version has and nobody wants: *the layer
believes the region is entered and the runtime disagrees*. A field is a shadow
of the foreign runtime's state and inherits every problem in
[ask-the-authority-not-the-shadow](./ask-the-authority-not-the-shadow.md). A
type parameter is not a shadow — it is a record of which construction path the
caller came through, which is a fact about the program rather than about the
runtime, and it cannot drift.

## The two states that must not be carried this way

**A state with a clock.** If the capability can lapse while the value sits
untouched — the region can be exited by something else, the lock can be stolen,
the runtime can dispose of the context — the parameter becomes an expired fact
asserted with the authority of a checked one, which
[invariant placement](../../../../engineering-process/standards-and-gates/invariant-placement/invariant-placement.md)
identifies as strictly worse than no encoding, because the check it replaced
would still have been running. The test is not "does it usually stay true" but
"is there any reachable path on which it stops being true without this value
being consumed". If there is, the state stays a check.

**A state whose absence is meaningful.** Where a caller genuinely needs to ask
*am I in the region?* and take a different path, forcing the answer into the
type means the two paths cannot be written in one function. That is usually
fine and occasionally fatal; when it is fatal the honest surface is a value the
caller branches on, and folding the unknown into a type parameter would render
three situations as one
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

## The liveness obligation

Deleting the parameter, or adding a blanket implementation that supplies it,
makes strictly more programs compile and breaks no test — the silent failure
[constraint-deletion-is-silent](../../../../engineering-process/standards-and-gates/invariant-placement/techniques/constraint-deletion-is-silent.md)
exists to catch. A capability parameter therefore ships with a rejection
fixture per capability: a program that calls the gated operation without having
entered the region, asserted not to compile. One per capability, not one per
operation; the fixture is proving the parameter is load-bearing, not
enumerating the API.
