---
layer: application
type: application
subject: agent-cli-transport
technique: subscription-auth-selection
stack: claude-code
verified_on: 2026-08-30
verified_against: claude-code@2.1.251
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
- **Zero-token probe**: `claude auth status` prints JSON and exits 0 when
  authorized. On 2.1.251 the record carries `loggedIn`, `authMethod`,
  **`apiProvider`** (not recorded at 2.1.245), `subscriptionType`, plus
  `email`, `orgId`, `orgName`, `projectsDirectory`, `analyticsDisabled`.
  This is the cheap seat-direction proof the availability probe wants — but
  see the measurement below before asserting a single field of it.
- **Headless/CI seats**: `claude setup-token` mints a long-lived
  subscription token — the sanctioned alternative to copying a browser
  session's cached credentials between machines.
- `total_cost_usd` appears in the result envelope **even on subscription
  auth** (informational); metering code must not read its presence as
  proof of metered billing.

## Measured: the probe answers about its own environment (2026-08-30, 2.1.251)

`claude auth status` was run repeatedly on one logged-in Max seat, varying
only the child environment. Every row is reproducible; the clean baseline
was re-run between rows and returned to `max` each time.

| environment | `authMethod` | `apiProvider` | `subscriptionType` |
| --- | --- | --- | --- |
| clean | `claude.ai` | `firstParty` | `"max"` |
| `ANTHROPIC_API_KEY` set | `claude.ai` | `firstParty` | **`null`** |
| `ANTHROPIC_API_KEY=zzz` (malformed) | `claude.ai` | `firstParty` | **`null`** |
| `ANTHROPIC_AUTH_TOKEN` set | **`oauth_token`** | `firstParty` | *(absent)* |
| `CLAUDE_CODE_USE_BEDROCK=1` | `third_party` | **`bedrock`** | *(absent)* |
| `CLAUDE_CODE_USE_VERTEX=1` | `third_party` | **`vertex`** | *(absent)* |
| `ANTHROPIC_BASE_URL` set | `claude.ai` | `firstParty` | `"max"` |

Three things follow, and they are why the probe belongs behind the spawn
door rather than at the host's prompt:

1. **The probe is a statement about one process's environment**, not about
   an account. Run it where the host stands and it describes the host; the
   spawned child runs with the strip applied and can answer differently.
2. **The field that moves is different per leak.** An adapter asserting
   `authMethod === "claude.ai"` passes with a metered key present. One
   asserting `apiProvider === "firstParty"` passes with a metered key *and*
   with `ANTHROPIC_AUTH_TOKEN`. `loggedIn` passes on every row. Only a
   non-null `subscriptionType` catches the API-key case — and that is the
   field an adapter is least likely to assert, because it looks like plan
   trivia rather than a billing signal.
3. **Presence, not validity, moves it.** `ANTHROPIC_API_KEY=zzz` — a value
   that cannot authenticate anything — nulls `subscriptionType` exactly as a
   real key does. The report reflects the environment's *configuration*, so
   it is a good detector of a leaked variable and no evidence at all that a
   credential works.

Practical rule for this stack: probe through the same environment
construction the run uses, and assert the whole record against an expected
shape (`loggedIn === true && authMethod === "claude.ai" && apiProvider ===
"firstParty" && typeof subscriptionType === "string"`), treating an
unexpectedly empty field as unknown rather than unchanged.

## Two new ceilings on 2.1.251 (help-verified 2026-08-30)

The subject states that no tool in this class ships an overall wall-clock
flag. Re-checked today on all three locally installed tools: still true,
none has one. But this CLI has grown a ceiling of a different kind that a
transport in this subject should know about:

- **`--max-budget-usd <amount>`** — "Maximum dollar amount to spend on API
  calls (only works with `--print`)". A *spend* ceiling rather than a time
  ceiling, and directly relevant to a subject whose thesis is economics: on
  the metered leg of the ladder it is a real bound the adapter no longer has
  to synthesize. Semantics under seat auth were not smoked (UNVERIFIED
  whether it is inert or still counts notional cost).
- **`--restricted`** — a first-class hardened stance: removes the
  command-and-code-running tools and web fetch unless `--tools` names them,
  ignores user/project/local settings files, confines file tools to the
  working directories, and **refuses `bypassPermissions`**. This is a
  stronger and more purpose-built isolation than the `--setting-sources
  user` workaround the output-normalization page records, and unlike
  `--bare` it does not change the auth direction. Flag surface verified in
  help 2026-08-30; behavior not smoked (UNVERIFIED).
