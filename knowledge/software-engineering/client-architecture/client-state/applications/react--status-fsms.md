---
layer: application
type: application
subject: client-state
technique: status-fsms
stack: react
verified_on: 2026-09-05
verified_against: react@19
---

# Status FSMs — React/Zustand application

*Re-verified against the project tree at `ee124810f` (2026-09-05;
`package.json` pins `react ^19.2.6`, `zustand ^5.0.13`).*

Two in-repo implementations, each carrying a different half of the
technique: `processActivitySlice` is the keyed-machine half (concurrent
per-run lifecycles), `sceneStore` is the state-set half (per-family status
with data-presence-aware failure). The backend authority both of them
consume is the subject's rust application.

## Keyed machines: `src/stores/slices/processActivitySlice.ts`

The activity dock tracks every live process in the app —
executions, builds, chats — as `activeProcesses: Record<string, ActiveProcess>`
keyed by `domain` or `domain:runId` (`processKey()`, `:162`). The file is a
working catalog of the technique's keying disciplines:

- **One authoritative vocabulary.** `ACTIVE_PROCESS_STATUSES` (`:10-18`) is
  a `const` tuple; the type derives from it, and
  `shouldSurviveClearNonActive` (`:428`) switches over it with a `never`
  exhaustiveness arm — adding a status forces an explicit "survives
  clear?" decision at compile time instead of inheriting a default. The
  doc comment at `:113-123` even records a *renamed* status
  (`action_required` → `input_required`) precisely because a stale
  vocabulary copy once lingered in comments. The vocabulary is
  authoritative for the dock only: the backend it listens to types two of
  its four wire states and writes the rest as literals (see the rust
  application), so the seam is exactly where a rename would be missed.
- **Composite keys guard their separator.** `processKey` throws when
  `domain` or `runId` contains `":"` (`:162-173`), with the collision pair
  (`processKey("build", "x:y")` vs `processKey("build:x", "y")`) written
  out in the comment (`:157`). The invariant is enforced at the one
  construction site rather than assumed of callers.
- **Ambiguity is refused.** `processEnded` resolves its key via
  `findUniqueProcessKey` (`:206`): when no `runId` is supplied and more
  than one `domain:*` row is live, it warns and refuses (`:216-223`)
  rather than reaping an iteration-order-arbitrary row. The comment at
  `:269-275` names the corruption the old loose fallback caused — a
  finished run vanishing while the still-running one was marked completed.
  Its sibling `enrichProcess` documents the same hazard for telemetry
  (`:85-90`).
- **Entries name their reaper — twice.** `processEnded` removes the entry
  and archives it into `recentProcesses` (bounded at `MAX_RECENT = 10`,
  `:138`, `:283`); `reapStaleRunning` (`:399-417`) bounds how long
  `running` can credibly last, because a completion event lost in transit
  otherwise leaves a phantom "running" row forever (the "29 running
  personas" incident in the doc comment at `:125-131`).
- **A materialized derivation with its reason written down.**
  `activeProcessCount` (`:62`, comment `:54-58`) duplicates
  `Object.keys(...).length` so the titlebar dock can subscribe to a
  primitive under `Object.is` equality instead of recomputing inside a
  selector on every telemetry tick — maintained by every operation that
  adds/removes an entry. This is the technique's "earned exception" shape:
  stored derivation, single writer set, documented recomputation.

## Per-family status with `stale`: `src/features/teams/sub_mastermind/lib/sceneStore.ts`

The Mastermind canvas fetches six independent data families (relations,
scans, monitoring, goals, runners, spend). Each carries its own
`FamilyStatus = 'idle' | 'loading' | 'loaded' | 'failed' | 'stale'`
(`:36`) — the canonical state set, per family rather than per page, so one
slow family cannot blank five healthy ones.

The load-bearing piece is `failStatus` (`:78-79`):

```ts
export const failStatus = (prev: FamilyStatus): FamilyStatus =>
  prev === 'loaded' || prev === 'stale' ? 'stale' : 'failed';
```

Every family's `catch` routes through it — the shared
transition-on-failure function the technique prescribes. A failed *first*
load goes `failed`; a failed *reload* of a family with data goes `stale`,
keeping real (merely unguaranteed) data on screen and feeding the page's
data-health banner instead of a failure screen. `retryFailed` (`:317-329`)
then treats `failed` and `stale` uniformly as retryable.

Scoping is honored downward too: `invalidateScans` (`:210-232`) refreshes
one project's rows and, on failure, logs without flipping the family —
"a single project's refresh failing shouldn't flip the whole family to
failed — the rest of the cache is still valid."

**The gap the technique now names.** `failStatus` returns a bare status,
and every `catch` that calls it first hands the error to
`silentCatch(...)` (`:190`, `:204`, and the four siblings) — a log, not
the store. A family in `stale` therefore holds real data and *no record
of why the refresh failed*: the banner can say "may be out of date" and
cannot say what went wrong, and a permanent backend failure is
indistinguishable from a single dropped request. This is the exact
transition the technique's "the failed reload's evidence travels with it"
clause was written against, in the tree that supplied the `stale` state.

## Where the seam to async-ui-states runs

Neither file renders anything. `processActivitySlice` feeds the titlebar
dock and fleet strip; `sceneStore`'s six statuses feed a banner and the
canvas layers. The FSMs are data-layer truth; presentation derives from
them — which is exactly the boundary the golden path draws against
`docs/concepts/paths/async-ui-states/async-ui-states.md`.

## Previously reported gap, now closed

The 2026-08-18 verification recorded that `sceneStore`'s whole-family
loads carried no latest-wins token. Commits `c9d4ec29c` (2026-08-29) and
`3aba78285` (2026-08-30) closed it: one `createLatestWins()` slot per
family (`:146-153`), keyed like the status machine it protects; an
in-flight registry for the argument-less loads (`:161`, join by default,
`replace` after a world-changing event); a per-project keyed slot for
`invalidateScans` that *peeks* the family generation so a scoped merge
cannot cancel a full reload (`:167`, `:217-222`); and every completion —
success and failure alike — checking its token before writing
(`:187`, `:191`, `:201`, `:205`). The subject's react--async-race-guards
application is the fuller reading of that change.
