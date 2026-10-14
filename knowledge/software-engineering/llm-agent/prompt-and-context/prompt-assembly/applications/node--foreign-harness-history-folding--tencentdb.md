---
layer: application
type: application
subject: prompt-assembly
technique: foreign-harness-history-folding
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@22.16
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# A skill reviewer that kept writing the agent's next turn (TencentDB Agent Memory)

Source tree: `github:TencentCloud/TencentDB-Agent-Memory@37b16296` (2026-10-14). After a
conversation, a review model reads the transcript and either writes a reusable procedure to a
skill library through tool calls or answers that there is nothing to save. The stack version is
the floor the core package declares (`"node": ">=22.16.0"`). Nothing was executed; every claim
is a traced path.

## The recorded failure

The formatter's comment keeps the incident. A trace
(`MemoryCore/src/core/skill/skill-extractor.ts:474 "f546ab8c-c7c5-4598-a310-6b2162372e7c"`)
shows the reviewer ignoring its contract and producing a continuation of the main conversation
(`MemoryCore/src/core/skill/skill-extractor.ts:475 "1235 tokens 的主对话续写，零 tool call"`):
1,235 tokens, zero tool calls, no nothing-to-save answer. The transcript had been rendered with
plain role names, it ended on a long assistant turn, and the reviewer wrote the next one.

## The fix, as three cues removed

The formatter now tags every turn with a role form the reviewer does not use for itself
(`MemoryCore/src/core/skill/skill-extractor.ts:478 "<<past-${m.role}>>"`),
then closes the transcript and restates the task after it
(`MemoryCore/src/core/skill/skill-extractor.ts:479 "Above is the past conversation to review. Now decide, and respond only per the output contract in the system prompt."`).
The system prompt allows two shapes of reply, tool calls or the literal nothing-sentinel, so a
continuation is now a contract violation instead of an answer. These are the three parts the
technique's review case states: the role markers, the end, and the output.

## What the second implementation says about it

A fleet consolidation pass reads transcripts as a JSON array of turn objects, labelled
untrusted evidence, with a closed JSON reply in which an empty list is valid. Its prompt ends
on the data, with no end marker and no restatement. Its own ledger records 14 passes over real
transcripts of 3,000 to 84,000 characters with no failed parse, and two empty answers. Read
together, the two trees put the cause in the turn shape: encoded as a value, the transcript
offers no next turn, and the end marker is owed only while the rendering still looks like a
conversation. That boundary went into the technique.

## What would measure it

`unmeasurable` here: the source commits the incident but no rate after the fix. The instrument
is a replay of the recorded transcript through the reviewer under both formatters, plain role
names against the past-tagged form with its end marker, counting replies that are neither tool
calls nor the sentinel. The trace id is in the tree; the transcript is not.
