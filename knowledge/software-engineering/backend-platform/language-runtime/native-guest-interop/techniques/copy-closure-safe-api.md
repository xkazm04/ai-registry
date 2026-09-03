---
layer: technique
type: technique
subject: native-guest-interop
technique: copy-closure-safe-api
status: forged
laws: [absent-guard-is-loud]
shared_with: []
use_when: [a host closure is being registered as a guest-callable function, a native function needs to capture a guest object or a guest value across calls, designing which constructor of a native-function type is safe to call and which is spelled unsafe]
---

# Copy-closure safe API

## The concern

A host closure registered as a guest function is stored inside a guest
function object, which lives in the collected heap. The collector traces cells
it laid out; it cannot trace the environment of a closure the host compiler
laid out, because that environment is opaque to it. A closure that captured a
guest handle therefore holds a reference the collector does not know about. If
nothing else keeps the referent alive, the collector frees it, and the guest
can still call the closure that points at freed memory. The failure reproduces
only under a particular collection timing, which is the worst kind of failure
a runtime can ship.

## The procedure

The invariant the collector needs — *every guest handle reachable from this
closure is also reachable from somewhere the collector traces* — is not one
the type system can state directly. What it can state is a bound that makes a
violation impossible, and the safe surface is narrowed to that bound.

The first safe constructor accepts only closures that are **copyable**. A
handle that participates in collection is never copyable: it carries a root
count or a tracing obligation, and copying it bitwise would break the count.
So a closure that is copyable *cannot* have captured one, and the constructor
that demands copyability has proven, through the compiler, that the closure's
environment holds nothing the collector needs to see. The bound is a proxy for
the real invariant, but a sound one: every closure it admits is safe, and the
closures it rejects are exactly the ones that captured something.

The second safe constructor covers the closures the first rejects — the useful
ones, that need a guest object or a guest value across calls. It takes the
captures as an explicit, separate argument whose type the collector *can*
trace, stores that value in the function object where the collector will find
it, and hands it back to the closure as a parameter on every call. The closure
itself is still required to be copyable; the state it needed lives in a
traceable slot rather than in an opaque environment. The author writes the
capture once, explicitly, and the collector sees it.

The constructor that accepts any closure at all is spelled unsafe. Its
documentation states the obligation the compiler could not enforce: the
closure must not capture a collected handle that nothing else roots for the
function's lifetime. The word is the whole point. A caller who reaches the
unsafe constructor is told, by the spelling, that a check has moved into their
hands, and a reviewer who sees the spelling knows to ask for the argument.
The safe constructors are thin wrappers that call the unsafe one with the
bound as their whole safety argument, which keeps the storage code in one
place and makes the argument one sentence long.

The bound follows the *storage*, not the closure. A closure is dangerous
because it is stored inside a cell the collector owns and cannot see into. A
closure that is instead stored in a rooted, untraced unit — a queued job the
executor holds until it completes — is never inside the heap; whatever it
captured is kept alive for the job's lifetime by the job being a root, and no
copyability bound is needed. So the same host-facing surface can offer the
copyable-closure constructor for a function object that lives in the heap and
an unbounded one for a one-shot future the queue holds, and both are safe for
different reasons. An author who sees the two side by side and assumes the
unbounded one is an oversight has missed where the closure goes.

## Decision rules

When a closure needs no guest state, use the copyable-closure constructor and
let the compiler prove the environment empty of handles; when it needs guest
state, pass the state as the explicit traceable capture and keep the closure
copyable, because the capture in the traceable slot is the one the collector
will keep alive and the environment is the one it will not.

When the two safe constructors cannot express a case — a capture whose type
cannot implement tracing, a handle from a foreign heap — use the unsafe
constructor and write the rooting argument at the call site, because an
obligation that lives only in the constructor's documentation is not visible
at the place it was accepted.

When designing the constructors, make the safe ones the shortest to spell and
the unsafe one the longest, because authors converge on the shortest path; a
boundary whose wide door is also its convenient door has made the guard
optional, and an optional guard protects the examples and not the fleet
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

When a root count exists on handles, do not read a rooted handle inside an
opaque closure as safe merely because it is rooted today — the root is
released when the last rooted copy drops, and a copy inside an environment the
collector cannot see is not one it counts.

## When not to use it

A runtime whose collector is reference-counted with no tracing — where every
handle keeps its referent alive by holding it — has no untraced-capture hazard
and the copyability bound buys nothing; cycles are that runtime's problem, and
they are not solved at the closure boundary.

A function registered with no captures and no state, from a plain function
pointer, is already copyable and needs no constructor choice; the technique is
about the closures that tempted an author to capture.
