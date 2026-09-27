---
domain: agent-operations
subject: deterministic-run-verification
last_touched: 2026-09-27
touched_by: deepen
dry_streak: 0
---

# deterministic-run-verification

Subject note. Part of [[index]]; graded against [[standard]].

First touch by `/deepen`. A single-subject run dispatched by the Curator lane on the scan
finding "3 techniques (design floor is 4)". Registry HEAD at dispatch was d93fbd78. The
primary checkout's main was 156 behind origin, so the run worked from origin/main
(2fc868d2) in a detached worktree. Two clean worktrees from earlier dispatches of this
subject (2026-09-26) held no commits; nothing had reached origin.

## 2026-09-27 - the grader brings its own checks, a vanished test is a failure, ask the ignore check the question it answers

**Depth rung:** L2 primary for the corrections: benchmark graders' source read at pinned
commits, version-control and test-runner reference docs, flaky-test studies. L3 empirical
for everything applied: three instruments over fleet trees and this registry's own
ledgers.

**Lanes:** four, plus a fleet seam search.
- A blind training-data lane.
- A web counter-evidence lane.
- A primary-source lane on how coding-agent graders verify a run.
- A landscape lane on self-report reliability and test tampering.

**Convergence:** all four reached the new technique independently. The blind lane ranked
it first before any search. The primary lane found four graders that restore or inject
their tests after the run, and one controlled result: hidden or read-only tests with a
revert at scoring cut cheating to near zero.

**Landed (e3612ff2):**
- **New technique, grade-with-checks-the-run-could-not-touch.** Restore the starting
  revision's check definitions before any gate runs.
  - Cross-check the parsed log against the exit status: a restore misses files the run
    added.
  - Grade the run's own new checks separately. A new test must fail on the starting
    code.
  - Restore beats void.
  - The list of "what is a check" is a classifier, so it needs a seed per class.
  - Placed here, not in quality-gates. That subject's `oracle-frozen-during-repair` owns
    the in-task freeze. This is the verifier's half, which cannot assume the freeze held.
- **Flipped: baseline-relative-gate-evaluation.**
  - The baseline's passing set is the other half of the contract. A test that is absent,
    no longer collected, or newly skipped counts as a failure.
  - The run must show evidence that the suite ran.
  - Grade the committed tree in a clean checkout, with the dependency step run frozen.
  - A retry classifies a failure. A pass on retry is recorded as flaky, never green.
    Order-dependent suites get up to three retries. Capture the baseline more than once.
- **Flipped: declared-rule-verification.**
  - The ignore check reports tracked files as not ignored. Ask it with the index
    disregarded, about paths the run added, against the starting revision's rules.
  - Record the machine-local exclude sources that matched.
  - The diff scan is the second line.
- **Conditioned: recompute-facts-at-report-time.**
  - Derive, do not re-execute.
  - Stamp the grader's code revision, not its configuration name.
  - Keep the verdict a recompute replaced.
- **Golden path.**
  - Checks come from the starting revision.
  - The passing set is part of the comparison.
  - A citation that resolves only on the machine that made it is unverified.
  - A quoted test result counts only against the committed tree.
- **Verified and left untouched.**
  - "The final message is never evidence about the repository" is the best-supported
    claim in the subject. False-success rates are measured in published agent
    trajectories.
  - "Sets, not counts" stands as stated.
  - "Ask the tool, never the pattern" stands, with the machine-local condition added.

**Applied (five rows):**
- **grade-with-checks-the-run-could-not-touch: `better`, code, ascent.**
  - Seam: a loop's integrity guard, which voids a lane that touched its scoring surface.
  - Its classifier caught 3 of the 19 gate-deciding files that exist in the target
    repositories' own trees; now 19 of 19.
  - The eleven new seeds are red under the old classifier.
  - Commits 2da14351 and row 087c4828 are **local, not pushed**. The project's master is
    105 ahead of origin with work that is not this run's.
  - No historic verdict moved across 113 lane commits. But 82 of the 100 voided lanes
    had added a test. Void-on-touch cannot grade that work.
- **Baseline flip: `unapplied`.** Both fleet verifiers compare whole commands by exit
  code, so the set rule has no test identities to act on.
- **Declared-rule flip: `better`, experiment, 13 trees.**
  - The check as written found 0 committed excluded paths in every tree.
  - Disregarding the index found 129. Dated row by row, they split into grandfathered
    paths, force-add decisions, and an interrupted session committing its lane report.
  - That lane report is excluded only by a clone-local file, so the verdict depends on
    the machine.
- **Recompute condition: `better`, simulation, personas.**
  - Seam: the memory benchmark's stored runs. One judge name spans four judge code
    revisions.
  - Five runs were re-judged under code committed minutes later.
  - A fix that moved 16 verdicts cannot be shown as a delta, because re-judge overwrites
    in place.
- **Golden-path citation flip: `better`, experiment, this registry.**
  - Structured run-result claims hold: 103 of 103 cited commits resolve, and 799 of 799
    listed files are covered.
  - Prose does not. 19 of the 241 project commits cited in `applied.md` resolve nowhere,
    after fetching every remote.
  - 10 of those 19 date from 2026-09-25, and both harvest results that cite them list no
    commits.

**Impact:** none. `build-registry-map --dry-run` shows no fleet map pairing any
agent-operations subject, so no verdict went stale. The maps were not regenerated: the
staleness they carry is other landings', and a pass here would commit it into project
trees under this run's name.

**Scan points:** 9 -> 5. What remains: "single stack (process)" and "never swept by the
librarian".

**Banked leads:**
- **Nineteen unresolvable project commits in `applied.md`.**
  - 2026-09-25: ascent 2876343a and e6908657; personas 3684836c, 6220845c, d3f96ea5,
    91cff0d96 and 46ce99b1f; goat e7c0c4b3; pumper 5dec4c9; pof 9ae1e6e9.
  - gravitone: all five of its citations.
  - Earlier: tracklight 4cf35ef, goat 323b1bd, personas-web ffa7d8ff (two rows).
  - The likely causes are a deleted scratch clone or the other machine, never pushed.
    Nothing here can tell the two apart, because a run result records no machine.
  - Return: when the owner can check the second machine, or when the run-result
    validator resolves the commits it is given.
- **The run-result validator checks shape, not existence.**
  - It accepts any 7-40 character hex string.
  - A resolve check (the commit exists and is reachable from the branch) would have
    caught every prose citation above if it had been structured.
  - Return: when this registry's tooling lane is next touched.
- **The loop's guard voids instead of restoring.** Restore-and-grade needs a control-flow
  change in the loop. Return: when its owner next touches the verify path.
- **The desktop app's proposal gates absorb new failures.** A command already red on main
  marks every new failure inside it as inherited. Return: when that gate records
  per-test identities.
- **Its default test command passes with no tests.** It is a UI action, not a gate.
  Return: if it ever gates anything.
- **Cross-subject: engine-behaviour-profiles.** That run's four force-add sessions and
  this run's force-add dating are the same fact seen from two sides.

**Declined:**
- A summarizer's "34 of 35 false claims were stale runs". The page, read verbatim,
  confirmed only the 35 of 101.
- "Ask the base revision's ignore rules" as a separate rule. It is folded into asking
  about added paths against the starting revision.
- Doctest-aware evasion scanning (exclude files by execution role, not by directory).
  Only one lane raised it and no source was read.

Yield: high. dry_streak 0.

Source classes, this run. Kept:
- graders' own source at a pinned commit, over their papers;
- version-control and test-runner reference docs;
- flaky-test studies with rerun statistics;
- the fleet's own trees and this registry's own ledgers, read row by row.

Needs verbatim re-reading before any number lands: practitioner posts read through a
page summarizer.
