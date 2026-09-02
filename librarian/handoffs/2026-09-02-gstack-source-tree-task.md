---
project: source tree (not a fleet project) - github:garrytan/gstack
run: intake-gstack-0902
subject: software-engineering/agent-browser-control
technique: persistent-browser-daemon
mode: task
branch: intake/busy-not-dead-test - exported as `2026-09-02-gstack-source-tree-task.patch` beside this file (git format-patch of commit 8f76abb over base 0d1bd5616c0ef096bb7ccee336f63c60ee408618); the clone was deleted at Phase 9. Re-apply with `git clone <url> && git am <patch>`.
size: 2 files touched + 1 new / ~60 lines
status: first step landed on the branch; not pushed; no PR opened
---

# Task: make the daemon's central invariant testable, then test it

**Why a task against the source tree.** The subject `agent-browser-control` was forged
from this tree and has no seam in any connected project (none drives a browser from an
agent). The standing scorecard focus says a handoff with no fleet seam owes one `task`
row against the source itself, using the deviations the forge worker recorded as the
backlog. This is that row.

**The deviation chosen (worker's #1).** `browse/src/cli.ts` documents
`decideDaemonRestart` as the IRON RULE of the daemon - "an alive pid is NEVER
auto-killed" - and as "pure and exported for unit coverage". No test referenced it, its
action vocabulary, or the probe budget. The subject's first technique rests on this
decision; in the tree it was a comment.

**The measurable.** Can the invariant be exercised in isolation, and how many of its
five action outcomes are pinned. Before: no (the module could not even be imported in a
test on one platform) and 0 of 5. After: yes and 5 of 5, plus the budget constant.

**What the first step found.** Importing `cli.ts` in a test throws at module load on
Windows when the server bundle is absent - the pure decision lived in a module with a
platform side effect at import. So the step is two changes, not one: the decision and
its budget constant move to `browse/src/daemon-restart-decision.ts` (no imports, no side
effects) and `cli.ts` re-exports them; `browse/test/daemon-restart-decision.test.ts`
pins the decision table. Six cases pass under the tree's own runner.

**The gate that sees it.** The tree's free suite (`bun run test:free`); the new file is
in `browse/test/` where the sharded runner discovers it.

**Remaining backlog from the worker's list, in order.**
1. Version-mismatch restart has no test (`cli.ts:706-712`).
2. `wrapError` (`server.ts:944-962`) matches on driver prose with no test pinning any
   rewrite; a driver wording change silently returns raw errors.
3. The ambiguous-ref case: the action path checks only `count === 0`
   (`tab-session.ts:97-104`) while the annotate path already knows the index population
   is wrong for unnamed nodes (`snapshot.ts:407-415`).
4. Stale state files swept by age regardless of pid liveness (`server.ts:3273-3288`).
5. The cookie-import remote-debugging elevation path the architecture doc lists as a
   non-goal (#1136).

**How to continue.** From `C:/t/gstack` on the branch: the next step is item 2, because
`agent-actionable-errors` is the technique whose realization has no pin at all. Upstream
contribution is the operator's call (CONTRIBUTING.md asks for an issue or discussion
before feature work; a test-only change is the smallest possible PR).
