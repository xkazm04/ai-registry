---
layer: application
type: application
subject: subprocess-lifecycle
technique: spawn-contract
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.97.1
---

# A daemon start that held its caller's pipe until the daemon exited

The tree is the open-source speech tool vox, read at commit `96fe9dbc`. The witness for
the stack is `Cargo.toml:4 "edition"` (the 2024 revision); the experiment below ran on
rustc 1.97.1 on the platform the defect is specific to, which is why that version is
the one this document is verified against.

## The decision in the tree

`vox daemon start` launches a second copy of the tool that keeps speech models loaded
and returns. Its spawn wires all three streams,
`src/daemon.rs:473 ".stdout(Stdio::null())"`, and that was not enough. The tree says
why: `src/daemon.rs:499 "On Windows a child inherits every inheritable handle of its parent, not"`,
and the consequence for its callers, a script or an agent reading the start command's
output `src/daemon.rs:503 "waited until the daemon stopped"`.
The fix marks the spawner's own standard handles non-inheritable before the spawn,
`src/daemon.rs:532 "SetHandleInformation(handle, HANDLE_FLAG_INHERIT, 0);"`, and gives
the child no console and its own group,
`src/daemon.rs:536 "command.creation_flags(DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP);"`.
On the other platforms the function does nothing,
`src/daemon.rs:539 "Unix gives a child only the descriptors it is handed: nothing to do."`
It shipped in the release whose single line is
`CHANGELOG.md:8 "release the caller of daemon start on Windows"`.

## The experiment

The claim was checked before it was written into the technique, with a two-arm
spawner compiled on this machine: arm A spawns a five-ping child with all three
streams null and the tree's two creation flags; arm B does the same after marking its
own standard handles non-inheritable, exactly as the tree does. Each arm ran twice
under a shell pipe whose reader timed how long it waited for end of file.

| Arm | Reader waited (two runs) |
| --- | --- |
| A, streams null only | 4,169 ms and 4,114 ms |
| B, own standard handles non-inheritable | 83 ms and 42 ms |
| control: the child alone | 4,087 ms |

Arm A held the reader for the child's whole life. The same probe against a detached
spawn in a different runtime, with its streams ignored, returned in 131 and 245 ms, so
the defect belongs to the spawn primitive, not to the platform alone.

## What this realization cannot do

Marking the standard handles covers the three handles the caller is most likely to be
reading. Any other inheritable handle the spawner holds at that moment still reaches
the child: an inheritable socket, a pipe to another child. The tree holds none at that
point, because `daemon start` is a short command that spawns and exits, which is why
the narrow fix is enough here and would not be in a long-running process. The fix is
also permanent for the spawner: after it, the spawner's standard handles stay
non-inheritable, which the measured arm B showed does not break a later child that
inherits them on purpose, because that inheritance duplicates the handle.
