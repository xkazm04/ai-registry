---
layer: technique
type: technique
subject: guest-execution-bounding
technique: count-host-reentry-in-recursion-depth
status: forged
laws: [count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [a recursion limit is set and the process still overflows its stack, guest code recurses through accessors or callbacks or promise resolution rather than through direct calls, deciding what the recursion counter actually measures, a native routine calls back into the interpreter and the depth check does not see it]
---

# Count host re-entry in recursion depth

## The concern

An interpreter with a frame stack has a recursion counter for free: the length of the
frame stack. A recursion limit compares that length to a ceiling at every call and
raises when it is reached. The design is correct for the recursion it was tested
with - a guest function calling itself - and wrong for the recursion that overflows
real processes, which goes *through native code*. A property accessor that reads the
same property; a comparison callback handed to a native sort that compares by calling
into the guest; a thenable whose getter resolves another promise; a proxy trap that
traps itself. In each, guest code calls a native routine, the native routine calls
back into the interpreter's run loop, and the run loop pushes one guest frame. The
frame count goes up by one per cycle. The **process stack** goes up by one native
activation plus one run-loop activation plus one guest frame per cycle, and the native
part is the larger. The guest-frame count sits at a few hundred, far under its ceiling,
when the process stack is exhausted and the host dies with the one failure it embedded
an interpreter to avoid.

## Count what actually consumes the stack

The recursion depth the limit compares against is **guest frames plus host
re-entries**. The interpreter keeps a second counter beside the frame stack: the
number of native call sites currently inside a call back into the run loop. Every
high-level native entry point that re-enters - the "call this guest function" and
"construct with this guest function" doors the host and the builtins use - increments
it before entering the run loop and decrements it after, and the decrement saturates
at zero so an unwind that skipped the decrement can only leave the counter high, which
fails safe. The limit check sums the two, and compares the sum to the ceiling.

The counter is a count, so it carries its predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): the number
of nested native re-entries into the run loop, incremented at the entry points named in
its own doc. A depth that was silently "frames" and is now silently "frames plus
something" has changed what an embedder's tuned limit means, and the doc beside the
check is where that change is stated.

## Check at every call boundary, including the ones that push nothing

The check runs at the start of every call boundary the interpreter has: guest call,
guest construct, native call, native construct. The native ones look redundant - a
native function pushes no frame, so the frame count is unchanged - and the redundancy
is the point. A native function is the first half of a re-entry cycle, and a check that
skips it observes the depth only on the guest half; the cycle's growth is seen every
other hop instead of every hop. The gate must see the thing it gates
([gate-sees-target](../../../../_laws.md#gate-sees-target)), and the thing is the
depth of the process stack, which grows on both halves.

The check sits *before* the frame is pushed, so the failure is raised in the caller's
context with the caller's stack intact; a check after the push has already consumed
the slot the limit was meant to protect.

## The re-entry counter is not the same as the early-exit flag

The unwind technique flags the frame a native caller pushes so that an uncatchable
failure stops there. That flag and this counter are set at the same sites and are
different things: the flag is per frame and says *where an unwind stops*; the counter
is global and says *how deep the native side is*. Sharing one field for both is the
tempting refactor and it breaks the first time a native entry point pushes a frame it
does not run to completion, or runs a frame it did not push.

## Decision rules

- When the interpreter can be re-entered from native code, define recursion depth as
  guest frames plus native re-entries, and state that definition beside the check.
- Increment the re-entry counter at every high-level native entry point that calls the
  run loop; decrement with saturation, so a missed decrement fails high, not low.
- Check the limit at every call boundary, native ones included, before pushing.
- Test with recursion through an accessor and through a setter, with the limit set low
  enough that a guest-frame-only count would pass; the test must raise the limit
  failure, not overflow.
- Keep the re-entry counter and the early-exit frame flag as separate state.

## When not to use it

An interpreter whose native routines can never call back into the guest - one with no
accessors, no callbacks, no traps, no promise resolution from native code - has no
re-entry, and the frame count is the depth. That interpreter is rare and usually
becomes the other kind at its first callback; the counter is cheap enough to add
before that day rather than after the first overflow report.
