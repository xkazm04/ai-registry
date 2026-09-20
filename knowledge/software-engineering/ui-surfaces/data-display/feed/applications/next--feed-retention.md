---
layer: application
type: application
subject: feed
technique: feed-retention
stack: next
status: forged
verified_on: 2026-09-20
verified_against: next@16
---

# A reaper that runs on somebody else's clock

Read in the `ascent` tree (Next.js 16.3.3, Prisma 6.19.x over Aurora DSQL) at
HEAD `62c252dd`; every citation below was resolved against that tree on
2026-09-20.

The technique's reaper is described as if it owned its own runtime. This one
does not: it is a route handler invoked by a platform scheduler, under a
platform execution cap, against a store with optimistic concurrency and no row
locks. Almost every interesting property of `src/lib/db/retention.ts` and its
policy module `src/lib/db/retention-policy.ts` falls out of that one
difference — a reaper that can be killed mid-delete by something that is not
the reaper.

## The deadline is a constant that cannot be imported

`src/app/api/cron/purge/route.ts:21` declares `export const maxDuration = 300`.
Next.js requires route segment config to be a statically-analyzable literal, so
the handler **cannot** import the value it needs to share with the module that
derives the time budget from it. The tree's answer is to make the module the
single source (`retention-policy.ts:25`, `PURGE_MAX_DURATION_S = 300`), derive
the budget from it with declared headroom (`:29`, `:41` —
`PURGE_MAX_DURATION_S * 1000 - RETENTION_BUDGET_HEADROOM_MS`, 50s), and pin the
equality from a test instead of from the type system
(`route.test.ts:199-207`, both directions: the literal equals the constant, and
the derived budget undercuts it by exactly the headroom). The comment at
`route.ts:15-20` names the pair as a coupled constant and says why.

This is the general shape for any framework constant that must agree with
application logic it cannot reach: pick which side is the source, derive the
other, and pin the join with a test — the two used to be unrelated magic
numbers in two files, which is the state the pin exists to prevent.

The honesty caveat is written into the same comment, and it is the part worth
transplanting: **`maxDuration` is a request, not a guarantee.** The platform
honors it only up to the deployment plan's own function cap. On a
lower-capped plan the derived budget never trips, and the run is hard-killed
mid-delete with no throw and no summary — the budget is silently inert, which
is worse than having no budget, because the operator believes there is one.
The module warns when the configured budget is at or above the declared cap,
which is the only check available from inside.

## Stopping at a batch boundary, and saying so

`deleteInPages` (`retention.ts:89-107`) is the whole resumption story: select up
to `batchSize` ids, stop on an empty page, delete them, stop when the page was
short or a delete made no progress — and, at the top of each iteration,
`if (budgetExceeded?.()) break`. The budget is checked *between* batches, never
inside one, because every committed batch is its own transaction: the partial
state is safe and the next tick's re-selection resumes exactly where this one
stopped. Nothing is remembered between runs; the resume point is the data.

The budget reaches inside a single large entity, not only between entities
(`:96-100` names the case: one long-watched repo or a huge org-less audit sweep
otherwise loops for minutes with no check). The run carries two fields for the
outcome, `stoppedEarly` and `orgsRemaining` (`:779-780`, set at `:801-804`
between orgs and `:1221-1227` mid-org, where the count deliberately includes
the org it stopped inside).

**The degraded result is not a green result.** `route.ts:59-77` returns
`207 Multi-Status` with the full summary when *either* channel trips — errors
raised, or `stoppedEarly`. The comment records the regression that taught it:
gating on `errors` alone returned 200 for a run whose trailing sweeps were
skipped by the budget, because those skips set `stoppedEarly` but push no error
string. The reasoning generalizes past HTTP — a scheduler and an uptime monitor
see only the status, so the status is the reaper's entire health signal — and
the same route applies it one step further out at `:33-47`: a deployment that
lost `DATABASE_URL` returns 503, not 200, because a daily green tick while every
retention window has silently stopped being enforced is the exact failure the
named-reaper rule exists to catch. A genuinely database-less deployment opts
into the quiet green skip explicitly (`RETENTION_ALLOW_NO_DB=1`).

## The safety floor, checked twice

`RETENTION_MIN_SCANS_PER_REPO = 5` and `RETENTION_MIN_AUDIT_DAYS = 7`
(`retention-policy.ts:51,53`) exist because a per-org override is applied
verbatim: `retentionMaxScans = 1` typed for `100` would irreversibly wipe nearly
all of an org's history on the next tick. The floor is enforced in two places
with different jobs:

- **At the write** — `retentionFloorViolations` (`retention-policy.ts:275-295`)
  makes the settings endpoint refuse the value with a message that names the
  two legal escapes (`:340-349`). This is the one an operator actually meets.
- **At the reap** — `retention.ts:822-836` re-checks the *effective* policy and,
  below floor, pushes an error and `continue`s past the org without deleting
  anything. The error trips the 207, so an operator is paged rather than the
  data quietly vanishing. This is the check that covers values written before
  the floor existed, or by any path that is not the settings endpoint.

Three properties of the floor are worth copying exactly:

- **`0` is never floored** (`retention-policy.ts:279-283`, both guards test
  `> 0`). Zero means "keep everything"; the floor bounds only the destructive
  direction, and flooring zero would invert its purpose.
- **`null` means inherit, not zero.** The stored column is nullable and falls
  through to the env default; the module's sibling settings follow the same
  blank-versus-zero rule.
- **The override is explicit and out-of-band.** `RETENTION_FORCE=1`
  (`retention.ts:822`) applies an intentionally aggressive policy. A refusal
  with no override is a refusal someone will route around in a worse way.

And the preview is free of the floor: `?dryRun=1` (`route.ts:50-55`) counts what
every effective policy *would* delete, writes nothing and no audit entry, and
carries `dryRun: true` in the summary so a preview can never be read as an
enforcement run — and `retention.ts:822` gates the floor refusal on
`!opts.dryRun`, so an operator can see the cost of the policy the reaper is
refusing. Seeing that cost is how someone learns the number was a typo.

## The fold commits with the delete, not before it

The technique says a rollup that outlives its source rows must be computed
before the reap. This tree shows that "before" is not sufficient once the
reaper retries. In `retention.ts:291-307` the digest drafts are computed outside
the transaction but `upsertDigests` is called **inside** the same
`prisma.$transaction` as the deletes that remove its inputs, with the fold
doing its own re-read within that transaction. The comment states the failure
avoided: "a fold written outside this transaction would survive an aborted
delete and double-count on the retry." Because the deletes are retried on
serialization conflict (`withRetry`, `:299`), that retry is routine rather than
exceptional. A retried batch rolls back both halves and re-selects only
surviving rows, so no scan is folded twice and none dies without its summary.

The same paragraph shows the shape of the delete itself under
`relationMode = "prisma"`, which emits no foreign-key cascades: grandchildren
before children before parent, all in one transaction, so a mid-batch timeout
cannot leave a half-deleted graph (`:295-298`).

## The reap's own record is not best-effort

`retention.ts:1172-1195` writes a `retention.purged` audit entry per org that
actually deleted something, carrying a count per class *and* the policy that
produced them. Two details:

- **The gate is `totalDeleted > 0`, and digest deletions count toward it**
  (`:1167-1172`) — a class can age out on a tick where nothing else did, and
  "a destructive act with no trace is what the gate exists to prevent".
- **A failed trace is an error, not a shrug** (`:1194-1196`): "deletes applied,
  compliance trace missing" is pushed into `errors`, which trips the 207. This
  is the deliberate opposite of the same tree's feed writer, which swallows its
  own failures (`src/lib/db/alert-events.ts:79-82`) so that losing a history row
  can never suppress the alert itself. The asymmetry is the rule: recording an
  occurrence is best-effort because the occurrence matters more than its record;
  recording a deletion is not, because after the deletion the record is all
  there is.

## Two classes of row, two owners of the decision

`SCAN_JOB_RETENTION_DAYS = 30` and `SCAN_JOB_SETTLED_STATES = ["done",
"failed", "skipped"]` (`retention-policy.ts:64-70`) retire the scan queue on a
**fixed** horizon rather than a per-org policy, and the stated reason is the
one the technique should carry: a queue row is operational plumbing — what was
enqueued, what claimed it, what it returned — not tenant evidence, so there is
nothing here for a tenant to have an opinion about, and an org that configured
no retention at all must still not accumulate a queue forever. The settled-state
list carries its own half of the rule at `:67-70`: a `queued` or `claimed` row
is live work, deleting one on age silently drops a job rather than retiring its
record, and a stuck claim is released by its lease, never by retention.

## Where it falls short of the standard

**The configurable half defaults to unbounded.** `route.ts:6-7` and
`retention.ts:13-14` state it plainly: retention is opt-in, and with no
`RETENTION_*` env var and no per-org override every window is `0` and the purge
is a no-op. That is exactly the default the technique names as the decision
made in its worst form — "unbounded growth, discovered later as a slow query".
The deviation is defensible as a migration posture (existing deployments keep
their behavior until they ask for retention) and it is partly compensated: the
fixed-horizon class above cannot be opted out of, so the queue is bounded for
everyone. But a deployment that never visits the setting has no horizon on the
rows a reader actually pages through, and nothing in the product tells it so.
The transplantable fix is not to flip the default — that deletes data on
upgrade — but to make the absence *visible*: an opt-in policy with no
expiration is a policy, and the surface that offers the setting is the place to
say which one is in force.

**The horizon is enforced but not rendered.** Everything above is the storage
half of the technique. The reader-facing half — "showing the last 90 days" at
the end of the feed, a cursor past the horizon resolving to a stated truncation
rather than an empty page, an anchor past the horizon snapping forward *with a
statement* — has no counterpart in this tree that these citations reach. The
alert history reader (`src/lib/db/alert-events.ts:86-107`) takes a capped window
with no cursor and no end-of-feed marker at all, so a reader who reaches the
bottom cannot distinguish "this is everything" from "this is the newest 30".
The reaper is the mature half here; the edge it creates is invisible.
