---
layer: application
type: application
subject: decision-audit-and-traceability
technique: integrity-evident-is-not-tamper-resistant
stack: node
verified_on: 2026-09-29
verified_against: node@24
applied: simulation
ab_verdict: better
---

# The key census beside the verdict (TypeScript / SQLite decision store)

`app/_lib/decision-record-store.ts` is a per-tenant hash chain of consequential hiring
decisions in SQLite, on an isolated connection so it never touches the fork-active
`db.ts`. Its header is explicit about what it is not: "a hash chain, NOT a blockchain —
see the moonshot's risk note" (`:8-13`). Re-read at kp `104a4b1b5` (2026-09-29); the
first reading was 2026-08-20.

## `ok:true` is not a security claim

The `ChainVerdict` type (comment `:56-63`, type `:64-86`) is the technique's central rule
expressed as a return shape:

> the verdict carries a KEY CENSUS beside the integrity result, because `ok:true` alone is
> not a security claim. A link sealed with key_id "" was hashed with a public SHA-256 and
> no secret, so the same insider who can write `decision_records` can recompute it …
> Without these fields the route could not tell the badge which of the two very different
> guarantees it is looking at, so the badge asserted the stronger one over 66 rows that
> only had the weaker.

That last clause is the incident: a UI badge claiming tamper-resistance over a keyless
chain, for 66 real records. The census is **derived** from the stored `key_id` column, now
by one SQL aggregate over the whole chain (`:490-500`), so it describes the chain even
when the re-hash starts from a checkpoint:

- `keyed` — true only when every link is keyed *and* the chain is non-empty: "the one state
  in which 'tamper-resistant' is a claim this store can back."
- `keylessCount` — `keylessCount === count` is a chain that was never keyed.
- `firstKeyedSeq` — where the protection begins, "so the surface can name" it.

Since the first reading the verdict also says *how much* it re-hashed (`verifiedFromSeq`,
`fullyVerified`), because "ok" over a partial re-hash is a weaker statement than "ok" over
all of it. The non-vacuity proof is a test: `decision-record-store.test.ts:172` asserts
that "a keyless chain ACCEPTS an insider re-hash."

## Where the keyed claim actually stops (the ladder correction, measured here)

The header states the keyed guarantee as "a secret the DB writer does NOT hold"
(`:105-107`). That is the technique's old ladder wording, and it is true only at the
**database boundary**. The key is read from `process.env` inside the web process that
seals (`activeDecisionKey` and `decisionKeyById`, `:136-151`), and nothing else holds it.
Verification runs in the same process with the same key. So the sealing process holds it,
every verifier holds it, and an application-level compromise holds it too.

The simulation compared the ladder as it stood (A: "a secret the writer does not hold";
stops "an attacker who has the data but not the key") with the corrected rung (B: held by
the sealing process, not the store; open to whoever holds the key; and every rung below an
external anchor leaves the tail open). Three real cases:

1. **A database-level edit of a keyed row.** A and B both predict it is caught, and the
   test at `:120` shows it is.
2. **A database-level delete of the newest keyed rows.** A predicts it is stopped (the
   deleter has the data but not the key). B predicts it is not. kp's real `resetSim`
   deleted a keyed tail and the chain read `ok: true, keyed: true` on the next verify
   (dp-da-0929 harness, arm A). B was right.
3. **A read of the sealing process's environment.** A predicts the chain holds ("the
   writer does not hold" the key). B predicts it can be forged. The key is in that
   environment by construction. B was right.

B matched on 3 of 3, A on 1 of 3. Case 2 is closed in part by the head witness recorded
in this subject's hash-chain application.

## The cascade, and the downgrade refusal

`docs/features/compliance/README.md:406-410` states the two consequences to an auditor.
First, **a key added later cannot retro-seal earlier records**, but the cascade buys the
prefix anyway: editing an older keyless record breaks the chain at the first keyed link,
which cannot be reforged without the key. "A chain that was **never** keyed has no such
anchor." Second, **rotate, never remove** (`:411-413`): each row records its key id, a retired
secret must stay readable as `KP_DECISION_HMAC_KEY_<oldId>`, and `decisionKeyById`
resolves per row, so "old rows keep verifying under the retired key while new rows seal
under the new one — a rotation never invalidates history" (store header `:116-122`).
With a symmetric key that also means a retired key keeps the power to forge the period it
covers — the price the technique now names beside the verification one.

The downgrade attack is closed on both sides. On write, `sealDecisionRecord` refuses to
append an unkeyed row onto a keyed chain (`:357-361`). On verify, a keyless row is
legitimate only within the pre-key prefix: "Once any keyed row has been seen, a keyless
row is a DOWNGRADE forgery" (`:571-573`).

## A dedicated key, decoupled from the auth secret

`:109-114` is the custody lesson with its reason: the chain uses `KP_DECISION_HMAC_KEY`,
**not** the session/provider secret `KP_SECRET`, because `KP_SECRET` "is a rotatable
credential ... and a tamper-evident AUDIT chain must survive a rotation of the auth secret
unbroken." There is no key evolution and no separate verifier.

## Describing the deployment that actually runs

The documentation carries its own correction (`docs/features/compliance/README.md:319-332`):
"This sentence used to claim HMAC unconditionally; it is not what the code does, and the
default deployment is the other case." The keying is optional, the default is off, and
the surface conditions on observed state: the records panel badges from the census and
each row shows its own `key_id`. The trust page states both limits a reviewer should know
(`app/_lib/trust-posture.ts`, the decision-seal entry's `gap`): an unkeyed chain is not
tamper-resistant against database write access, and truncating the newest records "is
not yet detectable at any key setting". After the head witness, that sentence understates
the product by one case (a deletion the running process witnessed), which is the safe
direction for a claim to be wrong in.
