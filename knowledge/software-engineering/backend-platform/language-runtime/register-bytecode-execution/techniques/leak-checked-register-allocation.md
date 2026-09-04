---
layer: technique
type: technique
subject: register-bytecode-execution
technique: leak-checked-register-allocation
status: forged
laws: [creation-names-reaper, absent-guard-is-loud]
shared_with: []
use_when: [writing the register allocator of a bytecode compiler, a function's register count grows with every contributor and nobody knows which temporaries were never released, deciding which registers every function reserves at fixed indices]
---

# Leak-checked register allocation

A bytecode compiler for a register machine allocates a register for each temporary it
needs (the left operand, the right operand, the result of a call about to be stored) and
releases it when the temporary is dead. The allocator is a free list over a counter that
records the high-water mark, and the high-water mark becomes the function's register
count, which the frame push uses to size the register file. A temporary that is never
released is not a compiler error; it raises the high-water mark by one, forever, for
every call to that function. The technique makes the leak a **panic at the site that
forgot**: the register is a handle whose destructor asserts that it was deallocated or
declared persistent.

## The handle

Allocation returns a handle, not an index. The handle carries the index, a flag for
persistent registers, and a flag set by deallocation. Its destructor checks the two flags
and panics with the index if neither is set. The compiler never holds a bare index for a
temporary, and every code path that acquires a handle must therefore release it or move
it into something that will. In a language with destructors this is enforced by the type
system; in one without, the same check runs at the end of the function's compilation
over every handle ever created, which is weaker (it names the function, not the site)
and still enough.

The check is on by default and cannot be switched off. An allocator whose leak check is
an option is an allocator whose leak check is off in the one build that matters, and the
first leak ships to every user of every function that path compiles
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). The cost of the
check is a flag test in a destructor at compile time, and there is no argument for
making it optional. The one exemption the destructor grants is to itself: when the
compiler is already unwinding from another panic, the handles it drops on the way out
stay silent, because a second panic during the first turns a readable failure into an
abort with no message. Deallocation, for its part, consumes the handle without running
the destructor, so the check fires only on the path that forgot; and when the function's
compilation finishes, the allocator walks its table once more and asserts that every
register still marked in use is a persistent one, which catches the leak the type
system could not see because the handle was stored rather than dropped.

## Persistent registers

Some registers live for the frame's whole life and are never released: the register
holding the undefined value that every read of "nothing" resolves to, and the register
holding the frame's promise capability when it has one. These are allocated at fixed
low indices before any temporary, marked persistent so the destructor accepts them, and
reserved for every function whether or not it uses them, because the calling convention
and the suspension machinery address them by index without a per-function map. A
compiler that puts them at whatever index happened to be free when the function was
compiled has made every consumer of the frame layout look them up, and the first
consumer that caches the lookup is wrong after the first function compiled differently.

The register that reads as the undefined value is **never written**. It is the
compiler's source for a constant that the language needs everywhere, and the discipline
that keeps it a constant is the same one that keeps the allocator honest: the compiler
has no path that names it as a destination.

## Scoped temporaries and the high-water mark

The free list reuses released registers, so a function's register count is the peak of
simultaneously live temporaries, not the total ever allocated. Expression compilation
releases in reverse order of allocation (the operands after the operation), and a
compiler that releases out of order fragments the free list and raises the peak for no
reason. The rule of thumb that keeps the count tight is that a temporary is released by
the same code that allocated it, at the same nesting level, which is also the rule that
makes the leak check fire at the right site: the handle is created and destroyed by the
same function, so the panic names it
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)).

## Decision rules

- When allocating a temporary, return a handle whose destructor panics unless it was
  deallocated or is persistent; never return a bare index, because an index cannot know
  it was forgotten.
- When a register must be found by index from outside the function (the undefined
  value, the promise capability), reserve it at a fixed low index in every function and
  mark it persistent, because a per-function lookup will be cached by the first consumer
  and wrong for the second.
- When the register holding the undefined value is allocated, give the compiler no path
  that names it as a destination, because a constant register that is written once is a
  variable.
- When releasing temporaries, release them where they were allocated and in reverse
  order, because the leak check names the site and the free list reuses in stack order.

## When not to use it

A compiler that allocates registers by liveness analysis over a control-flow graph has
no temporaries to leak; its allocator is a colouring, and the check is a verifier over
the result. A stack machine has no registers. The technique is for the single-pass
compiler that hands out registers as it walks the syntax tree, and for that compiler the
leak is the defect that nobody sees until the register file is twice the size it should
be.
