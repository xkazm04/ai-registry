---
layer: application
type: application
subject: pipeline-aging-and-attention-triage
technique: attention-queue-ordering-and-rationale
stack: node
status: forged
verified_on: 2026-09-29
---

# Five named queues behind the sidebar badges (Node)

`app/_lib/attention.ts` is the whole technique in one server-side module. Its
header states the problem it was built for: each count "was already derivable,
but only INSIDE its own tab … so a recruiter sitting on Jobs had zero awareness
that six decisions were queued" (`:1-8`). One module computes the counts; the
`/api/attention` route serves the interactive shell and `WorkspaceNav` (a server
component) calls `attentionCounts()` directly for deep-linked pages.

Re-read 2026-09-29: the module grew a sixth key, `companion` (proposals the
companion made that nobody has answered), and the `pipeline` predicate no
longer hand-rolls its clock. Both are described below. The five-row table keeps
its rows; the `pipeline` row's predicate changed.

## Named queues, each with its rationale in the type

The queue set is not a config table — it is the `AttentionCounts` type
(`:26-44`), where every field carries the written reason it earns attention:

| Field | Predicate (`:63-73`) | Rationale in the source |
| --- | --- | --- |
| `decisions` | `status === "active" && needsHumanDecision(e.approvalKind)` | "Entries waiting on a recognized human approval gate" |
| `pipeline` | `attentionStale`: active and `agingTierAt(stage, stageChangedAt, now, axis) !== "none"` | "Active entries past their stage's aging SLA: the team's own cadence (`slaDays` on the stage axis) where set, else the stage role's default" |
| `schedule` | `countFutureConfirmedInvites()` | "confirmed interviews whose slot lies in the future" |
| `jobs` | job status `=== "draft"` | "Ingested roles still sitting unpublished as drafts" |
| `channels` | active and on an `entry`-role stage | "Fresh inbound … so the nav signals new arrivals without the recruiter camping on the tab" |

The keys "deliberately match `tabs.ts` `badgeKey` values — the mapping from
count to nav item is declarative, not positional" (`:9-10`), which is the
standard's one-selection-one-reason rule realized as a key contract rather than
an ordering convention.

## The rename incident

`:56-61` records the failure the standard warns about, in both directions from
one cause:

> The two stage questions below are about MEANING — "have they finished?" and
> "have they only just arrived?" — so they resolve through this workspace's own
> axis roles. Reading the literals "Hired" and "Accepted" made both badges
> silently wrong for a team that renamed its columns: a finished candidate would
> be counted as aging forever, and the Channels badge would read zero.

Both questions still resolve through the workspace's axis, resolved once per call
by `getPipelineAxis(workspaceId).stages`. The `channels` count asks
`stageHasRole(e.stage, "entry", axis)` directly (`:79`); the terminal question now
lives inside `agingTierAt`, so the `pipeline` predicate no longer carries its own
role check. The rename was not a local bug but a class of bug, and the project's
pipeline README lists this module among the consumers migrated from name
literals to roles.

Terminal exclusion is still doubled: `listPipeline` already excludes terminal
(rejected/declined) entries, and `agingTier` returns `none` for a terminal-role
stage and for any non-positive SLA. The second clause is the one that matters
after a retirement: `attentionStale`'s own comment records that a workspace which
renamed its terminal column and retired the id "Hired" would otherwise count every
already-hired entry (stage `Hired`, status `active`) as aging from day zero,
forever.

## One aging clock

Before 2026-09-23 this predicate was hand-rolled beside two other copies of the
same question (the board's amber dot and the policy pass's flat cut), and they
disagreed. `attentionStale` now delegates to `app/_lib/aging-policy.ts`, the same
function the board and the automation pass read, so the badge count and the rows a
recruiter finds on the board cannot drift. The two-tier detail is in the process
application; the point for this technique is that the queue's `pipeline`
membership is a single named predicate with one definition.

## The closed approval taxonomy

`app/_lib/approval-kinds.ts` is the membership predicate for the highest-ranked
queue. `APPROVAL_KINDS` (`:9-16`) is a closed six-value set — `decision`,
`screening_review`, `scorecard_review`, `rejection_review`, `offer_review`,
`calendar` — introduced because "the values used to be free-form strings
scattered across `seed_pipeline.py`, `db.ts` and the pipeline routes with no
central definition of the full set" (`:1-7`). `needsHumanDecision` (`:27`) is
the any-recognised-kind rule via `isApprovalKind`, and its docstring states the
guard the standard asks for: it rejects an unrecognized kind so a typo can't
masquerade as a real gate.

The mirror-image cost the standard names — an unrecognised kind silently
*omitting* an entry from the queue that outranks everything else — is still not
counted or surfaced in this module, and a search of the app tree on 2026-09-29
found no consumer that counts unrecognised approval kinds. The standard's pairing
requirement (write-site validation plus an observed count of unrecognised
values) stands unmet here.

## A sixth key that is deliberately not a queue

`companion` (open companion proposals) is the only key with no `badgeKey` on any
tab, and the source says why it is not folded into `decisions`: that count beacons
the dock orb whose one click routes to the Decisions tab, and that tab has no
affordance that can resolve a companion proposal, so "a number whose only
affordance clears nothing" would be a queue nobody can empty. It is the standard's
reachable-empty rule applied to queue *membership*, not just to terminal rows.

## Boundaries honoured

`schedule` delegates to `countFutureConfirmedInvites` in `schedule-store` rather
than recomputing invitation liveness — the seam the standard insists on, whose
cost is documented on the other side of it in
`app/features/hiring/schedule/scheduleInviteLifecycleBuckets.ts:5-13`, where a
confirmed interview "VANISHED from the entire panel the instant its start
passed" until a four-hour `RECENT_WINDOW_MS` grace bucket was added.

## Deviations from the standard

- **No per-queue caps and no cross-queue ranking here.** The module returns
  scalars; ranking lives in whatever renders them. The counts cannot say
  *which* rows, so the "rationale travels with the row" rule is only satisfied
  at the tab the badge deep-links into.
- **The ranked board strip is gone.** `PipelineAttentionStrip.tsx`, which used to
  merge two queues into one ranked list above the board, was deleted on
  2026-09-25 with the old board view (`b7fde0c32`). The replacement kit view
  orders its groups by an `attention` number (`orbitModel.ts`: waiting first, then
  aging, then the rest, as a weighted sum), which is a blended ordering rather
  than named queues each carrying a sentence. I did not read that view's row-level
  rationale, so whether each row states why it is listed is not evaluated here.
- **Unrecognised approval kinds are unobserved**, as above.
