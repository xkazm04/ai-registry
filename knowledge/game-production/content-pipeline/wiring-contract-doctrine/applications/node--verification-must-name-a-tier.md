---
layer: application
type: application
subject: wiring-contract-doctrine
technique: verification-must-name-a-tier
stack: node
status: forged
verified_on: 2026-08-20
---

# When the observable is engine state

The tier requirement is enforced lexically in `wiringCheckers.ts:70` —
`/\bL[0-4]\b/.test(verification)`, failing with *"an unfalsifiable 'it works' line
is not a verification contract"*. That catches the unlabelled claim. It does not,
on its own, make the claim true; something has to actually read engine state. In
this repo that something is `src/lib/pof-bridge/verification-rules.ts`.

## Manifest shape → feature status

`VERIFICATION_RULES` (`:11`) is a list of `{ featureName, moduleId, check }`, where
`check` inspects a scanned asset manifest of the real engine project and returns a
`FeatureStatus`. The rules read like the verification lines they back:

```ts
{
  featureName: 'AARPGCharacterBase',
  moduleId: 'arpg-character',
  check: (m) => m.blueprints.some(
    (bp) => bp.parentCppClass.includes('ARPGCharacterBase')
      || (bp.path.toLowerCase().includes('character') && bp.path.toLowerCase().includes('base')),
  ) ? 'implemented' : 'missing',
}
```

This is the honest low rung, done properly: the observable is *an asset of this
parent class exists in the engine project*, and the verdict vocabulary is
`implemented | partial | missing` rather than a boolean. It is evidence about the
engine, not about the generator's own report — the producer's claim is not the
verdict.

## Count thresholds are what make `partial` real

The Enhanced Input rule (`:38`) is the interesting one:

```ts
const inputAssets = m.otherAssets.filter(
  (a) => a.assetClass.includes('InputAction') || a.path.includes('IA_'),
);
if (inputAssets.length >= 5) return 'implemented';
if (inputAssets.length >= 2) return 'partial';
return 'missing';
```

Two thresholds turn a binary existence check into a three-state observation, and
the middle state is the one that carries information during production: *some
input actions exist, not the full set the feature needs*. A binary rule would have
reported `implemented` at the first `IA_` asset — the exact laundering the tier
requirement exists to prevent — or `missing` right up until the last one, which
tells the operator nothing about progress.

The thresholds also make the rung explicit without a label: five assets of a class
is a *structural* observation about the project, not a behavioural one about the
running game. Nothing here proves an input action is bound, fires, or does
anything. In the repo's own ladder vocabulary this is the low rung, and the
feature matrix it feeds must not read as more.

## Where this sits relative to the contract

The wiring contract's `verification` field on an items step
(`src/lib/catalog/pipelines/items.ts:136`) names two rungs and two observations:

```
L2: cppSymbolExists(UARPGItemDefinition) + seedRowPresent(author_items.py, DA_<slug>);
L3: VSItemsDefinitionsTest — DA loaded + requiredLevel/slot/rarity fields assert correct
```

The `L2` half is served by static and manifest checks of exactly the
`verification-rules.ts` kind. The `L3` half names a functional test in the engine —
a genuinely higher rung — and in most steps of this repo it is marked deferred by
`entityRuntimeDeferred` (`src/lib/catalog/acceptance/deferred.ts`). That deferral
is the right behaviour and the standard's point in one place: the claim carries the
rung it was proven at, `L3` is not asserted until an engine run happens, and the
gap is visible rather than papered over with the `L2` result.

The ladder's own definition — what `L0`…`L4` mean, what each may conclude — lives
in `docs/catalog/WIRING-AND-ACCEPTANCE.md §2` and belongs to the acceptance-tiering
subject, not this one. What this doctrine contributes is the join: the regex at
`wiringCheckers.ts:70` is the only thing forcing a wiring contract to speak that
vocabulary at all.
