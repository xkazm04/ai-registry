---
layer: technique
type: technique
subject: native-guest-interop
technique: typed-downcast-access
status: forged
laws: [unknown-is-not-a-value, one-validation-door]
shared_with: []
use_when: [host code needs the concrete host value back out of a guest object whose payload was type-erased, a native function needs per-context host state such as a connection pool or configuration, a guest script might pass an object of the wrong host type to a native method]
---

# Typed downcast access

## The concern

Once a host value has been erased into a guest object's cell, its type exists
nowhere the compiler can see. Every later access is a runtime claim — *this
payload is the type I am about to treat it as* — and a guest script can
falsify it at any moment by passing a different object to a method that
expected this one. A host that recovers the payload with a reinterpreting cast
has made the claim unconditionally; the moment a script passes the wrong
object, a pointer of one type is read as another and the failure surfaces as
memory corruption somewhere downstream of the call that caused it.

## The procedure

Recovery is a typed downcast: the cell records the identity of the payload
type at construction, the accessor compares the requested type's identity with
the recorded one, and it returns a typed reference only on a match and nothing
on a mismatch. The comparison is a runtime type-identity check, which is
cheap, and the accessor's shape — an optional typed reference — makes the
mismatch a value the caller must branch on rather than an assumption the
caller can forget.

The accessor comes in two shapes and the difference is where the check is
paid. The borrowing shape checks identity on every call and hands back a
borrowed typed reference, which is right for a native method that receives
the object once. The consuming shape checks identity once and returns a
*typed handle* — the same object, with the payload type now carried in the
handle's own type — so that every later borrow through it needs no check at
all. Code that holds an object for many operations downcasts once at the
boundary and keeps the typed handle; code that re-downcasts on every access
is paying the identity comparison to re-learn a fact it already proved.

The accessor is the *only* safe way to reach the payload. The unchecked
reinterpretation exists, because the checked accessor is built on it, and it
is spelled unsafe with the obligation — the payload *is* this type — written
on it. A cell that also exposed the erased pointer as a safe convenience, for
one hot path, would have a second door where the claim is made without the
check, and the second door is the one the next author finds first.

The same shape covers a second question every embedder eventually asks: where
does a native function find the host state — the connection pool, the request
scope, the configuration — that belongs to the context it is running in and
not to any single object? The answer is per-context host state stored in a map
keyed by type identity. The host inserts a value under its own type's key; a
native function asks for that type and receives a typed reference or nothing.
The map carries one stated invariant, and the invariant is the whole reason the
reader can be safe: *the value stored under a type's key is a value of that
type.* The map's insertion routine is the single door that maintains it; the
reader relies on it and does not re-check. A map that admitted a value under an
arbitrary key would have to re-verify at every read, and a reader that skipped
the re-verification would be unsound.

## Decision rules

When a native method receives an object from guest code, downcast it to the
expected host type and treat the failed downcast as a typed guest error — a
type error naming what was expected — because the script author is the one who
passed the wrong value and is the one who can act on the message. Never
substitute a default payload on a failed downcast; a missing type match is
unknown, and unknown rendered as a working default is a wrong answer delivered
with confidence ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

When host state must be reachable from native functions across one context,
store it keyed by type identity with the invariant written on the map's type,
and let the map's insertion be the one door that maintains the invariant, so
that readers stay safe by construction and not by re-checking
([one-validation-door](../../../../_laws.md#one-validation-door)).

When two pieces of host state have the same type — two pools, two
configurations — do not key them by type; wrap each in a distinct newtype so
the key is the *role* and not the representation. A type-keyed map has one
slot per type, and a second insertion of the same type replaces the first;
the insertion should return the displaced value, typed, so that the
replacement is at least observable at the call site, but a returned value
that nobody inspects is still a silent replacement.

When the runtime's own seams — the executor, the module loader — are held
behind an erased interface, recover them the same way: a typed downcast that
returns nothing on a mismatch. The rule is not special to host payloads; it
is what erasure costs everywhere, and a seam recovered by an unchecked cast is
the same bug in a different file.

When host state is global to the process rather than to a context, keep it out
of the per-context map; a value that is the same for every context and lives
in the context anyway is reachable from a context that outlives the state or
is cloned after the state changed.

## When not to use it

A payload that the guest never hands back to the host — stored for its
destructor and nothing else — needs no accessor; give it none, and the
question of a wrong downcast cannot arise.

Host data the host can identify by a stable integer — a row identifier, an
index into a host-side table — is better stored as a guest number and looked
up on the host side. The downcast solves the problem of *recovering a type the
guest erased*; a value that was never a host type has nothing to recover.
