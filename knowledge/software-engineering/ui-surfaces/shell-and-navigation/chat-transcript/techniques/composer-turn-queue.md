---
layer: technique
type: technique
subject: chat-transcript
technique: composer-turn-queue
status: forged
laws:
  - identity-survives-reuse
  - failure-not-empty-success
shared_with: []
use_when: [the send control is disabled while a turn runs, a user types a follow-up mid-answer and loses it, deciding whether "stop" and "say something now" are the same button, two quick follow-ups produce two separate machine turns]
---

# Composer turn queue

The composer is the transcript's only write door, and the transcript's writer
is busy most of the time the user wants to write. The naive resolution —
disable the send control until the machine turn settles — is the single most
common composer defect: it forces the user to hold a thought in their head,
watch a spinner, and re-type it later. The standard is the opposite:
**submitting while busy is always accepted, and what it means is decided by
the surface, not refused by it.**

Three distinct intents arrive through the same text box while a turn runs.
They are different features and must not share a control or a code path:

| Intent | What the user means | What happens |
|---|---|---|
| **Queue** | "After this, do that." | The prompt renders immediately as a pending row and starts as soon as the current turn settles. |
| **Interject** | "While you're at it — also this." | The prompt is buffered and delivered at the machine's next safe point *inside* the running turn, as its own user row, never merged into the turn text. |
| **Cancel** | "Stop." | The running turn is finalized as *cancelled* — a rendered outcome, not a vanished row — and the draft in the box is left intact. |

## The queue is visible, identified, and editable

- **A queued prompt is a transcript row from the moment it is accepted.** It
  carries a locally minted identity (per
  [identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)) and
  a `queued` phase; when it starts it becomes the same row in a `running`
  phase. It is the optimistic echo from [turn-model](./turn-model.md) applied
  one step earlier, before the turn is even the machine's to run.
- **Queued rows are editable and removable in place.** Edits are versioned:
  an edit that carries a stale version is a no-op, never a clobber, because
  the queue may be shared with a server or a second client that is draining
  it at the same time.
- **Retire, do not duplicate.** When the authoritative record confirms the
  prompt (by the same id), the optimistic row *becomes* the confirmed row. A
  queue that keeps its own copy pinned alongside the server's produces the
  doubled bubble every user has seen.

## Consecutive follow-ups combine into one turn

Two prompts typed in quick succession are almost always one thought split by
an Enter. The queue therefore **combines consecutive plain prompts into a
single machine turn** — joined as separate paragraphs in the delivered text —
while the transcript still shows them as the separate rows the user typed.
The combination is a delivery decision, not a display decision: the rows
keep their identities, and the machine turn that answers them is attributed
to all of them.

Eligibility is a closed rule, not a heuristic: only plain text prompts
combine. A prompt carrying an attachment, a command, a skill invocation, or
synthetic origin starts its own turn, because merging it would change what
it means.

## Interjection is delivered at a safe point, FIFO, unmerged

A mid-turn message cannot be injected at an arbitrary token — the machine is
mid-tool-call or mid-sentence. It is buffered and delivered at the next
boundary the runtime declares safe, in the order typed, each as a distinct
user row. Two interjections are never concatenated: they were said at
different moments, and the transcript's job is to say so.

## Cancel keeps the draft, finalizes the turn, and converges on one path

- Cancel never touches the composer. The half-typed follow-up that prompted
  the cancel is the most valuable text on the screen.
- Cancel is *not* the same gesture as "clear the box". A destructive key on a
  non-empty composer edits text; only on an empty composer does it cancel.
- The cancelled turn is finalized through the **same function** as a
  completed, failed, or externally-blocked turn, whether the terminal outcome
  arrives live or on reconnect. One convergence point is what stops a client
  attaching mid-turn from sitting on "waiting…" forever, and what keeps the
  cancelled-vs-blocked copy from drifting apart across surfaces — per
  [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success),
  a cancelled turn is a rendered fact, never an absence.
- Cancelling a turn that has delegated work asks whether the delegates stop
  too; the default is to ask, not to guess.

## Where the composer must not go

- **Never disable send.** A disabled control is the surface admitting it has
  no model for the user's intent. Every state of the writer maps to one of
  queue / interject / cancel.
- **Never merge an interjection into the running turn's text.** It rewrites
  what the machine was asked.
- **Never clear the draft on cancel, error, or disconnect.** Drafts are
  persisted per thread and survive all three.
- **Large pastes and references collapse into chips**, not raw text: a
  ten-thousand-character paste is one element in the composer, expandable on
  demand, so the box stays a place to write rather than a place to scroll.

## Relationship to neighbours

- The optimistic identity and phase machine is [turn-model](./turn-model.md).
- Where the queued prompt *lands* on screen when it starts — pinned to the
  top of the viewport with a reserve below it — is
  [transcript-scroll](./transcript-scroll.md)'s page-flip rule.
- Where the runtime's "safe point" comes from belongs to the orchestration
  subjects; this technique consumes the boundary, it does not define it.
