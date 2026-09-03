---
layer: technique
type: technique
subject: register-bytecode-execution
technique: finally-jump-table-with-reserved-fallthrough
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [compiling break, continue or return through a finally block, a finally block is being duplicated at every exit and the code is growing with the exit count, nested protected regions must each run their cleanup in order on one non-local exit]
---

# Finally jump table with reserved fallthrough

A finally block runs on every way out of its protected region: normal completion, an
exception, and every non-local exit (break, continue, return) that crosses it. The
technique compiles the region once and routes every exit through it: each non-local exit
records **which exit it is** in a dedicated register and jumps into the finally; the
finally's last instruction is a table jump on that register; and **entry zero of the
table is the fallthrough**, because the register's initial value is zero and a finally
entered by normal completion has recorded nothing.

## The two designs it replaces

Copying the finally body to every exit is correct and simple, and the code grows as the
product of finally size and exit count, with nested regions multiplying. It also makes
the snapshot of a function's bytecode unreadable, because a reviewer sees the cleanup
four times and must check that all four are the same. Copying is the right answer for a
native compiler whose exits are few and whose optimiser will merge them; it is the wrong
answer for a bytecode compiler.

The subroutine call (jump-to-subroutine with a return address on the operand stack) was
the classic bytecode answer and was abandoned by the platform that introduced it, because
a verifier cannot reason about a subroutine reached from paths with different stack
shapes. A register machine with a continuation table has no such problem: the exit is a
small integer in a register, the table is in the instruction stream, and the verifier (or
the snapshot reviewer) reads a switch.

## The table

The compiler, on opening a protected region with a finally, allocates the continuation
table with entry zero reserved. Each non-local exit compiled inside the region that
crosses it appends an entry: the entry's index is written into the exit register before
the jump into the finally, and the entry's target is a label patched to wherever the exit
was going (the loop's break target, the enclosing region's finally, the function's return
sequence). The finally body is emitted once, followed by the table jump. Normal
completion falls into the finally with the register at zero and the table sends it to the
instruction after the region.

A second reserved register is the **rethrow flag**: the handler that enters the finally
on a throw sets it, every non-local exit clears it as it writes its index, and the
finally's epilogue rethrows the interpreter's pending exception when the flag is set.
The pending exception itself, and a pending return value, do not ride in registers; the
interpreter has a slot for each and the exit record only decides whether the slot is
consumed. The exit register, the flag and the table are the **one authority** on how a
finally block is left
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary));
no exit path knows its own continuation, and adding an exit is adding an entry.

## Nesting

A non-local exit is a **record**: its kind (break, continue, return) and a list of
actions the compiler must emit on its behalf, gathered as the exit is compiled, one per
enclosing structure it crosses: pop this many environments, close this iterator, route
through this finally, and *transfer to the enclosing region*. When a region closes, it
replays each of its records' actions in order; a transfer action stops the replay, emits
a jump, and hands the record to the enclosing region's list, so the record is replayed
again there with the actions that remain. A break that crosses two finally blocks is
therefore one record replayed twice, and each finally's table sees only the entry the
record registered with it. The targets that are not yet known when a region closes are
patched when the structure that owns them closes, through the same label mechanism every
other forward jump uses.

## Why zero

Reserving entry zero for the fallthrough is not decoration. The exit register is a
register like any other, created by the frame push filled with the undefined value and
set by the compiler's own prologue to zero; the alternative, a distinguished "no exit"
value, is a compare in the finally's epilogue on every normal completion. Zero-means-
fallthrough makes the normal path the table's first entry and costs nothing to express.
The price is that the compiler must reset the register to zero when the finally is
entered by the exceptional path too, or the table would replay a stale exit; that reset
is one instruction and it is the whole cost of the design.

## Decision rules

- When a non-local exit crosses a finally, compile it as "write the exit index, jump
  into the finally" and let the finally's table continue it; never copy the finally
  body, because the copies diverge and the snapshot cannot be reviewed.
- When allocating the table, reserve entry zero for normal completion, because the exit
  register starts at zero and the normal path must not pay a compare.
- When a throw enters the finally, set a rethrow-flag register that every non-local
  exit clears, and rethrow from the interpreter's pending-exception slot on the way out
  only when it is set, because a return inside the finally must be able to discard the
  pending exception and a flag is the cheapest thing a return can clear.
- When regions nest, compile each non-local exit as a record of actions and replay it
  region by region, transferring the record outward when it crosses a boundary, because
  the outer cleanup runs after the inner one and only the record knows what remains.

## When not to use it

A language without non-local exits through cleanup (no break, no return, cleanup only by
scope end) needs only the exception half, which is a handler range. A native compiler
with an optimiser that merges duplicated tails should copy. The technique pays where the
finally body is emitted by hand into a linear stream and the exits are many.
