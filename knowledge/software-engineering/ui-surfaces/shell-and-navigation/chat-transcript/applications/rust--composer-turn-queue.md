---
layer: application
type: application
subject: chat-transcript
technique: composer-turn-queue
stack: rust
verified_on: 2026-08-23
verified_against: rust@1.85
---

# grok-build's pager — queue, interject and cancel as three code paths

`xai-org/grok-build` (the `xai-grok-pager` crate, a ratatui terminal
transcript) is the cleanest realization of the composer-turn-queue technique
seen so far, because the three intents the technique names are three
*modules*, not three branches of one handler. Paths below are relative to
`crates/codegen/xai-grok-pager/src/` unless noted.

## Submit while busy enqueues — two paths, one visible queue

`app/dispatch/prompt.rs:860-940`: if the server is mid-turn, the prompt takes
a server-authoritative immediate-send path onto the shared queue; otherwise it
enqueues locally and `maybe_drain_queue` (`app/dispatch/queue.rs:194+`)
starts it the moment the turn ends. In neither case is the send control
disabled. Queue rows are wire types with `id / version / owner / position`
(`../../xai-prompt-queue/src/types.rs:11-50`) and edits carrying a stale
`version` are a no-op — the technique's "versioned, never a clobber" rule,
enforced by the type rather than by discipline.

## Optimistic echo retired by id

`app/dispatch/queue.rs:92-112` mints a `prompt_id`, renders the row at once,
and records it in `optimistic_queue_ids`; `retire_optimistic_echo`
(`queue.rs:129-135`) removes the entry when the server broadcast carries the
same id. The row is never duplicated and never resurrected — the retire is an
explicit operation, which is the part most implementations forget.

## Consecutive follow-ups combine

`../../xai-prompt-queue/src/combine.rs:30-70`: consecutive plain queued
prompts are joined with `\n\n` into one turn body, while
`combinedDisplayTexts` keeps them as separate bubbles on screen. Eligibility
is a closed gate — synthetic, shell, skill and image prompts never combine.

## Interjection is a separate buffer

`../../xai-interjection-core/src/buffer.rs:23-41`: a mid-turn message is
buffered and drained FIFO at the runtime's next safe point, each wrapped as
its own synthetic user message. Nothing in this crate touches the queue
crate, which is what makes "interject" and "queue" impossible to conflate.

## Cancel keeps the draft and converges

`app/dispatch/turn.rs:54-374`: Esc cancels with the draft intact; Ctrl+C
cancels only on an *empty* composer (otherwise it edits); a modal asks
whether delegated subagents stop too. Every terminal outcome — cancelled,
completed, blocked by a hook, arriving live or by replay — passes through
`finalize_turn_from_terminal` (`app/turn_completion.rs:1-40`), which is why a
client attaching mid-turn cannot get stuck on "Waiting…" and why the
cancelled-vs-blocked copy cannot drift.

## Composer chips

`views/prompt_widget/mod.rs:41-50`: large pastes, `@file` references and
images become collapsed elements with kind tags, so a ten-kilobyte paste is
one chip rather than a scrolling composer. Enter semantics are resolved in
one place (`mod.rs:2245-2272`): bare Enter submits, trailing backslash
continues, Shift/Alt+Enter inserts a newline.

## What does not port

The CoreGraphics modifier poll (Apple Terminal cannot report Shift+Enter) and
the terminal-specific key protocol handling. Everything above the input layer
— the two-path enqueue, id-retire, combine gate, separate interjection
buffer, single finalizer — ports to a browser composer unchanged.
