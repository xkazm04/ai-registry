---
layer: application
type: application
subject: concurrent-vcs
technique: physical-isolation
stack: process
verified_on: 2026-10-14
---

# Six weeks of one shared checkout, replayed as if every run had worked in a worktree

This registry is written by about a dozen concurrent agent sessions on one checkout of
the main line, behind a commit lock and nothing else: no lease on the files a session
edits and, until this replay's sibling instrument, no check of what a commit carries. By
the technique's discriminator that is neither regime. The replay asks what isolation
would have cost instead, using the measurement the technique prescribes, over the
registry's own history.

## The instrument

The corpus is the 1,129 non-merge commits on main's first-parent line authored between
2026-09-01 and 2026-10-14. For each commit and each branch lead of half an hour, one hour
and two hours, the branch point is the newest main commit at least that long before the
commit was authored. The commit's own change is replayed onto the branch point with
`git merge-tree --write-tree` (merge base: the commit's parent), so a conflict is exactly
the textual conflict integration would have met against the sibling landings in between.
Conflicted paths are split three ways, by a rule fixed before any replay ran: **ledgers**
(a hand-written file touched on at least 20 author-days, at least 80% of the touches pure
additions: the applied ledger, the source ledger, the intake scorecard and lessons),
**generated** files (indexes, catalog, rules, marketplace), and **content**. A ledger
conflict counts as resolved when both sides only add lines. Generated conflicts are not
counted, since a worktree regime regenerates them after integration.

Three checks ran first: the replay conflicts on a known same-day pair of ledger appends
from two sessions; it merges clean for a commit that only added a new subject folder; and
the shared side's incident list includes the recorded 2026-09-03 sweep. A private clone
held the replay, so nothing landed in the shared object store.

## What it found

Landings seen between branch point and integration: median 3, 5 and 8 at the three leads
(p90 9, 12 and 20).

| lead | any conflict | content | ledger | paid (content, or a ledger not set-mergeable) |
| --- | --- | --- | --- | --- |
| 0.5 h | 35.6% | 13.6% | 19.9% | 15.6% |
| 1 h | 47.7% | 18.1% | 26.9% | 20.8% |
| 2 h | 54.7% | 21.9% | 30.6% | 24.8% |

Part of that is a run conflicting with its own earlier commit. From 2026-09-14, where
session transcripts let the replay tell sessions apart (686 commits), removing
own-session conflicts leaves 4.2%, 7.6% and 9.2% paid; also set-merging the per-domain
ledger files, the most generous reading, leaves 2.3%, 3.5% and 4.4%.

The shared tree, as run, recorded twelve incidents in the window: sweeps of a sibling's
files or rows into a commit (seven, two of them found only by the
[commit inventory replay](../../../../../../scripts/commit-inventory-replay.mjs) and
unrecorded for two weeks), a run committing another run's draft as orphaned, a
deliberate commit of siblings' work unreviewed, a checkout switched onto a sibling's
branch, a lock broken one second after it was taken, and conflict markers committed by a
merge run in the shared checkout. That is 1.06% per landing over the corpus and about
1.5% per landing made in the shared checkout from 2026-09-14.

So isolation's paid conflicts exceed the shared tree's incidents at every lead: 15 to 23
times as specified, 2.8 to 6.2 times with own-session conflicts removed, 1.4 to 2.6 times
at the most generous reading. Same-day appends by another session to the same ledger
conflicted in 479 of 480 cases, which confirms the technique's precondition for
append-only ledgers, and set-merge resolved about nine in ten ledger conflict paths
(385 of 386 in the history's own 226 merges). The history also supplied the warning the
technique now carries: a union merge of a generated index left it invalid JSON.

## What this realization cannot show

- **Cost.** A conflict is loud and caught at integration. The registry's real worktree
  lane integrated 194 times and 184 of those merges conflicted, almost all on ledgers;
  one merge in the window let a fault through (conflict markers in a generated catalog).
  An incident lands silently. The replay counts both and prices neither, so it settles the
  count, not the trade: the shared tree is worse here only if one silent incident costs
  more than about two to six resolved conflicts.
- **Semantic conflicts.** `merge-tree` sees text. The lower bound from commit messages is
  one regeneration after a clean merge; no behavioural break after a clean merge is
  recorded in this tree.
- **Completeness of the incident list.** From 2026-09-14 sweeps are found systematically,
  and that instrument still misses a sweep inside a file the run also wrote; before that
  date the list is self-reported.
- **Worktree-side incidents** (a shared stash, a hook leaking its git directory into a
  test fixture, a dependency junction deleted through) are recorded for fleet projects,
  not this tree, and are not in the count.

The finding the registry acted on: keep the shared checkout for additive runs, and spend
the effort on the guards the discriminator names. An atomic run-board claim and the
commit inventory replay landed the same day; a declared-inventory commit guard with a
hunk check is the next arm.
