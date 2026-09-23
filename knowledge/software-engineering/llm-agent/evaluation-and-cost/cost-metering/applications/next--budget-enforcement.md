---
layer: application
type: application
subject: cost-metering
technique: budget-enforcement
stack: next
status: forged
verified_on: 2026-09-23
verified_against: next@16
---

# The streaming twin that ran paid inference outside the gate (ascent)

ascent is a Next.js service that scans a repository and writes a report with model
inference. Public scans spend a free monthly quota. Scans of private or installed-org
repositories spend prepaid credits. `verified_against` is the `next ^16.3.3` range in
`package.json`, which also pins `engines.node` to `24.x`. Read at `aff9991a`.

The metered unit is a **scan**, not a model call. That is why the chokepoint here is a
route gate module and not the model client, which is the boundary the technique's
enumeration section now states.

## The hole: one door metered, its twin not

Two routes start a single-repo scan: `/api/scan`, which returns JSON, and
`/api/scan/stream`, which streams server-sent events and is the one the report UI
actually drives. Until `bac970f04` (2026-09-05) the credit reservation lived inline in
`/api/scan` only. The stream route imported no credit code, so a private-org scan run
through the UI's own path did paid inference that neither meter charged. That route's
comment said the opposite: private scans skipped the monthly quota because they were
"credit-metered by the gate immediately below". The commit message calls it "the most
expensive path in the product", billed by neither meter.

The fix left the comment in place, amended so that it now records its own history
(`src/app/api/scan/stream/route.ts:128-134`). It is the clearest available evidence that
a comment claiming a gate is not a gate.

## The shape after the fix

`scanCreditGate` (`src/lib/scan-gates.ts:188`) is the credit door both routes import
(`src/app/api/scan/route.ts:318`, `src/app/api/scan/stream/route.ts:151`). It layers
on the existing reserve/refund pair rather than forking one. The header comment
(`scan-gates.ts:1-30`) records why the module exists. The two routes had diverged on
rate limiting and the sign-in wall as well as on credits: "a fix to one silently
missed the other".

Three of the technique's other rules are realized in the same place:

- **Guard ordering: the cheap refusal comes before the durable charge.** The pinned
  sequence is rate limit, then sign-in wall, then quota, then credit reserve
  (`scan-gates.ts:11-18`). The credit reservation is last "for a money reason": it is
  the only gate that changes a balance, so every cheaper refusal is answered before a
  credit can be debited.
- **Every non-provider outcome is a refund path, declared with the charge.** The hold
  returns an idempotent `refund`, and the stream route lists where it fires next to the
  reservation (`route.ts:159-162`): cached hit, coalesce join, degrade-to-mock, dedup,
  and throw or abort. These are the same paths the quota refund already covered.
- **What a blocked call reports.** The reservation happens before the stream opens, so
  running out of credit is a plain 402 (and an unknown org a 404) rather than an error
  frame inside an event stream (`route.ts:144-158`).

## What the enumeration still is

The gate module is the door for the two single-repo routes, not for every spender. The
reserve/refund pair it wraps is also called by fleet and webhook paths (the gate's own
comment says so, `scan-gates.ts:140-142`). The honest enumeration is therefore "the two
routes call the gate, and the other callers of the pair are listed", which is short and
auditable, and not "one file". That is the most a product-action chokepoint can promise,
and it is enough if the list is kept.
