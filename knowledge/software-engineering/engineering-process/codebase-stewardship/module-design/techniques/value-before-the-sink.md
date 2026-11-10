---
layer: technique
type: technique
subject: module-design
technique: value-before-the-sink
status: forged
laws: [gate-sees-target]
shared_with: []
applied: blind-ab
ab_verdict: better
use_when: [fixing a defect in a line that is built inside a print or log or write call, a formatted row or message has branches and no test, deciding whether to capture output or spy on the console to test a report, a report script prints a table from a loop and the columns misalign for some rows, adding a regression test for a printed value]
---

# The value before the sink

A value that is built inside the argument list of an output call - a print, a
log line, a write to a stream, a message sent - exists only as a side effect.
Nothing can call the expression without performing the effect, so nothing can
assert what it produced. When that expression carries a decision - a missing
value against a present one, a unit, a padding width, a pluralisation - the
decision has no seam, and it has no test for that reason rather than by
anyone's choice. **Extract the expression into a function that returns the
value, leave the sink in the caller, and the test arrives with the
extraction.**

This is the function-scale case of what [io-free-core](./io-free-core.md)
does to a module and [declarative-or-sequential](./declarative-or-sequential.md)
does to a call chain: the effect moves to the end and the decision becomes a
value. It needs its own statement because it is where the separation is
skipped most often - a report row inside a loop is too small to look like
design, so a defect in it is fixed in place and leaves exactly as untested as
it arrived.

## The move

1. **Name the expression that carries the decision**, not the whole loop body:
   `formatRow(row, widths) -> string`. Everything the expression read from the
   loop - the row, the current time, a column width computed across all rows -
   becomes a parameter. A width that depends on the other rows is computed by
   the caller and passed in; the function stays value in, value out.
2. **The call site keeps the sink and nothing else**: `print(formatRow(r, w))`.
   No branch is left beside the print; a branch there is one the test cannot
   reach.
3. **Put the function where the project's tests already import from** - the
   helper module beside the script, not a new file pattern - and add the test
   in the runner the project already has.
4. **Assert every branch of the decision in one test named for the
   invariant**, with literal expected strings: the missing row and the present
   row, the short value and the overflowing one. A defect of this class is
   usually a disagreement *between* branches (one branch's unit glued to the
   number, the other's not; one column padded, its neighbour not), and only a
   test holding both branches side by side can see it.

The check that the extraction was honest is the same one
[mirror-type-at-the-edge](./mirror-type-at-the-edge.md) uses: count the
branches of the decision the test runner can reach. Before, zero. After, all
of them, and the sink line has none.

## Why not capture the output instead

Capturing the stream or spying on the console is a seam on the *effect*, and
it asserts through a proxy
([gate-sees-target](../../../../_laws.md#gate-sees-target)): the test now
depends on how many lines were written, in what order, with what other output
interleaved, and it has to run the whole script - its file reads, its clock,
its exit - to reach one row. On some toolchains the print has no capture point
a test can use at all. Capture is right only when the thing under test *is*
the effect: the ordering of lines, that a line was written at all, the exit
status. For the content of a line, return it.

## When not to

- **A fixed literal, or a projection with no branch.** A message whose text
  never varies, or a line that only joins fields with no choice in it, has
  nothing to pin. Edit it in place; extracting it buys a test that restates
  the literal.
- **Not every print in the file.** Extract the one that carries the decision
  being changed. A pass that lifts all of a script's output into a formatting
  module is a refactor nobody asked for, and the review cost lands on the fix.
- **Not a writer parameter threaded through the script** to make output
  substitutable. That keeps the effect and adds a seam to it; the value is
  still unreachable without running the code that produces it.
