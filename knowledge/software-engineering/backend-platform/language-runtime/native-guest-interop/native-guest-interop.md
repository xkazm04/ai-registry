---
layer: golden-path
type: golden-path
subject: native-guest-interop
status: forged
use_when: [a host value or host function must live inside an object the guest heap owns, the collector reaches every cell through a type-erased pointer and a host type with its own alignment has to fit that shape, a closure registered as a guest-callable function captures handles the collector cannot see, deciding which numeric widths deserve a fallible conversion and which must be refused, a host future has to be handed to guest code as a promise, a host type's methods are being exposed as a guest class]
techniques:
  - aligned-native-data-cell
  - typed-downcast-access
  - copy-closure-safe-api
  - explicit-lossy-conversion
  - async-native-as-promise
  - class-from-impl-with-borrow-warning
---

# Native-guest interop

An embedded language runtime is useful to its host exactly in proportion to how
much of the host it can touch: a database handle wrapped as a guest object, a
host function callable from a script, a host future awaited as a guest promise,
a host struct exposed as a class. Every one of those is a value crossing a
boundary between two type systems and two memory disciplines, and this subject
is the mechanism set for that crossing — how a host value is represented once
it sits inside a collected heap, how it is reached again without lying about
its type, how a function the collector cannot see into is admitted safely, how
a number is converted without losing width in silence, and how the two
directions of control flow (host calling guest, guest calling host) are kept
from deadlocking on each other's borrows.

Two facts make the crossing harder than a foreign-function call between two
compiled languages. The guest heap is *collected*, and the collector reasons
about every cell through a type-erased pointer whose header it must be able to
read without knowing what the payload is. And the host compiler's guarantees —
alignment, lifetime, exclusive access — stop at the moment its value is erased
into that cell. Each technique below re-establishes, at the boundary, one
invariant that neither the collector nor the host compiler can check on its
own, and the subject's single organising rule is the one the techniques share:
**where a runtime invariant cannot be checked, the safe surface is narrowed by a
type bound until it can be, and the wider surface is spelled unsafe with its
obligation written beside it.** A boundary that instead offers one wide, safe
looking door has moved the check into the caller's head.

## Where this stops, and the neighbours start

The sibling subject [engine-host-contract](../engine-host-contract/engine-host-contract.md) owns the *seams* — the override
points a host implements, the job executor it supplies, the module loader it
provides, and the obligations each seam's documentation states. This subject
owns how a single value or function crosses one of those seams: the cell it is
stored in, the downcast that recovers it, the bound that admits it. The rule
for a reader holding both is that a question about *which* hook exists and
what it must promise belongs to the sibling, and a question about *what shape*
a host thing takes on the guest side of any hook belongs here. The security
subject
[untrusted-extension-host](../../../security/extension-trust/untrusted-extension-host/untrusted-extension-host.md)
owns what an extension may *reach* — the brokered grant, the isolation tier,
the capability subtraction — and this subject owns how any host value is
*represented* once reached; a reach decision belongs there and a representation
decision belongs here.

## A host value is a cell with a header the collector owns

A collected heap is a set of cells, each beginning with a header the collector
wrote: a mark bit, a root count, a pointer to the tracing and dropping routines
for the payload, and whatever else the collection algorithm needs. The
collector walks cells through pointers it has erased to a common type, and it
reads that header at a fixed offset from the pointer. That fixed offset is the
whole design's load-bearing assumption. It holds only while every payload the
header precedes begins at the same alignment, because a payload with a larger
alignment pushes itself further from the header and the erased pointer no
longer knows where the header ends.

The naive embedding puts the host type directly in the cell and lets the
compiler lay the cell out. On the machine where it was written, that works.
On the architecture where the host type's natural alignment is wider than the
header's, or where the compiler reorders fields to save padding, the collector
reads garbage as a mark bit. The resolution is
[aligned-native-data-cell](./techniques/aligned-native-data-cell.md): the host
payload is wrapped in a cell whose layout the compiler is forbidden to reorder,
whose alignment is *forced* to the header's alignment rather than inherited
from the payload, and whose construction carries a compile-time assertion that
the payload's alignment does not exceed that bound. A host type whose alignment
does exceed it — a vector register type, a cache-line-padded counter — is not
rejected; it is boxed by rule, so that what sits in the cell is a pointer whose
alignment is known. The technique also states why the erased handle is a thin
pointer to a cell instantiated with a placeholder payload rather than a fat
pointer to a trait object: a fat pointer doubles the handle and carries the
vtable beside the data instead of in the header the collector already reads,
and the collector then has two places to look for what the payload is. The
header's table carries the payload's type identity, and that one field is
what every downcast in the next section compares against.

## Host data is reached by downcast, never by cast

Once erased, the payload's type exists nowhere the compiler can see. Reaching
it again is a *runtime* question — is this cell's payload the type I am about
to treat it as — and the only honest answer is a typed downcast that returns
nothing when the answer is no.
[Typed-downcast-access](./techniques/typed-downcast-access.md) owns the two
places that question is asked. The first is the guest object itself: a method
that hands back a typed reference to the payload if and only if the stored type
identity matches, so a script that passed the wrong object gets a typed
refusal rather than a reinterpreted pointer. The second is per-context host
state — the connection pool or configuration the host wants every native
function in one context to reach — which lives in a map keyed by type identity
with one stated invariant: the value under a type's key is a value of that
type. That invariant is what lets the map's reader be safe; the map's writer is
the one door that maintains it.

## A function the collector cannot see into

A host function becomes guest-callable by being stored in a guest function
object, and the useful ones are closures: they capture the handle they were
built around. Here the collector's blindness is total. It can trace a cell it
laid out; it cannot trace the environment of a closure the host compiler laid
out, so a captured guest handle is a reference the collector does not know
about, and a heap that frees the referent while the closure still holds it is
a heap with a dangling pointer inside a function the guest can still call.

[Copy-closure-safe-api](./techniques/copy-closure-safe-api.md) is the subject's
organising rule applied to this case. The safe constructor accepts a closure
only under a type bound that makes the hazard impossible — a *copyable* closure
cannot own a collected handle, because a handle that participates in
collection is never copyable — and a second safe constructor accepts arbitrary
captures only when they are passed as an explicit, traceable value the
collector *can* see, with the closure receiving them as an argument. The
constructor that takes any closure at all is spelled unsafe, and its
documentation states the obligation the type system could not: nothing the
closure captures may be a collected handle that the collector is not otherwise
keeping alive. A host that offers the wide constructor as the safe one has
built a use-after-free whose reproduction depends on collection timing. The
bound follows the storage: a closure that lives in a rooted, untraced job
rather than in a heap cell needs no such bound, which is why the promise
bridge in the next section can accept a one-shot future without one.

## A conversion is a promise of exactness, or it is a named operation

Values cross back from guest to host through fallible conversions, and the
temptation is to implement one for every host numeric width. The guest's
number is a double; the host's eight-bit unsigned integer is not; a conversion
between them either loses information or refuses. The language's own
specification defines the lossy conversions precisely — a modular wrap to a
signed thirty-two-bit width, a saturating clamp for an index — and those
definitions are exactly what a script author expects, which is what makes them
dangerous behind a generic conversion trait: the host author reading
`try_from` expects *exact or error*, and receives *wrapped and successful*.

[Explicit-lossy-conversion](./techniques/explicit-lossy-conversion.md) owns the
rule: *exact or error* at every width the trait is implemented for. Where a
width has an obvious exact subset — the integer widths, whose exact values
are the integral in-range ones — the conversion is implemented with a runtime
exactness check, a round trip through the target width that accepts only a
bit-identical result, and refuses everything else with a typed error. Where
the exact subset would surprise the caller — a narrower float, for which
nearly every fractional value fails a round trip — the width is refused by
omission, and the trait's documentation names the explicit cast and the
specification's named coercion so that the loss is chosen, and spelled, at
the call site. The same rule holds in the other direction. A sixty-four-bit
host integer does not fit a double above fifty-three bits; the infallible
host-to-guest conversion is implemented for widths that fit, and the wide
widths convert through an explicit fallible path that fails outside the
safe-integer range rather than rounding.

## A host future becomes a guest promise through a job

Host work is increasingly asynchronous, and guest code expects a promise. The
crossing has three parts and every one of them can be done wrong.
[Async-native-as-promise](./techniques/async-native-as-promise.md) owns them:
the promise and its resolving functions are created synchronously and the
promise is returned at once; the host future is wrapped in a native
asynchronous job that the host's executor drives, and that job — not the
calling frame — awaits the future and settles the resolvers when it completes;
and the future's output is converted to a guest value *inside* the job, where
the context is available, with a host error arriving as a rejection carrying
a typed reason rather than as a host panic. The job holds the resolvers alive
for as long as the future is pending, which is the answer to the question a
collected heap always asks: what keeps the promise from being freed while
nothing yet references its outcome.

## A class from a host type, with its borrow hazard written down

Exposing a host type's methods one by one is tedious, and a runtime that
derives a guest class from a host implementation block is doing the right
thing. The derivation hides a hazard, and the technique's name says what to do
about it:
[class-from-impl-with-borrow-warning](./techniques/class-from-impl-with-borrow-warning.md).
A method taking exclusive access to the host payload must acquire a runtime
borrow on the cell, because the guest can alias the object freely and the
compiler cannot prove exclusivity. If that method re-enters guest code — calls
a callback, triggers a getter, formats a value that has a custom conversion —
and the guest code touches the same object, the second borrow fails at run
time, loudly. The derivation cannot prevent this; what it must do is *say so*,
in the documentation the host author actually reads, with the rule for
avoiding it: drop the borrow before re-entering, or take the payload by value.
The same technique owns the typed wrappers over the guest's built-in
collections and functions — newtypes over an object handle that verify the
object's kind at construction so that host code speaks to an array as an array
and not as a bag of properties.

## What the naive reading gets wrong

The naive reading is that this is foreign-function interop with a different
spelling, and that the host language's safety guarantees carry across. They do
not. Every guarantee the host compiler makes is made about values it can see,
and the crossing erases exactly the information those guarantees rest on:
alignment at the cell, type identity at the downcast, reachability at the
closure, exclusivity at the borrow. The seam between collector and compiler
is where neither checks anything.

The second naive reading is that a safe API should do everything a host
author might want, and that an unsafe constructor is a failure of design. It
is the opposite. A boundary whose *safe* surface is exactly what the type
system can prove sound, and whose unsafe surface is spelled unsafe with its
obligation beside it, has told the truth about what it can check. The one
wide safe door has moved the obligation into the caller's head without saying
so ([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)).

The third is that a conversion that succeeds has converted correctly. A
conversion trait is read by its caller as a promise of exactness, and a lossy
implementation behind it converts *does not fit* into a confident wrong number
at the one place the caller trusted the type system to say no
([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)).
