---
layer: application
type: application
subject: agent-memory
technique: filter-at-the-id-door
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@22
---

# A selector's ids loaded with no filter, and an empty answer treated as a crash (TypeScript, agent runtime)

The realization is a per-project markdown memory store whose recall runs inline on
every turn: a gate decides whether to recall, an optional step picks the project, a
model picks up to five items from a shortlist of at most two hundred headers, and a
loader reads the picked ids. Stack version is the one the tree's `engines` field pins;
commit `ae87280a`. The code below was **executed**, not only read: the shipped
compiled copy of the memory package (checked against its source: the string and number
literals match in all fifteen files; logic was not compared) ran against a real
SQLite-backed store with the model call stubbed and the HTTP endpoint faked.

## Where the filter lives

The retirement filter is applied when the shortlist is built:
`src/context/memory/edgeclaw-memory-core/src/core/file-memory.ts:1031 ".filter((entry) => options.includeDeprecated || !entry.deprecated)"`.
The loader that takes the model's ids applies none:
`src/context/memory/edgeclaw-memory-core/src/core/file-memory.ts:1053 "getMemoryRecordsByIds(ids: string[], maxLines = 80): MemoryFileRecord[] {"`
builds an entry for the id and reads the file, and the id is never intersected with the
shortlist (`src/context/memory/edgeclaw-memory-core/src/core/retrieval/reasoning-loop.ts:686 "getMemoryRecordsByIds(selectedIds, RECALL_FILE_MAX_LINES)"`).

**Executed (R2):** with the route decided as *project* and a shortlist that contained
neither, the selector stub returned the id of a deprecated file and the id of an item in
the global identity tier. Both were injected into the context. The deprecated item and
the out-of-tier item reached the model through the one door that has no rule.

## The empty answer

`src/context/memory/edgeclaw-memory-core/src/core/retrieval/reasoning-loop.ts:654 "if (selectedIds.length === 0) {"`
routes an empty selection into `fallbackSelection`, which takes the first entries of
the manifest (`src/context/memory/edgeclaw-memory-core/src/core/retrieval/reasoning-loop.ts:360 "const limit = route"`).

| Executed case | What the selector did | What was injected |
| --- | --- | --- |
| R1 | returned 9 ids over a 251-file store | the manifest cut to 200, five files, up to 200 lines each |
| R3 | returned `[]` (nothing relevant) | the 3 newest files, 4 blocks |
| R4 | HTTP 500, persistent (6 s, 7 requests) | the 3 newest files, 4 blocks |
| R5 | the *gate* returned HTTP 500 | nothing (`intent: none`, empty context) |

An answer of "nothing here is relevant" and an outage are the same event to the
loader, and both inject the newest items, so every turn the gate approved carries
memory whether or not any of it was chosen. Meanwhile the hop before it fails the
other way (R5: no context). Two hops of one pipeline, two failure directions, and no
test forcing either.

## A fourth hop with a third default

Capture sits behind the same posture: `src/context/memory/EdgeClawMemoryProvider.ts:204 "Memory capture should not break the agent turn."`
Executed with the model endpoint down for a capture flush: the flush took six seconds
and six failed classification calls, then reported one captured session, zero written
files and **zero failed sessions**; pending work dropped to zero; after the endpoint
recovered, a second flush did nothing. The turn's memory is permanently gone and the
counter that exists to report failure never moved. This is the third default in one
memory path: recall-gate fails to nothing, recall-selector fails to newest, capture
fails to *consumed*.

## What the technique asks of this tree

One intersection (or one predicate in the loader) closes the retirement and tier
holes; a distinct branch for "the selector answered empty" closes the newest-N
injection; a per-hop table of defaults with a forced-failure test each is what
turns three accidents into a decision. The tree has no test under its test directory
that names the memory provider, so none of the three is pinned.

## Cannot say

Whether a real selector ever returns an id off its shortlist. The stub returned one
because the test asked it to. The rule holds either way; the *rate* is unmeasured.
The executed run also cannot show how much injecting the newest three files costs in
answer quality, only that it happens on every gate-approved turn.
