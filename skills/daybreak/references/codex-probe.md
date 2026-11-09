# Codex CLI probe

Measured 2026-11-09 with `codex-cli 0.166.0` on Windows 11, in a scratch git repo outside the registry. Model `gpt-6.1-sol` was accepted. Nothing here was assumed: each row names the command that produced it.

## Facts

| # | Question | Measured fact |
|---|----------|---------------|
| 1 | Flags that matter | `-m <model>`, `-c key=value` (TOML-parsed, dotted path), `-s read-only\|workspace-write\|danger-full-access`, `-C <dir>`, `--json` (JSONL on stdout), `-o <file>` (last message), `--skip-git-repo-check`, `--ephemeral`, `--ignore-user-config`. Prompt is a positional arg, or `-` / no arg reads stdin. |
| 2 | Trivial write exec | exit 0, 13 s, 7 JSONL lines. `-s workspace-write` wrote `hello.txt` in the cwd without any prompt. |
| 3 | Event shapes | `thread.started {thread_id}`, `turn.started`, `item.completed {item:{type:agent_message,text}}`, `item.started` / `item.completed` with `item.type=command_execution`, `turn.completed {usage:{input_tokens,cached_input_tokens,output_tokens,reasoning_output_tokens}}`. Also `item.completed` with `item.type=error {message}` (non-fatal warnings). |
| 4 | Where the session id is | The very first line: `thread.started.thread_id` (a UUID). It is available even if the run is later killed. |
| 5 | Final message | Last `agent_message` item in the stream, and `-o <file>` when the run finishes. When the process was killed, the `-o` file was NOT created, so the runner must derive last.md from the events. |
| 6 | Read-only refusal | `-s read-only` asked to write: no file written, exit code 0, stream has an ordinary `agent_message` saying the write was blocked. stderr has `ERROR codex_core::tools::router: ... writing is blocked by read-only sandbox`. A refusal is NOT visible in the exit code. |
| 7 | Timeout | Killed with `taskkill /pid <pid> /T /F` after 30 s: the codex process tree went away, the shell wrapper reported exit 1 (taskkill's code), `-o` file absent, no leftover codex process from the probe. |
| 8 | Resume | `codex exec resume <thread_id> [PROMPT\|-]` continued a killed session: exit 0, 8 s, answered with the prior context. `resume --last` exists in help but was not run (it picks the newest session, so it is unsafe when several run in parallel; use the id). |
| 9 | Resume lacks `-s` and `-C` | `codex exec resume --help` has no `-s` and no `-C`. Sandbox on resume worked via `-c sandbox_mode=workspace-write` (wrote `resumed.txt`). Working directory is the spawn cwd, so spawn with `cwd` set. |
| 10 | Stdin prompt | `echo "..." \| codex exec ... -` works. With a positional prompt and an inherited stdin, stderr prints `Reading additional input from stdin...`. |
| 11 | Unknown model | `-m gpt-5-nonexistent-zz` did NOT fail at startup: it emitted an `error` item "Model metadata for ... not found. Defaulting to fallback metadata" and carried on. A typo in the model name therefore does not crash; check the first events for that item. |
| 12 | Windows launch | `codex` on PATH is `codex.cmd` (a shim). `spawn('codex', [...])` without a shell fails with ENOENT; `shell: true` works only if no argument contains a space (an argument with spaces split and the command exited 2 at once, 0.1 s). So pass every argument space-free and the prompt on stdin. |

## Commands

```sh
# 2: trivial write
codex exec -m gpt-6.1-sol -c model_reasoning_effort=medium -s workspace-write --json "Create a file hello.txt in the current directory containing exactly: hi"

# 3/10: read-only, prompt on stdin
echo "Create a file ro.txt containing: hi" | codex exec -m gpt-6.1-sol -c model_reasoning_effort=medium -s read-only --json -

# 7: timeout (node spawn with shell:true on Windows, stdin prompt, kill after 30 s)
taskkill /pid <pid> /T /F

# 8/9: resume a killed session, with sandbox through -c
echo "Create resumed.txt containing yes" | codex exec resume <thread_id> -c model_reasoning_effort=medium -c sandbox_mode=workspace-write --json -
```
