---
layer: application
type: application
subject: ship-pipeline-gating
technique: post-cook-process-liveness-smoke
stack: node
status: forged
---

# A post-cook smoke test in Node

`src/lib/packaging/smoke-test.ts` (149 lines) in the PoF repo implements the liveness
gate for an Unreal Engine 5 staged build on Windows. Its header comment states the gap it
closes: *"cook succeeded; nobody verified the exe runs"*.

## The bootstrap-versus-game distinction, made explicit in the types

`SmokeTestResult` carries both processes as separate fields:

```
gameAlive: boolean;            // the real game process at the end of the window
bootstrapExitCode: number | null;  // the launcher, if it exited during the window
```

and `status` is derived from `gameAlive` alone (line 143: `status: gameAlive ? 'pass' :
'fail'`). `bootstrapExitCode` is recorded and never judged. That is the technique's
central rule expressed as a type: the thing you spawned and the thing you care about are
two fields, and only one of them decides.

The comment says why: *"the bootstrap can exit while the game keeps running"*. The
staged `<StageDir>\<ProjectName>.exe` is a launcher; the real process is a separate image.

## Deriving the identity rather than hardcoding it

`deriveGameImage(projectName, platform, config)` (line 68) encodes the configuration
dependence directly:

```ts
if (config === 'Development') return `${projectName}.exe`;
return `${projectName}-${platform}-${config}.exe`;
```

A shipping build runs as `PoF-Win64-Shipping.exe`; a development build runs as the bare
`PoF.exe`. A gate with either name written into it is vacuous for the other
configuration. This is the technique's "derive the expected identity" rule and it is the
kind of detail that is invisible until the first configuration switch.

Resolution is by image name via `tasklist /FI "IMAGENAME eq <image>"` (line 76) — rung 2
of the technique's ladder, not rung 1. The process tree is not walked; a same-named
process started by anyone else counts as alive.

## The observe window

`DEFAULT_OBSERVE_MS = 25_000` (line 55), launched windowed at 1280x720 with `-log`. The
window is reported in the result (`observedMs`) and in the one-line note:
`smoke-test: pass (PoF-Win64-Shipping.exe survived 25s)` (line 147). The technique's
"state the interval, the verdict is meaningless without it" rule is satisfied.

Every side effect is injectable — `spawnFn`, `tasklistFn`, `killImageFn`, `killPidFn`,
`sleep`, `now` — so the gate is unit-testable without launching anything. Worth copying
wholesale for any gate that drives real processes.

## The deviation: killing by image name

Cleanup (line 137) calls `killImage(opts.gameImage)` before `killPid(pid)`, and
`defaultKillImage` runs `taskkill /IM <image> /T /F` (line 84). That is a broadcast
force-kill of every process with that name on the machine, including a developer's own
running instance of the same build. On a dedicated agent it is harmless; on a
workstation it destroys a live session the gate did not create.

The technique does not lower its standard for this. Kill the resolved identifier or its
process tree; if exclusive use of the machine is genuinely required, take a lease and
refuse when it is held. The `killPidFn` path is already present and correct — the
image-wide kill exists only because `tasklist`-based resolution never learned the real
process's identifier, which is the same weakness that puts this implementation on rung 2
of the resolution ladder rather than rung 1.

## What it does not claim

`smokeResultNote` says only that the image "survived 25s". Nothing in the module reports
rendering, input, or level load, and nothing pretends to. That honesty is the reason the
gate is worth its half-minute.
