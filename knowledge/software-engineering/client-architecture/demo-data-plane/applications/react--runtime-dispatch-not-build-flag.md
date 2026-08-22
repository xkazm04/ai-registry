---
layer: application
type: application
subject: demo-data-plane
technique: runtime-dispatch-not-build-flag
stack: react
status: forged
verified_on: 2026-08-22
verified_against: react@19
---

# Runtime plane dispatch in the Personas web dashboard

The dashboard is a Next.js 16 / React 19 application that serves three data
planes from one production build. All of them are reached through a single
exported `api` object, and no surface in the codebase imports an implementation
directly.

## The interface

`src/lib/api.ts:127` declares `export interface ApiClient` — twenty-two methods
covering personas, executions, events, subscriptions, triggers, health, status,
observability and usage analytics. The section header three lines above it
(`:124`) states the job in one line: *"Shared interface — enforces parity between
mock and real implementations."* That is the whole parity mechanism: `realApi`
(`:158`), `supabaseApi` and `mockApi` are each annotated `: ApiClient`, so a
method added to the interface fails the type check in every implementation that
has not grown it.

## The dispatch

`src/lib/api.ts:355` is the dispatch, and it is a `Proxy` rather than a
module-scope selection:

```ts
export const api: ApiClient = new Proxy({} as ApiClient, {
  get(_target, prop: string | symbol) {
    const { isDemo } = useAuthStore.getState();
    if (isDemo) return mockApi[prop as keyof ApiClient];
    const impl = USE_SUPABASE ? supabaseApi : realApi;
    return impl[prop as keyof ApiClient];
  },
});
```

Every property access re-reads `useAuthStore.getState()`. This is what makes the
plane a live property of the session rather than a value captured when the module
first loaded: a component that imported `api` before the visitor entered the demo
still gets the mock plane on its next call. The docblock at `:349` states the
rule the subject turns on — *"demo is always an explicit user choice, never
auto-on"* — and `:340` documents the three-plane arrangement above it.

**Deviation worth naming.** Only the demo plane is dispatched at runtime. The
choice between the read-mirror and the live client is `USE_SUPABASE` at `:347`,
a module-scope read of `process.env.NEXT_PUBLIC_DATA_SOURCE`, which Next.js
inlines at build time. Two of the three planes are therefore fixed per
deployment. The containment property the subject cares about is unaffected —
the fabricated plane is the one under runtime control — but a deployment cannot
serve both real planes, and the read-mirror's behaviour cannot be exercised by a
test against the shipped artifact.

## The read-mirror refuses rather than empty-succeeds

`src/lib/supabaseApi.ts:50` holds the refusal:

```ts
const READ_ONLY = "Cloud-sync mode is read-only — remote control ships in Phase 2.";
function readOnly(): never { throw new ApiError(501, READ_ONLY); }
```

Every write method on the mirror — execute, cancel, delete, publish,
subscription mutations — calls it. The file's own docblock (`:9`) states the
reasoning: they *"throw a clear error rather than silently no-op."* The methods
exist, so the interface stays complete and nothing type-checks its way around
them; they refuse with a status and a message, so the interface's incapacity is
visible in the surface and in error reporting rather than being absorbed as a
successful write that never happened.

## The route, and its escape hatch

`src/app/demo/page.tsx:11` documents the arrangement that makes this a route
rather than a build: *"This lets the real cloud app at `/dashboard` and the demo
coexist in a single production build without an env flag."* The component calls
`enterDemo()` from the auth store and redirects to `/dashboard/home`, forwarding
the query string so a tour parameter arriving from the marketing site survives
the hop (`:29`).

The entry route's failure path is at `:40`:

```ts
// Escape hatch: if the redirect never lands (chunk-load error, dashboard
// route error boundary), surface a manual link instead of an eternal spinner.
const timeout = window.setTimeout(() => setFailed(true), 5000);
```

Five seconds, then the spinner is replaced by a plain link into the dashboard.
This is the entry point's own `failure-not-empty-success`: a demo entry that
hangs is indistinguishable from a broken product to the visitor most willing to
try one.

## Entry is explicit and never survives a reload

`src/components/dashboard/SignInPrompt.tsx:11` is the unauthenticated gate for
`/dashboard/*`, and its docblock carries the rule: *"Demo is always available and
never auto-entered."* It offers two buttons — sign in, or "Try Demo" — and
nothing infers the second.

`isDemo` lives in the Zustand auth store with no persistence middleware, so a
hard navigation drops it. The end-to-end suite depends on that and asserts it:
`e2e/dashboard-demo.spec.ts:3` opens with *"Demo mode is in-memory (never
persisted), so every hard navigation must re-enter it,"* and the mobile test at
`:23` navigates directly to `/m/overview`, expects the sign-in prompt with its
always-available demo entry, and only then clicks through.

## What ships to production

The fixture modules (`src/lib/mockData.ts`, `src/lib/mock-dashboard-data.ts`)
and `src/lib/mockApi.ts` are in the production bundle. The cost is real and is
bounded by the demo route's code path; the return is that the honesty contract
is asserted by Playwright against the artifact that serves customers, which a
demo-only build could not offer.
