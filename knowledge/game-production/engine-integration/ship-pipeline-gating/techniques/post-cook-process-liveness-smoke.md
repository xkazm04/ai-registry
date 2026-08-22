---
layer: technique
type: technique
subject: ship-pipeline-gating
technique: post-cook-process-liveness-smoke
status: forged
laws: [structural-proof-is-never-sufficient, refuse-rather-than-destroy, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a packaged artifact must be proven to start, a launcher exits and the real process is unobserved, deciding what a smoke test may and may not certify]
---

# Post-cook process liveness smoke

## The concern

Packaging completed and produced a distributable. Nothing so far has caused that
distributable to execute. The gap between "it packaged" and "it runs" is filled by
missing content, a broken entry point, an unresolvable dependency, a configuration the
authoring environment supplied implicitly — none of which any structural check sees.
A liveness smoke closes the narrowest useful part of that gap: launch it the way a user
would, and confirm the real process is still alive after a stated interval.

## The launcher problem — the part everyone gets wrong

Packaged artifacts frequently ship a bootstrap: a small launcher, a shim, a supervisor, a
service wrapper. It performs setup, starts the real program, and **exits cleanly**. If
the gate waits on the process it spawned, it observes the bootstrap, and the bootstrap's
clean exit is compatible with three completely different worlds:

- the real program started and is running — the case you want;
- the real program started and has already died;
- the real program never started at all.

Observing the bootstrap cannot distinguish them. The gate must **identify and observe the
process it actually cares about**, not the one it happened to spawn. Generalise it: any
packaged artifact with a launcher, supervisor, service manager or process-group indirection
has this problem, and the question to ask of every liveness check is *which process am I
actually watching*.

Resolution, in order of preference:

1. **Follow the process tree.** Find descendants of the spawned process and identify the
   one matching the expected program. Robust to renaming, and it proves parentage.
2. **Match on the expected program identity**, scoped to processes that appeared after
   launch. Necessary when the real program detaches from its parent, which many
   bootstraps deliberately do.
3. **Derive the expected identity, never hardcode it.** The real program's process name
   is frequently a function of the build configuration and target platform — decorated in
   one configuration, bare in another. A gate with the name written into it passes
   vacuously the moment someone builds a different configuration, because the name it is
   looking for no longer exists and it reports the artifact dead, or worse, it looks for a
   name that another build left running. Derive the identity from the same configuration
   values that produced the artifact.
4. **Ask the artifact.** A program that writes a marker — a lock file, a port, a log
   line — when it has genuinely reached a running state gives a far better signal than
   process existence, and is worth adding to the artifact for this purpose alone.

## Procedure

1. Locate the staged entry point by the known layout rather than by scanning for
   anything executable. If it is absent, the gate fails here — that is a real finding
   about the package, not an infrastructure error.
2. Launch it detached, exactly as a user's action would, with the working directory the
   installed layout implies. A launch that only works from a particular directory is a
   defect you want this gate to find.
3. Resolve the real process by the ladder above. If it cannot be resolved at all, that is
   **unresolved**, a third verdict — not a pass, and distinct from a confirmed death.
4. Observe for a stated interval. Tens of seconds is the useful band: long enough to
   catch initialisation crashes, which is where the mass of the failure distribution
   sits, and short enough to run on every build. State the number in the report; the
   verdict is meaningless without it.
5. Re-check liveness at the end of the interval, and capture whatever the process wrote
   in the meantime.
6. **Terminate only what this gate started, and only what it positively identified.**
   Never kill by name a process you can only identify by name — a developer's own session
   of the same program is a live workspace, and destroying it is a worse outcome than an
   unfinished gate. Terminating by process-image name is the convenient implementation and
   the one to refuse: it is a broadcast kill against every instance on the machine,
   including the one a person is using, and it will eventually run on a workstation rather
   than an agent. Kill the identifier you resolved, or its process tree; when the target
   cannot be identified with confidence, report a precondition failure and leave the
   machine alone. If the gate genuinely requires exclusive use of the machine, take a
   lease and refuse when the lease is held, rather than clearing the way.
7. Report: launched or not, resolved or not, alive at the end or not, the interval, the
   machine shape, and the captured output.

## Decision rules

- **When the gate cannot identify the real process, it reports unresolved and does not
  pass.** Silence is not liveness.
- **When the artifact offers a readiness marker, prefer it to process existence.** A
  running process that is wedged before reaching a usable state passes a process-liveness
  check and fails a marker check. The marker is the stronger rung, for the same cost.
- **When the smoke fails, keep the artifact and the captured output.** A liveness failure
  that cannot be reproduced because the staged build was cleaned costs more than the gate
  saved.
- **When it passes, say on what.** One machine of one shape. A pass on the build agent
  generalises to the build agent.

## What a liveness smoke does not prove

State this in the report, every time, because the number of people who will read a green
smoke as "the build works" is large.

It does not prove that anything renders, that input is handled, that the first scene or
screen loads, that saved state works, or that the artifact is correct in any sense
beyond continuing to exist. It is a weak rung on the evidence ladder — the discipline of
ordering evidence by observational kind, and of designing checks that can actually
discriminate a defect, belongs to a neighbouring subject on runtime observation, and a
smoke test is explicitly one of its lower rungs. What it *does* prove is real and
frequently violated: the artifact starts on a machine that is not the developer's, and it
does not die immediately. That beats "the packager returned zero" by a wide margin, and
it costs half a minute.

## When not to use this

- When the artifact cannot run on the build machine — a different architecture, a device,
  a console. Then the honest gate is a deployment to a target device, and a smoke on the
  wrong machine is worse than none because it produces a green that means nothing.
- When a richer harness already drives the artifact into a specific verified state. The
  richer evidence subsumes liveness; do not run both and report two numbers for one
  quantity.
- As the artifact-level gate. It is one rung. Size, content and capability gates are
  separate observers of separate failure classes and none of them substitute.
