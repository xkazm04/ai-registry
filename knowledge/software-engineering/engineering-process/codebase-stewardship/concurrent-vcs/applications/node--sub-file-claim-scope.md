---
layer: application
type: application
subject: concurrent-vcs
technique: sub-file-claim-scope
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: experiment
ab_verdict: not-better
proof: measured-history
---

# A builder loop whose path claims never refused anyone (Node)

Read in the `xkazm04/personas` tree at commit
`b3ea18c893ae21070095ebcc054f7fcc742c693f`: the `appmaster` skill's dispatcher
under `.claude/skills/appmaster/`, which runs headless builder sessions in
per-run worktrees of several repositories. It is the same loop as the
`integration-door` application beside this one. The loop's queue and run
history live in its local state directory and are not published; they were
read on 2026-10-14.

## How it claims today

Every dispatch declares the repository-relative paths or globs its builder will
touch, and a dispatch whose paths overlap a run still holding the repository is
refused. The overlap test is deliberately conservative: a glob widens to its
literal directory, an empty list is the whole repository, and anything it cannot
prove disjoint overlaps
(`.claude/skills/appmaster/lib/paths.mjs:3 "CONSERVATIVE by design"`).
At most two builders run per project at once
(`.claude/skills/appmaster/lib/contract.mjs:119 "export const PER_PROJECT_CAP = 2;"`),
under a global cap of sixteen
(`.claude/skills/appmaster/lib/contract.mjs:113 "export const GLOBAL_CAP = 16;"`).
Path overlap is one of five recorded queue reasons
(`.claude/skills/appmaster/lib/contract.mjs:195 "'paths overlap'"`).

## The seam chosen to falsify: is the force there at all?

The technique says to go below the file only where overlap refusals are common
and the refused sessions changed disjoint regions. This loop is the best
candidate in the fleet to show the force: it runs many sessions, on shared
repositories, with the coarsest claims the technique describes.

**Arms.** A is the loop as it ran, path claims. B is the same dispatches under
function-level claims, priced: every dispatch refused for path overlap whose
builder's changes were disjoint at function level would have been admitted.

**Target.** Dispatches B admits that A refused. **Floor.** None declared beyond
the target itself; B was priced, not run.

**Read.** The queue log for 2026-10-06 to 2026-10-13 holds 195 entries for 179
dispatches: 136 waited on the global cap, 45 on free memory, 12 on the
per-project cap, 2 on a repository lane, and **0** on path overlap. Over the
same span the loop recorded 1,167 runs. One blind spot: when a master plans two
overlapping dispatches in one wake, the decision validator returns the error to
the planning session instead of journaling it, so overlaps the masters were told
about and planned around are not counted here; the queue counts only the
overlaps that reached dispatch.

**Verdict: not-better.** There is nothing for finer claims to admit. The masters
plan disjoint work before they dispatch, two builders per project is the real
ceiling, and the machine's capacity, not the claim unit, decides who waits. The
technique's own first rule (measure before going below the file, and stay at
path scope where caps dominate) is the rule this loop already follows. No change
was made.

## What would change the verdict

A loop that raises its per-project cap well past two, or a repository whose work
concentrates in a few large files, would start producing overlap refusals; the
first week those appear in the queue log is the time to re-run this count and
compare the refused pairs' changed functions.
