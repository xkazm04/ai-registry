---
layer: application
type: application
subject: decision-audit-and-traceability
technique: integrity-evident-is-not-tamper-resistant
stack: node
---

# The key census beside the verdict (TypeScript / SQLite decision store)

`app/_lib/decision-record-store.ts` is a per-tenant hash chain of consequential hiring
decisions in SQLite, on an isolated connection so it never touches the fork-active
`db.ts`. Its header is explicit about what it is not: "a hash chain, NOT a blockchain —
see the moonshot's risk note" (`:6-12`).

## `ok:true` is not a security claim

The `ChainVerdict` type (`:54-77`) is the technique's central rule expressed as a return
shape. The comment above it:

> the verdict carries a KEY CENSUS beside the integrity result, because `ok:true` alone is
> not a security claim. A link sealed with key_id "" was hashed with a public SHA-256 and
> no secret, so the same insider who can write `decision_records` can recompute it …
> Without these fields the route could not tell the badge which of the two very different
> guarantees it is looking at, so the badge asserted the stronger one over 66 rows that
> only had the weaker.

That last clause is the incident: a UI badge claiming tamper-resistance over a keyless
chain, for 66 real records. The fix was not to change what gets sealed — the census is
**derived** from the stored `key_id` column (`:392-402`), guardrail G2 — but to make the
verdict carry its own basis:

- `keyed` — true only when every link is keyed *and* the chain is non-empty: "the one state
  in which 'tamper-resistant' is a claim this store can back."
- `keylessCount` — `keylessCount === count` is a chain that was never keyed.
- `firstKeyedSeq` — where the protection begins, "so the surface can name" it. Naming the
  boundary is the difference between a useful partial claim and a vague one.

The non-vacuity proof is a test, not a comment: `decision-record-store.test.ts` asserts
that "a keyless chain ACCEPTS an insider re-hash."

## The cascade, and the downgrade refusal

`docs/features/compliance/README.md:62` states the two consequences to an auditor. First,
**a key added later cannot retro-seal earlier records** — they keep `key_id = ''`
permanently — but the cascade buys the prefix anyway: "once keyed links exist, editing an
older keyless record breaks the chain at the first keyed link, which cannot be reforged
without the key. A chain that was **never** keyed has no such anchor."

Second, **rotate, never remove.** Each row records its key id; a retired secret must stay
readable as `KP_DECISION_HMAC_KEY_<oldId>` or its rows fail closed, and
`decisionKeyById` resolves per-row by stored id so "old rows keep verifying under the
retired key while new rows seal under the new one — a rotation never invalidates history"
(`:96-121`). The header states the price plainly: "dropping one makes its rows
unverifiable — that is the price of keying, and is asserted in tests."

The downgrade attack is closed on both sides. On write, `sealDecisionRecord` (`:264-271`)
refuses to append an unkeyed row onto a keyed chain — an accidental un-set of the env var
would "create a downgrade row that permanently breaks verify", so it throws and
`sealDecisionSafe` turns it into a logged skip, "leaving the chain verifiable." On verify
(`:417-419`), a keyless row is legitimate only within the pre-key prefix: "Once any keyed
row has been seen, a keyless row is a DOWNGRADE forgery."

## A dedicated key, decoupled from the auth secret

`:98-104` is the custody lesson with its reason: the chain uses `KP_DECISION_HMAC_KEY`,
**not** the session/provider secret `KP_SECRET`, because `KP_SECRET` "is a rotatable
credential (it also signs sessions and, per the skill-profile finding, is expected to
rotate), and a tamper-evident AUDIT chain must survive a rotation of the auth secret
unbroken — so the two secrets are decoupled. Rotating `KP_SECRET` never touches the audit
history."

## Per-tenant chain identity

Tenancy is treated as structural rather than a scoping preference (`:14-20`): "A seal links
off the LATEST hash IN ITS OWN WORKSPACE, so each team has an independent chain and one
team's sealed rows never enter another's proof; verify walks a single workspace's records
in seq order. The global seq stays a plain row id — the chain identity is
(workspace_id, prev_hash)." Pre-tenancy rows backfill to the default workspace "so the
pre-tenancy chain verifies unchanged as that workspace's chain" — the migration done
without rewriting a single digest.

## Describing the deployment that actually runs

The documentation carries its own correction, and it is the technique's copy rule in
practice (`docs/features/compliance/README.md`, the HMAC paragraph): "This sentence used
to claim HMAC unconditionally; it is not what the code does, and the default deployment is
the other case." The keying is optional, the default is off, and the surface now conditions
on observed state — the records panel badges from the census and each row shows its own
`key_id`.
