---
layer: application
type: application
subject: requisition-lifecycle-governance
technique: fill-is-a-count-and-close-is-the-act-it-triggers
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# The role-fill hook in `app/_lib/stage-hooks-role-fill.ts`

Citations resolved on 2026-09-29 against kp at `006bf7a0a`. This page holds the
one place the technique was already built when the registry first read the tree, and
the A/B that makes the claim measured rather than admired.

## What kp does

Opening a role states how many people it has to hire: `POST /api/jobs/[id]/publish`
takes an optional `targetHires` (`publish/route.ts:47-66`), refuses a non-integer or
anything outside 1 to 50 with the coded `JOB_TARGET_HIRES_INVALID` rather than
truncating it, and writes it **inside the go-live transaction** beside the status
flip (`:146-150`) so that *"a role can never be live under a target the auto-close
hook has not seen yet."* The ceiling has its reason in the comment (`:68-70`): it is
*"the point past which 'a role' is really a hiring campaign"*, and a mistyped 300
would keep a requisition open indefinitely while the desk reported honest, useless
progress. An unstated target folds to one in a single function, `roleTargetHires`
(`app/_lib/db/jobs.ts:699-701`), whose comment states the rule the technique
generalises: *"'unstated' and 'stated as 1' the same fact."*

**Filled is derived, closed is stored.** `docs/features/jobs/README.md:1798-1830` names
the four values the Roles desk shows, `draft`, `open` (with `hired / target`),
`filled` and `closed`, computed from two facts by `roleStatusOf`
(`app/features/library/jobs/jobsRoleStatus.ts:50-55`): a role is `filled` when its
hired count reaches its target *whether or not it has been retired yet*, and
`closed` only when it was retired short. The README states the reason as the
technique does: the hook runs after the hire commits, so a role sits at three of
three and still `published` for a moment, and a stored flag would contradict the
count beside it. The same derivation runs in SQL for the server-side filter
(`ROLE_STATUS_SQL`, `db/jobs.ts:607`), so the desk and the query cannot disagree.

**The hook.** `runRoleFillHook` (`stage-hooks-role-fill.ts:81-137`) is scheduled after
the stage write has committed (`stage-hooks.ts:148`, through `afterResponse`), for
the reasons in its header (`:1-33`): the hire *is* the stage move, and reconciling
the rest of the pipeline from inside the move's transaction would make its atomicity
a fiction the moment anything awaited. It re-reads the entry and compares the stage
it was told about with the stage it finds (`:89`), because a second move may have
landed in the gap. It asks the workspace's own axis whether the arrival stage has the
terminal *role* (`:98`), never whether a column is called `Hired`, and reads the hired
count from the same rollup the desk shows (`listJobPipelineStats`, `pipeline.ts:1103-1131`,
the terminal-role test at `:1128`): *"A second, private counter here is exactly how a
'2 / 3' role ends up closed."* If `hired < target` it returns `open` and does nothing
(`:109`).

**The swap.** `closeRoleIfOpen` (`db/jobs.ts:803` onward) is a single atomic statement
that re-asserts *"still open"* in its own `WHERE` and reports whether **this call**
changed a row. Only that call goes on to `closeEntriesByJobId` (`:112-120`). Its
comment counts what the loser would otherwise do: *"two withdrawal sweeps and two
role-filled announcements for one role."* The withdrawal is the same store function a
manual close calls, so the candidate timelines *"cannot tell the two closes apart,
which is correct."* A failure of the sweep after the close commits returns
`withdrawn: null` and logs (`:121-127`), which is the close route's `withdrawalFailed`
split by another name; a failure of the whole check leaves the role open for a human
(`:128-136`).

**Per team.** A seeded corpus role is one row every team sees. On 2026-09-23
(`ca1cc565e`) its status, target and languages moved into a per-team overlay
(`job_workspace_state`), because before it *"one team's first hire auto-closed the role
for every team."* The hook reads and closes the caller's team's copy
(`stage-hooks-role-fill.ts:105-108`, `:32-33`), so one team filling its seats leaves
every other team's role open.

## The A/B

Until this pass no test drove `runRoleFillHook`. The compare-and-swap underneath was
pinned in `job-workspace-state.test.ts`; the hook's own decisions were pinned
nowhere. `app/_lib/stage-hooks-role-fill.test.ts` (new, 2026-09-29) runs the real
function against a throwaway database in four cases: a one-seat role retires on its
hire, withdraws the two people in flight and leaves the hired candidate active; a
three-seat role stays live and withdraws nobody through two hires and retires on the
third, withdrawing two; two hires committing at once produce exactly one `filled` and
one `already_closed`, with each of the three in-flight candidates withdrawn once; a rejected candidate
sitting in the terminal column is not a hire (`skipped: terminal`).

Against two mutants of the same file, each made by deleting one clause:

| variant | change | result on the four cases |
| --- | --- | --- |
| A, kp as it stands | none | 4 pass |
| B1, close on the first hire | delete the `hired < target` return | 1 fails: a three-seat role at one hire came back `filled`, withdrawing the 2 people in flight for seats still open (`withdrawn: 2`, expected `open`) |
| B2, no compare-and-swap | replace `closeRoleIfOpen` with a bare `setJobStatus` | 1 fails: two concurrent hires came back `[filled, filled]`, expected `[already_closed, filled]`, i.e. two callers each believe they retired the role, and each would announce it (the second sweep finds nobody left, so the events stay correct and the damage is the duplicate action) |

n is small on purpose (four cases, one seam, one function), and B1 and B2 are the
naive versions a reasonable team writes first, not measured field defects. What it
shows is that each of the technique's two load-bearing clauses is doing work in this
code and that nothing else in the suite would have noticed either being removed.

## Where the repo falls short of the standard

- **The hired count reads the stage, not the status.** `listJobPipelineStats` counts
  every row at a terminal-role stage (`pipeline.ts:1128`), while the hook checks the
  status of only the *triggering* entry (`stage-hooks-role-fill.ts:88`). An entry that
  sits in the terminal column with a terminal status of its own (a rejected or declined
  row) would still count toward the target. Whether the product can produce that state
  was not traced; the test in this pass pins the triggering-entry case only.
- **A hire that falls through does not reopen anything.** The count drops below the
  target and the role stays closed, which is what the technique says (it is a reopen
  decision, a new span), but nothing surfaces it: a `closed` role short of its target
  shows as `closed` and not as "closed, and now short one".
- **The pre-close count is not shown on a manual close** (see the close application);
  an automatic close has no confirm step, so the recruiter learns of a fill-driven
  withdrawal from the count of `role_closed` events afterwards.
