---
layer: application
type: application
subject: ship-pipeline-gating
technique: preflight-before-an-expensive-cook
stack: cpp
status: forged
verified_on: 2026-10-09
verified_against: cpp@20
---

# A target-device declaration the engine rewrites on every launch, gated on the package

Source tree: `mage-arena-vr` on `master` at `1ea2131`, read 2026-10-09; paths are relative to its root. It is an
Unreal Engine 5.8 C++ game for a standalone headset. Paths written `Engine/...` are relative to the installed engine,
UE 5.8.3 (Changelist 58210709), read directly on 2026-10-09. The case is finding F2 of the project's 2026-10 stack
research, applied on 2026-10-07 in `b9d64fa`, `bc1f302` and `4b42e87`, with its status corrected in `7b6c7f2` and
the launch proofs recorded in `79dd3a5`.

The technique lists target declarations among preflight's inhabitants, and the golden path says each such
declaration is "trivially readable at rest". This case is counter-evidence to that sentence. The device list in the
project's config is not stable at rest: the engine rewrites it on every editor or cook launch. A preflight that reads
the ini sees a value the transform may not use. The project answers with two things: a guard that stops the rewrite,
and a check placed after the transform, on the package itself.

## The record

| Field | Value |
| --- | --- |
| declaration | `com.oculus.supportedDevices` in the Android manifest: the headsets the app claims to support |
| intended value | `quest\|quest3\|quest3s` (Quest 3 and Quest 3S, owner decision 2026-10-07; `quest` is the legacy token the vendor plugin adds) |
| where it is declared | `+SupportedDevices=Quest3` and `+SupportedDevices=Quest3S` in `apps/vr/Game/Config/DefaultEngine.ini:67-68` |
| what rewrites it | UE 5.8 `UAndroidRuntimeSettings::HandleXRSupport`, called from `PostInitProperties` |
| guard | an inert XML comment in `ExtraApplicationSettings`, `apps/vr/Game/Config/DefaultEngine.ini:59` |
| gate | `MARKER_SUPPORTED_DEVICES` in `apps/vr/tools/package-android.ps1`, required by `MARKER_RESULT=PASS` |
| placement | after the transform: the check reads the package's manifest dump, not the ini |

## The mechanism

The engine reads, verbatim,
`Engine/Source/Runtime/Android/AndroidRuntimeSettings/Private/AndroidRuntimeSettings.cpp:235 "HandleXRSupport();"`,
the last line of `PostInitProperties` (221-236). So it runs whenever the settings object is constructed,
which F2 observed on an editor launch. Inside `HandleXRSupport` (88-125), while `bPackageForMetaQuest` is true,
lines 101-103 and 116-117 read:

```cpp
int32 SupportedDevicesTagIndex = ExtraApplicationSettings.Find("com.oculus.supportedDevices");
FString SupportedDevicesValue("quest2|questpro|quest3|quest3s");
int32 SupportedDevicesIndex = ExtraApplicationSettings.Find(SupportedDevicesValue);
// ...
ExtraApplicationSettings.Append("<meta-data android:name=\"com.oculus.supportedDevices\" android:value=\"" + SupportedDevicesValue + "\" />");
UpdateSinglePropertyInConfigFile(GetClass()->FindPropertyByName(GET_MEMBER_NAME_CHECKED(UAndroidRuntimeSettings, ExtraApplicationSettings)), GetDefaultConfigFilename());
```

The last line writes the change back into the project's default config.

If the tag is missing, the engine appends it. If the tag is present without that exact four-device string, it removes
the tag and appends it again (106-117). Either way the project's own config file gains `quest2|questpro`, and the
vendor plugin's APL then merges an existing value into the manifest. Deleting the line, the obvious fix and the one
`b9d64fa` made, does not hold: the next launch writes it back.

Both checks are substring `Find`s on a string, not an XML parse. The project's guard uses that:
`apps/vr/Game/Config/DefaultEngine.ini:59 "ExtraApplicationSettings=<!-- com.oculus.supportedDevices guard: quest2|questpro|quest3|quest3s is named here only so UE 5.8 HandleXRSupport adds no tag of its own, the real list comes from +SupportedDevices (STACK F2) -->"`.
The comment holds both substrings, so neither branch fires. A comment above it says not to delete it,
`apps/vr/Game/Config/DefaultEngine.ini:54 "; Do not delete. While bPackageForMetaQuest=True, UE 5.8 HandleXRSupport (AndroidRuntimeSettings.cpp, called from"`.

## The gate, and why it sits after the transform

The technique's third test for preflight is that the verdict must not depend on any artifact the transform creates.
Here, the value that matters is the one in the package. It is produced by three writers: the engine (the rewrite
above), the vendor plugin's APL (which builds `quest|quest3|quest3s` from `+SupportedDevices` and merges any existing
tag), and the project's ini. Reading one of them at rest certifies none of the merge. So the project checks the
built manifest:

- `apps/vr/tools/package-android.ps1:8-12`, `Test-SupportedDevices`: the tokens must include `quest3` and `quest3s`
  and must not include `quest2` or `questpro`
- `apps/vr/tools/package-android.ps1:174`, a pattern that accepts either the `aapt` xmltree form or the `aapt2` badging
  form of the value
- `apps/vr/tools/package-android.ps1:179`, which prints `MARKER_SUPPORTED_DEVICES=yes|no value=...`
- `apps/vr/tools/package-android.ps1:200 "if ($hasArm -and $hasPermission -and $hasFeature -and $hasTargetSdk -and $hasDevices) {"`,
  so `MARKER_RESULT=PASS` requires it

The check is token-based, not an exact string, so the order of the plugin's merge does not matter. It has a
`-SelfTest` switch with three cases (`:16-18`): the intended value passes; the value the engine's rewrite would
produce, `quest2|questpro|quest3|quest3s|quest|quest3`, fails; and `quest|quest3`, without Quest 3S, fails.

What preflight still contributes is the guard itself. "Is the guard line present in the ini" is a read at rest, it
costs milliseconds, and its absence means the next launch will rewrite the file. The project does not yet run that
read as a preflight rule. It relies on the comment and on the package gate.

## Provenance, graded

| Claim | Grade | Origin | Version | Date |
| --- | --- | --- | --- | --- |
| The runtime uses `com.oculus.supportedDevices` to decide whether to turn on compatibility mode | documented | store vendor's OS compatibility mode page, https://developers.meta.com/horizon/documentation/native/android/os-compatibility-mode/ | not versioned | last updated 2026-09-08; quoted in F2 |
| UE 5.8 adds Quest 3S as a supported device when `bPackageForMetaQuest` is on | documented | UE 5.8 release notes, https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-5-8-release-notes | 5.8 | page updated 2026-06-23; quoted in F2 |
| `HandleXRSupport` runs from `PostInitProperties` and writes the four-device tag into the default config when the two substrings are absent | read | `AndroidRuntimeSettings.cpp`, 88-125 and 221-236 | 5.8.3, CL 58210709 | 2026-10-09 |
| Without the guard, an editor launch rewrites `DefaultEngine.ini` with the quest2/questpro tag | probed | `UnrealEditor-Cmd.exe` launch (`-ExecCmds=QUIT_EDITOR -unattended -nullrhi -nosplash`), recorded in F2's status | 5.8.3 | 2026-10-07 |
| With the guard, the same launch leaves `DefaultEngine.ini` byte-identical | probed | same launch, exit 0; `git hash-object` 8690fa6 before and after, `git diff` empty | 5.8.3 | 2026-10-07 |
| The gate's matcher accepts the intended value and refuses both wrong ones | probed | `package-android.ps1 -SelfTest`, exit 0 | at `bc1f302` and after `4b42e87` | 2026-10-07 |
| The comment reaches `<application>` verbatim and the APL ignores it | read | F2 cites `UEDeployAndroid.cs` 2950-2958 and `OculusMobile_APL.xml` 353-364; not re-read for this application | 5.8.3 | 2026-10-07 |
| A real package declares `quest\|quest3\|quest3s` | **unverified** | no APK exists | none | none |

## Not proven

- **No APK has been built.** The installed engine has no Android component, so packaging stops before cook. F2's
  status ends on it: `docs/research/STACK-OPPORTUNITIES-2026-10.md:126` "not proven: the real APK manifest, because
  the engine's Android component is not installed."
- **The extraction regex has never seen a real dump.** The `aapt` and `aapt2` formats at
  `apps/vr/tools/package-android.ps1:171-172` are written from documentation. `-SelfTest` exercises the token check,
  not the extraction.
- **That the comment is inert in the APK** is a reading of the engine and the plugin, not an observation.
- **A `-game` run did not re-add the tag even without the guard** (F2's status). Why it differs from the editor
  launch was not investigated.

## Deviations, standard not lowered

- **The golden path's at-rest claim does not hold here.** The rung "configuration sanity" assumes a declaration
  read at rest is the one the transform will consult. When the engine itself rewrites the declaration at load time,
  that assumption fails, and the check moves to the artifact. This application does not edit the golden path; the
  possible extension is recorded in the subject's librarian note.
- **No preflight rule exists yet for the guard.** The technique's procedure would add one (the guard line present,
  fatal if missing). The project has not, and this application does not claim it.
