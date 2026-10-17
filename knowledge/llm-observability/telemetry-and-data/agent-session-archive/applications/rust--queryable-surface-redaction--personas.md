---
layer: application
type: application
subject: agent-session-archive
technique: queryable-surface-redaction
stack: rust
verified_on: 2026-10-15
applied: experiment
ab_verdict: not-better
---

# The falsifying seam: a consumer that argued against redaction, measured

The personas desktop app can make a persona aware of the user's live agent-CLI session.
It discovers the most recently written transcript, extracts recent turns, and prepends
them to the persona's system prompt
(`src-tauri/engine/src/cli_session_awareness/render.rs`). Its module documentation argues
the opposite of this technique on purpose: the extracted text is **not** redacted,
because explicit opt-in consent is the gate and redaction would corrupt the code
snippets a user wants the persona to see (`cli_session_awareness/mod.rs`). That made it
the seam that could falsify the technique, so it was chosen over a seam that would only
confirm it.

## What the seam actually renders

Two callers pass eight turns (`src-tauri/src/engine/execution.rs:114`,
`src-tauri/src/daemon/runtime.rs:387`). Extraction keeps user turns and assistant text
blocks, skips thinking and tool blocks (`cli_session_awareness/transcript.rs`,
`extract_text_blocks`), and cuts each turn at 500 characters (`TURN_MAX_CHARS`) before
anything else happens. The app stores neither the block nor the prompt: its audit row
records a turn count and its execution log records a prompt length.

## The experiment

A Node port of the extraction rule (validated against the 13 fixtures of the Rust unit
tests) replayed every transcript written on this machine in the last 14 days: 5,385
files, 4.44 GB, 5,383 renderable windows and 20,592 turns, of which 3,061 hold a code
fence. A detector of 22 precise credential-shape patterns plus a placeholder filter ran
in two arms. Arm A was the block as personas renders it. Arm B redacted the full turn
before the cut.

- **Target:** rendered windows that carry a credential. Arm A: **0 of 5,383**. Arm B
  performed four redactions on full text, none inside a rendered window.
- **Floor** (personas' own objection): code-fence turns changed by a non-credential
  match. **0 of 3,061.**
- **Positive control:** the same detector on the same files found plausible-live
  credentials in **66 of 5,385 transcripts**, almost all inside tool inputs and outputs.
  Only two sat in text turns, past character 500.

## Verdict: not-better, and the condition it adds

Redaction bought nothing at this seam, and the seam's decision not to redact is
measurably right. The reason is not consent, though. Extraction scope and the absence of
a stored copy are what protect it: the cut removes the two text-turn credentials, and
skipping tool blocks removes the other 64 files. The technique now states that
discriminator (its "Scope and custody" section) and when it flips: raise the cut and two
credentials appear in four windows; render tool blocks and all 66 files are reachable.

## Structural facts the seam returned

- The awareness block is prepended to the persona's legacy `system_prompt` field, which
  `src-tauri/engine/src/prompt/assemble.rs` renders only for personas with no manifest,
  no structured prompt and no core identity. For every other persona the block is
  dropped silently, so this seam may carry no traffic on most installs.
- The assembled prompt reaches the agent CLI on stdin, and a persona configured for a
  remote OpenAI-compatible provider sends the same prompt off the machine
  (`src-tauri/src/engine/runner/mod.rs`, `engine/src/http_engine/config.rs`). Whether the
  CLI then writes it into its own transcript store, where discovery could serve it again,
  was inferred and not verified.

## What this realization cannot do

It measures what the window holds, not what the persona does with it. Exposure was counted
once per transcript at its last write, not weighted by how long each session stayed the
active one, and the class labels on matches (live, sample, hash) were not checked
against ground truth.
