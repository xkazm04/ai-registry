# concurrent-vcs

Subject note. Slugs, dates and scores only.

## 2026-09-17 - intake `refactoring-hermes-1393-agents` (run intake-hermes-1393)

- `shared-resource-arbitration` gains "When duplication stops being cheap": the
  per-checkout daemon class inverts the namespace rule at fleet scale; share one
  server and verify delivery per worktree. Source: a first-party account of a
  structural pass that found ~30 resident language servers across worker worktrees.
  Corroboration: training-data convergence plus the fleet's own shared-install
  junction, which is the same shape with the worker's test run as the probe.
- New application `process--shared-resource-arbitration` (the fleet's worktrees):
  52 worktrees, zero per-worktree daemons; CLI sessions pay per session, not per
  checkout. `applied: experiment`, `ab_verdict: unmeasurable`, instrument named.
- Boundary with `fleet-orchestration` untouched: assignment stays theirs, the
  resource cost of the isolation stays here.
