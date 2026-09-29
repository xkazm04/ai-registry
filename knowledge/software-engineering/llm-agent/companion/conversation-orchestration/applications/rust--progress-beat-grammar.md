---
layer: application
type: application
subject: conversation-orchestration
technique: progress-beat-grammar
stack: rust
status: forged
verified_on: 2026-09-29
verified_against: rust@1.96
---

# Progress beats in the Personas companion backend

Personas' companion (Athena) drives the Claude Code CLI as a subprocess, so a
single turn routinely runs for minutes with no observable phase change. The
`PROGRESS:` grammar is how that turn stops being a silent pause. The Rust side
owns three of the four pieces the technique names — the teaching, the strip, and
the durable write — while the live-tail sieve runs in the webview.

*Citations resolved at Personas `fb317cfa9` (master) on 2026-09-29. The first pass
(2026-08-23) predates the move of the frontend from `src/features/plugins/companion/`
to `src/features/companions/athena/` (`bf4fe6c05`, 2026-09-22; the store became
`athenaStore.ts` in `d11cd7591`) and the docs move to
`docs/features/companions/athena/` (`37007c8ce`). Two of its claims did not survive
the interval and are corrected below.*

## 1. The teaching is always on, in two forms, and the second form is thinner

The first pass found `progress_addendum()` "appended unconditionally". That is no
longer true of the default turn. `src-tauri/src/companion/prompt/addenda.rs:231`
still defines `progress_addendum() -> String` (body `:232-273`, doc comment
`:223-230`), and its comment still records the defect the technique warns about —
"earlier versions taught it inside the voice addendum, which silently disabled
narration for text-only users and for proactive turns" (`:225-230`). But it is
appended only for `PromptClass::Full` (`prompt/build.rs:190-194`):

```
PromptClass::Full => (format!("{}{}", voice_flag(voice_enabled), progress_addendum()), …),
PromptClass::Chat => (voice_flag(voice_enabled), …),
```

and the Chat class carries the grammar in its static core instead — `build.rs:184-185`
says "the chat core teaches PROGRESS itself". Since `322b14e5a` (2026-09-17)
`CHAT_FAMILY_CERTIFIED = true` (`chat_family.rs:41`), and `build_system_prompt` is
hard-wired to the Main tier (`build.rs:94`), so a default turn is a Chat turn: the
addendum is reached only under `PERSONAS_ATHENA_PROMPT_CLASS=full` and in a bench
harness (`bench_render.rs:74`).

The technique's rule — the instruction is on every turn, not on the flows someone
remembered — therefore still holds, but as *a different passage*. The chat core's
version is `chat-core.md:184` (the marker) and `:198-201`: one short first-person
sentence "before a slow step or when something turns up; two to five per working
turn, zero for a quick answer". What that shorter passage lacks is what the
addendum had spelled out: the **no-tools case** (`addenda.rs:259-261`), where the
wait is composition time and no event exists for the runtime to narrate, and the
line "never narrate a turn that is about to finish anyway". The composition-time
case is the technique's whole starting point, and it is the sentence that a
compaction of the prompt drops first because nothing in the tool-driven happy path
exercises it. The lesson for the technique: when a prompt is split into a full
class and a compact class, the always-on obligation moves to whichever passage the
*default* class carries, and it should be checked there — by a test that pins the
needle in the compact core (`chat_family.rs:305` pins `PROGRESS: ...`, which is the
marker, not the composition-time rule).

The feature doc still describes the old wiring ("always-on in every turn's system
prompt … `addenda.rs:332` … `build.rs:127`",
`docs/features/companions/athena/conversation-orchestration.md:35-38` and `:44`),
so the stale statement now lives in the doc that was written to record the fix.

What the addendum body still carries (`addenda.rs`, Full class only): the marker
and one-line shape with worked examples (`:241-245`), the message-form sentence
"OWN little message" (`:247`), a length and register bound "≤ ~15 words" (`:255`),
a budget "Aim for 2–5" (`:258`), the no-tools case (`:259-261`) and the floor
"ZERO beats" (`:267`). The boundary the first pass cited against the closing `TTS:`
line is gone: the layered voice (`86d9f9a2a`) removed the voice addendum, and
`TTS:` is now optional (`chat-core.md:207`).

## 2. The strip: one authority, two consumers, and a display twin

`src-tauri/src/companion/dispatcher/dispatch.rs:111` strips `PROGRESS:` from the
persisted reply, collecting the bodies into `Dispatched::progress_beats`
(`dispatcher/types.rs:111-115`). Its own comment names the split: "the frontend
detects + speaks these the instant their line completes in the stream; here we
only strip them from the persisted reply so they never appear in the final
bubble" (`dispatch.rs:105-110`). It is the same loop that handles `TTS:`, `QR:`
and `OP:` — one line-oriented pass over the settled text, four grammars.

`src-tauri/src/companion/session/stream.rs:30` adds `clean_segment_for_display()`,
which drops the same prefixes from an *interim* segment. Its doc comment is
explicit that this is a display twin — "Mirrors the frontend
`stripModelDirectives` … Display-only: the dispatcher remains the authority for
ops/beats" (`stream.rs:24-29`).

**Deviation, larger than first recorded.** The technique asks for one marker
vocabulary with one authority. The first pass counted four places for the marker
literal. At `fb317cfa9` it is well over a dozen. Rust: `dispatch.rs:111`,
`stream.rs:38` and `:87`, `addenda.rs:241-245`, `chat-core.md:184` and `:198`,
`bench/athena_validate.rs:71`. Frontend: `athenaChatVoice.ts:215`,
`Bubble.tsx:111`/`:113`, `athenaLabels.ts:251`, `AthenaChatTranscript.tsx:33`,
`athenaChatPreview.ts:19`, `speechChunker.ts:34` (a `MACHINE_LINE` regex),
`chat/next/exchange.ts:58`/`:83`, `chat/next/frame/FrameTop.tsx:38`. Nothing
derives from anything. The mitigating fact is unchanged: `dispatcher/tests.rs:92-93`
asserts the strip and `chat_family.rs:305` pins the needle in the core, so a rename
on one side fails a test rather than shipping silently — but each test pins the
literal too, so a rename must be made in every file that matters, and the number
of files that matter grew fourfold in five weeks.

## 3. Beats are written at their emission time

`persist_stream_progress()` (`session/stream.rs:62-107`) is called once per
streamed assistant message and appends each completed beat as its own lightweight
assistant episode (`stream.rs:87-99`). The doc comment records the upward lesson
this technique carries (`stream.rs:50-53`):

> This replaces the old end-of-turn flush in `send_turn` that appended every
> beat/segment in a tight loop — which stamped them all within the same
> millisecond ("big bang" on reload). Now each write lands as the turn actually
> progresses.

The live experience was already correct before that change; only the *reloaded*
conversation replayed the wall of text the beats existed to prevent.

Ordering is handled explicitly in the same function: the prior step's prose is
flushed before this step's beats so the transcript reads chronologically
(`stream.rs:71-81`), and the last non-empty prose is held as the candidate final
reply and persisted by the caller (`stream.rs:57-61`, `:103-106`).

## 4. What the frontend adds

The live-tail sieve is now `src/features/companions/athena/chat/athenaChatVoice.ts:190-239`:
it subscribes to the accumulating stream text, splits on newline, and
deliberately skips the trailing segment (`:190-195`, `:212-217`). It fires each
beat once via a positional count ref (`:218`, `:237`), reset when the stream ends
(`:204`) and on `resetTurnProgress` (`:150`). Its role widened since the first
pass: the same scan now also feeds `createSpeechChunker` for sentence-by-sentence
speech (`:197`, `:211`). Beat ids are `beat_${turnStamp}_${i}` with `turnStamp =
Date.now()` read at each firing (`:219`, `:228`), so the id cannot dedupe a
re-scan and the count ref is the only guard — read from the code, not exercised.

Rendering uses the message form: `AthenaChatTranscript.tsx:27-37` classifies an
assistant message whose content starts with the marker as a distinct
`assistant-aside` kind so asides cluster and a real reply after one still shows
its avatar. Beats are also excluded from the conversation preview
(`athenaChatPreview.ts:19`).

## 5. The native channels exist, and this runtime consumes none of them

As of 2026-09-29 the provider's docs describe a native, model-authored progress
note between tool calls — "a note on what the model just found and what it's about
to do next, written for the person watching the agent rather than as reasoning",
returned as its own block, with "at most one progress update" before each tool
call and "the model can skip any of them", delivered as readable text only under a
beta display setting (`thinking-display-updates-2026-08-18`), and "fewer progress
updates at higher effort and in long tool chains"
(`platform.claude.com/docs/en/build-with-claude/thinking`, "Progress updates
between tool calls", read verbatim on 2026-09-29). Reasoning text is redacted by
default for current models, and the Claude Code setting `showThinkingSummaries`
"when unset or `false` … shows a collapsed stub". The agent SDK also emits runtime
liveness the CLI subprocess could surface: a running `thinking_tokens` estimate
while a thinking block is produced, and a `tool_progress` heartbeat every 30
seconds during a long call (`code.claude.com/docs/en/agent-sdk/typescript`).

What that means for this seam:

- The in-band grammar is still the right tool here. The turns that motivated it
  are composition-time silences with no tool call, which the native note does not
  cover, and the subprocess does not ask for the display setting.
- A grep of `src-tauri/src/companion` and `src/features/companions` at `fb317cfa9`
  finds no consumer of `tool_progress`, `thinking_tokens` or a thinking-display
  flag; the launch arguments carry `--include-partial-messages`
  (`session/launch.rs:225`, `:279`, `:408` and four more). So no runtime
  liveness signal reaches the "stalled or slow?" question the technique's
  fallback poses. That is an unapplied seam, recorded in `librarian/applied.md`.

The correction the technique needed was to its *premise*, not its mechanism: the
model is asked because the runtime cannot say, and for a tool-heavy turn on a
runtime that delivers the native note the runtime can now say a little more.
