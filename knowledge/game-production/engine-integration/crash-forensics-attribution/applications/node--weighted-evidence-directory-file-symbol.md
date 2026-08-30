---
layer: application
type: application
subject: crash-forensics-attribution
technique: weighted-evidence-directory-file-symbol
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# The crash analyser's scored module attribution

Realized in the PoF repo at `src/lib/crash-analyzer/analysis-engine.ts` — a pure
Node/TypeScript scorer over parsed UE5 crash reports. Everything the technique calls a
"subsystem" is a *module* here, and the whole path from stack to verdict lives in one exported
function, `attributeModule` (`analysis-engine.ts:171`).

## The founding defect: rule order decided the answer

The comment at `analysis-engine.ts:33-46` records what the scorer replaced — a first-match scan
down a fixed array — and names two real misfilings it produced:

- an AI Behavior Tree crash in `Source/AI/BTTask_ARPGAttackTarget.cpp` was filed under
  `arpg-combat`, because the combat rule sat earlier in the list and the function name contains
  "Attack";
- a save-archive crash in `Source/SaveLoad/ARPGSaveGame.cpp` was filed under `arpg-inventory`,
  because the function is called `DeserializeInventory`.

Both are symbol-level coincidences beating directory-level evidence, and both were decided by
array position. The rewrite states the rule directly: *rules are NOT ordered — every rule is
tested against every piece of evidence and the winner is decided by score.*

## Tokenization is what makes short tokens safe

`TOKEN_RE` (`analysis-engine.ts:114`) splits CamelCase, `snake_case` and path separators into
lowercase words, and `tokenize` pads the result with spaces so patterns can anchor on `\b`. The
comment names the exact hazard it removes: `\bai\b` matches the `Source/AI/` directory without
matching the "ai" inside `CheckDependencyChain`, and `\bui\b` matches `Source/UI/` without
matching the "ui" inside `Build`. Raw-substring matching against identifiers "is exactly what
made the old map imprecise."

## The dictionary, and one rule that was deleted rather than down-weighted

`MODULE_RULES` (`analysis-engine.ts:63-75`) is eleven rules over ten ARPG modules —
`arpg-character`, `arpg-abilities`, `arpg-inventory`, `arpg-ui-hud`, `arpg-dialogue-quests`,
`arpg-combat`, `arpg-loot`, `arpg-ai`, `arpg-save-load`, `arpg-audio`. Two entries map to
`arpg-character` rather than one, because the vitals vocabulary (`health`, `stamina`, `vitals`)
does not overlap the locomotion vocabulary.

`ModuleRule.weight` (`analysis-engine.ts:59`) exists for weak-vocabulary rules, and the comment
records the choice not to use it for the legacy `Component` catch-all: *nearly every UE class
name ends in "Component", so it added noise to every comparison while never being able to carry
an attribution on its own.* It was dropped, and its useful half (`Health`) kept as a specific
rule. That is the technique's "prefer deleting a catch-all" in the concrete.

## Weights, decay, gates

- `WEIGHT_DIRECTORY = 3`, `WEIGHT_FILENAME = 2`, `WEIGHT_SYMBOL = 1` (`analysis-engine.ts:87-89`),
  with the justification stated per level at `:81-86`.
- `FRAME_DECAY = 0.4` (`analysis-engine.ts:98`), applied as `FRAME_DECAY ** depth` at `:177`
  over `report.callstack.filter((f) => f.isGameCode)` — engine frames are removed *before* the
  depth index is assigned (`:172`). The comment states the evidential relation the factor
  encodes: the caller chain "may confirm an attribution but must never outvote the frame the
  crash happened in."
- `MIN_SCORE = 2` and `MIN_MARGIN = 1.25` (`analysis-engine.ts:110-111`); the floor is set
  exactly at file-name-level evidence, so a bare function-name token "can corroborate an
  attribution but cannot carry one on its own." The margin is the relative form, and it is safe
  here because the floor is applied first (`:201` before `:204`).

`frameEvidence` (`analysis-engine.ts:131-142`) emits at most one entry per fragment kind per
frame and drops kinds whose token string came back empty, so a missing directory contributes
nothing rather than an imputed zero.

## The inspectable result

`ModuleAttribution` (`analysis-engine.ts:148-158`) returns more than a name: `module` (null when
undetermined), a closed `reason` of `'attributed' | 'no-evidence' | 'ambiguous'` (`:145`), the
top `score`, the `runnerUp` — described in its own doc comment as "the reason an `ambiguous`
call is ambiguous" — and an `evidence` string array, sorted strongest-contribution-first, each
line naming module, points, evidence kind, raw text and frame index (`:181-186`).

Ranking is deterministic by construction: score descending, then module name ascending, "so a
tie never depends on Map insertion order" (`:192-195`).

## Why the gates were worth building here

`attributeModule`'s doc comment names the consumer: the value feeds `crashesByModule` and
`mostAffectedModule`, "the stat a developer reads to decide WHERE their crashes are
concentrated." One confidently misfiled crash moves that number, which is why the file says in
as many words that an honest unknown beats a confident wrong subsystem.
