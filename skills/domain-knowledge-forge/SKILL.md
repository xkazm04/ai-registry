---
name: domain-knowledge-forge
description: "Extract a repository's domain knowledge into a four-layer RKB bundle in this registry: scout every context, design subjects with the operator's split doctrine, then forge each subject two-phase (expert draft + web hardening before repo reconciliation) with a bounded agent pool. Use when a new domain repo should populate the knowledge lane."
category: ai-native
memory: project
version: 1.0.0
tags: knowledge, rkb, extraction, orchestration, bundles
---

# Domain knowledge forge

Turn what a codebase *knows about its domain* - not its engineering - into a Reference
Knowledge Bundle (`knowledge/<domain>/`) that transplants to any team in that domain.
The first run produced three bundles (46 subjects / 267 techniques / 91 applications)
from three repositories in one session; this skill is that process, made repeatable.

**Preconditions.** The target repo(s) readable locally; this registry cloned; the
format spec (`docs/rkb-profile.md`) and the per-wave contract (`docs/forge-brief.md`)
present. An agent pool cap agreed with the operator (the calibrated default is **10
concurrent**). Work on a branch - merging is adopting, and that click is the owner's.

## Phase 0 - Scout every context (parallel, read-only)

Partition the repo by its context map (or top-level structure) into scout territories
of roughly 10-25 contexts and dispatch one read-only scout per territory, all at once.
Every context gets covered; infra contexts are triaged with one line ("little domain
knowledge, moving on") rather than skipped silently.

Each scout returns, structured: (1) the domain problem each context solves; (2) WHERE
domain knowledge is embedded - prompts, rubrics, scoring formulas, parsers that encode
source-format knowledge, taxonomies - as file:line anchors; (3) candidate subject
slugs with one-line definitions and 4-6 candidate technique slugs each; (4) verbatim
excerpts of the 5 densest knowledge blocks.

The scout brief must say, verbatim: *"Your job is NOT software engineering review."*
Without it, scouts drift into code quality. The extraction payload is the craft the
app encodes - the software-engineering bundle already exists.

## Phase 1 - Design the bundle (the director, not an agent)

Consolidate scout candidates yourself; this is the judgment step that cannot fan out.

- **Dedup across scouts.** Overlapping candidates (two scouts both proposing a
  conflict-of-interest subject) merge into one owner; the technique-ownership rule
  exists precisely for this.
- **Subjects: 12-17 per bundle**, each with 4-6 techniques assigned exclusively.
  Assign every technique slug at design time - forgers must never invent or drop one.
- **Start combined, split later.** One bundle per domain even when a split feels
  plausible; encode the seam as categories (`categories.json`). The split test lives
  in `knowledge/README.md`: split when a category stops sharing the purity denylist,
  never for size.
- **Distill the laws.** The rules that recur across every scout report ("deterministic
  code owns every number", "missing is not zero") are `_laws.md` anchors, not
  subjects. 8-9 laws per bundle is the observed natural size.

## Phase 2 - Scaffold the bundle

Write by hand: `index.md` (OKF metadata + `purity:`, optionally `stacks:`),
`_laws.md` (anchored laws), `categories.json` (the full planned subject map - it will
fail the gate until every folder exists; that is the progress meter, not an error).
If no purity profile fits the domain, add one to `scripts/check-bundles.mjs` in the
same change - a floor to extend, never narrow.

## Phase 3 - Forge waves (the expensive part)

One agent per subject, never more than the agreed cap in flight; **top the pool up one
agent per completion notification** rather than launching fixed batches - it holds the
cap exactly and wastes no wall-clock. Each dispatch prompt carries: bundle, subject
slug + definition + category, the exclusive technique list, whether web hardening is
warranted (2-4 searches for subjects where current practice moves fast; none where
training data suffices), the scout's file:line anchors, and application stack
guidance. Everything else lives in `docs/forge-brief.md`, which every forger reads
first.

The load-bearing rule is the **two-phase order**: expert draft (plus web hardening)
BEFORE opening the repo, reconciliation after - each repo claim landing as confirmed
(cite in an application), deviation (standard stays), or upward lesson (improve the
draft). A subject drafted repo-first describes one codebase and reads like it.

Require each forger to run the gate before reporting and to name its upward lessons -
the report doubles as the review surface.

## Phase 4 - Verify yourself, then publish

Never trust the forgers' green reports alone. From the registry root:
`node scripts/check-bundles.mjs`, `node scripts/build-index.mjs`,
`node scripts/build-catalog.mjs`. Update the bundle tables in `README.md` and
`knowledge/README.md`. Commit on a branch; if the checkout is shared with other
sessions, use a git worktree or an isolated index (seeded `git read-tree HEAD`) and
verify `git log -1` is your commit. Leave the merge to the registry owner.

## Failure modes observed (do not rediscover)

- **Purity drift in upper layers.** Forgers name the source app, a model, or a
  country when the denylist doesn't list it. The denylist is a floor: instruct
  "even names it doesn't list stay out", and spot-check.
- **Coverage claimed != coverage done.** A scout that "covered" 25 contexts by reading
  8 is invisible unless the report requires a per-context line.
- **The gate mid-wave is noisy by design.** `categories.json assigns X, no folder`
  is other forgers' pending work; each forger checks only its own subject's findings.
- **use_when belongs on techniques too.** Golden paths get it naturally; technique
  files need it stated explicitly in the brief or a backfill pass follows.
