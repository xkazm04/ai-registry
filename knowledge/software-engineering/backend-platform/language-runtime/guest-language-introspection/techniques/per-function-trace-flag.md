---
layer: technique
type: technique
subject: guest-language-introspection
technique: per-function-trace-flag
status: forged
laws: [identity-survives-reuse]
shared_with: []
use_when: [one function's instruction stream must be watched without tracing the whole process, a traced generator or awaiting function goes silent after it resumes, choosing between tracing one call and marking a function traced until further notice]
---

# Per-function trace flag

An engine's instruction tracer — print each instruction as it executes, with the operand
stack or register file beside it — is the developer's primary window into what the
compiler produced and what the interpreter did with it. Switched on for the whole
process it is useless for anything but the smallest script: the setup code, the test
framework, the assertion library and the prelude all trace too, and the fifty lines of
interest sit inside fifty thousand. The useful grain is one function, and the technique
is where the bit that says "trace this one" lives.

## The bit lives on the compiled code, not on the frame

There are three places a per-function trace flag could live, and only one of them is
correct.

A process-wide "tracing now" flag, set on entry to the function and cleared on exit,
is the obvious first implementation and it is wrong twice. It traces every function the
target calls, which is usually what the user wants, but it also traces every function
that runs while the target is *suspended* — a generator that yields or a function that
awaits hands control back to the caller with the flag still set, and the caller's whole
event turn traces until the target resumes and returns. Nested traced calls also need a
counter rather than a boolean, or the inner call's exit clears the outer's flag.

A flag on the call frame is better, and it is the shape a first refactor produces. It is
also lost at exactly the moment that matters. A generator's frame is saved at the yield
and a new frame is built at the resumption; an awaiting function's continuation runs on
a fresh frame from the job queue. If the flag was on the frame, the resumed half of the
function runs untraced, and the tracer goes silent in the one region — around a
suspension — where the engine's behaviour is least obvious.

The correct home is the function's **compiled code block**: the immutable unit the
compiler produced, which every frame for that function points at and which every
resumption re-reads. The code block is the identity that survives suspension, reuse and
re-entry; the frame is a temporary that does not, and a flag on it is an index-based
key on a list that gets resorted. The interpreter checks the bit on the code block at
each instruction dispatch, or at frame push if per-instruction cost matters, and the
trace output follows the function through every yield and every await.

## Two entry points: trace one call, or mark the function

The surface offers both, and they differ in what they leave behind.

**Trace one invocation.** The member takes the function, the receiver, the arguments,
and returns what the call returned; it sets the bit, calls, and restores the bit to what
it was *before* — not to off. The restore-to-prior rule matters when the function was
already persistently marked: a trace-once that clears the mark on exit has silently
undone a decision the test made earlier. The restore runs on the throwing path too, and
a test for how the tracer renders an exception depends on it.

The one-call form also decides *what* is traced: the function only, or the function and
everything it calls. Both are useful; the answer is a mode argument, never two members
with similar names, and the default is the function alone, because the deeper mode is
the one that produces the firehose the technique exists to avoid.

**Mark the function traceable.** The member takes the function and a boolean, sets the
bit persistently, and returns the function it was given — every later call traces until
the mark is cleared, and returning the function lets a test mark a literal at the point
of definition instead of naming it twice. This is the form for behaviour that spans calls: a callback invoked by the
engine from a job, a generator driven by a loop, a function called from a place the test
does not control. The persistent mark is also what makes the one-call form's
restore-to-prior rule load-bearing.

The decision rule between them: when the interesting behaviour is inside one call the
test makes, trace the call, because nothing is left behind; when the interesting call is
made by something other than the test, mark the function, and clear the mark in the
test's cleanup.

## The mark is shared by every closure of the same code

Because the bit lives on the compiled code, and a function literal compiles once while
each evaluation of it creates a new closure, marking one closure marks every closure that
shares its code. A test that creates ten closures from one literal in a loop and marks the
third will see all ten trace. This is a consequence to document rather than a defect to
fix: moving the bit to the closure reintroduces the frame problem for the closure's
frames, and the rule for the test author is that the mark is per-code and the one-call
form is per-invocation. When the test needs one closure of many, it traces one call.

## The output goes where the process tracer's output goes

The per-function tracer writes to the same sink and in the same format as the whole-
process tracer, so a reader who knows one knows both, and so a test can capture either
through the same channel. The cheapest way to guarantee that is structural: the
interpreter's dispatch loop asks one question per instruction — *is the process flag
set, or is this frame's code block marked* — and takes the single traced path when
either is true. One check, one renderer, one format; a second format for the
per-function case is a second parser for every tool that reads traces. The trace is
prefixed so that lines from a nested call are distinguishable from the caller's,
because the deeper mode interleaves them.

The tracer as a whole is also behind a compile-time feature, separate from the runtime
flag: an engine built for release carries neither the per-instruction check nor the
renderer, and the debug global's trace members are compiled out with it. The two gates
are not redundant. The build gate keeps the cost out of production; the runtime flag
keeps the output out of the developer's ordinary runs.

## Disassembly is the static sibling

Beside the trace members sit the static ones: the disassembler, which takes a function
and returns the compiled instruction listing with its constants and its nested code
blocks, and the flow-graph renderer, which returns the same code as a control-flow
graph in a diagram notation. Neither calls the function, and the disassembler is the
member a test reaches for first, because a claim about what the compiler produced does
not need the interpreter to run. Both *return* their listing as a value rather than
printing it — a member that writes to the process's output and returns nothing can be
read by a human at a prompt and by nobody else, and a test cannot assert on it. The trace answers a
different question — what the interpreter *did*, including which branch it took and what
the stack held — and a test picks the static member unless the runtime path is the
claim. Where the engine has an optimizer, the disassembler shows the code after the
passes that are enabled at the time, which is why its output is paired with the
optimizer switches in [guest-settable-limits-and-switches](./guest-settable-limits-and-switches.md).

## When not to use it

When the question is about all functions — a whole-process regression in dispatch, the
shape of every trace in a suite — the process-wide tracer on the command line is the
right instrument and the per-function flag is a slower way to get there. When the
question is about a host-side function the engine calls into, the tracer has nothing to
show, because the code block is not the engine's; the host's own logging is the
instrument. And the tracer is never a substitute for a representation probe: a test that
reads the trace to learn whether an array stayed dense is parsing prose to recover a
fact the surface can return as a value.
