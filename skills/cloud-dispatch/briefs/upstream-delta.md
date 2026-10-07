---
cloud_ok: true
label: upstream delta <repo-slug> <base7>..<head7>
from: librarian
---

# Upstream delta re-scan: <repo-slug>

You are a cloud session working in a fresh clone of **ai-registry**, a public registry of
knowledge bundles, skills and recipes. Nobody can answer questions while you run: where the
method says to ask the operator, write the question into RESULT.md and continue with what does
not depend on it.

**Read `AGENTS.md` at the repo root first.** It binds everything below.

## Your dispatch

The local Director ran `node scripts/upstream-check.mjs --due` and this repository came up due.
The upstream lane's caps (at most 3 delta re-scans per run, 6 per calendar month,
`.claude/skills/librarian/SKILL.md`) were already counted before this brief was sent; this
session is one of them.

- Repository: <https://github.com/owner/name>
- Pinned commit (the prior scan read this): <base sha>
- Re-scan at: <head sha, or "the default branch tip at clone time - record the sha you read">
- Prior source note: `librarian/sources/<YYYY-MM-DD>-<slug>.md`
- Subjects that note moved: <domain/category/subject, one per line, as index.json spells them>
- The `rescan_when:` condition that fired, and why: <condition> - <reason upstream-check gave>

## Method

Follow `docs/upstream-brief.md` - it is written for exactly this run - and, through it,
`.claude/skills/intake/SKILL.md` with `--delta`, up to and including landing in the registry
and passing its gates. In particular: read the prior source note in full first; sweep in
reversal order; re-open every citation that cites this repository's commit before you propose
anything; say your expected yield out loud before Phase 5; write a `-v2` (or next) source note
with the delta frontmatter, including a mandatory `rescan_when:`.

Clone the upstream repository yourself (shallow is fine, then fetch both shas). Its tree is
the source; it is not a fleet project.

## What changes because you are in the cloud

These intake steps rely on the shared local checkout or on this machine's fleet. Skip each
one and record it in RESULT.md instead:

- **The run board** (`scripts/run-board.mjs` claim, beat, lock, check, release). You are the
  only writer in this clone; there is nothing to coordinate with.
- **Shared ledger appends** (Phase 9): do not append to `librarian/sources/index.md`,
  `librarian/applied.md` or `.claude/skills/intake/SCORECARD.md`, and do not run
  `upstream-check.mjs --ledger`. Write each row you would have appended, verbatim, under a
  `## Ledger rows` heading in RESULT.md; the Director appends them after the merge. The source
  note and the subject notes under `librarian/subjects/` are yours: write them.
- **Fleet application** (Phase 7.5 apply and A/B, Phase 7.6 direction pass, Phase 7.7 decision
  gate, Phase 8 cross-repo lane, Phase 6b render proof). They need sibling checkouts and
  `.machine.local.json`, which do not exist here. For every landed technique and every flipped
  golden-path rule, write a `## Handoff` entry in RESULT.md: the technique path, the projects
  `librarian/fleet-map.md` joins to its subject, the seam you would test, and the mode you
  expect is reachable.
- **Phase 10 commits go to your branch**, never to `main`, whatever the intake method says
  about committing direct to main. Stage files by name; never `git add -A`.
- **Phase 11 reflection**: do not edit the intake skill or its LESSONS. Write proposed lessons
  under `## Proposed lessons` in RESULT.md.

## Rules that bite here

- **Never run any registry script with `--help`.** Most have no argument handling and
  execute. Read a script's `argv` handling in its source instead.
- **Never hand-edit generated content, and regenerate AFTER you commit.** The index stamps
  each subject's `revision` and `changedAt` from git history, so a regeneration before your
  content commit reads history without it and lands stale (witnessed 2026-10-06: main failed
  `build-index --check` after such a merge). Commit your source edits first, then run
  `node scripts/build-index.mjs`, `node scripts/build-knowledge-rules.mjs`,
  `node scripts/build-catalog.mjs`, and commit the generated files as a separate commit.
- **Run `node scripts/gate.mjs --lane knowledge` and report its output tail in RESULT.md.**
  On origin/main as of 2026-10-06 it stops at `check-public-paths.mjs` on violations inherited
  under `knowledge/game-production/`. If it stops at a step whose violations name no file you
  touched, say so with the count, then run the remaining steps one by one and report each:
  `node scripts/build-index.mjs --check`, `node scripts/build-knowledge-rules.mjs --check`,
  `node scripts/review-coverage.mjs`, `node scripts/check-hash-stability.mjs`,
  `node scripts/build-catalog.mjs --check`. A violation in a file you touched is yours to fix.
- No machine paths anywhere you write; this repository is public.

## RESULT.md must also carry

- The delta line (`<base>..<head> - N files, +A / -D, T days`) and the expected-yield
  prediction you made, against what actually landed.
- `citations_reopened: <checked> / <re-pinned> / <withdrawn>`, with the application paths.
- Every landing as a path, and every decline with its reason.
- The `## Ledger rows`, `## Handoff` and `## Proposed lessons` sections above, even if empty
  (write "none" and why).
