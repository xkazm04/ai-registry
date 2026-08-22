---
layer: application
type: application
subject: realtime-combat-semantics
technique: death-via-state-tag-not-input-disable
stack: process
status: forged
verified_on: 2026-08-20
---

# The dead tag as an authoring rule, a review rule, and a crash

PoF states this technique three times, at three different points of its pipeline, and the
three statements are worth reading together because they show the same rule in its authored,
audited and failed forms.

## As an authoring rule, in the generator's contract

`src/lib/prompts/ability-forge.ts:269`, inside `GAS_RULES` — the best-practices list fed into
every ability-generation prompt:

```ts
'State_Dead and State_Stunned MUST always be in ActivationBlockedTags',
```

It is an unconditional MUST in a list where the neighbouring entries are conventions
(`Follow the exact UPROPERTY pattern`, `use the existing naming convention`). That is the
right weight: whether an ability can be cast while dead is not a design parameter. The same
list carries the readability bands this subject depends on —

```ts
'ComboEntry timing should be realistic (animDuration 0.4-1.5s, recovery 0.1-0.5s)',
```

— and the output schema at `src/lib/prompts/ability-forge.ts:245` makes those first-class
fields (`animDuration`, `damageWindow: [startSec, endSec]`, `recovery`), so a generated
ability declares its wind-up, its contact window and its recovery as three separate typed
numbers rather than as one animation length.

## As a review rule, with the failure mode spelled out

`src/lib/evaluator/module-eval-prompts.ts:135`, `arpg-combat` `structureChecks`:

> `- Death flow should use State.Dead tag to block all abilities`
> `Additionally: on death, the character must apply the State.Dead gameplay tag via GE_Death
> and rely on the tag to block subsequent ability activations. Disabling input alone is not
> sufficient — abilities triggered by other systems must also be blocked.`

The second sentence is the whole technique in one line, and it is written as a *negation of
the tempting shortcut* rather than as a positive requirement. That phrasing matters for a
reviewer: the positive form ("uses a death tag") is satisfiable by a project that also
disables input and never noticed the tag was doing nothing, whereas the negative form names
the thing to look for — a system other than the player's own input that can still start an
ability on a corpse.

## As a crash, which is the ordering half

`src/lib/crash-analyzer/sample-crashes.ts:283` carries worked root-cause pairs. Two of them
are this subject's ordering lessons:

- **The death-flow ordering bug.** `UARPGAbilitySystemComponent::OnDeathStarted() attempts
  to activate a "death" ability via TryActivateAbility, but by this point the AbilitySpec
  for the death ability has already been cleared because CancelAllAbilities() was called
  earlier in the death flow.` The prescribed fix is to activate the death ability *before*
  the cancel, or to `use GiveAbilityAndActivateOnce() to grant + activate atomically`, plus
  `a bIsDying flag to prevent re-entrant death flows`. This is what a tag-based death costs
  if the flow is written in the obvious order: the mass cancel that makes the tag meaningful
  also destroys the reaction that makes the death readable.
- **The initialisation race.** `if the ability input fires before BeginPlay completes (e.g.,
  during a level transition or respawn), the ASC is nullptr` — the gate that reads the tag
  set does not exist yet, so the activation path has nothing to consult. The fix is a guard
  plus ordering: `ensure InitAbilityActorInfo is called BEFORE binding input actions` and
  `add a bAbilitiesInitialized flag that gates ability activation`.

Both are the same shape. A gate that is consulted continuously must exist before anything can
consult it, and must not be dismantled by the very transition it is meant to describe. In a
system that only ever resolved on turns, neither bug has anywhere to happen.

## What the tag buys, elsewhere in the canon

`docs/catalog/ARPG-LAWS.md` §5 generalizes the mechanism past death:

> `Wiring law: the granted State.* tag IS the status effect's identity — VFX, AI, and the
> buff bar all key off the tag, not the source ability.`

That is why the dead tag is the right implementation rather than merely an acceptable one: it
is the same identity mechanism every other consumer of combatant state already uses, so
death integrates with perception, presentation and accounting for free instead of once per
consumer.
