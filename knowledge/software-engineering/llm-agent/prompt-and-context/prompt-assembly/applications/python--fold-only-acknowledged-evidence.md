---
layer: application
type: application
subject: prompt-assembly
technique: fold-only-acknowledged-evidence
stack: python
status: forged
verified_on: 2026-09-15
verified_against: python@3.11
---

# A nine-step pressure pipeline that folds the active turn only on a completed call

QwenPaw, an open-source agent runtime, read at commit `cbf1a403`. The version
witness is `pyproject.toml:6`, `requires-python = ">=3.11,<3.14"`; `python@3.11`
is the floor it states, and the tree relies on it (`asyncio.timeout` at
`src/qwenpaw/agents/context/scroll/manager.py:1313` is 3.11+). Paths are
relative to the repo root. The context manager is called Scroll; its durable
record is a per-session history store, and folded results become pointers into
it that the model follows with a `recall_history` tool.

## The decision

`compress` (`manager.py:399-429`, docstring) lays the pipeline out as nine
steps: persist, trigger check, batch pre-fold of completed-turn results, a
pairing-safe split, the continuation summary, eviction of the middle into an
index, pressure folding of the remaining completed-turn results, request-time
omission of acknowledged active reasoning, and hard-limit folding of
acknowledged active results. The last two are the ones this technique governs,
and they sit at `manager.py:648-705`.

Capture and acknowledgement are two methods, and the docstrings say why
(`manager.py:265-315`): `model_input_tool_result_ids` snapshots "tool results
about to be submitted"; "the caller must acknowledge this snapshot only after
the model call succeeds. Capturing and acknowledgement are deliberately separate
so a rejected/failed request cannot make unread evidence foldable." The caller
is the agent's reasoning step. It captures before calling the model
(`src/qwenpaw/agents/react_agent.py:914-931`) and acknowledges inside the event
loop only on a `ModelCallEndEvent` whose `finished_reason` is not `INTERRUPTED`
(`react_agent.py:933-953`). An exception raises past the closure, so a failed
call never reaches it.

Eligibility for the hard-limit fold requires both halves of the precondition:
the result must be in the active turn, in `_seen_tool_result_ids`, **and** in
`_persisted_tcids` (`manager.py:1557-1563`), so no pointer is minted to a row
that was never written. The five newest results are always protected
(`_PROTECTED_RECENT_TOOL_RESULTS = 5`, `:59`), results of 200 characters or
fewer are not worth a pointer (`_PRE_TRIM_MIN_CHARS = 200`, `:58`), and a
candidate whose pointer is not smaller than its output is skipped.

## Forces, and what the tree does about each

- **Nothing safe is left.** After step 9 the manager raises
  `ContextWindowUnfitError` with `tokens` and `hard_limit` (`manager.py:697-702`;
  type at `src/qwenpaw/agents/context/types.py:9-21`, whose message names the
  three real choices: reduce the request or tool set, start a new turn, or
  switch to a larger window). The same error is raised when write-through
  failed and the unevicted context does not fit (`manager.py:474-491`). That
  branch deliberately skips eviction, because "folding it in would leave seq
  pointers to rows that don't exist."
- **The limit is an estimate.** The effective hard limit subtracts an output
  reserve (`manager.py:444-449`), and the reasoning omission runs at the
  pressure target rather than the hard limit, "for the next step and provider
  token-count variance" (`:648-654`).
- **The omission may save nothing.** `_batch_fold_seen_active_thinking`
  (`manager.py:1648-1690`) rolls the omission back if the recount did not fall
  or if the recount itself raised, including on cancellation, "so reporting and
  checkpoints do not claim a fold that saved no request tokens."
- **Provider refusals.** `_recover_model_overflow` (`react_agent.py:705-752`)
  forces one compaction, re-raises the original error if recovery changed
  nothing (`:722-731`), rebuilds the input from state, and retries through the
  parent class so a second overflow propagates. The stream wrapper
  (`src/qwenpaw/agents/context/overflow_recovery.py:19-59`) tracks whether a
  chunk carried meaningful content and re-raises instead of recovering once it
  has.
- **Resume.** The acknowledged set is pruned to live blocks on every rebuild
  (`manager.py:2015-2016`) and saved with session state (`:2098`).

## What it buys, witnessed by tests

- `tests/unit/agents/context/test_scroll_manager.py:1893`,
  `test_hard_limit_keeps_unread_active_results_and_fails_closed`: seven unread
  results of 5000 characters each, a context over the limit. The manager raises
  unfit, every result still starts with its original text, and `active_folded`
  is 0.
- `test_scroll_manager.py:1918`, the same turn with all seven acknowledged:
  two are folded (five are protected), the recount is still over the limit, and
  the error carries the second count. No lossier fallback ran.
- `test_scroll_manager.py:1946`: a pending call survives an unfit context
  byte-for-byte.
- `tests/unit/agents/test_react_agent_scroll_seen.py:113`, `:139`, `:159`: a
  successful call acknowledges; a failed call and an interrupted call do not.
- `tests/unit/agents/test_context_overflow_recovery.py:112` retries exactly once
  (two model calls, one recovery); `:135` makes no retry when recovery left the
  input unchanged.

## What this realization cannot do

- **Completed-turn folds are positional.** Steps 3 and 7 consult no
  acknowledgement. Any result outside the active turn is eligible (the `elif
  is_active: continue` branch at `manager.py:1564`), and the active turn is
  defined as the latest real user message onward (`_active_turn_tail`). A turn
  that ended on a failed or interrupted model call and was followed by a new
  user message has its last results treated as read. That is the proxy the
  technique accepts for completed turns because a pointer recovers them. It is
  still a proxy, and I found no test of that case.
- **The snapshot predates recovery.** Capture happens once, before
  `_reasoning`. An overflow recovery inside that call rebuilds the input, and a
  successful retry acknowledges the pre-recovery snapshot. The only extra
  identifiers that can be acknowledged this way belong to blocks recovery just
  folded or evicted, so no unread active evidence becomes foldable. The
  acknowledged set is still "what was about to be sent", not "what was sent".
- **Folds are counted, recoveries are not.** `last_compress` records
  `evicted`, `pre_folded`, `live_folded`, `active_folded`,
  `active_thinking_folded` and `folded` (`manager.py:430-437`). Nothing beside
  them counts how often the model follows a fold pointer back through
  `recall_history`, which is the aggressiveness signal
  [recovery-path-as-loss-signal](../techniques/recovery-path-as-loss-signal.md)
  asks for.
- **A code comment contradicts the configuration.** `manager.py:107-109` and
  `:364` say the dialog archive offloader is "on by default", as does
  `src/qwenpaw/runtime/builder.py:1075`. The field is `default=False` in
  `src/qwenpaw/config/config.py:1204-1214`, whose description says "Off by
  default". The `compress` body agrees with the config ("(opt-in)", around
  `manager.py:593-597`), and the wiring checks the field with a `False` fallback
  (`src/qwenpaw/agents/context/__init__.py:198`). Behaviour follows the config.
  A reader trusting the class comment will expect a JSONL archive that is not
  being written.
