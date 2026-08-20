---
layer: technique
type: technique
subject: conformance-checking
technique: fixture-repo-testing
status: forged
laws: [failure-not-empty-success, creation-names-reaper]
shared_with: []
use_when: [testing a checker whose subject is a whole repository, proving a checker can actually fail, locking in a regression after a disputed finding]
---

# Fixture-repository testing

## The concern

A checker's unit is not a function, it is a project tree. Unit tests over
its helpers prove the helpers; they say nothing about whether the assembled
checker, pointed at a real directory, emits the right findings at the right
severities and exits with the right code — which is the entire product.
The technique is testing the checker end to end against **fixture
repositories**: small, committed, deliberately-shaped project trees that
exist to be judged. General test design belongs to the test-harness
subject; what is owned here is the fixture-repository shape and its traps.

## The three shapes that carry the value

**Conformant.** A minimal project that satisfies every clause. It must come
back clean: zero failures, and — the assertion people omit — a non-empty
count of checks that actually ran
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)). A
checker that walked nothing also reports zero failures, and a conformant
fixture without an instrument assertion is the test most likely to be green
while the checker is broken.

**Non-conformant.** A project engineered to break specific clauses, one per
clause where affordable. Assert the *exact finding identifier set*, not a
count and not the rendered prose. Counts pass when one check breaks and
another spuriously fires; prose assertions break every time someone improves
a message, which trains the team to delete the assertion.

**Fresh install.** A project that has just adopted the standard and done
none of the work: the contract exists, everything it declares is unproven or
absent. This fixture tests something the other two cannot — whether your
report is *legible to a newcomer*. The expected output is an ordered,
finite, actionable list, not a wall of failures; if the fresh-install
fixture produces something demoralizing, the standard's onboarding path is
broken and the fixture just told you before a real adopter did.

Two further fixtures earn their keep once the checker matures: a **hostile**
fixture whose declared commands try to escape the sandbox (proving the
execution rung's guards), and a fixture reproducing each **disputed
finding**, added at the moment the dispute is settled.

## The self-check

Cheap, and it catches a whole class of embarrassment: assert that every path
the standard's own contract points at is actually shipped, and run the
checker against the standard's own repository. A standard that fails its own
checker — or that references a document it forgot to publish — loses every
argument it will ever have. Two assertions do most of the work: *for every
declared pointer, the scaffolding generates something at it*, and *the
contract copy shipped into adopting projects is byte-identical to the
published one*, because a hand-mirrored contract drifts the first time the
published version is edited and every adopter then ships a stale standard.

## Isolate the fixture run from live side effects

A fixture run executes the real checker, which means it will do the real
things: post reports, write stamps back, execute declared commands. Neuter
those deliberately — clear the reporting configuration in the child
environment, run from the fixture root so every relative resolution lands
inside the fixture rather than in the checker's own tree, and assert that
the run announced the skip rather than silently doing nothing. A suite that
quietly posts test verdicts into a production record is discovered by the
people reading that record.

## Decision rules

- **Prove the checker red before trusting it green.** A check with no
  fixture that makes it fail is unverified machinery; there is no evidence
  it can fail at all.
- **Assert on exit code and structured findings.** The exit code is the
  contract for automated consumers; the finding identifiers are the contract
  for humans. Rendered text is neither.
- **One clause, one fixture defect, where affordable.** Fixtures that break
  five clauses at once make failures ambiguous and tempt count-based
  assertions.
- **Fixtures are committed source, not generated at test time**, except for
  the state that cannot be committed — an empty directory, a history with a
  specific shape, a file with specific permissions. Materialize only those,
  in a temporary tree, and name what removes it
  ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)); a checker
  suite that leaves half-built project trees behind will eventually have one
  of them checked in.
- **Run fixtures through the real entry point.** Invoking internal functions
  skips argument parsing, environment handling and exit-code mapping — three
  of the checker's most breakable parts.
- **A fixture whose history matters needs a history.** Freshness rules read
  version-control history, so a fixture that is a plain directory cannot
  exercise them; either give it a real history or assert the unable-to-check
  path.

## Procedure

1. Build the conformant fixture first; it defines the standard concretely
   and usually exposes clauses that were unimplementable as written.
2. Derive the non-conformant fixture from it by removing or breaking one
   thing per clause.
3. Add the fresh-install fixture from the standard's own scaffolding output,
   so it stays honest as the scaffolding changes.
4. Assert: exit codes, finding identifier sets, the ran-check count, and the
   shipped-path self-check.
5. On every dispute or bug, add the shape to the fixtures before fixing the
   code.

## When not to use it

- **Not a substitute for unit tests of parsers and matchers.** Token
  matching, version comparison and manifest parsing deserve dense unit
  coverage; fixtures are slow and prove integration, not edge cases.
- **Not for combinatorial coverage.** Do not build forty fixtures for forty
  clause permutations; keep the three shapes plus targeted regressions, and
  push the combinations down into unit tests.
- **Not while the standard is still moving weekly.** Early on, fixtures cost
  more churn than they catch; introduce them when the clause set stabilizes,
  and treat that moment as part of publishing the standard.
