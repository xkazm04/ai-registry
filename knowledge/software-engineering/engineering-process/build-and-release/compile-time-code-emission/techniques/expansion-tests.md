---
layer: technique
type: technique
subject: compile-time-code-emission
technique: expansion-tests
status: forged
laws: [gate-sees-target]
shared_with: []
use_when: [an emitter is tested only by the code that uses it, a refactor moved a macro diagnostic to the wrong token without failing a test, an exported generator compiles at every call site in its own package, setting up tests for a new macro or source generator]
---

# Expansion tests

An emitter has three properties that only exist at the compiler boundary, and
each needs its own test layer. Tests of the code that *uses* the emitter cover
none of them well: they prove that today's call sites compile and behave,
which is a proxy for the emitter's contract, not the contract
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## The three layers

**Expansion snapshots - what the emitter produces.** For a set of
representative inputs, expand and compare the output text with a stored
expectation. This catches the change nobody intended: an extra clone, a
dropped attribute, a rooted path that became bare. Several hosts ship this
directly - an expansion-assertion helper in one macro ecosystem, a generator
test harness from one vendor, fixture pairs of input and expected output in
codemod toolkits. Snapshots are reviewed like code: a changed snapshot in a
diff is the change.

**Compile-fail fixtures - what the user sees when the input is wrong.** For
each diagnostic the emitter can produce, a small input that must fail to
compile, with the expected compiler output stored beside it. The harness
fails when the input compiles, when the message changes and when the location
moves. A compile-fail harness's own documentation names the regression this
catches: a refactor that makes a correct error stop being emitted or be
emitted in the wrong place. It also catches the host changing how it renders
diagnostics, which is a reason to keep the fixture count proportionate - one
per distinct diagnostic, not one per input variant.

**Foreign-caller probes - whether the expansion compiles where it is used.**
Compile each exported emitter's expansion from a package that shares nothing
with the defining one but the dependency edge, with a common alias rebound in
scope and every product the invocation asks for referenced. This is the only
test that stands where a foreign caller stands; module design's hygiene
technique owns its exact shape and its positive control.

## Test the logic below the boundary

The emitter's own logic - parsing the little language, deciding which arm to
emit - is ordinary code and deserves ordinary unit tests, but in many hosts
the representation it manipulates can only be constructed inside the
compiler. The ecosystem answer is to work on a plain mirror representation
that can be built anywhere and convert at the edges, so the logic is testable
outside the host; module design's mirror-type technique owns the pattern. One
host design makes emitters separate programs precisely so they can be unit
tested by expanding sample input in an ordinary test.

## Procedure

1. Write the snapshot set first, from the inputs the documentation shows.
2. Add a compile-fail fixture for every diagnostic in the emitter's source.
   A diagnostic without a fixture is an untested interface.
3. Add the foreign-caller probe for every exported emitter.
4. Run all three in the emitter package's own test lane, so a change to the
   emitter cannot merge without them.

## When not to use this

An emitter private to one module, invoked at a handful of sites beside it,
can rely on those sites' tests plus compile-fail fixtures for its
diagnostics; snapshots and foreign probes start paying once it is exported or
invoked from more than one package.
