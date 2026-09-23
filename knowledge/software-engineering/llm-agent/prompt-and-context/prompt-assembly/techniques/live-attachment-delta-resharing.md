---
layer: technique
type: technique
subject: prompt-assembly
technique: live-attachment-delta-resharing
status: forged
laws: [derivation-names-recomputation, identity-survives-reuse, unknown-is-not-a-value]
shared_with: []
use_when: [an attached file or buffer changes under a conversation that already saw it, deciding whether to re-send an attachment the model was shown earlier, a composed block is re-rendered every turn although its content is unchanged, the model is handed a fresh copy and has to work out what moved, an attachment is deleted or closed mid-conversation, a cached prefix is invalidated by material that did not change]
---

# Live-attachment delta re-sharing

An attachment shared into a conversation is not a message. It is a **stream of
versions** of something that keeps existing after the share (a file on disk,
an open editor buffer, a document the user is still writing), and the
conversation's next turn arrives against whichever version is current. The two
default policies are both wrong in a way a reader notices only later. *Never
re-send* leaves the model reasoning over a copy the user has since rewritten,
and every answer is quietly stale. *Re-send whole every turn* is worse in three
ways at once: it pays the full size on every call, it invalidates every cached
byte from the attachment onward, and it hands the model a second copy with no
statement of what differs, so the model has to diff two documents in its head
to find the one line that moved.

The technique is the third policy, and it is the one an editor already uses:
**share the first version once, then share only what changed, and say nothing
when nothing did.**

## The mechanism

- **Share once, into the record.** The first version enters the transcript as
  an ordinary attachment message with an identity (a path, a buffer id), and
  the share records a **witness** of that version: a change counter, a
  modification time, a content hash. The witness is cheap to compare and is
  compared on every turn.
- **Compare the witness before composing.** At the start of each turn, for
  every attachment still marked live: an unchanged witness means **nothing is
  sent**, not a re-share and not a note. A changed witness means the current
  content is read, a **diff against the content last shared** is appended as
  its own message naming the attachment, and the witness and the last-shared
  content are updated together.
- **Deletion is a message.** An attachment whose source is gone (the buffer
  closed, the file removed) produces one notice saying so and leaves the live
  set. A dropped watch that says nothing turns the model's copy into a
  statement about a file that no longer exists
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
- **The diff is against what was shared, not against the previous disk state.**
  The two differ whenever the source changed more than once between turns. The
  model's copy is the last *shared* version; a diff against anything else
  describes a change the model never saw the base of. This is why the witness
  is stored beside the shared content rather than alone.

## What it buys, and what it does not

The saving is not the diff being smaller than the file, although it is. The
saving is the **turns on which nothing is sent**, and those are most turns: an
attachment is edited in bursts and read continuously. One recorded ledger of
sixty-five consecutive companion turns, composed with a per-block content hash,
showed **86% of the composed bytes unchanged from the previous turn**, which is
the share of the prompt this policy would not have transmitted at all. The
churn sat in two blocks, a scene digest rewritten on nearly every turn and a
recall block rewritten on every other, and one of them sat *above* six stable
blocks in the composed order, so a stable prefix was rebuilt on every call by
a block that should have been a delta below it.

That measurement also marks the boundary. This technique governs material
whose base **stays in the record** so a diff has something to apply to. In a
stateless regime the first share is a message and the diffs accumulate behind
it; the history carries the base. In a composed *prefix* that is rebuilt every
turn there is no base in the record, and the delta has nowhere to land except
a stability-ordered stack ([layered-composition](./layered-composition.md))
with the volatile material at the bottom, which is the same discipline applied
to position rather than to messages. Either way the unchanged case sends
nothing, and that is the half worth the most.

## Relationship to elision

[elision-to-a-refetch-pointer](./elision-to-a-refetch-pointer.md) spends
history *down*: material already in the record, still addressable at its
source, is replaced by a pointer once the unit that asked for it is done. This
technique governs what enters the record for material that keeps changing. They
compose in the obvious order: a delta is shared because the source moved; later,
the original share and its deltas are all re-fetchable and elision may point at
the source instead. What must not happen is elision of the *current* unit's
delta. The change the user just made is the thing the turn is about, and the
rule that protects the current unit in elision protects it here.

## Decision rules

- Share an attachment once with an identity and a witness; store the witness
  beside the content that was shared.
- Compare witnesses at the top of every turn. Unchanged: send nothing.
  Changed: append a diff against the last-shared content, naming the
  attachment, and update both.
- Emit one deletion notice when the source disappears, then stop watching.
- Never diff against the previous disk state; the base is what the model saw.
- Where the attachment lives in a rebuilt prefix rather than in the record,
  order it below every block that is stable across turns, and measure the
  unchanged share with a per-block content hash before deciding it is stable.
