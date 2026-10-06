---
layer: application
type: application
subject: agent-cli-transport
technique: permission-stance-enforcement
stack: antigravity-cli
verified_on: 2026-10-02
verified_against: antigravity-cli@1.2.15
---

# Permission stances on the Antigravity CLI (`agy`)

First coverage of this tool in the subject. `agy` 1.2.15 on win32, installed as `%LOCALAPPDATA%\agy\bin\agy.exe`
(the installer does not put it on PATH; `agy install` does). Every row below was executed on 2026-10-02 against the
CLI's real flags, as an unattended worker driven from another agent's shell. Rows are **[RUN]** (observed) or
**[LOG]** (read from the CLI's own log under `~/.gemini/antigravity-cli/log/`).

## Print mode never prompts, so every unapproved tool is a silent no-op

`agy -p "<prompt>" --output-format json` exits 0 with `"status": "SUCCESS"` even when the model achieved nothing:
**[RUN]** a read-and-answer task returned `"response": ""` and `"denied_actions": [{"action": "command"}]`, with
stderr saying the tool "required the \"command\" permission that headless mode cannot prompt for, so it was
auto-denied". **[LOG]** `tool_confirmation_manager: Print mode: soft-denying tool confirmation "RunCommand"`.
The adapter must treat a non-empty `denied_actions` (or an empty `response`) as a failed turn, whatever `status` says.
This is the tool's version of the silent-downgrade failure the technique names.

## The edit stance is an allow-list in settings, not a flag

The only bypass flag is `--dangerously-skip-permissions` (approve everything). The bounded alternative is
`permissions.allow` in `~/.gemini/antigravity-cli/settings.json`, with rule forms `read_file(*)`,
`write_file(<absolute path prefix>)`, `command(*)` or `command(<exact command>)`, `url(<domain>)`, `mcp(*)`.
**[LOG]** after adding `["read_file(*)", "write_file(<repo>)", "command(*)"]` the CLI logged
`CLI settings initialized: permissions=&{Allow:[...] Deny:[...] Ask:[]}` and the same task completed (files read, a
command run, a correct answer). Two caveats, both observed:

- The settings file is **machine-wide**: the allow-list also changes the owner's interactive sessions.
- **[RUN]** the CLI **rewrote the settings file** on its next start and dropped a `deny` entry that had been added by
  hand. Do not rely on settings-level deny rules surviving; put hard denies in a hook (next section).

## Hard denies live in a `PreToolUse` hook

A workspace `.agents/hooks.json` with a `PreToolUse` hook (matcher `*`) receives each tool call on stdin and answers
`{"decision": "allow" | "deny" | "ask" | "force_ask", "reason": ...}`.

- **[RUN]** `deny` is a hard block: a `git push` attempted by the worker came back as "tool call denied by pre-tool
  hook: <reason>", and the turn continued with that refusal visible to the model.
- **[RUN]** `allow` from the hook does **not** satisfy print mode's confirmation: with the hook answering `allow` but
  no settings allow-rule, the command was still soft-denied. Allow comes from settings; deny comes from the hook.
- **[RUN]** the hook's working directory is the **`.agents/` folder**, not the workspace root: `node tools/guard.mjs`
  failed with "Cannot find module '<ws>\.agents\tools\guard.mjs'". The CLI then **failed closed**: every tool call
  was blocked. Use `../tools/...` or an absolute path, and test the hook once on a read-only prompt.

## Stance summary for an unattended worker

| Stance | `agy` mechanism | Enforcement class |
|---|---|---|
| read-only scan | `--mode plan`, no allow-rules (commands soft-denied) | tool-enforced, but returns SUCCESS on a no-op |
| edit within one repo | `permissions.allow`: `read_file(*)`, `write_file(<repo>)`, `command(*)` + `PreToolUse` deny hook for history-changing and destructive commands | settings + hook; hook deny verified |
| full bypass | `--dangerously-skip-permissions` | none - not used for workers |
