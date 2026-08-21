---
layer: application
type: application
subject: requisition-lifecycle-governance
technique: closing-withdraws-candidates-in-flight
stack: node
status: forged
verified_on: 2026-08-20
---

# The close cascade in `app/api/jobs/[id]/close/route.ts` and `app/_lib/db/pipeline.ts`

This role lifecycle was originally a one-way ratchet — `NULL`/`draft` →
`published`, full stop. The route's header comment states what that cost:
*"a filled role kept its apply link live, kept appearing open in the catalog,
and kept being ranked against the pool"* (`close/route.ts:8-11`). The closed
state and its cascade were added together, which is the right pairing: the
state exists to stop counting the role, the cascade exists to stop stranding
its people.

## The cascade

`POST /api/jobs/[id]/close` (`close/route.ts:12-52`) is deliberately an
*"idempotent mirror of /publish"* (`:11`). It reads the current status, and
only on a real transition (`:36`) does it flip the status and then withdraw:

```ts
setJobStatus(id, "closed");
try { withdrawn = closeEntriesByJobId(id, ws); }
catch (e) { withdrawalFailed = true; console.error(...); }
```

`closeEntriesByJobId` (`app/_lib/db/pipeline.ts:552-578`) is the cascade
itself, and it is a single `db.transaction`. It selects every entry for the job
that is `status = 'active' AND stage != 'Hired'` (`:559`) — the standard's
"still in flight, not merely non-final": the hired candidate out of this very
requisition is left active on purpose. Each row is updated to
`status='role_closed'` and gets a recorded event
(`kind: "role_closed"`, `detail: "Role closed — candidate withdrawn from the
pipeline."`, `:563-573`), with `fromStage === toStage` because the close
touches the outcome and never the stage.

## The distinct terminal kind, and what it buys

`role_closed` is one of five entry statuses (`app/_lib/pipeline-status.test.ts:20`)
and one of four terminal ones (`:31`). The comment at `pipeline.ts:546-548`
names all three payoffs the standard argues for in one sentence: it is
*"a DISTINCT terminal status — they were not passed over, so their rejection
reason stays honest and they resurface as rediscovery silver medalists"*.

The reversibility payoff is spelled out where the inverse lives.
`reopenEntriesByJobId` (`:580-620`) restores `role_closed → active` with a
`role_reopened` event per entry, in one transaction, and its comment
(`:593-601`) is the clearest statement of the invariant anywhere in the repo:

> `role_closed` is a DISTINCT terminal status written ONLY by
> `closeEntriesByJobId`, so `status='role_closed'` selects exactly the entries
> this close withdrew and NOTHING else — a candidate a recruiter
> `rejected`/`declined`/`rematched` on merit BEFORE the close carries a
> different terminal status and is deliberately left closed (a reopen must
> never un-do a human's merit reject).

Two mechanics follow directly: *"The close never touched `stage` (only
`status`), so restoring `status` alone returns each candidate to their exact
pre-close stage"*, and the `AND status='role_closed'` guard on the `UPDATE`
makes a lost race a no-op. The reason it exists at all is the incident at
`:585-591` — reopen used to be *"publish again and let sourcing incidentally
un-terminal whatever the matcher re-selects"*, which left candidates the
matcher no longer returned *"stranded in `role_closed` with a lying timeline,
and there was NO audit event."*

## The scoping incident

`close/route.ts:14-18` records the silent-stranding failure the standard warns
about, in its exact form: the status write is a bare by-id `UPDATE` while the
withdrawal is workspace-scoped, and before `currentWorkspace()` was threaded
through, `closeEntriesByJobId` *"fell to `DEFAULT_WORKSPACE_ID` and withdrew
NONE of a non-default team's in-flight candidates — the close 'succeeded' with
`withdrawn:0` while the funnel kept chasing a retired role."* Two scopes on one
operation, disagreeing, reporting success.

The ownership gate at `:23-28` closes the other half — without it *"workspace B
could dark workspace A's live role"* — and returns 404 rather than 403 so the
endpoint does not confirm another tenant's ids exist.

## Reporting it honestly

`withdrawalFailed` (`:31-35`) exists because *"'nobody was in flight' and
'withdrawing them broke' were the same `ok:true`/`withdrawn:0` response and the
UI rendered neither."* The three outcomes now render distinctly in
`JobsPostingModalFooter.tsx:76-86`: an amber warning when the role is closed but
its people are not, `withdrewCount` when the cascade moved someone, and a plain
`closedNow` confirmation for the honest zero — *"`withdrawn:0` is a real outcome
(nobody was in flight) and used to render NOTHING — indistinguishable from a
failed close."*

## The candidate-facing end of it

`app/_lib/application-status.ts:67` maps `role_closed`, alongside `rejected` and
`rematched`, to the candidate-visible `not_selected`, and the comment at `:55-58`
marks it as *"a company-side close"*. That is exactly the sibling standard's
settled answer — a closed requisition reads as not selected without implying
anything about merit — and `application-status.test.ts:22-24` pins it.
`decision-attribution.ts:130` records `role_closed` as `auto: false`, so it is
not presented as an automated adverse decision.

## Where the repo falls short of the standard

- **The close is not atomic with its cascade.** `setJobStatus` commits, then the
  withdrawal runs in a `try/catch` (`close/route.ts:37-47`); a throw between
  them leaves the requisition closed and its people in flight. The repo mitigates
  by surfacing `withdrawalFailed` rather than logging it, which is the right
  mitigation — but the standard's rule stands: the status change and the
  termination belong in one transaction, and only the *communication* is
  allowed to be asynchronous.
- **No communication is queued.** The cascade writes terminal outcomes and
  events; nothing emits a message to the withdrawn candidates. The standard
  requires the queued communication as part of the close, and the honest status
  projection is currently the only way a candidate learns anything.
- **The pre-close count is not shown.** The recruiter learns how many people the
  close ended *after* confirming (`jobsPostingModalLogic.ts:54-56`,
  `closedCount`). "Closing this role will end the process of eleven people" is a
  one-query correction available before the confirm dialog, and it is the
  cheapest guard against a careless close.
