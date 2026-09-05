---
layer: application
type: application
subject: agent-runtime-assembly
technique: indeterminate-closure-on-interruption
stack: neovim
verified_on: 2026-09-05
verified_against: neovim@0.11.0
---

# Orphaned tool calls closed before every send, with the verdict in prose

An editor-resident chat client with an agentic tool loop, commit
`f73f40e9` (plugin version 19.23.0); the version witness is the CI matrix's
lowest editor tag (`.github/workflows/ci.yml:17`) and the installation floor.
The tree implements the closure half of the technique carefully and carries
the technique's named hazard in latent form.

## Closure before the record is read

Every place the message list is about to be sent or rewritten first closes
the calls that have no result:

- **Before every submit**, on both the user-driven and the automatic path
  (`lua/codecompanion/interactions/chat/init.lua:1359`, `:1379`), with the
  reason *this tool call did not complete and produced no result* (`:95`).
- **On stop**, the chat cancels the tool orchestrator, the protocol client's
  pending requests, and the in-flight HTTP job, then schedules `done` with a
  stopped status (`:1784-1820`), and `done` closes the orphans with the
  reason *cancelled by user* (`:1503`, `:1105`).
- **Before context management may touch the list**: the gate refuses to edit
  or compact while an orphan exists (`context_management/init.lua:58`), so
  the pairing invariant is checked by the compactor rather than assumed.

The synthesized result is built through the adapter's own response formatter,
carries the call id it answers, is marked invisible to the user, and is
stamped with the current cycle (`:1092-1120`). Five tests pin it, including
*done with stopped status completes orphaned tool calls* and
*_complete_orphaned_tool_calls synthesizes cancelled results*. The changelog
records the paid-for failure: *cancelling avoids orphan tool calls* (`#3073`).
For the model this is the technique's first reader served exactly: the
transcript says the call did not complete, and the model decides whether to
re-run.

## The verdict lives in prose

The second reader is not served. The synthesized result has no status field
in a closed vocabulary; its only distinguishing property is the reason
string in its content. The technique names that shape as the failure to
avoid, because the day something downstream needs to know these were not real
tool results, the only handle will be a string match. Read for that handle:
the reason strings appear at their definitions and nowhere else (one further
site in the protocol client uses the same sentence for its own cancellation),
and no classifier in the tree compares against them. The hazard is latent
rather than realized, which is the honest reading and the one a team copying
this should act on before the first consumer of the field arrives.

## What this realization cannot do

It cannot distinguish an interrupted call from a call the user rejected at
the approval prompt, once both are in the record: the rejection path writes
its own prose (`tools/orchestrator.lua:221-236`) through the same tool-output
channel, so the record holds two kinds of non-result told apart only by
wording.
