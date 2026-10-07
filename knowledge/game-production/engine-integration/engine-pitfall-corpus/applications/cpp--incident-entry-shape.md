---
layer: application
type: application
subject: engine-pitfall-corpus
technique: incident-entry-shape
stack: cpp
status: forged
verified_on: 2026-10-07
verified_against: cpp@20
---

# An engine hotfix raised a packaging default above the store's cap, written as one entry

Source tree: `mage-arena-vr` on `master` at `13253ac`, read 2026-10-07; paths are relative to its root. It is an
Unreal Engine 5.8 C++ game for a standalone headset. Its module builds at the engine's default standard,
`Engine/Source/Programs/UnrealBuildTool/System/CppCompileEnvironment.cs:61 "Default = Cpp20,"` (UE 5.8.3), and
neither target file sets a standard of its own. Paths written `Engine/...` are relative to the installed engine,
UE 5.8.3 (Changelist 58210709), read directly on 2026-10-07. The incident is finding F1 of the project's 2026-10
stack research (`d693dcc`, 2026-10-07), applied in `6b09600` the same day. The project keeps no typed pitfall
corpus: F1 is prose in a research file. This application lays it out in the technique's five fields.

## The record

| Field | Value |
| --- | --- |
| identifier | `engine-default-target-sdk-above-store-cap` |
| summary | Set `TargetSDKVersion=34` in the project's Android settings for an immersive headset app on UE 5.8.2 or later, and assert `targetSdkVersion:'34'` in the APK badging: the 5.8.2 hotfix raised the engine default to 36, outside the store's immersive range of 32-34, and a project that does not set the key inherits it. |
| scope | task kind `packaging` (hard filter); domain: Android manifest, store submission |
| detail | the probe, below |
| provenance | graded per claim, below |

The summary leads with the action, carries the one token the fix needs, and names the mechanism the reader would
not guess: an inherited default. Task kind is the hard filter because the key belongs to the Android packaging
settings; a gameplay C++ task has no use for the entry, and a packaging task cannot do without it.

## The detail, as a probe

**Mode and version.** This was a configuration read, not a package run. The installed engine's default sits in the
same section the project overrides, `Engine/Config/BaseEngine.ini:3276 "[/Script/AndroidRuntimeSettings.AndroidRuntimeSettings]"`,
at `Engine/Config/BaseEngine.ini:3305 "TargetSDKVersion=36"`. That is one key in one file, read on UE 5.8.3 on 2026-10-07. The engine
vendor's 5.8.2 hotfix notes, published 2026-08-25, give the origin in one line: "Bumped up Target SDK to API 36"
(https://forums.unrealengine.com/t/5-8-2-hotfix-released/2746335). The default before 5.8.2 was not read here.

**What the store says, verbatim.** The store vendor's Android 14 post (2025-11-24, updated 2026-02-06) says
"This means targetSdkVersion must be API level 34, though minSdkVersion will not be impacted and can still use
API level 32." and "API level 34 will be enforced during binary upload, meaning you will not be able to upload
binaries with a lower targetSdkVersion level for apps created after March 1, 2026."
(https://developers.meta.com/horizon/blog/meta-quest-apps-android-14-march-1/). The manifest requirements page
(last updated 2026-09-30) has "32-34 for immersive, 32-36 for 2D" in the targetSdkVersion column of its device
table. It says apps whose manifests do not conform "will fail the Virtual Reality Checks (VRC)", and also that such
builds "may potentially still be uploaded" (https://developers.meta.com/horizon/resources/publish-mobile-manifest/).
So the two wrong values fail at different points. A value below 34 is refused at upload, for apps created after
2026-03-01. A value above 34 is outside the immersive range, and the page names the review checks as where that
fails, not the upload. An accepted upload is not evidence that the target is right.

The project's research re-found its quotes in the raw pages with `grep` on 2026-10-07:
`docs/research/STACK-OPPORTUNITIES-2026-10.md:554 "Bumped up Target SDK to API 36"` and
`docs/research/STACK-OPPORTUNITIES-2026-10.md:546 "32-34 for immersive, 32-36 for 2D"`. For this extraction the
pages were downloaded again on 2026-10-07 (HTTP 200 for each), and a fixed-string search found every quote above.

**What was there, and the fallback that looked obvious.** The Android settings were written on 5.8.2 in `cb78e83`
(2026-10-03) and set `TargetSDKVersion=32`, which the upload rule now refuses for a new app. The toolchain record
from the same commit named the engine's new default as the thing to try next. The line that `6b09600` removed read
"the fallbacks to try are `bBuildForES31=True` and `TargetSDKVersion=36`". The two obvious values were wrong in
opposite directions: the old one was under the floor for new apps, and the "newest API" one was over the immersive
cap. Only 34 meets both. The research names the gap:
`docs/research/STACK-OPPORTUNITIES-2026-10.md:84 "as a packaging fallback. 36 is above the immersive cap of 34."`

**The fix, with its preconditions.** `6b09600` (2026-10-07) set the value and kept the minimum,
`apps/vr/Game/Config/DefaultEngine.ini:46 "MinSDKVersion=32"` and
`apps/vr/Game/Config/DefaultEngine.ini:47 "TargetSDKVersion=34"`, in the section where the engine default lives,
`apps/vr/Game/Config/DefaultEngine.ini:35 "[/Script/AndroidRuntimeSettings.AndroidRuntimeSettings]"`. It made the
package check fail without the value:
`apps/vr/tools/package-android.ps1:137 "Meta refuses an upload below 34 and the immersive cap is 34, so the badging must say exactly 34."`,
`apps/vr/tools/package-android.ps1:138 "targetSdkVersion:'34'"` and
`apps/vr/tools/package-android.ps1:158 "if ($hasArm -and $hasPermission -and $hasFeature -and $hasTargetSdk) {"`.
It also replaced the fallback with an instruction,
`docs/XR-TOOLCHAIN.md:126 "(the engine default since 5.8.2) and do not leave it blank: 34 is the target Meta requires for new apps and the cap for immersive apps"`.
The check reads what the built package declares, not what the ini asks for, and the package is what the store reads.

**The blast radius.** The same page lets panel (2D) apps target up to 36, so the entry covers immersive builds only.
`minSdkVersion` is not affected. A dashboard app created before 2026-03-01 is not refused at upload below 34, but 36
is still outside its range. Desktop and editor targets build no Android manifest. The source leaves open whether
this project's app falls under the post-March rule,
`docs/research/STACK-OPPORTUNITIES-2026-10.md:90 "No app id is in the repo"`, and 34 is right either way.

## Provenance, graded

| Claim | Grade | Origin | Version | Date |
| --- | --- | --- | --- | --- |
| The 5.8.2 hotfix raised the default Target SDK to 36 | documented | engine vendor's 5.8.2 hotfix notes | 5.8.2 | published 2026-08-25; read 2026-10-07 |
| The installed engine's default is `TargetSDKVersion=36` | probed (configuration read) | `Engine/Config/BaseEngine.ini`, line 3305 | 5.8.3, CL 58210709 | 2026-10-07 |
| New apps must target 34; a lower target is refused at binary upload | documented | store vendor's Android 14 post | not versioned | 2025-11-24, updated 2026-02-06; read 2026-10-07 |
| The immersive range is 32-34; a non-conforming manifest fails review and may still upload | documented | store vendor's manifest requirements | not versioned | last updated 2026-09-30; read 2026-10-07 |
| A package built with 34 declares `targetSdkVersion:'34'` | **unverified** | no APK exists | none | none |
| The store accepts this project's binary | **unverified** | no upload attempted | none | none |

## Not proven

- **No APK has been built.** Packaging stops before cook because the installed engine has no Android component,
  `docs/XR-TOOLCHAIN.md:9 "An arm64 APK was not produced."`. The packaging log ends on
  `docs/XR-TOOLCHAIN.md:102 "Could not find definition for module 'cxademangle'"` (5.8.2, 2026-10-03, not re-run
  on 5.8.3). F1's status says the same on 2026-10-07,
  `docs/research/STACK-OPPORTUNITIES-2026-10.md:67 "APK proof pending the engine's Android component."`
  So the badging assertion has never executed. That a project which omits the key inherits the engine default is
  how the engine's config layering works; no package here has shown it.
- **No upload has been attempted.** At `13253ac` the dashboard app is still an owner step,
  `docs/PROJECT-PLAN.md:195 "next, create the developer-dashboard app and its"`. Both store outcomes in the table
  are documented, not observed.

## Deviations, standard not lowered

- **The record is composed here.** F1 has the fields in prose: a conclusion as its heading, the reads, the failed
  fallback, the fix and an "Unconfirmed" line. It has no identifier beyond a finding number that only means
  something inside one file, and no task-kind tag. The research's summary table records a "Headless?" column and a
  registry route instead.
- **The project's prohibition rests on documented evidence.** The toolchain record states it flatly,
  `docs/XR-TOOLCHAIN.md:126 "Do not raise"`. Its engine half is probed, but its store half has never been
  observed: there has been no upload and no review. The technique allows a flat prohibition only at the probed
  grade, so the record above is written as an instruction (set 34 and assert it), and the store's consequence keeps
  its documented grade.
