---
layer: application
type: application
subject: requisition-lifecycle-governance
technique: best-effort-ingest-with-an-explicit-retry
stack: node
status: forged
verified_on: 2026-08-20
---

# The save/ingest split in `app/api/jds/save/route.ts`

Two stores hold one role here: the `jds` table holds the description the
recruiter wrote, and the `jobs` table holds the structured, matchable record the
pipeline ranks candidates against. `POST /api/jds/save` writes both, and its
header comment states the contract in the standard's exact terms
(`route.ts:16-22`):

> saving the JD draft is authoritative (it succeeds or the whole request
> 4xx/5xx-es), but the structured-Job ingest below is best-effort.

## The split, in code

```ts
// route.ts:65-70
let jobIngested = false;
try {
  jobIngested = await ingestStructuredJob({ slug, ... }, ws);
} catch {
  /* job ingestion is best-effort — never block the JD save */
}
```

`saveJd` (`:60`) commits first and independently; the derived step runs after it
and is allowed to throw. `jobIngested` is returned to the caller
(`:72`), which is the technique's second rule — the failure is a **state on the
response**, not a log line: *"when it is false the draft exists but the matchable
`jd-<slug>` Job row does NOT"* (`:19-20`). `save-ingest-contract.test.ts` pins
both halves so the flag cannot be quietly dropped.

## The transition that depends on it refuses

Going live is `POST /api/jobs/[id]/publish`, which resolves the job by
`getJob('jd-<slug>')`. If ingest never ran, that row does not exist and the
publish *"would dead-end"* with a 404 (`route.ts:20`). The intended handling —
documented in `docs/features/jobs/README.md` — is that the builder reads the
flag, disables "Source into Pipeline" and offers an inline **Retry** that
re-POSTs the same slug, *"rather than letting the user click into that dead
end"* (`:21-22`). That is the standard's polite refusal naming its remedy.

## The retry cannot create

The retry's guarantee is enforced at the top of the same route (`:48-59`):

```ts
if (body.slug) {
  if (!loadJd(body.slug, ws)) {
    return NextResponse.json({ error: "JD not found." }, { status: 404 });
  }
  slug = body.slug;
} else {
  slug = saveJd({ title: fields.title, body: fields.body }, ws).slug;
}
```

The comment states the invariant exactly: *"a retry re-uses the existing slug so
the best-effort ingest can be re-attempted without saving a duplicate JD. Reject
an unknown retry slug so a retry can't mint a `jd-<slug>` Job with no backing
draft."* An unknown slug is a 404, not an implicit create — the repair path has
no create branch, and the workspace-scoped `loadJd` means it cannot reach across
tenants to find one either.

Note also what the ingested record lands as: `ingestStructuredJob` calls
`insertJob(..., "draft", workspaceId)` (`ingest-job.ts:53-55`) — the derived
record enters the lifecycle at draft, so a successful ingest is not itself a
go-live.

## Honest nulls, including the sort

The ledger's Pipeline column is where the never-ingested/nobody-applied
distinction lands. `JdsLedgerRow.tsx:80-102` renders the stats when a linked job
exists and a `—` (titled `noLinkedJob`) when it does not — never a `0`. The
`README` states the rule directly: *"'This JD was never ingested' and 'this role
has nobody in it yet' are different facts."*

The rule reaches the sort, which is the half most implementations miss.
`JD_SORT_ACCESSORS` (`jdsLibrary.ts:229-237`) returns `null` for a JD with no
linked job, with the reasoning in the comment: *"Null means 'no value' and sorts
LAST in both directions … Ranking it as a zero would bury real but quiet roles
beneath JDs that were never even ingested."* `JdRow.jobStatus` carries the same
three-valued honesty at the type level — *"null = no job exists yet (an
analysis-only pasted JD that can't be matched or applied to)"* (`:75-79`).

## Where the repo falls short of the standard

- **The failure state is per-response, not per-record.** `jobIngested` tells the
  caller of *this* save what happened; the `jds` row itself carries no
  "ingest failed at this time, for this reason" field. Reload the page and the
  distinction between "never ingested" and "ingest failed ten minutes ago" is
  gone — the ledger's `—` covers both. The standard asks for the failure to be
  durable on the record, with a timestamp on both halves so a stale index over an
  edited description is detectable; neither timestamp exists here.
- **The client-side retry affordance is not currently wired.** The server
  contract is live and tested, but no client under `app/features/library/jds/`
  reads `jobIngested` today, so the documented "disabled button plus inline
  Retry" is a contract without a consumer. The refusal downstream is therefore a
  404 the user meets by clicking, which is precisely the dead end the comment
  set out to prevent.
- **The ingest is swallowed silently.** The `catch` block discards the error
  entirely (`:68-70`) — nothing is logged, so a systematic ingest outage is
  invisible until roles start failing to publish one at a time.
