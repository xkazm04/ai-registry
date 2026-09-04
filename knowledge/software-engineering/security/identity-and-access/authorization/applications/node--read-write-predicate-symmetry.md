---
layer: application
type: application
subject: authorization
technique: read-write-predicate-symmetry
stack: node
status: forged
verified_on: 2026-09-01
verified_against: node@24
---

# Job lifecycle writes in a multi-workspace hiring platform

A server-rendered hiring product where every job row is either **authored by
a workspace** or part of a **seeded corpus shared by all of them**
(`workspace_id NULL`). The list query encodes that as one predicate; the
by-id lifecycle writes did not, until a landed fix made them.

## The read predicate, and the exemption that leaked

`jobVisibleToWorkspace` (`app/_lib/db/jobs.ts:518-526`) is the named
predicate — "the by-id form of listJobs' `(workspace_id IS NULL OR
workspace_id = @workspaceId)` predicate". It exists because a point fetch
"can't hand out what the list wouldn't".

The write side had no such thing. `setJobStatus` is "a bare by-id UPDATE
with no workspace predicate", and the tenancy scan
(`app/_lib/db/jobs-tenancy.test.ts`) exempted it as a by-id point op — an
exemption argued on read-only reasoning. Commit `aa92946b`
(*feat(jobs): job-lifecycle-ownership*, 2026-07-27) names what that bought:

> Workspace B could dark A's live role, or force A's draft live on B's
> quota (publish then reopened A's withdrawn entries into B's scope).

Exactly the technique's shape: the visibility rule lived on the read, the
mutation addressed rows by identifier, and nothing connected them.

## Same terms, one named predicate

The fix does not re-derive the clause at the write sites. It introduces a
second *named* predicate that resolves the first:

```ts
export function canWriteJobLifecycle(id: string, workspaceId: string): boolean {
  // Same predicate as visibility: a team may retire/adopt exactly the roles it can see.
  return jobVisibleToWorkspace(id, workspaceId);
}
```

(`app/_lib/db/jobs.ts:512-515`.) Its docblock (`:496-511`) records the
deliberate reach decision rather than leaving it to be inferred: seeded
corpus rows stay writable by every tenant because "publishing one is how a
tenant adopts a corpus role", so "only an OTHER tenant's AUTHORED job is
rejected". It also names the residual the technique asks for, verbatim:

> the `status` column on a seeded row is itself shared, so one tenant
> closing a corpus role affects all — that needs per-tenant lifecycle state
> on shared rows, not an ownership check.

## The raw-fact helper, split out

The check could not be built on the ownership helper that already existed.
`getJobWorkspace` (`:481-483`) answers "where do this job's applicants go?"
and folds both *shared* and *unknown* into the default workspace. The fix
extracted `getJobOwnerWorkspace` (`:490-493`) as the three-outcome fact,
with the reason stated at the site:

> it destroys exactly the distinction an ownership CHECK needs (a seeded
> corpus job is shared by every tenant; the default workspace is one tenant
> among many)

`getJobWorkspace` now derives from it, not the reverse — the ordering the
technique demands.

## The refusal is borrowed

Every gated write answers with the read path's answer. `GET
/api/jobs/[id]` refuses an invisible or unknown job with the same
`{ error: "Job not found." }` at 404 (`app/api/jobs/[id]/route.ts:20-22`),
and the writes copy it byte for byte:

- `app/api/jobs/[id]/close/route.ts:28` — "404 (not 403) so the endpoint
  doesn't confirm that another tenant's id exists."
- `app/api/jobs/[id]/publish/route.ts:33` — the same body, same rationale.
- `app/api/channels/webhooks/route.ts:47-49` — "same gate and same 404 as
  GET /api/jobs/[id]".
- `app/api/devcase/skill-profile/route.ts:25-28` — "Same 404 body as a
  genuinely missing submission — this must not be an oracle."
- `app/api/devcase/submit/route.ts:38-41` — refuses an unowned posting with
  the *validation* error body a request with no posting id gets, so the
  refusal is indistinguishable from a malformed call.

Two behavioral tests assert the borrowing rather than the status alone:
`app/api/devcase/submit/route.test.ts:102-107` and
`app/api/devcase/skill-profile/route.test.ts:124` both drive an unknown id
and assert the same 404 an unowned one gets.

## Gate before the spend

The ordering rule is asserted structurally, not left to review.
`app/api/jobs/lifecycle-signals.test.ts:73-83` requires the ingest gate to
precede the model call:

> `assert.ok(gateAt > 0 && spendAt > gateAt, "the gate must precede the LLM
> parse — a refused ingest must not spend")`

`app/_lib/db/jobs-tenancy.test.ts:54-67` does the same for the mutation:
the gate must appear before `setJobStatus(` in both lifecycle routes. The
channels contract test (`app/api/channels/channels-receiver-contract.test.ts:106-112`)
adds a third, including the explicit "404, not 403 — same answer as an
unknown id".

## The enumeration

`app/api/jobs/lifecycle-signals.test.ts:88-95` loops the four by-id routes
that spend and return job-derived content (`campaign`, `winnability`,
`rediscover`, `agent-fit`) and asserts each "re-applies the list's
visibility predicate" and 404s. `app/api/jobs/ingest/route.ts:36-37` closes
the by-id *upsert* — an `ON CONFLICT UPDATE` that would otherwise let team
B rewrite team A's live opening while the row keeps A's `workspace_id`.

What the enumeration is not yet: **generated**. It is four literal route
names in a loop plus two hand-written route pairs, so a fifth by-id job
route added tomorrow is uncovered and nothing goes red — the technique's
"listable set" is listed by hand here. The scan that already walks the jobs
table for unscoped queries (`jobs-tenancy.test.ts`) is the natural place to
derive it from the route tree instead.
