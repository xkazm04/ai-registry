---
layer: technique
type: technique
subject: generative-provider-routing
technique: capability-to-vendor-plan
status: forged
laws: [cost-per-usable-output, refusal-is-a-state]
shared_with: []
use_when: [adding a second generation vendor, a surface wants to name a specific model, splitting dev and prod vendor choices]
---

# Capability-to-vendor plan

The plan is the one table that answers "who serves this kind of work, in what
order, in this environment". Everything else in provider routing hangs off it:
the re-route walks it, the steer permutes it, the trail records departures
from it. Get the table's ownership wrong — let call sites name vendors — and
none of the downstream policies can exist, because there is no chain to walk.

## The contract

- **Callers name capabilities.** The capability set is small and
  verb-shaped — generate, edit, recognize — and it is the entire vocabulary a
  surface may use. A caller that imports a vendor adapter directly has nailed
  an environment decision into a user interface; the routing layer exists so
  that changing vendors is a one-line table edit, not a search across
  surfaces.
- **One plan per environment.** Development and production legitimately want
  different vendors: development iterates on whatever is cheap and already
  keyed; production runs the single vendor the style system and reference
  windows were tuned against. Both plans live in the same table, side by
  side, so the difference is visible and reviewable rather than emergent from
  scattered environment checks.
- **Order is a measurement.** The first entry per capability is not the
  incumbent or the famous vendor; it is the one that currently wins on cost
  per usable output ([cost-per-usable-output](../../_laws.md#cost-per-usable-output)).
  When a measured comparison flips, the table flips, and the comment above
  the row cites the measurement — the plan is where that verdict is *acted
  on*, so it is where the verdict is worth restating.
- **Trailing entries are re-route targets, not load balancing.** They are
  reached only when an earlier vendor refuses, rate-limits, or lacks a key
  ([refusal-is-a-state](../../_laws.md#refusal-is-a-state)). A vendor kept in
  the chain purely as a refusal exit is a legitimate plan entry even when it
  loses the economics — its job is to exist when the primary declines.
- **A capability row may be deliberately short.** A vendor whose "edit" is
  really only background removal does not belong in the edit row at all;
  listing it would make the router hand it work it cannot do. Absence from a
  row is a statement, and it deserves a comment saying why.

## Steering: reorder or remove, never escape

Callers get exactly two steering fields, with asymmetric strength on purpose:

- **Prefer** reorders. It is honoured only when the named vendor is already
  planned for the capability *and* configured; otherwise it is silently
  dropped and the plan order stands. Dropping is correct: the caller asked
  for a better first try, not for a failure, and which vendor actually served
  is visible afterwards in provenance, so a dropped preference is auditable.
- **Avoid** removes, with teeth. The vendor is filtered from the chain for
  this request, and if that empties the chain the request fails with
  "no alternative" rather than serving the avoided vendor anyway. The caller
  sending an avoid has just been refused; landing them back on the refuser
  would convert their one recovery move into a lie. In a single-vendor
  production plan, avoid therefore *always* fails — which is honest, and
  surfaces the real problem (the plan has no refusal exit in this
  environment) instead of masking it.

A steer never promotes a vendor that is not in the plan. If a surface needs a
vendor the plan does not list for that capability, that is a plan edit with a
reason attached, not a request parameter.

## Decision rules

- When a new vendor arrives, it enters the plan *behind* the incumbent until
  a usable-output comparison says otherwise. Enthusiasm is not a position.
- When a plan entry cannot serve its capability at all, treat it as a bug in
  the table, not a runtime condition: fail loudly on first use rather than
  quietly walking past it forever.
- Expose the plan (and the steered order) read-only to diagnostics, so probes
  and status surfaces report the same truth the router acts on instead of
  restating the rules and drifting.

## When not to use this

A pipeline with genuinely one vendor and one capability does not need the
table — but it still needs the *seam*: a single module through which every
call passes. The day the second vendor arrives (and it will — refusals alone
force it), the seam becomes the plan without touching any call site. What is
never acceptable at any scale is vendor calls scattered across surfaces,
because every downstream technique in this subject assumes a chokepoint to
attach to.
