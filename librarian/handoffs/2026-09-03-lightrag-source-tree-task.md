---
project: source tree (not a fleet project) - github:HKUDS/LightRAG
run: intake-lightrag-0902
subject: software-engineering/job-coordination (liveness-proof-reclaim) - backlog spans llm-extracted-entity-graph, retrieval, data-access, migrations
technique: liveness-proof-reclaim
mode: task
branch: intake/reclaim-off-is-loud - exported as `2026-09-03-lightrag-source-tree-task.patch` beside this file (commit 5ecc99a over base c1248646e4eda4d89054926af2e094730daf23fe); the clone is deleted at Phase 9. Re-apply with `git clone <url> && git am <patch>`.
size: 1 file / ~15 lines / S
status: first step landed on the branch; not pushed; no PR opened
---

# Task: a disabled reaper says so

**Why a task against the source tree.** The subject forged this run has no seam in any
connected project (none builds a surface-form entity graph), so the standing rule puts
one `task` row against the source itself, chosen from the workers' deviations.

**The deviation chosen (job-coordination worker's #2).** Dead-process reservation reclaim
- the technique's reaper - is enabled only in multi-worker mode on one platform. Off that
platform in multi-worker mode an orphaned reservation can exist and nothing reclaims it,
and the function that decides this returned false silently. `creation-names-reaper` says
everything created names what destroys it; a reaper that is absent without saying so is
the same defect one layer up.

**The measurable.** Before: 0 log lines when reclaim is disabled where an orphan is
possible. After: exactly one warning per process, naming the platform, when multi-worker
mode is on and reclaim is off. Behaviour otherwise unchanged; the test hook that forces
reclaim on off-platform is untouched.

**What the first step found.** `py_compile` passes. The tree's test suite could not be
collected in this environment (a CLI-framework version mismatch on the host: `Choice` is
not subscriptable), so the change is compile-verified, not suite-verified. Next step on
the branch: a unit test that sets multi-process on with a non-Linux platform string and
asserts one warning and one only.

**Remaining backlog from the workers' lists, in order.**
1. Recall passes run exactly once whatever `entity_extract_max_gleaning` says
   (`operate.py:4217`; default 1 at `constants.py:17`) - the knob lies about its range.
   Either loop to the cap or rename the knob; a design decision for the maintainers.
2. Longest description wins across passes instead of accumulating
   (`operate.py:4296, :4314`) - the merge technique's rule, unmet.
3. The caller's mode flag outranks the query decomposition at each tier
   (`operate.py:5194-5196`); the keyword cache hashes the mode the prompt never sees
   (`:5002-5008`, `prompt.py:484-515`) - up to four partitions of one answer.
4. The all-empty fallback refuses queries over fifty characters and labels it only in a
   log (`operate.py:4654-4659`).
5. The case contract for entity names is a prompt request, not code (`prompt.py:63,
   :182`; `utils.py:5391-5393` never folds case).
6. Summary input truncated silently (`operate.py:587-593`); only the response truncation
   is tallied.
7. An alive-but-hung holder holds `busy` forever by design (`pipeline.py:3149-3159`);
   `force_reset` is reachable only through a fence a live holder never raises.
8. No identity-collision or extraction-recall measurement exists
   (`reproduce/batch_eval.py`, `lightrag/evaluation/offline_retrieval_check.py:67`).

**How to continue.** Item 3's cache-key fix is a one-liner with a clear test; item 1 is
the one worth an issue. The repository ships AGENTS.md and CLAUDE.md as contributor
contracts; the operator decides whether anything goes upstream.
