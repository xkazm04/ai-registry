---
layer: application
type: application
subject: cost-metering
technique: reversible-debit-and-settle
stack: node
verified_on: 2026-08-24
verified_against: node@24
---

# Reversible debit in the grant-writing token economy

`grant-writing-nonprofits` — a Next.js 16 App Router product whose AI routes
are paid for out of an org-scoped token wallet, so every model call is
prepaid. Paths below are relative to the repo root; citations resolved
2026-08-24 against branch `chore/decommission-datahub` (Node 24 in CI,
`.github/workflows/ci.yml:15`). The persistence layer has two drivers —
PGlite locally, Firestore in production — and both must agree on the ledger
semantics this technique rests on.

## 1. The handle is a closure over the debit it just wrote

`chargeForOperation` (`src/lib/tokens/guard.ts:47-110`) is the only entry
point. It resolves the org, prices the operation, writes the debit, and
returns `reclaim` as a closure bound to the exact org, cost and ledger
reference of *that* write (`:107-108`). No caller reassembles those three;
the clamp `Math.max(0, Math.min(cost, amount))` lives inside the closure, so
an over- or negative refund is structurally impossible rather than
conventionally avoided.

The at-most-once contract is stated on the type, not in a changelog — a
nine-line comment on `ChargeResult` (`guard.ts:19-37`) whose middle paragraph
is the whole warning: "the credit dedupes on the reclaim ref, so the FIRST
call wins and EVERY later reclaim() is a no-op regardless of its amount. Do
NOT reclaim a partial amount and then later reclaim the full amount expecting
a top-up — the remainder is silently swallowed." That is the technique's
first-amount-final rule, written at the grant site, in the exact place a
caller reading the return type will hit it.

## 2. Arming, entry-abort, and the named disarm

`chargeOrJson` (`src/lib/server-action/charge-route.ts:81-134`) is the
streaming front half, and its `opts.signal` branch (`:101-131`) is the arming
lifecycle almost clause for clause:

- A `done` flag wraps the handle into `safeReclaim` (`:104-108`), so the
  armed listener and a later catch-block reclaim cannot both write.
- **Already aborted at entry** (`:114-117`) refunds `await`ed — the comment
  gives the reason, "so a process/connection teardown can't drop the credit" —
  and returns `499` rather than starting the paid stream. A distinct status,
  not a success and not a 500.
- The listener is registered `{ once: true }` (`:122`), and `settle`
  (`:127-130`) both flips `done` and *removes* the listener, which is the
  disarm the technique asks for by name.

The persist-then-settle order is realized in the shared stream envelope
rather than per-route: `meteredNdjsonStream`
(`src/lib/server-action/metered-stream.ts:49-88`) runs `produce`, then
`persist(text)`, then `opts.settle?.()` at `:66-69` — "Work delivered AND
persisted: disarm the abort auto-reclaim so a tab-close right after the
suggestion can't refund the saved section." Its catch arm (`:72-83`) reclaims
on every failure and *distinguishes an abort from an error* before deciding
whether to emit an error frame — the refund is unconditional, the error
message is not. The module header (`:6-16`) states why the envelope exists at
all: the two routes' stream halves were byte-identical copies, and "the
money-critical settle/reclaim/abort handling lives in ONE place."

## 3. Partial reversal: a live thunk, and residual arithmetic

`/api/draft-full` bills one fixed charge for an N-section draft and passes
`reclaimAmount` (`src/app/api/draft-full/route.ts:165,171-176`) — a thunk
closing over mutable `cost` and `completed` counters, read live by the abort
handler at `charge-route.ts:121`. The comment records the incident that
bought it: "a blanket reclaim leaked revenue: abort after 2/3 sections billed
0."

The arithmetic is extracted and unit-tested on its own as
`unconsumedRefund` (`src/lib/server-action/prorate.ts`), and it implements the
technique's rounding rule for the stated reason: it computes
`kept = Math.floor((cost * done) / total)` and returns `cost - kept`, because
"Refund-side `Math.round` let the kept charge drift UP by up to ~1 unit at
some boundaries (e.g. cost=7,total=3,completed=2 billed 5 for 2/3 ≈ 4.67
deserved). Flooring the kept charge makes rounding deterministically favor the
org and guarantees kept + refund === cost exactly." The clamp to `[0, cost]`
is documented as defensive and never-firing at the call site — an honest note
about a guard that is not load-bearing.

**Deviation, small and documentary.** The same JSDoc that introduces
`reclaimAmount` also says, sixteen lines earlier, "Multi-section routes that
want a PARTIAL reclaim should NOT pass signal — they manage their own"
(`charge-route.ts:66` against `:75-79`). `/api/draft-full` passes both, which
is what the later paragraph prescribes; the earlier sentence is a stale
survivor of the design before the thunk existed. A money contract that
contradicts itself inside one comment block is exactly the kind of thing the
next reader resolves in the wrong direction.

## 4. The closed-attempt walk

The sharpest realization, and the one the technique was written around.

Refs are namespaced by operation — `` `${operation}:${requestId}` ``
(`guard.ts:85`) — with the reason on the line above: two different paid
operations colliding on a reused caller id "can't dedupe each other — the
second would otherwise return ok:true WITHOUT debiting and run the model for
free."

The pairing convention is owned in exactly one place. `reclaimRefFor`
(`src/lib/db/mappers.ts:181-190`) returns `` `reclaim:${chargeRef}` `` and its
docstring names its job: the naming convention "that lets both Store drivers'
charge() recognize a CLOSED attempt (debit + paired reclaim both landed) and
report `closedByReclaim` instead of silently deduping it. Written by
guard.ts's reclaim closure; read by both drivers. One home so the pairing
can't drift."

Both drivers implement the open-versus-closed distinction. PGlite
(`src/lib/db/pglite-store.ts:798-823`) takes `FOR UPDATE`, finds the existing
debit row, then looks for a `reclaim` row at `reclaimRefFor(ref)` and returns
`{ ok: true, balance, closedByReclaim: true }` when it finds one; Firestore
(`src/lib/db/firestore-store.ts:311-321`) reaches the same signal through
deterministic document ids inside a transaction, because it has no unique
index to lean on. `closedByReclaim` is optional on the shared return type
(`src/lib/db/store.ts:116`), so an in-flight dedupe stays a silent collapse.

The walk itself is `guard.ts:86-93`: retry with `` `${baseRef}:r${attempt}` ``
while the store keeps reporting a closed attempt, bounded by
`MAX_ATTEMPT_REFS = 6` (`:17`) and then falling back to `` :${randomUUID()} ``
with `break`, because "a UUID ref cannot be a closed attempt". The bound's
constant carries its own trade-off note (`:12-16`): past a handful of closed
attempts the request is in a pathological retry storm, "where losing
concurrency collapse (the only cost of the UUID fallback) is acceptable." And
because the returned closure is built from the *final* walked `ref` (`:107`,
via `reclaimRefFor(ref)`), each attempt's refund identity follows its own
attempt — refund idempotency stays per-attempt, which is the property that
keeps the walk from eating itself.

The comment block at `guard.ts:77-84` records what this cost: ref-idempotency
alone "let a CLOSED attempt free-pass every retry forever: a stable-ref caller
(match-analysis) could re-run the paid LLM with a no-op debit."

## Reconciliation summary

Confirmed: the debit returns a closure bound to its own ledger identity with
the refund clamped inside it; the at-most-once / first-amount-final contract
stated on the return type; abort arming with a once-guard, an awaited
entry-abort refund and a 499 verdict; a named `settle` that removes the
listener; persist-then-settle ordered in one shared envelope; a live thunk for
partial reversal with kept-floored residual arithmetic; operation-namespaced
refs; one owned reclaim-ref convention read by both drivers; and a bounded
closed-attempt walk whose per-attempt refund identity follows the walked ref.
Deviation: `chargeOrJson`'s JSDoc contradicts itself on whether a partial-
reclaim route may pass the abort signal. Upward lesson taken into the
technique: compute the *kept* portion by flooring and derive the refund as the
residual — the repo measured the drift that refund-side rounding produces and
named the direction it favours. Not present by scope: the wallet's ceiling and
period semantics are `budget-enforcement`'s and this product has none — the
balance is a purchased quantity, so "out of budget" is a 402 at the door
(`guard.ts:112-118`) rather than a period-scoped gate.
