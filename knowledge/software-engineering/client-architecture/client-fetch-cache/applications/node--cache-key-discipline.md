---
layer: application
type: application
subject: client-fetch-cache
technique: cache-key-discipline
stack: node
verified_on: 2026-08-22
verified_against: node@22
---

# Grounding-aware keys on a shared generation cache

The cache here sits in front of an expensive, metered generation endpoint
(`/api/ai`) shared by every tool in the product, with a two-level lifetime —
an in-process L1 and a durable L2. Every tool answers the same question the
technique asks ("what exactly changes the answer?") in one place: the mode
descriptor table in `src/app/api/ai/modes.ts`.

## One builder, and a per-tool declaration of what it hashes

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

## Grounding is folded into the value, so a data change busts the key

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

## The effective-id rewrite

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

## Provider identity is its own bucket component

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

## What is not here

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
