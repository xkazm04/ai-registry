---
layer: application
type: application
subject: prompt-assembly
technique: live-attachment-delta-resharing
stack: neovim
verified_on: 2026-09-05
verified_against: neovim@0.11.0
---

# Watched buffers and files, re-shared as a diff before every submit

The editor chat client from the sibling application
([context-ownership-regimes](./neovim--context-ownership-regimes.md)),
commit `f73f40e9`, same version witness. This is the tree the technique was
reconstructed from; the mechanism sits in one 282-line module,
`lua/codecompanion/interactions/chat/watchers.lua`, and its header states the
design in three sentences (`:1-5`): watchers attach content that is liable to
change, they share a diff of changes before a chat is submitted, buffers are
watched by their change counter and files by their modification time.

## The mechanism, line by line

- **The witness, and the base beside it.** Each watcher holds a buffer number
  or a path, its last known change counter or modification time, *and the
  content last shared with the model* (`:17`, the field's own annotation).
  The base is stored, not recomputed from disk, which is what makes the
  diff's direction correct when the source has changed twice between turns.
- **Compared at the top of every submit.** `check_for_changes` runs from the
  chat's submit path before anything is composed
  (`lua/codecompanion/interactions/chat/init.lua:1355`), and walks only the
  context items flagged for diff sync (`watchers.lua:257-280`).
- **Unchanged means nothing.** A buffer whose change counter equals the
  stored one returns without a message (`:215-218`); a file whose
  modification time is unchanged does the same (`:235-240`).
- **Changed means a unified diff against the base.** `share_changes`
  (`:194`) formats the change as a unified diff with three lines of context
  under the standard algorithm (`:36-45`) and appends it as its own message
  naming the attachment; the witness and the stored content move together.
- **Deletion is a message.** A closed buffer or a missing file produces one
  removal message (`add_removal_message`, `:93`, called at `:211` and
  `:238`), the watch is dropped, and the item's sync flag is cleared so the
  UI stops drawing the sync icon (`:269-278`).

## What the tree says about the standard

The confirming structural fact is the field at `:17`: the watcher stores
**the content last shared with the LLM**, not the previous disk state. Nobody
had to write a rule about which base to diff against; the data shape settles
it, and the case the rule exists for (two edits between turns) falls out
correct without a branch.

The limiting fact is where the mechanism reaches. It covers attachments the
user added to the conversation. It does not cover material the client
re-renders into the message list on its own (the system prompt and the rules
files are composed fresh per submit), and a rules file edited mid-session is
therefore re-delivered whole rather than as a delta. That is the technique's
own boundary, stated in its second section: a rebuilt prefix has no base in
the record for a diff to apply to.

## What this realization cannot do

It cannot say what the policy saves. The client fires request lifecycle
events but records no per-request byte count, so the share of turns on which
a watched attachment sent nothing, which the technique argues is the whole
value, is not measured here. The measurement in the technique's body comes
from a different tree, a companion runtime with a per-block content hash
ledger, in the sibling application for that stack.
