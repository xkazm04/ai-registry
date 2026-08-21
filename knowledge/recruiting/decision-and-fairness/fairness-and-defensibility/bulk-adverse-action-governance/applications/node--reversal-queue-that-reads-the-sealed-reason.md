---
layer: application
type: application
subject: bulk-adverse-action-governance
technique: reversal-queue-that-reads-the-sealed-reason
stack: node
status: forged
verified_on: 2026-08-20
---

# A reconsider queue over auto-rejections

`app/_lib/db/pipeline.ts:846` opens the section: "The screening wave auto-rejects the
bottom cohort and the rejection is terminal — no undo path, and the candidate already got
a (queued) rejection email." Two SQLite-backed functions and one collapsed panel are the
whole mechanism.

## Membership is decided by the actor, not the status

`listReconsiderQueue` (`pipeline.ts:860`) joins `pipeline_entries` against
`pipeline_events` on `ev.kind = 'auto_rejected'`, filters `e.status = 'rejected'`,
`GROUP BY e.id`, and orders by `MAX(ev.created_at) DESC`:

```sql
JOIN pipeline_events ev ON ev.entry_id = e.id AND ev.kind = 'auto_rejected'
WHERE e.status = 'rejected' AND e.workspace_id = ?
```

The join is the rule: "a manual human reject is a deliberate decision, not a queue item".
The `GROUP BY` dedups an entry auto-rejected more than once and `MAX(created_at)` gives
its latest rejection. Note the upstream half that makes this queryable at all — the wave
writes exactly **one** `auto_rejected` event with `actor: "system"`
(`screen-wave.ts:387-392`); the earlier shape wrote both a `rejected` act event and a
separate automation event, counting every wave reject once as human and once as
automated.

## Reinstatement

`reinstatePipelineEntry` (`pipeline.ts:886`) runs in a transaction, guards on
`row.status !== "rejected"` (so a double-click or a stale view is a no-op rather than
churn), returns the entry to `active` at `Screened`, clears any approval, and records a
`reinstated` reversal event. Its third parameter is the accountability contract:

```ts
// a reversal is the single most accountability-bearing act on this surface (a person
// overruling the machine), so it takes the caller's server-derived actor and seals it to
// THAT person. Omitted ⇒ "not identified"; never inherited from the auto_rejected row it
// reverses, which was written by the machine.
actorRef?: string | null
```

The original rejection is never deleted — the entry keeps its `auto_rejected` event and
gains a `reinstated` one, so the reversal is visible as a reversal.

`app/api/pipeline/[id]/route.ts:101-122` also seals the reversal into the tamper-evident
decision chain (`kind: "reinstated"`), best-effort, because "recording only a pipeline
event for the reinstate left the chain showing a rejection with no record it was
overturned". Reinstatement deliberately does **not** re-notify the candidate; a follow-up
message is a recruiter decision.

## Reading the sealed reason back

The queue panel (`app/features/hiring/decisions/DecisionsReconsiderQueue.tsx`) is a
collapsed-by-default `details` region rendering each row with its rejection date, its
score provenance, and `reconsiderReasonText(r)` built from the stored
`{ reasonCode, reasonParams }` (`decisionsQueueTypes.ts:12`) — the sealed reason, not a
re-derivation.

The same discipline governs what the candidate sees:
`docs/features/compliance/README.md:130-139` records that
`app/_lib/status-decisions.ts` derives a redacted `CandidateDecisionView` (kind,
attribution, reason code, and for `auto_rejected` only the threshold facts that were
actually decisive) from the same sealed rows — "rejection reasons shown to candidates come
from this sealed record, never freshly generated". A reinstatement renders with
`attribution: "human"` (`app/api/status/status-decisions.test.ts:113`).

## The delivery seam

A committed rejection whose notification failed to queue is addressable per row via
`commsFailed` on the decision (`screen-wave.ts:48-51`), mirroring the
`rejection_comms_failed` audit event — the wave completed, but "the candidate is out of
the funnel and needs a manual nudge". The aggregate `commsFailures` count alone would not
be actionable.

## Deviations from the standard

- **The reversal seals to a role, not a person.** The route calls
  `reinstatePipelineEntry(id, ws)` without the `actorRef` the function accepts, and seals
  `actor: "human:recruiter"` (`route.ts:116`). The mechanism for naming the individual
  exists and is not wired; the standard requires the identified human.
- **Reinstated candidates are not excluded from the next wave.** Nothing marks an entry
  reinstated-by-a-human as ineligible for automated adverse action, so a person a
  recruiter put back at `Screened` can be re-rejected by the next run of the same rule
  unless their score changed.
- **No reversal-rate metric.** The queue is a working list; the per-reason-code and
  per-family reversal rates the standard treats as the pipeline's error rate are not
  computed anywhere.
