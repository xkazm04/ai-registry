---
layer: application
type: application
subject: prompt-assembly
technique: context-ownership-regimes
stack: neovim
verified_on: 2026-09-05
verified_against: neovim@0.11.0
---

# An editor chat client that hands the window to whoever holds the transcript

An editor-resident chat client that speaks to two kinds of backend: stateless
completion endpoints, where the client sends the whole message list on every
call, and a stateful agent protocol, where an agent process holds the
conversation and the client sends only new messages. Read at commit
`f73f40e9` (plugin version 19.23.0). The version witness is the CI matrix's
lowest editor tag (`.github/workflows/ci.yml:17`, `v0.11.0`), which is also
the floor the installation page states; the plugin runs on the editor's
embedded Lua.

This is the tree the technique was reconstructed from, so what follows is the
regime table with its seams, plus the one place the tree contradicts itself.

## The three regimes, as the gate reads them

The context-management gate runs at the end of every turn
(`lua/codecompanion/interactions/chat/context_management/init.lua:50-59`)
and decides the regime in three lines before it counts a single token:

- **Agent-held.** `if chat.adapter.type == "acp" then return false`
  (`:51`). The stateful protocol's adapters are excluded by *type*, before
  any capability lookup, and the compaction module repeats the guard with its
  reason in words: the agents handle context themselves
  (`compaction.lua:351-356`). Resume is the agent's: a `/resume` slash
  command calls the agent's session list, then session load, and the loaded
  history is rendered into a fresh buffer (`doc/agent-client-protocol.md:73-75`).
- **Provider-managed.** `is_enabled` ends with
  `return not manages_own_context(chat.adapter)` (`:11-25`), and that
  predicate (`lua/codecompanion/adapters/shared.lua:102-117`) resolves the
  **model in use**, through a cached capability table with an async refresh,
  and reads `can_manage_context` off it. A failed resolution returns
  `false`, which is the client-held reading: the recoverable error.
- **Client-held.** Everything else: the two lanes, editing at 0.65 and
  compaction at 0.85 of the window, described in the sibling application
  for [history-compaction](./neovim--history-compaction.md).

The operator flag is honoured per request: with the provider's compaction
turned off in the adapter's options the predicate returns `false` and the
client's lanes re-arm, pinned by a test named for exactly that
(`tests/interactions/chat/context_management/test_init.lua`: *runs when a
server-side compacting model has compaction turned off*, beside *skips when
the model compacts its own context server-side*).

## Thresholds passed through, and the block replayed

In the provider-managed regime the provider adapter builds the request's
context-management block from the **client's own thresholds**
(`lua/codecompanion/adapters/http/anthropic.lua:376-416`): the edit strategy
carries the editing trigger resolved by the same helper the client gate uses,
and the compact strategy carries the compaction trigger floored at the
provider's stated minimum, `math.max(50000, ...)`, with the citation to the
provider's parameter page beside it (`:406-408`). Both triggers are omitted
when no window can be resolved, leaving the provider's default. The
capability itself is set at request build time from the model table and a
beta header is added with it (`:125-131`).

The compaction block the provider returns is captured off the streamed
response as message metadata (`:548-549`, `:567-568`, `:589-591`) and on the
next request is re-inserted into the assistant message, **after a thinking
block if one is present** (`:331-335`), pinned by two tests (*includes
compaction block from previous response*; *compaction block placed after
thinking block*). That is the sealed continuation object the technique says
the client must replay verbatim and never rewrite across, and the ordering
constraint is the kind of position-sensitivity a client-side compaction would
have destroyed.

## The tree contradicts itself, and the code wins

`doc/architecture.md` states, under server-side compaction, that *editing
still runs client-side for these adapters since it produces tokens-over-the-wire
savings independent of what the server does*. The code at this commit does
not do that: the gate's `is_enabled` returns `false` for a model that manages
its own context, so **neither** client lane runs, and the changelog carries
the fix that made it so, *prevent double context management* (`#3283`). The
document describes the earlier design; the code describes the shipped one.
By the tier rule the code wins, and the technique records the intent the
document names as the trade the exclusivity gave up: the wire still carries
the cleared results, and a system that wants that saving back tunes the
provider's edit trigger rather than reviving the client editor.

## What this realization cannot do

It cannot measure the wire cost it accepted. The request client logs the
request body to a file and fires start, streaming and finish events with an
adapter descriptor, but records no byte count per request and no
provider-reported usage against the editing decision, so the size of the
trade the document argued for and the code declined is not a number anywhere
in the tree. A team copying the regime table should add that instrument
before deciding the trade the same way.
