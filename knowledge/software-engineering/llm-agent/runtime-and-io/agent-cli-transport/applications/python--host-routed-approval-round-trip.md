---
layer: application
type: application
subject: agent-cli-transport
technique: host-routed-approval-round-trip
stack: python
status: forged
verified_on: 2026-09-15
verified_against: python@3.11
---

# A chat host that answers a coding agent's approval requests from its own queue

The witness is `agentscope-ai/QwenPaw` (public) at commit `cbf1a40`, dated
2026-09-15. It is a Python agent runtime (`requires-python = ">=3.11,<3.14"`)
that hosts third-party coding agents behind its own console and messaging
channels. Paths are relative to the repository root. Every citation was
resolved against that commit on 2026-09-15. Nothing was run. This is a
reading of the code, and the deviations below come from tracing call paths,
not from observed incidents.

The tree realizes the technique twice, through the two answer channels it
names. One wrapped tool gets a long-lived server whose requests are answered
over the wire. The other gets a permission callback registered with the
tool's SDK. Both land in the same approval service.

## The wire, end to end

- **Server mode, not print mode.** The host launches the first coding agent
  as a long-lived `app-server` speaking line-delimited JSON-RPC on stdio
  (`src/qwenpaw/harnesses/codex/app_server.py:78-90`). Any message that has
  both an `id` and a `method` is a request from the child, and it goes to
  the approval path instead of the notification fan-out (`app_server.py:258-260`).
- **Fail closed at the transport.** If no handler is registered, the request
  is declined. If the handler raises, the request is declined
  (`app_server.py:267-281`).
- **The handler files a real pending approval.**
  `CodexAdapter._handle_server_request` (`src/qwenpaw/harnesses/codex/adapter.py:640-712`)
  accepts only three methods: command execution, file change and
  permissions. Any other method is declined (`adapter.py:645-651`). It looks
  up the thread's owners in `_thread_contexts`, which `run_turn` fills from
  the session id and the request context (`adapter.py:394-397`). Command and
  permission requests are filed as `high` severity and file changes as
  `medium`. The payload carries the literal command, the working directory
  and the requested permission set. Then it calls the host's shared
  `ApprovalService.create_pending_summary`, the same service the native tool
  guard uses.
- **Timeout becomes decline.** `wait_for_approval` turns an expired wait
  into `ApprovalDecision.TIMEOUT` and resolves the record as expired
  (`src/qwenpaw/app/approvals/service.py:506-538`). The adapter answers
  `accept` only when the decision is `APPROVED`. The default wait is 300
  seconds, set by `QWENPAW_TOOL_GUARD_APPROVAL_TIMEOUT_SECONDS` and floored
  at 1 (`src/qwenpaw/constant.py:396-408`).
- **A permissions request gets its own set back, or nothing.** On approval
  the handler returns exactly the requested `permissions`. Otherwise it
  returns `{}`. Either way the scope is `"turn"` (`adapter.py:696-705`).
- **The callback-shaped twin.** The second tool is driven through its SDK
  with `can_use_tool` bound to `QoderAdapter._approve_tool`
  (`src/qwenpaw/harnesses/qoder/adapter.py:499-506`, `519-559`). That method
  keys owners by the host session id directly, with no thread lookup. It
  files `high` for the shell tool and `medium` for everything else, waits on
  the same service, and returns allow with the unmodified input only on
  `APPROVED`. Anything else returns deny. The skip-permissions switch is
  enabled only when the selected mode is a bypass mode (`adapter.py:496-498`).
- **Presets are mapped per provider.** The catalog gives one tool a
  `sandbox` × `approval_policy` pair per preset (`src/qwenpaw/harnesses/registry.py:65-110`)
  and the other a single `permission_mode` (`registry.py:142-181`). The
  first tool's turn passes the pair through as `approvalPolicy` and
  `sandboxPolicy` (`codex/adapter.py:411-415`). The second passes its mode
  as `permission_mode` (`qoder/adapter.py:478`, `496`). The public write-up
  names the principle "Permissions Are Mapped, Not Artificially Flattened"
  (`website/public/blog/cross-harness-agent-os.en.md:519-527`).

## What the realization cannot do

- **The session binding is recorded but not enforced.** Both adapters store
  session, user and channel on the pending record, but both call
  `create_pending_summary` with the default `ApprovalIdentityPolicy.AGENT`
  (`codex/adapter.py:681-689`, `qoder/adapter.py:542-552`). Under that
  policy, `actor_can_resolve` checks only the agent id, and passes when no
  actor is given (`service.py:382-393`). The console route does refuse a
  request from a different root session (`src/qwenpaw/app/routers/approval.py:115-125`).
  The chat-channel `/approval approve` command, however, is documented as
  cross-session. It checks only `pending.agent_id` (`src/qwenpaw/runtime/commands/control/approval_handler.py:126-173`),
  and with no request id it takes the queue head. So a coding agent's
  command approval can be granted from a different conversation with the
  same agent. The repository already has the fix nearby: built-in commands
  pass `EXACT_REQUESTER`, with a comment saying this is so that "another
  session on the same Agent cannot authorize" (`src/qwenpaw/runtime/builtin_commands.py:370-373`).
  Both round-trips should pass the same policy.
- **Missing owners default instead of being declined.** In the first tool,
  a request whose `threadId` has no context is filed under session, user
  and agent `"default"` on channel `"console"` (`codex/adapter.py:652-656`,
  `684-687`). The second tool applies the same `"default"` and `"console"`
  fallbacks when its request context is absent (`qoder/adapter.py:526`,
  `545-550`). The technique treats both as unknown and declines them.
- **Only one of the two paths is guarded against a raising handler.** The
  server transport catches a handler exception and declines
  (`app_server.py:276-280`). The SDK callback has no local guard, so what a
  raised exception becomes (deny, a crashed turn, or something else)
  depends on the SDK, which this reading did not open.
- **A dropped terminal event hangs the turn.** Subscriber queues are capped
  at 1000 (`app_server.py:166`, `176`). On overflow the notification is
  dropped with only a warning (`app_server.py:261-265`). `run_turn` loops on
  `queue.get()` until it sees `turn/completed` (`codex/adapter.py:418-430`),
  and that wait has no ceiling, so a dropped completion leaves the turn
  waiting until someone cancels it. The review path at
  `codex/adapter.py:731-742` has the same shape.
- **The host clock is not checked against the child's clock.** Nothing
  compares the 300-second host wait to either child's own request timeout.
  The code cannot rule out a human approving a request the child has
  already abandoned.
- **The capability catalog is an undated constant.** `PROVIDER_CATALOG` is a
  frozen tuple of hardcoded capabilities and presets, with no version,
  verification date or method (`registry.py:19-184`). The dated capability
  matrix rejects exactly this shape. A third provider is listed with
  `coming_soon=True` and empty capabilities (`registry.py:113-118`), so the
  round-trip reaches two wrapped tools today.

## The docs/code disagreement on ACP runners

The ACP integration guide says: "When an external ACP runner asks for
permission, QwenPaw does **not** decide on the user's behalf"
(`website/public/docs/acp-integration.en.md:96`). The code decides by
default. `ACPClient.request_permission` checks whether the runner is trusted
(`src/qwenpaw/agents/acp/client.py:166-184`). If it is, the client cancels
only calls that `is_hard_blocked`, a list of destructive commands and paths
outside the working directory. For everything else it picks an allow option
itself, preferring `allow_once` over `allow_always` (`client.py:32-38`,
`110-131`), and never files a pending approval. All four built-in ACP runner
definitions ship with `trusted=True` (`src/qwenpaw/config/config.py:164-195`).

The auto-approve branch is intended and tested:
`test_trusted_auto_approves_safe_command` asserts that a safe command is
answered `allow_once` with no pending permission left behind
(`tests/unit/agents/test_acp_client_trusted.py:32-56`). The adapter-level
tests check that hard-blocking ignores the flag
(`tests/unit/agents/test_acp_permissions_trusted.py`). What nothing records
is the auto-answer itself: it never enters the approval service, so no
decision record exists. In the technique's terms, this is an unattended
grant with no scope, no expiry and no record, enabled by default. The
behavior is deliberate, which means the documentation is the wrong half.
The fix the technique points to is routing the trusted path through the
pending record with the grant as decider, not just correcting the sentence.
