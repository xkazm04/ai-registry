---
layer: application
type: application
subject: client-state
technique: store-dependency-topology
stack: react
status: forged
verified_on: 2026-08-24
verified_against: react@19
---

# Store dependency topology — the `goat` store registry

`goat` is a Next.js 16 / React 19 ranking app with twenty-five Zustand store
modules under `src/stores/`. Four of them cross-call: `grid-store` reaches for
`session-store`, `backlog-store` and `validation-notification-store`, and
`match-store` orchestrates `session`/`grid`/`comparison`. That was enough to
produce the failure this technique treats, and the repo's own file header names
the state it was written to replace: "It replaces the hidden `require()` hacks
with a clear, type-safe dependency declaration"
(`src/stores/registry.ts:4-5`).

This is a near-complete realization of the technique's *artifacts* and a
near-total failure of its *enforcement*, and the two halves are worth reading
together — the interesting finding here is not the manifest, it is how much
correct machinery a codebase can build and still never run.

## The manifest

`src/stores/registry.ts:61-80` is the declared topology: a `const` object
mapping fifteen store names to their dependency lists, thirteen of them leaves,
with the two real dependents at `:78-79`. Above it, `:7-44` carries the graph
again as an ASCII drawing plus the intended initialization order and four notes
— including the one that explains why two of `grid-store`'s three edges are
deferred (`:38-40`).

The derived helpers are all present: `getStoreInitializationOrder` (`:86-107`),
`getTransitiveDependencies` (`:112-126`, a breadth-first closure over the
manifest), `getStoreDependents` (`:131-141`, the reverse edge query the import
graph cannot answer at all), `validateNoCycles` (`:147-175`, a textbook
depth-first walk with a `visited` set and a `recStack`), and
`generateDependencyGraph` (`:181-209`), which emits the manifest as a
directed-graph description with dependency-free nodes filled green — the
technique's "emit the graph and stop arguing about it", in twenty-eight lines.

## The engine nobody instantiates

Underneath sits a genuinely good generic implementation:
`src/lib/stores/store-registry.ts` (464 lines). `StoreRegistry.validateConfig`
(`:129-162`) rejects a dangling edge by name before doing anything else
(`:133-142`) — the manifest property the technique calls non-negotiable —
then runs `analyzeDependencies` (`:167`), a real Kahn's-algorithm topological
sort (`:180-203`), and **throws** on a cycle with the cycle path spelled out
(`:148-156`). The path is reconstructed by a second depth-first search
(`:214-239`) so the error message names the loop rather than merely asserting
one exists.

Nothing in the application ever calls it. `createStoreRegistry` and
`defineStore` appear exactly twice outside their own module: in
`src/lib/stores/index.ts:6-8` as re-exports, and in `src/stores/registry.ts:46-51`
as imports that the rest of that file never uses. The strongest enforcement in
the repo — validation at construction, throwing, with a named cycle — is dead
code, and the weaker hand-rolled copy above it is what the manifest actually
uses.

## Deviation: the assertion is on a module nothing imports

`src/stores/registry.ts:215-221` is the load-time guard, gated on
`process.env.NODE_ENV === 'development'`. A repo-wide grep for
`STORE_DEPENDENCIES`, `validateNoCycles`, `getStoreInitializationOrder`,
`generateDependencyGraph`, or any import path ending in `stores/registry`
returns the file itself and nothing else. The module is on no import path the
bundler walks, so the assertion has never executed in any environment — the
exact shape the technique warns about, where the guard is perfectly written
documentation that reviewers read as enforcement.

It would also not be loud if it ran: `:218-219` emits two `console.error`
lines and continues. A cyclic singleton graph is not a state the app can
proceed from, and the same file's unused engine already shows the repo knows
how to throw.

## Deviation: "topological sort" is a count sort

`:30` announces "INITIALIZATION ORDER (topological sort)". The function that
produces it, `getStoreInitializationOrder` (`:86-107`), partitions nodes into
zero-dependency and non-zero, then sorts the second group by
`aDeps.length - bDeps.length` (`:100-104`). That is not a topological sort. It
is correct here only by coincidence: `grid-store` and `match-store` both declare
three dependencies, so the comparator returns `0` for the only pair it is ever
handed, `Array.prototype.sort` is stable, and declaration order — which happens
to be right — survives. Add one dependent with two edges that must construct
after a dependent with three, and the derived order silently inverts, producing
the undefined-at-startup symptom out of the code written to cure it. The
adjacent unused engine computes the same answer correctly.

## Deviation: three copies of the store-name vocabulary

The manifest declares fifteen nodes for twenty-five store modules, so ten
stores are outside the graph entirely. One declared node,
`'heatmap-store'` (`:69`), has no module in `src/stores/` at all — the name
survives only here and in a logger map. `docs/STORE_DEPENDENCY_GRAPH.md:5-32`
is a second copy of the graph in prose, enumerating seventeen stores including
`tier-store` (consolidated into `ranking-store`, per the manifest's own comment
at `:75`) and `task-store` (gone). `src/lib/logger/index.ts:191-203` is a third,
a deprecated namespace map still naming `tier-store`, `heatmap-store`,
`validation-store` and `list-store`. Three hand-maintained lists of one
vocabulary, each wrong in a different direction, which is the drift the
one-authority rule predicts rather than a surprise.

## The accessor, and what it gets right

`src/lib/stores/lazy-store-accessor.ts:39-123` is `createLazyStoreAccessor`,
and it implements three of the technique's four rules cleanly: resolution
happens at call time inside `tryGetStore` (`:49-81`), the store is cached only
after `getState()` has been called and returned something defined (`:64-71`),
and the retry loop is bounded by `maxRetries` (`:92-109`). It also validates
what it resolved rather than trusting the import — `typeof store.getState ===
'function'` and a probe call — which is more than the deferred import it
replaces ever did.

`src/stores/grid-store.ts:52-63` declares the two real accessors with
`maxRetries: 5, retryDelay: 20` and a comment naming the race ("in case user
drags immediately before module initializes"); they are consumed at `:620`,
`:710-717` and `:722-727`.

## Deviations in the accessor

- **The bounded retry blocks the main thread.** `:104-107` is a
  `while (Date.now() - start < retryDelay) {}` spin, defended in a comment at
  `:102-103` as "acceptable here since this only happens during initialization
  race conditions (very rare)". At the grid store's settings that is up to 80ms
  of frozen frame, on the render thread, at the exact moment the user has just
  started a drag — the interaction the accessor exists to protect.
- **`null` means three different things.** `getStateWithRetry` returns `null`
  for "not resolved this attempt", "resolved to something that is not a store"
  (`:74`), and "permanently latched" (`:112-116`). The call sites cannot tell
  them apart and do not try: `:710-717` logs "Notification store not
  initialized" and drops the user's validation message on the floor; `:722-727`
  logs and returns `null` for the whole store context. `isReady()` (`:121`)
  distinguishes cached from not-cached, not transient from permanent.
- **The latch names no reaper.** `initializationFailed` (`:46`) is
  closure-scoped with no reset path, so one bad startup disables that accessor
  for the life of the module evaluation, and `failureReason` (`:47`, set at
  `:113`) is written and never read by anything but its own log line.
- **Success is logged unconditionally** at `:69` — a `console.log` per accessor
  on every successful first resolution, in production as well as development.
