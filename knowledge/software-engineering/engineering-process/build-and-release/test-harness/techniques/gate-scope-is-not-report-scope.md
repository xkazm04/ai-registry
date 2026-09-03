---
layer: technique
type: technique
subject: test-harness
technique: gate-scope-is-not-report-scope
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [a coverage gate is green over a scoped include set, deciding which files a quality report is defined over, an untested directory has never appeared in any report, a coverage floor is met by tests that take no decision the code offers]
---

# The gate's scope is not the report's scope

A coverage threshold that must pass on every commit cannot be defined over a
large untested surface — the gate would be red from the day it was added, and
a gate that has never been green
[certifies nothing](../test-harness.md#lane-health-green-must-be-earned-red-must-be-loud).
So teams scope it: name the directories the suite genuinely covers, set floors
just under today's measurement, and ratchet. This is correct, and it is the
right way to introduce a gate into a codebase that did not have one.

The defect is not the scoping. It is using **one** scope for two consumers
that need opposite populations.

A quality report has two jobs and they pull in different directions:

- **The gate** answers *may this change land?* It needs a population it can
  actually hold a floor over, or it is deleted within a quarter.
- **The report** answers *what does this suite not see?* It needs the
  population the reader believes it is being told about — the whole tree — or
  a file no test imports does not read as 0%, it does not appear at all.

Collapse the two into one `include` list and the gate stays honest while the
report silently redefines the codebase as the subset already under test. The
headline number is then true and useless in the same way a drift report that
never queried anything is true and useless — except that here nothing was
skipped and no branch was taken. The population was **defined** to exclude the
risk, at configuration time, by a human writing a list.

## The two include sets, and why the second one has to be automatic

Configure the report over the whole source tree, with the tool's
"instrument every matching file whether or not a test imported it" switch
turned on, and configure the threshold separately over the scoped set. Most
runners support both at once; where a runner supports only one, run it twice
and publish both numbers.

The asymmetry that matters: the gate's scope is **hand-maintained and that is
fine**, because a human adding a directory to a floor is doing deliberate
work with an immediate red-green signal. The report's scope must be
**derived from the tree**, because its whole function is to show what nobody
has thought about yet, and a hand-maintained list of things you have thought
about cannot do that. A scope that must be extended by remembering to extend
it converges on stale, and it fails in the direction that looks like success.

This is the same failure the harness's own lane health section describes, one
level up: a lane that has never been green is visibly scaffolding, but a lane
that is green over a population chosen to make it green is invisible
scaffolding. The count carries its predicate
([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate))
or it is not a coverage number, it is a coverage number *about five files*.

## A ratchet needs a denominator it did not choose

The scoped-gate pattern almost always ships with a ratchet: floors sit just
below current measurement, so new untested code in those directories fails
CI. The ratchet is sound and it has one blind spot that is total rather than
partial — **it can only ever ratchet over directories somebody already added
to the list.** A new feature directory, written from scratch with no tests,
does not lower any floor. It is not a regression the ratchet can detect; it is
not in the ratchet's universe. The mechanism designed to prevent coverage
decay is structurally incapable of seeing the most common way coverage decays.

Publishing the total-denominator report beside the gate fixes this without
touching the gate: the floors keep protecting what they protect, and the trend
line on the whole-tree number is what shows a new untested directory arriving.
Two numbers, two predicates, one run.

## An exclusion is an obligation, not a hole

Some files genuinely cannot be instrumented by a unit runner — type-only
modules that emit no runtime code, re-export barrels, browser-only entry
points, a terminal keyboard state machine that needs a TTY. Excluding them is
correct. Excluding them *silently* converts each one into a permanent
untestable region that grows.

The discipline that keeps an exclusion honest is to pair every excluded file
with the tested module its extractable logic lives in, and to say so at the
exclusion site: this browser entry point is excluded, its pure logic is in
`client-lib`; this setup wizard hook is excluded, its steps, formatting and
persistence are three tested modules beside it. The exclusion then carries a
rule a reviewer can apply — *new logic goes in the tested module, not in the
excluded glue* — instead of being an open invitation to put logic where the
report cannot follow. An exclusion list whose entries have no named
destination is a list of places to hide work.

The related trap is a fixture tree that carries its own tests. A benchmark or
golden-repo fixture rebuilt on disk can contain the upstream project's test
files; those belong to the fixture, not to this suite, and one discovery
exclusion keeps a fixture's presence on disk from silently changing what this
project's suite reports.

## The other half of the number: its criterion

Everything above is about the **denominator** — which files the percentage is
computed over. A coverage figure has a second parameter, independent of the
first and just as invisible in the output: **what counts as covered**.

The usual criteria, from weakest to strongest: a line was executed; a function
was entered; every arm of every decision was taken; every sub-expression region
was evaluated. They are not refinements of one measurement, they are different
measurements, and the spread between them on the same suite is routinely tens
of points. "Coverage: 82%" is therefore not a number. It becomes one at "82% of
executable lines in the whole source tree, measured by compiler
instrumentation" — the count carries its predicate
([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate))
or it is a figure two teams will read as two different claims.

The consequence for a floor is sharper than the consequence for a report. **A
line-criterion floor is satisfiable by tests that take no decision the code
offers.** A function with three thresholds and four outcomes reaches full line
coverage from tests that exercise two of them, because the untaken arms
contribute no uncovered lines — they are the *absence* of a line, and absence
is not a measurable region. The one path that was never taken is the sensor
error case, and it is the one anybody would have written a test for if they had
known it was missing. A gate defined on the weak criterion is thus green
precisely over the code whose risk is decision-shaped, which is most code worth
gating.

The rule that follows is the same two-consumers move as the include sets, on the
other axis: **the floor may be held on the criterion the tree can currently
meet; the report shows the stronger criterion beside it.** The gap between the
two figures is the finding — it is a direct measure of how much of the tested
code was reached without being interrogated — and its trend is what a review
should read, not the headline. Both numbers name their criterion wherever they
render.

**The inversion, and it is not optional.** Do not gate on the strongest
criterion available. Below the source language, the compiler synthesizes
decisions the author never wrote: an unwrapping of an optional value, an
implicit failure path, the arms of a pattern match expanded into a chain, a
bounds check. Instrumentation counts those as decisions, and no test can take
the branches that exist only because a lowering created them. A floor set on a
criterion that measures the compiler's own control flow is unmeetable by
construction, and it is unmeetable by a margin that varies with the optimizer
rather than with the suite — which means the gate's verdict moves when nothing
in the tree moved. Gate on the criterion the source text can actually satisfy;
report the stricter one as a diagnostic that a human reads, and expect it to be
structurally lower forever.

## The diagnostic

One question against the configuration: **could a source file exist in this
repository, be shipped to production, and never appear in any coverage report
at any percentage?** If yes, the report is defined over the tested subset and
its headline is a statement about that subset. The fix is a second include
set, not a lower floor.

And one against the number: **could a decision the source text offers be
untaken by every test in the suite, and the figure be unchanged?** If yes, the
figure is a line-criterion measurement, and it must say so wherever it renders.
The fix is a second criterion published beside it, not a higher floor.
