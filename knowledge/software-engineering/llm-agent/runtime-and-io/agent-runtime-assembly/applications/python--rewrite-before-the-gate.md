---
layer: application
type: application
subject: agent-runtime-assembly
technique: rewrite-before-the-gate
stack: python
status: forged
verified_on: 2026-09-23
refresh_by: 2026-11-05
verified_against: python@3.12
---

# Rewrite before the gate in the Hermes agent runtime

How Nous Research's `hermes-agent`, first read at commit
`0cbc6e37ac9fce50905157805c89fae06da93845` and re-resolved on 2026-09-23
against `9d799e0531c24c7f6015f45ca27e05022c3db81a` (HEAD), realizes the
rewriting position and the exactly-once wrapping contract across its plugin
middleware surface. The tree's own contract document is now
`website/docs/developer-guide/middleware.md` (moved from
`docs/middleware/README.md` when the root `docs/` tree was folded into the
Docusaurus site); the chain runner is `hermes_cli/middleware.py`; the tool
dispatch site is `model_tools.py`. The observer half moved likewise, from
`docs/observability/README.md` to `website/docs/developer-guide/observer-hooks.md`.

## Position: the rewrite runs before availability, guardrails and approval

The contract states the technique's headline rule as a numbered order.
`tool_request` middleware may "Rewrite tool arguments before guardrails,
approval checks, hooks, and tool execution see them"
(`middleware.md:21-22`), and the execution order for a tool call is written
out in steps: parse and coerce the model's arguments, apply `tool_request`,
"run the normal Hermes pre-execution path against the effective arguments:
tool availability checks, observer block directives, guardrails, and approval
checks", run `tool_execution`, emit `post_tool_call`, then apply
`transform_tool_result` hooks before the result re-enters context
(`middleware.md:105-117`, § Execution Order → Tool Calls; six steps, the sixth
already present at the first pin and not recorded then). The power transfer
the technique demands be stated in the contract is stated twice, in the contributor's own words: "Tool
request middleware runs before approval checks. Use it carefully: a rewritten
path, command, or URL is the value downstream policy will evaluate"
(`middleware.md:119-120`), and again under § Safety Notes (`:269-271`).

The code matches the document. `model_tools.py:934-935` rebinds
`function_args`, `original_args` and `trace` from `_apply_request_middleware`
(`:752-762`, a wrapper over `apply_tool_request_middleware`), and the
pre-execution path that follows — `_pre_dispatch_guards` at `:940`, which
dispatches the `pre_tool_call` hook with `middleware_trace` and then the edit
approval (`:765-800`) — reads that rebound value. The LLM chain has the same
shape one call over: `llm_request`
middleware, then `pre_api_request` observers with the effective request, then
execution (§ Execution Order → LLM Calls).

## Provenance: the original travels beside the effective value

`RequestMiddlewareResult` carries `payload`, `original_payload`, `changed` and
`trace` (`hermes_cli/middleware.py:30-36`), and the dispatch site keeps all
three: `function_args`, `original_args`, `trace` (`model_tools.py:933-935`).
Every middleware kind receives `original_args` (or `original_request`)
alongside the effective one — it is a declared payload field in the
contract's kind table (`middleware.md:52-55`) — and a request middleware may
return `source`, `reason` or `name` beside its payload, which `_apply_request_chain` (`middleware.py:62-85`; the separate
`_trace_entry` helper of the first read was folded in) turns into a trace
entry, defaulting to `{"source": "plugin"}` when the contributor supplied none
(`:77-82`).

A second rewriter sits in front of the plugin chain — present at the first pin
as well, and not recorded by the first read — and it obeys the same rule. `apply_tool_request_middleware` (`middleware.py:102-133`) first applies
the NeMo Relay runtime's tool-request intercepts and, when they change the
arguments, appends `{"source": "nemo_relay"}` to the trace (`:111-120`) before
any plugin sees them. A rewrite that did not come from a plugin is still named
at the gate — the technique's provenance rule holding for a contributor the
plugin contract does not describe.

The traces are surfaced to
downstream observers as `middleware_trace` (`middleware.md:67-68`), which is the
technique's "who changed this field, and why" answerable at the gate that
refuses it.

## Arity: the continuation is single-use, enforced per frame

`_run_execution_chain` (`hermes_cli/middleware.py:161-213`) is the technique's
frame contract in one function. Each frame closes over `next_called`,
`next_succeeded` and `next_result`, and `next_call` refuses a second
invocation with a message naming the kind and the callback:
"`called next_call() more than once; downstream execution is single-use`"
(`middleware.py:179-195`). The comment states the reason the technique gives —
"Single-use per frame: a second call would re-run the downstream
provider/tool, so it is a contract violation, not a retry."

The three frame states are all present, and the mechanism that distinguishes
them is a private wrapper type rather than exception inspection.
`_DownstreamExecutionError` (`middleware.py:152-158`) wraps anything the
continuation raises, so that:

- **raised before the continuation** — `next_called` is false, and the handler
  ends `return call_at(index + 1, payload)`, falling through to the next frame
  and eventually the terminal call (`middleware.py:212`);
- **the call beneath raised** — the wrapper is unwrapped and the original
  re-raised unchanged, `raise exc.original` (`middleware.py:202-203`), so the
  downstream failure keeps its own identity rather than being reported as a
  middleware fault;
- **raised after a successful continuation** — `if next_succeeded: return
  next_result` (`middleware.py:208-209`), the technique's exactly-once rule at
  its most load-bearing point.

A fourth branch, present at both pins and not recorded by the first read,
closes the one gap the three leave: a frame that entered the continuation, saw it fail, and then raised
something *other* than the wrapped error (translating the downstream failure)
re-raises its own exception — `if next_called: raise` (`:210-211`) —
instead of falling through to `call_at(index + 1, ...)`, which would have run
the downstream provider or tool a second time.

The contract document states the same three states as prose under § Safety
Notes (`middleware.md:258-268`), including "Hermes preserves the downstream
result and does not run the provider or tool a second time" and "Hermes does not convert downstream
failure into a successful `None` result." A deliberate short circuit is a
documented use — "Execution middleware should call `next_call(...)` exactly
once unless it is intentionally short-circuiting execution" — and is
distinguished from a fault by returning rather than raising, exactly as the
technique requires.

## Deviations

**The rewriting surface fails quietly.** When `apply_tool_request_middleware`
itself raises, the dispatch site swallows it at debug level —
`logger.debug("tool_request middleware error: %s", _mw_err)`
(`model_tools.py:760-762`, and identically in `agent/agent_runtime_helpers.py:2387-2388`)
— and the call proceeds with the model's original arguments. (The relay-routed
path in `agent/tool_executor.py:769-786` calls it without that wrapper.) The
fail-open direction is right; the severity is not. A deployment whose contribution
exists to constrain a command is running unconstrained, and the only record is
below the default log level. The standard stays: this diagnostic belongs on the
operator's surface, because "the rewrite ran and changed nothing" and "the
rewrite could not run" are different facts about policy coverage.

**Fall-through after a frame fault re-enters the chain without recording the
skip.** `return call_at(index + 1, payload)` (`middleware.py:212`) continues
with the payload *as this frame received it*, which is correct, but the log
line is the only trace; nothing is appended to the middleware trace that later
observers read. The log itself got quieter since the first read: the frame
fault now goes through the manager's warn-once reporter (`middleware.py:204-207`;
`hermes_cli/plugins_dispatch.py:245-267`, #111922) — one WARNING per distinct
(kind, callback, error), identical repeats at DEBUG. That fixes a real
log-flood, and it also means a frame that fails on every call is visible once
per process. A refusal downstream can be
explained by the rewrites that succeeded but not by the one that did not.

**The two surfaces disagree about unknown registrations.**
`register_middleware` warns on an unrecognized kind and stores the callback
anyway — "Unknown kinds warn but are stored" (`hermes_cli/plugins.py:916-921`)
— as does `register_hook` for an unknown hook name (`:912-914`); both now go
through one `_track_callback` (`:923-935`), which warns and then
`mapping.setdefault(key, []).append(callback)`. That is the stored-silent-no-op the sibling
technique refuses; see the deviations recorded against
`honest-hook-registry`.

## Reconciliation summary

Confirmed by this tree: the rewriting point positioned before availability
checks, observer directives, guardrails and approval, with the power transfer
stated in the contributor-facing contract; the original payload and a
per-frame `source`/`reason` trace carried beside the effective value and
propagated into observer payloads; a single-use continuation whose second call
is an error naming the frame; and all three frame states discriminated by a
private wrapper type — fall through before, propagate the downstream error
unchanged, preserve the downstream result after. Upward lesson taken into the
technique: distinguishing "raised before" from "the call beneath raised"
cannot be done from the exception alone, so the frame must record entry into
the continuation — the tree's `_DownstreamExecutionError` is the mechanism,
and the technique now states the requirement rather than the implementation.
Deviations: the rewrite surface's own failure is a debug-level log at both
dispatch sites; a skipped frame leaves no trace entry (and is now logged at
WARNING once per distinct failure); unknown registration kinds are stored
rather than refused.

## Currency - 2026-09-23

The 2026-09-17 note recorded that the tree had been refactored by 34.4% of its
non-test source two days after the first read, and that a re-scan against the
merged tree was owed. It was run on 2026-09-23 against `9d799e05` (13,043
commits past the first pin): every claim above re-resolved and the anchors were
re-pinned. What moved: the contract and observer documents' paths, the
dispatch site's line range (the helper `_apply_request_middleware` split out of
the dispatch body), the trace-entry helper inlined into `_apply_request_chain`,
and the frame-fault log moved to the warn-once reporter. Three things present
at the first pin were not recorded then and are now: the traced relay rewriter
ahead of the plugin chain, the fourth frame branch that refuses to re-run after
a translated downstream failure, and the sixth execution-order step. Nothing
the application asserts was contradicted; all three
deviations still hold. `refresh_by` is kept as an override, on the original
six-week window: the claims are line-anchored in a tree that moves by hundreds
of commits a day, far faster than the Python stack clock assumes.
