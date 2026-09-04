---
layer: technique
type: technique
subject: guest-execution-bounding
technique: bounded-shadow-backtrace
status: forged
laws: [record-precedes-effect, limits-are-derived]
shared_with: []
use_when: [a limit failure reaches the host with no source position, an error caught and rethrown by an engine-internal handler has lost where it happened, a recursion breach allocates a backtrace as deep as the recursion that caused it, native frames between guest frames vanish from the reported stack]
---

# Bounded shadow backtrace

## The concern

The frame stack knows where execution *is*; it does not know where it *was* when a
failure was raised, once the frames have been popped, and a failure that reaches the
host after an unwind has nothing to point at. The guest language may build its own
backtrace on error construction, but engine-class failures are not constructed by the
guest, native routines are not guest frames, and a backtrace built lazily at the point
of reporting reads a stack that the unwind has already destroyed. The technique keeps a
**shadow stack**: a parallel, cheap record of positions, pushed and popped with the
frames, from which a backtrace of bounded length can be taken at the moment a failure is
first seen.

## One entry per frame, and one per native call

Each entry is either a *bytecode* entry - the instruction position within a frame plus
a handle to that frame's source information - or a *native* entry - the native
routine's name plus whatever location the native side can supply. A bytecode entry is
pushed when a frame is pushed and popped when it is popped. A native entry is pushed
when a native routine is called and popped when it returns, so that a backtrace through
an accessor or a callback shows the native hop rather than collapsing two guest frames
into an apparent direct call. The position recorded in an entry is the *caller's*
position at the time of the push - the instruction that made the call - because the
callee's own position is whatever the program counter says when the backtrace is taken,
and it is filled in then. A program counter points past the instruction it just
dispatched, so every recorded position is offset back by one to land on the instruction
that was executing.

The shadow stack is not traced by the collector and holds nothing the collector owns;
its entries are positions and handles to immutable source maps. That is what makes it
cheap enough to maintain on every call.

## Capture before the handler search, not after

The run loop captures the backtrace **the moment it receives a failure, before it asks
whether the failure is catchable and before it searches for a handler**. The order is
the whole point. If capture waited until the failure was known to be uncaught, then a
failure caught by an engine-internal handler - the ones the engine installs around
module evaluation, generator resumption, or promise reaction - would be caught with no
backtrace, and when that internal handler rethrows or reports it, the positions are
gone; the reported failure says it happened at the internal handler. Capturing first
means the record exists before any handler acts on the failure, and a failure that
travels through three internal handlers arrives with the positions it started with
([record-precedes-effect](../../../../_laws.md#record-precedes-effect)). A failure
that already carries a backtrace - because it was captured once and rethrown - is not
recaptured, so the original positions survive the rethrow.

## Bounded by a limit, and derived from what the limit protects

The backtrace is taken as the **innermost n entries** of the shadow stack, where n is a
backtrace limit in the limits object, defaulting to a few dozen. The reason for the
bound is the recursion breach: the failure most likely to need a backtrace is the one
raised at five hundred frames, and a full backtrace at that moment is five hundred
entries allocated while the interpreter is already at the ceiling it set to stop
growth. Innermost, not outermost, because the innermost frames are where the recursion
is and the outermost are the program's entry, which the host already knows.

The number is derived, and the derivation is stated beside it
([limits-are-derived](../../../../_laws.md#limits-are-derived)): enough entries to
see the repeating unit of a recursion twice plus the frames that entered it, which for
a mutual recursion of a handful of functions is a few dozen. An embedder that raises it
toward the recursion limit has removed the bound; the setter exists, and its doc says
what the number costs.

## Decision rules

- Keep a shadow stack of positions parallel to the frame stack; push and pop it with
  the frames, and push a native entry for every native call.
- Record the caller's position at push; fill the innermost entry's position from the
  program counter at capture, offset by one.
- Capture the backtrace on first receipt of a failure, before the catchability check
  and before the handler search; never recapture a failure that carries one.
- Bound the capture to the innermost n entries by a limit in the limits object, and
  derive n from the recursion it is meant to illuminate.
- Keep the shadow stack untraced and free of collector-owned values.

## When not to use it

An interpreter whose language builds a full backtrace on every error construction,
and whose native routines are guest frames, already has the record; the shadow stack
duplicates it. And a runtime that never reports positions to the host - a pure
scoring or templating engine whose only output is a value - can skip the whole thing,
provided it says so, because the recursion breach it reports will then point nowhere.
