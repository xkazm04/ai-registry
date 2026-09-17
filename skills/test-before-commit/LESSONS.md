# Lessons - test-before-commit

Append-only reflection lane. One entry per run that taught something, newest last.
Format: `## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 2.0.0 - 2026-05-04 - checkout-service

- Step 2 ("it must fail for the reason you expect") is the step that carries the value. A run
  that skipped it shipped a test failing on a typo in the fixture rather than on the bug; the
  fix then landed with a permanently green test that asserted nothing.
- Applied to a bug fix with no reproduction steps. Writing the repro as a test first took about
  20 minutes and disproved the reported cause. Keep "write the test from the report, before
  reading the code" as the default order.

## 2.0.0 - 2026-06-19 - internal-tooling-cli

- Mock-only assertions were the most common failure mode in generated tests by a wide margin:
  8 of the 11 generated tests reviewed asserted on a call and never on a result. That is why the
  explicit warning now sits in the "Working with generated code" section.
- "Run the neighbours" (step 4) caught two regressions this run that the new test did not. Cheap
  step, high yield - do not let it be dropped when the suite is slow, run the module.

## 2.1.0 - 2026-07-30 - reporting-api

- The four-question checklist works better as a literal block to fill in than as prose. Made it
  a code block in 2.1.0 so it gets pasted into the PR description verbatim.
- Question 4 ("same commit") is the one people answer "no" to and then argue about. Worth keeping
  first-class: every deferred test observed in this repo's history was never written.

### Redesign proposal

- The skill assumes a test suite already exists. In a repo at zero tests the loop stalls at step
  4 (no neighbours) and the reader gets no guidance on where to start. A future version should
  branch: "no suite yet" -> pick the highest-traffic boundary, write the first three tests there,
  wire one command. Not applied in 2.1.0 - it needs its own shape and would double the length of
  the skill.

## 2.2.1 - 2026-09-09 - ai-registry

- Architecture review: the shared reflection clause assumed a writable registry link in every installation. Replaced that assumption with installation-aware scope and explicit adoption. This records an instruction audit, not a field effectiveness result.

## 2.3.0 - 2026-09-17 - skillbench

- The four-yes checklist asked nothing about the repo's own gates. Measured: a run answered all
  four yeses honestly - probe-confirmed red-then-green, one commit - and still committed a test
  file `ruff format --check .` rejects; it had run the linter on its two files but not the
  formatter. A sibling run on the same task passed. 2.4.0 adds line 5, the repo's format and lint
  gates on the changed files.
- Checklist item 3 ("the module's existing tests pass") is satisfiable by editing the tests. On one
  Rust task, 29 of 38 judge verdicts named a behaviour change outside the reported bug, and 11
  faulted a fixture edit that hid a tolerance regression while 7 blessed the same edit - the
  disagreement is the missing rule. The Rules section said to *decide* whether new output is
  correct, never to *disclose* it. 2.4.0 adds line 6: no existing test edited to stay green unless
  the report and commit body name the behaviour change it accommodates and why it is correct.
- ~14 verdicts faulted an unproven "pre-existing failure" claim ("rerunning alone does not
  establish that failure as pre-existing"); the two runs that stashed and re-ran were praised for a
  method the skill never named. 2.4.0 folds the proof into item 3 and states the method - stash or
  scratch worktree, same command, both results quoted.
