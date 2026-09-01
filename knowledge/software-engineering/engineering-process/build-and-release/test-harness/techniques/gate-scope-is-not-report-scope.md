---
layer: technique
type: technique
subject: test-harness
technique: gate-scope-is-not-report-scope
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [a coverage gate is green over a scoped include set, deciding which files a quality report is defined over, an untested directory has never appeared in any report]
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

## The diagnostic

One question against the configuration: **could a source file exist in this
repository, be shipped to production, and never appear in any coverage report
at any percentage?** If yes, the report is defined over the tested subset and
its headline is a statement about that subset. The fix is a second include
set, not a lower floor.
