---
layer: application
type: application
subject: subprocess-lifecycle
technique: termination-and-reaping
stack: node
verified_on: 2026-11-07
verified_against: node@24.22.1
applied: experiment
ab_verdict: better
proof: ab-paired
---

# What a force-killed host leaves behind, measured per binding

The technique used to say a child cannot be asked to handle its host's death. A
dataflow runtime's changelog says one does: the child gets the parent's pid at spawn,
arms a guard before anything can block, and kills its own process group, with three
named gaps. This harness tested that against real processes, with no product code
changed.

## The rig

A host spawns a child, and the child spawns a helper. The harness force-kills only
the host (`taskkill /F`, no `/T`) and polls both pids. Windows on ARM64, five runs per
cell, target and floor written before any arm ran.

- **Target:** child and helper gone within 3 s of host death, 5 of 5, idle and wedged.
  Baseline must be 0 of 5.
- **Floor:** host alive with its own main thread blocked for 6 s, no false kill.
- **Controls:** the listener saw a live pid alive and then dead. A heartbeat arm false-killed
  in the floor cell, 5 of 5, so the floor can go red.

## The first run was void

Every arm passed in 0 to 1 ms, the unguarded baseline included. The rig's own rule voided
it. The children had been spawned without `detached`, and with `detached: true` on the
child and the helper the baseline survived. So the default spawn binds a child to its
host here and a detached one does not. That difference is measured. Its mechanism, a
kill-on-close job the runtime makes for ordinary children, was not read from source in this
run. The numbers below are the detached run.

## Results

Milliseconds to both gone, or runs surviving at the end of the watch (5 s; 7 s for the
early cell).

| arm | idle | wedged | died before arm | blocked before arm | live stand-in pid | false kills |
| --- | --- | --- | --- | --- | --- | --- |
| no guard | 5 survive | 5 survive | - | - | - | 0 |
| pid poll, main loop | 313-719 | 5 survive | 1536-1606 | - | - | 0 |
| pipe end, main loop | 215-320 | 5 survive | - | - | - | 0 |
| pid poll, worker thread | 272-685 | 318-944 | 1488-1945 | 5 survive | 5 survive | 0 |
| pipe end, worker thread | 181-265 | 177-576 | 1485-1584 | 5 survive | 205-252 | 0 |
| kill-on-close job | 0-1 | 0-1 | 0 | 0 | - | 0 |
| missed heartbeat | - | - | - | - | - | 5 |

Reading the columns: the source's guard clears target and floor on a worker thread, and
the same logic on the main loop does not. "Blocked before arm" is the source's own named
gap, reproduced. The early cell's roughly 1500 ms is the child's scripted block before arming.

The job arm's host is a PowerShell script calling `CreateJobObject` and
`AssignProcessToJobObject`, with `JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE`. Its child is
assigned after start, and a child that spawned before assignment would escape.

## What this does not settle

- No POSIX run. Process groups and a parent-death signal were not measured, and the
  guard's kill here is a descendant walk (`taskkill /T`), not a group kill.
- The stand-in is a live process holding the handed pid. No pid was actually recycled.
- A second holder of the pipe's write end, and a descendant that breaks away from the
  job, were not tested.
- No fleet seam was changed or audited for detached children. Connected projects were read
  only in this run, which is why the mode is experiment and not code. A code test would put
  a guard or job on a real detached spawn and force-kill that project's host.
