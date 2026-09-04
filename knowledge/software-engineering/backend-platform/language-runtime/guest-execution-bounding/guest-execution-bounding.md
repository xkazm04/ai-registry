---
layer: golden-path
type: golden-path
subject: guest-execution-bounding
status: forged
use_when: [an embedded interpreter must stop guest code that recurses or loops without end, deciding which resource ceilings an in-process runtime can honestly promise, a long guest evaluation must share a host's single-threaded executor with other tasks, a limit failure is being swallowed by the guest's own error handling, a fuzzer or test harness needs non-termination to be a result rather than a hang]
techniques:
  - cost-budget-cooperative-yield
  - uncatchable-limit-errors
  - count-host-reentry-in-recursion-depth
  - back-edge-iteration-counter
  - instruction-budget-for-fuzzing
  - bounded-shadow-backtrace
---

# Guest execution bounding

An interpreter embedded in a host runs code the host did not write, on the host's
thread, inside the host's process. It cannot be pre-empted by anything short of the
operating system, and the operating system's remedy - kill the process - is the host's
own death. So the interpreter must be its own governor: it must notice, from inside its
own dispatch loop, that the guest has gone too deep, too wide or too long, stop it in a
way the guest cannot argue with, and hand the decision back to the host. This subject is
the mechanism set for that: what an interpreter can count, where each count is checked,
how a breached ceiling is raised so that no guest handler can intercept it, how the
count stays honest when native code re-enters the interpreter, and how the same cost
model that bounds execution also lets a long evaluation yield fairly to a host executor
without slowing the path that never yields.

The principle underneath every technique here is one sentence: **a ceiling is
enforceable exactly where something is counted, and nowhere else.** An interpreter that
pushes frames can cap frames. One that owns a value stack can cap slots. One whose
compiler places an explicit counting instruction at every loop's back-edge can cap
iterations. One whose dispatch loop charges a cost per instruction can cap instructions
or yield on a budget. What it does not count - wall time inside a native call the host
provided, bytes allocated by that call on the guest's behalf - it cannot cap, and the
honest design says so beside the ceilings it does publish rather than letting the word
"limits" imply a completeness it lacks.

## Where this stops, and the neighbours start

The security subject `untrusted-extension-host` owns what an in-process sandbox can and
cannot contain - reach, grants, isolation tiers, and the publication of a runtime's
ceiling set as two lists, *counted* and *uncounted*. Its technique
[capability-subtraction-sandbox](../../../security/extension-trust/untrusted-extension-host/techniques/capability-subtraction-sandbox.md)
states, in its section on where the runtime counts, that the counted set is not empty for
an interpreter the host embeds, and that a counted ceiling must raise a failure the guest
cannot catch. This subject owns the *mechanism* of counting and stopping - which counters
exist, where they are incremented and checked, how the failure unwinds - and nothing
about reach or grants. The rule for a reader holding both: if the question is *what may
this guest touch*, or *what does "sandboxed" promise the operator*, read the neighbour; if
the question is *how does the interpreter know it is time to stop, and how does it stop*,
read here. The neighbour consumes this subject's ceiling list; this subject does not
decide who is allowed to set it.

Within the same subcategory, the register-machine subject owns the frame, the shared
value stack and the compiler that emits into it; this subject owns every limit that is
checked against those structures and the budget loop that drives dispatch. A frame's
layout is theirs; the rule that a frame is counted toward a ceiling before it is pushed
is here. And the fuzz-portfolio technique in the build-and-release area owns *where* an
instruction budget sits among a pipeline's fuzz targets and why the deepest target is the
one that needs it; this subject owns how the interpreter implements that budget so that
non-termination becomes a distinct, uncatchable outcome.

## The counters, and where each one is checked

An interpreter's state offers four natural counters, and each has exactly one right
place to be checked - the place where the quantity changes.

**Frames** change at a call boundary, so the recursion ceiling is checked at every call
boundary, before the frame is pushed, and it is checked for every kind of callee: a
guest function, a native function, a constructor. A native function pushes no frame in
most designs, and the temptation is to skip the check there because "nothing grows";
skip it, and a native function that calls back into the guest has opened a path where
the guest's depth is not observed on every hop. The check stays, and the accounting for
native re-entry is a technique of its own,
[count-host-reentry-in-recursion-depth](./techniques/count-host-reentry-in-recursion-depth.md):
a native caller that re-enters the run loop adds to the depth, because the process stack
grows on the native side whether or not a guest frame was pushed, and a depth that counts
only guest frames undercounts exactly on the path that overflows first.

**Value-stack slots** change at the same boundary, because a call pushes a prologue,
arguments and a register file. The slot ceiling is a second check at the same site with
a different predicate, and the two ceilings are not redundant: a shallow recursion with
enormous argument lists exhausts slots long before it exhausts frames, and a deep
recursion of nullary functions does the reverse. A design that keeps only one of the two
has decided which pathological program it will fail to stop.

**Loop iterations** change at a back-edge, and only the compiler knows where the
back-edges are. [back-edge-iteration-counter](./techniques/back-edge-iteration-counter.md)
places an explicit counting instruction after the condition and before the body, in
every loop form the language has, so that all of them count body executions identically
and a limit of *n* admits exactly *n*. The counter is per frame, not per evaluation:
a loop that calls a function that loops is two counters, each bounded, rather than one
counter that a nested call could exhaust on the caller's behalf. Native routines that
loop on a guest-supplied count charge the same counter, or they are an unbounded loop
wearing a library name.

**Instructions** change on every dispatch, and the dispatch loop is the only place that
can charge for them. Two consumers want that charge and they must not share a path.
The first is fairness:
[cost-budget-cooperative-yield](./techniques/cost-budget-cooperative-yield.md)
gives every instruction a static cost, decrements a budget in a *second* dispatch table
used only by the yielding loop, and yields to the host's executor when the budget reaches
zero, so a long evaluation shares a single-threaded executor with the host's other tasks.
The blocking loop dispatches through the first table and pays nothing. The second
consumer is termination:
[instruction-budget-for-fuzzing](./techniques/instruction-budget-for-fuzzing.md)
counts instructions down to a hard stop behind a build-time feature gate, so a fuzzer's
generated program that never halts becomes a finding with a name instead of a hang, and
so that wall time over the budget's prediction is a defect signal rather than a timeout.

## The verdict is the host's, and the guest cannot appeal it

Every counter above ends in the same act: raise a failure. The design decision that
makes the whole subject work is what class that failure belongs to.
[uncatchable-limit-errors](./techniques/uncatchable-limit-errors.md) owns it. A limit
breach is an engine-class failure, distinct from every guest-class error the language
defines, and catchability is decided by class: guest errors find a handler, engine
errors find none. When one is raised, the run loop skips every handler, pops frames to
the nearest frame marked as a host entry point, truncates the environment and value
stacks to match, and returns the failure to the native caller - who propagates it
outward through each enclosing re-entry until the outermost host call sees it.

The naive alternative is the language's own out-of-range error, catchable like any
other. It fails in the one case that matters: a guest that wraps its recursion in a
handler and retries inside the handler has turned the ceiling into a loop, and the host
that thought it had a recursion limit has a program that recurses to the limit
indefinitely. A limit the guest can intercept is not a limit; it is a suggestion the
guest may decline. The verdict must survive to the host as a typed value the host can
branch on, not as a message the guest already caught and rethrew as something else
([verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)).

## Yielding is fairness, not a ceiling, and it must not tax the path that never yields

The budget loop is easy to mistake for a fifth limit. It is not: when the budget reaches
zero the interpreter yields and *resumes*, with the budget refilled, and the guest never
learns it happened. Its purpose is that a host running many tasks on one thread - an
event loop driving promise jobs, timers and the guest's own evaluation - is not starved
by one long script. That is a scheduling concern with a scheduling remedy, and it
borrows the cost model only because the cost model is already the right unit: a
budget measured in instruction costs is deterministic where a wall clock is not, and a
yield point that arrives at the same instruction on every machine is the one that can
be reasoned about and tested.

The cost of the mechanism is paid once, at build time, by generating two dispatch
tables from one instruction definition: the blocking loop's handlers, and the yielding
loop's handlers that decrement the budget before doing the same work. A single table
with a branch on "is there a budget" would charge every instruction of every blocking
evaluation for a feature it is not using; a wall-clock check per instruction would cost
more and be less predictable. The budget's default is a number the embedder is expected
to tune by measurement, and the design is honest that "cost" is a relative weight, not
a cycle count.

## The backtrace is bounded like everything else

A limit failure that arrives at the host with no position is a verdict without a case.
The interpreter keeps a parallel stack of (instruction position, source position) pairs,
one per frame and one per native call, so that any failure can carry a backtrace without
the guest having to build it. [bounded-shadow-backtrace](./techniques/bounded-shadow-backtrace.md)
owns two rules that keep it useful. The backtrace is captured *before* the handler search,
so a failure caught by an internal handler - one the engine installed, not the guest -
still carries its positions when it is later rethrown or reported. And it is capped by a
backtrace limit, because the failure most likely to want a backtrace is the recursion
breach, and the recursion breach is the failure whose full backtrace is the largest
thing the interpreter could allocate at that moment.

## Defaults, and where a number comes from

A limits object has defaults, and the defaults are the ceiling set most deployments will
actually run under, so they are design decisions and not placeholders
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)). A representative set:
recursion at five hundred and twelve frames, value stack at ten thousand and some slots,
backtrace at fifty entries, loop iterations unlimited, yield budget in the low hundreds
of cost units. Two of those deserve a word. The loop limit defaults to unlimited because
a bounded loop count is a behaviour change every conforming program can observe, and
the recursion and slot limits already stop the runaway cases the loop limit exists for;
an embedder that wants it sets it. The slot limit should be derived - so many frames of
so many slots - and written beside the number, because a slot limit chosen by feel is the
one that trips first on a program nobody expected and is raised by feel in response
([limits-are-derived](../../../_laws.md#limits-are-derived)).

Limits are set by the host at construction and may be changed at run time by the host.
A guest-facing setter exists only behind an explicit debug flag, for engine tests written
in the guest language; an always-on setter is a ceiling the guest may raise, which is no
ceiling.

## What the naive reading gets wrong

The first naive reading is a watchdog: run the guest on a thread, kill it on a timer. It
fails three ways. The guest's thread holds the host's data and cannot be killed without
corrupting it; a timer fires at the same point on a slow machine and a slow input, so the
limit is not deterministic; and a thread is exactly what the single-threaded embedded
host does not have. Counting is deterministic, thread-free, and stops the guest at an
instruction boundary where every invariant holds.

The second is to count frames only. Every recursion through an accessor, a callback
passed to a native routine, or a promise resolution re-enters the interpreter from native
code, and each re-entry consumes process stack that no guest frame accounts for; the
guest-frame count sits well under its ceiling while the process stack overflows. The
depth is guest frames plus native re-entries, or it is a number that does not measure
what it claims ([count-carries-predicate](../../../_laws.md#count-carries-predicate)).

The third is to count loops where they are convenient rather than where they are
correct: one loop form counts before its condition, another after its body, a native
loop not at all. The result is a limit of *n* that admits *n* in one form and *n+1* in
another and infinity in the third, and a test that can never state what the number
means. One instruction, one placement rule, every form, including the native ones.

The fourth is to reuse the yield budget as the termination budget, or the reverse. The
yield budget refills and the guest continues; the termination budget does not refill and
the guest stops. Conflating them either makes fairness fatal or makes termination a
pause. They share a cost model and nothing else.
