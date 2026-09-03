---
layer: application
type: application
subject: agent-runtime-assembly
technique: rewrite-before-the-gate
stack: python
status: forged
verified_on: 2026-09-02
verified_against: python@3.12
---

# Rewrite before the gate in the Hermes agent runtime

How Nous Research's `hermes-agent`, at commit
`0cbc6e37ac9fce50905157805c89fae06da93845`, realizes the rewriting position
and the exactly-once wrapping contract across its plugin middleware surface.
The tree's own contract document is `docs/middleware/README.md`; the chain
runner is `hermes_cli/middleware.py`; the tool dispatch site is
`model_tools.py`. The same tree's `docs/observability/README.md` is the
observer half and is cited where the two surfaces meet.

## Position: the rewrite runs before availability, guardrails and approval

The contract states the technique's headline rule as a numbered order.
`tool_request` middleware may "Rewrite tool arguments before guardrails,
approval checks, hooks, and tool execution see them"
(`docs/middleware/README.md`, § intro), and the execution order for a tool
call is written out in five steps: parse and coerce the model's arguments,
apply `tool_request`, "run the normal Hermes pre-execution path against the
**effective arguments**: tool availability checks, observer block directives,
guardrails, and approval checks", run `tool_execution`, emit `post_tool_call`
(§ Execution Order → Tool Calls). The power transfer the technique demands be
stated in the contract is stated twice, in the contributor's own words: "Tool
request middleware runs before approval checks. Use it carefully: a rewritten
path, command, or URL is the value downstream policy will evaluate" (§
Execution Order), and again under § Safety Notes.

The code matches the document. `model_tools.py:1416-1433` applies
`apply_tool_request_middleware` and rebinds `function_args` from its result,
and the pre-execution path that follows — the `pre_tool_call` hook dispatch at
`model_tools.py:1439-1450`, then guardrails and approval — reads that rebound
value. The LLM chain has the same shape one call over: `llm_request`
middleware, then `pre_api_request` observers with the effective request, then
execution (§ Execution Order → LLM Calls).

## Provenance: the original travels beside the effective value

`RequestMiddlewareResult` carries `payload`, `original_payload`, `changed` and
`trace` (`hermes_cli/middleware.py:37-45`), and the dispatch site keeps all
three: `_tool_original_args`, `function_args`, `_tool_middleware_trace`
(`model_tools.py:1415, 1430-1432`). Every middleware kind receives
`original_args` (or `original_request`) alongside the effective one — it is a
declared payload field in the contract's kind table — and a request middleware
may return `source` and `reason` beside its payload, which `_trace_entry`
(`middleware.py:319-329`) folds into a trace entry, defaulting `source` to
`"plugin"` when the contributor supplied neither. The traces are surfaced to
downstream observers as `middleware_trace` (§ Contract), which is the
technique's "who changed this field, and why" answerable at the gate that
refuses it.

## Arity: the continuation is single-use, enforced per frame

`_run_execution_chain` (`hermes_cli/middleware.py:254-315`) is the technique's
frame contract in one function. Each frame closes over `next_called`,
`next_succeeded` and `next_result`, and `next_call` refuses a second
invocation with a message naming the kind and the callback:
"`called next_call() more than once; downstream execution is single-use`"
(`middleware.py:276-289`). The comment states the reason the technique gives —
"Calling it more than once would re-run the downstream provider/tool, so a
second invocation is a contract violation rather than a retry."

The three frame states are all present, and the mechanism that distinguishes
them is a private wrapper type rather than exception inspection.
`_DownstreamExecutionError` (`middleware.py:260-263`) wraps anything the
continuation raises, so that:

- **raised before the continuation** — `next_called` is false, and the handler
  ends `return call_at(index + 1, payload)`, falling through to the next frame
  and eventually the terminal call (`middleware.py:313-315`);
- **the call beneath raised** — the wrapper is unwrapped and the original
  re-raised unchanged, `raise exc.original` (`middleware.py:301-302`), so the
  downstream failure keeps its own identity rather than being reported as a
  middleware fault;
- **raised after a successful continuation** — `if next_succeeded: return
  next_result` (`middleware.py:310-311`), the technique's exactly-once rule at
  its most load-bearing point.

The contract document states the same three states as prose under § Safety
Notes, including "Hermes preserves the downstream result and does not run the
provider or tool a second time" and "Hermes does not convert downstream
failure into a successful `None` result." A deliberate short circuit is a
documented use — "Execution middleware should call `next_call(...)` exactly
once unless it is intentionally short-circuiting execution" — and is
distinguished from a fault by returning rather than raising, exactly as the
technique requires.

## Deviations

**The rewriting surface fails quietly.** When `apply_tool_request_middleware`
itself raises, the dispatch site swallows it at debug level —
`logger.debug("tool_request middleware error: %s", _mw_err)`
(`model_tools.py:1433`, and identically in `agent/agent_runtime_helpers.py:3541`)
— and the call proceeds with the model's original arguments. The fail-open
direction is right; the severity is not. A deployment whose contribution
exists to constrain a command is running unconstrained, and the only record is
below the default log level. The standard stays: this diagnostic belongs on the
operator's surface, because "the rewrite ran and changed nothing" and "the
rewrite could not run" are different facts about policy coverage.

**Fall-through after a frame fault re-enters the chain without recording the
skip.** `return call_at(index + 1, payload)` (`middleware.py:315`) continues
with the payload *as this frame received it*, which is correct, but the
warning at `middleware.py:303-308` is the only trace; nothing is appended to
the middleware trace that later observers read. A refusal downstream can be
explained by the rewrites that succeeded but not by the one that did not.

**The two surfaces disagree about unknown registrations.**
`register_middleware` warns on an unrecognized kind and stores the callback
anyway — "Unknown kinds are stored for forward compatibility but warned"
(`hermes_cli/plugins.py:3567-3583`) — as does `register_hook` for an unknown
hook name (`plugins.py:3387-3401`). That is the stored-silent-no-op the sibling
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
dispatch sites; a skipped frame leaves no trace entry; unknown registration
kinds are stored rather than refused.
