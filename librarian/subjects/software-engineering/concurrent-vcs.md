---
subject: concurrent-vcs
domain: software-engineering
last_touched: 2026-09-23
---
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

## 2026-09-23 - [[2026-09-23-1]]

Lead drain (run lib-0923), L274 + L351 AMEND to `isolated-index-commits` and the golden path: composite blobs, derived files built from what you commit, and **correction** - phantom index staleness is not "merely annoying"; it read as pending work and blocked a merge for a session. Unverifiable counts dropped. Proposal: `commit-verification` - a swept-in sibling edit can reference untracked files, so verify a commit builds on its own.

**Impact** (stale verdicts before this landing, from the map rebuilt at the run start): none recorded.
