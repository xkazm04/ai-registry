---
layer: technique
type: technique
subject: guest-language-introspection
technique: realm-factory-for-cross-realm-tests
status: forged
laws: [gate-sees-target]
shared_with: []
use_when: [a specification rule about brand checks or prototype identity across globals must be tested from a script, a cross-realm test is passing and nobody has checked that the second realm is real, deciding what the realm factory returns]
---

# Realm factory for cross-realm tests

A realm is a global object together with the complete set of intrinsics it was created
with — its own object prototype, its own array constructor, its own error types, its own
copies of every built-in. Two realms are two of everything. A whole class of
specification rule exists only because programs move values between realms: an array
made in one is still an array in the other even though the constructors differ; a brand
check must accept the other realm's instances; an error thrown by one realm's
constructor is caught by a handler that compares against the other's; a prototype-
identity shortcut that works within one realm is wrong across two. None of that can be
tested inside one global scope, and constructing a second realm from the host side
produces a test that is half in another language. The factory puts the second realm
one call away from the script.

## What the factory returns

The factory takes no arguments and returns the new realm's **global object**. Not a
wrapper, not a handle, not an evaluator — the global itself, so that every intrinsic is
reachable the way the language reaches it: as a property of the global. A test that
wants the other realm's array constructor writes the property access; a test that wants
to run source in the other realm gets the other realm's evaluator function from the
global it was handed and calls it, and the evaluator runs in the realm it belongs to
because that is what the specification says a realm's evaluator does.

This is a deliberate divergence from the conformance host object's realm factory, which
returns a wrapper carrying an explicit evaluator and a reference to the global, because
the conformance suite's tests are written against that wrapper's shape and cannot be
written any other way. The debug factory is for the engine's own tests, and the global
itself is the more honest return: everything the test could want is one property read
away, and nothing about the shape needs documenting beyond "it is a global".

The new realm is created *inside the caller's context*, through the same realm
constructor the conformance host object's factory uses: the caller's host hooks, the
caller's shape tree, the caller's job queue and limits, and a fresh set of intrinsics.
It does not inherit the caller's flag-gated debug global unless the flag installs it,
and it does not inherit anything the caller's guest code added to its own global. The
two realms share the engine, the collector, the job queue and the limits; they share no
objects.

The shortcut to refuse is building a whole throwaway *context* and handing back its
global. It produces a global whose intrinsics are distinct, so the first assertion
below passes, but the realm was born under default host hooks rather than the caller's,
under a different shape tree, and with a job queue that was dropped with the context —
so a promise resolved in that realm has nowhere to run, a host hook the test relies on
is absent, and shape-identity comparisons across the two realms compare trees that
never shared a root. When the engine already has an in-context realm constructor, the
factory is one call to it; when it has two realm constructions, the debug one and the
conformance one, they are already disagreeing about what a realm is.

## The first assertion proves the realm is real

The failure this technique exists to prevent is the fake realm: a factory that creates a
new global object whose prototype chain, intrinsics or well-known symbols still reach
the caller's. It is an easy factory to write — allocate a global, point its prototype at
the existing object prototype, copy the constructors across — and every cross-realm test
written against it passes, because there is no second realm for anything to cross. The
green run is a gate over a proxy: the test read a scope that looked like a realm and was
not one.

So every test that uses the factory, and the factory's own test first of all, opens with
the assertion that the new realm's object prototype is not the caller's — and, if the
engine supports it, that the new realm's array constructor is a different function from
the caller's while an array made by the new constructor still passes the language's
array predicate. Those two lines assert that the intrinsics are distinct and that the
cross-realm rule the specification requires holds across them. If the first line fails,
the factory made a scope; if the second fails, the engine's cross-realm rule is broken;
and a suite that skips both is a suite whose cross-realm coverage is nominal.

## The tests the factory enables

Once a real second realm is one call away, the cross-realm class of test becomes short:

*Brand checks across realms.* Create an instance of a built-in in the other realm and
call this realm's method on it; the method accepts it, because brand is an internal slot
and not a prototype. The same call with a plain object that mimics the prototype is
rejected. Both halves in six lines.

*Error identity across realms.* Throw from the other realm's constructor and catch here;
the caught value is an instance of the other realm's error type and not of this one's,
which is the rule that makes cross-realm error handling by constructor equality wrong
and error handling by structured field right.

*Prototype identity shortcuts.* Any engine fast path that checks "is this the array
prototype" by pointer equality is a cross-realm bug waiting for a second realm; the
test creates the other realm, runs the operation on its array, and asserts the result
matches the same operation on a local array.

*Global-scope leakage.* Define a global in the new realm, assert it is absent from
this one, and the reverse. The assertion that catches the fake realm's cousin: two
globals with a shared variable environment.

## Lifetime and cost

A realm is not free — the intrinsics are hundreds of objects — and a factory called in
a loop is a test that measures the collector. The realm lives as long as the guest holds
a reference to its global or to anything that reaches its intrinsics, and is collected
like any other object graph; the factory does not register it anywhere the guest cannot
see, because a realm registry that outlives the test's references is a leak filed under
a feature. A test that needs many realms creates them in a loop and drops them, and
forcing a collection afterward through the collector namespace is how it asserts they
went.

## When not to use it

A test that needs a second *context* — a different host, different limits, a different
set of host hooks — is an embedding test and belongs on the host side, because the
factory reproduces the caller's context configuration and cannot vary it. A test about
module loading across realms needs the host's loader hooks and is likewise a host test.
And the factory is not the way to isolate tests from each other's global state; that is
the test runner's job, done by giving each test file a fresh context, and a suite that
uses the realm factory for isolation has moved a runner concern into every test.
