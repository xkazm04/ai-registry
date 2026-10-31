---
layer: application
type: application
subject: subprocess-lifecycle
technique: spawn-contract
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.80
---

# The spawn contract in the Rust engine

The repo's spawn door for its dominant child — the Claude Code CLI, which is
the LLM for every persona execution — is `src-tauri/engine/src/cli_process.rs`
plus the argv/env constructor `src-tauri/engine/src/prompt/cli_args.rs`. The
module doc states the extraction motive outright: spawning, PID registration,
and cancellation "were previously duplicated across `runner.rs` and
`test_runner.rs`" — the many-doors state the technique warns about, repaired.

## One spawn door, and what folding into it bought

`spawn_headless_claude` (`cli_process.rs:439-454`, delegating to
`spawn_headless_claude_tier`, `:477-539`) owns "the entire spawn
envelope that used to be hand-rolled at each call site". Its doc comment
(`cli_process.rs:426-431`) is a measured instance of the technique's central
claim: before the door existed, some call sites applied
`force_subscription_auth` and "some forgot to — meaning idea scans, task
executions, and twin generations could silently fall back to pay-as-you-go API
billing". Folding it into the shared path "closes that gap for every caller,
with no opt-out" (`cli_process.rs:515` — "Mandatory... No caller may opt
out"). `CliProcessDriver::build_and_spawn_core` (`cli_process.rs:1078-1083`, body in
`build_and_spawn_with`, `:1087-1130`) is
the same door for the streaming runner family.

Re-checked 2026-10-31 at personas@22260d77: the door count is now three plus
a probe. `run_claude_cli` (`cli_process.rs:717`) is a separate one-shot Claude
spawn for plain-text review passes, and `capture_output` (`:865-952`) is the
probe door. Each applies `force_subscription_auth` itself (`:753`, `:907`), and
`run_claude_cli`'s doc comment says the strip "must not drift between copies".
The billing invariant still holds at every door. Holding it now depends on
copies agreeing, not on one door.

## Deliberate executable resolution — the shadowing-binary hardening

`claude_cli_invocation` (`cli_process.rs:69-84`) documents two real-machine
failures of ambient resolution: a *broken* `claude.cmd` earlier on PATH (a
stale nvm-for-Windows global) shadowing the working one, and the shim
vanishing from `%APPDATA%\npm` while the real binary remained.
`resolve_claude_exe_windows` (`cli_process.rs:104-150`) therefore resolves the
**actual executable** and runs it directly — "no `cmd`, no shim, no PATH
lookup" — checking the native-installer location first, the canonical
npm-global layout second, and only then scanning PATH entries; the legacy
shell-shim form survives only as a last-resort fallback. The comment at
`:67-68` names it "THE single source of the Claude invocation", and
`cli_args.rs:8-9` routes the prompt builder through it so Fleet's PTY spawn
and the engine cannot drift apart.

## Env construction — and the deviation

`build_cli_args_inner` (`cli_args.rs:91-279`) assembles argv as a real vector
(flags from a closed builder — effort pinned to a deterministic default
because CLI 2.1.94 silently changed the implicit one, model/budget/turns from
persona fields) and env as explicit `env_overrides` + `env_removals`. The
removals are a *security* strip with a stated invariant:
`CLI_SUBSCRIPTION_RESERVED_ENV` (`cli_process.rs:36-40`) enumerates the three
API-billing variables stripped "from EVERY spawned CLI's environment", applied
*after* all overrides so nothing re-introduces them, and pinned by three tests
(`cli_process.rs:1422-1511`), including an end-to-end one that spawns a real
shell and reads the child's actual environment.

**Deviation (reported, not repaired):** this is inherit-then-strip, not the
technique's construct-from-allowlist. The child inherits the host's full
environment minus an enumerated denylist — every host variable not on the
list rides along unaudited. The strip's own history (the billing leak) shows
why the denylist posture stays one forgotten variable behind.

Re-checked 2026-10-31 at personas@22260d77: the allowlist posture now exists
in this file, opt-in. `capture_output` (the probe door) and
`CliProcessDriver::spawn_scrubbed` start from `env_clear()` plus a named
`PROBE_INHERITED_ENV` set (`cli_process.rs:881-891`, `:954-965`, `:1021-1035`),
with the stated reason that a child must not inherit the parent's
`PERSONAS_API_KEY`. The Claude spawn doors this section describes
(`spawn_headless_claude_tier`, `build_and_spawn_core` with `scrub: false`) still
inherit the host environment and strip, so the deviation stands for the dominant
child. The file's own comment says so: "every other `CliProcessDriver` spawn
still inherits the parent's environment, exactly as before".

## Nested-deadline alignment

`cli_args.rs:264-276` derives the CLI's *inner* API timeout from the
persona's *outer* process-kill deadline: `API_TIMEOUT_MS = timeout_ms − 5s`,
floored at 10s, "to give the CLI time to surface the timeout error cleanly
before the process is killed" — the technique's one-subtraction-at-the-door
rule, verbatim in production.

## Stream wiring and working directory

Every door variant wires all three stdio ends explicitly. Stdin is piped and
fed by a detached writer task (`cli_process.rs:529-536`) to dodge the classic
pipe deadlock the comment names (full stdout buffer blocks the child while
the caller still writes stdin); stderr defaults to null with a documented
reason (`cli_process.rs:1067-1071` — the ~4 KB pipe fills and hangs the child
if nobody reads it). Working directories: `spawn_temp`
(`cli_process.rs:1004-1019`) creates a per-run temp dir and owns its cleanup
(`cleanup_dir`, `:1218-1222` — the directory names its reaper);
`spawn` takes a caller-owned dir. **Minor deviation:** `spawn_cwd`
(`:1043-1053`) inherits the host's ambient current directory — the exact
coupling the technique forbids — kept for "design analysis, reviews" callers.

## The spawn record — partial

Spawn failure is honestly distinguished from exit (`NotFound` maps to an
install-guidance error, `cli_process.rs:518-527`), and PID registration into
a shared map (`register_pid`, `:1149-1153`) supports external cancellation. But
there is no single structured per-launch record (resolved binary, env names,
ceiling) — resolution outcome is not logged, which the shadowing history
suggests will be missed the next time "which binary actually ran" matters.
