---
layer: application
type: application
subject: entity-lifecycle
technique: orphan-reconciliation
stack: node
verified_on: 2026-08-29
verified_against: node@24
---

# The project delete: one registry, a ledger, and a sweep that heals on the next delete

The marketing-workspace app (`systedo-case`, Next.js 16 / Node 24) deletes
a project whose data spans ~20 satellite stores across **two backends**
(sqlite under `LOCAL_DB`, Firestore in the cloud) — the textbook
"cascade stops at the store's reach" situation, and it carries the
technique end to end.

## The registry and its three derivations

`src/lib/projects/delete-cascade.ts:56` — `PROJECT_STORE_DELETERS`, "THE
registration point. A new per-project store adds exactly one line here
and the deletion cascade covers it automatically." Each entry is a stable
`name` plus a `delete(projectId, userId)`; the comment pins the names
because "it is the id the DELETE response and the fixture test assert
on." The three derivations are literal:

- the **cascade** (`runProjectCleanup`, `:193`) iterates the registry and
  collects per-store `StoreOutcome`s — one failure never aborts the rest;
- the **receipt**: the DELETE route returns `{ cleaned, failed }` by
  registry name (`src/app/api/projects/[id]/route.ts:166`);
- the **sweep**'s work list is `projectCleanupUnits()` (`:177`) — "the
  integrity sweep builds its work list from THIS, never from a second
  hand-maintained list."

The one cleanup unit outside the registry — the tenant-keyed document
scrub (`deleteTenantData`, `:126`) — still gets a stable unit name
(`TENANT_DATA_UNIT`) so it is resumable like the rest. Its header comment
(`:111-125`) records the technique's registry lesson the hard way: the
sqlite path used to early-return on the claim that per-store deleters
covered it, which "was FALSE for the two generic tenant-keyed document
twins … so a deleted project's data survived locally while
[the cloud's] `recursiveDelete` cleared it."

## The ledger, written at the door

`src/lib/projects/orphan-ledger.ts` states the failure mode in its
header: once the project row is gone, "nothing could re-target that
projectId again except a human reading the old id out of an audit-log
detail string. The orphaned data was invisible, un-deletable and a
privacy liability." The record carries exactly what the technique asks:
the deleted id, its name at deletion time, the pending unit names, first
seen, attempts, last error. Survivorship is structural: the ledger rides
a **reserved pseudo-project scope** `__system_orphans` (`:42`) that "no
real project can ever have … so no project deletion can ever cascade the
ledger away with its own evidence" (`:27`), writes are compare-and-swapped
(`:22`), the blob is capped (`:46`), and `upsertOrphan` (`:87`) merges
re-recordings — an empty pending set resolves the record.

The DELETE route (`route.ts:106`) does the door-side sequencing: sweep
pending cleanup from *previous* deletes first (`:123` — "a transient
store outage heals itself on the next delete"), run the cascade (`:131`),
remove the project doc (`:132`), then durably record any failures
(`:140`) before returning the receipt.

## The sweep: derived, report-first, existence-checked

`src/lib/projects/orphan-sweep.ts` reads as the technique's checklist:
"DERIVED FROM THE CASCADE'S OWN REGISTRY" (`:11`), "REPORTS BEFORE IT
DELETES" (`:18` — `apply: true` is the only destructive mode), "SAFE TO
RUN TWICE" (`:22`). The existence check is explicit about why it exists:
"we only ever delete data whose project is GONE, so a recreated or
mistyped id is reported, never scrubbed" (`:133`); an alive candidate is
cleaned out of the ledger without one delete. Pre-ledger orphans get the
technique's extra entry point: operator-supplied ids are assumed
worst-case dirty (`:122` — `pending: projectCleanupUnits()`) and
existence-checked like everything else. The on-demand face
(`src/app/api/projects/orphans/route.ts`) splits GET = report / POST =
apply and documents why it is a session-scoped route, not a
service-account script: the route "acts as exactly one user and
physically cannot reach another tenant's data."

## Where the technique's edges show

- **Direction.** Every reconciliation here starts from the ledger — a
  recorded failure. The dependent-side walk (enumerate a satellite
  store's keys, ask whether each project exists) does not exist, so an
  orphan whose failed delete predates the ledger *and* whose id nobody
  kept is permanently invisible. The `projectIds` escape hatch documents
  this reliance on "an operator [who] knows the id from an old audit
  record."
- **Loud vs. quiet failure.** Per-store failures flow back to the door as
  typed `StoreOutcome`s and reach the ledger — but the resume-sweep at
  `route.ts:123` and the activity emit are `try/catch console.error`,
  the accepted best-effort tier below the accounted one.
