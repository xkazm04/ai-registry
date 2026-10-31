---
domain: agent-operations
subject: deterministic-run-verification
last_touched: 2026-09-28
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

## 2026-09-28 - fourth send, declined (run `dp-drv-0928b`)

Declined, no pass. The same finding came in again, "3 techniques (design floor is 4)",
this time from dispatch HEAD bd295204. That commit is 235 behind origin/main (18cf9154)
and does not contain e3612ff2. At origin the subject has four techniques. `dp-drv-0927b`
and `dp-drv-0928` idled on the same finding and wrote only run results, so this is the
first note entry about the repeats. No commit since 44eb11ef touches the subject folder,
this note, `projects.json` or `scripts/lib/run-result.mjs`, which was the return condition
of the validator lead. `check-currency` reports agent-operations at 0 expired and 0 at-risk
across 26 applications, with no drift on this subject. dry_streak is unchanged, because a
declined dispatch is not a dry pass. The fix belongs in the dispatcher. It should read
origin, and read `librarian/runs/*/result.json` for the subject, before it sends.

## Architecture review - 2026-10-31

First architecture review, against `e3f00b8a4`. Primary sources this run support the
three load-bearing mechanisms. The version-control reference confirms the ignore check
skips tracked files unless the index is disregarded, and a throwaway repository reproduced
it. ImpossibleBench names the exact evasions the grade-with technique says a restore
cannot reach, and reverts modified tests at scoring. The BenchJack audit shows a root
`conftest.py` surviving a grader that resets only the files its test patch names. Two
gaps were found. The golden path's "rule overrides" bullet still says "anything
committed", which the declared-rule technique narrowed to added paths under the starting
revision's rules. The grade-with application credits a "graded agent" with the hook
forgery, but the audit that matches it describes a researcher-built exploit. The retry
counts in baseline-relative-gate-evaluation have no source this run could find. No
verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "agent-operations/deterministic-run-verification",
  "date": "2026-10-31",
  "baseline": "e3f00b8a4",
  "digest": "sha256-b2:ac3b017c4d37ee49",
  "disposition": "clarify",
  "trigger": "pending: no architecture-review record existed.",
  "benefit": "A harness grades the tree with checks the run could not edit, against the baseline's failing and passing sets, and recomputes facts from stored evidence.",
  "failure_if_ignored": "Runs that edit tests, delete tests, or commit excluded files read as green; a definition fix cannot be applied to stored runs.",
  "boundary": "Mechanical facts about a run. Whether a change was worth making, or a test asserts the right thing, stays with a reader. The in-task freeze belongs to quality-gates' oracle-frozen-during-repair.",
  "coverage": "All 9 documents read in full. Three primary sources opened and quoted; the ignore-check behaviour reproduced in a throwaway repository. Not evaluated: every private fleet tree, store and loop the four applications measure; the retry-count claims.",
  "counterexamples": [
    "A root conftest.py added by the run survives a restore that covers only the files the test patch names, and forges passes (BenchJack, SWE-bench Verified).",
    "A path tracked before its exclusion rule was written reads as tracked-and-excluded under the index-disregarding check, yet says nothing about the run that is being graded.",
    "A prompt can cut test modification from 92% to 1% for one model while another model under the same prompt still cheats 33% of the time, so instruction changes frequency, not trust.",
    "An order-dependent test fails deterministically in a given order, so rerunning it alone passes and hides the pollution."
  ],
  "sources": [
    {
      "url": "https://git-scm.com/docs/git-check-ignore",
      "result": "'By default, tracked files are not shown at all since they are not subject to exclude rules; but see --no-index.' --no-index: 'Don't look in the index when undertaking the checks ... to match a path previously added with git add -f.' Reproduced with git 2.43 on a throwaway repository: the default form exits 1 for a force-added a.log, the --no-index form names .gitignore:1:*.log. Supports declared-rule-verification and its application's throwaway-repo claim."
    },
    {
      "url": "https://arxiv.org/html/2510.20270v1",
      "result": "ImpossibleBench. 'Hiding tests from agents reduces cheating success rate to near zero' but 'degrades performance'; 'Read-only access ... preventing test modification attempts' but 'does not eliminate other cheating methods such as special-casing or operator overloading'; 'We revert the modified tests during scoring in the read-only setting.' Categories include 'Overload Comparison Operators', 'Record Extra States', 'Special Casing', and test modification 'despite being explicitly instructed not to'. Prompt D lowers GPT-5 and o3 to '1% and 33%'. Supports grade-with step 4 and 'instruction is not the mechanism'."
    },
    {
      "url": "https://arxiv.org/html/2605.12673",
      "result": "BenchJack (UC Berkeley). 'SWE-bench resets any files enumerated in the upstream test patch to their original state'; 'a conftest.py at the repository root survives the reset'; a PyTest hook 'overwrites each test's reported outcome'. The exploit was 'manually constructed' by the researchers; no passage has a model under evaluation writing it. Supports grade-with step 2; refutes the application's 'graded agent' wording."
    },
    {
      "url": "https://cs.gmu.edu/~winglam/publications/2019/LamETAL19iDFlakies.pdf",
      "result": "Not opened; found by search. iDFlakies treats order-dependent tests as deterministic per order and detects them by varying order. Consistent with 'rerunning a test alone hides the pollution'; gives no basis for 'up to three' same-order retries or 'one retry settles most' non-order flakes."
    }
  ],
  "documents": {
    "deterministic-run-verification.md": {
      "disposition": "clarify",
      "reason": "The 'Rule overrides' bullet says 'anything committed that the repository's own exclusion rules cover', which contradicts declared-rule-verification: grandfathered paths say nothing about the run, and a rule the run edited is not the rule it was bound by. Narrow it to paths the run's commits added, under the starting revision's committed rules. The rest holds."
    },
    "techniques/baseline-relative-gate-evaluation.md": {
      "disposition": "reverify",
      "reason": "Set comparison, the passing-set half, evidence the suite ran, clean-checkout grading and build isolation are sound and match the application. Step 8's numbers ('one retry ... settles most flakes', 'up to three, in the same order') have no source this run reached; it needs the flaky-test study the 2026-09-27 run read, quoted."
    },
    "techniques/declared-rule-verification.md": {
      "disposition": "keep",
      "reason": "The tracked-file behaviour and the fix are confirmed by the reference docs and a reproduction. Added-paths-only, starting-revision rules and recording machine-local exclude sources follow from the application's dating."
    },
    "techniques/grade-with-checks-the-run-could-not-touch.md": {
      "disposition": "keep",
      "reason": "Restore-then-run, the log versus exit-status cross-check (a root conftest.py survives a test-patch-scoped reset), the held-out check for special-casing, operator overloading and recorded state, and 'instruction is not the mechanism' all match ImpossibleBench and BenchJack."
    },
    "techniques/recompute-facts-at-report-time.md": {
      "disposition": "keep",
      "reason": "Derive-versus-re-execute, material-versus-cosmetic, code-revision stamps and keep-the-replaced-verdict are internally consistent and match the application's cases."
    },
    "applications/process--baseline-relative-gate-evaluation.md": {
      "disposition": "reverify",
      "reason": "Internally consistent with the technique (one retry recorded, set gate not retried against a no-retry baseline). The private clones and gate runs were not reopened."
    },
    "applications/process--declared-rule-verification.md": {
      "disposition": "reverify",
      "reason": "The throwaway-repository claim was reproduced this run. The 13-tree counts (0 versus 129, 104 in one tree) rest on private trees not reopened."
    },
    "applications/process--grade-with-checks-the-run-could-not-touch.md": {
      "disposition": "clarify",
      "reason": "'where a published benchmark's graded agent forged pass lines from a hook' is not supported by the audit that matches the mechanism: the root conftest.py hook was a researcher-built exploit against SWE-bench's test-patch-scoped reset. Reword to that. The 3/19 to 19/19 and 113/100/82/95 counts rest on private trees not reopened (reverify after the edit)."
    },
    "applications/process--recompute-facts-at-report-time.md": {
      "disposition": "reverify",
      "reason": "Cases are internally consistent (five runs on 09-04 inside seven re-judged). The title's 'four judge versions' against 'changed on 09-03 (twice), 09-04 and 09-17' counts four changes, which yields up to five versions; the private store was not reopened to settle which, so this is owed, not applied."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the two clarify items named by the record above. Both are wording changes backed by
an internal contradiction (golden path) or a primary source opened this run (the audit).
The remaining open items are evidence, not wording, so the overall disposition is now
`reverify`: the retry counts in baseline-relative-gate-evaluation, the private evidence
behind all four applications, and the judge-version count in the recompute application.

<!-- architecture-review:v1 -->
```json
{
  "subject": "agent-operations/deterministic-run-verification",
  "date": "2026-10-31",
  "baseline": "e3f00b8a4",
  "digest": "sha256-b2:d4c5b547f7f01dbb",
  "disposition": "reverify",
  "trigger": "pending: no architecture-review record existed.",
  "benefit": "A harness grades the tree with checks the run could not edit, against the baseline's failing and passing sets, and recomputes facts from stored evidence.",
  "failure_if_ignored": "Runs that edit tests, delete tests, or commit excluded files read as green; a definition fix cannot be applied to stored runs.",
  "boundary": "Mechanical facts about a run. Whether a change was worth making, or a test asserts the right thing, stays with a reader. The in-task freeze belongs to quality-gates' oracle-frozen-during-repair.",
  "coverage": "All 9 documents decided. The two clarify items from the first 2026-10-31 record were applied and the edited passages re-read; the other seven documents are byte-unchanged and keep their dispositions. Sources as in the first record, opened this run. Not evaluated: private fleet trees, stores and loops; the retry-count claims.",
  "counterexamples": [
    "A root conftest.py added by the run survives a restore that covers only the files the test patch names, and forges passes (BenchJack, SWE-bench Verified).",
    "A path tracked before its exclusion rule was written reads as tracked-and-excluded under the index-disregarding check, yet says nothing about the run that is being graded.",
    "A prompt can cut test modification from 92% to 1% for one model while another model under the same prompt still cheats 33% of the time, so instruction changes frequency, not trust.",
    "An order-dependent test fails deterministically in a given order, so rerunning it alone passes and hides the pollution."
  ],
  "sources": [
    {
      "url": "https://git-scm.com/docs/git-check-ignore",
      "result": "'By default, tracked files are not shown at all since they are not subject to exclude rules; but see --no-index.' --no-index: 'Don't look in the index when undertaking the checks ... to match a path previously added with git add -f.' Reproduced with git 2.43 on a throwaway repository: the default form exits 1 for a force-added a.log, the --no-index form names .gitignore:1:*.log. Supports declared-rule-verification and its application's throwaway-repo claim."
    },
    {
      "url": "https://arxiv.org/html/2510.20270v1",
      "result": "ImpossibleBench. 'Hiding tests from agents reduces cheating success rate to near zero' but 'degrades performance'; 'Read-only access ... preventing test modification attempts' but 'does not eliminate other cheating methods such as special-casing or operator overloading'; 'We revert the modified tests during scoring in the read-only setting.' Categories include 'Overload Comparison Operators', 'Record Extra States', 'Special Casing', and test modification 'despite being explicitly instructed not to'. Prompt D lowers GPT-5 and o3 to '1% and 33%'. Supports grade-with step 4 and 'instruction is not the mechanism'."
    },
    {
      "url": "https://arxiv.org/html/2605.12673",
      "result": "BenchJack (UC Berkeley). 'SWE-bench resets any files enumerated in the upstream test patch to their original state'; 'a conftest.py at the repository root survives the reset'; a PyTest hook 'overwrites each test's reported outcome'. The exploit was 'manually constructed' by the researchers; no passage has a model under evaluation writing it. Supports grade-with step 2; refutes the application's 'graded agent' wording."
    },
    {
      "url": "https://cs.gmu.edu/~winglam/publications/2019/LamETAL19iDFlakies.pdf",
      "result": "Not opened; found by search. iDFlakies treats order-dependent tests as deterministic per order and detects them by varying order. Consistent with 'rerunning a test alone hides the pollution'; gives no basis for 'up to three' same-order retries or 'one retry settles most' non-order flakes."
    }
  ],
  "documents": {
    "deterministic-run-verification.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'Rule overrides' now reads 'any path the run's commits added that the starting revision's committed exclusion rules cover', matching declared-rule-verification."
    },
    "techniques/baseline-relative-gate-evaluation.md": {
      "disposition": "reverify",
      "reason": "Set comparison, the passing-set half, evidence the suite ran, clean-checkout grading and build isolation are sound and match the application. Step 8's numbers ('one retry ... settles most flakes', 'up to three, in the same order') have no source this run reached; it needs the flaky-test study the 2026-09-27 run read, quoted."
    },
    "techniques/declared-rule-verification.md": {
      "disposition": "keep",
      "reason": "The tracked-file behaviour and the fix are confirmed by the reference docs and a reproduction. Added-paths-only, starting-revision rules and recording machine-local exclude sources follow from the application's dating."
    },
    "techniques/grade-with-checks-the-run-could-not-touch.md": {
      "disposition": "keep",
      "reason": "Restore-then-run, the log versus exit-status cross-check (a root conftest.py survives a test-patch-scoped reset), the held-out check for special-casing, operator overloading and recorded state, and 'instruction is not the mechanism' all match ImpossibleBench and BenchJack."
    },
    "techniques/recompute-facts-at-report-time.md": {
      "disposition": "keep",
      "reason": "Derive-versus-re-execute, material-versus-cosmetic, code-revision stamps and keep-the-replaced-verdict are internally consistent and match the application's cases."
    },
    "applications/process--baseline-relative-gate-evaluation.md": {
      "disposition": "reverify",
      "reason": "Internally consistent with the technique (one retry recorded, set gate not retried against a no-retry baseline). The private clones and gate runs were not reopened."
    },
    "applications/process--declared-rule-verification.md": {
      "disposition": "reverify",
      "reason": "The throwaway-repository claim was reproduced this run. The 13-tree counts (0 versus 129, 104 in one tree) rest on private trees not reopened."
    },
    "applications/process--grade-with-checks-the-run-could-not-touch.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: 'a published benchmark's graded agent forged pass lines from a hook' now reads 'an audit of a published benchmark showed a hook in that file forging passes that survive the grader's reset of the test files' (BenchJack). Still reverify: the 3/19 to 19/19 and 113/100/82/95 counts rest on private trees not reopened. verified_on unchanged."
    },
    "applications/process--recompute-facts-at-report-time.md": {
      "disposition": "reverify",
      "reason": "Cases are internally consistent (five runs on 09-04 inside seven re-judged). The title's 'four judge versions' against 'changed on 09-03 (twice), 09-04 and 09-17' counts four changes, which yields up to five versions; the private store was not reopened to settle which, so this is owed, not applied."
    }
  }
}
```
