---
layer: application
type: application
subject: crash-forensics-attribution
technique: root-cause-to-fix-prompt
stack: process
status: forged
---

# The diagnosis corpus and its entry shape

Realized in the PoF repo at `src/lib/crash-analyzer/sample-crashes.ts:279` (`SAMPLE_DIAGNOSES`),
paired with the crash records above it and consumed through `buildDiagnosisCorpus`. Each entry
is one hand-written analysis in a fixed shape, and the shape is the interesting part: it forces
a diagnosis to carry both its reasoning and its corrective instruction.

## The entry shape

`CrashDiagnosis` carries, per crash: `summary` (one line), `rootCause` (the mechanism, in
prose), `uePattern` (the **class** name), `confidence`, `fixDescription` (the corrective shape),
`fixPrompt` (the actionable instruction), `relatedChecklist` (ids into the project's per-module
review checklists), and `tags`.

`uePattern` and `relatedChecklist` are the two fields that make the corpus compound.
`uePattern` names the class rather than the incident — "GAS Initialization Race — accessing
UAbilitySystemComponent before InitAbilityActorInfo" (`:285`), "Stale UObject pointer — missing
UPROPERTY marking or TWeakObjectPtr" (`:336`), "Save/Load version mismatch — missing FArchive
versioning" (`:354`), "Circular dependency in quest/dialogue graph — missing cycle detection"
(`:389`). `relatedChecklist` is the pipeline out: `['ac-1', 'ac-3']`, `['asl-1', 'asl-2']`,
`['adq-2']` point back at the module checklists, so a confirmed class becomes a review item
rather than staying a war story.

## The four classes, as authored

- **Ability-system initialisation race** (`crash-001`, `:281`) — `ActivateAbility()` calls
  `GetAbilitySystemComponent()->TryActivateAbility()` before `InitAbilityActorInfo` has run in
  `BeginPlay`; ability input fires during a level transition or respawn and the component is
  null.
- **Collected object still referenced by cached UI** (`crash-004`, `:332`) — the inventory
  component stores raw `UObject*`; the widget caches a reference from the previous frame and
  calls `GetItemAtSlot()` on the next tick, after GC ran between frames.
- **Save archive version drift** (`crash-005`, `:350`) — `DeserializeInventory()` reads an
  archive written against an older struct layout; no version check, so the read runs past the
  end of valid data.
- **Mutually recursive quest dependency** (`crash-007`, `:385`) — `EvaluateQuestConditions()`
  and `CheckDependencyChain()` recurse into each other through a Quest A ↔ Quest B cycle until
  the stack is exhausted.

Each generalises: the specific symbols are UE5's, the misconception is not.

## Where the corpus meets the standard, and where it does not

The best `fixPrompt`s satisfy the technique. `crash-005` (`:358`) does not merely add a guard —
it defines a version enum, registers it, gates the reads on `Ar.CustomVer(...)`, and supplies
defaults for absent fields. `crash-007` (`:393`) adds a visited set *and* an editor-time
validation pass that detects circular dependencies before load, which is the correction the
class actually calls for rather than a depth limit.

Two deviations, recorded without lowering the standard:

**Every prompt ends "Verify the build compiles after the fix."** Compiling is a structural rung
and the defects here are behavioural — a null-guard that compiles converts a crash into a
silently wrong-valued object. The instruction should name the behavioural observation that
would show the fault gone: activate the ability during a level transition and observe no fault,
load a v1 archive under v2 code and observe a stated refusal or a correct migration.

**Several prompts lead with "add a null check"** — `crash-003` (`:322`) is a bare guard plus a
warning log. For the initialisation race the guard is only safe because step 2 also reorders
`InitAbilityActorInfo` ahead of input binding; alone it would hide the race. The corrective
shape for an ordering defect is the ordering fix; the guard is at best a secondary safety net.

**`confidence: 0.95`** (`:286`) and its siblings are authored constants with no stated basis.
They are honest as author's-belief annotations and must not be read as measured probabilities;
the analyser's own `attributeModule` score, by contrast, carries its weights, its decay factor
and its runner-up.

## The provenance rule

The crash records themselves carry `source: 'sample'` with the comment "Demo data. NEVER written
to `crash_history` — a built-in sample must not be able to inflate the project's real, observed
crash record" (`sample-crashes.ts:270-273`). The corpus is a teaching set and a matching set; it
is not evidence about this project's crash rate, and the tag is what keeps the two apart.
