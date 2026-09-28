---
layer: application
type: application
subject: bulk-adverse-action-governance
technique: reversal-queue-that-reads-the-sealed-reason
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
---

# A reconsider queue over auto-rejections

`app/_lib/db/pipeline.ts:1245-1251` opens the section: "The screening wave auto-rejects
the bottom cohort and the rejection is terminal — no undo path, and the candidate already
got a (queued) rejection email." Two SQLite-backed functions, one shared SQL predicate,
one route guard and one collapsed panel are the whole mechanism. Every citation below is
pinned to a single commit of the app, read on 2026-09-26.

## Membership is decided by the newest decision, not the status

The rule lives once, as a correlated SQL predicate (`pipeline.ts:1321-1323`):

```sql
(SELECT kind FROM pipeline_events
   WHERE entry_id = e.id AND workspace_id = @ws AND kind IN ('auto_rejected', 'rejected', 'reinstated')
   ORDER BY created_at DESC, id DESC LIMIT 1) = 'auto_rejected'
```

An entry is reversible only while its **newest** decision event is the machine's
`auto_rejected`. `listReconsiderQueue` (`pipeline.ts:1335-1365`) filters
`e.status = 'rejected'` by that predicate, takes `rejected_at` as a correlated
`MAX(created_at)` over the entry's `auto_rejected` events, and orders by it, newest
first. Its doc comment states the rule: "A human reject — including one after a
reinstate — is a deliberate decision, not a queue item" (`:1332-1334`). So an entry
auto-rejected, reinstated, then rejected by a recruiter is not listed; one auto-rejected
again after a reinstate is.

The same predicate backs `newestDecisionIsAutoRejection` (`:1326-1330`), which the
reinstate door calls before doing anything, so the queue never offers a reversal the door
would refuse. The upstream half that makes this queryable at all: the wave writes exactly
**one** `auto_rejected` event with `actor: "system"` (`screen-wave.ts:578-582`); the
earlier shape wrote both a `rejected` act event and a separate automation event, counting
every wave reject once as human and once as automated.

The function also returns `total`, a `COUNT(*)` over the same filtered set
(`:1341-1350`), and the route cuts the page at 50: `listReconsiderQueue(50, ws)`, with
`truncated: total > 50, total` in the response (`app/api/decisions/reconsider/route.ts:23`,
`:72`).

## Reinstatement

The door is `app/api/pipeline/[id]/route.ts:118-163`. It first refuses
`409 PIPELINE_NOT_REINSTATABLE` unless `newestDecisionIsAutoRejection(id, ws)`
(`:128-130`): the store's own guard reads status alone, which a recruiter's hand reject
also satisfies, and the record sealed below says "Auto-rejection reversed", so writing it
over a human decision "would put a false sentence into the tamper-evident chain"
(`:119-127`). A hand reject is reopened through the human re-add door instead.

`reinstatePipelineEntry` (`pipeline.ts:1375-1424`) then runs in an immediate
transaction, guards on `row.status !== "rejected"` (`:1399`, so a double-click or a stale
view is a no-op, and the route answers it with the same `409`, `:142-144`), returns the
entry to `active` on the workspace's screened landing column
(`screenedLandingStage(...) || "Screened"`, `:1390`), clears any approval, and records a
`reinstated` reversal event. Its third parameter is the accountability contract:

```ts
// UAT LUC-ANA-4 — a reversal is the single most accountability-bearing act on this
// surface (a person overruling the machine), so it takes the caller's server-derived
// actor and seals it to THAT person. Omitted ⇒ "not identified"; never inherited from
// the auto_rejected row it reverses, which was written by the machine.
actorRef?: string | null
```

The original rejection is never deleted: the entry keeps its `auto_rejected` event and
gains a `reinstated` one, so the reversal is visible as a reversal.

`app/api/pipeline/[id]/route.ts:145-161` also seals the reversal into the tamper-evident
decision chain (`kind: "reinstated"`), best-effort, because "recording only a pipeline
event for the reinstate left the chain showing a rejection with no record it was
overturned". The seal's inputs name the stage the store actually landed the candidate on
(`restoredStage: restored.stage`, `:160`). Reinstatement deliberately does **not**
re-notify the candidate; a follow-up message is a recruiter decision (`pipeline.ts:1372-1374`).

## Reading the sealed reason back

The route reads each entry's sealed records in one batched query and takes the latest
`auto_rejected` seal's `reasonCode` plus its sealed `inputs` as `reasonParams`
(`reconsider/route.ts:35-60`). The queue panel
(`app/features/hiring/decisions/DecisionsReconsiderQueue.tsx`) is a collapsed-by-default
`details` region (`:49`) rendering each row with its rejection date, its score
provenance, and `reconsiderReasonText(r)` (`:62`) built from the stored
`{ reasonCode, reasonParams }` (`decisionsQueueTypes.ts:12`): the sealed reason, not a
re-derivation.

The same discipline governs what the candidate sees:
`docs/features/compliance/README.md:465-470` records that
`app/_lib/status-decisions.ts` derives a redacted `CandidateDecisionView` (kind,
attribution, reason code, and the decisive `facts`) from the same sealed rows, and that
"Rejection reasons shown to candidates come **from this sealed record, never freshly
generated**". A reinstatement renders with `attribution: "human"`
(`app/api/status/status-decisions.test.ts:161`).

## The delivery seam

A committed rejection whose notification failed is addressable per row via `commsFailed`
on the decision (`screen-wave-contract.ts:75-77`), mirroring the
`rejection_comms_failed` audit event: the wave completed, but "the candidate is out of the
funnel and needs a manual nudge". Both failure signals count: a thrown dispatch and a
resolved dead letter (`screen-wave.ts:604-617`). The aggregate `commsFailures` count alone
would not be actionable.

## Deviations from the standard

- **No reversal-rate metric.** The queue is a working list; the per-reason-code and
  per-family reversal rates the standard treats as the pipeline's error rate are not
  computed anywhere.
- **The 50-row cap is flagged on the wire but never shown.** The route sends `truncated`
  and `total`, but the client keeps only `p.items`
  (`app/features/hiring/decisions/useDecisionsQueue.ts:228`), and the panel's heading
  counts `reconsider.length` (`DecisionsReconsiderQueue.tsx:56`). A wave that
  auto-rejected more than 50 people reads as exactly 50, and the rest are invisible in
  the one surface built to reverse them.

## Since first documented

### 2026-08-30 re-verification

Two of this application's original deviations had been closed in the tree by then:

- **The reversal seals to the identified person when one exists.** The reinstate handler
  resolves `const actor = await humanActor()` (`auth/operator-approver.ts:88-94`), which
  is `human:<Name>` when the session carries identity, else the same `"human:recruiter"`
  role-token fallback as before, and threads it through both halves of the record:
  `reinstatePipelineEntry(id, ws, actor)` (`route.ts:141`) and the seal's `actor` field
  (`route.ts:152`). Landed `fix(api-pipeline)` (2026-08-21, commit `89fd67cd`). An
  identity-less deployment still seals to the role token; that part of the original
  observation stands for that case.
- **Reinstated candidates are excluded from the next wave.** A "REINSTATEMENT SHIELD"
  (`screen-wave.ts:246-256`) removes any entry with a `reinstated` event
  (`entryIdsWithEvent`, `:255`) from `wouldReject` before the holdout draw and before the
  token is signed, and the row carries an explicit `"reinstated"` keep-reason. Landed
  `fix(craft-scan)` (2026-08-21, commit `62fbf833`). The commit message names the exact
  gap this application had documented: "The screening wave re-rejected candidates a
  recruiter had deliberately reinstated, and emailed them a second rejection."

### 2026-09-26 re-verification

- **The queue reports its own truncation.** `fix(hiring-decisions-api)` (2026-09-17,
  commit `6785ea0be`) made `listReconsiderQueue` return `{ items, total }` and the route
  send `truncated`/`total`. The client does not read them (see *Deviations*).
- **The reinstate door refuses anything but a live auto-rejection.** `feat(pipeline-api)`
  (2026-09-23, commit `49194ff29`) added the `409 PIPELINE_NOT_REINSTATABLE` check on the
  entry's newest decision.
- **The queue lists by the door's rule.** `fix(db-pipeline-store)` (2026-09-23, commit
  `7db88e568`) replaced the `JOIN … GROUP BY e.id` listing with the shared
  newest-decision predicate, so the queue and the door can no longer disagree.
- **A dead-lettered notice counts as a comms failure.** `feat(comms-dispatch-relay)`
  (2026-09-23, commit `d2c8b91e9`): a relay that records `failed` and returns used to be
  counted as notified.

### Corrected on re-verification

- **The earlier text said a manual human reject never enters the queue, and that "the
  join is the rule".** On 2026-08-30 the query joined on *any* `auto_rejected` event with
  `status = 'rejected'`, so an entry auto-rejected, reinstated, and then rejected by a
  recruiter stayed in the queue and offered a reversal of a human decision. Only
  first-time human rejects were excluded. `7db88e568` closed it.
