---
layer: application
type: application
subject: seal-and-key-hierarchy
technique: append-only-keyring-rotation
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
applied: simulation
ab_verdict: better
---

# kp's at-rest secrets: a two-slot keyring with no term, rotated by a rewrite sweep (Node, source tree)

kp stores about ten kinds of credential in one SQLite database: provider
keys, ATS tokens and webhook secrets, calendar tokens, relay and pull
secrets, and the edge sealing keypair. Each is sealed with AES-256-GCM under
a key derived from an environment secret. Read at `2d8931781`, Node
`24.14.0`. This is the small-store, single-layer shape the technique's
Go application never had to face. It confirms two of the technique's claims
from the other side, and it earned the technique a condition.

## The envelope names its format, not its key

`app/_lib/llm-secret.ts` and `app/_lib/ats-secret.ts` write the same
envelope, `v1:<iv>:<tag>:<data>` (`llm-secret.ts:59, 74-81`;
`ats-secret.ts:61, 69-76`). The key is `sha256(secret)` of `KP_SECRET`, or
of `KP_ATS_SECRET_KEY` falling back to it (`llm-secret.ts:42-49`;
`ats-secret.ts:51-59`). `v1` is a version byte in the technique's sense: the
envelope can change its own rules later. There is no term. The keyring is
two slots, the current key and one `*_PREVIOUS` key read from the
environment (`llm-secret.ts:53-57`; `ats-secret.ts:39-43`). A read is
**trial decryption**: open under the current key, and on a tag failure try
the previous one (`decryptProviderSecretDetailed`, `llm-secret.ts:89-109`;
`ats-secret.ts:85-106`). Encryption always uses the current key, so nothing
new is written under the old one. That is the append half of the technique,
held to a list of length two.

## Retirement by rewrite, which the technique allows, done right

`scripts/secrets-rotate.mjs` is the retire step. It walks every declared
secret column (`SECRET_COLUMNS`, `:53-64`), rewrites each row that opens
under the previous key, leaves any row it cannot open exactly as stored,
and counts it as `unreadable` (`rotateColumn`, `:78-120`). It then tells the
operator they may unset the previous key (`:189`). Since `2d8931781`, each
column's read and rewrite share one IMMEDIATE transaction. This is the
technique's "rewrite the objects still under it, measure that the count
under it is zero, and only then remove the key", at a scale where the
rewrite is the whole store and costs milliseconds. The golden path's "rotate
by re-encrypting makes rotation an event" holds here too: kp's rotation is
an operator event with an ordering rule. But the cost argument does not.
A store of tens of rows does not need a third layer to afford rotation.
What it needs is below.

## What the missing term costs, measured

A simulation drove kp's own `llm-secret.ts`, `ats-secret.ts` and
`rotateDatabaseSecrets` in memory, under Node type stripping, with no kp
data. It compared them against a minimal keyed envelope,
`v2:<key id>:<iv>:<tag>:<data>`, backed by a list of keys:

| case | kp as written | keyed envelope |
| --- | --- | --- |
| rotate A to B, sweep, retire A (5 rows) | 5 of 5 readable: the sweep is sound | rows under A: 5 before, 0 after, counted by string match without a key |
| rotate A to B to C before any sweep (previous = B) | the row under A fails with `Unsupported state or unable to authenticate data`, **byte-identical** to a row under C with one flipped tag bit | `no key in keyring for kid efbff718`, distinct from the tampered row's tag failure |
| rotate the decoupled `KP_ATS_SECRET_KEY` X to Y | the sweep skips every ATS column when that key is set (`:122-131`) and refuses to run without `KP_SECRET_PREVIOUS`; 3 of 3 rows stay under X, and only trial decryption with both keys can find them | 3 rows under X, found by string match |

Case two is the technique's "a wrong-key decrypt is a lookup failure with a
name rather than an authentication failure indistinguishable from
corruption", reproduced on a real tree. Case three is its "a migration can
be measured as objects still under term N". Without a term, the only way to
measure is to hold both keys and try each row. Nothing measures the ATS
columns at all, because the sweep does not cover their dedicated key. One
ATS column, `ats_connections.api_token`, heals on its next write
(`app/_lib/ats/connections-store.ts:283-290`). The other eight stay under
the retired key until someone re-enters them, so unsetting
`KP_ATS_SECRET_KEY_PREVIOUS` is never provably safe. Verdict `better` for the
term prefix, by simulation over three real cases.

## What this realization cannot do

It cannot survive two rotations between sweeps. It cannot report per-key
counts without both keys. It has no sweep for the dedicated ATS key. The
smallest change the technique implies is a key id in a `v2` envelope,
read beside `v1` by trial decryption, plus a sweep over the ATS columns
keyed on `KP_ATS_SECRET_KEY_PREVIOUS`. The first half is a format change,
and a deployment that rolls back past it cannot read its new rows. So it is
recorded here as kp's to take, not made from outside.
