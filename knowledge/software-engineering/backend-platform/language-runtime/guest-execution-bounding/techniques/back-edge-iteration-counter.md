---
layer: technique
type: technique
subject: guest-execution-bounding
technique: back-edge-iteration-counter
status: forged
laws: [count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [an embedder wants a ceiling on loop iterations and the interpreter has no natural loop counter, different loop forms disagree about how many iterations a limit of n admits, a native routine loops on a guest-supplied count and escapes the loop limit, deciding whether an iteration counter is per frame or per evaluation]
---

# Back-edge iteration counter

## The concern

Frames and slots count themselves; loops do not. An interpreter's run loop sees jumps,
and a backward jump is a loop's back-edge, but the run loop cannot tell a back-edge
from a jump into an earlier arm of a switch, and a loop's *body executions* - the thing
an embedder means by "iterations" - do not correspond one to one with backward jumps in
every loop form. Only the compiler knows where a loop is and where its body starts. So
the counter is an **explicit instruction the compiler emits**, and the whole technique
is the rule for where it goes.

## One instruction, one placement rule, every form

The instruction increments a per-frame iteration count and compares it against the
limit *before* incrementing: if the count already equals the limit, raise the limit
failure; otherwise add one. The compare-then-increment order is what makes a limit of
*n* admit exactly *n* executions.

The placement rule is: **after the loop's condition, before the loop's body**, in every
loop form the language has. A counting loop's condition is tested, then the counter
runs, then the body; a pre-test loop the same; a post-test loop places it at the top of
the body so the first execution - which skips the test - still counts; an iterator loop
places it after the iterator step reports "not done" and before the body. Placing it
before the condition counts the final, failing test as an iteration and a limit of *n*
admits *n-1*; placing it after the body misses the iteration that is in progress when
the limit is hit and admits *n+1*, and a loop whose body never completes - because it
throws, or because it is the one that never terminates - is never counted at all.

The consequence of the rule is a testable statement: for every loop form, a loop that
executes its body exactly *limit* times completes, and a loop that would execute it
*limit+1* times fails with the body having run *limit* times, observable through a
variable the body incremented. A test that asserts that for every form, with one limit,
is the whole specification of the counter, and it is the test that catches the form
somebody added later with the instruction in the wrong place.

## Per frame, not per evaluation

The counter lives on the frame, not on the interpreter. A loop that calls a function
that loops is two counters, each bounded by the limit, and neither can exhaust the
other's allowance. The per-evaluation alternative - one counter for the whole run -
makes the limit mean "total body executions anywhere in the program", which is a
different and less useful number: a program that calls a ten-iteration helper a
thousand times has done nothing wrong, and the per-evaluation counter stops it. Per
frame, the limit bounds the thing the embedder was afraid of, which is a single loop
that never ends. The counter is reset when the frame is pushed, and a generator's frame
keeps its count across suspensions because the frame is the same frame.

## Native loops charge the same counter

A native routine that loops a guest-supplied number of times - string repetition,
array fill, a padding routine - is a loop the compiler never saw, and with the limit set
low a guest that cannot write `while (true)` can still write `repeat(a large number)`.
The rule is that a native loop over a guest-controlled count calls the same increment
operation per iteration that the emitted instruction calls, charging the *calling*
frame's counter, since a native routine has no frame of its own. Then the loop limit
means what it says across the library, and the test above extends to one line per
native routine: with the limit at ten, a repetition of a hundred fails with the loop
failure, not with a native range failure and not with success.

The rule is a floor, not an audit of every native loop. A native loop bounded by the
size of an existing value - iterating an array that already exists - is bounded by the
memory that value already occupies and is not the runaway case. The ones to charge are
the loops whose count is a number the guest chose.

## The default is unlimited, and that is a decision

The loop limit ships disabled - the sentinel is the counter's maximum value - because
a bounded iteration count is observable by every conforming program and most embedders
do not want it. The counter still runs; its cost is one compare and one add per
iteration, small beside the iteration itself, and it is the price of the embedder who
does want it being able to turn it on without a rebuild. The number the embedder sets
is theirs, and it carries its predicate: body executions per frame, counted at the
placement above ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
The test reads the guest's own observable count of body executions, not the
interpreter's counter ([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## Decision rules

- Count iterations with an explicit instruction the compiler emits, never by
  detecting backward jumps in the run loop.
- Place it after the condition and before the body in every loop form, and assert
  with one test that every form admits exactly the limit.
- Compare before incrementing, so a limit of *n* admits *n*.
- Keep the counter on the frame; reset on push; preserve across suspension.
- Charge native loops over guest-chosen counts through the same operation against the
  calling frame.
- Ship the limit disabled, and make disabling it a named operation rather than a
  magic number.

## When not to use it

An embedder that already terminates by instruction budget has a stronger bound that
subsumes this one - a loop of any form spends instructions - and can leave the loop
limit off. This counter exists for the embedder who wants the blocking evaluation to
stay unbudgeted and still wants runaway loops to stop, and for the fuzzing case where
"which loop" is more useful than "which instruction".
