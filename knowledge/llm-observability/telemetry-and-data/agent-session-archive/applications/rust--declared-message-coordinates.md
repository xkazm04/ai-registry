---
layer: application
type: application
subject: agent-session-archive
technique: declared-message-coordinates
stack: rust
status: forged
verified_on: 2026-10-15
verified_against: rust@2026.08.31
---

# Rust: follow-up addressing in coding_agent_session_search

The tree is coding_agent_session_search (cass) 0.10.0 at commit 7fc01958d367;
the version witness is the toolchain pin `nightly-2026-08-31` in
`rust-toolchain.toml`, in dotted form because the tree names no stable
release. Mechanisms are restated; anchor quotes are the only verbatim text.

## The incident: one field, two spaces

An early release filled the search hit's line field from the stored message
index: `CHANGELOG.md:3771 "Populate"`. Agents reading that field opened the
transcript file at that line and cited whatever record was there. The
reference that came out of the fix states why the two numbers diverge, in the
technique's terms: normalization drops metadata, progress, malformed and tool
records, and stored ordinals may be sparse:
`docs/reference/message-addressing.md:4 "not a physical JSONL file line"`.

## Confirmed: the space is declared and the lookup fails closed

Follow-ups now take the hit's ordinal through a dedicated message-index
argument, and the physical-line argument no longer substitutes archive
content: `CHANGELOG.md:822 "a canonical message ordinal"`. Payloads name their
coordinate space and content source, and the reference forbids reading the
compatibility line fields as file lines:
`docs/reference/message-addressing.md:49 "Never cite them as"`.

The refusal list is the technique's step 3 almost item for item. An ambiguous
path, an identity mismatch or a missing or duplicate index is an error, and
the lookup will not prefer a local row, take the newest, step to a neighbour,
re-parse the live file or drop to raw lines:
`docs/reference/message-addressing.md:41 "not prefer a local conversation, choose the newest row"`.

The lookup module reads identity and messages in one transaction and never
touches the source file: `src/followup_coordinates.rs:6 "it never reparses or mutates the source file or archive"`.
Context is counted in stored messages, not by subtracting ordinals:
`src/followup_coordinates.rs:159 "NOT arithmetic on sparse idxs"`. Oversized
windows are refused with a non-retryable error instead of a truncated message
presented as whole: `docs/reference/message-addressing.md:85 "rather than truncating a"`.
The pack planner holds the same line for ordinals a caller supplies:
`src/search/pack_planner.rs:965 "Caller-supplied ordinals or malformed spans are not verified file lines."`

Physical-line addressing survives as its own mode that never falls back to the
archive and is told not to receive the search field:
`docs/reference/message-addressing.md:61 "Do not pass"`.

## Deviation: the field kept its name, and the instruction file kept the old meaning

The fix reinterpreted the existing field rather than renaming it, so every
consumer of the old documentation kept working and kept producing wrong
citations. The agent-facing instruction file shipped with the tool still
teaches the refuted form, following a hit by its line field into the
physical-line mode: `SKILL.md:42 "using its exact source_path and line_number"`
and `SKILL.md:43 "cass view /path/to/session.jsonl -n 42"`. It also claims
verification on an older release than the crate:
`SKILL.md:32 "verified on cass 0.8.0"`. The most widely loaded agent-facing
artifact is a fix behind the reference, which is the technique's argument for
renaming a field whose meaning changes, and for changing the instruction file
in the same change as the payload.

## Lifetime

The coordinate is stable within one archive. The layout-migration document
notes that a full rebuild reallocates ids, which bounds any coordinate bound
to them: `docs/codex-layout-migration.md:127 "ID-reallocation semantics"`.
The addressing reference does not state that lifetime itself; the technique
asks for it to be stated where the coordinate is defined.
