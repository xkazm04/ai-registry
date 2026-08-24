---
layer: application
type: application
subject: embedded-db
technique: single-writer-holder-discipline
stack: node
verified_on: 2026-08-24
verified_against: node@24
---

# Cross-process discipline around a PGlite store — politicas

Politicas runs its whole data layer on one PGlite directory — a WASM Postgres
in `./.pglite`, single-connection — alongside a Next development server, a
vitest suite that boots the real store in several files, and dozens of
one-shot analysis scripts. It has paid for each clause of the technique in a
dated incident, and the payments are written down: `memory/` holds one
one-fact file per lesson, and the operational code cites them.

## The holder check, and the three traps

`memory/held-store-mimics-corruption.md` is the diagnosis rule in its
strongest form. On 2026-08-12 two independent builder agents diagnosed
`./.pglite` as corrupt from `PANIC: could not locate a valid checkpoint
record` — and the symptom **reproduced on a byte copy**, which both read as
proof it was data-level. The actual cause was a `next dev -p 3411` server
started thirty minutes earlier by a concurrent session, serving real data
throughout. The file states the inference the technique turns on: a byte copy
of a held store is torn by construction, so "reproduces on a copy" is not
evidence against a holder, it is what a holder produces.

The same file records the second trap: the restore protocol's `mv .pglite`
failed with Permission denied, "which was the lock saying so; treating that as
an obstacle to work around instead of as evidence would have destroyed the
holder's session."

The third arrived as an amendment ten days later and is the one that keeps the
rule honest. A store aborted at PGlite's `callMain`, the rename failed, and the
holder turned out to be three orphaned processes running a script that no
longer exists in the tree — but stopping them did **not** fix the store; the
data was independently damaged, most likely by a multi-worker build
prerendering against the single-connection directory. The memo's conclusion is
the technique's sequence verbatim: "find the holder → resolve it → **re-test at
rest** → only then conclude. Never infer 'a holder exists, therefore not
corrupt'."

Two negative results are recorded alongside, both about evidence that is not
evidence. `memory/robocopy-of-a-live-pglite-store-can-corrupt.md` lists the
diagnosis order that worked and marks the lock file as useless — "check
postmaster.pid (PGlite writes a fake pid, useless)" — and
`memory/case-loop-scripts-must-exit.md` explains why: the marker shows pid
`-42`, PGlite's synthetic value, and is rewritten at each open. Both files
name process enumeration by command line as the step that works.
`robocopy-…` also confirms that killing holders does not heal a damaged
directory ("a damaged dir stays damaged, so budget for the restore rather than
hoping") and that a dependency install failing with a locked native module is
a symptom of the same orphans.

## The backup is the procedure, not the copy

`scripts/db/backup.ts` implements all four steps. Its header (`:1-34`) opens
with the measurement that motivated it — 14 hand-made copies, 22 GB, "of which
`pg_wal` was 625 MB (41 %) because nobody ever checkpointed the store before
copying it" — and states the safety contract at `:24-28`, including the
refusal: "Refuses to run if anything else holds the store (a second opener
tears large reads — batch 016 measured it — and a copy of a held store is torn
by construction, see memory/held-store-mimics-corruption.md)."

- **Hold the connection yourself** (`:74-84`): the script opens the store,
  runs `CHECKPOINT`, and closes, with the comment stating the admission logic —
  "If something else holds it, open() will fail or the first query will —
  either way we stop, we do not copy a store we cannot prove is at rest."
- **Report honestly** (`:78-84`): directory size before and after, with the
  caveat printed to the operator that recycled WAL segments are retained for
  reuse "so this may not shrink". The technique's rule against promising a
  reduction, implemented as output text.
- **Strip the lock marker** (`:86-101`): `cp` with
  `filter: (src) => !src.endsWith("postmaster.pid")`, and the reason above it —
  "a copy must not carry it or the next opener of the copy sees a phantom
  holder."
- **Prune what the tool owns** (`:106-121`): only directories carrying the
  `.pglite-backup-` prefix (`:39`), sorted by mtime oldest-first (`:53-61`),
  printed before removal, with the exclusions named — "a damaged dir someone
  parked for autopsy, a case copy, `.pglite-absent`, are not ours."

The restore side is `memory/live-store-can-be-restored-under-you.md`, which is
the two-directional risk in one incident: a concurrent session restored the
store from a four-day-old named backup and silently wiped five passes of
writes — "No error anywhere; the surfaces kept rendering — just less." Its
four applications are the technique's: probe the store's own provenance
markers against the ledger before any live write, never make a write that is
not reproducible from a committed gated payload, refresh the named backup
after each batch, and diff after any restore because a restore also
resurrects pre-correction content. Recovery took minutes because clause two
held; `robocopy-…` adds the verification rule — check a restore with the
repo's sentinel command, "not by eye".

## Contention, and the exit rule

`vitest.config.ts:33-41` raises `testTimeout` and `hookTimeout` to 60 s with
the evidence in comments: "Five test files boot a real PGlite (WASM Postgres)
in parallel workers; the boots contend and any first-in-file test can blow the
5s default", and the dated re-raise — "Raised 30s -> 60s 2026-08-05: the
sentinel fixture-store tests were observed at ~33s under full-suite parallel
load in pre-push runs." Both raises carry their measurement, which is what the
technique asks for.

The diagnostic half is `memory/vitest-pglite-needs-tamed-workers.md`, which
names the five contending files and states the rule as an evidentiary one: "a
red full run is NOT evidence against a diff until it reproduces under
`npx vitest run --hookTimeout=60000 --maxWorkers=3` (reliably green) or in
isolation. Two builders and the Director each nearly mis-attributed this."

`memory/case-loop-scripts-must-exit.md` is the reaper rule for one-shot
scripts, with the disguise spelled out: a script that opens the store "prints
its answer and then hangs forever", every killed run orphans a holder, "money
batch 014 stacked five of them over an hour, after which each new read
crawled" — and the author got as far as writing a false performance defect
into the case ledger ("`getMoneyData()` could not complete in 600 s") for an
operation that takes about four seconds. The prescription is exact:
`main().then(() => process.exit(0))`, never `main(); process.exit(0)` (which
exits before the promise resolves and looks like a clean run that found
nothing). `scripts/db/backup.ts:124-130` is the shape applied, with the error
arm exiting 1.

Isolation costs a real checkout, and
`memory/isolated-dev-server-needs-a-worktree.md` records both failures in
order: a second dev server in the repo root is refused because Next 16 locks
per project directory rather than per port, and a worktree with a
`node_modules` junction dies in Turbopack with "Symlink … points out of the
filesystem root." What works is a worktree plus a real install plus
`PGLITE_PATH` pointed at a copy.

## The two memos, in lockstep

`lib/db/store.ts:279-293` is the layered-handle fix, with the failure written
into the code: the bootstrap layer keeps its own connection memo reset on
`store.close()`, "but that never touched THIS cache. Without clearing `cached`
here too, a caller that does getStore() -> close() -> getStore() in one
process got back the same already-resolved Store object whose methods close
over a `pg` handle that had just been closed, failing every call with no clue
why." The fix is structural rather than conventional — `close()` is wrapped so
it clears the outer cache before delegating (`:286-293`) — which is the form
the technique requires. The surrounding memo is careful for the same
cross-process reason: the promise is cached synchronously before any await
(`:267-276`) so two concurrent cold-start callers cannot both open the
single-connection directory.

## Deviations

1. **The holder check is a human procedure, not code.** The backup script
   refuses when it cannot open the store, which is the check as a side effect;
   nothing in the repository enumerates holders and reports them. The
   diagnosis ladder lives in `memory/` and in briefs, and every incident above
   is one where an agent had to remember it. A `db:holders` command printing
   attributed processes would move the first question of every corruption
   report out of folklore.
2. **The tamed test flags are not the checked-in default.**
   `vitest.config.ts` raises the timeouts but sets no worker cap; the
   `--maxWorkers=3` half of the measured-green invocation lives in a memory
   file and in builder briefs, so the reliable gate is the one a contributor
   has to know about.
3. **Exit discipline is per-script convention.** Each store-opening script
   ends with its own `main().then(...)`; a shared runner owning the exit would
   make the rule structural rather than remembered, and the orphan incidents
   are exactly the cases where it was not remembered.
4. **The version hold is a cross-process constraint with no gate.**
   `memory/pglite-05-ships-postgres-18.md` records that 0.5.x ships Postgres
   18.3 and cannot open the `PG_VERSION 17` directory this store is —
   controlled A/B on a healthy copy, 0.4.6 opens it, 0.5.4 answers "PGlite
   failed to initialize properly" — so the bump is a data migration for both
   the local store and the deployed volume. It is enforced by a dependabot
   ignore rule and a memo, not by anything that fails.
