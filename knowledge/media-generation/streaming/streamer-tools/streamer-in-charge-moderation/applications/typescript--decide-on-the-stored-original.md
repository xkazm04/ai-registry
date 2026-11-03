---
layer: application
type: application
subject: streamer-in-charge-moderation
technique: decide-on-the-stored-original
stack: typescript
status: forged
verified_on: 2026-11-03
verified_against: typescript@6
---

# TypeScript: the ban card and the contract door in Castle Control

Castle Control (origin/main at `0b1c6b7`, read 2026-11-03 from a git-archive export) is a
Tauri desktop app for a human Twitch streamer. Its Rust core keeps the moderation queue.
The subject's two `rust--` applications record how that core holds a proposal and checks
it again on confirm. This application follows the TypeScript side: the generated
contract every core result passes through, and the ban card the streamer decides on.
Everything below runs in the dress rehearsal on this commit. A confirmed ban is a
SIMULATED record and nothing reaches the platform.

## What the TypeScript side gets right

**The contract door refuses a pending ban without its evidence.** A `ban_pending`
result that lacks the original text, carries an empty one, or adds a `summary` field
fails to parse, so a core bug or a stale client cannot hand the card a paraphrase.
The test pins all three cases:
`packages/contract/src/gatehouse.test.ts:113 "pending bans need original text; completed decisions can omit it"`,
`packages/contract/src/gatehouse.test.ts:117 "summary: message_text"`.

**The confirm carries the identifier and nothing else.** The card's button sends only
the proposal's id
(`apps/desktop/src/rooms/moderator/core-bans.tsx:44 "port.confirmBan({ decision_id: item.decision_id })"`).
The core then reads the original from its own durable store. It refuses the action when
the store has lost the text
(`crates/cc-gatehouse/src/store.rs:194 "original erased or expired"`) or when the stored
message and sender no longer match the proposal
(`crates/cc-gatehouse/src/store.rs:197 "queue association mismatch"`).

**The text on the card comes from the recorded line, not the decision.** The tracker
that builds the card joins two paged reads of the same ledger. It takes author and text
only from the chat read
(`apps/desktop/src/gatehouse-core-bans.ts:53 "Text and author come only from the recorded chat line, never from the decision."`).
Both reads page over the same ledger offsets
(`crates/cc-core/src/gatehouse/reads.rs:133 "let (range, next_cursor) = window(params, "`
and `crates/cc-core/src/gatehouse/reads.rs:100 "let (range, next_cursor) = window(params, "`),
so a proposal and its line arrive on the same page.

**No upstream prose reaches the screen.** A refused request is rendered from a closed
set of error codes. The core's message text is never shown
(`apps/desktop/src/gatehouse-core.ts:56 "Never render upstream prose, which may contain credentials or private details."`).
A decision that came back is reported as received, with no silent retry
(`apps/desktop/src/gatehouse-core.ts:105 "No automatic retry was sent."`).

## Deviations from the technique

- **The card offers a confirm it cannot honour.** When the chat read has no line for a
  proposal, the card prints a placeholder
  (`apps/desktop/src/rooms/moderator/core-bans.tsx:40 "Original line unavailable"`), but
  the Confirm button stays live. Only `busy` disables it
  (`apps/desktop/src/rooms/moderator/core-bans.tsx:43 "disabled={state.busy}"`). The
  chat read skips a line whose message the store no longer holds
  (`crates/cc-core/src/gatehouse/reads.rs:154 "let Some(message) = messages.get(audit) else {"`),
  and the core's confirm fails on the same loss. The streamer gets a button that will
  fail and then a generic request error, which is exactly what the technique's decision
  rule forbids. The same repository already has the right shape. The fixture preview
  refuses before the request
  (`apps/desktop/src/moderation-lifecycle.ts:57 "if (!target?.message_text) return { ok: false, refusal: 'original_unavailable' };"`)
  with copy that says why
  (`apps/desktop/src/moderation-copy.ts:162 "Original message unavailable · decision blocked"`).
  The core-backed card never adopted it.
- **The card rebuilds the queue the core already owns.** The core has a pending-ban read
  that attaches the stored original to every open proposal
  (`crates/cc-gatehouse/src/review.rs:42 "Original text is read from the durable queue, never supplied by"`),
  but no RPC method exposes it. The client rebuilds the queue from history and chat
  pages and filters it with its own copy of the window. That is the "two copies of the
  window" deviation recorded in the Rust ban-queue application. Reading the core's own
  queue would remove both deviations: the contract door already rejects a pending ban
  without text.
- **The original is not rendered for a person.** The card prints the raw string in a
  blockquote. The pattern matcher strips zero-width characters before it matches
  (`apps/desktop/src/moderation-pattern.ts:12 "const normalized = text.toLowerCase()"`),
  and the card leaves them invisible. So a hit that depended on an evasion the matcher
  saw through looks like plain text to the streamer. The card shows no earlier messages
  from the same account either.

## Where this sits

The contract door and the core's store check are the technique's binding: whatever the
client does, a confirm is about the stored record. The card is the half that lets a
person *see* that record, and that half is where the deviations live. An implementer who
copies the contract door and stops there has bound the decision to the evidence without
making sure anyone read it.
