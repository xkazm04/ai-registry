---
layer: application
type: application
subject: client-state
technique: async-race-guards
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
applied: code
ab_verdict: better
---

# Async race guards — the unused utility

*Verified against the project tree at `bf2a1e249`.*

The interesting form of this defect is not a missing guard. It is a guard
the codebase already owns, written well, documented with the exact hazard,
used at one call site, and absent from the store where six independent
fetches share one surface.

## The seam

`src/stores/util/latestWins.ts` is the technique's latest-wins token,
centralized as the technique asks: a module whose doc comment names the
races it exists for ("StrictMode double-mount, rapid filter/route changes,
auto-refresh racing a manual refresh"), with the mint/compare pair defined
once so the comparison direction is only gotten right once. A view uses it
correctly at `src/features/teams/sub_teamMemory/components/diff/
RunDiffView.tsx:54-77`, checked on the success path, the failure path and
the `finally`.

`src/features/teams/sub_mastermind/lib/sceneStore.ts` is the canvas's spine:
six data families (relations, scans, monitoring, goals, runners, spend),
each with its own `FamilyStatus` machine — the per-family state set that a
sibling application already praises. Every loader wrote its response into
the slot unconditionally:

```ts
const rows = await listScans(undefined, SCAN_LIMIT);
set({ scans: groupScansByProject(rows), scansStatus: 'loaded' });
```

No token, no dedup registry, no abort — a grep for `reqId|seq|token|inFlight|
dedup|abort` across the file returns nothing. The throttles at `:124-131`
bound *frequency*, which is a different property: two loads inside the
window are prevented, two loads outside it are not ordered, and `force:
true` (used by `retryFailed`, `:254-266`) walks straight past the throttle
into exactly the racing case.

The structural fact worth recording is the shape of the gap, not its
existence. The store had already been taken seriously twice: once for
per-family status machines, once for fetch-budget discipline. The guard it
lacked was the one whose implementation was already sitting in the repo,
imported by a component two folders away. Availability is not adoption, and
nothing in a build can tell the difference.

## A and B

**A** — the loaders as they stood: last writer wins by arrival order.

**B** — one `createLatestWins()` token **per family**, scoped exactly like
the status machine it protects, minted synchronously before the request
leaves and compared on the success *and* failure paths. A single global
token was refused for the reason the technique gives: it would make every
family's fetch a canceller of every other, which on a six-family canvas is a
worse bug than the one being fixed. A superseded response is inert, not
logged as an error.

## What was read, and what it said

Two `loadScans()` calls with deferred responses, resolved out of order: the
second request answers first, the first lands afterwards carrying an older
view. Nothing in the store's design orders these, and nothing in the
existing suite had ever asked.

Under A, `vitest` on
`src/features/teams/sub_mastermind/__tests__/sceneStore.test.ts` reported
`expected [ 'old' ] to deeply equal [ 'new' ]` — the stale answer had
replaced the fresh one, and the family status still read `loaded`. Under B
the fresh rows survive and the late write is inert. The 22-file, 214-test
mastermind suite and `tsc --noEmit` are green under B.

## What this cannot do or prove

- **It guards families, not entities.** `invalidateScans(projectId)`
  (`:169-182`) refreshes one project's rows and is deliberately outside the
  family token, so a per-project invalidation still races a whole-family
  load. Covering it needs a keyed token map — the keyed-machine half of
  status-fsms — and that is a different change than this one.
- **Latest-wins is one of three guards.** No in-flight deduplication was
  added: three mounts asking for the same collection still issue three
  calls, and the technique's mutation-path rules are untouched because this
  store only reads.
- **The verdict rests on a fixture, not on production.** The test proves the
  race is *possible* and now harmless. How often two loads of one family
  actually overlap in the field is unmeasured; the instrument would be
  request-level telemetry counting suppressed writes, which the store does
  not emit.
- **A green suite is not evidence of a race.** The 214 tests passed under
  policy A as well. Only the case written for the hazard could see it, which
  is the general limit of this whole class: an unguarded write site is
  indistinguishable from a guarded one until something arrives late.
