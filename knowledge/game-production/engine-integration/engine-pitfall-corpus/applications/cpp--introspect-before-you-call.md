---
layer: application
type: application
subject: engine-pitfall-corpus
technique: introspect-before-you-call
stack: cpp
status: forged
verified_on: 2026-10-16
verified_against: cpp@20
---

# An editor-only accessor compiled in the editor and broke the game target, written as one entry

Source tree: `mage-arena-vr` on `master` at `e065d30`, read 2026-10-16; paths are relative to its root. It is an
Unreal Engine 5.8 C++ game for a standalone headset, built at the engine's default C++20. It has two targets, an
editor target and a game target, `apps/vr/Game/Source/MageArenaVR.Target.cs:7 "Type = TargetType.Game;"`. Paths
written `Engine/...` are relative to the installed engine, UE 5.8.3 (Changelist 58210709), read directly on
2026-10-16. The failing build is not in this tree: it is a sibling project's 5.8 game build log, dated 2026-06-18,
which the plan cites as its source (`5bc06ee`, 2026-10-02). The guard the game applied is in `5fc66ab` and
`8a0cc2d` (2026-10-16), and the ruling that keeps it is `e065d30` (the same day).

## Why this technique

The technique says mode is the hidden variable: a capability confirmed in one mode says nothing about another. In
this engine, the mode that hides it is the build target. Every C++ module is compiled for the editor target, where
tests, commandlets and the headless editor run, and again for the game target, which is what ships. The editor
target sets `WITH_EDITOR` and `WITH_EDITORONLY_DATA` to 1. The game target sets both to 0. An API declared inside
those blocks resolves in the editor build: it compiles, tests that use it pass, and it is listed in the editor's
reflection. In the game target it does not exist. Here the failure is the loud kind, a compile error rather than an
inert call, but it reaches the team late in the same way. The editor build is the only one anyone runs day to day,
so the game build is the first probe in the shipping mode. The incident-entry-shape fields are kept so that the
record stays comparable with this subject's other cpp entries.

## The record

| Field | Value |
| --- | --- |
| identifier | `editor-only-api-in-runtime-module` |
| summary | Before a runtime module calls an engine API, check that its declaration is not inside `#if WITH_EDITOR` or `#if WITH_EDITORONLY_DATA`. Then build the game target (`TargetType.Game`) as well as the editor target. `AActor::GetActorLabel` and `UBlueprint::Status` compile in the editor and fail a non-editor build with `error C2039`. For a log label use `GetActorNameOrLabel()`. Wrap editor-only work in `#if WITH_EDITOR` and add editor modules only `if (Target.bBuildEditor)`. |
| scope | task kind `compiled source` (hard filter); domains: module rules, automation tests, commandlets, Android packaging |
| detail | the probe and the guard, below |
| provenance | graded per claim, below |

The summary names both offenders because they are what the reader will type, and it names `C2039` because that is
the string the compiler prints. Task kind is the hard filter: the trap only exists when C++ is compiled into a
runtime module. A scripted authoring pass in the editor never sees it.

## The probe: a game-target build on 5.8

**Mode and version.** The probe was the sibling project's standalone game build, Win64 Development. Its first log
line names it as a standalone game build, not an editor build. Its engine is the 5.8 install. The log does not
record the patch level. Its date (2026-06-18) is before the 5.8.2 hotfix that the subject's other entries cite. The
compile line names a shared precompiled header built at C++20. The build failed after 36.92 s, with
`Result: Failed (OtherCompilationError)` and `BUILD_EXITCODE=6`.

**What was observed, verbatim.** The log has two `C2039` lines. The compiler's message text after each identifier
is localized and stored mis-encoded in the log, so only the ASCII part is quoted here, and the absolute path before
each file name is dropped:

```
ScenarioController.cpp(182,9): error C2039: GetActorLabel
VSPlayerMovementTest.cpp(101,37): error C2039: Status
```

Each localized message ends with the class name, `AActor.` and `UBlueprint.` respectively. C2039 is the compiler's
"is not a member of" error. A third error, `C2661` at `VSPlayerMovementTest.cpp(100,9)` on `TestEqual`, appears to
follow from the second: the call's argument list contained the missing member. The first offender is a log line in a scenario
controller. The second is an automation test that asserts a Blueprint's compile status. Neither is editor code by
intent, and both sat in the runtime module.

The game's plan records the incident and draws the general conclusion,
`docs/PROJECT-PLAN.md:386 "The last standalone (non-editor) 5.8 game build failed."`,
`docs/PROJECT-PLAN.md:386 "These are editor-only APIs in runtime code."`, and names it as an entry for this subject,
`docs/PROJECT-PLAN.md:499 "editor-only APIs in runtime modules breaking non-editor targets"`.

**The trap in the engine's own words.** The 5.8.3 headers were read for this entry on 2026-10-16. The accessor sits
in an editor block that opens at `Engine/Source/Runtime/Engine/Classes/GameFramework/Actor.h:2583 "#if WITH_EDITOR"`
and runs past `Engine/Source/Runtime/Engine/Classes/GameFramework/Actor.h:2734 "GetActorLabel(bool bCreateIfNone = true) const;"`.
The comment directly above it says
`Engine/Source/Runtime/Engine/Classes/GameFramework/Actor.h:2732 "Actor labels are only available in development builds."`
That sentence describes the label data and not the accessor. The data has a non-editor copy under
`Engine/Source/Runtime/Engine/Classes/GameFramework/Actor.h:68 "#define ACTOR_HAS_LABELS (UE_BUILD_DEBUG || UE_BUILD_DEVELOPMENT || WITH_PROFILEGPU)"`,
which is true for the failed build's Development configuration. The accessor is still gone there. A reader who
believed the comment would expect the Development game build to compile, and it did not. The runtime-safe reader is
declared outside both blocks,
`Engine/Source/Runtime/Engine/Classes/GameFramework/Actor.h:1242 "FString GetActorNameOrLabel() const"`. It returns
the label where `ACTOR_HAS_LABELS` keeps one and the object name otherwise. The second offender is a field in an
editor-only data block, `Engine/Source/Runtime/Engine/Classes/Engine/Blueprint.h:430 "#if WITH_EDITORONLY_DATA"` to
`Engine/Source/Runtime/Engine/Classes/Engine/Blueprint.h:508 "TEnumAsByte<enum EBlueprintStatus> Status;"`. A cooked
Blueprint has no compile status to assert, so that test belongs under `#if WITH_EDITOR`. It has no runtime equivalent.

**The failed fallback.** The workaround that looks obvious is to trust the editor build: it compiled, the tests
passed, and the API is `BlueprintCallable`. That is exactly the "resolved, so available" inference the technique
forbids. The second fallback is the doc comment. It is accurate about the data and misleading about the call.

## The split, recorded in the game

The technique's step 4 is to record the split: one half runs in the reduced mode and the other needs a fuller host.
The game named that split before it added its first editor-only dependency.

- **Route (c) is closed by reading.** The game's Niagara research read the engine source and found no way to build a
  particle system at runtime in a cooked build, `docs/research/NIAGARA-PROXY-2026-10.md:152 "There is none in a cooked build."`
  Adding an emitter and compiling are both editor-only,
  `docs/research/NIAGARA-PROXY-2026-10.md:154 "Adding an emitter to a system is editor-only"` and
  `docs/research/NIAGARA-PROXY-2026-10.md:156 "Compiling is editor-only"`. Standalone emitter templates are as well,
  `docs/research/NIAGARA-PROXY-2026-10.md:76 "Standalone emitter templates are editor-only."` The file's own label
  says this was source reading, not a run (`6015e16`, 2026-10-08).
- **The authoring half runs in an editor process.** A commandlet builds the six systems and saves them as assets that
  the game cooks. Its editor module is linked only into editor targets,
  `apps/vr/Game/Source/MageArenaVR/MageArenaVR.Build.cs:13 "if (Target.bBuildEditor)"` and
  `apps/vr/Game/Source/MageArenaVR/MageArenaVR.Build.cs:16 "NiagaraEditor"` (`5fc66ab`). The earlier SFX import
  commandlet does the same for its editor modules at
  `apps/vr/Game/Source/MageArenaVR/MageArenaVR.Build.cs:38 "if (Target.bBuildEditor)"`.
- **The call sites are guarded by mode.** Both commandlet bodies sit under
  `apps/vr/Game/Source/MageArenaVR/Tools/CreateBudgetFxCommandlet.cpp:247 "#if WITH_EDITOR"` and
  `apps/vr/Game/Source/MageArenaVR/Tools/ImportSfxCommandlet.cpp:31 "#if WITH_EDITOR"`. In a non-editor build they
  refuse with a stated precondition instead of compiling against an absent API,
  `apps/vr/Game/Source/MageArenaVR/Tools/CreateBudgetFxCommandlet.cpp:329 "MAGEVR_BUDGET_FX needs an editor build"`
  and `apps/vr/Game/Source/MageArenaVR/Tools/ImportSfxCommandlet.cpp:129 "MAGEVR_IMPORT_SFX needs an editor build"`.
  The editor-only includes are fenced the same way,
  `apps/vr/Game/Source/MageArenaVR/Tools/CreateBudgetFxCommandlet.cpp:6 "#if WITH_EDITOR"`.
- **The spec states the claim it relies on.**
  `docs/research/NIAGARA-PROXY-2026-10.md:426 "is never linked into the game or the APK"`, because
  `Target.bBuildEditor` is false there and every use sits under `#if WITH_EDITOR`.
- **The guard is kept as two blocks.** A ruling on the same day keeps them apart, so that a cleanup cannot merge two
  lanes' editor dependencies into one place, `docs/DECISIONS.md:23 "the two bBuildEditor blocks stay separate"` and
  `docs/DECISIONS.md:25 "keeps its two"` (`e065d30`).

**The blast radius.** Editor targets, commandlets and the headless editor are unaffected. Every API resolves there,
which is why the trap is invisible in daily work. Runtime code that calls only APIs declared outside the editor
blocks is unaffected. So is the `ActorLabel` data in Debug and Development game builds, but only through
`GetActorNameOrLabel()` or `GetActorLabelView()`, not through `GetActorLabel()`. Shipping configurations keep no
label data: there `GetActorNameOrLabel()` falls back to the object name and `GetActorLabelView()` returns an empty
view. The trap applies to any non-editor target the module is compiled
into: Win64 game, Android, server.

## Provenance, graded

| Claim | Grade | Origin | Version | Date |
| --- | --- | --- | --- | --- |
| A standalone game build failed on `GetActorLabel` and `UBlueprint::Status` with `C2039` | probed (one build, observed in its log) | a sibling project's 5.8 game build log | 5.8, patch not recorded; Win64 Development | 2026-06-18; read 2026-10-16 |
| The plan records the failure and names it as an entry for this subject | documented | `docs/PROJECT-PLAN.md:386`, `:499` (`5bc06ee`) | n/a | 2026-10-02 |
| `GetActorLabel` is declared under `WITH_EDITOR`; `UBlueprint::Status` under `WITH_EDITORONLY_DATA` | read (engine headers) | `Actor.h` lines 2583 and 2734; `Blueprint.h` lines 430 and 508 | 5.8.3, CL 58210709 | 2026-10-16 |
| `ACTOR_HAS_LABELS` keeps label data in Debug and Development; `GetActorNameOrLabel()` is declared outside the editor blocks | read (engine headers) | `Actor.h` lines 68 and 1242 | 5.8.3, CL 58210709 | 2026-10-16 |
| A cooked build cannot assemble or compile a Niagara system at runtime | read (engine source, by the game's research) | `docs/research/NIAGARA-PROXY-2026-10.md:150-160` (`6015e16`) | 5.8 | 2026-10-08 |
| The game's editor modules are linked only `if (Target.bBuildEditor)`, and both commandlet bodies are under `WITH_EDITOR` | read (game source) | `apps/vr/Game/Source/MageArenaVR/MageArenaVR.Build.cs:13-16` and `:38-41`; both commandlets | at `e065d30` | 2026-10-16 (`5fc66ab`, `8a0cc2d`) |
| The two guard blocks stay separate | documented (owner ruling) | `docs/DECISIONS.md:23-34` (`e065d30`) | n/a | 2026-10-16 |
| The guarded module compiles for a non-editor target | **unverified** | no game-target or Android build of this module has run | none | none |
| `GetActorNameOrLabel()` compiles in a game target and fixes the first offender | **unverified** | not built | none | none |

## Not proven

- **The guard has never met a non-editor compiler.** The game has built only its editor target. The Android target
  stops at its rules because the installed engine has no Android component,
  `docs/research/SWEEP-2026-10.md:883 "no Android support in this engine"` (`6e9ba9f`, 2026-10-08), and
  `docs/XR-TOOLCHAIN.md:9 "An arm64 APK was not produced."` The game's docs at `e065d30` cite no Win64 game-target
  build. So the claim that `NiagaraEditor`, `UnrealEd` and `AssetTools` stay out of the game and the APK rests on
  reading `Build.cs` and the preprocessor blocks, not on a build. The cheapest proof is a Win64 game-target compile of
  the module, `MageArenaVR Win64 Development`, which needs no Android component. It was not run for this entry,
  which read the game's checkout and built nothing.
- **The probe ran on the sibling project, on an unknown 5.8 patch.** The headers were read on 5.8.3. That the two
  declarations sat in the same blocks in June is inferred, not read. The log does not record the patch, and the
  engine on disk has been patched since.
- **The plan's Android sentence is a projection.**
  `docs/PROJECT-PLAN.md:386 "Any Android target that includes those modules will fail the same way."` follows from
  the preprocessor reading, since the Android game target also sets `WITH_EDITOR` to 0. No Android build of
  the sibling's modules has run.
- **The replacement call is from the header, not a compile.** `GetActorNameOrLabel()` is the reader the header
  declares for all builds. Nobody has compiled the scenario controller with it.

## Deviations, standard not lowered

- **The failure is loud, not inert.** The technique's canonical case is an operation that resolves and then does
  nothing. Here the non-editor mode refuses at compile time, which is the kinder outcome. The entry is still this
  technique's, for two reasons. The editor build is the introspection that says yes. And the probe that says no only
  runs when someone builds the target that ships, which in this project has not yet happened.
- **The source log is outside the tree.** It is a local build log, not tracked by any repository, so it is cited by
  its content and date rather than by path and commit. Its two error lines are quoted above in their ASCII part only.
- **No hygiene gate exists yet.** The plan proposes a pre-flight scan for editor-only APIs in runtime modules (its P1
  row, `docs/PROJECT-PLAN.md:400`). At `e065d30` it has not been built. The guard in this game is held by review and
  by an owner ruling, not by a check.
