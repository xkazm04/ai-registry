# Friend evidence matching

Loaded on demand from `SKILL.md` Phase 0b and Phase 1a. The rules for turning sibling
records into a seed (deviations) and a filter (the rejection set) without over- or
under-matching.

## Where to read

- **Main checkout, not the worktree,** for anything gitignored: backlog digests, sweep
  scratch, `.ai/consults.jsonl` reads, local run logs. A fresh worktree carries only
  tracked files, so a gitignored file read there is silently "absent".
- Tracked evidence (`.ai/registry-map.json`, `.ai/directions/ledger.jsonl`) reads the same
  from either, but read it from `<base_branch>` - the worktree's base - so it matches the
  code being changed.
- Writes this loop owes outside the vault (`.ai/consults.jsonl`, `.ai/registry-leads.jsonl`,
  the run log) land in the main checkout. Some repos track the consults log; a write in the
  disposable worktree is lost or committed by accident.

## Registry deviations (1a.2)

1. Contexts in scope = `contexts[]` with a `paths` entry under one of the area's paths.
2. Pairs = each context's `subjects[]` with `state: "deviation"`.
3. Drop pairs whose own `stale` is `true`. The map's top-level `staleSubjects` lists subjects
   whose bundle moved; it is not a per-pair verdict and is not the filter.
4. Drop pairs the rejection set matches (below). Only then rank (`confidence`: strong >
   probable, then `score`) and keep the top 5 - ranking first lets five rejected pairs
   crowd out every live one.
5. Pairs carry no technique field. Read the subject's golden path, then its techniques'
   `use_when`, and pick the technique the pair's `evidence` matches. Tag it
   `standard: <subject>/<technique>`.

## The rejection set (1a.3)

| Source | Match key | Effect |
| --- | --- | --- |
| `.ai/directions/ledger.jsonl` `declined` | subject with the bundle prefix stripped (`software-engineering/x` = `x`) plus the direction slug from `proposal` | never re-propose that direction; other directions on the same subject stay open |
| ledger `deferred` | same key | blocked until its return condition holds |
| ledger `accepted` | same key | in flight; expires once its work is merged into `<base_branch>` (the proposal's branch merged, or `.ai/applied.jsonl` records it) - an accepted row never bans a whole subject forever |
| `Friend/passes.md`, `$VAULT/Explorer/passes.md` | sections whose name contains the area or a sub-area slug (e.g. area `agents` matches `agents`, `agent-connectors`, `agents/health`), then short title + one-line What | hard drop |
| scan-sweep digest `titles.rejected` | title, close-synonym | hard drop |
| digest `titles.accepted` / `titles.pending` | title | in flight; do not duplicate |
| `/perfect` direction notes `rejected` / `dropped` | slug + context in scope | hard drop |
| Phase 0b soft rejects | cycle title | soft: skippable, not banned |

Count drops by source for the `Evidence:` header.

## Area -> branch and session mapping (0b)

Areas changed names over time; old sessions used sub-area or context names as the slug.
A branch or session belongs to the chosen area when its slug (the part between
`worktree-friend-` and the trailing `-HHMMSS`):

- starts with the area name (`agents`, `agents-health`, `agent-connectors` for area
  `agents` - singular/plural folded), or
- names a context in scope (0f), or
- its session note's `Area:` / title names one of those.

Anything else belongs to another area and is not judged this session.
