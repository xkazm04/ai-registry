---
layer: application
type: application
subject: engine-pitfall-corpus
technique: provenance-on-every-entry
stack: cpp
status: forged
verified_on: 2026-10-07
verified_against: cpp@20
---

# A reported plugin incompatibility, contradicted by a probe, then patched under the record

Source tree: `mage-arena-vr` on `master` at `13253ac`, read 2026-10-07; paths are relative to its root. It is an
Unreal Engine 5.8 C++ game for a standalone headset, built at the engine's default C++20. Paths written
`Engine/...` are relative to the installed engine, UE 5.8.3 (Changelist 58210709), read directly on 2026-10-07. The
plugins are the headset vendor's v207 editor plugins. They are installed as prebuilt binaries and git-ignored, so
their files are cited through the project's records, not through the tree. The finding is F9 of the project's
2026-10 stack research, recorded in `2b91ae5` and `13253ac` (2026-10-07).

## The record

| Field | Value |
| --- | --- |
| identifier | `prebuilt-plugin-build-id-vs-engine` |
| summary | After any engine patch, compare each prebuilt plugin's `UnrealEditor.modules` BuildId with the engine's `CompatibleChangelist` before you trust the plugin. A match (55116800 here, on 5.8.2 and on 5.8.3) rules out "built for another engine" and does not re-prove that the modules load. |
| scope | task kinds: compiled source, engine upgrade; domain: XR plugins |
| detail | the sections below |
| provenance | the table at the end, after the audit |

## Reported: "built against 5.7.0, and modules fail to load"

The project's plan carried the vendor's open investigation as a known bug from its first commit (`5bc06ee`,
2026-10-02): `docs/PROJECT-PLAN.md:193 "claim 5.8 support but are built against 5.7.0, and modules fail to load."`
The plan lists its origin under `docs/PROJECT-PLAN.md:625 "External (fetched 2026-10-02):"` as
`docs/PROJECT-PLAN.md:628 "Meta feedback investigation 1053459897316880;"`. The grade is **reported**: a filed
investigation with status "Investigating", relayed through a plan. Its version is "5.8" with no patch level, it
names no mode, and it gives no procedure a reader could rerun. It names four plugins.

## Probed on 5.8.2: not reproduced

The toolchain task (`cb78e83`, 2026-10-03 04:39 +02:00) stamped the build it ran against,
`docs/XR-TOOLCHAIN.md:3 "changelist 56702186, CompatibleChangelist 55116800"`, and probed in two ways.

The first probe was structural. The install script's re-run printed the plugin's editor-module BuildId,
`docs/XR-TOOLCHAIN.md:18 "PLUGIN_BUILD_ID=55116800"`, and both plugins' module files carried that value,
`docs/XR-TOOLCHAIN.md:25 "the same CompatibleChangelist as this engine."`

The second was behavioural, in the headless Win64 editor: `docs/XR-TOOLCHAIN.md:25 "The headless editor loaded"`
six plugin modules (`OculusXRHMD`, `OculusXRInput`, `OculusXRPassthrough`, `OculusInteraction`,
`OculusInteractionPrebuilts`, `OculusInteractionEditor`). The run ended
`docs/XR-TOOLCHAIN.md:28 "**** TEST COMPLETE. EXIT CODE: 0 ****"` with 17 `MageArena.*` tests passing. That was
one run, whose log opened at 03:28:20 that morning. The same Win64 binary then booted against the vendor's
simulator runtime and logged `docs/XR-TOOLCHAIN.md:145 "LogMageArena: MAGEVR_BOOT_OK"` (one run, started 04:21:20).
The verdict was `docs/XR-TOOLCHAIN.md:25 "was not reproduced."`

The probe outranks the report, but only for what it covered. Two of the four named plugins were installed
(`OculusXR` and `OculusInteraction`). The haptics and platform plugins were never probed, and no Android package
was built. So the contradiction holds for two plugins, in the Win64 editor, on 5.8.2.

## The engine moved under the record

`Engine/Build/Build.version` (UE 5.8.3), read 2026-10-07, lines 2 to 6:

```
	"MajorVersion": 5,
	"MinorVersion": 8,
	"PatchVersion": 3,
	"Changelist": 58210709,
	"CompatibleChangelist": 55116800,
```

The values anchor as `Engine/Build/Build.version:5 "58210709"` and `Engine/Build/Build.version:6 "55116800"`. The
file is dated 2026-10-03 11:15 +02:00, 6 h 36 min after the 5.8.2 probe was committed. The project's records
went on saying 5.8.2 until the research found the drift on 2026-10-07 (`d693dcc`),
`docs/research/STACK-OPPORTUNITIES-2026-10.md:340 "record 5.8.2 / CL 56702186."`. Who or what updated the engine is
still open,
`docs/research/STACK-OPPORTUNITIES-2026-10.md:346 "whether the launcher updated the engine on its own or a person did."`

The probe and the patch fall on the same date, so a date stamp alone cannot tell them apart. The patch level and
changelist can. The report's bare "5.8" could not have been audited at all.

## The audit, run on the patch

The re-check is a dated section added to the toolchain record (`2b91ae5`, 2026-10-07). The decision record above
it was left unchanged, `docs/XR-TOOLCHAIN.md:187 "the decision record stays as written."` Its findings map onto
the technique's verdicts:

- **Still holds:** the BuildId match, `docs/XR-TOOLCHAIN.md:190 "still matches the engine"`. The engine side was
  re-read for this extraction on 2026-10-07: `Engine/Build/Build.version:6 "55116800"` and
  `Engine/Binaries/Win64/UnrealEditor.version:10 "55116800"`. The patch moved `Changelist` from 56702186 to 58210709
  and left `CompatibleChangelist` where it was.
- **New probe:** the game's editor target compiles,
  `docs/XR-TOOLCHAIN.md:191 "the editor build exited 0 in 393 s without the MetaXR plugins (run 4f661fa7, commit 1f9b0ea)."`
  That is one cold build in a fresh worktree, n = 1. The plugins were absent, so it says nothing about them; it
  shows only that the game module compiles on 5.8.3.
- **Unverified:** the plugin module load and the simulator boot marker,
  `docs/XR-TOOLCHAIN.md:192 "that the editor loads the plugin modules, and the simulator boot marker"`. F9's status
  line says the same: `docs/research/STACK-OPPORTUNITIES-2026-10.md:328 "not proven: the plugin load and the simulator boot"`.
  Both need the plugins in the main checkout, so they are an owner step. They are marked unverified rather than
  keeping their 5.8.2 stamp.

## The cheap re-probe after any patch

Compare each prebuilt plugin's `Binaries/Win64/UnrealEditor.modules` BuildId with the engine's
`Engine/Build/Build.version` CompatibleChangelist. It takes two file reads and no build, and the project already
scripts it: `apps/vr/tools/install-xr.ps1:326 "Engine\Build\Build.version"` and
`apps/vr/tools/install-xr.ps1:336 "PLUGIN_BUILD_ID_MISMATCH expected=$compatible actual=$buildId"`.

A mismatch means the prebuilt editor binaries were built for another engine build. That is the cause the report
alleged, and it stops the restamp. A match rules out that cause and nothing else. It restamps the BuildId claim
only; the load claims wait until the editor has loaded the modules. That is what the 5.8.3 re-check did.

## Provenance, after the audit

| Claim | Grade | Version | Mode | Date | On 5.8.3 |
| --- | --- | --- | --- | --- | --- |
| v207 plugins are built against 5.7.0 and fail to load on 5.8 | reported (vendor investigation 1053459897316880, via the plan) | "5.8", no patch | not stated | fetched 2026-10-02 (`5bc06ee`) | contradicted on 5.8.2 for two of four plugins; not retired |
| Both installed plugins' editor modules carry BuildId 55116800, the engine's CompatibleChangelist | probed | 5.8.2, CL 56702186 | file read | 2026-10-03 (`cb78e83`) | still holds, 2026-10-07 |
| The headless editor loads six plugin modules and 17 tests pass | probed, one run | 5.8.2, CL 56702186 | Win64 headless editor | 2026-10-03 (`cb78e83`) | **unverified** |
| The simulator boot logs `MAGEVR_BOOT_OK` | probed, one run | 5.8.2, CL 56702186 | Win64 game, simulator runtime | 2026-10-03 (`cb78e83`) | **unverified** |
| The engine is 5.8.3, CL 58210709, CompatibleChangelist unchanged | probed | 5.8.3 | file read | 2026-10-07 (`d693dcc`; re-read here) | n/a |
| The editor target builds with the optional plugins absent | probed, n = 1, 393 s | 5.8.3 | Win64 editor build, fresh worktree | 2026-10-07 (`1f9b0ea`) | n/a |

## Deviations, standard not lowered

- **The script reads one of the two plugins.**
  `apps/vr/tools/install-xr.ps1:319 "MetaXR\Binaries\Win64\UnrealEditor.modules"` is the only modules path it
  opens. The interaction plugin's match rests on the manual reads recorded on 2026-10-03 and 2026-10-07.
- **A mismatch is printed, and the run still passes.** The comparison writes one line and returns,
  `apps/vr/tools/install-xr.ps1:335 "if ($buildId -and $compatible -and $buildId -ne $compatible) {"`. If either
  value is missing it prints nothing. At `13253ac` no other file reads `PLUGIN_BUILD_ID`, apart from the toolchain
  record's prose. The re-probe works only if someone reads the output.
- **The contradicted claim is not rewritten where it lives.** The plan still lists it,
  `docs/PROJECT-PLAN.md:193 "Known open Meta bug"`, and does not say it was not reproduced on 5.8.2. Only the
  toolchain record carries the contradiction. The technique wants the losing claim kept visible and rewritten, so
  someone who reads only the plan sees the reported claim and no sign of the probe.
- **The stamps are prose.** The versions and dates here are sentences and section headings, not fields. The audit
  worked because every one of them names a changelist or a date, but it was done by reading, not by a query.
