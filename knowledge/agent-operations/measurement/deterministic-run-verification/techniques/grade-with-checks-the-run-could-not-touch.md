---
layer: technique
type: technique
subject: deterministic-run-verification
technique: grade-with-checks-the-run-could-not-touch
status: draft
laws: [measure-the-tree-not-the-summary, the-repository-outranks-the-instruction]
shared_with: []
use_when: [grading a run that had write access to its own tests or gates, a run's diff touches a test, fixture, hook or gate configuration, deciding whether to void a run that edited its checks or to grade it anyway, a check passes in a run's tree and nobody can say whose version of the check ran]
---

# Grade with checks the run could not touch

The concern: an unattended run holds the same shell the harness holds. It can read the
command that will grade it, edit a test, relax a threshold, or add a file the test runner
loads, and a green result says nothing about which of those happened. Scanning the diff
for the edit is detection, and detection is a list that misses things. The structural
answer is older and cheaper: **the grader brings its own checks. Before any gate runs over a
run's result, the check definitions are put back as they were at the starting revision,
and the run's source is graded against those.** What the run did to its checks becomes a
separate fact, never the thing that grades it.

This is the verifier's half of a rule whose other half is prevention. Freezing the checks
while the run works is better where it can be done, and the software-engineering bundle's
quality-gates subject owns that in-task freeze (`oracle-frozen-during-repair`). A verifier
cannot assume the freeze held. Restoring at grading time makes the verdict independent of
whether it did.

## What gets restored

Everything whose edit can turn a red into a green without changing the behaviour under
test. It is wider than the test files:

- tests, test helpers, fixtures, snapshots and recorded expectations;
- the runner's own configuration, including files it loads implicitly: per-directory test
  configuration, setup files that run before every test;
- lint, type, format and toolchain pins; coverage and ratchet thresholds;
- commit hooks and the scripts a gate calls; allowlists for scanners;
- the declaration of the verify command itself.

**The list is a classifier, and a classifier has blind spots.** Whatever decides "is this a
check" was written by someone who knew some ecosystems. Seed it with one real file per
class from the repositories it actually grades, and keep the seed as a test that goes red
when a rule narrows. A class that has no seed will be missed silently, in a voice that
reads exactly like "the run touched nothing".

## The procedure

1. **Restore, then run.** Check out the starting revision's copy of every path in the
   classes above over the run's result, or copy the grader's own copy in after the run
   ends. The run's edits to those paths are recorded first, as a fact.
2. **Cross-check the log against an independent record.** A restore covers the paths it
   knows about; a file the run *added* can still print a pass. Take the test command's own
   exit status separately from its parsed output, and treat a log that reports no failure
   beside a non-zero exit as a log that is not describing the run that happened.
3. **Grade the run's new checks separately.** A run whose task was to add a test or build a
   gate cannot be graded only by restoring. Run its new tests against the starting code:
   a test that already passes there proves nothing about the change. Plant a violation
   under a new gate and watch it go red. Report both beside the main verdict.
4. **Keep a held-out check for what restoring cannot reach.** Special-casing the inputs a
   test uses, overloading a comparison, or recording state between calls all live in the
   source, where a restored test still passes. A second check the run never saw is the
   only mechanical guard against them; the diff scan is the fallback signal, not the gate.

## Decision rules

- **Restore beats void.** Voiding every run that touched a check is safe and wasteful: it
  discards the runs that did exactly what was asked, and where runs routinely add tests
  that can be most of them. Restore, grade the source against the original checks,
  and grade the new checks on their own.
- **Void when the run's task was not allowed to touch the class.** A repair task that
  edited its tests has changed the question it was asked. Record the edit and say so; the
  restored verdict answers the original question, the void records the conduct.
- **Instruction is not the mechanism.** Telling a run not to edit its tests changes how
  often it tries, not whether a verdict can be trusted.
- **A restored check that fails where the run's own version passed is the finding.** Show
  the reviewer both results and the diff between the two check versions; that pair is the
  clearest evidence of fitting the check to the work.
