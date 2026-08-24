---
layer: application
type: application
subject: data-access
technique: cross-driver-invariant-parity
stack: node
verified_on: 2026-08-24
verified_against: node@24
---

# Two drivers over one money kernel (grant-writing-nonprofits)

A Next.js grant platform with a metered token wallet, persisted behind one
`Store` interface with two drivers: PGlite locally, Firestore in production.
Citations are against `grant-writing-nonprofits` at `fa0764e`, package
`grant-writing@0.4.5`, `@electric-sql/pglite@0.4`, `firebase-admin@13`,
`vitest@4`. The interesting half is the token ledger, whose correctness rests
on uniqueness guarantees the two engines express in completely different
vocabularies.

## 1. The invariant list exists, and it lives in the driver that lacks the vocabulary

`src/lib/db/store.ts:1-20` states the boundary doctrine — every feature module
and the ledger talk only to `Store`, the driver is chosen by config and loaded
lazily, "to add a backend, implement `Store`… no call-site changes." The parity
axis is then named explicitly in the local driver:
`src/lib/db/pglite-store.ts:68-82` warns that the `migrations/` snapshots have
drifted and are not a source of truth, and that "the real parity axis is PGlite
(here) vs Firestore (`firestore-store.ts`); keep those two behaviorally
aligned."

The invariant inventory itself is `src/lib/db/firestore-store.ts:6-19`: a
nine-line table headed "SQL uniqueness/ON CONFLICT is replaced by DETERMINISTIC
doc IDs", listing every substitution — `token_ledger/signup_<uid>`,
`token_ledger/<reason>_<ref>`, `drafts/<orgId>_<grantId>` for
`UNIQUE(org_id, grant_id)`, and six more. That is exactly the technique's
"name the invariants" step, done well, with one deviation: it is written
*inside* the substituting driver rather than above both, so the list is
discoverable from the engine that needs it and not from the interface every
caller depends on.

## 2. Constraint substitution, both halves visible

PGlite declares the constraints (`pglite-store.ts:120-123`):

```
create unique index if not exists token_ledger_signup_once
  on token_ledger(user_id) where reason = 'signup_grant';
create unique index if not exists token_ledger_ref_once
  on token_ledger(ref, reason) where ref is not null;
```

Firestore derives the address instead: `debit_${ref}` for a charge
(`firestore-store.ts:300`), `${reason}_${ref}` for a credit (`:350`),
`signup_${userId}` for the one-per-user grant (`:389`). The partial predicate
survives the translation — `where ref is not null` on the index corresponds to
`ref ? ledgerCol.doc(...) : ledgerCol.doc()` on both write paths (`:300`,
`:350`), so a null-ref adjustment appends under an auto id in one driver and
escapes the index in the other. The composite is preserved too: the index is on
`(ref, reason)` and the doc id is `${reason}_${ref}`, so the same ref under two
reasons is two rows on both drivers (asserted at
`src/lib/db/firestore-store.money.test.ts:193-200`).

## 3. One authority for the piece of the vocabulary both drivers read

Most of the derivation cannot be shared — PGlite has no doc ids — but the one
string both drivers must spell identically is. `reclaimRefFor`
(`src/lib/db/mappers.ts:181-190`) is the reclaim-credit ref paired to a charge's
debit ref, documented as "the naming convention that lets both Store drivers'
`charge()` recognize a CLOSED attempt… written by `guard.ts`'s reclaim closure;
read by both drivers. One home so the pairing can't drift." Firestore reads it
at `firestore-store.ts:318`, PGlite at `pglite-store.ts:818`. The money policy
that sits beside it — the negative-credit clamp — is shared the same way
(`computeClawbackClamp`, called at `firestore-store.ts:365-370` and
`pglite-store.ts:862-868`, with both call sites carrying the comment that the
policy lives in one place "so the money policy can't drift").

## 4. Opposite mechanisms, one outcome vocabulary

`charge()` returns `{ ok, balance }` plus an optional `closedByReclaim` on both
drivers, and no engine-shaped error reaches a caller. PGlite reaches that answer
with `select 1 from token_ledger where ref = $1 and reason = 'debit'` under a
`for update` lock on the account row (`pglite-store.ts:793-812`), the unique
index sitting underneath as "the backstop unique index" (`:800`). Firestore
reaches it with a transactional point read of the deterministic doc, asserting
`seen.get("reason") === "debit"` so "the dedup granularity can't diverge"
(`firestore-store.ts:314-325`).

The technique's warning that substitution changes the *shape* of the violation
is visible here in an unusual form: neither driver actually lets the constraint
fire. Firestore's `t.set` on an occupied deterministic id would overwrite rather
than raise, and PGlite's index would raise — so both drivers pre-empt with a
read inside the transaction, and the difference between "absorb" and "refuse" is
never observable above the seam. That is the right outcome, arrived at by
neither engine's default: the constrained driver keeps a backstop it never
trips, and the substituting driver has no backstop at all and therefore *must*
read.

The same substitution logic recurs on ordering. PGlite orders the ledger by its
`bigserial id`, "a guaranteed total WRITE order"; Firestore has no surrogate
sequence, so the driver sorts by `created_at` and tie-breaks by doc id, with the
reason written down at `firestore-store.ts:237-241` — a determinism invariant
held equal by a substitute, exactly like uniqueness.

## 5. The double enforces contracts, and its guards are proven able to fail

Firestore cannot be in the test loop without credentials or an emulator, so
`src/lib/db/__tests__/firestore-fake.ts` stands in for it. Its header
(`:1-24`) does the enumeration the technique asks for: the five Admin-SDK
surfaces the money kernel touches, then "deliberately minimal — no
`orderBy`/`limit`/batch/update/delete, because the money kernel… never calls
them", then the two contracts it *enforces* — reads-before-writes
(`FakeTransaction.get`, `:141-150`, throwing the Admin SDK's own message when
`this.writes.length > 0`) and atomic buffered commit (`set` buffers at
`:152-155`; `runTransaction` commits only after the callback resolves,
`:172-177`). Server-timestamp sentinels resolve at commit time to a monotonic
clock (`:209-227`) so the ordering assertions are deterministic.

Because the whole suite would free-pass if either guard were silently disabled,
`firestore-store.money.test.ts:334-361` carries
`describe("transaction contract (positive controls for the fake's guards)")` —
a read-after-write that must reject, and a throwing callback whose buffered
write must not exist afterwards. Its own comment states the stake: "if either
guard were silently disabled, every money test above could free-pass while the
real Admin SDK rejected the driver's transactions in production." That is
`negative-control-tests` from the test-harness subject applied to a double
rather than to production code, and it is what makes the double a gate on its
target instead of on a proxy.

## 6. Deviation: two suites, not one suite run twice

The parity suite the technique asks for does not exist. The PGlite twin is
pinned by `src/lib/db/credit-store.test.ts` and
`src/lib/tokens/guard.concurrency.test.ts` against a real embedded Postgres;
the Firestore driver is pinned by `firestore-store.money.test.ts` against the
fake. Neither file is parameterised over drivers, and the assertion sets differ
— which is precisely the transcription hazard the technique names, mitigated
here only by prose: the Firestore driver's comments repeatedly say "exact parity
with PGlite's `reason='debit'` filter" (`firestore-store.ts:306-308`) rather
than a shared test proving it. The correct shape is one invariant suite over a
driver fixture, run twice.

## 7. Deviation: the concurrency half is unpinned on the production driver

`FakeFirestore.runTransaction` (`firestore-fake.ts:172-177`) runs the callback
once and commits; there is no contention, no abort, no retry. Real Firestore
transactions retry when their read set is touched, and that retry is the only
thing standing between two concurrent charges on the same ref and a double
debit — because the substituting driver's uniqueness is a read-then-write with
no index underneath it. PGlite's twin *is* raced:
`guard.concurrency.test.ts:1-21` states the TOCTOU window and pins it against
the real `for update` lock. So the driver that runs in production is tested
sequentially and the driver that does not is tested concurrently. The technique
predicts this exact hole — a double without a contention model leaves the
concurrency half of the invariant unpinned — and the repo has it.

## Reconciliation summary

Confirmed: an invariant inventory written down rather than inferred;
constraint substitution by deterministic identity, including the partial and
composite shapes of the index it replaces; one authoritative home for the ref
convention both drivers read; a single outcome vocabulary that hides which
engine refuses and which absorbs; a double that enumerates and enforces the
engine contracts it stands in for, with positive controls proving its guards can
fail. Upward lesson folded into the technique: determinism of *ordering* is a
substitutable invariant on the same footing as uniqueness, and a
substituting driver with no backstop index must read inside the transaction
rather than rely on the write failing. Deviations: the invariant list lives
inside one driver rather than above both; two hand-written suites instead of one
parameterised over drivers; no contention model in the double, leaving the
production driver's race unpinned.
