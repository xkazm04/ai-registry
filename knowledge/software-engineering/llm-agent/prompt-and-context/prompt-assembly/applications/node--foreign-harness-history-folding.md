---
layer: application
type: application
subject: prompt-assembly
technique: foreign-harness-history-folding
stack: node
verified_on: 2026-09-15
verified_against: node@22
---

# An open agent SDK that imports three other agents' sessions and folds them on resume

The version above is the floor the tree witnesses: the core SDK package
(`@cline/core` 0.0.83) and the repository root both declare
`"engines": { "node": ">=22" }`, and the root also pins its package manager.
Citations were resolved 2026-09-15 against a shallow clone of the Cline
repository at commit `6e8bea1c`. The occasion was the vendor's announcement
of its desktop app, which showed "import a conversation from another agent
and keep going" as a feature and did not say how it worked. The mechanism
lives in the SDK core, not in the desktop app. The import code sits in
`sdk/packages/core/src/services/session-import/`, the fold in
`extensions/context/compaction.ts`, and the wiring in
`runtime/host/local-runtime-host.ts`.

## The decisions, and the forces the tree states for them

**Import is lossless and the fold happens at resume.** Adapters for three
foreign session stores (two JSONL layouts and one database) discover sessions
cheaply for a picker. They parse a full conversation only when it is imported,
and translate its messages into the SDK's native message shape. On the first
resumed turn, `createImportedHistoryCompactionPrepareTurn` runs the context
compactor with the agentic strategy, `preserveRecentTokens: 0` and manual mode.
It folds the entire foreign history into a summary before the model request,
whatever the session's own auto-compaction setting is. The docstring gives the
force directly: the imported transcript "keeps that agent's tool names and
input schemas verbatim, which a model continuing it may try to call". The UI
says the same to the user. A banner over an imported transcript reads
"the model works from a summary of them rather than the original tool calls,
so results may not be as reliable". The fold persists to a compaction sidecar
and stands down once the working context opens with a summary, so it runs
once per session.

**Translation is explicitly not done.** The banner component's own comment:
the turns "keep that agent's tool names and schemas, which Cline does not
translate". The technique's first rejected option is the tree's rejected
option too.

**Provider validity is repaired in the record, before any fold.**
`sanitizeImportedMessages` strips signatures from thinking, text and tool-use
blocks, drops redacted reasoning ("only replayable against the original
provider session") and empty text blocks, culls results with no call, and
consolidates each call span into one results message. Every unanswered call
gets a placeholder whose text says what happened: "Tool result was not
captured in the source session history." This must run "on every imported
session regardless of source quality", because providers hard-reject
histories that break pairing.

**Import is idempotent, and the marker that proves it is written last.**
Imports are keyed by `tool:sourceId` and checked against every stored
session's metadata, not a listing window. Overlapping requests for one source
wait on the first write through an in-flight map. The session row is created
already `completed`, because a running row with no process would be flipped
to failed mid-import by a stale-session reconciler working on the same
database. The `importedFrom` marker, carrying the source tool, id, path,
provider and model, is the final write. A failure before it deletes the
half-written session, and even if that delete fails, the row cannot claim the
source and block a retry.

**Resume target and provenance are separate fields.** The operator's chosen
provider and model are stamped as what the session resumes on, and only when
both halves are set, "to avoid pairing a Cline provider with a foreign model
id". The source provider and model stay in `importedFrom` and in per-message
model info. The desktop client reads the marker off forks as well: "a fork of
an imported session reports the same tool: its history is still the foreign
transcript."

## What the realization cannot do

- **A failed fold falls back to raw replay, and the operator is not told.**
  On an error the policy logs "continuing with the raw transcript" as a
  warning and replays the foreign turns. In the paired measurement recorded
  in the technique, raw replay made one local 27B model call a foreign tool
  on 10 of 10 continuations, so for that model the fallback brings back the
  failure the fold exists to prevent. One attempt is made per session start.
- **Sealed metadata is stripped in the record, not at composition.** For an
  import this costs little, since the original survives in the source tool's
  store. It does mean a session resumed on the *same* provider that produced
  it has already lost its reasoning signatures, which the endpoint technique's
  "strip at materialization; never in the record" rule would have kept.
- **The fold's quality is not measured anywhere in the tree.** The tests
  assert that the summary runs once, stands down on an existing summary and
  falls back on failure. None of them checks what the summary preserves,
  such as whether "the suite has not been re-run since the edit" survives.
