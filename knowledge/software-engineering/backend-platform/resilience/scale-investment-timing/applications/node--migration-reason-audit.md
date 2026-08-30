---
layer: application
type: application
subject: scale-investment-timing
technique: migration-reason-audit
stack: node
verified_on: 2026-08-30
verified_against: node@24
---

# Node — a datastore migration audited before it was proposed, with the cost measured and the trigger named

[migration-reason-audit](../techniques/migration-reason-audit.md) asks for a
migration's reasons to be written down as offered, sorted into *measured constraint*
and *everything else*, costed with the items that never appear in the plan, and kept
as a record the next proposal can be checked against. The tree read here is a
self-hosted recruiting application on Next.js with `better-sqlite3` over one file,
and it contains the audit **for a migration that has not happened** — the move from
a single SQLite file to Postgres — done in advance, with every part of the technique
present and one part it cannot yet have.

Two documents carry it: the decision record
`docs/architecture/decisions/0002-sqlite-single-file-persistence.md` (dated
2026-08-26) and the plan it points at, `docs/architecture/postgres-backend.md`.

## The reasons are enumerated, and the first column is empty on purpose

The plan's §2 is titled *"Do we even need Postgres? (the honest question)"* and is a
five-row table of concerns against *"Does SQLite+WAL handle it?"*. Read as the
technique's two columns:

- Concurrent readers, concurrent writers, durable one-file backup — **yes**, and the
  writer row states the scale it is a claim about: *"Concurrent writers, 1–2
  users/team | Yes — writers serialize; `busy_timeout=5000` waits briefly. KP's stated
  scale."* (`postgres-backend.md:91`). That is a ceiling with all three parts — a
  figure, an axis (concurrent writers per team), and the mechanism that makes it
  hold, which `app/_lib/db/core.ts:225` opens every store with.
- Multiple app replicas — **no**; a managed database with a customer's tooling —
  **no** (`postgres-backend.md:93-94`).

So the measured-constraint column, for capacity, is empty and says so: the TL;DR
opens *"SQLite + WAL already handles KP's concurrency (1–2 users per team). The only
real reason to leave it is **multi-replica HA**"* (`postgres-backend.md:9-10`). The
migration's surviving reasons are second-column reasons the technique names as
legitimate on their own — availability, and a customer's operational mandate — and the
document does not pretend otherwise. `app/_lib/db-path.ts:79-81` repeats the sort at
the seam itself: a Postgres backend is *"needed for multi-replica HA, not for KP's
1–2-users-per-team concurrency, which SQLite+WAL already handles"*.

## The cost is measured, and it is not the SQL

The technique's warning is that the figure people estimate is the migration project
and the figure they pay is larger. Here the estimate itself was pushed past the
obvious item. §1, *"Why this is not a one-PR change"*, counts **512 synchronous query
sites across ~48 files, plus 16 files using synchronous transactions**
(`postgres-backend.md:20-21`) and then locates the cost where it actually is:

> every one of those 512 sites becomes `await`, and `await` is contagious — every
> function that calls them becomes `async`, cascading up through the stores, the
> `_lib` services, and into the route handlers. That cascade, not the SQL, is the
> cost. It is realistically the single largest refactor in the codebase.
> (`postgres-backend.md:31-35`)

The count is reproducible — a grep of `.get(`/`.run(`/`.all(` under `app/_lib/db/`
returned 593 lines on the date in the frontmatter, the same order — and it is kept
current by an instrument rather than a memory: `npm run db:pg-audit`
(`package.json:55`, `scripts/pg-portability-audit.mjs`) flags SQLite-only dialect so
the portable subset does not erode while the decision is open. A second instrument
pins the property the port must preserve: an `eslint` `no-restricted-syntax` rule
(`eslint.config.mjs:230-236`) fails the build on an `await` inside
`db.transaction()`, and the plan records the datum that rule produced — *"zero
violations across the 34 transaction call sites"* (`postgres-backend.md:41`) — as an
input to the cost, since a port that makes transactions async must re-derive the
isolation of every one of them by hand.

That is the technique's *permanent operational surface* and *reset of operating
knowledge* items made concrete: the migration's price is stated in the unit that
will be paid (call sites and their isolation contracts), not in the unit that sounds
tractable (tables to translate).

## The reason, once written down, was satisfiable more cheaply

The technique's practical claim is that a stated reason can be met at a fraction of
the cost of the migration proposed for it, and that this option only appears once
the reason is on the page. §4 is exactly that: with the reason narrowed to
*multi-replica HA* rather than *Postgres*, Option C — distributed SQLite via LiteFS,
libSQL/Turso or rqlite — *"could satisfy multi-replica HA while preserving the
synchronous data layer and almost all 48 files"* and is *"the recommended first
investigation — it can make the whole Postgres question moot"*
(`postgres-backend.md:132-145`). Option A, the full port, is reserved for the one
reason that cannot be met any other way: *"A customer hard-requires Postgres (their
compliance/DBA mandates it)"* (`postgres-backend.md:152-153`), which is the
technique's *forced migration* case, named in advance with its trigger.

## The ceiling is enforced, not remembered

The decision record's accepted cost is *"One replica, forever"*, and rather than
documenting the constraint the chart enforces it: `deploy/helm/kp/values.yaml:12-16`
sets `replicaCount: 1` under a comment — *"HARD single replica … two pods cannot
serve one database — a second replica would contend/corrupt it"* — and the
Deployment pins `Recreate` on a ReadWriteOnce volume. The record also names what
would reopen the decision: *"A hosted deployment that must serve more than one
replica, or a workspace whose working set stops fitting comfortably in one file"*
(`0002-sqlite-single-file-persistence.md:64-65`). A trigger stated at decision time
is what lets the audit be rerun later without relitigating it.

## What this realization cannot do

**The retrospective half is untested.** The technique's largest claim for the reason
list is that two years on it is the only artefact saying why a migration happened,
and that its estimates can be compared with what the migration actually cost. This
one has not been executed, so the 512-site estimate has no actual beside it. A
reader wanting evidence that pre-migration estimates hold should look elsewhere;
this tree shows the estimate being made well, not being right.

**The stated scale is asserted, not load-tested.** "1–2 users per team" is a product
fact about recruiting workspaces, and `busy_timeout=5000` is the mechanism that
serialises writers within it; nothing in the repository measures where a third or
tenth concurrent writer degrades. The ceiling has its figure, axis and mechanism, but
its *method* — the query or test that reproduces the number — is the part the
technique asks for that is absent here.

**Update 2026-08-30 (kp commit `78971712`): the ceiling gained its method, and the
method returned headroom.** `scripts/perf/sqlite-writer-knee.mjs` runs the repo's
real pragmas with single-row transactions across N=1..5 worker connections, 1000
commits each, and the §2 writer row now carries the result inline
(`postgres-backend.md:91`, `Basis: **measured 2026-08-30**`): p95 commit latency
stays ~0.1–0.16 ms through N=5 with zero `SQLITE_BUSY`, and only the worst-case
tail grows (~10 ms at N=1 to ~110–140 ms at N=4–5). A third writer does not
degrade the typical commit, so the stated 1–2 figure has measured headroom for the
dominant small-commit shape — the first load measurement in this fleet, and the
outcome [ceiling-as-deadline-not-trigger](../techniques/ceiling-as-deadline-not-trigger.md)
now names as a success rather than a failed measurement. The row does what the
technique asks of a derived value: it states what to re-measure (the tail, under
bulk imports or long transactions) and when (pragmas or write shapes change), so
the figure is dated and re-runnable rather than asserted. The paragraph above
stays as the record of the before-state.

**Stability under questioning is unobservable.** The technique's strongest signal is
the reason list holding still across a week and across people. Both documents were
written by the same process in the same period; whether the list would survive a
customer asking for Postgres by name is precisely the case the plan defers to, and
it has not yet arrived.
