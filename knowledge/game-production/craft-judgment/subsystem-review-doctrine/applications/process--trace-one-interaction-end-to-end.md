---
layer: application
type: application
subject: subsystem-review-doctrine
technique: trace-one-interaction-end-to-end
stack: process
status: forged
verified_on: 2026-08-20
---

# The combat-trace pass: one hit, end to end

`PoF`'s evaluator gives exactly one module a fifth pass. `arpg-combat` sets `tracePass` in
`MODULE_CONTEXTS` (`src/lib/evaluator/module-eval-prompts.ts:135`), and `getPassesForModule`
(`:449`) appends `combat-trace` for any module that defines one — so the mechanism is general
and the content is not.

## The prompt

The pass asks for a numbered call graph of one activation of `GA_MeleeAttack`:

1. the actor that activates the ability and **how** (input action / tag / AI controller call);
2. the activation tag or event and the ability's `ActivateAbility` entry point;
3. the damage path taken — Direct (gray-box self-apply) vs Animation-driven
   (`Event.MeleeHit` notify) — and **which branch runs when `bUseAnimationDrivenDamage` is
   false**;
4. the `GameplayEffect` applied (`GE_Damage`) and its execution calc (`UARPGDamageExecution`);
5. the attributes **read** (`AttackPower`, `Armor`, `CriticalChance`, resistances) and the
   attributes **written** (`IncomingDamage`, `Health`);
6. the delegates broadcast (`OnHealthChanged`, `Event.Death`, `OnEnemyDeath`) and their
   listeners.

Then two sweeps, stated in the prompt as flags:

> FLAG any step that needs a binary asset (montage, AnimNotify in a montage, BT, `.umap`) that
> cannot be authored from code. If the damage GE reads an attribute that no GE/DataTable sets
> (e.g. `Armor` with no `DT_AttributeDefaults`), flag it as a no-op.

And an output-order instruction that matters more than it looks:

> Output the numbered call graph first, then the JSON findings array.

The graph precedes the findings so a reader can check the reasoning rather than trust the
conclusions, and so the model must commit to a continuous chain before it is allowed to
conclude anything about it.

## The three seam defects, all present in this one prompt

- **A second authority for one quantity.** The module's `qualityChecks` (`:141`) instructs the
  reviewer to detect "parallel Health bookkeeping — a plain `float Health/MaxHealth` member on
  the character (e.g. `AARPGPlayerCharacter::GetHealth`) alongside the GAS Health attribute
  (`UARPGAttributeSet`)", noting that the HUD and damage pipeline use GAS and the float is a
  latent inconsistency. The prescribed fix is deprecate-or-sync, with the standing rule "Two
  Health systems must not drift". Step 5's separate read/write lists are what surfaces it.
- **A read with no writer.** The `Armor`-with-no-`DT_AttributeDefaults` case, called out by
  name: a mitigation attribute the execution calc reads and nothing sets, contributing zero to
  every damage number in the game while looking entirely correct in the calculation.
- **A step that cannot be authored from code.** The binary-asset flag. The animation-driven
  damage branch runs through an `AnimNotify` inside a montage — an artifact no code-generating
  agent can produce — which is why step 3 insists on naming the branch that actually runs.

## Where the seam with combat design sits

The same `arpg-combat` entry carries real-time design law: telegraph-or-homing for targeted
abilities, real-time timers rather than turn counters, and defences that split a player-timed
trigger from stat-scaled magnitude (`:141`, the "real-time design semantics" block). Those
rules are combat design and belong to a different subject. What belongs here is only the
*method*: a numbered end-to-end trace, read/write lists, and two sweeps. The trace checks that
the design rules hold; it does not author them.

## Deviation

The pass is defined for one module. Every module with a multi-component interaction chain —
loot from kill to pickup, save from trigger to written slot, progression from XP grant to
granted ability — has the same seam exposure and no trace. The mechanism supports it
(`tracePass` is optional per module); only the content is missing. The standard is that a
subsystem with an interaction chain gets a trace, and it is not lowered to match.
