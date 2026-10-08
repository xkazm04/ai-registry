---
layer: application
type: application
subject: production-prompt-architecture
technique: platform-shell-conventions-in-the-baseline
stack: process
status: draft
verified_on: 2026-10-07
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# garden-vr: agents built the shell conventions the rules named, and only those

garden-vr is two seated Unity 6.6 URP apps built almost entirely by headless coding agents
from a standing rule file (`AGENTS.md`) and per-task briefs. They are developed PC-first:
a borderless-fullscreen Windows player with keyboard and mouse stands in for the Meta Quest
target until a later phase. The version witness is the editor path pinned in
`AGENTS.md:38 "Editor/6000.6.4f1/Editor/Unity.exe"`. Tree read at commit `14946ee`; anchors re-checked at `9a89355`.

The occasion was a review of an AI chat-driven game builder whose demo games could be
played and could not be left - Escape did nothing, and the reviewer had to switch away
from the window. The question for this tree: does a team building with agents have the
same hole, and if so, why there?

## The experiment: named vs unnamed conventions in one tree

No product code was changed. The arms are two groups of shell conventions in the same
tree: those the agents' standing rules name, and those they do not.

| Convention | Named where | Built where |
| --- | --- | --- |
| Pause when focus leaves | `AGENTS.md:19 "Fast start, clean pause/resume."` | `shared/packages/com.gardenvr.input/Runtime/Providers/KeyboardMouseIntentSource.cs:77 "void OnApplicationFocus(bool hasFocus)"`, with focus-loss PlayMode tests in both apps |
| Nothing lost on close | `docs/design/CONFORMANCE-sundial.md:118 "A waiting tend is saved on pause and quit"` | `apps/sundial/Assets/Scripts/Tend/SundialController.cs:264 "void OnApplicationQuit() { CommitEarly(); }"` and `apps/terrarium/Assets/Scripts/Ritual/JarRitualController.cs:444 "void OnApplicationQuit()"` |
| Recentre the view | `shared/packages/com.gardenvr.input/README.md:40 "Recentre the head offset"` | `shared/packages/com.gardenvr.input/Runtime/Mapping/KbmIntentMapper.cs:109 "Recentred?.Invoke();"` |
| Quit from inside the app | nowhere: the only quit in the docs and rules is the batchmode `-quit` flag | not built |

Named: three of three built, each with tests. Unnamed: zero of one. The key a desktop
player reaches for to leave is mapped to pause -
`shared/packages/com.gardenvr.input/Runtime/Mapping/KbmIntentMapper.cs:76-78 "SystemPause?.Invoke();"`
- and the only `Application.Quit` in the apps sits in the capture harness,
`apps/sundial/Assets/Scripts/Tend/FirstRunRecorder.cs:168 "Application.Quit(code);"`. With
`apps/terrarium/ProjectSettings/ProjectSettings.asset:116 "fullscreenMode: 1"` (borderless
fullscreen) and no resizable window, the PC player is left by an operating-system chord.

## Why this tree in particular

The target platform discharges quit: on the headset the system menu owns it, so every
plan written for the Quest build was right not to mention it. The PC stand-in has no
system menu, and it is the build the owner actually plays at each review. That is the
stand-in trap the technique describes - the duty fell between the two platforms, and no
rule assigned it.

## What was shipped, and what it cannot show

One line went into the agents' standing rules (`AGENTS.md` rule 2, garden-vr commit
`9a89355`): the PC player owes an in-app quit, through the keyboard and mouse provider, saving
as close does. It is a documentation change on purpose. The project's decision 0004 freezes
edits to Unity-compiled files until a session with a Unity licence can compile them, and
the input package is Unity-compiled.

The verdict is `unmeasurable`, and the instrument that would measure it is named: the first
Unity-licensed session builds from the amended rule, and the next PC review build is audited
for a quit path. Until then this is a cross-sectional observation over four conventions in
one tree. It is consistent with the technique and cannot by itself show that naming a
convention causes it to be built. The fourth convention could have been absent for another
reason, such as a deliberate choice for a headset-first app, though nothing in the decision
records says so.
