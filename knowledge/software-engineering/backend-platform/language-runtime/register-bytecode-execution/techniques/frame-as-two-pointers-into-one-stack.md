---
layer: technique
type: technique
subject: register-bytecode-execution
technique: frame-as-two-pointers-into-one-stack
status: forged
laws: [creation-names-reaper]
shared_with: []
use_when: [designing the call frame of a bytecode interpreter, a profile shows an allocation on every guest call, deciding where the receiver, callee and arguments of a call are found]
---

# Frame as two pointers into one stack

The technique makes a call frame a *view* over a stack the interpreter already owns,
rather than an object with storage of its own. One value stack lives for the whole run;
every frame's prologue, arguments and register file are contiguous slices of it; and a
frame records only where its slice begins and how many arguments it received. Everything
else a frame needs to address is arithmetic on those two numbers.

## The layout

The call sequence lays a frame down in a fixed order, bottom to top: a prologue of fixed
width holding the receiver and the callee; the arguments as passed, in order; then the
register file, which the callee's code block declares as a count. The register pointer
(`rp`) is the index of the first register. From `rp` and the argument count, the
interpreter derives the frame's base (`rp` minus the argument count minus the prologue
width), the callee slot (base), the receiver slot (base plus one), the first argument
(base plus the prologue width) and the argument range. None of these are stored, because
each is a subtraction, and a stored copy is a second authority that a rebase would have
to update.

The register file is created by **one resize**: the stack grows by the callee's declared
register count, filling with the undefined value. This is the only per-call cost of the
frame, it is bounded by a number the compiler already computed, and it is the operation
the resumption technique skips when the registers are already present. Return is one
truncate to the frame's base, after the return value has been moved below it. There is no
free, because nothing was allocated.

## What the frame does store

Only what cannot be derived: the program counter, `rp`, the argument count, the code
block, the environment chain as it stood at entry, the index of the innermost active
handler, and a small set of flags (construct call, registers already pushed, exit-early
for the host boundary). The frame pointer is among the stored fields and it is **stored
once at push**, not recomputed from the stack length on each access. Both give the same
answer while the stack is only ever pushed and truncated at the top; they diverge the
moment a suspension detaches a slice and reattaches it at a different height, and the
stored field is the one that is still correct, because the resume rebases it explicitly.
The rule is: when a value is cheap to derive and cheap to store, store the one a later
mechanism will need to *set*, because a derived value cannot be set.

## The stack limit is checked here and only here

A value stack that grows without bound is the process stack's overflow arriving later
and with a worse message. The interpreter has one limit on stack height (the sibling
subject that owns the limits states its default and its failure class) and this
technique's contribution is *where* the check lives: at the call boundary, before the
frame push, comparing the current height **plus the incoming register count** against
the ceiling. The second term is the one that gets dropped: a check that compares only
the height before the push lets one frame overshoot the ceiling by its whole register
file, and a function with a large register count is exactly the one the ceiling was for. Instruction-level pushes inside a frame are bounded by the register count the
compiler declared and need no check; a check per push would be the naive reading's
per-call allocation returning as a per-instruction compare. One check, at the one site
that can grow by an unbounded amount, is the whole discipline.

## Decision rules

- When a frame needs the receiver, the callee or an argument, derive the slot from `rp`
  and the argument count; never store a second copy, because a rebase would have to find
  and update every copy.
- When a call is made, grow the stack once by the callee's declared register count and
  set `rp` to the height before the growth; when it returns, truncate to the base,
  because a frame that owns no storage has nothing to free.
- When a field can be derived from the stack but a later mechanism must be able to
  *set* it (the frame pointer under suspension), store it at push, because a derived
  value has no setter.
- When checking the stack ceiling, check at the frame push against the incoming register
  count and nowhere else, because every other growth is bounded by a count the compiler
  already declared.
- When the language has values every function needs (the undefined value, the three
  slots of a promise capability, an asynchronous generator's own object), reserve them
  at fixed low register indices in every function so the calling convention and the
  suspension machinery find them without a per-function map.

## Failure modes

The frame that recomputes its base from the stack length reads the wrong slice after the
first resumed generator. The frame that stores the receiver's slot as an absolute index
reads a stale value after the same event. The frame that checks the stack limit per push
is measurably slower than the one that checks per call and no safer. And the frame that
allocates a register vector "just for now" is the design this technique exists to
refuse: it works, it is easy, and it puts an allocator on the path every property access
in a dynamic language takes.

## When not to use it

A compiler that emits native code has a real machine stack and a calling convention
imposed by the platform; this technique is about an interpreter that owns its stack. A
runtime whose frames must be individually heap-resident at all times, because the
language exposes them as first-class objects that outlive the call, has already chosen
the frame-as-object design and pays for it knowingly; the technique still applies to the
frames that do not escape, which is nearly all of them.
