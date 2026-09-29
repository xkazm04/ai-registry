---
layer: application
type: application
subject: requisition-lifecycle-governance
technique: best-effort-ingest-with-an-explicit-retry
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# The save/ingest split in `app/api/jds/save/route.ts`, and where the retry lives now

Every line citation below was re-resolved on 2026-09-29 against kp at `006bf7a0a`.
The design survived; two of the three shortfalls recorded on 2026-08-20 are
closed, one of them by a different mechanism than the one the standard describes,
and the honest-null sort this page used to document has left the tree. Those
changes are the substance of this revision.

Two stores hold one role here: the `jds` table holds the description the recruiter
wrote, and the `jobs` table holds the structured, matchable record the pipeline
ranks candidates against. `POST /api/jds/save` writes both, and its header comment
states the contract in the standard's exact terms (`route.ts:26-32`):

> saving the JD draft is authoritative (it succeeds or the whole request
> 4xx/5xx-es), but the structured-Job ingest below is best-effort.

## The split, in code

```ts
// route.ts:89-99
let jobIngested = false;
try {
  jobIngested = await ingestStructuredJob({ slug, title: fields.title, ... }, ws);
} catch (ingestError) {
  console.error(`[api:jds/save] JD ${slug} saved but job ingest failed`, ingestError);
}
```

`saveJd` (`:85`) commits first and independently; the derived step runs after it
and is allowed to throw. `jobIngested` is returned to the caller (`:101`), which is
the technique's second rule for that response: the failure is a **state on the
response**, not only a log line. The catch block used to discard the error
entirely; it now logs it with the slug (`:98`), so the third shortfall recorded on
2026-08-20 — *a systematic ingest outage is invisible until roles start failing to
publish one at a time* — is closed. The AI builder's background path
(`app/_lib/jd-build-run.ts:432-445`) has the same shape and the same log.

## The transition that depends on it refuses

Going live is `POST /api/jobs/[id]/publish`, which resolves the job with
`getJob(id, ws)` and answers 404 when the row does not exist
(`publish/route.ts:82-83`), the dead end the save route's comment names. The
avoided-dead-end handling the standard asks for exists, but it no longer hangs off
the response flag.

## Where the retry lives now

The `jobIngested` flag has no consumer in the product. Nothing under `app/` reads it
except the simulation walk that drives the route (`useSimulationWalk.ts:287`), and
`docs/features/jobs/README.md:313-316` still says the builder "reads `jobIngested`"
and disables Publish with an inline Retry; that sentence describes a UI the tree no
longer has. The builder's save moved into a background build, and the recovery moved
with it to a different place and a different signal:

- **The absence is a category on the record.** A JD row with no linked job has
  `jobStatus == null`, and `statusCategory` returns `unlinked` for it
  (`app/features/library/jds/jdsLibrary.ts:175-181`, `isUnlinked` at `:223-225`). The
  ledger renders that as its own status chip and its own filter, so the state
  survives a reload — which is precisely what the 2026-08-20 revision found
  missing ("reload the page and the distinction is gone").
- **The retry is an action on that state.** A row that is `unlinked` shows a
  per-row "ingest as job" button (`JdsLedgerRow.tsx:106-108`, the component in
  `JdsLedgerRowIngest.tsx`), which posts to `POST /api/jds/[slug]/ingest-job`
  through `useIngestJob` (`jdsHooks.ts:146-175`). The failure comes back as a
  machine `code`, and the reader gets the reason in their language on the button's
  tooltip and in an assertive live region (`JdsLedgerRowIngest.tsx:21-26`, `:40`) instead
  of a colour change and one fixed sentence.
- **The retry cannot create.** The route resolves the JD first and refuses an
  unknown slug (`ingest-job/route.ts:35-36`, coded `JD_NOT_FOUND`), and it
  short-circuits when the job already exists (`:39-41`), so a second click parses
  nothing and spends nothing. The job's identity is the JD's (`jd-<slug>`,
  `jdJobId`), so the only row it can ever write is the one belonging to a draft that
  already exists. The comment at `:49-60` records the incident that made the write
  explicit: the route once parsed the JD body, answered `{ ok: true, already: false }`
  and wrote nothing, so the JD stayed `unlinked`, "Source into Pipeline" 404ed, and
  every re-click re-spent the parse.
- **It is the same door for the first ingest.** A JD saved straight to the library
  (a manual paste) was analysis-only forever until this route existed; the retry and
  the first ingest are one action, gated on the draft existing. That is a cleaner
  shape than the standard's two doors, and it means "retry" is not a separate create
  path that could drift from the real one.

The `/api/jds/save` retry-by-slug branch is still there and still safe — an unknown
slug is a 404 and not an implicit create (`route.ts:71-86`, the comment at `:71-74`
states the invariant: *"Reject an unknown retry slug so a retry can't mint a
`jd-<slug>` Job with no backing draft."*) — but no product surface posts to it.

Note also what the ingested record lands as: `ingestStructuredJob` calls
`insertJob(..., "draft", workspaceId)` (`ingest-job.ts:52`), and so does the retry
route (`ingest-job/route.ts:61`) — the derived record enters the lifecycle at draft,
so a successful ingest is not itself a go-live. The matchable band is deliberately
fixed to the analysis's salary and clamped rather than dropped (`ingest-job.ts:36-48`,
`withGroundedBand`), so a hand-typed number in the markdown cannot masquerade as
grounded research; the same helper is applied on the edit-time re-sync.

## The honest-null sort has left this surface

This page used to document the ledger's Pipeline column: a `—` for a JD with no
linked job, and a sort accessor that returned `null` so those rows sorted last in
both directions. That column is gone. The comment at `jdsLibrary.ts:286-288` says why:
*"The pipeline column used to sort here too; it left with the 2026-09 split — a role's
live state is the Roles tab's business, this ledger is the shelf of descriptions."*
`JD_SORT_ACCESSORS` (`:289-292`) now sorts only `analyzed` and `saved`. The rule the
technique states, that a never-computed quantity renders as absent and reaches the
sort and the aggregate, is therefore not currently exercised by this repository: the
Roles desk lists roles that exist as job rows, so it has no never-ingested state to
render, and the `unlinked` category carries the distinction on the shelf instead. The
technique's claim stands; this application no longer evidences it, and the earlier
citations to `JdsLedgerRow.tsx:80-102` and `jdsLibrary.ts:229-237` describe code
that is not there.

## Where the repo falls short of the standard

- **The failure state is derived from an absence, not recorded.** `unlinked` covers
  two different facts: an ingest that failed, and a JD that was never meant to be
  ingested (an analysis-only paste). Reload the page and "ingest failed ten minutes
  ago" and "never attempted" are the same chip. The standard asks for the failure to
  be durable on the record with a timestamp on both halves so a stale index over an
  edited description is detectable; neither timestamp exists on the `jds` row, and
  the first ingest's outcome is not kept anywhere except the server log.
- **The documented retry is a contract without a consumer.** The save route's
  `jobIngested` flag and the README's inline-Retry paragraph describe a surface that
  no longer exists; the README should be corrected to the ledger action, or the flag
  removed, before the next reader takes the sentence as a description of the product.
- **A re-sync can outrun the index.** An edit to the description re-parses it in the
  edit route (`PATCH /api/jds/[slug]`) and answers `jobResynced` on that response only
  (`[slug]/route.ts:133`); the JD row carries no durable marker saying the job was
  last indexed from an older body, so a stale index over an edited description is
  not detectable from the record.
