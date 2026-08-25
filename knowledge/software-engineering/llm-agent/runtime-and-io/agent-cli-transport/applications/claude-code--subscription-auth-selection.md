---
layer: application
type: application
subject: agent-cli-transport
technique: subscription-auth-selection
stack: claude-code
verified_on: 2026-08-25
verified_against: claude-code@2.1.245
---

# Seat-vs-key selection for the Claude Code CLI

The Claude Code CLI runs under either the operator's claude.ai OAuth
session (Pro/Max subscription — flat rate) or `ANTHROPIC_API_KEY` (metered
API billing). When the key is present in the environment, the CLI can use
it in preference to the seat — long-standing documented behavior — so a
spawning application that means to bill the subscription must strip it
deliberately. All three field implementations do, and none makes it a
call-site responsibility:

- **kp** (`pipeline/jobfit/claude_cli.py`): `_API_KEY_ENV =
  ("ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN")`, stripped in
  `_child_env()` by default (`strip_api_key=True`). The module header
  states the economics outright: with the key unset the CLI runs on the
  subscription, "which makes it the cheap engine for *mass* jobs" — bulk
  fixture generation and eval sweeps run as a `ThreadPoolExecutor.map` of
  subprocesses precisely because the marginal call is free on the seat.
- **ascent** (`src/lib/llm/claude-cli.ts` and `src/lib/local/agent.ts`):
  `delete env.ANTHROPIC_API_KEY` before every spawn, in both seams, with
  the same one-line rationale ("force subscription auth (not
  pay-per-token)").
- **systedo-case** (`src/lib/llm/claude.ts`): strips the *session
  markers* instead — `CLAUDECODE` and `CLAUDE_CODE_ENTRYPOINT` — because
  its runs start from inside a Claude Code session and a child that
  believes it is nested misbehaves; the seat is its only auth path.

The fullest strip list is wider than the key itself: the provider-routing
switches `CLAUDE_CODE_USE_BEDROCK` / `CLAUDE_CODE_USE_VERTEX` (and the
Foundry equivalent) also move billing off the seat, and a related Rust
implementation of this same door (documented in the subprocess-lifecycle
subject's applications) pins its three-variable strip with a test that
spawns a real shell and reads the child's actual environment — after all
overrides, so nothing re-introduces them.

## The inversions and edges (dated 2026-08-25)

- `--bare` **inverts the rule**: in bare mode the CLI accepts *only*
  API-key auth (`ANTHROPIC_API_KEY` or an apiKeyHelper via `--settings`).
  Choosing bare mode for hook/noise isolation therefore silently changes
  the billing direction — the capability matrix carries both facts on the
  same row, and systedo's recorded lesson (bare mode → "Not logged in")
  is the field sighting.
- **Zero-token probe**: `claude auth status` prints JSON —
  `{"loggedIn":true,"authMethod":"claude.ai","subscriptionType":"max",…}`
  — and exits 0 when authorized. Verified live 2026-08-25. This is the
  cheap seat-direction proof the availability probe wants.
- **Headless/CI seats**: `claude setup-token` mints a long-lived
  subscription token — the sanctioned alternative to copying a browser
  session's cached credentials between machines.
- `total_cost_usd` appears in the result envelope **even on subscription
  auth** (informational); metering code must not read its presence as
  proof of metered billing.
