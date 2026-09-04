---
layer: technique
type: technique
subject: register-bytecode-execution
technique: handler-ranges-with-environment-depth
status: forged
laws: [creation-names-reaper]
shared_with: []
use_when: [designing how a bytecode interpreter finds the handler for a thrown exception, a try block is paying a per-entry cost even when nothing throws, an exception caught inside a nested scope leaves the lexical environment chain one level too deep]
---

# Handler ranges with environment depth

The technique makes an exception handler a **static table entry**, not a runtime
registration: a half-open range of instruction addresses, the address of the handler
code, and the number of lexical environments that were live when the range began. The
table is consulted only when something is thrown, so a protected region costs nothing to
enter and leave; the throw pays a scan, and the scan is over a per-function table that is
small because it is per function.

## Table-driven versus registered

The two families are the registered handler (enter the try: push a handler record; leave
it: pop) and the table (the compiler writes ranges; the interpreter searches them on
throw). Registration is simple to reason about and it is two instructions per protected
region on the path that never throws, which in a language where every loop body may be a
try is a tax on the loop. The table is free on the no-throw path and pays a search on the
throw, and a throw is the slow path by definition. Native compilers settled this decades
ago in favour of the table; the argument transfers to a bytecode interpreter unchanged,
with one simplification: the interpreter's table needs no unwinding metadata for
registers, because the frame's registers are a slice of the value stack and the handler
records the stack height it wants.

## What the entry records

Three numbers. The range start and end, half-open, patched by the same label mechanism
every forward jump uses, with the assertion that the end is set once and after the start.
The handler's code begins at the range's end, so the end **is** the jump target and the
entry carries no third address; a compiler that emits the handler somewhere else must
store the address separately and keep two things consistent that were one. The
**environment depth**: the count of lexical environments pushed inside the frame when
the range opened, relative to the frame's own environment base, so that the entry means
the same thing whichever call the frame is on.
The naive table omits the depth and the interpreter discovers, on the first exception
caught inside a nested block, that the chain still holds the block's environment and the
handler resolves names in the wrong scope. Recording the depth at range creation is the
range naming its own reaper ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)):
the handler truncates the chain to that depth on entry, and every environment pushed
inside the range is gone whatever path left it.

Some designs also record the value-stack height; in a register machine whose operands
are registers the stack height inside a frame is constant, so the height is the frame's
own and needs no entry.

## The search

On a throw the interpreter scans the current frame's table for the innermost entry whose
range contains the program counter. Innermost means the entry with the greatest start
among those containing the counter, and the cheapest implementation is a **reverse scan**
over a table the compiler emitted in opening order: nested ranges are appended after
their enclosing ranges, so the last match is the innermost and the scan stops at the
first hit. A table sorted for binary search is an optimisation nobody has needed; the
table is per function and functions with dozens of protected regions are rare.

If no entry matches, the frame is popped, the stack truncated to its base, and the search
repeats in the caller with the caller's program counter, until a handler is found or the
frames run out and the exception reaches the host. An exception class that must bypass
every handler (a limit the host set, which the guest must not be able to catch) skips the
search entirely; which errors those are and why is the sibling subject's concern, and the
only thing this technique contributes is that the skip is a check *before* the scan, not
a handler that rethrows.

## Decision rules

- When compiling a protected region, emit a table entry with a half-open range and the
  current environment depth; never emit push-handler and pop-handler instructions,
  because they tax the path that never throws.
- When placing the handler's code, place it at the range's end so the end is the target,
  because an entry with one address fewer has one inconsistency fewer to assert.
- When entering a handler, truncate the environment chain to the recorded depth before
  executing the handler's first instruction, because every environment pushed inside the
  range is now out of scope on every path.
- When searching, scan the table in reverse for the first range containing the counter,
  because the compiler appended nested ranges after their parents and the last match is
  the innermost.
- When an exception class must be uncatchable, test it before the scan and unwind to the
  host, because a handler that rethrows is a handler the guest can wrap.

## When not to use it

A language with resumable exceptions (the handler may return to the throw point) needs
the registered design or a continuation, because the table has no way to express a
resume. A runtime that must unwind through host frames on the process stack needs the
platform's unwinder as well as its own table. For the ordinary case of a guest exception
caught by a guest handler in an interpreter that owns its stack, the table is the design
and the registered handler is the naive reading.
