---
layer: technique
type: technique
subject: cost-metering
technique: budget-enforcement
status: forged
laws: [gate-sees-target, one-validation-door]
shared_with: []
use_when: [enumerating every path that can start metered spend, a lowered ceiling still letting calls through, choosing fail-open or fail-closed when the store is down, a ceiling that drains on cache hits or busy-rejections]
---

# Budget enforcement

A budget is a promise that spend stops at a line. Everything else in the
subject informs; this technique is where the product actually refuses to
spend money. The test of an enforcement design is brutally simple —
enumerate the paths that can initiate metered spend, and for each one, point
at the check. Any path without a check is where the overrun comes from, and
[a gate that does not see its target](../../../../_laws.md#gate-sees-target) is
not a gate.

## Scopes: ceilings live at more than one level

Real budget requirements are nested, and the levels fail differently:

- **Per-run** — a single execution (a job, a chain, an autonomous loop) gets
  a ceiling so that one runaway prompt cannot consume the month. This is the
  tightest loop: checked between steps of the same run, against the run's
  own accumulated spend.
- **Per-actor** — an agent, a persona, an automation identity. Bounds the
  blast radius of one misconfigured actor across many runs.
- **Per-period** — the monthly ceiling against the organization's real
  budget, evaluated against the period ledger sum with the boundary
  semantics of [usage-ledgers](./usage-ledgers.md).

A call proceeds only under *all* applicable ceilings. The scopes compose by
conjunction — the strictest one binds — and each refusal names which scope
refused, because "blocked by run ceiling" and "blocked by monthly ceiling"
demand different responses from whoever unblocks.

Two declarations every ceiling carries, both learned the hard way:

- **Its scope and period are part of its identity, not context.** A bare
  configurable number ("budget: 50") *will* be read as a monthly cap by one
  enforcement point and a per-call cap by another — silently authorizing a
  single call the size of the month, or failing every call at the month's
  intended total divided by nothing. The field's name, type, or schema says
  what it bounds and over what period; a number that doesn't say cannot be
  enforced consistently by two readers.
- **The sentinel for "unlimited" is explicit.** Zero and absent are both
  common encodings; whichever is chosen, every enforcement point interprets
  it identically — one gate that treats zero as "unlimited" next to one
  that treats it as "always over budget" pauses real work permanently and
  invisibly.

One structural honesty note: without a reservation step, every ceiling is
check-then-spend — the gate admits a call whose cost is only known after it
completes, so the ceiling can be overshot by up to one worst-case call (or
one per concurrent lane). For fan-out runs this generalizes to **launch-gate
semantics**: the aggregate ceiling bounds "start no new work past the line",
while the per-call cap bounds the call already in flight. The overshoot
bound is a number; declare it rather than implying the ceiling is exact.

## Enforcement points are enumerable, and few

The structural move that makes enumeration tractable: route all metered
calls through **one chokepoint** — the same client wrapper, dispatcher, or
gateway — and enforce there, once. This is
[one validation door](../../../../_laws.md#one-validation-door) applied to spend:
a check sprinkled across call sites is a check minus the call site added
next quarter. With a chokepoint, the enumeration collapses to "every path
uses the client; the client checks" plus a short, auditable list of
legitimate exceptions.

Two path classes deserve explicit attention because they are where
enumeration typically fails:

- **Unattended initiators** — schedulers, event triggers, retry loops. These
  spend without a human watching, so they carry the *hard* gates
  (see [preflight-estimation](./preflight-estimation.md)): a scheduled run
  whose actor or period budget is exhausted is skipped *at trigger time*,
  recorded as skipped-for-budget — a distinct outcome, not a silent no-op
  and not a failure.
- **Amplifiers** — retries, self-healing loops, continuation calls. Each
  amplified call is a fresh spend decision and re-passes the gate; an
  exemption for "internal" retries is the classic enumeration hole, because
  amplifiers are precisely the paths that multiply cost during incidents.

## What a blocked call reports

A refusal is a first-class outcome with a contract, not an exception that
bubbles into a generic error path:

- **Machine-readable**: which scope, which ceiling value, current spend,
  and the period window if period-scoped — enough for a caller to decide
  whether to queue, degrade, or surface.
- **Human-actionable**: the surfaced message says what was blocked, by
  which budget, and what raises it. "Budget exceeded" with no scope sends
  the operator hunting through every ceiling in the product.
- **Recorded**: blocked calls are counted (though they cost nothing) —
  refusal volume is the budget system's own health metric, and a spike in
  refusals is either a legitimate ceiling doing its job or a stale cache
  doing damage, and the count is how you find out which.
- **Never spends.** The block happens before the provider is contacted. A
  "block" that cancels a call already in flight has already paid for the
  input.
- **Overridable where a human owns the budget — explicitly and recorded.**
  A ceiling is an authorization, and the person it protects may
  re-authorize: an interactive block can offer a deliberate "proceed
  anyway", scoped narrowly (this actor, this session) and recorded as an
  override rather than erased as if the ceiling never fired. Unattended
  paths get no such door — there is nobody present to own the decision.

## Guard ordering: the cheap refusal runs before the durable charge

A real entry point stacks several guards — an oversized-payload rejection, a
concurrency slot, a per-caller rate limit, the budget charge. They are
usually written in the order they were added, and that order is a bug: **any
guard that can refuse must run before any guard that commits durable state**,
because a request refused after the charge has spent budget on zero provider
work.

The concrete instance is a concurrency limiter next to a budget charge. With
the charge first, every request that loses the race for a slot still burns a
unit of the ceiling and a unit of the caller's rate budget — so a traffic
spike drains the day's budget through requests that were never served, and
the ceiling's own refusals then look like demand. With the slot first, a
server-busy rejection costs the caller nothing.

The general rule, in the order the checks should appear:

1. **Free, local refusals** — malformed or oversized input, decided from
   metadata before the body is read.
2. **Cheap, reversible reservations** — an in-process slot, a lease. Taken
   before anything durable, released explicitly on every later failure.
3. **Durable charges** — the rate ledger and the budget ledger, last,
   because they are the only step whose undo is a compensating write.

Steps 2 and 3 acquire an obligation the caller must discharge, so the
contract has to be stated where it is granted: on success the caller holds a
slot and *must* release it in its own cleanup path; on any refusal it holds
nothing and must not. An entry point that releases a slot it never took is
the mirror bug, and it is quieter.

## Every non-provider outcome is a refund path — enumerate them with the charge

Because the charge happens before the work, the charge is provisional, and
**every outcome that does not reach the provider owes a refund**. The set is
larger than it first looks, and the failure mode is not a wrong refund but a
*missing* one: a ceiling that drains on repeats, so the product refuses
paying customers while having spent nothing.

The outcomes worth enumerating explicitly, because each is easy to forget:

- a hit in the in-process cache;
- a hit in the durable cache — did zero provider work, exactly like the
  first, and is the one people miss because it is asynchronous;
- a refusal by a *later* guard (a per-actor quota checked after the global
  ceiling);
- a thrown or aborted generation;
- a degraded response served without contacting the provider at all —
  a canned or demo result;
- a result served from the caller's *own* credentials rather than the
  product's, which costs the product nothing by construction.

Two rules keep this honest. First, the refund set is written **at the charge
site**, not discovered at each early return: a charge whose refund set is not
enumerated where the charge is made is a ceiling that drains on repeats, and
the next early return added to the function will not know it owes anything.
Second, when a request charges more than one ledger — a global spend unit and
a per-user quota unit — each early return must state which ledgers it
refunds; a partial refund is worse than none, because it produces a
discrepancy that reconciliation reports as unexplained spend.

Refunds are also what makes the refusal counter interpretable. Blocked calls
are counted; refunded charges must be counted too, or the ledger's totals and
the provider's invoice diverge by an amount nobody can attribute.

## Ceilings change; caches must hear about it

Enforcement reads two values per check — the ceiling and the accumulated
spend — and both get cached, because the check sits on the hot path of
every call. The cache rules:

- **Ceiling changes invalidate immediately.** When an operator raises or
  lowers a budget, every cached snapshot of that ceiling is stale the same
  instant; a lowered ceiling that takes effect "within the TTL" is a window
  where the product knowingly spends against a revoked authorization. The
  write path for ceilings pushes invalidation; it does not wait for expiry.
- **Spend accumulation may lag bounded-ly.** A short TTL on the spend sum is
  a legitimate trade — the exposure is bounded by (TTL × maximum spend
  rate), which is a number a team can decide to accept. State the bound;
  an unstated TTL is an unstated overdraft limit.
- **The gate reads the same store it enforces.** A gate consulting a
  secondary copy of either value — a frontend mirror, a stale snapshot —
  [is gating a proxy](../../../../_laws.md#gate-sees-target), and passes exactly
  when the proxy diverges.

## Fail-open or fail-closed, chosen out loud

Eventually the ledger or budget store is briefly unreachable at check time,
and the gate must act without its numbers. Neither answer is free:
fail-closed halts spend and therefore the product's paid functionality
during an internal blip; fail-open keeps the product alive and meters
nothing while it lasts. The technique does not pick a universal winner — it
demands the choice be **explicit, per initiator class, and logged when
exercised**. The defensible defaults run: fail-open for interactive calls
(a human is present, volumes are self-limiting, availability wins),
fail-closed for unattended and amplified paths (nobody is watching, volume
is unbounded, and "the scheduler spent all night unmetered" is the exact
scenario budgets exist for). Every fail-open pass during an outage is
counted and later reconciled against the ledger, so the unmetered window
has a size, not a shrug.

## Smells

- Metered calls from more than a handful of files, no chokepoint —
  enforcement by memo.
- Retry or continuation paths that inherit the original call's gate
  decision instead of re-checking.
- A refusal surfaced as a generic provider error.
- Budget edits that take effect "eventually" (TTL-expiry semantics on
  ceiling changes).
- No stated behavior for ledger-unavailable-at-check-time — which in
  practice means fail-open, undeclared.
- Zero recorded refusals ever: either every ceiling is generous beyond
  reach, or the gates are not actually on the paths that spend.
- A durable charge committed before a guard that can still refuse — the
  busy-rejection that costs budget.
- An early return from the metered path with no statement of which ledgers
  it refunds, or a refund set discovered at the returns instead of declared
  at the charge.
- A cache hit that is metered: the clearest proof the charge is not
  provisional, and the fastest way to drain a ceiling on repeats.
