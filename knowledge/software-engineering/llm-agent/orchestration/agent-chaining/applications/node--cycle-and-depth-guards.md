---
layer: application
type: application
subject: agent-chaining
technique: cycle-and-depth-guards
stack: node
verified_on: 2026-08-22
---

# Cycle and depth guards in n8n's sub-agent delegation (Node)

n8n's *agent* chaining is not its drawn graph: it is `delegate_subagent`, where a
parent agent hands a bounded subtask to a child that runs to completion and
returns one answer. Citations are against n8n `2.36.0`, commit `fbd9449`
(2026-08-22), packages `@n8n/agents`, `@n8n/api-types`, `cli/src/modules/agents`;
an external reconciliation, so the pin lives here, not in `verified_against`. The
headline: delegation depth is constrained by runtime path validation and tool
attachment policy; the TypeScript path type alone does not enforce one segment.

## 1. Depth is capped by runtime validation and capability exposure

Every delegated run gets a *task path*: `/root` for the orchestrator,
`/root/<name>_<index>` for a child (`sub-agent-task-path.ts:28`). The type is a template literal with a string suffix, which can itself contain
slashes. The runtime regular expression rejects grandchildren; the constructor
builds direct children and calls the assertion. These are runtime guarantees,
not a proof that deeper strings are unrepresentable in the TypeScript type.

The type would be decorative if a child could still delegate, so the tool is
withheld by construction: `AgentRuntimeProfile` is
`'top-level' | 'sub-agent' | 'inline'`
(`agent-runtime-reconstruction.service.ts:94`) and the delegate tool is attached
only under `'top-level'` (`:705-719`). Inline children get a second, independent
filter: `filterInlineSubAgentTools` (`agent.ts:1455-1461`) drops the tool by name
and — importantly — by `isDelegateSubAgentTool` metadata, because the tool may be
registered under a custom name (`delegate-sub-agent-tool.ts:387-397`); renaming
the guard's target cannot smuggle it past the guard. So the technique's
layer-one concern evaporates: a graph of depth one has no cycles to detect, there
is no cycle detection anywhere in `@n8n/agents` or the agents module, and none is
owed.

## 2. The guard reads state the guarded process cannot author

The model supplies `taskName`; the machinery supplies everything else. The
sibling index comes from `childPathIndexes`, a `Map` in the tool closure
(`delegate-sub-agent-tool.ts:450-451`) keyed by the parent's run id (`:897-899`),
read-then-incremented at `:657-661`. Model text is sanitized into a path segment
— lowercased, non-alphanumerics collapsed to `_`, capped at 64 characters, empty
result rejected (`sub-agent-task-path.ts:62-77`). The host runner then trusts and
verifies shape only: "The SDK delegate tool already
assigned this delegation's task path and enforced the depth/fan-out policy
before invoking the runner. Just validate the forwarded shape — don't recompute
it or re-run the gates" (`sub-agent-foreground-runner.ts:125-129`).

Configuration matches the technique's unset-versus-corrupt rule exactly.
`resolveDelegateSubAgentPolicy` (`delegate-sub-agent-tool.ts:364-385`) defaults
an absent `maxChildren` to 10 and **throws** on non-finite, non-integer, or
`< 1` — a brake someone reached for and mis-set halts construction rather than
resolving to "off" — and the enforcement point repeats the check, rejecting an
infinite batch size for delegate batches (`tool-call-executor.ts:237-243`).

## 3. Breadth is throttled, not bounded — deviation

`maxChildren` (1–20, default 10; `sub-agent.schema.ts:3-5`, zod-enforced at
`agent-json-config.schema.ts:151-159`) is a **parallelism** limit, not a ceiling.
The code says so twice: the batch loop slices consecutive delegate calls into
windows of that size (`tool-call-executor.ts:218-253`), and the system prompt
tells the model "This limits parallelism, not the total number of delegated
tasks… the runtime will run them in batches"
(`delegate-sub-agent-tool.ts:590-596`).

So the technique's breadth guard — count links spawned under the chain's
identity, halt the cascade at a ceiling — is not implemented. The count exists;
`childPathIndexes` even survives suspend/resume (`:784`). Nothing compares it to
a bound, so a parent that keeps emitting delegate calls fans out without limit,
ten at a time.

The budget axis is renounced in the same spirit. Child token usage and cost roll
up to the parent (`delegate-sub-agent-tool.ts:1002-1011`; `withoutMessageCount`,
`execution-counter.ts:32-38`, forwarding tokens and tool calls but not message
count, since a delegation is not a fresh user turn) — but every counter mutation
runs inside `recordExecutionCounter`, which swallows errors because "aggregate
execution counters are best-effort instrumentation and must never affect agent
execution" (`:10-20`). Cost is observed, never enforced; the axis that catches
expensive *short* loops is open.

## 4. The bound that does trip is typed, and its stop is half-erased

The agent loop is bounded at `MAX_LOOP_ITERATIONS = 30`
(`agent-runtime.ts:143`, applied at `:771`, `:849`), and exhaustion is a named
reason: `lastFinishReason = 'max-iterations'` (`:963-965`), a member of the closed
`FINISH_REASONS` list (`types/sdk/agent.ts:25-32`). The resume check rejects a lower `maxIterations` but accepts a higher caller
value. It preserves the iteration count, while allowing the ceiling to increase;
it is not a non-loosening budget guarantee.

The erasure is at the handoff. `resolveDelegateSubAgentStatus`
(`delegate-sub-agent-tool.ts:959-971`) maps a child to `completed` unless it
errored or suspended — so a child that hit the ceiling returns
`status: 'completed'` to the parent model, with `finishReason: 'max-iterations'`
alongside in a field the prompt never explains. A guard trip and a finished job
are spelled the same way in the field the parent acts on; the classification
survives one frame below, as `failure-not-empty-success` warns.

## 5. The static layer that exists, and the sibling path with none

Self-delegation is caught where the whole configuration is in hand: a sub-agent
reference equal to the agent's own id is an `incompatible_reference` naming the
offending index (`agent-validation.service.ts:412-415`), and publish is gated on
a clean validation (`agent-publish.service.ts:284`) — the technique's "reject the
save, naming the cycle's members", for the one cycle depth 1 admits.

Not present by scope, but worth naming: n8n's *classic* chain — a workflow
calling a sub-workflow — carries lineage without a bound. `RelatedExecution` is
`{executionId, workflowId, shouldResume?}`
(`workflow/src/interfaces.ts:3315-3321`), threaded through as `parentExecution`
(`workflow-execute-additional-data.ts:83`, `:111`): no depth counter, no nesting
limit, no configuration key for one.

## Reconciliation summary

Confirmed: one enforcement point, named in the code; a depth guard reading
machinery-owned state the model cannot author; the guard target identified by
metadata, not by name; corrupt bound fails restrictive while unset falls back to
a stated default; "unlimited" rejected at the enforcement point; iteration bound
typed, with resume allowed to raise its ceiling; self-edge rejected at publish. Deviations:
breadth counted but never gated; cost rolled up but explicitly non-enforcing;
`max-iterations` presented to the parent as `completed`. Not present by scope:
cycle detection (unnecessary at depth 1); any depth guard on sub-workflows.

## Source review - 2026-09-09

Re-read the pinned [path helper](https://github.com/n8n-io/n8n/blob/fbd9449/packages/%40n8n/agents/src/runtime/tools/sub-agent-task-path.ts)
and [runtime resume branches](https://github.com/n8n-io/n8n/blob/fbd9449/packages/%40n8n/agents/src/runtime/loop/agent-runtime.ts).
Corrected the type-only depth and non-loosening interpretations. Other source
anchors and application behavior were not re-executed in this review; the original
verification date above is not refreshed by this limited source check.
