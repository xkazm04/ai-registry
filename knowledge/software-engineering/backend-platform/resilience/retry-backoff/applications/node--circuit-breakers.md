---
layer: application
type: application
subject: retry-backoff
technique: circuit-breakers
stack: node
status: forged
verified_on: 2026-09-02
verified_against: node@22
---

# Breaker-as-filter and the over-budget wait in the Portkey AI Gateway (Node)

How an LLM gateway — one process every caller in an installation fans in
through, routing each request across a tree of interchangeable providers —
realizes two rules of this subject: the breaker's verdict used as a *filter over
candidates* rather than an admission decision, and a provider-stated retry-after
that is honoured inside a request budget and refused outside it. Citations are
against `Portkey-AI/gateway`, commit
`669825cbe89ee51569918b8f78a9db486fd69dd4` (read 2026-09-02); the tree is
TypeScript on the Web-standard runtime subset, run under Node 22 among others.

## 1. The breaker prunes the candidate list, and all-open falls through

Every routing node in a Portkey config carries a strategy (`fallback`,
`loadbalance`, `conditional`, `single`) over a list of `targets`, and each target
may arrive carrying an `isOpen` flag set by the breaker ledger. Immediately after
config inheritance and before the strategy switch, `tryTargetsRecursively`
filters (`src/handlers/handlerUtils.ts:646-657`):

```ts
const isHandlingCircuitBreaker = currentInheritedConfig.id;
if (isHandlingCircuitBreaker) {
  const healthyTargets = (currentTarget.targets || [])
    .map((t: any, index: number) => ({ ...t, originalIndex: index }))
    .filter((t: any) => !t.isOpen);
  if (healthyTargets.length) {
    currentTarget.targets = healthyTargets;
  }
}
```

The three-line body is the whole rule. Open targets are removed **only if the
removal leaves something behind**; when every target is open, `healthyTargets`
is empty, the assignment is skipped, and the strategy dispatches over the
original, fully-open list. An all-open state degrades to attempting, not to
refusing — the gateway cannot take itself down on the strength of its own health
inference, and the traffic that will eventually re-close a breaker is the
traffic that this fall-through allows.

The identity half is handled in the same expression: `originalIndex` is stamped
before the filter and read back wherever a leaf's address is constructed —
`` `${currentJsonPath}.targets[${originalIndex}]` `` at `:673` (fallback),
`:708` (loadbalance), `:761` (conditional) and `:776` (single). A leaf's log and
telemetry address is therefore its position in the *authored* config, stable
whether or not the breaker pruned its siblings.

Evidence flows back through an injected hook: after a successful leaf attempt,
`await c.get('handleCircuitBreakerResponse')?.(response, currentInheritedConfig.id,
currentTarget.cbConfig, currentJsonPath, c)` (`handlerUtils.ts:792-799`).

## 2. A stated retry-after wins inside a 60-second budget and ends the ladder outside it

`retryRequest` (`src/handlers/retryHandler.ts:65-220`) opens each request with
`let remainingRetryTimeout = MAX_RETRY_LIMIT_MS` (`:84`; the constant is
`60 * 1000` at `src/globals.ts:5`). On a retryable `429` with the
`useRetryAfterHeader` option set, it reads the stated delay through an ordered
accept-list (`src/globals.ts:7`):

```ts
export const POSSIBLE_RETRY_STATUS_HEADERS = [
  'retry-after-ms',
  'x-ms-retry-after-ms',
  'retry-after',
];
```

`find` takes the first header actually present (`retryHandler.ts:110-115`), and
the unit is bound to the *name*, not guessed from the value: only `retry-after`
is multiplied by 1000 (`:122-126`). Then the collision this subject's
`backoff-design` amendment names is resolved in eight lines (`:128-148`):

```ts
if (retryAfter >= MAX_RETRY_LIMIT_MS || retryAfter > remainingRetryTimeout) {
  retrySkipped = true;
  rateLimiter._timeouts = [];
  throw errorObj;
}
remainingRetryTimeout -= retryAfter;
rateLimiter._timeouts = Array.from({ length: retryCount - attempt + 1 }).map(() => 0);
throw await new Promise((resolve) => setTimeout(() => resolve(errorObj), retryAfter));
```

Inside the budget: the remaining computed rungs are zeroed — the stated schedule
genuinely outranks the ladder rather than being added to it — the process sleeps
exactly the stated time, and **the budget is debited by that wait** (`:138`), so
a second stated wait is measured against what the first left. Outside the
budget: nothing is truncated and nothing further is attempted. The pending
timeouts are cleared, `retrySkipped` is set, and the error is thrown out of the
retry wrapper, surfacing as `skip: true` on the return value (`:218`).

Retries are also off unless asked for: `normalizeRetryConfig` resolves
`attempts: retry?.attempts ?? 0` and leaves `onStatusCodes` an empty array
whenever attempts is zero (`src/handlers/services/requestContext.ts:148-155`) —
the retryable-status taxonomy is inert until an operator opts in. For a
component every caller fans in through, that default is the fleet's setting, and
it is the correct one.

## Where the tree falls short

**The over-budget stop has no spelling of its own.** `retrySkipped` reaches the
outer pipeline and lands in a *count*: `handlerUtils.ts:1284-1290` sets
`lastAttempt = -1` both when the attempts genuinely ran out
(`lastAttempt === (retry?.attempts || 0) && isRetriableStatusCode`) and when
`retrySkipped` is true, with the comment "All retry attempts exhausted without
success." Two different terminal states — *exhausted* and *the stated wait did
not fit the budget* — arrive at the operator as one sentinel in an integer
field, and the stated delay that caused the second, the single number that would
tell an operator whether 60 seconds is the right budget, is never recorded at
all.

**The budget bounds only the stated-wait path.** `remainingRetryTimeout` is
debited by `retry-after` waits and by nothing else: computed backoff rungs never
touch it, and the 60 seconds is a module constant unrelated to the caller's own
`timeout`. The technique asks for a total-time budget over the ladder; what
exists here is a ceiling on how much of the ladder a *provider* may dictate.
That is the more urgent half — remote input is the part that can be
unbounded — but it should not be read as the whole rule.

**No jitter, in the component that correlates the fleet.** `randomize: false` is
passed to the retry library (`retryHandler.ts:179`). Every caller behind one
gateway instance that fails at the same moment computes an identical schedule;
worse, the stated-wait path sets all remaining rungs to `0`, so a shared limiter
window expiring releases every held caller at once. This is the counterexample
cited into `backoff-design`'s jitter passage, not a variant reading of it.

**A date-form `retry-after` is silently discarded.** The parse is
`Number.parseInt(retryAfterValue.trim())`, so the HTTP-date form permitted by
the header's own specification yields `NaN`, falls to the `else` branch at
`:149-151`, and the request continues on the unjittered local ladder as though
no schedule had been stated — the accept-list is ordered correctly and then
loses one of the two legal encodings of its last entry.

**The all-open attempt is unmarked.** Nothing downstream can distinguish "this
target was attempted because it was healthy" from "this target was attempted
because every target was open and the filter fell through". The breaker's most
consequential decision is the one it leaves no record of.

**The prune is dormant without the hosted control plane.** Both halves — the
filter and the evidence hook — are gated on `currentInheritedConfig.id` and on
`c.get('handleCircuitBreakerResponse')`, which nothing in the open tree
registers. The open-source gateway contains the *consumption* of breaker state
and not its accumulation; the rule above is readable here, but a self-hosted
installation runs with `isOpen` never set. And the identity stamp is recovered
with `target.originalIndex || index` (`:665`, `:706`, `:753`, `:768`) — a falsy
`0` falls back to the post-filter index, which is correct only because a target
at original index 0 is always the first survivor when it survives. It is right
by coincidence of the filter's order-preservation, which is not the property a
`??` would have asserted.
