---
layer: application
type: application
subject: generative-provider-routing
technique: capability-to-vendor-plan
stack: node
status: forged
verified_on: 2026-11-16
verified_against: node@24
applied: simulation
ab_verdict: better
---

# Node — a plan table with a named-only list beside it

`gravitone-gcloud` routes every image call through `lib/imaging/router.ts`. Its
`PLAN` table (`router.ts:72-113`) is this technique's contract as written: one
row per capability per environment, the dev `generate` order justified in a
comment by a measured 60-cell usable-output grid (`router.ts:74-93`), a
deliberately short `edit` row with the reason written beside it (`router.ts:94-97`),
and a single-vendor production plan (`router.ts:108-112`). `planFor` and
`orderFor` are exported so probes report the order the router acts on
(`router.ts:148-153`, `router.ts:217-243`). Read at `fc26e172` (2026-11-16); the
version witness is the CI pin `node-version: 24` (`.github/workflows/gates.yml:252`).

The finding is what the tree built **beside** the table, because the technique's
absolute ("a steer never promotes a vendor that is not in the plan") had no room
for it.

## Three vendors that may never be a fallback

`PREFER_ONLY` (`router.ts:126-143`) holds three providers that are in no plan row
in either environment:

- the Leonardo web studio, which spends the operator's prepaid studio credits
  through their own signed-in browser (added `0620bb20`, 2026-10-12);
- Leonardo Flare (GPT Image 2.5 over the API key), the operator's 2026-10-22
  ruling for one surface's stills (`50c15337`);
- Codex `image_gen` on the operator's ChatGPT seat, which "bills no image; its
  quota is the real limit" (`providers/codex.ts:1-8`, `261ed3fa`, 2026-11-08).

The header states the rule in billing terms. A request that "chose whose
credits to spend is not quietly moved onto a vendor billed in dollars because
the studio's browser was closed. It fails with the studio's own sentence
instead" (`router.ts:126-139`). The mechanism is one line at the top of
`orderFor`: a named prefer-only provider is returned as the whole chain,
"configured or not", unless `avoid` names it too (`router.ts:223-226`). A
second guard keeps such a provider out of any row even if someone adds one
(`router.ts:228-230`).

Pinned by test, with a mutant: probe 1d asserts that no plan row in either
environment holds a prefer-only provider and that naming one yields exactly
`[it]` (`tests/golden-path/imaging-studio.probe.spec.ts:153-165`). Probe 2a
asserts that an unconfigured studio ends in `no-key` with a dollar vendor
configured and not billed (`:173` onward). Mutant `studio-prefer-only-off`
(`tests/mutants/registry.ts:188-192`) flips the avoid test.

This is the shape the 2026-11-16 amendment to the technique describes: a
named-only list that is part of the table, with its reason, and a named request
that replaces the chain with no fallback. A multi-provider gateway offers the
same move as a pinned order with fallbacks disabled (sources below).

## Defect: the steer's type documentation still says it cannot escape

`ProviderSteer`'s docstring says a steer "reorders the router's plan, it never
escapes it: a vendor that is not planned for the capability, or has no key, is
not promoted", and `prefer` is documented as "Try this vendor first, if it is
planned for the capability and configured" (`lib/imaging/types.ts:63-69` at
`fc26e172`). The router does the opposite for three vendors, unplanned and
unconfigured alike (`router.ts:226`), and probe 1e shows a named studio request
served in production, where the plan is Google alone. Behaviour and tests agree.
Only the type documentation is behind, so a reader of the request type is told
a rule the router no longer keeps. Not fixed here: the tree is read-only for this
run.

## Interaction with the unreached-plan-top report

`unreachedPlanTops` (`router.ts:181-194`) compares each capability's plan top
with the providers that served it in the window, and `reachByCapability` counts
every served row, named-only ones included (`budget.ts:354-363`). With Codex
reached by name as the default for the scout stills
(`lib/foundry/scout/stillEngine.ts:4,28`), a window in which no other surface
reaches the dev plan's `agy` will report `generate` as having an unreached top,
served by `codex`. The report is true, but its cause is the named-only route,
not a stale grid or a thrifty run. Neither of those two causes in the report's
own header applies. Read, not run: no live meter window was inspected.

## Sources (accessed 2026-11-16)

- https://openrouter.ai/docs/guides/routing/provider-selection — `order` is a
  prioritised list; `allow_fallbacks` (default true) controls "whether to allow
  backup providers when the primary is unavailable"; the example with fallbacks
  disabled "tries DeepInfra, and then fails if DeepInfra fails."
