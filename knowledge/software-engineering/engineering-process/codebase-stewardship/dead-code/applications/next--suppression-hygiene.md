---
layer: application
type: application
subject: dead-code
technique: suppression-hygiene
stack: next
status: forged
verified_on: 2026-08-31
verified_against: next@16.3.3
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A ratchet holding a population defined by a subtraction nobody counts

A studio web application runs a lint debt ratchet: per-rule warning counts are
committed to a baseline file, and the gate refuses any mismatch in either
direction, so the debt can neither grow nor shrink unattributed. The baseline
file opens with its own predicate — what was counted, over which population,
matched how, and the exact command that recomputes it. It is one of the better
implementations of the neighbouring ratchet technique in the fleet, and it is
the right tree to test the reach axis on, because everything else about the
suppression surface here is already disciplined.

The predicate's population clause is the one word that matters: findings are
counted "over the whole repository **minus that config's `ignores` block**".

## The entry that is correct and enormous

One `ignores` entry is `.claude/**`. Its comment records why, and the reasoning
is right: that directory holds git worktrees — second full checkouts of the same
repository — and the linter walks by path, not by git index. With the entry
absent it graded both copies, and the config records the measurement taken when
that happened: 608 files walked, 309 of them under `.claude/`, every warning
bucket at exactly twice its real size.

The comment then records what the incident actually cost, and it is the sentence
this application exists for:

> The ratchet did its job and went red. What it could NOT say is that the rise
> was a second copy of the same debt rather than new debt, so the gate read as
> "you added fourteen hook violations" and pointed at a refactor nobody needed
> to do.

The gate could not say it because **reach was never a number here.** The ratchet
counts findings; nothing counts the population the ignores removed, so a change
in reach and a change in debt arrive through the same channel wearing the same
clothes.

## Both arms, same instrument, same rule set

Arm A is the linter under the shipped configuration — the population the ratchet
grades. Arm B is the population the `.claude/**` entry removes, measured by
running the same linter at the worktree's own root, so it resolves the same
pinned rule set through the same config.

| | files linted | warnings |
|---|---|---|
| arm A — the graded population | 372 | ratcheted |
| arm B — what one ignore entry removes | **305** | **19** |

One entry removes 305 of the 677 files the two arms cover between them — 45% of
the walked tree — and suppresses 19 live warnings. Neither number appears in any
output the project produces. Nothing is wrong with the entry: it matches, so
stale-match cannot fire; its justification holds exactly as written, so no reaper
clause fires; its delegation is honest, because a foreign checkout genuinely is
not this checkout's debt. Every discipline in the technique passes, and the
instrument's coverage is a little over half of what the baseline's predicate
implies to a reader who does not open the config.

## The structural fact: reach here is a function of workflow, not of code

The gap this tree exposes is not that somebody wrote a careless glob. It is that
**this entry's reach is set by how many agent worktrees happen to exist**, which
is a property of how the team works that day, not of the codebase. One worktree
is present now. Two would move the subtraction by another few hundred files
without a single commit touching the config, the baseline, or any source file —
and the ratchet would stay green through all of it, because the debt in the
graded population genuinely did not change.

That is the third rot axis in its purest form, and it is not reachable from the
entry's text. No audit of the roster, no re-reading of the reason, no expiry
condition can surface it. Only a count taken where the entry fires can.

## What this realisation cannot do

The 305/372 split is one reading on one day, with one worktree present. It shows
the reach is large and workflow-dependent; it does not show that the reach has
ever silently changed in a way that mattered, because there is no historical
series — which is the whole complaint. The instrument that would answer it is the
committed-count form the technique recommends, and this tree does not have it
yet.

The arms are also not perfectly matched: arm B is the same linter and rule set at
a different root, so its file discovery starts from a directory rather than being
carved out of the parent walk. The count is close enough to size the subtraction
and not precise enough to reconcile to the byte against a hypothetical
single-walk run.

## The change this argues for, not made here

The ratchet already has the strongest form of the corrective within reach: it
commits counts and compares them every run. Extending its baseline with a
population line — files walked, files removed, per ignore entry — would put reach
on the same footing as debt and make the 2026-08-29 incident legible as "reach
doubled" instead of "you added fourteen hook violations". The tree was not
modified for this application.
