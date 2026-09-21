---
layer: application
type: application
subject: agent-cli-transport
technique: subscription-auth-selection
stack: python
status: forged
verified_on: 2026-09-15
verified_against: python@3.11
applied: code
ab_verdict: better
---

# The child that inherited every key, and the allowlist that replaced it

*Verified against a private fleet agent runtime (Python, `requires-python >= 3.11`),
changed and gated on 2026-09-15. The runtime's paths are not cited because its code is
not public. The corroborating trees are `xkazm04/pumper` (public), whose engines already
build child environments from an allowlist, and `Shubhamsaboo/awesome-llm-apps` at
`4593569`, where the pattern this document corrects appears three times.*

## Three shapes of one decision

- **The tutorial tool clients undo a safe default.** The Python stdio tool-server
  client passes only a short list of safe variables unless given an environment.
  `mcp_ai_agents/multi_mcp_agent/multi_mcp_agent.py:50-60` and
  `mcp_ai_agents/multi_mcp_agent_router/agent_forge.py:163-170` give it `{**os.environ}`, handing every
  key in the process to servers fetched with `npx -y` at run time.
- **Pumper builds, never inherits.** `crates/core/src/process_env.rs` clears the
  environment, re-adds a platform baseline, and passes the Claude CLI its own
  `ANTHROPIC_*` names while the headless browser gets none. The module's own comment
  names the threat: the children process scraped pages, so an indirect instruction
  that gets one to print its environment is an exfiltration path.
- **The private runtime inherited.** Its CLI transport spawned `claude` or `codex` with
  the whole host environment plus the request's own variables. The child reads a
  composed prompt, tool output and whatever a channel delivered.

## The change and the paired probe

The transport now builds the child's environment: a start-up baseline (search path,
home and profile roots, temp, locale, proxy and CA variables), the named credentials of
the CLI being spawned (`ANTHROPIC_*` and the config root for `claude`, `OPENAI_*` and
`CODEX_HOME` for `codex`), then the request's variables on top.

One probe was run through the real transport before and after, with two sentinels planted
in the host environment (an invented secret and an error-reporting DSN), spawning a child
that prints the names it can see:

| arm | variables seen | planted secrets seen | child started | request variable delivered |
|---|---|---|---|---|
| A: inherit | 86 | 2 of 2 | yes | yes |
| B: allowlist | 22 | 0 of 2 | yes | yes |

Three tests pin it: the builder drops host secrets and keeps the baseline; each CLI gets
only its own credentials; and a real child spawned through the transport cannot see a
planted secret. The project's gate (lint, format, strict type check, the non-provider test
suite) ran green. The seam was chosen to falsify: an allowlist could have starved the CLI
of something it needs to start, and the real spawn is the assertion that it did not.

## What the realization cannot do

- **It is not the billing strip.** A key-authenticated user's CLI still receives its own
  key, exactly as before. Whether this runtime should prefer the subscription seat and
  strip the key is the owner's decision and was not taken here.
- **The runtime's local command sandbox still inherits.** It confines the working
  directory and merges the whole host environment into commands it runs. The same builder
  applies, and it is owed as its own change, because a sandboxed build command may need a
  wider baseline than a CLI does.
- **The baseline was not derived from the CLI's own documentation.** It mirrors the list
  pumper runs the same CLI under on the same platform, which is evidence it suffices and
  not proof that nothing is missing on another operating system.
