---
layer: application
type: application
subject: agent-instruction-files
technique: line-earning
stack: claude-code
verified_on: 2026-09-05
verified_against: claude-code@2.1
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# Where a prose rule is lost when neither file length nor session length can leak (kp)

Run 2026-09-05 against kp, a fleet project whose `.claude/CLAUDE.md` (328
lines at the committed blob `d7ae8c0c`) splits its rules the way
[enforcement-demotion](../techniques/enforcement-demotion.md) prescribes:
design tokens, locale parity and `await` inside `db.transaction()` are
program gates named in one line each; **two rules stay in prose** — the
shared-checkout commit rule (`git add <path>` only, never `-A`/`.`/`-u`,
never `git stash`, check `git diff --cached --stat` first) and the
documentation-sync obligation ("update the doc in the same change"), whose
gate is a `Stop` hook reading the session transcript plus, since
2026-08-27, a CI job reading the commit range with a `Doc-sync:` waiver
trailer. The seam is that split, and the question the flipped golden path
puts to it: when a prose rule is dropped, is the leak the file's length
(shorten it) or the session's length (re-deliver or demote it)?

## The two arms

The project keeps its recorded sessions: 9 main Claude Code transcripts and
364 subagent transcripts (versions 2.1.224–2.1.261, 2026-08-07 to
2026-09-05), 2,202 file edits and 16,800+ shell calls. The harness replays
the hook's **own** decision function — `evaluate()` and `isTurnBoundary()`
imported from `scripts/docs/check-doc-sync.mjs`, not a copy — over every
turn, and a pathspec predicate over every `git add`/`commit`/`stash`; each
event is tagged with the `feature-doc-map.json` and `.claude/CLAUDE.md`
versions live at its timestamp. Product code was not changed.

| Arm | Policy | Reads compliance by |
| --- | --- | --- |
| A | shorten the file / move the line (line-earning as authorship lever) | `.claude/CLAUDE.md` line count live at the event |
| B | re-deliver or demote (the flipped rule's delivery axis) | position in session: owed-event ordinal, turn ordinal, hours in |

## What was read

**Doc-sync, 107 owed turns** (a turn that edited mapped feature source):

- satisfied in the same turn **35/107 (33%)**; by a later turn of the same
  transcript, 1 more.
- **Arm A:** 10/49 (20%) at 285 lines, 19/38 (50%) at 310 lines, n≤8 at the
  other seven lengths. Compliance did not fall with length; it rose, and the
  two large cells are different waves, so the honest reading is *no
  decrease*, the size null replicated.
- **Arm B:** **101 of 107 owed turns are the first owed event of their
  transcript.** Builder transcripts have a median of 1 turn; 6 of 364 reach
  a second owed turn. The session-length axis has no spread to read. The
  Director's own session — 3 days, 4 compactions, 259 hook fires — produced
  2 owed turns in 246 edits, because it edits `.claude/`, `docs/` and `.ai/`,
  which the hook skips.
- The loss therefore sits **at event one, with the file freshly delivered**:
  67% of first-edit turns skip the doc on a floor that was injected minutes
  earlier. Neither arm's instrument moves; the decay the study measured per
  function generated has no room to occur.

**The gate the prose rule is demoted to never sees the surface that edits.**
`.claude/settings.json` registers `Stop` only. The hook fired 321 times on
the main sessions and set `preventedContinuation` **0** times; it fired **0**
times on the subagent surface that made 1,920 of the 2,202 edits (87%). The
one main-session owed turn on which the hook fired and stayed silent
(2026-08-20) predates `688cd04d`, the fix for a hook that "has never once
fired" — the phantom-gate case
[instruction-freshness](../techniques/instruction-freshness.md) records.

**Pathspec commits, the other prose rule, 0 violations anywhere:** 0/393
`git add` with `-A`/`--all`/`-u`/`.`, 0/751 `commit -a`, 0 `git stash`, flat
across ordinal buckets (162 first adds, 66 past the twelfth) and across all
ten file lengths. The unenforced prose rule is not the one leaking. Its soft
sub-clause — `git diff --cached --stat` before committing — held at **27/751
(4%)**, equally flat: 6% on first commits, 2% past the eighth, 3% at 285 lines
and 3% at 310. A rule that is never followed is not being dropped late; it
lost at admission.

**The commit-range gate, before/after, same predicate over 1,296 commits
since 2026-08-05 (747 owed):** 141/208 (68%) carried the doc before the CI
job existed, and no waiver form existed; after it, 342 doc + 107 `Doc-sync:`
trailers of 539 (83%, of which 63% doc-in-commit); 94% over 2026-09-02..05.
The number that moved when a gate reached the editing surface is the
commit-range number — the delivery-axis hook, re-delivered on every Director
turn, blocked nothing in 321 fires.

## Verdict: not-better, with the condition it earns

The flipped rule says the file-scale leak is session length and that a
shorter file is still the author's only lever. On this tree the two prose
rules leaked along neither axis: one held absolutely, the other lost
two-thirds at the first event of sessions too short to dilute. **In a
Director/Builder topology, where the sessions that edit are single-event
builders, the session-length axis has nothing to leak along and re-delivery
cannot reach a first-event miss; the lever is a gate on the builder
surface.** The condition is written into the golden path.

The structural fact nobody designed: kp adopted enforcement-demotion for
doc-sync and then adopted a fan-out topology that moved the edits out of the
gate's sight — a `Stop` hook watching the one session that does not edit
feature code. The commit-range job is the demotion that survived the
topology change, because it observes the artifact rather than a transcript.

## Return condition

A `SubagentStop` hook, or a per-commit ordinal in the doc-sync record, would
make builder-surface compliance observable by position; that is the
instrument under which the session-length axis could be read here. Until
then the axis is unmeasurable in this topology, and the number to watch is
the commit-range rate. Falsifier for the verdict: builder transcripts that
grow past a handful of owed turns and show the first-turn rate holding while
later turns fall.
