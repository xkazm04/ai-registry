# Authority: what a shift may land, and where

Granted by the operator on 2026-11-06 for /shift: commit in the registry and every connected
codebase with impact, and push wherever that repo's own law pushes. The grant covers **measured**
changes. It extends no further than the table and the bar below.

**Re-read each repo's law at the start of the run that touches it** (`CLAUDE.md`, `AGENTS.md`,
`.claude/spark/config.md`, any deadline or freeze record). The table is a snapshot from 2026-11-06.
When a repo's own file disagrees with this table, the file wins and this table has a bug.

## The bar

A change lands unattended only when all of these hold:

- It passed `/intake` Phase 5 (no veto, `GAIN - RISK >= 2`, `GAIN >= COST`) or `/harvest backlog`'s
  `better`, and carries a paired proof with its **mode recorded** (`code`, `experiment`, `blind-ab`,
  `simulation`). A render-bound finding needs `render` and the operator's pick; nothing substitutes.
- It is coverage or a seam in the sense of `/intake` Phase 8. An `unproven` result does not commit.
- **Directions, XL rows, new laws and taxonomy changes stay proposals**, listed in the report.
- The diff is small enough to read in one sitting. Otherwise: branch, no push.
- The repo's own gates are green at the current build width. If `width.build` is 0, it waits.

## The table

| Repo | Landing | Push |
| --- | --- | --- |
| ai-registry | direct to `main`, only through `scripts/shift-land.mjs commit`: pinned tree, fragments, `gate.mjs --all` inside the `commit` lock | only through `scripts/shift-land.mjs push --remote origin --branch main`: no live lander, clean tree, rebase, regeneration, gate, one exact refspec |
| bp | `npm run check` + secret scan, rebase first | push `origin/master`, **through the 2026-11-18 12:00 PT deadline: the operator chose no freeze** |
| mage-arena-vr | manifest gates + secret scan, enforced subject format | push; no paid service but ElevenLabs. Decommissioned 2026-10-29, so expect little |
| pof | current branch; `master` was 11 behind | **never** |
| gravitone | current branch | **never** ("the owner pushes after reading the log") |
| personas | current branch | **never** (commit-only per the temper charter) |
| athena-muse | one commit per feature, one ADR per decision | **never** (no push rule found, so none assumed) |
| dowser | **no direct landing**: `temper.mjs land` only, enforced by a guard | **never**: file a lead or a proposal |

## In every repo

- Foreign WIP in a file you need: **branch, no push**, and name it in the report. Never commit around
  someone's uncommitted work in the same file.
- Stage by name, commit with a pathspec, verify `HEAD`. Never `git add -A`, stash, or switch the
  branch of a checkout others use. In this registry the door does all of it, and a lander stages nothing.
- Never `--force`, never `--no-verify`. Push one exact refspec; re-fetch first. A rejected push is
  reported, not retried by force.
- Red gate on arrival: compare to the base, say which is inherited, hold. Do not fix unrelated red.
  With the door a sibling's unfinished file can no longer cause it, so in this registry red is HEAD's or yours.
- bp's UE app builds only in the main checkout, one UBT at a time. A shift never runs them.
- A checkout whose default branch is far behind its remote: do not design against it; hold and report.
- `gh` polling at most every 90-120 s, as a 30 s poll emptied the hourly quota.

## The report line

Every landing gets one line in `.ai/shift/reports/<date>.md`: repo, SHA, whether it was pushed, mode,
one sentence on what changed. **A pushed commit that nobody has read is the risk this grant accepted**,
so the report is how the operator reads it, and the first section is what was pushed. A wrong push is
reverted by a new commit, with the operator told; history is never rewritten.

## bp in its last days

The operator chose no freeze. So the shift keeps to bp's own law through the deadline, and states in
each day's report how many days remain and what it pushed there. It adds no new dependencies to bp,
and a bp gate that is red stops bp landings for the day.
