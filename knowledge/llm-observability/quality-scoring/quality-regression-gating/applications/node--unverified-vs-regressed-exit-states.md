---
layer: application
type: application
subject: quality-regression-gating
technique: unverified-vs-regressed-exit-states
stack: node
status: forged
verified_on: 2026-08-23
source: promptfoo/promptfoo
---

# Node: promptfoo's two-state exit contract and the unverified signal it never spends

promptfoo 0.122.0 (`promptfoo/promptfoo` @ `679e7ec`, 2026-08-22), a TypeScript
eval runner documented as a CI gate, is a near-complete negative case: two exit
states where three are demanded, and — the sharp part — it *computes the
unverified discriminator* two hundred lines above the exit-code decision, in the
same function, then spends it on the console renderer instead of the exit code.

## The contract as shipped

```ts
// src/node/doEval.ts:1204-1218
const passRateThreshold = getEnvFloat('PROMPTFOO_PASS_RATE_THRESHOLD', 100);
const failedTestExitCode = getEnvInt('PROMPTFOO_FAILED_TEST_EXIT_CODE', 100);
if (isCliInvocation && passRate < (...passRateThreshold...)) { ...
  process.exitCode = Number.isSafeInteger(failedTestExitCode) ? failedTestExitCode : 100;
```

`passRate` is `successes / (successes + failures + errors) * 100`
(`doEval.ts:978-979`), summed over prompt metrics at `doEval.ts:962-972`.
Documented as exit `100` for test failures, `1` for "any other error", `0`
otherwise (`site/docs/usage/command-line.md:169`) — two states, one scalar.

## Rule 1 — every terminal status mapped into three buckets: not done

There is no run status to map; the verdict is a float against a float, so there
is no table to audit and nowhere a fourth cause could be added. Errors are
nonetheless a *tracked category*: `src/evaluator.ts:1947-1956` routes a
non-success row on `ResultFailureReason.ERROR` (`src/types/index.ts:375-382`,
`ERROR: 2`, "Test case failed due to some other error") into `testErrorCount`
rather than `testFailCount`, surviving into the JSON output's `stats.errors`
(`src/models/eval.ts:1416`). The distinction exists in the data model and dies at
the exit code. Two truncation causes land in that bucket too — a per-case timeout
(`src/evaluator.ts:3741`) and the whole-run `maxEvalTimeMs` cut-off, which stamps
every unrun case as a timeout result and increments `testErrorCount`
(`src/evaluator.ts:4546-4558`). A partial promptfoo run is thus not green; it is
**regressed**, the technique's second forced failure mode.

**Executed** (vitest 4.1.10; harness = copy of `test/commands/eval.test.ts` with five
cases added, mocking `evaluate` to return fixed prompt metrics; run via
`npx vitest run test/commands/eval.worker-exitstates.test.ts -t "WORKER exit state"`, 5 passed):

| metrics fed | exit code |
| --- | --- |
| pass 3, fail 0, err 0 | `undefined` (→ 0) |
| pass 2, fail 1, err 0 | 100 |
| pass 2, fail 0, err 1 | **100** |
| pass 0, fail 0, err 4 | **100** |
| no prompts at all | **`undefined` (→ 0)** |

A run where every provider call 500'd is indistinguishable, to the pipeline, from one
where the model got dumber — and the sole pre-existing exit-code test
(`test/commands/eval.test.ts:1649`) fixes `testErrorCount: 0`, so nothing pins it.

**The green hole.** Row five is the technique's *first* forced failure mode, and it
is reachable. With `totalTests === 0`, `passRate` is `NaN`, `NaN < 100` is `false`, the block at
`doEval.ts:1207` is skipped, `process.exitCode` never set. Filters warn-and-proceed
rather than refuse: `--filter-failing` matching nothing logs a warning and
continues (`src/util/eval/filterTests.ts:270-272`; combined-filter case at
`:261-266`). So `promptfoo eval --filter-failing prior.json` as a CI retry step
against a clean prior run verifies nothing and exits green. **A code finding, not
a technique finding** — the technique forbids this already; worth reporting up.

## Rule 3 — one status feeding code, banner and query surface: violated

`src/node/doEval.ts:1021` calls `evalRecord.findTargetErrorStatus()`, returning
the first non-transient HTTP status (401/403/404/500/501) in the results
(`src/models/eval.ts:845`) — a clean "we could not verify anything" signal. It
goes only to `generateEvalSummary`, which prints `Scan stopped: Target is
unavailable and will not recover on retry.` (`src/util/eval/summary.ts:88-96`);
in the red-team path it merely suppresses the success message
(`src/redteam/shared.ts:184-186`). The human is told the run is unverifiable;
the pipeline is told "regressed" — or "passed", if nothing was recorded.

## Rule 2 — codes reserved and frozen as a public contract: inverted

Both the threshold and the failing code are environment variables
(`doEval.ts:1204-1205`), so any caller can remap the gate's vocabulary
per-invocation with no trace in the artifact — the `fixed-alpha-discipline`
failure mode applied to the exit table itself. The tree's own shipped agent skill
takes that hatch: `PROMPTFOO_FAILED_TEST_EXIT_CODE=0 ... eval` then
`node -e "... if (s.errors || s.failures) process.exit(1)"`
(`plugins/promptfoo/skills/promptfoo-evals/references/eval-patterns.md:233-234`)
— more honest, since it reads `s.errors`, but it works by *discarding the tool's
exit code* and rebuilding a two-state gate outside it.

The older CI guide contradicts it and is worse: `site/docs/integrations/ci-cd.md:119`
recommends `jq '.results.stats.successes / (.results.stats.successes + .results.stats.failures) * 100'`,
omitting `errors` from the denominator entirely — 10 passes and 90 provider
errors read as a 100% pass rate, green. The same file at `:115` advertises the
nonexistent `--fail-on-error` (`grep -rniF "fail-on-error" src/` → 0 lines).

## "Gating is opt-in per invocation": half-held, and the technique bends

promptfoo gates on `isCliInvocation`, i.e. `eventSource === 'cli'`
(`doEval.ts:243`, `src/types/eventSource.ts:20-22`). The boundary is caller
*kind*, not a `--gate` declaration — no such flag exists
(`grep -n "gate" src/commands/eval.ts` → 0 lines) — so every CLI run is a gate,
developer loop included. The SDK/MCP entry point is ungated by construction: a
second workable split the technique does not admit. **The declaration may be a
flag or an entry point, so long as it is visible in the invocation.**

**Rule 4 (a reason on the error stream) fares no better:** "Pass rate X% is below
the threshold of Y%" is emitted only when `PROMPTFOO_PASS_RATE_THRESHOLD` was
explicitly set (`doEval.ts:1211-1217`), so on the default path — the common CI
case — exit 100 ships with no reason line at all; when present it goes to
`logger.info`, not stderr.

## Grep-scoped negatives

The tree makes no statistical claim, so the sibling techniques have no ground.
Literal case-insensitive grep over `src/` (`--include=*.ts --include=*.tsx`)
returns **0 lines each** for `bonferroni`, `family-wise`, `familywise`,
`mcnemar`, `wilcoxon`, `signed-rank`, `p-value`, `confidence interval`,
`statistically significant`; the same terms give **no matches** across
`site/docs/`. `Best:`, `winner`, `best performing`, `outperform` are absent from
`src/` — only raw per-provider pass rates, never a superiority sentence, so
`tested-superiority-claims` holds vacuously and `family-wise-correction` has
nothing to correct.
