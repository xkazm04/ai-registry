---
layer: technique
type: technique
subject: engine-host-contract
technique: monotonic-and-wall-clock-split
status: forged
laws: []
shared_with: []
use_when: [an embedded engine needs the time and the host has a clock of its own, timer tests are flaky or slow because they read the system clock, a timer fired early or late after a daylight-saving or manual clock change, a context that may suspend its thread is being built beside another context on the same thread]
---

# Monotonic and wall clock split

An engine reads the time for two reasons that have nothing in common. It schedules —
timers, intervals, a cooperative yield after so many milliseconds — and for that it needs
a clock whose differences are durations and whose readings never go backwards. It
formats — a date object, a timestamp the guest asks for — and for that it needs the civil
time a person would recognise, which the operating system may step at any moment. The
naive engine calls one system clock for both, and gets both wrong: its timers jump when
the wall clock is adjusted, and its dates would drift if they were read from the clock
that does not jump. The fix is to treat the clock as a host seam like every other, with
two readings and a rule for which code may use which.

## Two readings, one seam

The clock interface has two methods. **Monotonic** returns an instant: opaque, comparable,
subtractable to a duration, meaningless as an absolute. **Wall** returns a civil time:
milliseconds since an epoch, convertible to a date. The engine's scheduling code — timer
deadlines, interval re-arming, any cooperative yield measured in time — calls only the
first, and its date code calls only the second, and the split is enforced by the type: an
instant is not a number, so timer code cannot accidentally be handed a wall reading, and
a wall reading is not an instant, so a date cannot be built from one.

The seam is a seam because the host owns the clock. A host that simulates time — a game
that pauses, a replay that runs faster than real time, a scheduler that batches — needs
the engine's timers to follow its time and not the machine's. A host with a virtual
machine's clock, or a real-time constraint, or a clock it has already read this tick and
would rather not read again, fills the seam with its own. The engine ships a system clock
that reads the operating system, and it is the default, because a host that has no
opinion should get the machine's time.

## The fixed clock

The engine also ships a **fixed clock**: both readings are derived from one value the
test sets, and nothing advances it but the test — and the test can only advance it. A
fixed clock that could be set backwards would let a test violate the monotonicity the
timer code assumes, and the first test to do so would pass for the wrong reason; a
forward-only clock keeps the engine's own invariant true even in the harness built to
fake time. It exists because every timer test written against
the system clock is one of two bad things — slow, because it sleeps for the interval it
asserts on, or flaky, because it asserts a bound the scheduler occasionally misses. With
a fixed clock a test arms a timer for a second, advances the clock by a second, drains
the loop, and asserts the callback ran; it takes no time and cannot flake. The fixed
clock is also what makes date output testable: a date formatted "now" is deterministic
when now is a constant.

The rule that keeps the fixed clock useful is that the engine's *own* tests run on it,
not only the embedder's. An engine whose timer semantics are tested against the system
clock will document semantics it cannot reproduce, and the embedder's first fixed-clock
test will find the difference.

## The construction-time check that a suspendable agent is alone

The clock seam carries one more thing, because it is where the engine's assumptions
about the thread it runs on are stated. The specification's agent model has a flag that
says whether an agent may *suspend* — block its thread inside a wait primitive until
another agent wakes it — and it says that agents sharing a thread may not include one
that can. The reason is a deadlock with no stack: a suspended agent holds the thread, the
agent that would wake it needs the thread, and nothing points at either. The engine
cannot prove this at compile time, because the thread is the host's and the host may
build any number of contexts on it. What it can do is check at context construction: a
thread-local count of the contexts alive on this thread, incremented when one is built
and decremented when one is dropped, and a refusal to build a suspendable context while
the count is above zero. The refusal is a typed construction error naming the rule, so an
embedder who tripped it reads the specification's constraint rather than a hang.

The check must be symmetric to be a check. Counting only the contexts that cannot
suspend and refusing only the suspendable one catches the order "build ordinary, then
build suspendable" and misses "build suspendable, then build ordinary" — the second
context is admitted onto a thread that already holds one that may block it. Keep two
counts, or one count and one flag, and refuse in both directions. And where the host
language can express thread affinity in the type — a context that cannot be sent to
another thread — use it as well, because it turns the cross-thread half of the mistake
into a compile error and leaves the counter only the same-thread half.

The migration this seam absorbed is instructive. A wall-clock reader that began life as
a host hook on the general override surface belongs here, beside its monotonic sibling;
it was moved by deprecating the old hook in place with a pointer to the clock, not by
removing it, so no embedder's override broke on the release that moved it.

## Decision rules

- When engine code needs the time, decide first whether it schedules or formats, because
  the two need different clocks and one system clock serves neither.
- When scheduling, read the monotonic clock and compute with instants, because a wall
  reading steps and a timer built on it fires early or late after every adjustment.
- When formatting a date, read the wall clock, because a monotonic reading has no
  meaning as a point in civil time.
- When designing the clock interface, make the two readings different types, because a
  shared numeric type lets scheduling code be handed a wall reading without a compile
  error.
- When shipping clocks, ship a system clock as the default and a fixed clock for tests,
  and run the engine's own timer tests on the fixed one, because semantics tested
  against the system clock cannot be reproduced.
- When shipping a fixed clock, let it move only forward, because a test that steps it
  back has broken the invariant the timer code assumes and will pass for the wrong
  reason.
- When a context may suspend its thread, count the contexts alive on the thread at
  construction and refuse to build a suspendable one beside any other — in both build
  orders — because the deadlock this prevents has no stack pointing at it.
- When a wall-clock hook already exists on the general override surface, deprecate it in
  place pointing at the clock seam rather than removing it, because every embedder's
  override breaks on removal and none breaks on deprecation.

## When not to use it

An engine that exposes neither timers nor dates to the guest — a configuration language,
an expression evaluator — reads no clock and has no seam to cut. An engine whose host
mandates a single clock source by platform contract, such as one that must follow a
simulation's tick for everything including dates, collapses the two readings to one by
design, but it should still keep the two method names so the collapse is visible as a
host decision rather than an engine assumption.
