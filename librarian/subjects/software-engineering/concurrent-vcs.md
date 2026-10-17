---
subject: concurrent-vcs
domain: software-engineering
last_touched: 2026-10-15
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

## 2026-10-14 - intake `agentic-coding-flywheel-setup` (run dle-r1-1014, practitioner series R1)

Source note [[2026-10-14-agentic-coding-flywheel-setup]]: one practitioner's published
operating method for agent swarms, read against the audits of the projects it ran on. The
design record's E6 (one shared checkout on main, leases and guards instead of isolation)
was CONTESTED against this subject's bright line.

- `physical-isolation` gains "What isolation costs, and the regime where a shared tree
  wins": isolation's integration price (stale context, semantic conflicts that merge
  clean and surface late), the shared tree's price as the source's own audit recorded
  it, a discriminator (many writers, small additive changes, guards that engage on their
  own, every shared state valid at every instant), when the bright line holds anyway
  (feature work, long feature packages, any seat whose output is evidence) and a
  failure-mode table. The invariant "Multi-file work gets a worktree" gained one
  exception sentence for the implementer seat of a tree shared on purpose with the guards.
- Phase 7.5 on this registry (experiment, **not-better** for the drafted clause): a
  merge-tree replay of 1,129 commits, 2026-09-01..10-14, priced worktrees against the
  shared checkout. Isolation's paid conflicts per landing exceed the shared tree's 12
  recorded incidents (1.06% per landing) at every lead, 1.4-2.6x at the most generous
  reading; same-day appends conflicted 479 of 480 times. The drafted "the package runs for
  hours" clause was refuted and rewritten before landing (duration is a reason only for
  feature work), and a set-merge may never touch a generated file. Conflicts are caught
  and incidents are silent; neither was priced.
- Applications `process--physical-isolation--practitioner-swarm` (the source's fleet,
  anchors at pinned commits) and `process--physical-isolation--ai-registry` (the replay).
- Our own guards, measured: the run-board claim now reads, decides and writes under one
  gate (`intent-ledgers` row, code better, 30/32 and 29/32 double grants to 0/32, shipped
  bdb7dbf2); a commit inventory replay (`commit-verification` row, experiment better at
  path level, 3 of 4 known sweeps, 0.21% clean flagged, target missed on a hunk-level
  sweep, instrument shipped e148ad7d).
- Boundary with `fleet-orchestration` untouched: assignment and the verifier seat stay
  there; the checkout regime and the commit guard are here.

## 2026-10-15 - intake `mcp_agent_mail_rust` (run dle-002-1015, practitioner series DLE-002)

Source note [[2026-10-15-mcp-agent-mail-rust]]: a coordination server for agent swarms
whose commit hook refuses a staged path under another agent's exclusive claim, read with
its Python predecessor as design history.

- New technique `commit-time-claim-guard`: the session's own write inventory gates the
  commit and a claim only complements it; a claim protects a co-written file by arrival
  order (the first writer's commit is trusted whole); every-writer ledgers defeat a path
  guard both ways (exempt: the hunk catch vanishes; exclusive: the fleet serializes); the
  lease is checked only for commits from the shared tree; the hook's record is durable and
  narrow before the grant returns, healed, generation-stamped; one matcher; fail
  directions; replay before enabling with the tree's generators declared. Golden path:
  techniques list, the shared-tree invariant; `physical-isolation`'s discriminator bullet
  now names the inventory check first (append, standing sentences true).
- Phase 7.5, ai-registry (experiment, **not-better** for the source's lease rule): the
  commit replay gained lease arms on branch ab/lease-guard-replay (c0f626d8, unlanded).
  1,425 mapped commits: inventory 3/4 known sweeps at 0.28% clean; declared claims 2/4 at
  0.07%; implied claims 3/4 incl. the ledger-row sweep at about 15%; ledgers exempt: the
  ledger-row catch vanishes, as predicted.
- Phase 7.5, personas (experiment, **not-better**, seam chosen to falsify): the inventory
  rule flagged 6.2% of 1,459 mapped commits, nearly all unmodelled generators; 2 carried
  another session's lines, both deliberate. The technique gained "the inventory is per
  tree". During the run a sibling round's pathspec commit of that tree's apply ledger
  carried this run's uncommitted row: the shared-ledger hunk sweep on a second tree.
- Applications: `process--commit-time-claim-guard--ai-registry`,
  `rust--commit-time-claim-guard--agent-mail`, `rust--sub-file-claim-scope--agent-mail`
  (the no-wait partial grant moves hold-and-wait between calls; untriaged U1 as an
  amendment).
- Backlog rows from the peer study: dle-002-board-unreadable-record-fails,
  dle-002-beat-partial-grant, dle-002-evidence-liveness, dle-002-lock-fence,
  dle-002-refuse-broad-claims; dle-m2b-declared-inventory-guard updated.
