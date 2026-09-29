---
layer: application
type: application
subject: requisition-lifecycle-governance
technique: closing-withdraws-candidates-in-flight
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# The close cascade in `app/api/jobs/[id]/close/route.ts` and `app/_lib/db/pipeline.ts`

Every line citation below was re-resolved on 2026-09-29 against kp at `006bf7a0a`.
The first version of this page (2026-08-20) cited a tree that has since moved: the
close route gained a per-team lifecycle overlay on 2026-09-23 (`ca1cc565e`), the
cascade's two write predicates were tightened, and a fill hook now calls the same
cascade. The account of the design is unchanged; the numbers are not.

This role lifecycle was originally a one-way ratchet — `NULL`/`draft` →
`published`, full stop. The route's header comment states what that cost:
*"a filled role kept its apply link live, kept appearing open in the catalog, and
kept being ranked against the pool"* (`close/route.ts:9-12`). The closed state and
its cascade were added together, which is the right pairing: the state exists to
stop counting the role, the cascade exists to stop stranding its people.

## The cascade

`POST /api/jobs/[id]/close` (`close/route.ts:13-57`) is deliberately an
*"idempotent mirror of /publish"* (`:12`). It reads the current status as the
caller's team sees it (`:33`), and only on a real transition (`:40`) flips the
status and then withdraws:

```ts
setJobStatus(id, "closed", ws);
try { withdrawn = closeEntriesByJobId(id, ws); }
catch (e) { withdrawalFailed = true; console.error(...); }
```

`closeEntriesByJobId` (`app/_lib/db/pipeline.ts:880-937`) is the cascade itself, and
it is a single `db.transaction`. It selects every entry for the job that is
`status = 'active'` and not at the terminal stage (`:890-895`) — the standard's
"still in flight, not merely non-final": the hired candidate out of this very
requisition is left active on purpose. The terminal stage is resolved by its
**role** on the workspace's own board (`:888`), never the literal word `Hired`,
because on a board whose terminal column carries another id a name comparison
spares nobody and the close withdraws the very candidate the role was filled with.
Each row is updated to `status='role_closed'` and given an event (`kind:
"role_closed"`, detail `roleClosedWithdrawn`, `:922-931`), with `fromStage ===
toStage` because the close touches the outcome and never the stage.

Since the first version the `UPDATE` re-asserts **both** predicates the `SELECT`
filtered on, `status='active' AND stage != <terminal>` (`:915-920`). The comment at
`:898-914` gives the reason, and it is a small lesson worth keeping: the transaction
is deferred, so the write lock arrives at the first write, and anything the select
read can move under the loop. The status half stops a human merit reject landing
mid-window from being overwritten. The stage half is the worse one: *a hire is a
stage move, not a status move*, so a recruiter dropping someone onto the terminal
column between the select and this row's write satisfied `status='active'` and got
withdrawn from the role they were hired into.

## The distinct terminal kind, and what it buys

`role_closed` is one of five entry statuses (`app/_lib/pipeline-status.ts:41`,
pinned at `pipeline-status.test.ts:20`) and one of four terminal ones (`:48`,
`:31`). The comment at `pipeline.ts:872-879` names the payoffs the standard argues
for: a *distinct terminal status — they cleared the bar but lost the role to
timing, NOT a merit reject, so reject-rate stays honest and they resurface as
rediscovery silver medalists*.

The reversibility payoff is spelled out where the inverse lives.
`reopenEntriesByJobId` (`:961-992`) restores `role_closed → active` with a
`role_reopened` event per entry, in one transaction, and its comment (`:952-960`)
is the clearest statement of the invariant anywhere in the repo:

> `role_closed` is a DISTINCT terminal status written ONLY by
> `closeEntriesByJobId`, so `status='role_closed'` selects exactly the entries
> this close withdrew and NOTHING else — a candidate a recruiter
> `rejected`/`declined`/`rematched` on merit BEFORE the close carries a
> different terminal status and is deliberately left closed (a reopen must
> never un-do a human's merit reject).

The close never touches `stage`, so restoring `status` alone returns each
candidate to their exact pre-close stage, and the `AND status='role_closed'` guard
on the `UPDATE` (`:974`) makes a lost race a no-op. The incident behind it is at
`:944-951`: reopen used to be *"publish again and let sourcing incidentally
un-terminal whatever the matcher re-selects"*, which stranded the rest with a lying
timeline and no audit event.

The distinct kind now pays a fourth time, in a place nobody designed it for. The
feedback-letter policy (`app/_lib/interview-letter-policy.ts:136-137`) refuses a
letter to a `role_closed` entry with the reason `not_decided_about_candidate`, and
its header explains why (`:21-23`): the status page reads `role_closed` as "not
selected", *"but nobody decided about THIS candidate"*, so there is no interview
judgement to report. A generic rejection could not have been told apart from a
human decision here. `decision-attribution.ts:160` records `role_closed` as
`auto: false`, so it is not presented as an automated adverse decision.

## Reopen is one route, and it restores at any age

The reopen is reached through the publish route: when the transition is
`closed → published` (`classifyPublish().wasClosed`), `publish/route.ts:171-173`
calls `reopenEntriesByJobId` before sourcing runs, so the pipeline is made whole
even if sourcing errors. That is the standard's "deterministic and up front".

It is also where the standard's newer distinction bites. The route restores every
`role_closed` entry whatever the elapsed time, with no approval step and no check
on whether a candidate has been shown the ending, while `application-status.ts:84`
maps `role_closed` to the candidate-visible `not_selected` the moment it is
written. A candidate who opened their status page after the close saw "not
selected", and a reopen a fortnight later flips it back to active with no message
in either direction. That is the *undone ending*: correct for a misclick, wrong for
a close that stood. The standard's line is exposure, not elapsed time, and this
system has no queued message to cancel, so today its window for a clean undo is
close to zero.

## The scoping incident

`close/route.ts:15-20` records the silent-stranding failure the standard warns
about, in its exact form: the status write is a bare by-id `UPDATE` while the
withdrawal is workspace-scoped, and before `currentWorkspace()` was threaded
through, `closeEntriesByJobId` *"fell to `DEFAULT_WORKSPACE_ID` and withdrew NONE
of a non-default team's in-flight candidates — the close 'succeeded' with
`withdrawn:0` while the funnel kept chasing a retired role."* Two scopes on one
operation, disagreeing, reporting success.

The ownership gate at `:24-29` closes the other half — without it *"workspace B
could dark workspace A's live role"* — and returns 404 rather than 403 so the
endpoint does not confirm another tenant's ids exist. The 2026-09-23 change
extended the same discipline to the shared corpus: a seeded role is one row every
team sees, its status now lives in a per-team overlay, and the close is the caller's
team's (`:30-32`), so one team retiring a role no longer retires it for the rest.

## Reporting it honestly

`withdrawalFailed` (`:35-39`) exists because *"'nobody was in flight' and
'withdrawing them broke' were the same `ok:true`/`withdrawn:0` response and the UI
rendered neither."* The three outcomes render distinctly in
`JobsPostingModalFooter.tsx:81-93`: an amber warning when the role is closed but its
people are not, `withdrewCount` when the cascade moved someone, and a plain
`closedNow` confirmation for the honest zero.

## The candidate-facing end of it

`app/_lib/application-status.ts:84` maps `role_closed`, alongside `rejected` and
`rematched`, to the candidate-visible `not_selected`, with the comment at `:72-76`
marking it a company-side close. That is the sibling standard's settled answer — a
closed requisition reads as not selected without implying anything about merit.

## Where the repo falls short of the standard

- **The close is not atomic with its cascade.** `setJobStatus` commits (`:41`), then
  the withdrawal runs in a `try/catch` (`:46-51`); a throw between them leaves the
  requisition closed and its people in flight. The repo mitigates by surfacing
  `withdrawalFailed` rather than logging it, which is the right mitigation, but the
  standard's rule stands: the status change and the termination belong in one
  transaction, and only the *communication* is allowed to be asynchronous. The
  fill hook has the same shape on purpose (see the fill application).
- **No communication is queued.** The cascade writes terminal outcomes and events;
  nothing emits a message to the withdrawn candidates. The status projection is the
  only way a candidate learns anything. This is also what makes the reopen window
  above close to zero: there is no queued message to cancel and no "sent" moment to
  hold the line at.
- **The pre-close count is not shown on the jobs close.** The confirm dialog
  (`JobsPostingModal.tsx:160`, copy `closeConfirm`) says candidates "will be
  withdrawn" without saying how many; the recruiter learns the number afterwards
  (`jobsPostingModalLogic.ts:83`). The neighbouring assignment lifecycle already
  computes one before its confirm (`DevLifecycleRow.tsx:83`, `closeWarning(inFlight,
  ...)`), so the one-query guard exists in the codebase and has not been carried
  over.
