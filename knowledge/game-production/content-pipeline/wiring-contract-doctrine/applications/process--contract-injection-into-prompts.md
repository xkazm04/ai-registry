---
layer: application
type: application
subject: wiring-contract-doctrine
technique: contract-injection-into-prompts
stack: process
status: forged
verified_on: 2026-08-20
---

# Injecting the contract into the produce prompt

Two modules realize the authoring half of the doctrine in this repo, and they were
built at different times for different reasons — which is itself the lesson, since
for a long stretch the contract was graded and never stated.

## The generic sub-prompts

`src/lib/knowledge/wiring-requirements.ts:36` builds the `## Wiring Requirements`
block. Its four bullets are the four fields as four separate demands, exactly the
split the standard asks for, under one imperative header:

> For EVERY artifact you generate, make it runnable out-of-the-box — do not stop
> at "it compiles":
> - **Granting / registration**: state how the artifact is granted or registered
>   (ability granted to the ASC, GameMode class set, IMC added to the input
>   subsystem, component added to the actor).
> - **Activation**: state what triggers it at runtime (input action, gameplay
>   event, BeginPlay, overlap).
> - **Dependencies**: list the companion assets it needs and FLAG any
>   binary-content dependency (Widget/Animation Blueprint, Behavior Tree, `.umap`)
>   that cannot be authored from code.
> - **Verification**: give ONE observable check that proves the wiring works (a log
>   line, an on-screen value, a functional-test assertion).

Every clause of the technique is present: the named refusal (*do not stop at "it
compiles"*), the answer *shape* rather than the topic (each bullet's parenthetical
is a menu of real registration sites), the ONE-observable rule, and the
binary-content escape hatch — the legal way for the author to say "a human must
make this", without which it invents a plausible dependency instead.

The header comment at `:30` also records the noise rule: the function returns `''`
when there is nothing concrete to say (no per-artifact hints, no module assets),
because *"the generic boilerplate on its own is noise, so an empty wiring block is
skipped entirely rather than emitted on every code-gen prompt."*

## The per-step contract block

`src/lib/catalog/contractPrompt.ts` closes the gap the checker exposed. Its header
(`:9`) is blunt about what was wrong:

> The fleet authored 137+ `wiringContract` blocks and a pile of per-step `criteria`
> objects inside the pipelines' produce bodies. Until this module they were read by
> exactly ONE consumer — the acceptance checker — so every produce prompt asked a
> CLI to author an artifact WITHOUT telling it the contract the artifact would then
> be graded against.

`stepContractBlock` (`:141`) renders the step's own authored contract under the
header `# ACCEPTANCE CONTRACT FOR THIS STEP (you are graded against it)`, one
block per artifact, with gaps rendered as demands rather than omitted:

```
- **Granted by**: (undeclared — name it)
- **Verification**: (undeclared — name it, with its L0–L4 tier)
```

Then `CONTRACT_RULE` (`:136`) states the bar to the model in the checker's own
terms — and imports the number from the checker rather than restating it:

```ts
import { MIN_PROSE } from '@/lib/catalog/acceptance/wiringCheckers';

export const CONTRACT_RULE =
  `Reproduce these four wiring fields on the artifact you write (\`wiringContract\`). The L2 checker rejects a ` +
  `placeholder ("TBD"/"TODO"/"n/a"), any claim under ${MIN_PROSE} characters, and a \`verification\` line that ` +
  `names no acceptance tier (L0–L4). Name the REAL registration + trigger site.`;
```

That single import is the law-and-check-share-one-source discipline made
mechanical: raising the floor in the checker changes the prompt in the same commit,
and there is no paraphrase to drift.

Three further details match the technique point for point:

- **One renderer, three consumers** (`:22`) — the interactive lab step builder, the
  four-phase headless recipe builder, and the API step recipe all call the same
  module, "so the prompt is identical wherever a step is driven".
- **Injection only** (`:28`) — *"Nothing here re-derives, re-validates or grades a
  contract — no acceptance verdict can move because of this file."*
- **Capped with honest elision** (`:36-42`, `:165-176`) — `MAX_CLAIM_CHARS = 220`,
  `MAX_STEP_CONTRACT_CHARS = 2400`, `MAX_CATALOG_CONTRACT_ROWS = 24`,
  `MAX_CRITERIA_LINES = 12`. Whole blocks are kept while they fit, never truncated
  mid-claim, and the tail reports `_(N further contract block(s) omitted — prompt
  size cap.)_`. The caps are asserted against the live registry in
  `src/__tests__/lib/catalog/contractPrompt.test.ts`, so a newly authored contract
  cannot quietly blow up every prompt in the app.

## What a real authored contract looks like

`src/lib/catalog/pipelines/items.ts:372` — the affix step, annotated in-file with
the law it obeys:

```ts
grantedBy: 'UARPGInventoryComponent::EquipItem — creates one Infinite GameplayEffect handle per '
  + 'explicit affix in the item\'s rolled pool + one handle for the implicit; handles stored '
  + 'on the equip slot and removed on unequip.',
activatedBy: 'On-equip slot assignment (UARPGInventoryComponent)',
dependencies: ['UARPGAttributeSet (target attributes: MaxHealth, …)', 'GE_Affix_MaximumLife', …],
verification: 'L2: cppSymbolExists(UARPGItemDefinition) + all GE_ headers in Source/; '
  + 'L3: VSItemsDefinitionsTest — equip <name> on dummy ASC, assert AttackPower delta '
  + 'and that each affix GE handle is active on the ASC',
```

Each dependency is a resolvable symbol, the verification names two tiers with a
concrete observation at each, and the grant names a method rather than a system.
This is what gets injected back into the next produce prompt — the loop closing.

## The doctrine's authored form

The prose source both halves point at is `docs/catalog/ARPG-LAWS.md:244` — a
four-row table (Granted by / Activated by / Dependencies / Verification) with
worked examples per row, closing with the no-gray-box rule: *"an artifact that
compiles but is never granted/activated is not config-complete… A faithful
artifact is wired end-to-end, not an orphaned struct."* The same rule is seeded as
an injectable canon entry, `arpg-wiring-contract` in
`src/lib/catalog/canon/canon-seed.ts:59`, `refs: ['docs/catalog/ARPG-LAWS.md#12']`
— one rule, three renderings, one source.
