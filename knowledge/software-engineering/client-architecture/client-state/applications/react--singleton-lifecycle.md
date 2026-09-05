---
layer: application
type: application
subject: client-state
technique: singleton-lifecycle
stack: react
verified_on: 2026-09-05
verified_against: react@19
---

# Singleton lifecycle — React/Vite application

*Re-verified against the project tree at `ee124810f` (2026-09-05;
`package.json` pins `react ^19.2.6`, `vite ^8.0.11`).*

This repo has been measured wall to wall for this technique: the legacy
golden path `docs/concepts/golden-paths/hmr-safe-singletons.md` (census of
2026-08-14) AST-classified every module-scope binding in 4,829 files — 25
`globalThis` keys of which 13 are state, 13 one-way latches, and a census
rule (`module-scope-install-latch`, still live in
`scripts/census/context-scorecard.json`) ratcheting the latch count. This
Application names the exemplars each rung of the technique's ladder maps
to.

## Rung 1 — refcounting: `src/hooks/utility/timing/relativeTimeTicker.ts:63-95`

One shared interval drives every relative-time label in the app. Acquired
on the first subscriber (`subscribe`, `:86-91`); `reschedule()` (`:63-84`)
clears and nulls the handle the moment the subscriber set empties, and
restarts only when the target cadence actually changes. Under HMR the old
module copy's subscribers unmount, its count drains, and the orphan
releases itself — replacement-safe with zero global names and zero
HMR-specific code. `src/features/plugins/fleet/relativeAgo.ts:15-30` is
the same shape in sixteen lines. The legacy path's verdict stands: *a
refcounted resource is HMR-safe for free; a latched one never is.*

The counter-example is `src/lib/documentVisibility.ts:14-20` — a
module-scope `let installed = false` latching a `document.addEventListener`
that is never removed. Every HMR re-evaluation resets the latch while the
listener lives on: silently additive, one extra permanent listener per
edit. Same file-shape as the ticker; opposite lifecycle discipline. It is
unchanged since the first verification.

## Rung 2 — generation token: `src/lib/execution/executionSink.ts`

The high-frequency execution output buffer — deliberately a **plain module
const** (`export const executionSink = new ExecutionSink()`, `:471`), not
a `globalThis` slot. Its replacement safety comes from a generation
counter (`:153`): `resetState()` increments it (`:236`); every scheduled
flush captures `const gen = this.generation` at schedule time (`:187`) and
`flush(expectedGeneration)` returns early on mismatch (`:280`), as do the
two deferred continuations at `:391` and `:448` — stale copies' callbacks
are inert, not prevented. The consumer completes the pattern at
`src/stores/slices/agents/executionSlice.ts:220-223`: on store creation it
calls `executionSink.reset()` then `bind(...)`, so HMR/store re-creation
automatically invalidates stale flushes.

Historical note worth keeping: project docs once misnamed this object
`executionBuffers` and called it a `globalThis` singleton; source comments
still cite that fiction as precedent (`fleetTerminalManager.ts:32-38`
now corrects it in place). It is the opposite — the repo's best answer to
the technique, needing no global at all.

## Rung 3 — the global slot done properly: `src/lib/eventBridge.ts:153-169`

The one slot in the repo that meets the full standard: a `declare global`
block typing the key (`:153-158`), `globalThis.__personasEventBridge ??= {…}`
for idempotent init (`:164-169`), and a comment naming the exact failure
it prevents (module-local `attached` resets under HMR while Tauri
listeners stay registered until their unlisten functions run) — an
externally held resource, which is precisely what a generation token
cannot make inert, so the slot is earned. `src/api/companion.ts:21-31`
has the best justification comment (enumerating StrictMode
double-effects, HMR, and remounts as the three duplicate-init sources);
`src/features/plugins/fleet/fleetTerminalManager.ts:289-291` is the
registry slot and `:514` shows the re-entrancy detail (set the slot
eagerly, "so a re-entrant call can't double-listen").

## The reset hatch

`src/stores/util/dedupedStorage.ts:15-17` (`_resetDedupCacheForTests`) and
`src/lib/polling/pollingCoordinator.ts:281-285` (which also `destroy()`s
the outgoing instance before replacing it) are the shape. Measured on this
verification: **19** modules export a `reset…ForTests` hatch (up from 9),
but of the **7** modules that own a `globalThis` slot (`companion.ts`,
`fleetTerminalManager.ts`, `eventBridge.ts`, `pollingCoordinator.ts`,
`silentFailureTelemetry.ts`, `fleetSlice.ts`, `tourSlice.ts`) only 2 do —
`tourSlice.test.ts:35-37` consequently re-implements teardown by assigning
`undefined` to three global keys by hand, the exact smell the technique
predicts. The hatches grew where the slots did not.

## The boundary, measured

`globalThis` here survives module re-evaluation only: 7 `location.reload()`
sites (including
`src/features/shared/components/feedback/ErrorBoundary.tsx:109`'s recovery
path) each build a fresh realm that drops every slot, and multiple Tauri
WebView windows are separate realms sharing nothing. Durability belongs to
the persistence contract (`persist()` + `app_settings`), never to a global
slot — the legacy path records a sibling repo's brute-force throttle
documenting its lifetime along the wrong axis as the cautionary case.

## Open backlog (reported, not fixed here)

The legacy path's proposal for a shared `hmrSingleton()` factory
(Symbol-keyed slot + inferred typing + non-optional reset hatch) remains
unbuilt; the four Tier-1 latches (`src/lib/documentVisibility.ts`,
`src/lib/storeBusWiring.ts`,
`src/features/templates/sub_generated/shared/ThinkingLoader.tsx`, and
`throttledStorage.ts`, since moved to `src/lib/`) remain latched rather
than refcounted; the census ratchet holds the line at 13. None of the
slots uses the bundler's per-module carry-over object, which the technique
now names as the disciplined home for a generation token — the repo
reached for `globalThis` in every case.
