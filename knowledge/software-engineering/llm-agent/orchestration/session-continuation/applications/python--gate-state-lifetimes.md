---
layer: application
type: application
subject: session-continuation
technique: gate-state-lifetimes
stack: python
status: forged
verified_on: 2026-09-15
verified_against: python@3.11
---

# Python: session-keyed gate state, a reset-peers flag for review sub-turns, a token meter that survives it, and a turn ledger that drops failed turns

QwenPaw, an open-source agent runtime (public repository), at commit
`cbf1a4031d71915e0648d6cd2ef864989ccb42ae`, package version `2.2.2b1`
(`src/qwenpaw/__version__.py:3`). Paths are relative to the repo root. The
version witness is `pyproject.toml:6`, `requires-python = ">=3.11,<3.14"`;
`python@3.11` is that declared floor. No interpreter was run and no test was
executed for this document. Every citation was read, not exercised.

## Decision: gates are shared, state is keyed

One `StopHandler` per mode per workspace holds the gates in priority order
(`src/qwenpaw/loop/gates/handler.py:38-45`) and serves every session in that
workspace. Stateful gates inherit `LoopGate`
(`src/qwenpaw/loop/gates/loop_gate.py:40-86`), whose docstring is the rule:
"Session-safe abstract base for all stateful gates. Manages
`_sessions: dict[str, Any]` keyed by session ID." The instance holds only the
map (`:49-50`). `_state()` reads the current session's entry (`:57-59`), the
session comes from a context variable at call time (`:31-37`), and `activate`,
`deactivate` and `reset_session` all act on that one key (`:61-86`).
Isolation is tested: `tests/unit/loop/test_doom_loop_gate.py:112`
(`test_session_isolation`) and `:87` (`test_cross_request_no_bleed`).
Reset is not disarm: `test_doom_loop_gate.py:69-72` asserts
"reset() does NOT deactivate the gate."

## Decision: two harness-called lifetimes, fault-isolated

`StopGate` declares both reset operations as no-op defaults for stateless
gates (`src/qwenpaw/loop/gates/base.py:121-130`). The handler fans them out
through `_reset_gates`, which catches and logs each gate's exception so one
bad reset does not skip the rest (`handler.py:59-80`). The harness calls them
from mode lifecycle hooks, never from message content: `reset_turn` in
`on_turn_start` and `reset_session` in `on_conversation_reset`
(`src/qwenpaw/modes/default/mode.py:63-75`;
`src/qwenpaw/modes/custom_loop/mode.py:117-124`). Per-turn fields are visible
in each gate's override: the iteration count (`iteration.py:85-91`) and the
repetition history, hit count and prompt (`doom_loop.py:103-110`).

## Decision: a review sub-turn resets its peers, not itself

`_maybe_reset_peers` (`handler.py:160-183`) is the phase reset. It fires only
when the continuing result carries `reset_peers=True` and resets every gate
`is not continue_gate`. Its docstring names the forces: peers "begin the
sub-turn with fresh state (iteration counter, doom loop history, etc.)", while
warning-only continuations "keep reset_peers=False and do NOT trigger peer
resets." The two gates that open phases set the flag explicitly:
`rubric.py:222-226` and `completion.py:103`. Each bounds its own rounds with an
evaluation counter it never resets on a phase (`rubric.py:213-216`,
`completion.py:85`). The tests cover the three constraints:
`tests/unit/loop/test_handler_continuation_reset.py:67` (peers reset), `:80`
(trigger not reset) and `:117` (flag false, nothing reset).

## Buys: the token meter survives the phase

`TokenBudgetGate.reset_turn` replaces only a cached snapshot, "without
resetting recorded usage" (`src/qwenpaw/loop/gates/limits.py:51-53`). The
count is read from the model wrapper's per-session accumulation on each new
iteration (`limits.py:62-66`), and the comment is the technique's meter rule:
"Usage accumulates for the entire user turn, including rubric continuations,
and is cleared by the channel at turn boundaries."
`tests/unit/loop/test_custom_loop_modes.py:524-548` proves it: after
`gate.reset_turn()` simulates a peer reset, further usage still terminates,
and only `usage.clear()` plus a reset admits the next turn.

## What this realization cannot do

- **Wall time and tool-call counts are reset on a phase.**
  `TimeoutGate.reset_turn` replaces its state with a fresh monotonic origin
  (`limits.py:131-133`), and `ToolCallBudgetGate.reset_turn` replaces its
  counters (`limits.py:180-182`). Both are peers under `_maybe_reset_peers`, so
  every rubric or completion revision round restarts the turn's time limit and
  tool-call budget. The effective ceilings become the configured limit times
  the phase-opening gate's `max_evaluations` (default 1 for the rubric,
  `rubric.py:173`; 3 for the completion check, `completion.py:33`). Only tokens
  are classified as a meter.
- **Failed and cancelled turns commit zero usage.** The model wrapper stages
  usage per session in memory (`src/qwenpaw/token_usage/model_wrapper.py:182-218`).
  The channel clears the stage at turn start (`src/qwenpaw/app/channels/base.py:918`,
  `:1558`) and commits it to the turn ledger only on the success branch
  (`:1009-1020`, `:1594-1604`). On a response error (`:1001-1003`, `:1586-1588`),
  on cancellation (`:1026-1032`, `:1608-1613`) and on an exception
  (`:1037-1043`, `:1615-1617`) it calls `_clear_session_turn_usage`, which pops
  and discards the staged totals (`:1911-1918`). In-turn enforcement is
  unaffected, because the gate reads the stage while it exists. The durable
  ledger, however, charges nothing for a turn an operator cancelled because it
  was running away, or for a turn that died after spending. A turn stopped by a
  gate is not in this gap: a gate stop is emitted as an ordinary final message
  (`src/qwenpaw/agents/react_agent.py:860-883`) and takes the success branch.
- **Plugins cannot declare a scope, and get no lifetime hooks.**
  `register_agent_stop_handler` accepts only `priority` and `name`
  (`src/qwenpaw/plugins/api.py:1096-1123`), and the registration it builds
  leaves `scope` at its default `""` (`base.py:59-64`). A scopeless
  registration "always run[s]" (`runner.py:55`, `:67-68`), including while a
  goal or mission mode is active. That contradicts the guide's "Scope
  Isolation" section, which says "default Gates automatically yield"
  (`website/public/docs/loop-engineering.en.md:355-357`). The resets above
  reach mode handlers only (`src/qwenpaw/agents/command_handler.py:255-289`
  iterates modes), so a plugin handler that keeps state has to key it by
  session and invent its own lifetimes. Nothing in the API tells it to.
