---
name: codebase-test-coverage-advance
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/codebase-health
---

# Codebase test coverage advance

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** The parts of a codebase that would hurt most if they broke are usually the
parts nobody got round to testing, and a coverage percentage says nothing about which
parts those are. Worse, once a percentage becomes the target it stops measuring
anything: the cheapest way to move it is to execute code without checking what it did,
and a suite full of tests like that is green, large, and silent when the behaviour
underneath changes.

**Input.** The codebase, its change history, the per module coverage state recorded on
earlier passes, whatever is known about which code actually runs in use, and the test
conventions each module already follows.

**Core action.** Pick the next area worth covering by what runs and what changes rather
than by what would move the percentage, write tests in the conventions already present,
and prove each one detects a failure rather than merely reaching the line.

**Output.** New tests that run green on the project's own runner and that have been
shown to go red when the behaviour they guard is broken, plus a coverage state that lets
the next pass resume rather than re-derive.

## Activities

1. Read the coverage state and the conventions earlier passes recorded *(observe)*
2. Choose the next area by what runs and what changes, not by what moves the number
*(decide)*
3. Write tests in the conventions that module already uses *(act)*
4. Run them, and check each one goes red when the behaviour it guards is broken *(act)*
5. Record what was covered, what was skipped and the reason for each *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The parts of the codebase that would hurt most if they broke are the parts that have
tests.**

- Each area chosen names why it was chosen: how often it runs, how often it changes
  relative to its size, or that its failure would be silent.
- Coverage on the areas that change most often does not fall between passes.
- Reaching lines in configuration, generated or boilerplate code is not reported as an
  advance, even when it moves the percentage furthest.

**A test added here would fail if the behaviour it guards broke, which is a stronger
claim than that it passes today.**

- A test that passes against the current code and also passes against a deliberately
  broken version of it is strengthened or dropped before it is offered.
- Tests are run on the project's own runner before they are offered, and coverage is
  never claimed for a test that was not run.
- A test that deliberately pins current behaviour rather than asserting intended
  behaviour is labelled as such, so a later legitimate change is read as a change and
  not as a regression.

**The state left behind is good enough that the next pass starts where this one
stopped.**

- Every module this work has visited carries a recorded state, so an unvisited area is
  distinguishable from a deliberately skipped one.
- A module that cannot be tested without a design change is recorded as exactly that and
  escalated, rather than left looking merely untested.
- The first pass over a project says it is establishing the state and reports no trend.

## Guidance

Coverage finds gaps and scores nothing. A line executed by a test with a weak assertion
is covered and unprotected, and that is the common defect rather than the missing test.
Prove each test detects a change: if it still passes against deliberately broken code it
has proved nothing. Choose what to cover by what runs often and changes often, not by
what is cheapest to reach, and hold the bar on new code rather than chasing a number
across the whole tree.

## Where this is worth adopting

- A team with a repository wide coverage gate stalled a few points under its target,
  where everything left to cover is the code least worth testing and everyone involved
  knows it.
- A legacy service somebody has to change next month, where the valuable test is the one
  that pins what it currently does so the change becomes visible, and the worthless one
  is whatever raises the number fastest.
- A codebase whose suite is large, green and quietly weak, so a refactor changes
  behaviour and nothing goes red, and the team learns to trust a signal that is not
  there.
- A solo maintainer with a few hours to spend, who needs those hours spent where a break
  would actually be felt rather than spread evenly across the tree.
- A repository that has adopted a per change coverage rule, where the honest question at
  review is whether this diff is tested and the old habit is to argue about the project
  average.

## Connector types

`source_control`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[codebase](examples/codebase.md) for `source_control`.

## Recommended trigger

`self_paced`. Watch what has changed since the last pass and what is still uncovered.
Act when a meaningful amount of untested code has landed, or when a previously covered
area has drifted. A daily clock against a quiet week produces tests nobody needed, which
is not a neutral outcome: every test written is maintained forever and a weak one is
worse than an absent one.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which codebase this work is accountable for, and which parts of it the adopter
  considers load bearing, because that judgment is the selection signal and no metric
  substitutes for it.
- What the adopter treats as an acceptable bar, and whether that bar applies to new code
  rather than to the whole tree, since the two produce completely different work on a
  legacy codebase.
- Whether any signal exists for what actually runs in use, because when it does it
  outranks every static measure for choosing the next area, and when it does not the
  work has to say it is substituting change history for it.
- Whether new tests may land directly or must be offered for review first, which decides
  whether this work needs write access at all.

## Dependencies

- the project's own test runner, installed and runnable in the checkout, because a test
  this work cannot run is a test it must record as unvalidated rather than count as
  coverage
