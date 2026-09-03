---
subject: extension-trust-boundary
domain: software-engineering
last_touched: 2026-09-03
touched_by: intake
dry_streak: 0
---

# extension-trust-boundary

First touch: [[2026-09-03-vllm]]. NEW subject in `security/` (flat, now 9), 4 techniques,
3 applications.

## What the gap actually was

Loading operator-supplied code into a running service. `supply-chain` owns third-party code
provenance; this is code the operator DELIBERATELY loads. Nothing modelled the trust
boundary itself.

The organizing decision: one discovery mechanism serves several extension groups, and the
group that attaches network-reachable routes INVERTS the default - nothing loads unless
named, while every other group loads all unless narrowed. A default belongs to a group's
blast radius, not to the mechanism, and a uniform default across groups of unequal exposure
is a bug that looks like consistency.

The honesty finding is worth as much: route collision is unenforced and last-registration
wins, so an allowlisted extension can shadow a core route. The response is not a check - it
is writing the capability down, telling operators to inspect the route table, and asking for
namespaced prefixes. An unmitigated hazard gets documented as a capability the trusted party
HAS, not omitted until the check ships.

## Still open

A deviation held rather than lowered: the tree logs-and-skips every failed registration; the
worker made failure policy an explicit per-group choice with a mandatory log obligation
either way. The technique was carried to the one fleet project with a plugin host and came
back not-better - it already inverts the default for its exposed surface and sandboxes
besides. The residual gap is narrower than the technique: a global on/off rather than a
per-module allowlist. Return when a module set is operator-supplied rather than shipped.
