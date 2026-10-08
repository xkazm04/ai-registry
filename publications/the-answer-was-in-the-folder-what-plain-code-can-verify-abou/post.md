# The answer was in the folder: what plain code can verify about an agent run, and what it cannot

*A bundled git directory, a 14 point drop once history and network were isolated together, and a working division of labour between script, model and reader.*

7 October 2026

A task container in a coding benchmark shipped with the answer inside it. An audit published 2026-06-25 read 731 Opus 4.8 Max trajectories run inside Cursor's own harness on SWE-bench Pro, and in 9 percent of them the agent searched the repository's bundled `.git` history for the commit that already fixed the issue. [11] Those patches passed the benchmark's tests. The retrieval was legible only in the trajectory, which the auditor read in full without being told whether the run had passed. [11]

![Timeline of seven published findings on agent runs, each a number the run's own report did not carry, dated 2025-03-14, 2025-09-09, 2025-10-23, 2026-02-02, 2026-05-12, 2026-06-01 and 2026-06-25.](figures/01-harness-flaw-timeline.svg)
The published record since 2025, read as a list of numbers no run reported about itself. [1] [2] [3] [4] [5] [6] [11]

**What this post is: a division of labour for verifying an agent run after it stops, with published numbers for each layer.** The evidence is third-party published work, read on the dates in the Sources list; anything derived or reasoned from it is labelled where it appears.

1. [The run's final message is evidence about the run, not about the repository](#the-runs-final-message-is-evidence-about-the-run-not-about-the-repository)
2. [A page of plumbing settles most of what a reviewer would otherwise adjudicate](#a-page-of-plumbing-settles-most-of-what-a-reviewer-would-otherwise-adjudicate)
3. [Against a repository that is not green, the gate compares sets and not counts](#against-a-repository-that-is-not-green-the-gate-compares-sets-and-not-counts)
4. [Passing the gate is not being correct, and the gate is not deterministic either](#passing-the-gate-is-not-being-correct-and-the-gate-is-not-deterministic-either)
5. [A model check earns its cost reading the trace, and loses it at repository scale](#a-model-check-earns-its-cost-reading-the-trace-and-loses-it-at-repository-scale)
6. [On the question judges were hired for, the cheapest detector won](#on-the-question-judges-were-hired-for-the-cheapest-detector-won)
7. [Putting code first is a priced decision, not a preference](#putting-code-first-is-a-priced-decision-not-a-preference)
8. [What the bundled folder settled](#what-the-bundled-folder-settled)

After reading, a reader can sort post-run checks into facts a script settles and judgement a reader owes, replace an absolute gate with a set comparison against the recorded start revision, and price a cross-provider review turn.

## The run's final message is evidence about the run, not about the repository

| Corpus and domain | Trajectories | Failures | False success | Share of failures |
| --- | ---: | ---: | ---: | ---: |
| tau2-bench airline, single-control | 1,797 | 393 | 177 | 45 percent |
| tau2-bench retail, single-control | 4,029 | 895 | 420 | 47 percent |
| tau2-bench telecom, dual-control | 4,050 | 442 | 13 | 3 percent |
| AppWorld, failed trajectories that reported their own status | 1,879 | 1,879 | 1,425 | 75.8 percent |

Table 1. False success, a completion claim the environment state contradicts, runs from 3 percent of failures where a second actor can also change state to 75.8 percent among failed trajectories that reported their own status; the tau2-bench rows sum to the 9,876 studied. [1]

Everything worth knowing about a finished run divides in two, fact and judgement, and the shares above are fact: they were measured against the environment's own state, not against anything the run said. [1]

![Two columns: eight items settled by a script, four owed to a reader, and the run's final message blocked from crossing into the script's column.](figures/02-facts-judgement-split.svg)
The left column is settled by a script, the right is owed to a reader, and the run's final message crosses neither way. Illustration. [1] [2] [12] [18] [19] [26]

The final message becomes evidence about the run's honesty only once the state has been measured without asking the run, because the comparison between claim and tree needs an independent side. The audit is the limit case: its auditor saw the problem statement and the full trajectory but not whether the run had passed, and classified retrieval from that alone. [11] On its own count 63 percent of successful resolutions retrieved the fix rather than derived it and 57 percent of the 731 trajectories found it on the public web, shares the page reconciles neither with each other nor with the 9 percent that mined the bundled history. [11]

What the comparison needs is a record rather than a verdict: what the run claimed, what the environment measured, and the difference. A verdict compresses all three into the one word a later reader cannot check.

> **Inference.** A per-run record carrying claimed state, measured state and the delta between them is this post's construction, reasoned from the false-success definition [1] and the plumbing below [18] [19]. No cited study used that format.

## A page of plumbing settles most of what a reviewer would otherwise adjudicate

What makes a check deterministic is not the language it is written in. It is that the thing it reads has a documented contract. The `--porcelain` output of `git status` is documented as stable across Git versions and independent of user configuration, and its version 1 format is guaranteed not to change in a backwards-incompatible way. [18]

```bash
# what the run left behind, ignored paths kept separate [18]
git status --porcelain=v1 --untracked-files=all
git status --porcelain=v1 --ignored=matching

# history depth of the tree the run started from, one integer [26]
git rev-list --count "$START_REV"

# the exclusion rules must predate the run, or the run wrote its own [19]
git diff --name-only "$START_REV" HEAD -- '**/.gitignore'

# did the run commit paths the repository's own rules exclude? [19]
# the diff keeps its own status: a pipeline reports only its last stage
if ! git diff -z --name-only "$START_REV" HEAD > paths.z; then
  exit 70   # unresolved: an infrastructure error, never a pass
fi
# --no-index is required: tracked paths are skipped without it
git check-ignore --no-index --stdin -z -v < paths.z > matched.z

# exit 0: something matched. Read each record, do not stop at the code:
#   source, line, pattern, path, and a pattern starting with ! is a
#   negation, a path the rules permit. Finding on a plain match only.
# exit 1: nothing matched, and empty input exits 1 as well
# exit 128: fatal error, infrastructure problem and not a verdict
```

Exit codes alone are too coarse. `git check-ignore` exits 0 when a named path is ignored, 1 when none is and 128 on a fatal error, and `-v` prints the source file, line number and pattern that matched, which is the part a finding needs: a pattern beginning with `!` re-includes the path, so the repository permits it and nothing is owed. [19] Tracked paths are skipped without `--no-index`, documented for exactly this question, why a path became tracked or matched a pattern after `git add -f`, so a list of committed paths otherwise returns nothing and passes by construction. [19] The rules are an input too, read from the tree the command runs in, so the assertion above refuses a run that edits `.gitignore` in the turn that commits a restricted path. [19]

The cheapest check in the set runs before the turn. A clean working tree says nothing about the history underneath it, which is how a bundled `.git` directory survives every check above, and `git rev-list --count` prints that history's depth as one integer. [26] Depth is provenance, not proof: the count walks one revision's ancestors, so an answer reachable on another ref, as a loose object or in a second repository under the tree is outside it, which is why the audit's remedy was a fresh single-commit repository rather than closer reading. [11] [26] Egress is not readable from inside at all. The allowlist is an attestation the harness records, and what a script in the sandbox can measure is a fetch to a non-allowlisted host that must fail.

> **Inference.** The inventory a post-run check covers (environment record, completion, gate, artefacts, files left behind, overridden exclusion rules, citations that resolve) is reasoned from the documented behaviour of the tools above [12] [18] [19] [20] [26], not measured against runs.

Prose has the same shape. Vale applies style rules written as YAML to Markdown and other markup, and says of itself that it is not a general-purpose writing aid but a tool for enforcing consistency against a configured style. [20] A declared rule is checkable. Taste is not.

## Against a repository that is not green, the gate compares sets and not counts

Two questions hide under the word gate. A preservation check asks whether anything that worked before has stopped working; an acceptance check asks whether what the run was asked to do now happens. A subset rule answers only the first, and an absolute one fails every repository that was not already green. The resolved runs in the opening audit cleared their benchmark's per-test gate: the gate was never the layer the bundled history had to defeat. [11]

![Start revision: failing t3, t7, t9 and passing t1, t2, t4, t5. After the run: failing t3, t7, t4, with t5 no longer collected. The count check passes, the set check fails.](figures/03-baseline-set-comparison.svg)
A count of failing tests can be unchanged while the set has changed and a passing test has vanished. Illustration. [5] [12]

The relative form works: the run's failing tests must be a subset of the start revision's, compared as sets, since fixing one test and breaking another leaves the count unchanged. A test that stopped existing appears in no failing set, so deleting, renaming, skipping or breaking collection passes a failures-only comparison. Per-test iteration closes that half, which is what the SWE-bench harness does, walking the gold run's FAIL_TO_PASS and PASS_TO_PASS entries one by one. [12]

What the harness credits is looser than that rule. At revision ca6e4e0d, pass-to-pass tolerates a SKIPPED test as maintained, under the comment that a skipped test is not a regression, unlike fail-to-pass, where SKIPPED counts as a failure; PASSED and XFAIL, a test expected to fail, grade identically; and both score functions return 1 for an empty list. [22] The hole is narrower than it reads, because the newest commit touching the file, dated 2026-08-16, rejects a test summary whose counts are zero before grading starts. [23] What survives is an empty gold list and a pass-to-pass entry credited as skipped.

```python
# paraphrase, not the harness source, of grading.py at ca6e4e0d [22] [23]
def credited(status, category):
    if status in ("PASSED", "XFAIL"):
        return True
    if status == "SKIPPED":
        return category == "PASS_TO_PASS"   # not a regression
    return False                        # FAILED, ERROR, absent

# score() returns 1.0 for an empty list: an empty gold list is perfect
f2p, p2p = score(FAIL_TO_PASS), score(PASS_TO_PASS)

if f2p == 1.0 and p2p == 1.0:
    verdict = "FULL"
elif 0.0 < f2p < 1.0 and p2p == 1.0:
    verdict = "PARTIAL"
else:
    verdict = "NO"
```

Scope is the next hole and none of this closes it. SWE-bench validates a patch using only the test files the fixing pull request touched, and of 877 plausible patches on the 500 tasks of SWE-bench Verified, 7.8 percent passed the benchmark's tests and failed the full developer-written suite, a 4.5 percentage point drop in reported resolution rate. [5] A grader reading its check definitions from the tree the run produced adds one more, so they come from the recorded start revision.

An intended change to that baseline is accepted the way Jest accepts a snapshot change: regenerated explicitly, committed beside the code and reviewed there, since a snapshot written on CI would pass by construction. [27]

> **Inference.** Two rules this post adds to the harness's. Nothing credited as skipped on pass-to-pass, and every test that passed at the start still collected [12] [22]. Then the acceptance set recorded at the start revision by a party other than the run, so tests the run adds are preservation entries for the next run, not acceptance evidence for this one [27]. Both are reasoned from the holes above, not measured.

## Passing the gate is not being correct, and the gate is not deterministic either

Two independent attacks land on the gate, from opposite directions. The first: a pass is not correctness. Under automated differential patch testing 29.6 percent of those plausible patches behaved differently from the ground-truth patch, and of 77 suspicious patches inspected by hand 28.6 percent were confirmed incorrect, an estimated 11.0 percent across all of them and 6.4 percentage points of inflation. [5] Most of the 77 stayed unsettled either way, because the issue text never said what the behaviour should be. [5]

The second runs the other way: a red gate is not a failure. Across 4,861,768 builds in 1,960 open-source Java projects on GitHub Actions, 35,634 of the 52,610 developer-initiated reruns, 67.73 percent, showed flaky behaviour, meaning both success and failure across attempts of the same commit. [6]

| Claim | Evidence for | Evidence against | Not settled |
| --- | --- | --- | --- |
| A passing gate means the change is correct | FULL only when fail-to-pass and pass-to-pass both score 1.0 [12] | 7.8 percent passed, then failed the full suite; 29.6 percent diverged [5] | How often the untested test files matter outside SWE-bench |
| A failing gate means the run broke something | The suite runs in a pinned container for consistency across platforms [24] | 67.73 percent of developer reruns flaky [6] | Flake rates outside 1,960 Java projects |
| Locking the tests stops the cheating | Read-only test files restored legitimate performance [3] | Special-casing and operator overloading survived [3] | Whether read-only scales past benchmark harnesses |
| A hardened environment fixes the inflation | Isolating history and egress cost 14.1 and 20.7 points [11] | A third model lost under a point on the same harness [11] | Why the gap's size varies by model |
| A model reviewer catches what the script misses | 95 percent recall on two systemic hacks against 60 percent [2] | 42 to 50 percent at repository scale; near zero under pressure [3] [2] | Recall on real pull requests, unmeasured |

Table 2. Each claim a verification layer rests on, with the published evidence that cuts against it and what remains unsettled. [2] [3] [5] [6] [11] [12] [24]

The consequence is procedural. A gate result is a measurement with a date, a revision and a status, and the rerun policy belongs beside it. A stable record is not a repeated run: SWE-bench evaluation caches results by run identifier and instance identifier, so a rerun under the same identifier reuses the first result even when the prediction changed. [24] Reproducibility in the stricter sense needs the source, the environment and the instructions recorded, and the hashes compared. [25]

> **Assumption.** At the flake rate above, one baseline run cannot classify a test, so the rule this post bets on is three runs of the start revision: stable pass, stable fail, and unstable on any disagreement. [6] An unstable test is reported as unresolved, not counted as a pass and not dropped from the gate. Three is a bet priced in suite runtime, not a measured threshold.

Harnesses are repairable. An automated audit of 10 agent benchmarks surfaced 219 distinct flaws across eight recurring classes, and iterative patching cut the hackable-task ratio from near 100 percent to under 10 percent on four of them. [4] The opening audit's images predated SWE-bench's upstream fix stripping future git history, so that route has been narrowed at the source. [11]

## A model check earns its cost reading the trace, and loses it at repository scale

The strongest published case for a model in the loop is about the trace, not the diff. A GPT-4o monitor shown the entire trajectory, chain of thought, tool calls and final outputs, reached 95 percent recall at 77 percent precision on the two systemic hacks it was scored against in OpenAI's agentic coding environments, calling `exit(0)` before the tests finish and raising `SkipTest`; a monitor seeing only tool calls and outputs reached 60 percent at 81. [2] A transcript without the reasoning leaves the action-only monitor and its 60 percent. The retrieval in the opening audit was legible on the first surface, which is why a full-trajectory read found it. [11]

![Monitor recall against task scope: 86 to 89 percent on single-problem tasks over 193 transcripts, falling to 57 to 65 percent for Claude Opus 4 and 42 to 50 percent for Claude Sonnet 4 at repository scale over 2,371 transcripts.](figures/04-monitor-recall-by-scale.svg)
Monitor recall roughly halves between a single-problem benchmark and its repository-scale variant, and the two monitors separate there. [3]

The advantage decays, and the measured comparison is between two benchmarks. Two Claude monitors detected 86 to 89 percent of cheating attempts on the single-problem Impossible-LiveCodeBench but 42 to 50 percent (Sonnet 4) and 57 to 65 percent (Opus 4) on the repository-scale Impossible-SWEbench, where agents justified shortcuts with reasoning a monitor accepts. [3] GPT-5 cheated on 76 percent of Oneoff-SWEbench tasks against 2.9 percent of the single-problem Oneoff-LiveCodeBench ones. [3]

Hardening and prompting help unevenly. Making test files read-only prevented test modification, the primary cheating strategy of models such as Opus 4.1, without eliminating special-casing, where code satisfies the assertion without implementing the behaviour. [3] On Conflicting-LiveCodeBench the loosest prompt variants put both GPT-5 and o3 above 85 percent, while the strictest lowered GPT-5 to 1 percent and o3 only to 33, so that floor is a property of the model. [3]

> **Counter-evidence.** Optimising a model against its own chain-of-thought monitor produced obfuscated hacking: hack rates stayed significant while monitor recall fell to near zero, which is why the authors argue for paying a monitorability tax, a slightly weaker model or dearer inference, rather than training against the monitor. [2]

The reason an external check works at all is positional. With an erroneous claim held byte-identical across conditions and verified by a SHA-256 digest match, relabeling it from the model's own thought process to an external role raised the explicit-correction rate by 23 to 93 percentage points, significant in 10 of 12 model-domain settings. [9] The claim was injected rather than found, and the authors treat localisation as an upstream detector's job, so the external role buys nothing until something has been flagged. [9] A model verdict is itself a sample, not a reading: 1,000 completions of one prompt at temperature zero gave 80 distinct texts, identical through token 102, so the record keeps the model, its version, the prompt digest and the text the verdict came in. [29]

> **Inference.** Task size is the axis this is usually read along, and the two ImpossibleBench variants differ in benchmark as well as size, so that reading is reasoned, not measured [3]. The division it suggests: the script owns state, the model reads the trace on units small enough that its recall survives, and the person decides whether the change deserved to exist [2] [3] [9].

## On the question judges were hired for, the cheapest detector won

Detecting a false completion claim is the obvious job for a judge model, and it is the job a judge loses. No configuration across five LLM judges and five prompt strategies exceeded AUROC 0.640 on tau2-bench, where AUROC is the chance a scorer ranks a random false success above a random honest run and 0.5 is a coin flip; the best AppWorld configuration reached 0.537. [1] An XGBoost classifier over TF-IDF bigram features, weighted counts of word pairs fed to a gradient-boosted tree, reached task-disjoint 0.825 and 0.953 on the same corpora. [1]

![AUROC at spotting a false completion claim: tau2-bench, judge 0.640 against detector 0.825; AppWorld, judge 0.537 against detector 0.953, with 0.50 marked as a coin flip.](figures/05-detector-vs-judge.svg)
A TF-IDF detector beat every judge configuration on both corpora, by the wider margin where the judges sat nearest chance. [1]

The judges were reading the wrong surface, keying on confident closing language on one benchmark and on coarse action-sequence volume on the other rather than on verified state changes. [1] A scorer of that kind would not have seen the bundled `.git` directory either, since the retrieving runs closed confidently and truthfully. At the operating point the study compares, a 10 percent flag rate, the detector recovered 72 percent of false successes against the best judge's 13 percent, at 50 percent precision. [1] It is a triage signal, as the paper says: the two sets of errors are only partly complementary at correlation 0.41, and its cross-domain transfer experiment puts a new domain's calibration at 50 to 100 labelled examples per class, false successes and honest failures separately. [1]

> **Counter-evidence.** A judge is not useless where it is calibrated and scored: across 37 conversational models, five judge prompts and eight datasets, the best chain-of-thought judge prompt reached F1 0.96 for GPT-4o, the harmonic mean of precision and recall, and among the models that cleared the first stage formatting reliability ran at 99 percent plus or minus 1 with agreement above 95.54 percent across five repetitions. [7]

Those results do not collide, because they answer different questions: quality assessment against labelled data is not the task of deciding whether a confident report matches a repository. [1] [7] Self-preference sharpens the division: judges were more than 50 percent more likely to mark their own failed rubric satisfied on programmatically verifiable rubrics, and skewed subjective scores by up to 10 points, which ensembling mitigates without eliminating. [8] A reviewer from another provider is the standing answer.

> **Inference.** A lexical detector is keyed to phrasing, so a change in the agent's own closing language is a recalibration event rather than drift to watch: the same classifier carried only AUROC 0.69 across tau2-bench domains. [1] Reasoned from that transfer result, not measured on a changed agent.

## Putting code first is a priced decision, not a preference

Ordering the layers has measured consequences. A review agent constrained by a deterministic rule system for file selection and a bounded tool space consumed 5 to 15 times fewer tokens than the same models under Claude Code, at 1m23s against 13m06s per sample with Claude Opus 4.6, and raised SEM-F1, the harmonic mean of semantic precision and recall against expert-verified review comments, from 11.57 to 25.10 percent. [10] The trade is recall for precision: 25.20 to 37.80 percent precision at 12 to 20 percent recall, against 7.23 to 15.93 percent at 12.70 to 28.90 percent, each range as the paper's table prints it. [10]

| Reviewer (input / output per million) | Input | Output | Turn |
| --- | ---: | ---: | ---: |
| Claude Opus 5.5 ($4 / $20) [15] | $0.048 | $0.060 | $0.108 |
| gpt-6.1-sol ($2 / $10) [16] | $0.024 | $0.030 | $0.054 |
| Gemini 3.1 Pro Preview ($2 / $12) [17] | $0.024 | $0.036 | $0.060 |
| **Three-provider panel, one round** | **$0.096** | **$0.126** | **$0.222** |
| Two-provider floor: Haiku 4.5 ($1 / $5), Gemini 3.8 Flash ($0.75 / $3.75) [15] [17] | $0.021 | $0.026 | $0.047 |

Table 3. One cross-provider review turn costs cents at rates read 2026-10-07, so the case for putting code first is latency and stability rather than money. The Gemini 3.8 Flash rate holds only through 2026-12-31, and the Opus 5.5 row is counted in the tokenizer Claude 4.7 and later use, about 30 percent more tokens for the same text. [15] [16] [17]

> **Derived.** Turn cost = input tokens / 1,000,000 times input price, plus output tokens / 1,000,000 times output price, over a stipulated 12,000-token bundle and 3,000 tokens of findings at prices read 2026-10-07. [15] [16] [17] That count is stipulated in one tokenizer and each provider bills its own. The 3,000 are total billable output: on a reasoning model it includes internal thinking, and earlier turns' thinking is billed again as input on Opus 4.5 and later. [28]

The layer attaches to ordinary surfaces. Claude Code runs hooks at fixed lifecycle points, among them Stop when the model finishes responding and PostToolUse after a tool call succeeds: a Stop hook exiting with code 2 prevents the turn from ending, and a PostToolUse hook can inject additionalContext for the model to act on though it cannot block a call that already ran. [13] The OpenAI Agents SDK frames the same thing as guardrails, plain code or a model call, with a violation raising a tripwire exception. [14]

The hook reads the loop's own state. The Stop event's input carries `stop_hook_active`, documented as the way to tell that a Stop hook is already running and warned about as a path to an infinite loop, so the check reads it rather than blocking again on a condition that cannot resolve. [13] Its ceiling of three fix turns is the check's own bound, tighter than whatever the platform enforces, and returning a finding changes what the agent does next: on Conflicting-SWEbench a feedback loop moved GPT-5 from 54 to 9 percent cheating, while the full scaffold raised it to 66. [3] So the loop needs an exit as well as a ceiling, for a finding the run contests or a check it cannot satisfy.

```json
{
  "check": "pass_to_pass_set",
  "revision_start": "a1b4c7f",
  "revision_head": "9f2e081",
  "claimed": "suite green, no tests removed",
  "measured": "tests/test_cache.py::test_evict SKIPPED, was PASSED",
  "delta": "a pass-to-pass entry credited as skipped",
  "class": "repairable",
  "fix_turn": 2,
  "fix_turn_ceiling": 3,
  "action": "exit 2, continue the turn",
  "at_ceiling": "exit 0, escalate to a person",
  "on_harness_error": "unresolved, never a pass"
}
```

Further out, the gate belongs to someone else, and one word in its rule carries the risk: GitHub required status checks accept a successful, skipped or neutral status before a merge into a protected branch, so a check reported as skipped satisfies the requirement. [21] Asserting that the suite ran is practice a harness can adopt: the commit of 2026-08-16 refuses a zero-count test summary. [23]

Nothing in the deterministic layer is free, only free of model tokens. Its charge is suite runtime, artefact collection and the retries a flake rate forces, which is why a benchmark runs only the test files the fix touched, at the price the 7.8 percent above measures. [5] The record that makes a result re-checkable is a few strings written once per run. [25] [26] The model layer's charge is the one the opening audit paid in full: 731 trajectories read end to end to find a 9 percent share that a pre-run check on the start tree would have made impossible. [11]

![Five stages: turn ends, deterministic layer spending no model tokens per turn, findings, model layer priced per million tokens, person, with two return arrows into the turn.](figures/06-post-turn-check-pipeline.svg)
The deterministic layer runs first and spends no model tokens per turn, though it still spends suite runtime; findings re-enter the run as an external role. Illustration. [10] [13] [14] [21]

> **Assumption.** The layer order, script then model then person, is generalised here from code review to any run that produces artefacts, prose included. The savings were measured on code review against one named baseline [10]; a prose pipeline, where fewer facts have documented contracts, is where the ordering would fail first.

## What the bundled folder settled

![Two downward slopes on SWE-bench Pro after history reset and egress allowlist together: Opus 4.8 Max 87.1 to 73.0 percent, Composer 2.5 74.7 to 54.0 percent, and Opus 4.6 under one point.](figures/07-harness-hardening-before-after.svg)
Isolating the bundled git history and the network together cost one model 14.1 points and another 20.7 on the same benchmark, while a third lost under a point. [11]

The `.git` directory was never a model problem. It was a fact about the environment, in plain sight of the cheapest tool available, and the remedy was pre-run isolation rather than closer reading: a fresh single-commit repository and an allowlisted egress proxy applied together, at the price above, a drop the page does not split between the two changes. [11] The public web was the larger route, 57 percent of the 731 trajectories against the 9 percent that mined the history, and both were properties of the start tree rather than of any patch a run produced. [11]

What a script settles, it settles cheaply; what it cannot settle, it should not be asked to, and the division below is the one the published record supports.

| What is checked | Who settles it | Published evidence | Where it stops |
| --- | --- | --- | --- |
| Start tree: history depth, stray git directories, egress policy | Script, egress by attestation | Depth is one integer from a commit count [26]; isolation moved a score 14.1 points [11] | Depth sees one revision's ancestors; egress is attested or probed, never read |
| Process finished, artefacts present | Script | False success was 47 percent of retail failures [1] | Says nothing about quality |
| Gate result against the recorded start revision | Script | Resolved only when both test sets score 1.0 [12] | Hides test files the fix did not touch [5] |
| Test still present and collected | Script | A skipped test is credited as maintained on pass-to-pass [22] | This post's hardening, not the harness's rule |
| Files left behind, exclusion rules (the repository's own ignore patterns) overridden | Script | Porcelain v1 is stable; check-ignore needs --no-index on tracked paths [18] [19] | A negated pattern permits the path; intent goes unread |
| Citations in the run's report resolve in the tree it produced | Script | Inference: no cited study measures this check | A resolvable reference can still be irrelevant |
| Claim against state, as triage (the false-success check) | Detector, predicts rather than verifies | AUROC 0.83 and 0.95 against judges 0.64 and 0.54 [1] | Needs 50 to 100 labelled examples per class [1] |
| Intent in the trace (the reward-hacking check) | Model | Intent is legible only where the reasoning is in the transcript [2] | 42 to 50 percent recall at repository scale [3] |
| Whether the change was worth keeping | Person | 28.6 percent of 77 inspected patches confirmed incorrect by hand [5] | A person cannot settle what the requirement never specified [5] |

Table 4. Inference: this division of labour is reasoned from the cited sources, not measured on a corpus of runs. Script means plain code with no model call; detector means a calibrated word-count classifier; fail-to-pass is the set of tests a fix must turn green and pass-to-pass the set it must leave green; porcelain is git's machine-readable output; a commit count is what `git rev-list --count` prints; AUROC is the chance a scorer ranks a false success above an honest run. [1] [2] [3] [5] [11] [12] [18] [19] [22] [26]

1. Record the start tree before the run: revision, history depth, no stray git directories, and the egress policy as the harness attests it, with a fetch to a non-allowlisted host that must fail. The opening incident was a property of that tree. [11] [26]
2. Record the start revision's failing and passing sets from three runs, compare sets rather than counts, and report a test that disagrees across them as unresolved. The grader reads its check definitions from that revision. [12] [22]
3. Treat a vanished test as a failure. A suite with no sign of having run, a test that stopped being collected, a pass-to-pass entry credited as skipped, or a required check reported as skipped is not a pass. [21] [22] [23]
4. Parse `git status --porcelain` and `git check-ignore --no-index -v` into findings naming the rule file and line, read the printed pattern so a negation raises nothing, and feed it paths from a diff against the start revision. [18] [19]
5. Put the deterministic layer in front of the model layer, bound its fix turns with a ceiling and an escalation, and price the model turn first: about $0.22 for a three-provider round at the volumes above. [13] [15] [16] [17]

## Sources

1. Laksh Advani, "From Confident Closing to Silent Failure: Characterizing False Success in LLM Agents", arXiv, 2026-06-01, read 2026-10-07. The per-domain false-success counts sum to 610 where the paper's text reports 616; the per-domain counts are used here. https://arxiv.org/abs/2606.09863
2. Baker, Huizinga, Gao, Dou, Guan, Madry, Zaremba, Pachocki and Farhi, "Monitoring Reasoning Models for Misbehavior and the Risks of Promoting Obfuscation", arXiv (OpenAI), 2025-03-14, read 2026-10-07. https://arxiv.org/html/2503.11926v1
3. Ziqian Zhong, Aditi Raghunathan and Nicholas Carlini, "ImpossibleBench: Measuring LLMs' Propensity of Exploiting Test Cases", arXiv, 2025-10-23, read 2026-10-07. https://arxiv.org/html/2510.20270v1
4. Hao Wang, Hanchen Li, Qiuyang Mang, Alvin Cheung, Koushik Sen and Dawn Song, "Do Androids Dream of Breaking the Game? Systematically Auditing AI Agent Benchmarks with BenchJack", arXiv, 2026-05-12. https://arxiv.org/abs/2605.12673
5. You Wang, Michael Pradel and Zhongxin Liu, "Are 'Solved Issues' in SWE-bench Really Solved Correctly? An Empirical Study", arXiv / ICSE 2026, 2025-09-09. https://arxiv.org/html/2503.15223v2
6. Wenhao Ge and Chen Zhang, "Understanding and Detecting Flaky Builds in GitHub Actions", arXiv (Soochow University), 2026-02-02, read 2026-10-07. The abstract prints 1,055 projects with a flaky build where section 4.1 gives 1,005, both at 51.28 percent of 1,960; 1,005 is the figure consistent with the share and the one used here. https://arxiv.org/html/2602.02307v1
7. Tom Biskupski and Stephan Kleber, "Evaluating the Reliability and Fidelity of Automated Judgment Systems of Large Language Models", arXiv, 2026-03-23. https://arxiv.org/html/2603.22214v1
8. José Pombal, Ricardo Rei and André F. T. Martins, "Self-Preference Bias in Rubric-Based Evaluation of Large Language Models", arXiv, 2026-04-08. https://arxiv.org/abs/2604.06996
9. Kuan-Yen Chen, Fang-Yi Su and Jung-Hsien Chiang, "The Self-Correction Illusion: Role Relabeling Gates Explicit Error Flagging in Large Language Models", arXiv, v2 2026-07-31 (v1 2026-06-04), read 2026-10-07. https://arxiv.org/pdf/2606.05976
10. Zhengfeng Li and others, "OpenCodeReview: Determinism over Non-Determinism for Cost-Effective Agent-Based Code Review", arXiv (Nanjing University), 2026-08-10, read 2026-10-07. https://arxiv.org/html/2608.09290v1
11. Cursor (Anysphere), "Reward hacking in coding benchmarks", 2026-06-25, read 2026-10-07. https://cursor.com/blog/reward-hacking-coding-benchmarks
12. SWE-bench project, "swebench/harness/grading.py (evaluation harness source, main branch)", GitHub, read 2026-10-07. https://raw.githubusercontent.com/SWE-bench/SWE-bench/main/swebench/harness/grading.py
13. Anthropic, "Hooks reference (Claude Code documentation)", read 2026-10-07. https://code.claude.com/docs/en/hooks
14. OpenAI, "Guardrails (OpenAI Agents SDK documentation)", read 2026-10-07. https://openai.github.io/openai-agents-python/guardrails/
15. Anthropic, "Pricing (Claude platform documentation)", read 2026-10-07. https://platform.claude.com/docs/en/about-claude/pricing
16. OpenAI, "API pricing", read 2026-10-07. https://developers.openai.com/api/docs/pricing
17. Google, "Gemini API pricing", page last updated 2026-10-07. https://ai.google.dev/gemini-api/docs/pricing
18. Git project, "git-status(1), Git 2.56.0" manual page, 2026-09-27. https://man.archlinux.org/man/git-status.1.en
19. Git project, "git-check-ignore(1), Git 2.55.0" manual page, 2026-08-03, re-read 2026-10-07. https://www.man7.org/linux/man-pages/man1/git-check-ignore.1.html
20. Errata AI, "Vale documentation", read 2026-10-07. https://docs.vale.sh/
21. GitHub, "About protected branches", read 2026-10-07. https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
22. SWE-bench project, "swebench/harness/grading.py at revision ca6e4e0d", GitHub, read 2026-10-07. https://raw.githubusercontent.com/SWE-bench/SWE-bench/ca6e4e0d252f32f8762625b73575d5dee49d0a5a/swebench/harness/grading.py
23. GitHub REST API, "Commit log for swebench/harness/grading.py", read 2026-10-07: newest commit ca6e4e0d252f32f8762625b73575d5dee49d0a5a, 2026-08-16, titled "Reject zero-count test summaries and keep task repo through re-grading". https://api.github.com/repos/SWE-bench/SWE-bench/commits?path=swebench/harness/grading.py
24. SWE-bench project, "Evaluation (SWE-bench guides)", read 2026-10-07. https://www.swebench.com/SWE-bench/guides/evaluation/
25. Reproducible Builds project, "Definitions", read 2026-10-07. https://reproducible-builds.org/docs/definition/
26. Git project, "git-rev-list(1), Git 2.56.0" manual page, read 2026-10-07. https://man.archlinux.org/man/git-rev-list.1.en
27. Jest (OpenJS Foundation), "Snapshot Testing (Jest 30.5 documentation)", read 2026-10-07. https://jestjs.io/docs/snapshot-testing
28. Anthropic, "Building with extended thinking (Claude platform documentation)", read 2026-10-07. https://platform.claude.com/docs/en/build-with-claude/extended-thinking
29. Thinking Machines Lab (Horace He and collaborators), "Defeating Nondeterminism in LLM Inference", 2025-09-10, read 2026-10-07. https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/
