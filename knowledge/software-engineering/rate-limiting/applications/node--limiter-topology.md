---
layer: application
type: application
subject: rate-limiting
technique: limiter-topology
stack: node
---

# Two scopes, two horizons, and one unreachable store

`src/lib/rate-limit.ts` guards a serverless public funnel where instance count
is elastic and every admitted request can spend inference money. Its header
(`:1-22`) states the topology before any code: a **per-IP burst** layer that is
always in-process, and a **global spend ceiling** that can be backed by a shared
store. The reasoning for the split is the technique's distribution stance,
argued rather than assumed — a burst "arrives over seconds and is normally
pinned to one instance, [so] a per-instance burst cap is a real cap", while the
global ceiling's in-process value is "(instances × limit), which RISES with
autoscaling — i.e. loosens exactly when abuse peaks".

## Layer ordering, and what a rejected request may charge

Two numbered invariants sit above `rateLimitRequest` (`:127-142`):

- **"QUOTA #1: a request that is over its PER-IP cap must NOT consume the shared
  global budget"** (`:131-135`) — charge per-IP first; if over cap, "reject
  WITHOUT touching the global window", so "one abuser (contained by its own
  per-IP cap)" cannot "become the lever to DoS everyone via the shared pool".
  The shared-store variant preserves it by refusing before the network hop is
  even made (`:173-175`), which also keeps the abuser off the store.
- **"QUOTA #2 (self-perpetuation)"** (`:137-141`) — `hit()` checks the cap
  before recording (`:88-97`), so a rejected request is never written into the
  window that rejected it. The comment above the fix carries the incident it
  replaced: the old code "pushed `now` UNCONDITIONALLY", so "a ~1s spike became
  a sustained full-window lockout that never drained while legit traffic stayed
  ≥ limit/window" (`:76-84`). This is the same invariant the sliding-window
  family enforces in this bundle's other application, reached here from the
  opposite direction — a production lockout rather than a design rule.

**Deviation:** the layers are charged sequentially, not all-or-nothing. In
`rateLimitRequest` (`:143-150`) the per-IP `hit()` *records* before the global
check runs, so a request admitted per-IP and refused globally has still spent
per-IP allowance on work that never happened — the fairness leak the technique's
"evaluate all, then commit all" rule exists to prevent, and it surfaces exactly
when the global ceiling is saturated. QUOTA #1 fixes the ordering in one
direction only.

## Fail closed when the shared state is unreachable

The store contract deliberately withholds the policy: `hit()` "resolves to
`null` when the store is UNREACHABLE — the caller decides what an unknown answer
means" (`src/lib/rate-limit-store.ts:27-37`), and the driver returns `null`
after tripping its breaker rather than guessing (`:121-122`). The caller then
implements the technique's rule in `rateLimitRequestShared` (`:177-190`), with
the reasoning in the header (`:15-21`):

- **The store's presence is the declaration.** "Configuring a shared store is an
  explicit statement that the fleet needs ONE hard ceiling; silently degrading
  to in-memory on an outage restores the exact (instances × limit) hole the
  operator paid to close, on endpoints that spend real inference money per
  request."
- **Recoverability, not criticality, picks the direction.** "A rejected free
  scan is recoverable in a minute; a denial-of-wallet is not."
- **The override is opt-in and its degradation is bounded.** Availability-first
  operators set an environment flag to fall back to the in-memory ceiling
  (`:184-187`), and the header states the bound rather than hand-waving it:
  "the per-IP burst cap is in-memory and keeps working either way, so failing
  open is a bounded (not unlimited) degradation." That is only true because the
  layers are separated as they are — the topology is what makes the fallback
  defensible.
- **An unevaluated refusal offers no honest retry-after.** The fail-closed
  return uses one full window, because "the store's state is unknown, so there
  is no honest shorter estimate" (`:189-190`) — in contrast to the evaluated
  path, which computes from the oldest in-window hit (`:94-96`).

## The same sentinel, opposite directions, two horizons

`clientIp` collapses every caller it cannot attribute into one literal "unknown"
bucket so unidentifiable callers "are limited COLLECTIVELY (fail closed), never
per spoofed value" (`:52-70`), under a declared trust model for how many proxy
hops may be believed (`:26-43`). The 30-day quota keyed on the same sentinel
inverts the direction on purpose, and says why
(`src/lib/public-scan-quota.ts:110-120`): that pooling is "the right fail-CLOSED
choice for the per-minute burst limiter (bounded blast radius), but in this
30-day persistent quota it would collapse EVERY anonymous visitor into ONE
monthly bucket: after the first few public scans the whole free funnel is locked
out for a month (looks like an outage, not a quota)". So the long-horizon gate
flags the caller `unidentifiable` and treats the quota as unenforceable
(`:220-224`, `:295-299`), and the refund path skips it too because such a caller
was never charged (`:353-356`). One identity, two limits, opposite unknown-key
policies — each written where the sentinel is produced.

## Other deviations

- **Refusals are naked.** `tooManyRequests` (`:215-220`) emits a prose message
  plus `retry-after` only; the body names neither the limit, the window, nor
  which layer refused — a caller cannot tell "you are limited" from "everyone
  is limited". The monthly gate does better, carrying
  `code`/`remaining`/`resetAt`/`scope` plus quota headers, and deriving the
  published limit from the scope that actually tripped
  (`src/lib/public-scan-quota.ts:384-404`).
- **The reaper is opportunistic.** Per-key state is pruned only when the map
  exceeds 10,000 entries and only for fully-aged keys (`:101-103`) — no
  scheduled cadence, no bound on the sweep, no metric. It bounds the common
  case, not the hostile one.
