---
layer: application
type: application
subject: hitl-approval
technique: consent-gates
stack: python
status: forged
verified_on: 2026-11-06
counterpart: external
---

# A stdio tool server whose approve tool is held by the model it gates

An MIT server, read at commit `e2b00555` and never run. Python 3.11 is the witness at `pyproject.toml:12 "requires-python"`.
**Recorded for the shape of its gates and nothing else.** Its author says that what it automates can violate a platform's terms, so no connected
project should adopt it. Who may be automated, and on what terms, is outside this document.

## What it does

Write tools stage a draft, and a separate tool executes it. The staging half is real: the payload is frozen at draft time, a draft runs once, and an
interrupted approval reloads as uncertain, `src/xuse/mcp/drafts.py:122 "A restart cannot prove whether an approved action"`. The authority half is absent from the
server. The approve tool takes an id and checks status, `src/xuse/mcp/tools.py:315 "async def approve_draft(draft_id: str)"`, so the model that drafted can approve. Whether a
person took part is decided in prompts that ask the model to judge for itself, `src/xuse/mcp/prompts.py:102 "Only when the user has authorized that concrete action"`, and in the host's per-tool setting.

The subject's sentence applies exactly: a gate the gated party can open is a decoration. What this tree adds is the honest residue. A server over a local pipe cannot tell its user from
its model. It can still give an interceptable second call labelled for the host, an exact pending payload and single use. It cannot give a decision.

A second door has the same shape with less friction: `src/xuse/mcp/queue_tools.py:205 "CALL IS THE APPROVAL GATE"`.

## The census: state a gate's strength by who can open it

| Openable by a model's tool call | Not openable by any tool, by reading |
| --- | --- |
| Approve, process queue | Daily caps and write spacing |
| Reconcile an uncertain outcome: `src/xuse/mcp/browser_tools.py:223 "async def resolve_action_outcome"` | Draft mode, and the background worker switch |
| Resume after a pause, behind a live check: `src/xuse/mcp/safety.py:207 "Clear only the pause inspected before recovery; retain newer pauses."` | Permanent opt-out: `src/xuse/mcp/outreach_tools.py:60 "suppression is permanent and cannot be removed by upserting."` |

So what bounds a steered model here is rate, and a rate does not stop one bad act. A document that lists its gates this way tells the reader which sentences are guarantees. Reconcile is
the sharpest row: a model saying "not sent" reopens the duplicate check, `src/xuse/mcp/safety.py:149 "status IN ('started','succeeded','uncertain')"`.

## What it cannot show

Nothing was run and no host was read, so whether a given host's default stops the approve call is unknown. The route not taken is elicitation, which reaches the person through the host and
fails closed where it is unsupported. The tree does not use it: a grep over source and docs has zero hits, per the miner, and no recheck was run over the full tree.
