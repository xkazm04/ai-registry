---
layer: application
type: application
subject: subprocess-lifecycle
technique: spawn-contract
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.97.1
applied: code
ab_verdict: better
proof: ab-paired
---

# A detached dev server that held the pipe of whoever started the app

The tree is the desktop application personas, read at commit `cc2fadbfb9` and changed
in `e86c5e7a29` (on its default branch, not pushed). Its packages are pinned to the
2021 revision, `src-tauri/Cargo.toml:221 "edition"`; the build and tests ran with
rustc 1.97.1 on the platform the section is about.

## The seam

The application starts an operator's development server as a detached process that
must outlive it, `src-tauri/engine/src/verification_command.rs:21 "A dev server must OUTLIVE"`
the app. The spawn wires all three streams to null and gives the child its own group
and a breakaway from the job object. Before this change it did nothing about the
handles it had not wired. The tree had met the same class once already, for a
listening socket: `src-tauri/src/engine/webhook.rs:768 "clear HANDLE_FLAG_INHERIT on the listener socket. Sockets are"`
inheritable, and a child kept a dead process's port bound,
`src-tauri/src/engine/webhook.rs:772 "restart can bind past (bench nights 2026-08-25, twice, two ports)"`.
That fix was per handle. The application's own standard handles were still
inheritable whenever it was started with pipes, which is how `tauri dev`, a terminal
pipe or an agent's tool call starts it.

The seam was chosen to falsify: the tree's per-handle fix and its null streams could
have been enough, which would have made the section's claim about whole-table
inheritance a statement about one other tool.

## The paired proof

A replica of this exact spawn (the same three creation flags, the same raw
`cmd /S /C` form, all streams null, the same fallback when breakaway is refused) was
run under a pipe reader, twice per arm:

| Arm | Reader waited | Later child inheriting stdout printed |
| --- | --- | --- |
| A, as shipped | 4,145 ms and 4,148 ms (the child lived 4,087 ms) | yes |
| B, own standard handles released first | 84 ms and 72 ms | yes |

The target is the reader's wait; the floor is that a child spawned later with
inherited output still gets it, which held because inheritance on purpose duplicates
the handle. In the project's own test, run under the shell that drives the build, the
three standard handles were inheritable before the release and not after (flags
`[1, 1, 1]` then `[0, 0, 0]`), and the six tests of the module passed.

## The change

`spawn_detached` now calls a function that clears the inherit flag on this process's
three standard handles before it spawns, on that platform only. The function carries
the measurement in its comment, and a test reads the flags back. It is one file and
74 added lines, most of them the comment and the test.

## What this realization cannot do

It covers the three standard handles. Any other inheritable handle the application
holds at the moment of the spawn still reaches the server; the listener socket is
covered by its own fix, and nothing here enumerates the rest. The section's second
remedy, an explicit list of the handles to inherit, would close that, and the
standard spawn primitive this tree uses does not expose it on a stable toolchain.
The application started from its desktop shortcut has no piped standard handles, so
the defect only reached a person when the app was started from a terminal or a tool.
