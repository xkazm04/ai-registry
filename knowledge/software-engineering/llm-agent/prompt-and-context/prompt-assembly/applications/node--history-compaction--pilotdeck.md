---
layer: application
type: application
subject: prompt-assembly
technique: history-compaction
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@22
---

# A compaction ladder that ends without a model, and a resume that disagrees with the live session (TypeScript, agent runtime)

Stack version from the tree's `engines` field; commit `ae87280a`. The realization is a
context engine with a cheapest-first ladder, a durable transcript replayed on resume, and
a documented run of failures found by running it against a small context window. Real
modules were run with a stub token counter and stubbed model calls, on hand-built
transcripts; byte-based limits do not depend on the stub, token-based ones are
stub-relative and are not reported here.

## The ladder is what the technique wants

Compaction is ratio-gated and ordered by loss and cost: a deterministic, whitelist-only
rewrite of old tool output at 80% pressure
(`src/context/DefaultContextRuntime.ts:462 "80% pressure: deterministic, whitelist-only tool-result projection."`),
a model-written summary only if that leaves the context at 90% or more, a snip to a
target, and an emergency tier that needs no model and keeps the newest tenth
(`src/context/DefaultContextRuntime.ts:100 "const EMERGENCY_HEAD_KEEP_RATIO = 0.10;"`).
A summary failure therefore still produces a sendable prompt. A compaction is persisted as
**one durable record**, and replay honours only a complete valid one:
`src/session/transcript/TranscriptReplay.ts:24 "Only a self-contained, valid snapshot authorizes dropping prior context."`
A test truncates the record at every byte offset and asserts the replayed context is never
smaller than the old one
(`tests/session/compact-snapshot-crash.spec.ts:177 "every truncated snapshot prefix retains context"`).
That test is the reusable part of this tree.

## Executed: where the live session and the resumed one diverge

**An interrupted turn is dropped whole, not closed.** Replay admits assistant and tool
messages only for turns that carry a result
(`src/session/transcript/TranscriptReplay.ts:81 "if (!completedTurnIds.has(entry.turnId)) {"`).
A hand-built transcript whose second turn had an accepted request, a destructive command
call and its result but no turn result replayed as the request alone. The live context
held the command and its output; the resumed model sees "delete the build directory" and
no trace that anything ran. The technique's rule is the opposite: a call whose result
never arrives gets its own synthesized *did not complete* result, because a missing pair
reads to a model as a call that succeeded silently. This tree resolves the pairing
invariant by discarding the half turn, which keeps the record valid and loses the one
fact the resumed model most needs.

**The emergency tier is not persisted.** When the summary fails, the ladder truncates the
live history to about a tenth and returns no compaction result, and the persistence step
returns early on exactly that
(`src/agent/loop/AgentLoop.ts:2275 "if (!input.onCompactPersisted || !compact.result) {"`).
Executed on a 61-message history at a ratio of 1.19: a failing summarizer produced a
compacted context of 7 messages with no result; a working summarizer produced 9 with a
boundary record. The transcript on disk holds the full history in the first case, so a
resumed session starts larger than the live one ever was and overflows again.

**The one warning that should say so is dropped.** The hard-truncation diagnostic is
emitted only when a result exists
(`src/context/DefaultContextRuntime.ts:580 "if (emergency.diagnostics && finalResult) {"`),
and a test pins the no-result behaviour
(`tests/context/autoCompaction.spec.ts:151 "assert.equal(result.result, undefined);"`);
executed, the diagnostic was undefined after a 90% silent drop.

**One transient failure blocks the emergency summary.** A failed summary sets a sixty-second
cooldown (`src/context/compaction/CompactionEngine.ts:277 "this.summaryFailureCooldownUntil = Date.now() + COMPACT_SUMMARY_FAILURE_COOLDOWN_MS;"`);
a second run on the same engine returned the same error without calling the model, so
the emergency summary that would have kept the request's meaning was never attempted and
the unsummarized truncation ran instead.

## Not applied

The repairs are a synthesized-result at replay for a dangling call; persisting the
truncation as a boundary record with a marker that no summary exists; and raising the
diagnostic without a result. None was applied to this tree. The row is `unapplied`, return
condition *a fleet project keeps an agent transcript that a resume replays*. The
compaction ladder itself and the byte-level truncation test are worth porting into any
fleet project that has one.
