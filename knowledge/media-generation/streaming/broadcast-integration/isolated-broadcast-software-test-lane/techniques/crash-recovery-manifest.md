---
layer: technique
type: technique
subject: isolated-broadcast-software-test-lane
technique: crash-recovery-manifest
status: forged
laws: []
shared_with: []
use_when: [a test run modifies shared configuration and may be killed before it cleans up, running an unattended or scheduled lane, starting a lane on a machine where a previous run may not have finished]
---

# Crash-recovery manifest

Before its first mutation of anything outside its own scratch directory, the harness writes a
manifest to a fixed place on disk recording what it is about to change and how to undo it.
Every run reads that place first. A manifest present at start means a previous run did not
finish; the new run finishes the old restore before it does anything else.

## Why cleanup code is not enough

Teardown in the harness's own process runs only if the process gets to run it. The cases
that skip it are the common cases for an overnight lane: the job runner kills the process at
a timeout, the machine sleeps or reboots for an update, the test hangs and is terminated, the
power drops. The owner then opens their software in the morning into the harness's profile,
or with the harness's port and password in their global settings. Recovery has to live
outside the process that might die, and the only thing outside it that survives a reboot is
a file.

## What the manifest holds

- **The restore set**: each shared file's path, where its original bytes were copied, the
  original hash, and whether it existed.
- **Created artefacts**: profiles, scene collections and directories the harness created in
  shared locations, so recovery may remove exactly those and nothing that merely looks like
  them.
- **The process**: the identifier of the instance the harness launched and its start time,
  so recovery can tell whether that instance is still alive - and, because identifiers are
  reused, never trust the identifier alone to decide it may stop something.
- **A run identifier and the phase reached**, so a report can say what was interrupted.

It holds no secrets. The run's password is not recovery information; neither is anything
read from the owner's settings beyond the hashes.

## Ordering

Write the manifest **before** the first shared write, atomically (temporary file, then
rename), and make it durable before proceeding. Update it if the restore set grows. Remove
it **last**, after every restore has been verified by hash. Any other order leaves a window
in which a crash produces either a manifest that does not describe what was changed, or
changed files with no manifest at all.

## Recovery on start

1. If a manifest exists, the lane is in recovery. It runs no tests.
2. If any instance of the software is running, recovery does not stop it by the recorded
   process identifier. That identifier was written by a run that died, possibly before a
   reboot, and the operating system reuses identifiers; checking "an instance of the
   software is running" and then terminating the recorded identifier can terminate the
   owner's instance, or something else entirely. Proving the survivor is the harness's
   would take the run's password, which the manifest deliberately does not hold. So
   recovery waits or reports, and a survivor that cannot be identified is left for a human.
3. Restore each file from its recorded backup, verify by hash, remove the created artefacts
   the manifest names, then remove the manifest.
4. If any backup is missing or any file has been changed by someone else since, stop and
   report with both versions kept. A recovery that guesses is a second incident.

Only after recovery completes does the lane begin the new run, with a new snapshot taken
from the now-restored state. Snapshotting first and recovering second would record the
crashed run's leftovers as the owner's baseline.

## Decision rules

- **When the manifest cannot be written**, do not mutate; the run is skipped.
- **When recovery fails**, every later run refuses to start until a person clears it; a
  lane that runs around a failed recovery compounds it.
- **When nothing outside the scratch directory is mutated** (separate configuration root),
  the manifest still records the launched process and created directories, so leaked
  instances and disk debris are found.

## When not to use it

A harness that runs only inside a disposable machine or container destroyed after every run
has its recovery built in; the manifest adds nothing there.
