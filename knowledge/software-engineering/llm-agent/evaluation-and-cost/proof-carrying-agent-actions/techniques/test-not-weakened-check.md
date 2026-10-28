---
layer: technique
type: technique
subject: proof-carrying-agent-actions
technique: test-not-weakened-check
status: forged
laws: [deletion-is-not-repair, gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [an agent-authored diff touches a test file, a proof depends on a test passing at head, deciding what counts as weakening a test]
---

# Test-not-weakened check

A passing test is evidence only if it asks the same question it asked before.
When the change being judged can edit the test suite, every proof that rests on
a test passing has a cheap forgery: make the test ask less. This check compares
the suite at base with the suite at head and fails the proof when the head
asserts less than the base did, for any test that existed at base.

It is the detective twin of freezing the oracle during repair. A freeze stops
the edit before it lands; this check finds it after, on the finished diff,
because a merge gate cannot assume the freeze held, and because some changes
come from agents and environments the gate does not control.

## What weakening looks like

The forms worth detecting, roughly in order of how often a shortest-path agent
reaches for them:

- an assertion removed, or a block of assertions commented out;
- a comparison loosened — exact equality to approximate, a specific error type
  to any error, a full-match to a substring, a value check to a truthiness
  check;
- an expected value rewritten to equal what the buggy code produces;
- a skip, pending, expected-failure or focus marker added; a retry count or
  timeout raised;
- a test case or a parameter row deleted, or a whole file removed;
- a test wrapped in a condition that is false in the pipeline, or an early
  return placed before its assertions;
- a fixture or golden file edited so that the assertion still runs and now
  agrees with the bug;
- the test runner's configuration narrowed so the file is no longer collected.

## Two instruments, one ladder

There are two workable ways to compare, and they fail differently.

**A per-identifier profile.** For every test identifier present at base,
compute a small profile at base and at head: present or absent, skip and focus
state, the number of assertion calls, the kinds of assertion, the number of
cases or parameter rows. A removed identifier, a new skip, a lower count or a
looser kind is weakening. This sees everything about the tests it profiles and
needs a parser per language.

**A hunk-level comparison.** Read the diff's test files only, and inside each
hunk pair the assertion lines that were removed with the assertion lines that
were added. Three refinements make it honest. A removed line that reappears
verbatim among the added lines was *moved*, not removed — reordering must not
fire. A removed assertion with no added counterpart is a removal. A removed
assertion whose counterpart ranks lower on a **strength ladder** is a
loosening: exact value or typed failure at the top; partial match, containment
or type check below it; bare truthiness, not-null, "did not throw" or "some
error was thrown" below that; and at the bottom an assertion that cannot fail
at all, which is weakening even when it is the only line added. Count test
declarations removed against declarations added per file, treat a test file
deleted as weakening, and treat a test file *renamed out of the paths the runner
collects* as deleted even at full similarity with no hunk to read. This
instrument is language-agnostic with a lexical vocabulary and sees only what the
diff shows.

Whichever is used, the finding names what was counted and how — "a typed
failure assertion became a truthiness check in this file", "two declarations
removed, none added" — so a reviewer can see what was measured
([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)),
and the check says which instrument produced it.

## The edit it cannot classify

An expected value changed while the actual under test stays the same — the
assertion that wanted four now wants five — is the cheapest red-to-green fake
there is. It is also exactly what an honest fix to a test that encoded the bug
looks like. No lexical rule tells the two apart. When that edit is the *only*
finding, the observation is inconclusive and a person reads it; when it comes
with any other weakening, the other weakening fails the proof. Guessing either
way is wrong: a pass forgives the fake, a fail teaches people that the check
fires on honest fixes.

New tests are not weakening, and adding assertions to existing tests is not
weakening. A new test can still be *fitted* — passing by construction — which is
why the exploit pair asks for red at base, not merely green at head.

## Err toward refusing

The check will have false positives: a refactor that splits one assertion into
a helper, a renamed test, a parameter table restructured. Each one costs a
person a look. Its false negatives ship a forged proof that is indistinguishable
from a real one in every downstream record. The asymmetry decides the threshold:
any reduction fails the proof, and the release valve is a separate change —
labelled as a test change, owned by a person — not a softer rule. Deleting the
check because it fires on refactors trades a visible cost for an invisible one
([_laws: deletion-is-not-repair_](../../../../_laws.md#deletion-is-not-repair)).

## The oracle beyond the test files

The suite's meaning lives in more than test sources: fixtures and snapshots,
the runner's collection and timeout configuration, the coverage threshold, the
pipeline step that runs the tests and the list of tests marked flaky. A change
that edits any of these has edited the oracle even if no test file moved. The
check reads them at base, compares at head, and treats a change to them like a
change to the assertions. A hunk-level instrument that reads only test-path
files is blind here by construction; either widen the set of paths it reads or
make the action class's envelope deny those paths outright, so an edit to them
fails the proof on the envelope instead of passing unread. And the check reads the files at the commits it is
judging, not a list of changed paths the agent supplied
([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)).

## Decision rules

- Compare what the suite asserts at head with what it asserted at base, by
  identifier profile or by hunk pairing on a strength ladder; any reduction
  fails the proof, and a moved line is not a removed one.
- When the only finding is an expected value edited against an unchanged
  actual, the observation is inconclusive and a person decides.
- When a test identifier disappears, treat it as weakening unless a person has
  approved the removal in a separate change.
- When the change edits fixtures, snapshots, runner configuration or the flaky
  list, include those in the comparison.
- When the comparison could not parse a file, the proof is inconclusive, not
  passed.

## When not to use this

Where the action class is itself a test change — a person adding coverage, a
deliberate behaviour change with its tests updated — the check's premise does
not hold, and the class's proof is a review. Running the check there and
overriding it every time teaches people to override it.
