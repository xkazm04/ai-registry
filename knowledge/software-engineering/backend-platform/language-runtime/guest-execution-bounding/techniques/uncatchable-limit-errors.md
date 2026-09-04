---
layer: technique
type: technique
subject: guest-execution-bounding
technique: uncatchable-limit-errors
status: forged
laws: [verdict-survives-boundary, absent-guard-is-loud]
shared_with: []
use_when: [a runtime limit breach is being caught and retried by the guest's own handler, deciding what class of failure a recursion or iteration ceiling raises, unwinding from a limit breach through several nested native re-entries, the host needs a typed verdict that says the guest was stopped rather than that the guest failed]
---

# Uncatchable limit errors

## The concern

An interpreter that counts frames, slots and iterations will eventually find a count
over its ceiling, and it has to do something. The obvious something is to throw the
language's own out-of-range error - the one a conforming program throws for a bad
array length - because that error already exists, the guest already knows how to
handle it, and the machinery to raise it from inside an instruction is already there.
That choice destroys the ceiling. The guest's handler catches the error; the guest's
handler retries; the ceiling is reached again; the handler catches again. The host
believed it had a recursion limit and it has a recursion loop. A limit whose breach the
guest can intercept is a limit the guest may decline.

## Two classes of failure, and catchability decided by class

The technique gives the interpreter's failure type two representations under one
surface: **guest-class** failures, which are values of the language - every error the
specification defines, every value a guest program throws - and **engine-class**
failures, which are decisions of the engine about the guest - a runtime limit breached,
an internal invariant that failed and was converted to a failure rather than a crash,
an instruction budget exhausted. Catchability is a predicate on the class and on
nothing else: a guest-class failure is catchable; an engine-class failure is not. The
predicate is one method on the failure type, and every place that decides whether to
search for a handler asks that method rather than inspecting the failure's content.

The limit failures themselves are an enumeration inside the engine class - one variant
per ceiling - so that the host receiving one can branch on *which* ceiling was hit
without parsing a message
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)). The
enumeration converts into the general engine failure, which converts into the general
failure type, and the conversion chain is the only way a limit failure is constructed;
nothing can build one as a guest-class value by mistake.

## The unwind skips every handler and stops at the host's door

When the run loop receives a failure, it first captures the backtrace - before anything
else, for reasons the backtrace technique owns - and then asks whether the failure is
catchable. If it is not, the handler search does not run. Instead the loop pops frames,
in a loop, until it reaches a frame flagged as an **early-exit frame**: the frame that
was pushed by a native caller re-entering the interpreter, as opposed to a frame pushed
by a guest-to-guest call. Every native entry point that pushes a frame and calls the
run loop sets that flag on the frame it pushed, which is what makes the unwind stop at
the right place: the run loop returns to *its* native caller, not to the outermost one,
because the native caller in between may hold resources it needs to release.

Popping frames is not enough on its own; the structures the frames pointed into must
be truncated to match. The environment stack is cut back to the depth recorded on the
frame that survives, and the value stack is cut back to the frame pointer of the last
frame popped, so that the surviving frame sees exactly the stack it saw before the call
that failed. Then the loop returns the failure, as the failure, to the native caller.
That caller propagates it with its own error path - which, being a native path, is not
subject to the guest's handlers either - and the next enclosing run loop, receiving the
same uncatchable failure from the native call it was executing, does the same unwind
in its own turn. The failure travels to the outermost host call one re-entry at a
time, and at no point does a guest frame get to look at it.

The reason the unwind is per-run-loop rather than one long jump is that the native
frames between two run loops are real code with real cleanup: a borrow to release, a
depth counter to decrement, a resource to drop. An unwind that skipped them would
leave the counter high and the borrow held, and the *next* evaluation would fail for a
reason that has nothing to do with the guest.

## Decision rules

- When a runtime ceiling is breached, raise an engine-class failure, never a
  guest-class one, because any failure the guest can catch it can retry inside the
  handler.
- Decide catchability by class with one predicate on the failure type; never by
  matching a message or a name, because a guest can throw a value with the same name.
- Make each ceiling a distinct variant, so the host branches on which one was hit.
- On an uncatchable failure, skip the handler search entirely; pop to the nearest
  early-exit frame, truncate environments and the value stack to that frame, and return
  to the native caller.
- Flag every frame a native entry point pushes as early-exit, so the unwind stops at
  each native boundary and native cleanup runs.
- Test the property with the recursion that goes *through* a native path - an accessor
  that reads itself, a thenable whose getter recurses, a setter that assigns to its own
  property - because those are the cases where a guest handler sits between the breach
  and the host.
- Do not make uncatchability configurable. A ceiling whose failure the embedder can
  demote to catchable will be demoted by the first embedder with a failing test, and
  the fleet converges on the demotion
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

## When not to use it

A failure the guest *should* be able to handle - a bad argument to a native routine, a
string too long for the representation, a parse error in code the guest asked to
evaluate - is guest-class by design and stays catchable; this technique is for the
host's decision to stop, not for the language's own error taxonomy. And an interpreter
with no native re-entry - one where the host calls in once and the guest never calls
back out - has a trivial unwind with no early-exit frames to find, and the technique
reduces to "not catchable, return to host".
