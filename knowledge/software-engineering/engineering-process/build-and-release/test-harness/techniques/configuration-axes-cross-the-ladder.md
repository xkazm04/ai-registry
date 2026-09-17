---
layer: technique
type: technique
subject: test-harness
technique: configuration-axes-cross-the-ladder
status: forged
laws: [gate-sees-target, count-carries-predicate, unknown-is-not-a-value]
shared_with: []
applied: code
ab_verdict: better
use_when: [a suite runs under more than one build configuration or feature set, deciding whether an environment or capability option is a rung of the fidelity ladder or an axis across it, a result is reported per file or per platform while the run varied something else too, two separate jobs each vary one option and the pair is read as covering both, a conditional-compilation flag decides which tests exist, the same test passes under one configuration and fails under another, publishing a green verdict for a suite whose options multiply]
---

# Configuration axes cross the ladder

The fidelity ladder orders suites by *what is under test* — unit, integration,
end-to-end, live-app, long lanes. It is one axis, and it is the axis a harness
document is usually organised around. Every option that changes the world a
suite runs in — a feature set, a capability flag, a storage engine, a runtime
version, a rendering engine, a checksum or cache-discard setting — is a
**second axis, orthogonal to the first**. The suite's result space is their
product, not their list.

Treating an option as a property of a rung is the mistake, and it is easy to
make because the option is usually *introduced* at one rung. It gets written
into that lane's configuration, the lane's name absorbs it, and from then on
the option is discussed as though it were part of what that rung means. It is
not: the same option applies at every rung, and every rung that does not vary
it is reporting one of its values.

> **The result unit is the cell — one value of every axis the run varied. A
> result keyed on fewer axes than the run varied is not a weaker result; it is
> a result with no interpretation, because nothing in it says which cell it
> came from.**

That is the ordinary form of
[count-carries-predicate](../../../../_laws.md#count-carries-predicate) at the
altitude of a suite: a pass rate names its configuration or it is a pass rate
about a configuration the reader is guessing.

## Why a file-level result cannot represent a multi-cell run

The test that forces this is a single one: **can the same test succeed in one
cell and fail in another?** Wherever the answer is yes — and it is yes for any
option that reaches the code under test — a result keyed on the test alone has
to pick, and every way of picking is wrong. Report the first outcome and the
run depends on iteration order. Report the worst and a real pass disappears.
Report an aggregate and the one thing anybody needed, *which configuration
broke*, is the thing that was averaged away.

So the harness carries the cell as the identity of the result, all the way
through: a run produces one record per (cell, test), reporters aggregate from
those records, and no layer above the record is permitted to collapse two cells
into one row. The collapsed row is not just lossy — it is the reason a
regression that only fires on one option can sit in a green suite for a
release, because no artifact ever contained the sentence that would have named
it.

The same discipline has a second, easily-missed half on the ownership side.
The per-cell records are the run's evidence and must be **immutable** once
written, while the collection that holds them is mutable and advances as the
run proceeds. That split is what lets a reporter observe transitions — this
cell moved from running to failed — without owning the record or being able to
edit history. A mutable record with several observers produces a report whose
content depends on when it was read, and an immutable collection cannot
represent a run in progress; the asymmetry is the design, and it is worth
stating because the intuitive arrangement is the opposite one.

## Two one-axis jobs are not a two-axis matrix

This is where the failure actually ships, because both jobs are individually
correct and the reasoning behind the split is usually written down and sound.

A measured instance: one job ran the suite across three operating systems under
the default feature set; a second job varied three non-default feature sets on
one operating system, with a comment correctly explaining that the feature
shapes are about conditional-compilation resolution rather than about platform,
so crossing them with the platform axis would buy little. Both true. The
consequence neither job's author had to confront is that the second job runs
a **compile** check, not the suite — so the union of the two jobs covers the
platform axis at one feature value and the feature axis at zero test values,
and the reported verdict, *the suite is green on three platforms*, is a
statement about one cell of a twelve-cell space.

The cost was measurable and was not a hypothetical: **25 test functions in that
tree sit inside test modules gated on a capability feature that no test
invocation anywhere in the project enables** — not in any pipeline job, not in
the project's own test runner, not in any script. On the one library crate
measured directly, adding that single feature value moved the crate's compiled
test total from 1,340 to 1,352, and running the missing cell's filter returned
`12 passed` where the reported cell returned `running 0 tests ... ok` at exit
zero. They are in no cell of any reported result, the report does not mention
them, and the runner cannot: from its point of view they do not exist.

The cells are also not nested, which is the detail that kills the intuitive
repair. The same crate compiled 1,340 tests under the default feature and 1,189
under the other one, against 1,352 for the pair: **each cell holds tests the
other lacks.** "Run the richer configuration instead" therefore trades one
blind region for another, and only the union is the suite.

**Deciding not to cross two axes is a legitimate and often correct decision.
Reporting the uncrossed region as covered is not.** When the axes are not
crossed, the cells that no job runs are named where the gate configuration
lives, so the green carries its predicate.

One further observation from the same tree, and it is the reason this is a
technique with an instrument rather than a paragraph of advice. The team had
already found this. A standing design document enumerated the variants nothing
compiles, gave the figure per variant, and stated the consequence in one line.
It had been correct and current for weeks, and the gate was unchanged. A
written finding with no instrument decays into a description of a permanent
condition: it stops being read as a defect and starts being read as the shape
of the project. The instrument is what converts it back into a thing that can
fail.

## A missing cell is invisible to every instrument that lives inside a cell

The reason this class survives audits is that the harness's existing
population checks are all defined *within* a configuration, and a missing cell
is not inside any of them.

- A **selection floor** — the rule that a lane which selected nothing fails
  rather than passes — is computed over the tests the runner enumerated.
  Conditional compilation removes a test module before enumeration, so the
  lane's selection count is *correct for its own cell*. Nothing is deselected;
  nothing is skipped; no branch was taken.
- A **discovery reconciliation** — matched files against files that reported —
  balances, because the file is discovered and does report. The part that
  vanished was a module inside it.
- A **shipped-artifact inventory** — every artifact named against the gated
  build root that compiles it — returns a clean bill of health, because the
  crate *is* in the build graph and *is* gated. The thing with no gate is a
  feature cell of a gated crate, which the inventory has no column for.
- A **coverage report over the whole tree** cannot see it either: an
  instrumenter measures the artifact it was handed, and the artifact was
  lowered without the region.

Each of those checks is in perfect health and pointed at the wrong population,
which is the [gate-sees-target](../../../../_laws.md#gate-sees-target) shape
arriving from a direction none of them watch. The only instrument that can see
a missing cell is one that reads the **axis's declared values** — the feature
list in the manifest, the engine list in the runner configuration, the version
list in the toolchain pin — and compares that set against the set of cells some
job actually runs. It is an inventory check over the configuration space, not a
check over any run, and like every inventory check it can see a thing that was
never tracked.

The diagnostic that ships with it: **enumerate the axis from its declaration,
not from the jobs.** A list assembled from the jobs is a list of the cells
somebody remembered, and it agrees with itself by construction.

That instrument has one failure mode of its own, and it is worth stating
because it fires on the first run and fails toward clean. To find which cells
some job runs, the check reads the text of the jobs — and the repository
contains other text that *describes* an invocation without being one. The
check's own documentation, which quotes the uncovered configuration as its
worked example. The check's own tests, whose fixtures include the
widest-possible invocation as a parser case. A design document that quantifies
the gap in prose. Read as real invocation sites, each one adds the missing
value to the covered set and empties the finding; the widest fixture empties it
in a single line. Both happened while this technique was being measured, and
neither produced an error — they produced a green gate over a gap that had just
been counted. So the population the instrument scans excludes its own
documentation and its own tests, **by name, with the reason at the exclusion
site**, and the check's own test asserts that its baseline still records a
non-empty finding. An inventory whose evidence includes its own description of
the thing it looks for has no evidence at all.

## The cross product is not the cell set

The rule above pushes toward more cells, and taken alone it is satisfied by
running everything against everything — which is both unaffordable and wrong.
Two axes are frequently not independent: one value of an axis can make another
axis meaningless, so the arithmetic product contains cells that **describe a
configuration that cannot exist**. A component that performs the whole job
itself cannot be paired with the component that would otherwise do half of it;
a build target that excludes a subsystem cannot be paired with that
subsystem's options.

Three consequences, and the third is the one that decides whether the report is
usable.

1. **Ask the domain for the legal combinations; do not multiply.** The set of
   cells comes from a function that knows which pairings are coherent, living
   beside the axes' own definitions. Multiplying and then subtracting
   exceptions puts the coherence rule in the report's renderer, where it drifts.
2. **An impossible cell is not an untested cell.** Reported as untested it
   becomes a permanent, unclosable gap that every reader has to be told about
   individually, and a table with unclosable gaps stops being read. It needs
   its own word in the verdict vocabulary, distinct from both *failed* and
   *not run*.
3. **The vocabulary needs more than pass and fail generally.** A cell whose
   prerequisite is absent on this machine was never asked, and calling that a
   failure makes a green run impossible on a developer box while making an
   amber one meaningless; a cell that passed on one attempt and failed on the
   next under an identical configuration is neither passed nor failed. Each
   distinction that the run can actually observe gets a word, because
   [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) — a
   cell that was never asked, rendered as a pass or as a failure, is the
   laundering point.

## The pair of assertions that keeps this honest

A single assertion in either direction is passed by a change that does nothing
and by a change that does far too much. Assert both, on the same run:

- **Separate when the axis moves.** Two cells of the same test that disagree
  across an axis produce two distinguishable reported results, and the
  configuration is readable off each one.
- **Agree when the axis does not move.** A test whose outcome is identical in
  every cell still reconciles to one verdict rather than N indistinguishable
  rows. This is the half that refuses the sledgehammer: keying a report on
  every axis in sight multiplies a stable result into noise and buries the one
  genuine split.

## The diagnostic

Two questions against the configuration.

**Could a test in this repository pass in every cell this pipeline runs, and
fail in a configuration the project ships?** If yes, the verdict is keyed on
fewer axes than the product varies, and the fix is a cell, not a lower floor.

**Could a test in this repository exist, be shipped, and appear in no cell of
any reported result at any verdict?** If yes, an axis has a value no job
enumerates. Answer it by walking the axis's declaration against the job list;
a run's own output cannot answer it, because the run never saw the region.

## When not to use it

A suite with one value on every axis has no product to key on; adding an axis
with one value multiplies nothing and costs a column. Where an axis is
genuinely inert with respect to the code under test — a cosmetic option, a
logging verbosity — crossing it manufactures cells nobody will read, and the
test for inertness is whether varying it alone can change a single test's
outcome, asked once against the tree rather than assumed. And where the cells
are affordable but the *report* is the constraint, prefer publishing per-cell
records with an aggregated default view over collapsing the records: the
aggregate can always be recomputed from cells, and no cell can ever be
recovered from an aggregate.
