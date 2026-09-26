---
layer: application
type: application
subject: quorum-and-recovery-procedures
technique: migration-lock-in-source
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
applied: code
ab_verdict: better
---

# An in-place re-encryption run beside the live server: `kp`'s `secrets:rotate`

kp keeps every UI-entered credential (provider keys, ATS and webhook secrets, calendar
tokens, the edge sealing key) AES-256-GCM encrypted under one operator secret, `KP_SECRET`,
in one SQLite file. Rotating that secret is the deployment's root-material procedure.
Its runbook (`docs/architecture/self-hosting.md`) has three steps. Restart with the new
secret, with the old one kept decrypt-only as `KP_SECRET_PREVIOUS`. Run
`npm run secrets:rotate` (`scripts/secrets-rotate.mjs`), which rewrites every stored
ciphertext under the new secret. Unset the old one. Step 2 runs **while the server
serves**. That is the case [migration-lock-in-source](../techniques/migration-lock-in-source.md)
now separates from the cold copy: one store, rewritten in place, beside a live writer.

## What it gets right

**The old material stays valid for the whole procedure.** Decryption tries the current
secret and then the previous one (`app/_lib/llm-secret.ts`, `decryptProviderSecretDetailed`).
Encryption only ever uses the current one. A rotation interrupted anywhere leaves every row
readable, and the pass skips rows already under the current secret, so a re-run resumes.
That is [cancel-leaves-prior-state-valid](../techniques/cancel-leaves-prior-state-valid.md)
in a single-operator form.

**A row it cannot read is never rewritten.** A value neither secret opens is counted,
reported, left as it was, and turns the exit code red. Overwriting it would destroy the only
copy of that credential.

## The collapse, measured

The script read each column's rows, re-encrypted them, and then wrote them back by `rowid`
in a transaction opened after the read. Anything the server committed between that read and
that write was reverted to the value the script had read. The harness put a separate
process writing rows under the new secret beside the real `rotateDatabaseSecrets`, over a
20,000-row `provider_keys` table in WAL mode, 5 passes per arm. Afterwards every row was
read under the new secret alone.

| arm | committed values reverted | passes with a loss | rows unreadable |
| --- | --- | --- | --- |
| read, then write later (as shipped) | 31,595 | 5 of 5 | 0 |
| read and write in one IMMEDIATE transaction | 0 | 0 of 5 | 0 |

The rates are harness-shaped: the writer is far busier than any operator saving a key. The
existence of the window is not harness-shaped. It is the whole decrypt loop, and a
credential saved mid-rotation is silently put back to its previous value, which then looks
like a key that "didn't save".

## The fix: the store's own write lock is the migration lock

`rotateColumn` now runs its read and its write inside one `db.transaction(...).immediate()`
(kp `2d893178`). No reserved-key lock, no boot refusal, no server stop: SQLite's write lock
already excludes every other writer, and the server waits the pass out on its
`busy_timeout` (5 s, set on every connection in `openStore`, `app/_lib/db-path.ts`). The cost is that stall: about 1.2 s at 20,000
rows in the harness, and milliseconds for a real install's handful of credentials. A table
large enough to hold the lock past the writers' `busy_timeout` would need batches, each
with a compare-and-set on the value it read. A dry run takes no lock.

## Not applicable

The technique's reserved-key denylist has no counterpart: nothing is copied between stores.
Its resume-by-key-order is replaced by "skip rows already current", which needs no stored
position because the envelope itself says which secret opened it.
