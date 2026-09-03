---
project: source tree (not a fleet project) - github:NousResearch/hermes-agent
run: intake-hermes-0902
subject: software-engineering/session-continuation (stuck-loop-detection amendment) - with the backlog spanning tenant-scoped-agent-runtime, prompt-assembly, embedded-db, agent-runtime-assembly
technique: stuck-loop-detection (the interruption that leaves no signature)
mode: task
branch: intake/escalation-arms-visibly - exported as `2026-09-02-hermes-agent-source-tree-task.patch` beside this file (commit 0a57be2 over base 0cbc6e37ac9fce50905157805c89fae06da93845); the clone was deleted at Phase 9. Re-apply with `git clone <url> && git am <patch>`.
size: 1 file / 18 lines / S
status: first step landed on the branch; not pushed; no PR opened
---

# Task: the escalation must say when it cannot arm

**Why a task against the source tree.** The subject forged this run has no seam in any
connected project, and the standing focus says a handoff with no fleet seam owes one
`task` row against the source itself, from the deviations the workers recorded.

**The deviation chosen.** The crash-resume escalation (mark recently touched sessions,
auto-continue, suspend after three consecutive restarts) is the amendment landed in
`stuck-loop-detection`. In the tree, the two writes the escalation depends on - the
restart counter it keys on, and the session-store save after a suspension - were each
wrapped in a bare `except Exception: pass`. A failure at either site leaves the terminal
state unreachable with no signal: the counter restarts from zero, or the suspension
lives in memory only and the next restart resumes the same session. That is the shape
`failure-not-empty-success` names, in the exact function the amendment describes.

**The measurable.** Before: 0 of 2 escalation-critical writes report their failure.
After: 2 of 2, each warning naming what will not happen (how many sessions the suspend
cannot arm for; that a suspension will not survive restart).

**What the first step found.** `py -m py_compile gateway/run.py` passes. The tree's test
suite could not be run in-run: collection errored on the first gateway test file (a
dependency the run's environment does not have), so the change is compile-verified, not
suite-verified. The next step on this branch is a unit test that injects a write failure
at each site and asserts the warning - the tree has `tests/gateway/` with the fixtures
for it.

**Remaining backlog from the workers' lists, in order.**
1. The home resolver and the secret resolver have opposite fail directions under
   multiplexing: `get_secret` raises unscoped, `get_hermes_home` warns once and returns
   the process default (`hermes_constants.py:114-139` vs `agent/secret_scope.py:192-200`).
   A design decision for the maintainers, not a patch: the docstring says raising "would
   brick 30+ module-level callers".
2. `_GLOBAL_ENV_PREFIXES` admits a whole platform prefix, so a future credential under it
   joins the global side automatically (`agent/secret_scope.py:135-139`).
3. The keyed plugin-manager cache and the per-path handle cache have no production reaper
   (`hermes_cli/plugins.py:6255-6274`, `gateway/run.py:7999-8015`).
4. Half-committed micro-compaction passes report as committed
   (`docs/micro-compaction.md` § staying in step with the session database).
5. Stale-index degradation reaches the log, not the caller (`hermes_state_search.py:1467`).
6. The multiplexing inventory row for terminal env is stale - the change that scoped it
   per turn did not remove the row (`docs/design/multiplexing-gateway.md:188`).
7. Timeout-allowlist and no-dead-hook policies are comments and a test over hook names,
   not over fire sites (`hermes_cli/plugins.py:365-420`).

**How to continue.** Item 6 is a one-line documentation fix and the cheapest upstream
contribution; item 1 is the one worth an issue rather than a patch. `CONTRIBUTING.md`
governs; the operator decides whether any of it goes upstream.
