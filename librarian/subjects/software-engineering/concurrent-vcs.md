---
subject: concurrent-vcs
domain: software-engineering
last_touched: 2026-10-14
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

## 2026-10-14 - intake `github:rtk-ai/grit` (run intake-grit-1014)

Source note [[2026-10-14-grit]]. Two new techniques, both forged in session from a
design record whose routing count put four NONE entries on this subject:

- `sub-file-claim-scope`: claims that name functions instead of paths. Decision
  rule first (measure overlap refusals before going below the file), then five
  holes: name-based identity, containment, the remainder no unit owns, units that
  do not exist yet, a stale index; plus dependency claims and all-or-nothing
  acquisition in canonical order. States its boundary with `intent-ledgers` on its
  own side: a blocking claim is a lease, and an autonomous reader needs the refusal
  to carry the alternative. `intent-ledgers` unchanged.
- `integration-door`: the merge-back stage the golden path left to one clause.
  Serialized door, claim read from the record, rebase inside the branch's
  worktree, dirt judged by overlap, verify-then-teardown, scope checked at the
  door. The claim's lifetime across a failed integration is conditional on claim
  grain, because the falsifying seam refuted the unconditional form.
- Golden path: claim-grain paragraph under "Two layers", a new section
  "Integration is a stage, not a clause", one invariant, two list entries.
- Applications: `rust--sub-file-claim-scope`, `rust--integration-door` (the
  source tree), `node--integration-door` and `node--sub-file-claim-scope` (the
  personas builder loop; both experiments, both not-better: 2 overlapping
  dispatches into held windows across 1,167 runs with 0 conflicts; 0 of 195
  queue entries refused for path overlap).
- Boundary with `fleet-orchestration` untouched: assignment stays there; the
  claim grain and the merge-back are here. Boundary with `concurrency-guards`:
  the door's lock follows `cross-process-exclusion` unchanged.
