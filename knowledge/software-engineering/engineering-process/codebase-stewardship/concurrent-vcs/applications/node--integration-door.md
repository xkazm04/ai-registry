---
layer: application
type: application
subject: concurrent-vcs
technique: integration-door
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: experiment
ab_verdict: not-better
proof: measured-history
---

# A builder loop's merge gate, and the held run whose claim it lets go (Node)

Read in the `xkazm04/personas` tree at commit
`b3ea18c893ae21070095ebcc054f7fcc742c693f`: the `appmaster` skill under
`.claude/skills/appmaster/`, a Node loop that dispatches headless builder
sessions into per-run worktrees of several repositories and integrates their
branches through a gate. The loop runs on the Node 24 runtime this machine
carries, which is what `verified_against` records. Citations were opened on
2026-10-14; the run history it was measured on lives in the loop's local state
directory and is not published.

## What the tree already does that the technique asks for

The door is mature, and most of the technique is a description of it:

- **The claim comes from the record.** The file's first lines say it: a
  builder's result file is a claim and is never trusted; commits come from the
  repository and the verdict from the project's own gates
  (`.claude/skills/appmaster/lib/merge.mjs:2 "result.json is a CLAIM and is never trusted"`).
- **Rebase inside the run's worktree**, never in the checkout
  (`.claude/skills/appmaster/lib/merge.mjs:124 "INSIDE the run's worktree"`).
- **Dirt judged by overlap.** The checkout's dirty paths are intersected with the
  branch's changed files and only an intersection refuses
  (`.claude/skills/appmaster/lib/merge.mjs:279 "const overlap = verdict.files.filter"`);
  the one operation in the checkout is a fast-forward
  (`.claude/skills/appmaster/lib/merge.mjs:284 "--ff-only"`).
- **Scope checked at the door.** Changes to declared boundary paths hold the
  run; changes outside the run's declared paths are recorded for the master,
  not held (`.claude/skills/appmaster/lib/merge.mjs:408 "recorded for the master, not a hold"`).
- **A held run keeps its branch and worktree**
  (`.claude/skills/appmaster/lib/merge.mjs:5 "A held run keeps branch + worktree."`).

## The seam chosen to falsify: the claim's lifetime across a hold

The technique's one contested rule is that a failed integration keeps its claim.
This loop does the opposite in one specific place. Its dispatcher refuses a new
run whose declared paths overlap any run that still holds the repository, and
the states it counts are
(`.claude/skills/appmaster/lib/contract.mjs:202 "export const LIVE_RUN_STATES = ['planned', 'running', 'exited', 'verifying'];"`)
- `held` is absent, although the comment beside the check gives the reason for
counting `exited` and `verifying` as "they still own their files until they
merge" (`.claude/skills/appmaster/lib/worker.mjs:361 "they still own their files until they merge"`),
which is equally true of a held run. Under the technique's rule a held run would
keep blocking overlapping dispatches. This seam could falsify that rule: if the
loop released held claims for weeks with no harm, the rule is not universal.

**Arms.** A is the loop as it ran: held runs do not block. B is the same history
with `held` counted as holding; every dispatch that started inside a held run's
held window on the same repository with overlapping declared paths would have
been refused. The overlap test is the loop's own function, imported, not a
re-implementation (`.claude/skills/appmaster/lib/paths.mjs:3 "CONSERVATIVE by design"`),
asserted first on a known overlap and a known disjoint pair.

**Target.** Overlapping dispatches into a held window (A recorded, B priced).
**Floor.** Conflicts met by held runs when they were later retried or merged,
and dispatches B would have deferred.

**Read** (replay over the loop's recorded history, 2026-10-05 to 2026-10-13):
1,167 runs across eleven repositories; 67 non-review runs were held at some
point (44 with a recorded hold time from their merge-gate question, 23 bounded
from below by the builder's exit time). Six dispatches started inside a held
window on the same repository, and **two** of them overlapped the held run's
declared paths, both against one held run and both on the same file. One of the
two merged first; the held run was later rebased over it inside its worktree and
merged without a conflict. The other was released. No held run met a conflict
attributable to an overlapping dispatch.

**Verdict: not-better.** Arm A's harm was already zero, so B cannot improve it,
and B would have deferred two dispatches, one of them by about two hours. B was
priced from the record, not run. The rule did not hold unconditionally: at this
loop's grain, directory-wide declared paths, an overlap rarely means the same
lines, and the in-worktree rebase absorbed the one that did. The technique now
states the rule as conditional on claim granularity, which is what this seam
refuted. No change was made to the tree.

## What this realization cannot do

It cannot see an overlap between a held run and a new run unless someone reads
the held run's paths: the dispatcher's view lists live runs only, and a held run
shows up among recent runs with its reason but without its paths. At a finer
claim grain that would be the first thing to change.
