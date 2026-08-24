---
layer: application
type: application
subject: llm-call-telemetry-model
technique: metadata-attribution-keys
stack: node
status: forged
verified_on: 2026-08-24
verified_against: node@24
---

# Ambient attribution keys on the emitting side (grant, Node/Next)

Every application of this technique so far has been written from the
receiving schema's seat. `grant` — a Next.js grant-writing product that
meters its own LLM spend and ships it to a LightTrack deployment — is the
*producer*: one small module, `src/lib/cost-telemetry.ts`, decides which
keys go in the map and where their values come from. Reading it from the
emitter's side sharpens two things the technique states as rules: that the
attribution key must be *chosen* so cost and revenue land on the same
identity, and that the map is only safe behind a named reader.

## The key set, and the join it was chosen for

`trackLlm` sends exactly two attribution keys —
`metadata: { customer_id, product_id }` (`src/lib/cost-telemetry.ts:72-79`)
— alongside `usage.{input,output}`, `latency_ms` and `status`. It sends no
`cost_usd`, so the receiver prices from its own book and stamps
`cost_source` itself; it sends no client timestamp either, so the receiving
schema's two clocks collapse onto receipt time for this emitter. Both are
correct divisions of labor and both are the emitter *declining* to assert
what it cannot witness.

The interesting decision is what `customer_id` holds. The token wallet
this product debits is the **org's** — a team shares one workspace and one
balance — but `chargeForOperation` returns `user.id`, the **person's**, and
the doc-comment states why as a dated decision rather than an accident
(`src/lib/tokens/guard.ts:62-67`, returned at `:96-100`): "the token WALLET
is the ORG's … `userId` below stays the PERSON for LightTrack attribution
(Polar orders echo metadata.userId)". The revenue half closes the loop —
`polarEventToRevenue` reads the customer off `metadata.userId` of the
verified webhook payload (`src/app/api/polar/webhook/relay-revenue.ts:32-35`),
and its header states the invariant plainly: "customer is keyed on
`metadata.userId` (the same id LLM events carry, so margin joins)"
(`:45-50`). Two systems, two identities available, one deliberately
chosen — which is the whole content of the technique's "attribution is
decided at write time", and the same discipline the software-engineering
bundle's cost-metering subject names as spend-attribution.

## Attribution as ambient context, not a parameter

The technique assumes the emitter knows its customer at the call site.
Here it does not: the LLM seam sits several frames below the route, and one
caller is an agent. So the value rides an `AsyncLocalStorage` billing
context (`cost-telemetry.ts:3`, `:25`) opened by the route envelopes —
`runWithBilling({ customerId, feature }, fn)` (`:28-30`) — and read by a
single private accessor, `currentBilling()` (`:32-34`), which returns `{}`
when no scope is active. The shared metered NDJSON envelope wraps the whole
producer in it (`src/lib/server-action/metered-stream.ts:60-63`, taking
`billedUserId` from the charge handle at `:28-29`, itself surfaced for
exactly this purpose at `src/lib/server-action/charge-route.ts:44-45`); the
Gemini seam then emits without knowing who it is for
(`src/lib/llm/gemini.ts:61-70` on the unary path, `:114-122` on the
streaming one, where usage is only readable from the aggregated response).

This is a genuine addition to the technique's discipline rather than a
violation of it. Rule one — named readers, not string literals — is
satisfied twice over: `currentBilling()` is the only reader of the context
and `trackLlm` the only writer of the keys, so the string `customer_id`
appears in one place in the codebase. What the async store buys is that a
*new* deep call site becomes attributable with no signature change. What it
costs is that a call site outside any billing scope emits silently
unattributed, and the repo has already paid that bill once:
`src/features/org-autofill/engine.ts:101-115` records incident
`AUTOFILL-TELEM-1` — a grounded-search model constructed outside the
`src/lib/llm` seam emitted no telemetry at all, "the prod web-search
grounding cost was invisible" — and the fix explicitly reads "the AMBIENT
billing context … so it stays untagged if a future caller runs it outside a
billing scope". Ambient attribution turns a missing parameter (a compile
error) into a missing key (a silent bucket); the trade is worth making only
with the receiving side's unattributed bucket actually watched.

## Untagged is a bucket here too, deliberately

`currentBilling()` returning `{}` leaves both keys `undefined`, which
`JSON.stringify` drops — the row arrives with no `customer_id` rather than
with a default one, which is the technique's third rule honored by
construction. The offline research worker makes the same choice knowingly:
it cannot import this module at all (it is `server-only` and unresolvable
under `tsx`) and posts through the raw client instead, "minus the
per-customer ALS (the worker runs on the operator's subscription, not a
metered customer)" (`src/features/grant-research/telemetry.ts:1-11`). The
deviation is that nothing on this side measures how large that bucket is;
the emitter is right to leave the key absent, but adoption of tagging is a
number, and here it exists only in the receiver.

## Deterministic ids on the revenue key, and a two-second budget

`trackRevenue` (`cost-telemetry.ts:82-105`) prefixes the settled Polar
order id into the record's own id — `polar:<orderId>`, or
`polar:refund:<orderId>` for the refund kinds (`:93`) — while keeping the
raw `external_id` beside it (`:95-97`). Redelivery of a webhook therefore
upserts the same row rather than double-counting revenue, and a refund can
never collide with the order it reverses even when Polar reuses the order
id as the refund's subject. That is this bundle's billing-revenue
normalization ground — deterministic-external-ids and
idempotent-revenue-upsert — realized from the producing end, and it is what
makes the cost/revenue join safe to recompute rather than merely correct
once.

The whole module is best-effort by contract, and the contract is written
where it can be read: no-op unless `LIGHTTRACK_URL` and `LIGHTTRACK_KEY`
are both set (`:36-41`), every POST time-boxed at two seconds with an
`AbortController` (`:46-47`), every error swallowed with the reason stated
in the catch — "telemetry must never break the host request" (`:55-59`).
Call sites match it: the LLM seams fire and forget with `void`
(`gemini.ts:64`, `engine.ts:109`), and the Polar webhook awaits the relay
but documents that it "swallows its own errors, so Polar still gets its 200
regardless" (`src/app/api/polar/webhook/route.ts:266-270`) — the one place
where awaiting is right, because the alternative is an unflushed send on a
serverless invocation that is about to end. The header's other warning is
worth transplanting on its own: this module is not
`src/lib/lighttrack.ts`, the product's unrelated first-party funnel client
(`:5-7`). A cost feed and a product-analytics feed that share a vendor's
name in one codebase is exactly the collision that gets an event routed to
the wrong sink.
