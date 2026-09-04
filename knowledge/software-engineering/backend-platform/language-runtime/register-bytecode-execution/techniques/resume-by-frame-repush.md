---
layer: technique
type: technique
subject: register-bytecode-execution
technique: resume-by-frame-repush
status: forged
laws: [identity-survives-reuse]
shared_with: []
use_when: [implementing generators, coroutines or asynchronous functions on an interpreter whose frames share one value stack, a suspension is copying the register file in both directions on every step, deciding whether to lower suspendable functions to state machines in the compiler]
---

# Resume by frame re-push

A suspendable function is a frame that must leave the value stack while live and return
to it later with its registers intact. The technique keeps the frame as one object across
every suspension and makes the suspension a **split of the value stack at the frame
pointer**: the frame's slice is detached as a unit the first time it suspends, and on
every resume that slice is swapped in as the interpreter's stack and the frame is pushed
again with a flag that tells the push to skip creating registers that are already there.

## The three designs and why two are wrong here

The first design copies. On yield, read the frame's registers out into the generator
object; on resume, write them back into a freshly created register file. It is correct,
it is easy, and it is a copy of the whole register file in each direction on every step,
so a generator that yields a hundred thousand values pays two hundred thousand copies
of its frame.

The second design lowers. The compiler rewrites every generator into a state machine: a
switch on a state field at entry, every local promoted to a field on the generator
object, every yield a state assignment and a return. This is the correct design for a
compiler whose target has no runtime representation of a frame, which is why native
compilers use it. In an interpreter it duplicates, in every suspendable function's
bytecode, a facility the interpreter already has: the frame. It also makes the compiler
much larger, because the transformation must handle every construct that can contain a
yield, and it makes the suspended function's bytecode different in shape from the
non-suspended one, which every downstream tool (the tracer, the snapshot test, the
debugger) has to know about.

The third design, this technique, splits. Because the frame is a contiguous slice of one
value stack and the frame pointer is stored, the frame's whole state is the slice from
its base to the current top plus the frame struct. When the generator object is created,
`split_off` at the base detaches the slice as one allocation; the caller's stack is
exactly as it was before the call. The frame is rebased once, at the split: its register
pointer becomes register pointer minus frame pointer, and its frame pointer becomes zero,
because the slice now begins where the frame begins. The *registers already pushed* flag
is set on the frame and stays set for its whole life.

## Resume is a swap and a nested run

On each resume the saved slice does not get appended under the caller; it **becomes the
interpreter's stack**. The generator's stack and the interpreter's stack are swapped, the
frame is pushed (the push sees the flag and does not resize, and because the frame's base
is zero and the swapped-in stack is exactly its slice, the stored pointers are already
right), the frame is marked as the one whose return ends this run, the resume value and
the resume kind are pushed, and the run loop is entered. When the frame yields or
returns, the loop exits to the resumer, the stacks are swapped back, and the frame is
popped back into the generator object, still the same frame, still over the same slice.
The caller's stack was parked for the duration and is untouched.

Two consequences follow and both are deliberate. The resume is a nested entry into the
run loop, which is a host re-entry for the purpose of the recursion-depth count (a
generator resumed from a generator from a generator is process-stack recursion, and the
sibling subject's counter must see it). And the generator's stack is a real stack for the
duration of the run, so a call made from inside the generator pushes frames above it in
the ordinary way; nothing about the calling convention knows it is running on a swapped
stack.

An interpreter that must resume without re-entering the loop (a single flat loop that
switches between coroutines) appends the slice under the current top instead of swapping
and rebases the register pointer to the appended position on each resume. That is the
same technique with a per-resume rebase in place of a swap, and it is the right variant
only when the flat loop already exists for another reason.

## Why the flag is a flag and not a second push routine

The temptation is a separate `push_resumed_frame` that skips the resize. Two push
routines drift: the recursion-depth check, the stack-limit check, the trace hook, the
shadow-stack entry for backtraces, each added to one and forgotten in the other. One
push routine with one flag keeps every check on both paths. The rule is that the resumed
path differs from the fresh path in exactly one step, and that step is a branch inside
the shared routine.

## The frame is the same frame

Nothing about the frame changes identity across a suspension: the code block, the
environment chain, the handler index, the program counter, the flags and the register
contents are the ones the frame had when it yielded. The single rebase at the split is
an address adjustment, not a new frame, and a stored frame pointer is what makes it a
single assignment rather than a search
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). This is
also why state the language exposes to the guest and that must survive a suspension (a
per-function trace flag) lives on the code block rather than on the frame: the code
block is the identity that outlives every frame, and the frame is the identity that
outlives every resume.

## Decision rules

- When the interpreter's frames are slices of one value stack, suspend by splitting the
  stack at the frame's base and rebase the frame to zero once, because the slice is the
  frame's entire state and the split is one allocation.
- When resuming, swap the saved slice in as the interpreter's stack, push the frame with
  the *registers already pushed* flag, and run to the frame's own return, because a swap
  is free and the stored pointers are already correct for a slice that begins at zero.
- When pushing a resumed frame, use the ordinary push with a flag rather than a second
  push routine, because two routines drift on every check added later.
- When the compiler is asked to lower suspendable functions to state machines, refuse
  while the interpreter has a heap-safe frame representation, because the lowering
  duplicates the frame in every function's bytecode and changes the shape every
  downstream tool reads.

## When not to use it

A compiler targeting native code, or an interpreter whose frames own their storage, has
no slice to split and should lower to state machines or copy, respectively. A runtime
that must suspend *across* a host call, with host frames on the process stack between
the generator and its caller, cannot split anything and needs a stackful coroutine or a
continuation-passing rewrite; this technique assumes the suspension point is reached
with only guest frames above the suspended one.
