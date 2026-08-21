---
layer: application
type: application
subject: pipeline-aging-and-attention-triage
technique: attention-queue-ordering-and-rationale
stack: node
status: forged
verified_on: 2026-08-20
---

# Five named queues behind the sidebar badges (Node)

`app/_lib/attention.ts` is the whole technique in one server-side module. Its
header states the problem it was built for: each count "was already derivable,
but only INSIDE its own tab … so a recruiter sitting on Jobs had zero awareness
that six decisions were queued" (`:1-8`). One module computes all five; the
`/api/attention` route serves the interactive shell and `WorkspaceNav` (a server
component) calls `attentionCounts()` directly for deep-linked pages.

## Named queues, each with its rationale in the type

The queue set is not a config table — it is the `AttentionCounts` type
(`:26-44`), where every field carries the written reason it earns attention:

| Field | Predicate (`:63-73`) | Rationale in the source |
| --- | --- | --- |
| `decisions` | `status === "active" && needsHumanDecision(e.approvalKind)` | "Entries waiting on a recognized human approval gate" |
| `pipeline` | active, non-terminal role, `daysSince(stageChangedAt) >= slaForStage(stage)` | "Active entries past their stage's default aging SLA" |
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

Both questions now go through `stageHasRole(e.stage, "terminal" | "entry", axis)`
with the axis resolved once per call by `getPipelineAxis(workspaceId)` (`:62`).
`docs/features/pipeline/README.md:82` lists `attention.ts` in the table of
consumers migrated from name literals to roles, alongside a dozen others — the
rename was not a local bug but a class of bug.

Terminal exclusion is doubled exactly as the standard prescribes: the comment at
`:54` notes "listPipeline already excludes terminal (rejected/declined)
entries", and the `pipeline` predicate still checks `!stageHasRole(e.stage,
"terminal", axis)` itself.

## The closed approval taxonomy

`app/_lib/approval-kinds.ts` is the membership predicate for the highest-ranked
queue. `APPROVAL_KINDS` (`:9-16`) is a closed six-value set — `decision`,
`screening_review`, `scorecard_review`, `rejection_review`, `offer_review`,
`calendar` — introduced because "the values used to be free-form strings
scattered across `seed_pipeline.py`, `db.ts` and the pipeline routes with no
central definition of the full set" (`:1-7`). `needsHumanDecision` (`:26-28`) is
the any-recognised-kind rule, and its docstring states the guard the standard
asks for: it "rejects an unrecognized kind so a typo can't masquerade as a real
gate."

The mirror-image cost the standard names — an unrecognised kind silently
*omitting* an entry from the queue that outranks everything else — is not
counted or surfaced anywhere in this module. The standard's pairing
requirement (write-site validation plus an observed count of unrecognised
values) stands unmet here.

## Boundaries honoured

`schedule` delegates to `countFutureConfirmedInvites` in `schedule-store` rather
than recomputing invitation liveness — the seam the standard insists on, whose
cost is documented on the other side of it in
`app/features/hiring/schedule/scheduleInviteLifecycleBuckets.ts:5-13`, where a
confirmed interview "VANISHED from the entire panel the instant its start
passed" until a four-hour `RECENT_WINDOW_MS` grace bucket was added.

## Deviations from the standard

- **No per-queue caps and no cross-queue ranking here.** The module returns five
  scalars; ranking lives in whatever renders them. The counts cannot say
  *which* rows, so the "rationale travels with the row" rule is only satisfied
  at the tab the badge deep-links into.
- **The board strip carries two queues, not five.**
  `app/features/hiring/pipeline/PipelineAttentionStrip.tsx:1-15` ranks degraded
  intakes above awaiting-you approvals; the other three queues exist only as nav
  badges.
- **Unrecognised approval kinds are unobserved**, as above.
