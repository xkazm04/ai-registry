---
layer: technique
type: technique
subject: test-harness
technique: approval-snapshots-with-guarded-update
status: forged
laws: [gate-sees-target, absent-guard-is-loud, failure-not-empty-success]
shared_with: []
use_when: [the expected output is a rich structure that per-field assertions would duplicate, deciding how a snapshot suite may be re-baselined, a pipeline run went green after a change that should have altered recorded output, choosing between an environment flag and a source constant for record mode]
---

# Approval snapshots with a guarded update

An approval test records what a computation produced once, as a file, and
thereafter asserts that it still produces the same thing. It is the right
instrument when the output is a rich structure - a laid-out element tree, a
rendered document, a serialized message with forty fields - where
field-by-field assertions would be a second copy of the builder, maintained
by hand, and would still miss the field nobody thought to assert. Each case
is one file carrying the input, any parameters, an overlay of settings, and
the expected output; the suite discovers cases by listing the directory, so
adding a case is adding a file.

The instrument has one structural weakness, and it is the same mechanism
that makes it useful: **the code that verifies a snapshot is the code that
records it.** Put the suite in record mode and every case passes, because
"pass" now means "written". A suite that can be silently left in record mode
is a suite that certifies nothing while reporting green - the exact shape of
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success).
This technique is the guard: **the record switch is a constant in the test
source, off by default, and a test in the same suite asserts that it is off,
so the pipeline proves on every run that the snapshots were verified and not
rewritten.**

## The switch lives in the source, not the environment

Three shapes of record switch exist, and they are not equivalent:

- **A runtime flag** - a command-line option or an environment variable.
  Convenient, and invisible: an environment variable set on a runner, or
  exported in a shell profile, is inherited by the pipeline without
  appearing in any diff, and nothing in the run's output distinguishes a
  verified pass from a rewritten one.
- **A runtime flag with pipeline detection** - the widespread shape, where
  the writer refuses to record when it believes it is running in a pipeline.
  Better, and dependent on the detection: a self-hosted runner that does not
  set the expected variable, or a local run that does, defeats it quietly.
- **A compile-time constant in the test file**, defaulting to verify. Turning
  it on is a source edit, which means a diff line, which means a reviewer
  sees it; and because it is a constant, an ordinary test can assert its
  value. That assertion is the integrity test, and it runs wherever the suite
  runs.

Prefer the third whenever the suite is compiled. Where it is not, pair the
runtime flag with an explicit refusal to write in a pipeline *and* a test
that proves the refusal fires - a guard that must be configured is an absent
guard ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)),
and a switch left on must be a red build, not a quiet one. The integrity
test is a negative control built into the suite: the one state in which the
whole suite is unfalsifiable is the one state it refuses.

One switch per snapshot category, not one global switch, is the better
default. Re-baselining the message builder must not re-record the uploader's
snapshots as a side effect; the cost - no single place to flip - is the
point, because a flip is meant to be a local, deliberate act. The integrity
test then exists once per switch, and a grep for the constant's name is the
inventory of both.

## The re-baseline ritual

Re-recording is legitimate and frequent: the builder changed on purpose and
the recorded outputs are now wrong. The ritual is four steps and a reading:
flip the constant, run the suite (it rewrites every case in the category),
flip it back, run again (it now verifies), and **read the diff of the
snapshot files** - that diff is the approval, and it lands in review as a
data diff a reviewer can judge line by line. The reading is the step that
matters and the one that is skipped under pressure, which is why the diff
must be readable: structured, deterministically ordered, one case per file.

A new case is the special instance: it starts as a file carrying only the
input, is recorded once, and gets the closest reading of all, because it is
the only recording with no prior to diff against. Whatever the author
approves at that moment becomes the oracle for every future run.

## Comparison is structural, with a path

Compare as data, never as bytes. A byte comparison fails on formatting and
passes on nothing useful; a structural comparison walks both trees and
reports the *path* of the first divergence - which array index, which key -
with the expected and actual values at that point. Two rules keep it honest:
key-count equality at every object, so an added field is a failure rather
than an unnoticed extra; and a type mismatch reported as such, because
"expected string, got number" locates a bug that "values differ" does not.

## Boundaries

**Against the frozen oracle.** The repair-time rule - a fixer making a red
check green may not write to the oracle - governs *who* may touch snapshots
while a fix is in progress. This technique governs *authoring*: how a
snapshot is written at all, and how the pipeline proves it was not written
there. The two compose, and the compile-time switch is what makes the
repair rule mechanically checkable: a repair diff that flips the constant,
or that touches the snapshot directory, is visible as an oracle edit rather
than as plumbing.

**Against fixtures.** A fixture is an input the suite builds once and copies;
a snapshot is an expected *output*. Both are files in the tree, and only one
of them is an oracle. Fixture freshness is about cost; snapshot freshness is
about truth.

**Not for** outputs with intrinsic nondeterminism - timestamps, generated
identifiers, hash-ordered containers - unless the serialization normalizes
them first; every unnormalized field is a case that fails on every run and
trains readers to re-record without reading. Not for small scalar outputs,
which should be asserted directly. And not where the writer of the output
and the reader of the snapshot are the same serializer with no independent
meaning: recording what a function returns and asserting it still returns
that is a tautology unless the recording was read and approved by a person.

## Decision rules

- When the output is a structure with more fields than anyone would assert
  by hand, record it and review the recording - because the alternative is
  a partial oracle that passes on the field that broke.
- When choosing the record switch, choose the shape a test can assert -
  because a guard the pipeline cannot see is a guard the pipeline does not
  have ([gate-sees-target](../../../../_laws.md#gate-sees-target)).
- When re-baselining, flip back before committing and read the data diff -
  because the diff is the approval and the commit without it is a rewrite.
- When a field is nondeterministic, normalize it in the serializer, not in
  the comparison - because a comparison that ignores fields is a comparison
  that can be taught to ignore the wrong one.

## How to test for the property

- **The integrity test exists per switch**, and the suite's inventory of
  switches equals its inventory of integrity tests.
- **Prove the guard once**: flip the constant, push to a branch, watch the
  pipeline go red on the integrity test and on nothing else. A guard that has
  never been seen red is scaffolding.
- **No second path to record.** Grep the suite for environment reads and
  command-line parsing around the record call; the constant must be the only
  input to the decision.
- **Review the snapshot directory as an oracle.** Changes under it appear in
  review as their own hunk set, and a change there without a corresponding
  change in the code under test is a question, not an approval.
