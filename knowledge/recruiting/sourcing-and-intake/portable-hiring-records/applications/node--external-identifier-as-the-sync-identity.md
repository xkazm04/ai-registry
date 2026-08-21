---
layer: application
type: application
subject: portable-hiring-records
technique: external-identifier-as-the-sync-identity
stack: node
status: forged
verified_on: 2026-08-20
---

# Sync identity in a hand-built ATS connector

The connector layer lives under `app/_lib/ats/`: `field-map.ts` (vendor payload →
inbound record), `inbound.ts` (the validated inbound shape), `links-store.ts` (the
external-id ↔ entry-id join) and `connections-store.ts` (per-provider token + map).
The direction is inbound; the outbound half is `app/_lib/ats-record.ts`.

## The identity is required at map-parse time, and it says why

`app/_lib/ats/field-map.ts:155` refuses a field map that does not bind the external
identifier at all:

```ts
if (!paths.externalId) {
  throw new AtsFieldMapError("fieldMap.paths.externalId is required — it is the sync identity.");
}
```

This is the technique's step 5 (assert at the boundary) pulled one layer earlier —
the map is rejected before it is stored, so a misconfigured connection cannot be
saved and then discover its problem mid-sync. `applyFieldMap` (`:98`) then throws
again per record when the configured path resolves to nothing, with the failure
mode named in the doc comment at `:94`: *"a silent miss here would re-import every
candidate as new on every sync."* That comment is the duplicate flood, written
down by someone who thought it through before it happened.

## The source half is not mappable

`MAPPABLE_FIELDS` (`:21`) enumerates nine bindable fields and deliberately omits
`provider`, with the reason on `:19`: *"it identifies the connection itself, so a
payload must never be able to claim to be another provider."* This is the compound
identity's server-derived half — the technique's step 1a. Because the source cannot
be bound by configuration, no field map, however wrong, can make one counterparty's
records resolve onto another's.

## Uniqueness is compound, per tenant, and enforced by the store

`links-store.ts:1` states the scope directly: the table is *"the join, scoped per
tenant because two customers can legitimately connect the same ATS account."* The
lookup at `:30` takes `(provider, externalId, workspaceId)` — never a bare id — and
the upsert at `:66` conflicts on `(provider, external_id, workspace_id)`.

## The binding is write-once

`links-store.ts:60`, on the upsert's conflict clause:

> `entry_id` is deliberately NOT updated on conflict. Once a vendor application is bound…

Only the observational columns (`last_seen_stage`, `last_synced_at`) refresh. This
is the technique's step 5a, and it is the difference between a link that records
an identity and a link that can be repointed by an upstream edit.

## Coercion refuses structures

`coerceScalar` (`:122`) converts numbers and booleans to strings and passes
everything else through unchanged, so a structure reaches the validator as a
structure and is refused. The comment names the exact failure a generic
stringification would produce: a placeholder value that *"would be a
plausible-looking value that collides across every candidate."* One coercion,
every candidate in the batch merged onto one identity — the failure that is worse
than a duplicate because it is not reversible.

## Confirmed, and one gap

Confirmed: identity required at configuration time and at record time; source
server-derived; compound per-tenant uniqueness; write-once binding; conservative
coercion; and the round trip pinned by `app/_lib/ats/inbound.test.ts`, so an
imported candidate emits the same `kp.ats.v1` record as one who applied directly
(`app/_lib/ats-record.ts:1`).

Not present: the run-level observability the technique asks for — created-versus-
updated as a ratio, and the count of records refused for missing identity, reported
to the operator in units of people. `app/api/ats/deliveries/route.ts` gives that
treatment to the outbound delivery ledger but there is no inbound equivalent. The
per-record throw is loud in a log; a sync that created four thousand candidates
instead of updating them is still only visible by reading the board.
