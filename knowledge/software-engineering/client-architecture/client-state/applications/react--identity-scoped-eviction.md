---
layer: application
type: application
subject: client-state
technique: identity-scoped-eviction
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
---

# Identity-scoped eviction — Next.js/React/Zustand/SWR application

A dashboard on Next.js 16 / React 19, with server state in SWR and client
state in eleven Zustand stores, five of which persist to `localStorage`.
`src/lib/clearUserCaches.ts` is a 45-line file that is very nearly the
whole technique, including the parts most implementations leave out.

## The owner: `src/lib/clearUserCaches.ts`

One exported function, `clearUserScopedCaches()` (`:32`), and a 23-line
doc comment (`:9-31`) that states the doctrine before the code:

- **Invocation is owned by one caller.** "INVOCATION IS OWNED BY
  authStore, not callers" (`:15`), followed by the enumerated trigger
  list — sign-out's `finally`, demo entry, and the auth-state handler
  "whenever the user id changes (expiry, revocation, cross-tab sign-out,
  account switch)" (`:16-18`) — and the consequence spelled out for
  readers: "Consumers therefore never need to clear caches themselves;
  they just refetch" (`:18-19`).
- **The refresh exclusion is written at the trigger, not only at the
  owner.** `authStore.ts:161-163`: "A plain token refresh keeps the same
  user id and is left untouched."
- **Placement is justified in the file.** "Lives in lib/ rather than
  authStore so each store stays free of an authStore import (would
  cycle: authStore → store → authStore)" (`:21-22`) — the import-cycle
  argument the technique gives for putting the routine below both
  layers, discovered here rather than borrowed.
- **Wipe-everything, with the narrow version's failure recorded.** The
  SWR predicate is `() => true` (`:35`). The comment above it (`:26-30`)
  names the bug that produced the rule: a previous
  `key[0] === "dashboard"` predicate "matched only array-form keys and
  silently missed the string-keyed `useSWR("observability", ...)` /
  `useSWR("usage", ...)` caches that hold per-user tool-usage and
  performance metrics." That is the technique's asymmetry as an
  incident: the clever predicate did not fail, it under-matched, and
  what leaked was per-user metrics.
- **Persisted preferences are evicted too, with the symptom named.**
  `:41-44`: "Filter store persists `personaId` to localStorage; without
  this reset the next user briefly sees results filtered by the previous
  user's selected persona." `useDashboardFilterStore.reset()` writes the
  defaults straight back through `persist(get())`
  (`dashboardFilterStore.ts:104-113`), so the stored payload is
  overwritten rather than merely shadowed — the distinction that decides
  whether the next launch restores what the eviction removed.

## The triggers: `src/stores/authStore.ts`

`onAuthStateChange` (`:155`) compares the durable identifier on both
sides and calls the owner only on a genuine flip (`:164-168`):

```ts
const prevUserId = get().user?.id ?? null;
const nextUserId = session?.user?.id ?? null;
if (prevUserId !== nextUserId) {
  clearUserScopedCaches();
}
```

Identity, not credential — which is what makes the refresh exclusion
free rather than a special case. The other three call sites are
`signInAsDemo` (`:196`) and `enterDemo` (`:206`), both clearing *before*
minting the mock session so demo never renders a real account's rows,
and `signOut`'s `finally` (`:276-279`).

That `finally` is the technique's network-independence rule as written
code. The `catch` above it (`:262-275`) force-clears `user`,
`accessToken`, `isAuthenticated` and `isDemo` when the remote
`supabase.auth.signOut()` rejects, on the reasoning that "the server may
have already invalidated the session even though the client call
rejected" — and the `finally` then evicts regardless of which branch
ran. Remote invalidation is best-effort; the local wipe is unconditional.

## Involuntary loss, spelled differently

`sessionExpired` is computed rather than inferred, in both places
identity can drop: `wasAuthenticated && !nowAuthenticated &&
!userSignOutInProgress` (`:141-142` on the initial `getSession()`,
`:176-179` in the auth-state handler). The third conjunct is a
module-scope latch (`:8`, set at `:241`, cleared in `signOut`'s
`finally` at `:277`) whose only job is to keep a deliberate exit from
being reported as an expiry. `clearSessionExpired` (`:288`) lets the
surface retire the flag once it has said so.

## The untrusted session that names the identity

`validateOptimisticSession` (`:18-37`) is the rehydration-narrowing seam
in the eviction path. To avoid a skeleton flash, `initialize()` reads
Supabase's cached auth token straight out of `localStorage` (`:110`) —
and refuses to let it name a user until it has checked, at runtime, that
`expires_at` is a finite number, that it is in the future (`:26`), that
`access_token` is a non-empty string, and that `user.id` is a non-empty
string. Anything short of that returns `null` and the code falls through
to the authoritative `getSession()`. The comment at `:101-104` gives the
threat model: "extensions, devtools, page-script tampering can mutate
it". Expiry is checked as a *value*, not assumed from the shape — which
is precisely the distinction between observing the target and asserting
a type over it.

## Where the write path meets it

`personaStore.reset()` (`:226-237`), one of the six stores the owner
clears, empties `personaMutationInflight` (`:228`) — the per-id
optimistic-write mutex. The store's own comment at `:219-220` names this
as the reason a settling mutation may only release its slot when it
still owns it: "a `reset()` between schedule and finally could already
have wiped the map." Note that this is *unreferenced* code — no
component in `src/` calls the store's optimistic-write API — so it
documents the interaction correctly without exercising it.

## Gaps against the technique

- **The exception list is not at the owner.** `settingsStore.ts:12-13`
  declares its own exemption ("These are browser-level preferences, not
  user data, so they are intentionally not cleared on sign-out (same
  policy as reviewVoiceStore)"), and `reviewVoiceStore` follows suit.
  The decision is right and the reason is written down — but a reader of
  `clearUserCaches.ts` cannot see that the exemptions exist, let alone
  which stores hold them.
- **One persisted user-scoped store is missing from the wipe.** *(Resolved 2026-08-29: `useIncidentsFilterStore.reset()` added to `clearUserScopedCaches`, personas-web commit `3f03ba9`.)*
  `src/app/dashboard/incidents/incidents-page/useIncidentsFilterStore.ts`
  persists `status`, `severity`, `source`, `groupBy` and a `persona`
  *name* under `incidents-filter-state` (`:29`) and has a `reset()` — but
  nothing in `clearUserScopedCaches` calls it. It is exactly the failure
  the file's own SWR comment warns about, one layer up: a cache added
  after the eviction list was written, in a directory the list's author
  never looks at. It is also the case the technique's review question
  exists to catch.
- **The reason travels in a module-scope boolean, not in the
  transition.** `userSignOutInProgress` works, but it is a latch shared
  by two independent computation sites; a reason carried on the
  transition itself would not need the two sites to agree on when it is
  cleared.
