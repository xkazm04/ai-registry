---
layer: application
type: application
subject: client-fetch-cache
technique: cache-key-discipline
stack: node
verified_on: 2026-08-22
---

# Cache key discipline in TanStack Query's `query-core` (Node)

How the framework-agnostic core behind TanStack Query realizes the
cache-key-discipline technique. Citations are against `@tanstack/query-core`
5.102.0, `TanStack/query` commit `40321a0` (2026-08-22). This is a
reconciliation against an external tree — not the consumer repo the sibling
`react--` applications cite — so the pin lives here in prose rather than in
`verified_against`, whose contract is a stack runtime version.

## 1. The key is a structure; the hash is the only string

The technique's "delimit unambiguously" rule is designed out rather than
enforced. A query key is typed `ReadonlyArray<unknown>`
(`src/types.ts:51-59`) — a structured value, never a string a caller
concatenates. The single place it becomes a string is `hashKey`
(`src/utils.ts:232-243`), a `JSON.stringify` whose replacer rebuilds every
**plain** object it meets, at any depth, with `Object.keys(val).sort()`.
Delimiter injection is impossible because there is no delimiter: `['a','b']`
and `['a,b']` hash to `["a","b"]` and `["a,b"]`.

That replacer is the canonical-serialization rule, and its recursion is the
load-bearing part — `src/__tests__/utils.test.tsx:569-574` asserts
`[{a:{d:4,c:3},b:2}]` and `[{b:2,a:{c:3,d:4}}]` hash equal, so field order at
a nested construction site cannot fragment the cache. Arrays are deliberately
**not** sorted: order in an array is meaningful, so `['t',[1,2]]` and
`['t',[2,1]]` stay distinct questions.

Absent-versus-default is normalized, and the project pins it as intended:
`['todos', { filters: undefined }]` and `['todos', {}]` hash identically
(`src/__tests__/utils.test.tsx:576-581`), because `JSON.stringify` drops
undefined-valued properties. "Not filtered" spelled two ways is one cache
entry — the technique's fragmentation case, closed.

## 2. One builder, three vocabularies, no call-site strings

`hashKey` is not merely available — it is the only door.
`hashQueryKeyByOptions` (`src/utils.ts:220-226`) is a two-line wrapper
resolving `options?.queryKeyHashFn || hashKey`, and every identity-producing
path in the core goes through it:

- `QueryClient.defaultQueryOptions` computes `queryHash` once, after merging
  global and prefix-scoped defaults, if the caller supplied none
  (`src/queryClient.ts:672-676`).
- `QueryCache.build` uses `options.queryHash ?? hashQueryKeyByOptions(...)`
  as its map key, and the store is a plain `Map<string, Query>` keyed by
  exactly that hash (`src/queryCache.ts:113-115`, `:93`, `:97`;
  `add`/`remove`/`get` at `:133-135`, `:144-151`, `:166-174`).
- Reads taking a raw key — `getQueryData`, `setQueryData`, `getQueryState` —
  never hash inline; they round-trip through `defaultQueryOptions` first
  (`src/queryClient.ts:136`, `:198-200`, `:242-247`).
- Mutations reuse the same function (`matchMutation`, `src/utils.ts:201`), as
  does the per-prefix defaults registry: `setQueryDefaults` stores under
  `hashKey(queryKey)` (`src/queryClient.ts:563`).

That is one authority over three key vocabularies. The escape hatch is
per-query rather than per-call-site: `queryKeyHashFn` is an *option*
(`src/types.ts:258`), inherited by prefix through `getQueryDefaults`
(`src/queryClient.ts:569-585`) and applied before the hash is taken — a
subtree changes its serialization without any call site learning to build
strings. `matchQuery` respects this: an `exact` filter re-hashes the
*filter's* key using the *stored query's* options, not the caller's
(`src/utils.ts:158`), so a custom hash function still invalidates correctly.

## 3. The collision audit is shipped as a lint rule

The technique says collisions are found by audit, not by symptom, and step 1
of that audit — enumerate every axis that changes the response — is
mechanized. `@tanstack/eslint-plugin-query`'s `exhaustive-deps` rule resolves
the free variables referenced inside `queryFn`, collects the identifiers and
member paths present in `queryKey`, and reports every required reference that
is missing: *"The following dependencies are missing in your queryKey:
{{deps}}"* (`packages/eslint-plugin-query/src/rules/exhaustive-deps/exhaustive-deps.rule.ts:32`,
logic at `:140-168`), with autofix suggestions that splice the missing paths
into the key. Its `allowlist` schema for variables and types (`:37-46`) is
the technique's "record why it cannot vary" answer as configuration rather
than folklore. This catches every *explicit* axis by construction, and no
implicit one: an axis read from module scope inside the fetcher — current
tenant, active locale, base URL — is not a free variable of the inspected
closure.

## 4. Deviations and boundaries

- **Non-JSON containers collapse to `{}` — a live collision.** `isPlainObject`
  (`src/utils.ts:361-390`) requires an `Object.prototype` prototype, so a
  `Map` or `Set` in a key passes untouched to `JSON.stringify`, which
  serializes both as `{}`. `['t', new Map([['a',1]])]` and
  `['t', new Map([['b',2]])]` hash to the identical string `["t",{}]` — two
  questions, one entry, silently, no warning. The technique's rule stands:
  the serializer must be total over what keys may contain, or the key type
  narrowed to what it covers. `query-core` does neither at runtime.
- **Identity, tenant, and locale are the caller's job, by scope.** Nothing
  in `packages/query-core/src` mentions auth, session, tenant, or locale
  (verified by grep across the package's non-test sources). A library cannot
  know a host's implicit axes, so it supplies no automatic scoping and no
  cross-identity clear. The technique's classic escape — a cache surviving a
  login boundary — is fully open here, and is the consumer's to close.
- **Key-namespace versioning exists only past the process boundary.** There
  is no version component in `hashKey`, and none is needed in memory where a
  reload clears everything. For persisted caches the mechanism appears:
  `buster` is compared against every restored entry and busts it on mismatch,
  alongside `maxAge` (`packages/query-persist-client-core/src/createPersister.ts:109-118`,
  same shape at `persist.ts:84`) — the namespace version, scoped exactly
  where the technique says it matters, though whole-cache rather than
  per-key, a coarseness affordable for a cache one refetch from truth.
- **Identity is frozen at construction.** `queryHash` is assigned once in the
  `Query` constructor (`src/query.ts:186`) and never recomputed, so an entry
  built before a `queryKeyHashFn` was installed keeps its old hash for life.
  Correct — a key changing under a live entry would orphan it — but it makes
  a hash-function change a shape change, wanting `buster`.

## Reconciliation summary

Confirmed: keys derived, never hand-written; one builder shared across
queries, mutations and defaults; canonical recursive serialization with
sorted object fields and order-preserving arrays; absent-versus-default
normalized; delimiter injection structurally impossible; the axis-enumeration
audit mechanized as a lint rule with a documented allowlist. Deviation:
`Map`/`Set` in a key collapse to `{}` and collide silently. Not present by
scope: implicit-axis inclusion (identity, tenant, locale) and cross-identity
clear — a library cannot enumerate a host's axes, so that half lands on the
consumer. In-memory key versioning is likewise absent by design.
