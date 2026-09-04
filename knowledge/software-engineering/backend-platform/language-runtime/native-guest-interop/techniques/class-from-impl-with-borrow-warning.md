---
layer: technique
type: technique
subject: native-guest-interop
technique: class-from-impl-with-borrow-warning
status: forged
laws: [absent-guard-is-loud, verdict-survives-boundary]
shared_with: []
use_when: [a host type's methods are being exposed to guest code as a class, a derived guest method takes a reference to the host payload and might call back into guest code, host code needs to speak to a guest built-in such as an array or a map through a typed interface rather than as a bag of properties]
---

# Class from impl with borrow warning

## The concern

Exposing a host type to guest code method by method — one native function per
method, each downcasting the receiver, each converting arguments — is
repetitive enough that every runtime eventually grows a derivation: annotate
the host implementation block, and a guest class with the same methods is
generated. The derivation is correct and worth having. What it hides is that
a generated method taking a reference to the host payload must acquire a
**runtime borrow** on the cell, because the guest can alias the object freely
and the compiler cannot prove that no other reference is live. A borrow held
across a call back into guest code — a callback argument, a getter on another
object, a conversion with user-defined behaviour — that reaches the same
object again fails with a second borrow, at run time, deep inside generated
code the author never read.

## The procedure

The derivation generates, for each method in the implementation block, a
native function that downcasts the receiver to the host type, borrows the
payload with the access the method's receiver demands — shared for a shared
reference, exclusive for an exclusive one — converts each argument through the
guest-to-host conversion, calls the method, and converts the return value
back. A method that takes the receiver by value is generated to take a clone
or to consume the payload, according to the host type.

The hazard is not preventable by the derivation. It is a property of where the
method's body goes at run time, which the derivation cannot see. What the
derivation *can* do is put the rule where the author will read it: the
generated class's documentation, and the attribute's own documentation, state
that a method taking a self reference holds a runtime borrow for its whole
body, that re-entering guest code from inside it is a hazard, and that the
remedy is to release the borrow before re-entering — copy what the method
needs out of the payload, drop the reference, then call — or to take the
receiver by value. An author who reads the derivation's documentation is told
the trap and the way around it before writing the first method.

Two details of the generated receiver decide how bad the hazard is. The
first is whether a shared receiver acquires a *shared* runtime borrow or an
exclusive one: a derivation that takes the exclusive borrow for both receiver
kinds, because one code path is simpler, has made every method a hazard
against every other, including the read-only ones, and its documentation's
distinction between the two receivers is no longer true. The second is what
a failed borrow becomes. A runtime borrow that fails by *panicking* the host
process has turned a script's re-entrant call into a crash the script cannot
catch; the derivation should acquire the borrow through the fallible path and
convert its failure into a typed guest error, so that the re-entry is refused
loudly *to the script* rather than to the process. The receiver's *type*
mismatch already takes that route — a wrong object arrives as a typed guest
error with a message the attribute lets the author set — and the borrow
failure deserves the same door.

The same technique owns the other half of typed host-side access: the
**typed wrappers over the guest's built-ins**. A guest array, map, set,
function, promise or typed buffer is, at the object level, a bag of properties
with an internal kind. Host code that wants to push to an array or call a
function should not spell that as property lookups. A newtype over the object
handle, constructed only through a check that the object's kind is the one the
wrapper claims, gives host code a typed method set — push, get, call, then —
and refuses construction with a typed error when the kind does not match. The
wrapper adds no allocation; it adds a proof, at construction, that the methods
it exposes are the ones the object supports.

## Decision rules

When a derived method needs to call back into guest code, copy the fields it
needs out of the payload first and drop the borrow, because the callback may
reach the same object and the runtime borrow will refuse the re-entry loudly;
the loud refusal is correct — the alternative is aliased mutation — and the
fix belongs in the method, not in the borrow.

When the derivation is written, make the borrow hazard part of the generated
documentation and of the attribute's documentation, in the sentence an author
reads before writing methods, because a hazard the derivation knows about and
does not state is a guard the author does not know is missing
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

When a host method must hold exclusive access across a guest call by design —
an iterator that yields into a callback — do not derive it; write it by hand
with the borrow released around each yield, and say in its documentation why
it is not derived.

When host code receives a guest object it intends to treat as a specific
built-in, construct the typed wrapper from it at the boundary, once, and pass
the wrapper inward; the kind check happens where the object entered and every
inner function speaks to a type that has already been proven.

When a typed wrapper's operation can fail in the guest — a getter that throws,
a callback that rejects — the wrapper's method returns the guest error as a
typed host error rather than panicking; a wrapper that panics on a guest
exception has turned a script bug into a host crash, and the same rule
governs the derived receiver's borrow: a refusal the script caused must reach
the script as a value it can catch
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).

## When not to use it

A host type with one or two methods, or whose methods take no self reference,
gains nothing from the derivation that a hand-written native function does
not give more plainly.

A host type whose payload is meant to be shared by reference with guest code
for the object's whole life — a large buffer the guest reads and the host
writes — is not a class but a shared memory region, and the borrow discipline
for it is the typed buffer's, not a method's.
