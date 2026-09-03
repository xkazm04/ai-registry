---
layer: golden-path
type: golden-path
subject: register-bytecode-execution
status: forged
use_when: [designing or reviewing the call frame and value stack of a bytecode interpreter, deciding how generators and coroutines keep their registers across a suspension, writing a single-pass compiler that must emit forward jumps and exception regions before their targets exist, adding an optimisation pass to a compiler that already has one and wondering when it stops]
techniques:
  - frame-as-two-pointers-into-one-stack
  - resume-by-frame-repush
  - placeholder-patch-jumps
  - finally-jump-table-with-reserved-fallthrough
  - handler-ranges-with-environment-depth
  - leak-checked-register-allocation
  - fixpoint-pass-with-iteration-cap
  - dce-refuses-hoisted-declarations
---

# Register bytecode execution

An interpreter that executes a dynamic language compiles each function to a linear
instruction stream and runs it in a loop: fetch an opcode, dispatch, execute, advance.
Every design decision downstream of that sentence is about where the operands live,
what a call costs, what a suspension preserves, and how the compiler that produced the
stream managed to emit a jump to a place it had not reached yet. This subject owns those
decisions: the frame and the single value stack it points into, the resumption of a
suspended frame, the compiler's forward references and its exception regions, the
register allocator's leak discipline, and the optimiser's stopping rule. It does not own
the ceilings the interpreter enforces (frames, slots, iterations, instructions) nor the
cooperative yield to a host executor; that is the sibling subject [guest-execution-bounding](../guest-execution-bounding/guest-execution-bounding.md),
and the boundary is stated below.

## Registers, not a stack, and why the difference is about dispatch

The two textbook instruction formats are the stack machine, whose operands are implicit
(push, push, add) and the register machine, whose operands are explicit (add r3, r1, r2).
The stack form is denser per instruction and the register form executes fewer
instructions, and the measured trade is not close: a register encoding of the same
program executes roughly half the instructions at a code-size cost of a quarter, and
because every executed instruction is an indirect branch the dispatcher pays for, fewer
instructions is the win that matters. A principal practitioner chooses the register form
for an interpreter and accepts the larger code, then keeps the code from growing further
by refusing the temptation that comes with it: variable-width operand encoding. A
compact encoding that picks the narrowest width per operand saves bytes and costs a
decode branch on every operand of every instruction, which is the same indirect-branch
tax the register form was chosen to avoid. **Operands are fixed-width, one word each,
decoded by offset**, and the code-size argument for narrow operands is made once with
a measurement and usually lost.

The dispatch table is the other place the format is decided. One byte of opcode gives
256 entries, and a healthy instruction set leaves a reserved band unused so that a new
opcode is an appended entry and never a renumbering of the ones a snapshot test already
knows. Where the interpreter needs a second execution mode (a budgeted loop for the
sibling subject's cooperative yield, a tracing loop for a debugger), it gets a **second
table of the same shape**, not a branch inside every handler, so that the mode nobody
asked for costs nothing on the path everybody runs.

## The frame owns nothing

The naive frame is a struct with its own register vector, its own argument vector and
its own operand storage, allocated at call and freed at return. It is simple to reason
about and it is an allocation per call, which in a language where every property access
may be a call is the single largest cost the interpreter can choose to pay or not pay.

The design this subject holds true is that **one value stack carries every frame's
storage, and a frame is two numbers into it**: a register pointer marking where its
register file begins and an argument count from which the callee, the receiver and the
argument range are derived by fixed offsets. The stack layout under a frame is a
prologue of a fixed width (receiver and callee), the arguments, then the register file,
which the call sequence creates by resizing the stack once by the function's register
count. Return truncates the stack to the frame's base. Nothing is allocated, nothing is
copied, and the frame struct itself carries only the program counter, the two numbers
and the pointers a frame genuinely needs (the code block, the environment chain, the
active exception handler index). The frame pointer is **stored at push, not re-derived**:
a frame that recomputes its base from the stack length at every access is correct until
the first suspension rebases the stack under it, and a stored pointer is the cheaper
invariant in both senses.

The bottom of every register file is persistent and fixed: register zero holds the
undefined value, which the compiler reads whenever it needs one and which nothing ever
writes; the next three hold the promise capability (promise, resolve, reject) for
functions that have one; the fifth holds the asynchronous generator object for functions
that are one. Five reserved indices, whether or not the function uses them, is what lets
the calling convention and the suspension machinery find them without a per-function
map.

The stack has one limit and the sibling subject owns it; what this subject owns is that
the limit is **checked at the one place the stack grows by an unbounded amount, the
frame push**, and nowhere else, because instruction-level pushes are bounded by the
register count the compiler already declared.

## Suspension is a split, never a copy

A generator, a coroutine, or an asynchronous function is a frame that leaves the stack
while it is live and comes back later. The naive resumption copies the frame's registers
out on yield and back in on resume, and it works, and it is a copy of the whole register
file in both directions on every step of every iteration. The second naive answer is the
compiler's: lower the function to a state machine so that no frame ever suspends. That is
the correct answer for a compiler that emits native code with no runtime of its own, and
the wrong one here, because the interpreter already has a heap-safe representation of a
frame and a state machine duplicates it in every generator function's bytecode.

The design is to **split the stack at the frame pointer**. On the first suspension, the
frame's slice of the value stack (prologue, arguments, registers) is detached as one
allocation and kept with the suspended frame, rebased so the frame's base is zero; the
caller's stack is left exactly as it was before the call. On resume, the saved slice
*becomes* the interpreter's stack: the two are swapped, the frame is pushed with a flag
saying its registers are already present so that the push skips the resize it would
otherwise perform, and it is marked as the frame the run loop returns to the host from,
so the resume is a nested run that ends when the frame yields or returns. On the way out
the stacks are swapped back and the frame is popped into the generator object, still the
same frame, with its slice still under it. Nothing is copied at any step. This is why the
frame pointer is stored and why the register file must be contiguous with the prologue:
the split is one slice operation exactly because everything the frame needs is in one
place, and the rebase is one subtraction done once.

## The compiler is single-pass and lies to itself briefly

A compiler that emits instructions in source order meets a forward reference the moment
it compiles a conditional: the jump must be emitted now and its target is not known until
the consequent has been compiled. The design that keeps the compiler single-pass is the
placeholder: emit the jump with a sentinel address that cannot be a real one, hand back a
label naming the instruction's operand slot, and patch the slot when the target is
emitted. The invariant that keeps the placeholder from becoming a bug is that **every
label is patched exactly once and never before its start is known**, and a compiler that
asserts this at patch time finds its own control-flow errors instead of shipping a jump
to the sentinel.

Exception regions are the same pattern one level up. A handler is a half-open range of
instruction addresses and the number of lexical environments that were live when the
region began; the handler's code starts where the range ends, so the range's end is the
jump target and there is no third address to keep consistent. The table is searched only
when an exception is thrown, so a program that throws nothing pays nothing per try. On a
throw the interpreter scans the frame's handler table from the innermost outward for the
range containing the program counter, truncates the environment chain to the handler's
recorded depth, and jumps; the value stack needs no truncation inside a frame, because in
a register machine a frame's stack height is a constant the compiler chose. A handler
whose end was never set, or was set before its start, is the compiler bug the same
assertion catches.

The hard part of exception regions is not the throw; it is the **non-local exit through a
protected region**: a break, continue or return that crosses a finally block must run the
finally and then continue to where it was going. The naive reading copies the finally
block's code to every exit, which is correct and grows the code by the number of exits.
The design this subject holds is a continuation table: every exit through a finally is
compiled as "record which exit I am in a register, jump into the finally", and the
finally's last instruction is a table jump on that register. Entry zero of the table is
the fallthrough, because the register starts at zero and a finally entered normally has
recorded nothing. A second register records whether the finally was entered by a throw
and must rethrow on its way out; the pending exception and the pending return value live
in the interpreter's own slots for those, not in registers. The table is the one
authority for how a finally block is left, and nested finally blocks compose because a
record whose continuation lies outside the region is handed to the enclosing region and
replayed there.

## Registers are a resource with a reaper

The compiler allocates registers as it compiles expressions: a temporary for the left
operand, another for the right, both released after the operation. A register allocator
of this kind leaks silently, and a leaked register is not a crash but a wider register
file for every call to that function forever. The discipline is a **register handle whose
destructor panics unless it was deallocated or marked persistent**. Every temporary is
then created with its reaper named, and the test suite finds a leak as a panic at the site
that forgot to release, rather than as a benchmark regression six months later.

## The optimiser runs until it is quiet, and knows two things it must not do

A source-level optimiser (constant folding is the usual first pass) is a rewrite that may
enable itself: folding one subexpression exposes another. The correct loop runs every
pass, records whether anything changed, and repeats until a full sweep changes nothing.
Two rules keep it honest. First, the loop has an iteration cap, because a pair of passes
that undo each other's work never converges and a cap turns an infinite loop into a
report. Second, the statistics distinguish a pass that mutated from a pass that only
checked, so that "ran ten times" can be read as "changed twice and confirmed eight
times" and not as ten changes.

The second thing the optimiser must not do is more specific and more instructive.
Dead-code elimination on a branch whose condition folds to a constant looks safe and is
not, in any language where a declaration inside the dead branch is hoisted to the
enclosing scope: the branch is unreachable and its declarations are observable. A pass
that eliminates the branch removes a binding the program can name. The rule is that
**a branch containing a hoisted declaration is never eliminated**, however dead its body,
and the general lesson is that reachability is a proxy for observability, and a pass that
gates on the proxy is wrong at exactly the case the proxy misses.

## Where this stops

The sibling subject [guest-execution-bounding](../guest-execution-bounding/guest-execution-bounding.md) owns every ceiling and the loop that
counts toward it: the recursion limit checked at the frame push, the value-stack limit,
the loop back-edge counter, the instruction budget, the backtrace depth, and the
cooperative yield through a second dispatch table. This subject owns the frame, the
stack layout, the suspension and the compiler that produce the thing being counted; when
a rule is about how many, it is the sibling's, and when it is about where, it is this
one's. The security subject [untrusted-extension-host](../../../security/untrusted-extension-host/untrusted-extension-host.md)
sits one layer further out and asks whether an in-process interpreter is an isolation
tier at all; nothing here answers that, and a reader who arrived from there wanting a
sandbox should go back.

Bytecode output is snapshot-tested, and the discipline for that (opt-in update, review
as a diff, the recording beside the case) is already owned by
[approval-snapshots-with-guarded-update](../../../engineering-process/build-and-release/test-harness/techniques/approval-snapshots-with-guarded-update.md)
and is not restated here. What this subject adds is only why the snapshot is the right
test for a compiler: a single-pass emitter with patched jumps and a continuation table
has a correct output that is hard to state as an assertion and easy to state as a
listing, and a reviewer reads a listing diff faster than a control-flow proof.

## What the naive reading gets wrong

The naive reading takes the frame as the unit of allocation, because that is what a
frame is in the language's own semantics. It is a unit of *addressing*, and the moment
the frame owns storage the interpreter has an allocator on its hottest path and a copy
on every suspension. The second naive reading takes the compiler's forward references as
a reason for two passes; they are a reason for a patch list and an assertion. The third
takes "dead" to mean "removable", and a hoisting language is the cheapest possible
demonstration that it does not. The fourth takes the operand encoding as a place to save
bytes, and the measurement says the bytes were cheaper than the branch that saved them.
