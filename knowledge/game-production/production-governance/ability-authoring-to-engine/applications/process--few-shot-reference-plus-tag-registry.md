---
layer: application
type: application
subject: ability-authoring-to-engine
technique: few-shot-reference-plus-tag-registry
stack: process
status: forged
verified_on: 2026-08-20
---

# The ability forge prompt: registry, exemplars, and ten house rules

The PoF ARPG project generates UE5 C++ `GA_*` GameplayAbility classes from a designer's
natural-language sentence. The whole briefing is assembled in
`src/lib/prompts/ability-forge.ts` (297 lines) through the shared `PromptBuilder`, and it is
a compact worked example of handing an author the vocabulary rather than letting it invent
one.

## The vocabulary block

`KNOWN_TAGS` (`ability-forge.ts:19`) is the tag registry, mirrored from
`ARPGGameplayTags.h` and grouped by role — `ability`, `state`, `damage`, `data`, `event`,
`cooldown` — with the real members of each: `State_Dead`, `State_Stunned`,
`State_Invulnerable`, `Damage_Physical|Fire|Ice|Lightning`, `Data_Damage_Base`,
`Data_ManaCost`, `Event_Combo_Open`, and so on. `buildDomainContext` (`:216`) renders it as
`  <category>: <tags…>` under a `### Tag Registry (ARPGGameplayTags.h)` heading, so the
model sees both the namespace and the slot each name fills.

The grouping is the teaching. A flat list would answer "does this name exist"; the grouped
list answers "what kind of name goes in this field", which is the question the output
schema actually asks six times.

**The deviation this file carries**: `KNOWN_TAGS` is a hand-maintained const, not an
extraction from `ARPGGameplayTags.h`. The header comment even names the source file, which
is the honest form of the admission. The project also *has* the extractor — the
`ue5-source-parser` that feeds the tag audit records both spellings of every
`UE_DEFINE_GAMEPLAY_TAG_COMMENT` — so briefing from the same parse the audit grades against
is available and not yet wired. The standard stays: the registry that briefs the author and
the registry the audit compares against should be one extraction. Until they are, a tag
retired in the header keeps being generated for as long as nobody re-copies the list.

## The exemplars, and the corpus statistics

Three things are handed over as reference, all in `buildDomainContext`:

- `FEW_SHOT_HEADER` / `FEW_SHOT_CPP` — one complete accepted ability (`GA_DashStrike`,
  header and implementation) rather than fragments. It carries the `UPROPERTY` pattern, the
  include order, the constructor shape, and the comment density — the tacit standard that
  is expensive to write as rules.
- `formatComboAbilities(input.comboAbilities)` — the existing abilities, explicitly labelled
  *"for reference on timing, damage, and costs"*. This is the corpus spread, so a new
  ability's numbers land inside the distribution the game already has rather than inside the
  model's priors.
- `formatRadarData(input.radarData)` — the live per-ability profiles, normalised 0–1.

Note the second delivery mode elsewhere in the same project: the codegen contract in
`src/lib/ability/effect-codegen-prompt.ts` opens Part A with *"READ FIRST for the project
idiom — do NOT invent a new system"* and then names three real exemplar files
(`GE_Heal.cpp` for instant additive, `GE_Regen_Health.cpp` for periodic duration,
`GE_Stun.cpp` for granted tags) plus `ARPGAttributeSet.h` for the real attributes. That
author is an agent with file access, so pointing beats embedding: it cannot go stale, and
it costs three lines instead of two thousand tokens.

## The ten house rules

`GAS_RULES` (`ability-forge.ts:269`) is the rules-of-the-house list fed to the builder's
Best Practices section. The ones that are authoring craft rather than design semantics:

1. `State_Dead` and `State_Stunned` MUST always be in `ActivationBlockedTags` — the
   incapacitated-state block, stated as an authoring invariant so no generated ability can
   be activated by a corpse. (Why those states *interrupt* what they interrupt is design
   canon, owned elsewhere; here it is a field that must be populated.)
2. Use `SetByCaller` with `Data_Damage_Base` for damage, **not** hardcoded effect
   magnitudes — magnitudes are supplied by the caller, so one shared effect serves many
   callers and the number stays in the catalogue rather than in the asset.
3. If new tags are needed, follow the existing naming convention (`Ability_*`, `State_*`,
   `Cooldown_*`) — the fallback path for a genuinely new name, spelled out.
4. Combo timing bands: `animDuration` 0.4–1.5 s, `recovery` 0.1–0.5 s — the corpus range as
   an explicit constraint, backing up what the exemplars imply.
5. Radar values consistent with existing abilities (a pure buff is 0 damage, high speed) —
   an anchor against a profile drawn from nothing.

The remaining rules pin the class hierarchy (`UARPGGameplayAbility`), the exact constructor
call set (`SetAssetTags`, `ActivationOwnedTags`, `ActivationBlockedTags`,
`AbilityManaCost`, `CooldownGameplayEffectClass`, `AbilityCooldownTag`), the `UPROPERTY`
pattern, motion warping when the ability moves, and VFX/montage `UPROPERTY` slots.

## The one that is a doctrine note

The best rule in the project is not in this file. In `effect-codegen-prompt.ts:19` a comment
explains why a single clause is appended to every effect line:

> `cooldownSec` is the ABILITY cooldown (the editor's "Cooldown" field) — say so
> explicitly, or the model emits it as a GE Period and the effect's damage silently
> re-applies every N seconds as a DoT tick.

The rendered clause reads `; ability cooldown 3s (NOT a GE Period — see the cooldown GE
rule)`. It costs a parenthesis; it prevents a bug that produces a working, plausible,
wrong ability. That is the test a rule has to pass to earn a place in a prompt: it names a
mistake a competent author makes anyway, and the mistake would have been silent. Rules that
merely restate the schema fail it, and get skimmed.
