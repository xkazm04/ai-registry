---
layer: technique
type: technique
subject: engine-binding-surface
technique: address-sensitive-construction
status: forged
laws: [one-validation-door, absent-guard-is-loud]
shared_with: []
use_when: [a foreign call records the address of a structure the host allocated, a wrapper is being made non-movable and the API got much harder to use, deciding whether a foreign object belongs on the host stack or behind an allocation, a destructor must run only for a structure that was actually initialized]
---

# Address-sensitive construction

Some foreign objects become address-sensitive at a specific moment: the
constructor hands the object's own address to the runtime, which stores it —
in a linked list of active regions, in a thread-local stack, in a field of the
parent object — and from that instant the structure may not move. Copying its
bytes elsewhere and using the copy is undefined, and the failure is not a crash
at the move. It is a crash later, in the runtime, when it follows the pointer
it kept.

This is a direct collision with the host language's model, in which values are
ordinarily free to move and the compiler moves them whenever that is
convenient. The type must therefore say, in a way the checker understands,
*this value may not be relocated* — and the mechanism that does so generally
applies to a value that is **already at its final address**, which the value is
not while it is being returned from a constructor.

## The move: two values, one transition

Split what looks like one construction into two objects with a transition
between them.

1. **Storage.** A plain, movable value holding uninitialized room for the
   foreign object plus one flag recording whether initialization has happened.
   It is created and returned like any other value, moved as often as the
   caller likes, because nothing has taken its address yet.
2. **The pin.** The caller fixes the storage at an address — on the stack at
   the point of use, which is where these objects want to live, or behind an
   allocation where the lifetime demands it. Nothing foreign has happened yet;
   this step is purely the host language committing not to move the value.
3. **Initialization.** Only now is the foreign constructor called, on a value
   whose address is already final. It sets the flag, and it hands back a
   reference type that is the *only* thing the rest of the API accepts.

The result is a single door: operations take the initialized reference, so a
caller holding uninitialized storage cannot call them, and the address-sensitive
window begins at exactly one statement in the whole layer
([one-validation-door](../../../../_laws.md#one-validation-door), applied to a
value rather than a store).

## The flag is not bookkeeping; it is who owns the destructor

The storage type — not the foreign object — implements the destructor, and it
runs the foreign destructor **only if the flag says initialization happened.**
This matters more than it looks. The three states a naive version conflates are
all reachable: storage created and dropped without ever being initialized;
storage initialized and dropped normally; storage whose initialization is
attempted twice because the caller reused the slot. Running a foreign
destructor over uninitialized bytes is as undefined as skipping it over
initialized ones, and neither is detectable afterwards
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud): the missing
teardown announces nothing).

Where reuse is supported at all, the honest implementation is the same
transition run backwards inside the initializer: if the flag is already set,
tear the old occupant down first and clear the flag *before* constructing the
new one, so a panic between the two leaves a slot that will not be destructed
twice.

## The ceremony is the deliverable, not a wart

The three steps are visible at every call site, and this reliably attracts a
proposal to hide them behind one call. Resist it for the general path, and be
precise about why: the steps are separate because the *caller* must choose the
address, and a helper that chooses on the caller's behalf has either put the
object somewhere the caller cannot control or has introduced an allocation the
caller cannot see. The correct compression is a macro or equivalent that
expands to the same statements in the caller's own frame — the ceremony is
still there, still binding the value to that scope, merely not retyped. A
helper that *returns* an initialized object has silently made the object
movable again and is the bug this technique exists to prevent, wearing the
costume of ergonomics.

Two consequences worth stating for the reader who meets the API:

- **A routine that accepts one of these objects takes the initialized
  reference type**, never the storage, and never by value. This is what makes
  the ceremony a one-time cost at the outermost frame rather than a cost at
  every call.
- **Where several such types form a hierarchy**, the derived object's storage
  must begin with the base's fields at identical offsets, and every routine
  taking the base becomes reachable from the derived one by prefix access —
  which is [hierarchy-as-three-relations](./hierarchy-as-three-relations.md),
  and which is only sound if the layout assumption is asserted at build time
  rather than assumed.

## The negative artifact, without which none of this is measured

The entire value of the split is that certain programs no longer compile:
storing the object in a heap allocation the caller chose, returning it from the
function that made it, using a handle derived from it after it has gone. That
is the class of guarantee with no failing test by default —
[constraint-deletion-is-silent](../../../../engineering-process/standards-and-gates/invariant-placement/techniques/constraint-deletion-is-silent.md)
— and a binding layer must keep the explicit rejection artifacts or it has no
way to know the guarantee survived a refactor. One fixture per shape of misuse;
the count stays small enough that each is read when the toolchain's output
shifts.

## When not to use it

**When the foreign object is not actually address-sensitive.** Many are not —
they hold a pointer and two flags and the runtime never learns where they live.
The cost of this pattern is real and paid at every call site, so it is worth
checking rather than assuming: does the constructor pass its own address
anywhere? If not, a plain owned wrapper with a destructor is correct and much
kinder.

**When the object's address must be stable but its lifetime is not tied to a
frame.** Then the answer is an allocation whose address does not change, and the
pin is trivial. The transition and the flag still apply; the visible ceremony
does not, because the allocation supplies the fixed address.
