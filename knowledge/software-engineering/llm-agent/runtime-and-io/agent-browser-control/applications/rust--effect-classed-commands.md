---
layer: application
type: application
subject: agent-browser-control
technique: effect-classed-commands
stack: rust
status: forged
verified_on: 2026-10-22
verified_against: rust@1.96.1
applied: experiment
ab_verdict: not-better
---

# Personas desktop app: a command list with no effect class, and a name that still holds

The toolchain is pinned by `rust-toolchain.toml:6 "1.96.1"`, which is
the witness for the version above. The tree is the open-source Personas desktop app at
commit `fe4daf0e44`. It is not a browser driver. It is the closest fleet seam to the
technique's claim, because its backend exposes one flat list of commands to a webview
and to a test bridge, and nothing in that list says which commands only read.

## What the tree shows

- **The command list carries no effect class.** `src-tauri/src/ipc_shards/shard_2.rs:30 "commands::credentials::cli_capture::list_cli_capturable_services,"`
  is one of 1725 bare registrations across the shards, a path and a comma. No read,
  write or meta marker travels with any of them.
- **A private read list stands in for the registry.** The smoke test declares
  `tests/playwright/module-smoke.spec.ts:367 "const READ_ONLY_COMMANDS: Array<{ command: string; module: string; why: string }> = ["`
  and justifies each of its thirteen entries in prose, by reading the Rust body. That
  list is the technique's retry and allowlist class, derived by hand in one consumer
  and checked by nothing against the handlers.

## What was measured

The experiment chose the seam that could falsify the technique's premise that a
command's name is a lossy proxy for its class. If reads and writes hid behind
`list_` and `get_` names, a registry would buy a real fix. Of the 324 registrations
named `list_` or `get_` in the shards, none writes: a detector for state-changing
calls found one hit, `list_cli_capturable_services`
(`src-tauri/src/commands/credentials/cli_capture.rs:797`), which only resolves a
binary path on a blocking thread and is a read. The detector was positive-controlled
on `set_persona_enabled` (`src-tauri/src/commands/core/personas.rs:130`), which it
flags. No read-named handler took an output path in its first eight lines.

| arm | result |
|---|---|
| A: names as the class | 0 of 324 read-named registrations write |
| B: a declared class per command | no mismatch for it to catch |

**Floor:** the smoke test's thirteen reads are all read-named. The count was
re-derived on 2026-10-22 and is 324 here against 327 in the earlier same-day run;
the tree and the pattern differ slightly, and the claim does not depend on the
difference.

## What this realization cannot do

The name proxy holds because the authors name by convention, not because anything
enforces it, so one rename would break it silently. The experiment covered the
`list_` and `get_` prefixes only: a read named by another verb, such as a status or
export command, was not classified, and no caller here is restricted to reads, which
is the case that makes a class load-bearing. Nothing was shipped to the tree.
Return when a view-only or remote caller is granted a verb outside those prefixes,
or when the smoke test's list drifts from the registered handlers.
