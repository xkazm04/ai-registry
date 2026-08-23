---
layer: application
type: application
subject: authorization
technique: identity-bearing-keys
stack: node
verified_on: 2026-08-22
verified_against: node@22
---

# Tenant keys in a per-project marketing suite

A multi-tenant serverless product where every stored blob — campaign
snapshots, social posts, microsites, share links, mutation audit — is
addressed by a composed tenant key rather than filtered by an owner column.
The store is a document tree in production and an embedded SQL file in local
development, and the same key addresses both.

## The composer

`buildTenantKey` in `src/lib/campaigns/store-keys.ts:33-42` is the whole
address vocabulary:

```
u_{userId}[_proj_{projectId}][_{accountId}]
```

Its header comment names it "single source of truth for the read path
(`resolveTenant`), the sync path (`resolveCampaignContext`) and the mutation
audit, so no two of them can ever compute a different key for the same
request", and states the purity rationale explicitly — "framework-free so
the keying rules are unit-testable without touching Firestore". Because the
user id is the *first* component of every key, a cross-user reference is not
rejected, it is unspellable: there is no argument to `buildTenantKey` that
yields another user's address.

`safeKeyComponent` (`:12-14`) is the whitelist sanitizer, replacing
everything outside `[A-Za-z0-9_-]` with `_`, with the reason at the site: a
`/` would "break out of the Firestore document path into a nested
sub-collection". It is applied inside the composer, to every component, so
no call site can forget it.

## Call sites are enumerable, and they are all in one layer

The key format appears at seven sites, all under `src/lib/`:
`campaigns/connector.ts:427,433,448,477`, `campaigns/mutations.ts:337`, and
`projects/delete-cascade.ts:120,140,143`. **Zero API route handlers build a
key.** All of them go through `resolveTenant`
(`src/lib/campaigns/connector.ts:415-434`) or `resolveTenantForAccount`
(`:443-450`), and the latter exists precisely so scheduled readers compute
"the exact key `resolveCampaignContext` would for that account, so read and
write tenants stay identical" — the read/write symmetry the technique
demands, stated as the function's reason for existing.

`resolveTenant` also shows the two sanitizations are separate design
decisions: account-agnostic domains (social, microsites, share links, the
activity timeline) pass `accountScoped: false` so the volatile connected-ad-
account id never enters their address, "otherwise connecting / switching /
disconnecting an Ads account changes the key and orphans that user-created
content."

## The wildcard-sweep guard — the pattern-syntax half, learned

The prefix sweep is where the store's own syntax bites, and both local
backends carry the fix with the reasoning inline. `deleteAllForTenant` in
`src/lib/campaigns/store/local-docs.ts:93-111`:

```sql
DELETE FROM campaign_docs
 WHERE tenant = ?
    OR (substr(tenant, 1, ?) = ?
        AND substr(tenant, ?, 1) = '_'
        AND instr(substr(tenant, ?), '_proj_') = 0)
```

The comment states why: "Prefix matching is done with `substr`, not `LIKE` —
a tenant key is full of `_`, which `LIKE` treats as a single-character
wildcard. The `_proj_` guard keeps the sweep inside ONE project: a userId
that itself contained `…_proj_…` could otherwise make one project's base key
a prefix of another project's key." That is exactly the technique's third
containment — assert the *shape* after the prefix, not merely the prefix.
`src/lib/tenant-docs/local.ts:73-85` is the twin, and points at the first
for the rationale rather than re-deriving it.

## The orphan-tenant lesson, written by the codebase itself

`rejectUnknownProject` (`src/lib/projects/api-guard.ts:59-77`) is the
prove-before-compose guard, and its docstring is the failure mode verbatim:

> an unverified typo'd, stale or deleted id silently mints a FRESH EMPTY
> tenant — share links that list as zero reports, scheduled posts that
> vanish, and orphaned blobs the delete cascade can never reach.

It also gets the absent-versus-unverifiable distinction right: `if (!userId
|| !projectId) return null` leaves "the legitimate keyless paths (anonymous
visitor, or a signed-in user with no active project) untouched", while a
present-but-unowned id returns 404.

This is the half that drifts, exactly as the technique predicts. The guard
is adopted by four routes (`campaigns/share`, `microsite`, `social/messages`,
`social/posts`); several other tenant-keyed routes still pass a body or query
`projectId` straight into `resolveTenant`. The instrument for closing that
gap already exists — `test-unit/projects-guard-adoption.test.mjs` is a
structural adoption test — it just does not yet enumerate those routes.

## Key formats as migrations

Three artifacts in the composer module, all forced by widening the address:

- `legacyMutationAuditTenant` (`store-keys.ts:48-50`) reconstructs the
  pre-project-scope shape `u_{userId}_{customerId}`, "kept so a reader can
  dual-read old audit history — history is never rewritten, only unioned on
  read."
- `mutationAuditReadTenants` (`:56-64`) is the union-on-read helper,
  "deduped, so a tenant with no legacy divergence reads exactly once."
- `SKLIK_TENANT_SUFFIX` (`:26`) is the stable-synthetic-component rule made
  concrete: a second ad platform's data is keyed under a fixed `_sklik`
  suffix rather than a volatile external customer id, so "a user who LATER
  connects Google does not orphan their history" — the address stops moving
  when an outside relationship changes.

What the corpus does not yet have here is the technique's last demand: none
of the three union-on-read shapes names the date or backfill that retires
it.
