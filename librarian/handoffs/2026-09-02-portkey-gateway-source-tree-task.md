---
project: source tree (not a fleet project) - github:Portkey-AI/gateway
run: intake-portkey-0902
subject: software-engineering/retry-backoff (backoff-design amendment: when the stated schedule does not fit the budget) - backlog spans multi-provider-gateway-plane and browser-credential-boundary
technique: backoff-design
mode: task
branch: intake/over-budget-wait-is-not-exhausted - exported as `2026-09-02-portkey-gateway-source-tree-task.patch` beside this file (commit cc20ac2 over base 669825cbe89ee51569918b8f78a9db486fd69dd4); the clone was deleted at Phase 9. Re-apply with `git clone <url> && git am <patch>`.
size: 2 files / ~25 lines / S
status: first step landed on the branch; not pushed; no PR opened
---

# Task: an over-budget wait is not exhaustion

**Why a task against the source tree.** The subject forged this run has no seam in a
connected project that fronts providers; the standing focus says a handoff with no fleet
seam owes one `task` row against the source, from the workers' deviations.

**The deviation chosen (retry worker's #1).** When a provider's stated retry-after exceeds
the remaining retry budget, the handler set `lastAttempt = -1` - the same sentinel as
genuine exhaustion, comment and all - and the stated delay was never recorded. The
amendment landed this run says these are two terminal states and the operator needs the
number that did not fit.

**The measurable.** Before: 0 of 1 over-budget stops distinguishable from exhaustion in
the record, stated delay recorded 0 times. After: the retry handler returns
`skippedRetryAfterMs`, the caller logs it and names the state; the sentinel is unchanged
so no consumer breaks.

**What the first step found.** `tsc --noEmit` reports no new errors (the pinned base
already carries type errors at the retry callback signature; the count did not rise). The
integration suite needs a booted gateway (24 suites fail to start, 200 tests skipped) and
was not run. Next step on the branch: a unit test around `retryRequest` with a mocked
response carrying `retry-after: 120` against the 60 s budget, asserting the returned
field and that the ladder did not sleep.

**Remaining backlog from the workers' lists, in order.**
1. The admin token's "throws at startup" is a per-request 500 in all three callers
   (`src/middlewares/adminAuth/index.ts:82-90, :110-118, :125-133`) - the technique's
   boot rule, unmet.
2. The debug-stream allowlist covers three sub-objects, not the record
   (`src/middlewares/log/index.ts:40-77` vs `logsService.ts:9-34`).
3. Two carriers for one attribution: the in-band router header vs a router error escaping
   as a 400 with the router's raw text and internal target names
   (`handlerUtils.ts:825, :750`; `chatCompletionsHandler.ts:39-42`; `conditionalRouter.ts:141`).
4. An unevaluable routing predicate routes to `default` instead of failing
   (`conditionalRouter.ts:150-154`); `getContextValue` reads exactly two path segments.
5. The stream framer has no size bound and re-splits the whole buffer
   (`streamHandler.ts:151-205`).
6. `randomize: false` in the one process that correlates every caller
   (`retryHandler.ts:179`); a date-form `retry-after` parses to `NaN` and is discarded
   (`:122-126, :149-151`).
7. Falsy-means-absent for three inherited keys (`handlerUtils.ts:539, :546, :553`) while
   `:531` does it correctly; `originalIndex || index` collapses index zero.

**How to continue.** Items 4 and 7 are one-line fixes with tests; item 1 is the one the
security technique would ask for first. Upstream is the operator's call; CONTRIBUTING.md
governs.
