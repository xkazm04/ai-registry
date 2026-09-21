---
layer: application
type: application
subject: session-continuation
technique: boundary-applied-stop
stack: python
status: forged
verified_on: 2026-09-15
verified_against: python@3.11
---

# Python: stop gates run every iteration, a deferred stop is consumed before the next reasoning call, and the final permitted round still dispatches its tools

QwenPaw, an open-source agent runtime (public repository), at commit
`cbf1a4031d71915e0648d6cd2ef864989ccb42ae`, package version `2.2.2b1`
(`src/qwenpaw/__version__.py:3`). Paths are relative to the repo root. The
version witness is `pyproject.toml:6`, `requires-python = ">=3.11,<3.14"`;
`python@3.11` is that declared floor. No interpreter was run and no test was
executed for this document. Every citation was read, not exercised.

## Decision: evaluate on every iteration, apply at the boundary

The agent's reasoning step runs the stop handlers after every model response,
including responses that are only tool calls
(`src/qwenpaw/agents/react_agent.py:1037-1038`, comment "Stop Hook: run every
iteration"). When the response carried tool calls (`final_msg is None`), the
result is not acted on. It is handed to `apply_stop_result(..., is_tool_call=True)`
and the step returns so the tools run (`react_agent.py:1040-1048`).

`apply_stop_result` (`src/qwenpaw/loop/gates/runner.py:156-180`) is the
technique's sorting rule in about twenty lines. Its docstring states the
policy: "Defer stops and strategy warnings until tool results are processed.
Ordinary keep-working prompts are unnecessary on tool-call iterations." A
`TERMINATE` with a reason becomes `agent._gate_pending_stop` (`:174`). An
`INTERRUPT_AND_CONTINUE` is kept as `_gate_pending_continue` only when it
carries both a message and `inject_on_tool_call` (`:175-180`). Everything else
is dropped. The one built-in gate that sets the flag is the repetition
detector's warning stage (`src/qwenpaw/loop/gates/doom_loop.py:163-167`,
reason "doom_loop repetition warning"). The goal mode's plain continuation is
dropped on tool iterations, pinned by
`tests/unit/loop/test_runner.py:32-46` ("Tool calls continue naturally without
an injected user prompt").

The boundary is the top of the next reasoning step. After background tool
results are injected (`react_agent.py:855`), `check_pending_gates(self)` runs
(`react_agent.py:858-860`; body at `runner.py:183-226`). It takes the pending
continuation first and clears the slot (`:194-196`), then checks an external
handoff signal (`:198`), then returns a pending stop if one exists
(`:205-212`). The continuation is appended as a tagged user message only when
no stop was pending (`:214-225`), so **a pending stop outranks a pending
warning** by construction. A returned stop is emitted as the gate's reason
text and a final assistant message, and the step returns without calling the
model (`react_agent.py:860-883`). `tests/unit/loop/test_runner.py:59-70` pins
the deferral round trip.

## Forces: a batch is never cut

The time limit declares its placement: `TimeoutGate`'s docstring is "Stop at
a loop boundary after a monotonic timeout"
(`src/qwenpaw/loop/gates/limits.py:116-117`). The public write-up says the same
in prose (`website/public/blog/qwenpaw-loop-engineering.en.md:47`, "not by
forcibly interrupting a tool mid-execution"). The lateness bound is tested with
an injected clock rather than a sleep:
`tests/unit/loop/test_custom_loop_modes.py:551-568` patches `time.monotonic`
to return 15.0 then 16.0 against a start of 14.0 and a two-second limit. The
first check passes and the second terminates, which is the technique's "a
limit fires at most one boundary late", asserted exactly.

## Buys

A long tool-calling streak is now visible to every gate, the record is never
left with announced calls lacking results, and a repetition warning reaches a
model that never yields. Pending state is cleared on conversation reset:
`clear_pending_gate_state` (`runner.py:229`) is called from the default mode's
`on_conversation_reset` (`src/qwenpaw/modes/default/mode.py:72-75`) and from
the `/new` and `/clear` command path
(`src/qwenpaw/agents/command_handler.py:271`, `:289`).

## What this realization cannot do

- **The final permitted round dispatches its batch.** `IterationGate.check`
  returns `TERMINATE` when the count reaches the cap
  (`src/qwenpaw/loop/gates/iteration.py:73-80`). The gates run after the
  reasoning call and before tool execution, so the stop is known before
  dispatch. On a tool-call iteration it is still deferred (`runner.py:168-174`).
  The batch the model emitted on its last permitted iteration therefore
  executes, its results are appended, and the next step returns the gate's
  reason without any reasoning call reading them (`react_agent.py:860-883`).
  The same holds for `TokenBudgetGate` when the reasoning call itself crosses
  the budget. This is the technique's refuse-before-dispatch case, unhandled:
  the tree has no "not executed, limit reached" tool result and no check at
  the deferral site for whether any reasoning call remains.
- **The typed distinction lives in an empty string.** A handler chain with no
  gates, or with every gate bypassing, returns `TERMINATE` with no reason
  (`runner.py:106-107`; `src/qwenpaw/loop/gates/handler.py:128-130`). The
  deferral branch tells a real gate stop from that default only by
  `stop_result.reason` being non-empty (`runner.py:171`). A custom gate that
  terminates without a reason is silently dropped on every tool-call
  iteration, and applied only if the model later yields.
- **Pending stops are cleared on conversation reset, not at turn start.** The
  default mode's `on_turn_start` resets gate counters only
  (`default/mode.py:63-70`). Whether a pending stop can outlive its turn
  depends on the host loop's own iteration cap ending a turn on a tool-call
  iteration. That path was not traced here.
- **Docs and code disagree on precedence.** The loop-engineering guide says
  "The first Gate that returns STOP or CONTINUE determines the result for that
  turn" (`website/public/docs/loop-engineering.en.md:244`, repeated at `:353`).
  Inside one `StopHandler` the code does not do that: a `CONTINUE` is recorded
  and the loop keeps going, and a later, lower-priority `TERMINATE` returns
  (`handler.py:121-126`). A budget stop therefore beats an earlier rubric
  continuation. That is arguably the right policy for this technique (a stop
  outranks a continuation), but it is not the documented one. Across plugin
  registrations, meanwhile, `run_stop_handlers` really is
  first-definitive-wins (`runner.py:119-135`), so the tree runs two precedence
  rules at two levels.
- **Plugins cannot carry a warning across a tool iteration.** A plugin handler
  that returns a dict is converted with only action, message and reason
  (`runner.py:136-150`), so `inject_on_tool_call` cannot be set that way, and
  a plugin's strategy warning is dropped until the model yields.
