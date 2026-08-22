---
layer: application
type: application
subject: retry-backoff
technique: storm-control
stack: node
verified_on: 2026-08-22
---

# Storm control in the AWS Smithy TypeScript retry stack (Node)

How the retry layer shared by every AWS SDK for JavaScript client realizes the
storm-control technique. Citations are against `@smithy/core` 3.33.3,
`awslabs/smithy-typescript` commit `6815d3e` (2026-08-20), submodule
`packages/core/src/submodules/retry/`. This is a reconciliation against an
external, world-class tree — not the consumer repo the sibling applications
cite — so the pin lives here in prose rather than in `verified_against`, whose
contract is a stack runtime version.

## 1. The retry budget is a token bucket denominated in successes

`StandardRetryStrategy` opens with `capacity = INITIAL_RETRY_TOKENS` (500,
`util-retry/constants.ts:30`) held **per strategy instance — one per client,
shared by every operation that client issues**. That scoping is the technique's
cross-item cap: no individual call owns the budget, so a correlated failure
across all of a client's traffic drains one shared number instead of passing
per-call audits while the fleet hammers the dependency.

Every retry spends from it — 5 tokens for a throttling retry, 10 for a
transient one, the class that includes timeouts and network failures
(`constants.ts:37,45`; resolved in `getCapacityCost`,
`StandardRetryStrategy.ts:192-194`, debited at `:122`) — and the bucket refills **only from
successes**: a retried call that succeeds refunds its recorded cost, and a
call that succeeds first-try drips back `NO_RETRY_INCREMENT = 1`
(`recordSuccess`, `StandardRetryStrategy.ts:141-143`). The refill rule is the
budget's denominator: retry capacity is a function of recent *successful*
volume, so a dependency that stops succeeding starves the very budget that
would be spent hammering it. That is the technique's "stated fraction of
recent request volume" implemented without a clock — the window is replaced by
the success stream itself.

## 2. Refusal is classified inside, erased outside — a recorded deviation

Internally the strategy is exemplary: a priority-ordered refusal vocabulary
`{incompatible: 1, attempts: 2, capacity: 3}` (`StandardRetryStrategy.ts:38-51`)
computed in one place (`retryCode`, `:178-190`), so "budget exhausted" is a
distinct verdict from "error not retryable" and "attempts exhausted".

Then the boundary throws all three away. Every refusal becomes the same
generic `throw new Error("No retry token available")` (`:138`), and the
middleware catches even that and rethrows the **last dependency error**,
annotated only with `$metadata.attempts` and `$metadata.totalRetryDelay`
(`middleware-retry/retryMiddleware.ts:87-94`). A caller — and any dashboard
built on caller-visible errors — cannot distinguish "the dependency kept
failing" from "the storm cap denied further retries". The technique's rule
that a denial is a policy outcome, spelled and counted, never disguised as a
dependency failure, is violated on the observable surface even though the
classification exists two frames below it. `getCapacity()`
(`StandardRetryStrategy.ts:149-151`) exposes the raw level for integrations,
but nothing counts denials. The standard stays; the deviation is the finding.

## 3. Adaptive pacing activates only on evidence of a storm

`AdaptiveRetryStrategy` wraps the standard one and adds `DefaultRateLimiter` —
client-side send pacing that is **off until the first throttling error**
(`enabled = false`, `DefaultRateLimiter.ts:59`, flipped only by
`enableTokenBucket()` at `:139`). In calm weather it costs nothing; after the
first throttle it cuts the permitted send rate to `beta = 0.7` of the measured
rate and recovers along a CUBIC curve, capped at twice the currently measured
throughput (`:138-145`, `cubicThrottle`/`cubicSuccess` `:189-201`). Pacing is
applied to **initial sends, not just retries** —
`acquireInitialRetryToken` awaits `getSendToken()`
(`util-retry/AdaptiveRetryStrategy.ts:47-49`) — which is the technique's "pace
the release": the whole fleet is metered through the recovering window, not
merely the retry tail.

## 4. Jitter everywhere, server hints bounded

The backoff is full-jitter — `t_i = b · min(x · 2^i, 20 000ms)` with `b`
drawn uniformly per attempt (`DefaultRetryBackoffStrategy.ts:18-20`) — so
equal delays never re-synchronize a correlated herd. A server-supplied
`retryAfterHint` is honored but **clamped into
`[computed, computed + 5s]`** (`StandardRetryStrategy.ts:103-108`): backpressure
from the dependency is respected without letting a hostile or broken header
schedule an unbounded sleep. Retries also announce themselves to the server —
`amz-sdk-request: attempt=N; max=M` (`constants.ts:68`) — giving the far side
the aggregate view this technique usually has to reconstruct.

## 5. Bounded state by construction, constants as versioned policy

The entire storm-control state is a handful of scalars per client instance —
capacity, fill rate, measured rate — so the technique's unbounded per-key map
hazard is designed out rather than reaped: the failure-domain key IS the
client. And the constants are treated as tunable policy, not physics:
`retries-2026-config.ts` carries an env-flagged recalibration
(`SMITHY_NEW_RETRIES_2026`) that retunes base delay 100→50ms, throttling delay
500→1000ms, and raises the transient retry cost 10→14 — the aggregate posture
of every SDK client, changed behind a flag with the old values still one
switch away.

## Reconciliation summary

Confirmed: cross-item budget scoped to the failure domain; refill as a
fraction of success volume; evidence-gated pacing of the whole send path;
full jitter; bounded state. Deviation: refusal classification erased at the
caller boundary, denials neither surfaced nor counted. Not present here by
scope: warn-once log latching — a library this deep leaves log discipline to
its callers, so the technique's logging rules land on the SDK consumer, not
this layer.
