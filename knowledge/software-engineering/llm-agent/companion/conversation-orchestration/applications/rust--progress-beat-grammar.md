---
layer: application
type: application
subject: conversation-orchestration
technique: progress-beat-grammar
stack: rust
status: forged
verified_on: 2026-08-23
---

# Progress beats in the Personas companion backend

Personas' companion (Athena) drives the Claude Code CLI as a subprocess, so a
single turn routinely runs for minutes with no observable phase change. The
`PROGRESS:` grammar is how that turn stops being a silent pause. The Rust side
owns three of the four pieces the technique names — the addendum, the strip, and
the durable write — while the live-tail sieve runs in the webview.

## 1. The addendum is always on

`src-tauri/src/companion/prompt/addenda.rs:332` defines
`progress_addendum() -> String`, appended unconditionally at
`src-tauri/src/companion/prompt/build.rs:127`. The doc comment at
`addenda.rs:325-331` records exactly the failure the technique warns about:

> earlier versions taught it inside the voice addendum, which silently disabled
> narration for text-only users and for proactive turns (spawned with voice off).

That is the conditional-addendum defect, found in production and fixed by making
the instruction unconditional. The feature doc dates the fix
(`docs/features/companion/conversation-orchestration.md:5-7`, "D1 — narration
unbundled from voice").

The instruction body (`addenda.rs:336-373`) carries every rule the technique
prescribes and one it taught upward:

- the marker and one-line-per-beat shape, with three worked examples
  (`addenda.rs:342-346`);
- a length and register bound — "One short sentence, ≤ ~15 words. Plain English:
  no markdown, paths, ids, or code names" (`addenda.rs:356`);
- a budget — "Aim for 2–5 across a working turn" (`addenda.rs:359`);
- the no-tools case stated explicitly (`addenda.rs:360-366`): beats also apply
  when the wait is *composition* time rather than tool time, which is precisely
  the case an event-derived narration cannot see;
- a floor — "A quick answer you can give in one message needs ZERO beats"
  (`addenda.rs:367-369`), the technique's "when not to use this" written into
  the prompt itself;
- and the sentence that makes the message form work: "Each line appears in the
  chat as its OWN little message from you the moment you emit it"
  (`addenda.rs:348-351`).

The addendum also declares its boundary against the spoken-summary grammar
(`addenda.rs:317-319`): beats are in-progress narration, the single closing
`TTS:` line is the spoken version of the final reply. Two in-band grammars, one
prompt, no overlap.

## 2. The strip: one authority, two consumers, and a display twin

`src-tauri/src/companion/dispatcher/dispatch.rs:69` strips `PROGRESS:` from the
persisted reply, collecting the bodies into `Dispatched::progress_beats`
(`dispatcher/types.rs:111-115`). Its own comment names the split: "the frontend
detects + speaks these the instant their line completes in the stream; here we
only strip them from the persisted reply so they never appear in the final
bubble" (`dispatch.rs:63-68`). It is the same loop that handles `TTS:`, `QR:`
and `OP:` — one line-oriented pass over the settled text, four grammars.

`src-tauri/src/companion/session/stream.rs:30` adds
`clean_segment_for_display()`, which drops the same four prefixes from an
*interim* segment. Its doc comment is explicit that this is a display twin —
"Mirrors the frontend `stripModelDirectives` … Display-only: the dispatcher
remains the authority for ops/beats" (`stream.rs:24-29`).

**Deviation.** The technique asks for one marker vocabulary with one authority.
Personas has the marker literal written out in at least four places
(`dispatch.rs:69`, `stream.rs:38`, `stream.rs:87`, and the frontend regex at
`src/features/plugins/companion/chat/athenaChatVoice.ts:121`), plus the prompt
copy at `addenda.rs:342`. Nothing derives from anything. The mitigating fact is
that `dispatcher/tests.rs:86-91` asserts the strip, so a prompt-side rename
would fail a test rather than ship silently — but the test pins the literal too.

## 3. Beats are written at their emission time

`persist_stream_progress()` (`session/stream.rs:62-104`) is called once per
streamed assistant message and appends each completed beat as its own
lightweight assistant episode (`stream.rs:87-99`). The doc comment records the
upward lesson this technique now carries (`stream.rs:50-53`):

> This replaces the old end-of-turn flush in `send_turn` that appended every
> beat/segment in a tight loop — which stamped them all within the same
> millisecond ("big bang" on reload). Now each write lands as the turn actually
> progresses.

The live experience was already correct before that change; only the *reloaded*
conversation replayed the wall of text the beats existed to prevent.

Ordering is handled explicitly in the same function: the prior step's prose is
flushed before this step's beats so the transcript reads chronologically
(`stream.rs:71-81`), and the last non-empty prose is held as the candidate final
reply and persisted by the caller (`stream.rs:57-61`, `stream.rs:101-103`).

## 4. What the frontend adds

The live-tail sieve is `athenaChatVoice.ts:108-142`: it subscribes to the
accumulating stream text, splits on newline, and deliberately ignores the
trailing segment — "A newline is what makes a line 'complete', so the trailing
segment is always skipped" (`athenaChatVoice.ts:104-106`). It fires each beat
once via a count ref (`athenaChatVoice.ts:124`, `:141`), which is a positional
guard rather than an identity one; a re-scan after a stream reset resets the
count at `athenaChatVoice.ts:115`.

Rendering uses the message form: `AthenaChatTranscript.tsx:27-37` classifies an
assistant message whose content starts with the marker as a distinct
`assistant-aside` kind so asides cluster and a real reply after one still shows
its avatar. Beats are also excluded from the conversation preview
(`athenaChatPreview.ts:19`) — a list of threads should not show a mid-turn aside
as the last thing said.
