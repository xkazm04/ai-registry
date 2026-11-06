---
layer: technique
type: technique
subject: test-harness
technique: proved-off-the-path
status: forged
laws: [gate-sees-target, count-carries-predicate]
shared_with: []
applied: experiment
ab_verdict: unmeasurable
use_when: [a program was written beside a model-run procedure so that it could be tested, a test file defines the rule it asserts, an integration test constructs the modules it claims to integrate, a guard has a thorough suite and nobody can name its production caller, deciding what a test count may claim about a skill or a safety promise]
---

# A test proves only the path it composes

A test's evidence attaches to the path it ran. When the suite assembles that path itself, the
evidence attaches to the assembly, and production may not contain it
([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)). Nothing here is broken in the
usual sense. The assertions can be sharp and the suite can pass, and what it reports is a fact about
a program nothing runs.

## The twin of a model-run procedure

A procedure a model executes has no function to call. Wanting a test anyway, an author writes a
program that restates the procedure and tests that. The model goes on reading the prose. Nothing
compares the two, so they drift, and the test count keeps rising beside a procedure no test touched.

Two authors of agent skill kits did this independently. In one, a routing module says in its header
that it mirrors a prose command table for testability. It has 55 test cases, nothing but its tests
and a package re-export imports it, and it lacks 9 of the 18 routes in the table it mirrors. In the
other, the rule is a function inside the test file: it reconciles a required planning table against
its owners and observations, while no shipped script reads that table. Its comment says plainly what
it does not do, and the contributor guide still names those omissions as a boundary tests cover. Both
trees were read and neither suite was run, so these are counts of cases and not pass rates.

## The guard is the same mistake one step over

A kill switch or an approval table lives in a library with its own suite. An integration test
constructs the guard, passes its output to the worker by hand and asserts the worker obeys.
Production builds the worker without the guard, so the forbidden action still works. Finding the
guard is a job [dead-code](../../../codebase-stewardship/dead-code/techniques/instrument-per-orphan-class.md)
already owns: tests are not entries, and a module kept alive by its own test is an orphan with a
test. What this adds is the reason it survives a review. The composition the test wrote reads as
evidence of wiring, and the test's own docstring says end to end. In the observed case the production server
imported the package whose initializer loaded the guard, so an import count called it live. Count
calls from the entry point.

## The test

1. **Name the production entry point** and walk from it to the guarded call. Tests are not callers,
   and neither is a package that only re-exports. Zero calls means the suite is evidence about a
   library, and any coverage claim made from it carries that predicate
   ([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)).
2. **For a twin, change the procedure and leave the program.** Alter one route in the prose and run
   the suite unchanged. A pass is the finding: this is the reach probe of
   [unreached-decisions-pin-nothing](./unreached-decisions-pin-nothing.md), aimed at a decision a
   model makes. That file warns in one line that a parallel test-only path answers a question about
   itself. A twin is what that path looks like when the real site is prose.

## The repair is not more tests

- **Make production take the path.** The entry point constructs the guard, and one test drives that
  entry point in place of the hand-built composition.
- **Make the prose call the program,** and keep in prose only the judgment a program cannot make.
  That is the demotion in
  [enforcement-demotion](../../../../llm-agent/prompt-and-context/agent-instruction-files/techniques/enforcement-demotion.md),
  which assumes the skill keeps the line that calls the script. Without that line nothing was demoted.
- **If the procedure must stay model-run, delete the twin and evaluate the behaviour**
  ([eval-harness](../../../../llm-agent/evaluation-and-cost/eval-harness/eval-harness.md)). That costs
  model calls, which is what the twin was avoiding. Until it runs, say the procedure is untested.

## Not this technique

- **A consumer outside the tree.** A library others import has callers this walk cannot see, so "no
  caller here" is not a finding (the published-names class in dead-code).
- **A tool whose test drives its real command line** while no method file names it. The test is on
  the path that an operator would run. The gap is that nothing tells an agent the tool exists, which
  is a reachability question about the method.
- **A deterministic twin that runs in production** and is compared with the model's output. That is
  a check with a consumer, and the comparison is what stops the drift.
- **Two production implementations of one rule.** Both run, so the question is parity.

## What was measured

A census of one skills lane looking for this shape: 17 skills, 134 shipped instruments, 5 named by no
method file and imported by no sibling. One of the five has tests, and those spawn its real command
line, so it falls under the second exclusion. No twin was found, and the seam could not move a number
either way. The two instances above come from reading other people's trees, so the rate at which
this shape occurs in a maintained corpus is unknown.
