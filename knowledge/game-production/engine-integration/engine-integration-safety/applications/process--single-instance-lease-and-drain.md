---
layer: application
type: application
subject: engine-integration-safety
technique: single-instance-lease-and-drain
stack: process
status: forged
verified_on: 2026-11-06
refresh_by: 2027-02-06
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Process: a wrapper around a long-lived headless editor, against its own status and stop

A project starts a headless engine editor through a small script that serves tool calls, and
records the process id and start time in a state file. In one working session that instance,
two days old, held the checkout, so the code written that session was never compiled. The
script's status read printed only "running" and the port, although the state file already held
the start time. Its stop command kills whatever process now has the recorded id, and the
project's own session plan warns against running it, because the platform reuses ids.

A run on 2026-11-06 tested the change on copies of the script in a scratch directory. No project
file changed, and no editor or build ran.

## What was compared

Arm A is the script as committed. Arm B reads the image name of the recorded process, prints the
holder's age with a line saying it blocks a build, and on stop kills only a process with the
editor's image name. Otherwise it clears the record and says so. That is 30 changed lines in the
diff of the two copies.

Each arm ran three fixtures, one run each, with the state file saying the instance started 48
hours earlier. **Target:** the status read names the holder and its age, and a foreign process
survives stop. **Floor:** a process with the editor's image name still stops, and a dead id stays
a no-op.

| Fixture | Arm A status | Arm A stop | Arm B status | Arm B stop |
|---|---|---|---|---|
| Record names an unrelated live process | "running" | killed it | "not running", names the other image | left it alive, record cleared |
| Record names a process with the editor's image name | "running", no age | killed it | "running", up 48.0 h, blocks a build | killed it |
| Record names a dead id | "not running" | no-op | "not running" | no-op |

The target moved and the floor held. The second fixture is the copied runtime under the editor's
image name, so the image check is exercised and a real editor is not.

## What this cannot show

It does not show that an agent reads the status before building, or that a build gets blocked
less often. The refusal naming the holder belongs to a separate turn lock and was not changed
here. A process whose image name matches the editor but which belongs to
another session would still be killed, so the image check narrows the hazard and does not close it.
Comparing a creation time would close more, and that was not tried.
