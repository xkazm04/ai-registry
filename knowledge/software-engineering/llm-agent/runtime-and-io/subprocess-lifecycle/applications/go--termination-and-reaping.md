---
layer: application
type: application
subject: subprocess-lifecycle
technique: termination-and-reaping
stack: go
verified_on: 2026-08-22
---

# Termination and reaping in containerd

How the container runtime behind most of the world's production workloads realizes
the stop ladder, the reap, and the orphan sweep. Citations are against containerd
`2.4.0-beta` (`version/version.go:27`), commit `301026e` (2026-08-22). This is a
reconciliation against an external tree — not the consumer repo the sibling
applications cite — so the pin lives in prose rather than in `verified_against`,
whose contract is a stack runtime version.

The shape to hold first: containerd deliberately **does not parent its workloads**.
The daemon spawns a per-container *shim* with `Setpgid: true`
(`cmd/containerd-shim-runc-v2/manager/manager_linux.go:110-112`, and for the generic
client `pkg/shim/util_unix.go:53-57`), then lets go of it. That is the technique's
kill-on-drop insurance inverted on purpose: containerd is restartable *because*
dropping the parent must not kill the tree — so every parental obligation moves down
a level, and a second sweep covers the shim dying itself.

## The reaper is a subreaper, and it is a broadcast

The shim calls `SetSubreaper(1)` at startup unless disabled
(`pkg/shim/shim.go:233-237`, `pkg/shim/shim_linux.go:30`), so every descendant that
outlives its immediate parent reparents to the shim rather than to pid 1. It then
registers `SIGCHLD` (`pkg/shim/shim_unix.go:38-46`) and a signal loop that calls
`reaper.Reap()` on every one (`shim_unix.go:73-92`).

`Reap` is "reaping is unconditional" in one function: a `wait4(-1, …, WNOHANG)` loop
that drains *every* collectable child, not the one the caller cared about
(`pkg/sys/reaper/reaper_unix.go:253-278`), then fans each exit out to all subscribers
(`:65-81`). Callers never wait on their own process; they `Subscribe()` to a buffered
channel before `Start()` (`:96-103`, `:162-170`) and filter for their pid in `Wait`
(`:115-127`), which still calls `c.Wait()` "to make sure we flush all IO" and then
`Unsubscribe`s. One convergence point, many paths — the technique's audit rule — and
`subscriber.close()` is guarded by a `closed` flag (`:46-55`), so the double-fire it
predicts is idempotent rather than a panic.

`notify` (`:193-237`) will not drop an exit: it retries every subscriber not ready
within 1ms until all have taken the event, and `Reap` waits up to a second for that
broadcast to land (`:75-78`). `exitStatus` then encodes the ending honestly —
`128 + signal` for a signalled death, the plain code otherwise (`:280-289`).

## The ladder lives at the policy layer, not the runtime layer

containerd's own `Kill` is a pure forwarder — signal in, signal to runc, no
escalation, no deadline (`cmd/containerd-shim-runc-v2/task/service.go:493-502` →
`process/init.go:367-372`). The ladder is one layer up, in the CRI service, and it is
complete: take the stop signal **from the container's or image's config** rather than
a universal default (`internal/cri/server/container_stop.go:166-198` — the
per-tool-class constant, read from the workload's own manifest), send it, wait out
the caller-supplied `timeout`, escalate to `SIGKILL` only on expiry (`:217-233`), then wait again for the
exit to be *observed* before returning (`:237-241`). A repeat stop is deduplicated by
a compare-and-swap so it cannot re-signal a container already in its grace window
(`:200-206`) — cancellation idempotent, as required.

Rung 3 addresses the tree, not the pid: `KillAll` sends `SIGKILL` with the OCI
runtime's `All: true`, addressing the container's whole cgroup rather than a pid list
containerd computed (`process/init.go:375-383`). And `checkKillError` maps every
"already gone" spelling the platform produces — `ESRCH`, "container not running",
"process already finished" — onto `ErrNotFound` (`process/utils.go:115-126`), so
losing the race to a natural exit is a labeled state, not an error.

## Init exit means the family exits

`handleInitExit` (`task/service.go:723-765`) enforces an invariant the technique
implies but does not name: *for a container, the init exit must be the last exit
published*. It kills the remaining processes first — but only when
`ShouldKillAllOnExit` finds no *newly created* pid namespace in the spec
(`runc/util.go:33-48`), since a private one has already reaped them for free, and an
unreadable `config.json` **fails toward killing** (`:36-37`). It then holds the init
exit event behind a countdown of running execs (`:741-764`).

## Orphans: a startup sweep, keyed by marker

`LoadExistingShims` (`core/runtime/v2/shim_load.go:39-64`) is the technique's startup
orphan sweep, enumerating **by marker, not by name** — the marker is the bundle
directory in the state dir, per namespace. For each bundle it reconnects over ttrpc
and proves liveness with a real call — `s.PID(ctx)` (`:239-259`) — under a 5s budget
for the whole load (`:134-139`, `shim.go:63,74`), so a wedged shim cannot stall
daemon startup. A shim that does not answer gets `cleanupAfterDeadShim` (`shim.go:144-187`), which runs the shim binary's
own `delete` action to tear the container down out-of-process (`binary.go:155-218`)
and publishes the `TaskExit`/`TaskDelete` pair — the sweep as bookkeeping repair. A
shim that answers but reports *no* pids and is not a sandbox is a leak from a daemon
crash between create and start, and is reaped too (`shim_load.go:197-215`,
`:222-226`); `cleanupWorkDirs` (`:264-296`) deletes work dirs owned by no live shim.

## Deviations

**Pid recycling is documented, not solved.** `processExits` opens with the admission
that a container process can exit and have its pid reused before that exit is
processed, and that "there is no way for us to handle the exit correctly in that
case (until pidfd support is implemented)" (`task/service.go:661-666`). The technique's
re-verify-identity-before-acting rule is unmet at the exit path in the one code base
most entitled to claim it. `pkg/sys/pidfd_linux.go` exists; this path does not use it.

**"Lost" is spelled as a synthetic exit status.** When containerd cannot know how a
task ended it does not report *unknown*; it invents. A dead shim that returned no
delete response is published as `ExitStatus: 255` (`shim.go:169-172`); the runc
shim's force-cleanup path reports `128 + SIGKILL` = 137
(`manager/manager_linux.go:337-341`) for a container it never observed dying. Both
are plausible codes indistinguishable from observed ones — the `lost` verdict
collapsed into `killed`. The counter-example sits in the same tree: `shimCallError`
prefixes "shim killed after \<ctx error\>" precisely because `TerminateProcess(h, 1)`
is otherwise indistinguishable from the shim exiting 1 (`binary.go:221-239`).

**The reaper's two halves are separately switchable.** Subreaper mode is gated on
`Config.NoSubreaper`, the `SIGCHLD` handler on `Config.NoReaper`
(`pkg/shim/shim.go:84-87`), read at two sites (`shim.go:233`, `shim_unix.go:41`).
Setting only `NoReaper` yields a process that collects the whole machine's orphans
and waits on none of them. No in-tree shim does this; nothing stops one.

## Reconciliation summary

Confirmed: unconditional reaping via subreaper plus `wait4(-1)`; one convergence
point for exit collection, with a guarded idempotent close; signal-vs-code exit
honesty at `128+n`; a full polite→deadline→`SIGKILL`→verify ladder with a
per-workload stop signal and CAS-idempotent cancellation; tree kill via cgroup, not
pid walk; kill races labeled `NotFound` rather than errored; a marker-keyed startup
orphan sweep that also repairs the record. Deviations: pid recycling unhandled at the
exit path (self-documented); `lost` published as a synthetic exit code (255 / 137);
reaper and subreaper independently disableable. Not present by scope: the "which rung
was needed" ledger — the exit event is emitted, but nothing counts how many
containers needed `SIGKILL`, so that signal must be rebuilt by the orchestrator.
