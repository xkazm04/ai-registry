---
layer: application
type: application
subject: client-fetch-cache
technique: cache-key-discipline
stack: node
verified_on: 2026-08-22
---

# Cache key discipline in two node trees: a library core, and the consumer half it leaves open

Two independent reconciliations of this technique landed on the same stack, from
unrelated trees, and they are kept together because they complete each other. The library
realization closes the *structural* half - the key is a value, the hash has one door, the
axis audit is a lint rule - and states plainly that identity, tenant and locale are the
caller's job, because a library cannot enumerate a host's implicit axes. The product
realization is a caller doing exactly that job: server-resolved grounding folded into the
hashed value, an ownership rewrite before hashing, and provider identity as its own bucket
component. Read together they are the technique's two halves.

Neither pin fits `verified_against`, whose contract is a stack runtime version, so each
tree carries its own in prose: Tree A is `@tanstack/query-core` 5.102.0 at
`TanStack/query` commit `40321a0`; Tree B is a product repository on node@22. Both were
resolved on 2026-08-22.

## Tree A - a framework-agnostic query cache

How the framework-agnostic core behind TanStack Query realizes the
cache-key-discipline technique. Citations are against `@tanstack/query-core`
5.102.0, `TanStack/query` commit `40321a0` (2026-08-22). This is a
reconciliation against an external tree — not the consumer repo the sibling
`react--` applications cite — so the pin lives here in prose rather than in
`verified_against`, whose contract is a stack runtime version.

### 1. The key is a structure; the hash is the only string

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

### 2. One builder, three vocabularies, no call-site strings

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

### 3. The collision audit is shipped as a lint rule

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

### 4. Deviations and boundaries

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

### Reconciliation summary

Confirmed: keys derived, never hand-written; one builder shared across
queries, mutations and defaults; canonical recursive serialization with
sorted object fields and order-preserving arrays; absent-versus-default
normalized; delimiter injection structurally impossible; the axis-enumeration
audit mechanized as a lint rule with a documented allowlist. Deviation:
`Map`/`Set` in a key collapse to `{}` and collide silently. Not present by
scope: implicit-axis inclusion (identity, tenant, locale) and cross-identity
clear — a library cannot enumerate a host's axes, so that half lands on the
consumer. In-memory key versioning is likewise absent by design.

## Tree B - a metered generation cache behind one endpoint

The cache here sits in front of an expensive, metered generation endpoint
(`/api/ai`) shared by every tool in the product, with a two-level lifetime —
an in-process L1 and a durable L2. Every tool answers the same question the
technique asks ("what exactly changes the answer?") in one place: the mode
descriptor table in `src/app/api/ai/modes.ts`.

### One builder, and a per-tool declaration of what it hashes

`hashAiInput(mode, locale, value, providerTag)` is the only key builder
(`src/app/api/ai/dispatch.ts:144`). What varies per tool is the `value`, and
the table makes that an explicit contract rather than a call-site habit:
each mode's `prepare` returns `{ cacheValue, gen }`, where — per the table's
own header (`modes.ts:28-33`) — "`cacheValue` is the EXACT value hashed into
the response-cache key (see cacheKeyPolicy notes on each row); `gen` is the
metered generation `cachedRespond` runs on a cache miss."

Splitting the key input from the generator input is what makes the next two
disciplines expressible at all: the two are deliberately *not* the same
object.

### Grounding is folded into the value, so a data change busts the key

The implicit axis this product had to name is **server-resolved grounding**.
The client sends a topic and a project id; the server resolves performance
data, brand profile, competitor set and the trained voice profile before
generating. None of that appears in the request, and all of it changes the
answer — the technique's "if changing it changes the response, it is part of
the key" applied to data the caller never sees.

The `social` row (`modes.ts:572-595`) resolves grounding, brand and voice,
assembles the full skill input, and returns **that** as `cacheValue`; the
comment states the property directly: "cacheValue == the fully-grounded
input, so a data/brand change busts the cache." A refreshed sync or an
edited brand profile therefore produces a different key rather than serving
yesterday's answer under today's data.

### The effective-id rewrite

The dataset-grounded rows are where the collision would have been. A caller
supplies a `projectId`; the resolver returns `{ data, keyId }` where `keyId`
is the **effective** identifier after ownership resolution — the caller's own
project when it owns it, a base/demo identifier when it does not.
`analysis` and `chat` (`modes.ts:599-615`) rewrite the key input before
hashing:

```js
const cacheValue = data ? { ...value, projectId: keyId } : value;
// the GENERATOR still gets the ORIGINAL value + data
```

Two effects, and the table's comment names both: an unowned id "degrades to
base" so it cannot occupy a bucket alongside an owned one, and — because the
generator keeps the original request — the rewrite is a keying decision only,
never a change to what is generated. This is the technique's identity axis
resolved *before* hashing rather than trusted from the wire.

The honest-labelling companion sits beside it: `withDiagnosisMeta`
(`modes.ts:295-302`) stamps a sample-provenance flag plus "the stable digest
of the SERVER-rebuilt request … not a client-supplied one", so a surface can
say truthfully that a run was demo-grounded rather than silently presenting
it as real.

### Provider identity is its own bucket component

The product serves some callers from its own model credentials and others
from their supplied ones (a per-user bring-your-own-model plan), with a
per-operation model matrix on top. Same question, different answering model
— the technique's "environment or endpoint when the client can point at more
than one", in its paid form. `dispatch.ts:139-145`:

```js
const providerTag = byom ? `byom:${byom.vendor}:${byom.model ?? ""}:${byom.fastModel ?? ""}` : "app";
const key = hashAiInput(mode, locale, value, providerTag);
```

with the reason inline: "The result depends on which provider serves it, so
a BYOM caller gets its own cache bucket (vendor + chosen models) and never
shares a non-BYOM caller's result — or another vendor/model's." Note that the
tag is composed of the vendor *and* both model slots, which is fragmentation
chosen deliberately over collision — the cheaper failure, as the technique
prescribes.

### What is not here

No key-namespace version component. The cached value's shape is the tool's
response object, which does change (fields are added to `meta` across
releases), and the durable L2 outlives the process. This is the one axis of
the technique the implementation does not carry — what stands in for it is
expiry: L1 is a process-local map on a 15-minute TTL
(`src/lib/ai/response-cache.ts:21`) and L2 entries carry an `expires`
timestamp checked on read, with a native TTL field for the operator's own
policy (`src/lib/ai/response-cache-store.firestore.ts:2-4`,
`response-cache-store.local.ts:18-27`). Old shapes age out rather than
becoming unfindable, which is a weaker guarantee than a version bump and
bounded by the longest TTL a deploy can straddle.

## What the pair proves

The technique transplants across two trees that share nothing but a runtime, and each
tree's deviation is the other's subject matter - which is the strongest reading available
short of a live transplant test.

- **The structural rules hold in both.** One builder, no call-site strings, and a key
  input that is a value rather than a concatenation: Tree A enforces it in the type and
  the single `hashKey` door, Tree B in a per-mode table whose `cacheValue` is declared
  separately from the generator's input. Neither tree reached that shape by convention.
- **The implicit-axis half is where they meet.** Tree A names identity, tenant and locale
  as out of scope by construction and leaves the login-boundary escape fully open. Tree B
  closes precisely that class: grounding the caller never sees is folded into the hashed
  value, an unowned project id degrades to a base identifier *before* hashing, and the
  serving provider is a key component. A library and a consumer, each holding the end the
  other cannot.
- **Both lack a key-namespace version, for different reasons and at different cost.**
  Tree A needs none in memory and supplies `buster` past the process boundary; Tree B has
  a durable L2 that outlives a deploy and stands on TTL expiry instead, which it records
  as the weaker guarantee it is. The version-component rule is the one clause neither
  tree satisfies where it matters.
- **The remaining live defect is Tree A's alone:** `Map` and `Set` in a key both
  serialize to `{}`, so two questions silently share one entry. A total serializer, or a
  key type narrowed to what the serializer covers, is the standing fix.
