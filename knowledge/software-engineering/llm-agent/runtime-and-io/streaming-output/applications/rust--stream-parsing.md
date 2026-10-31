---
layer: application
type: application
subject: streaming-output
technique: stream-parsing
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.96
---

# The execution stream parser — where the repo meets the technique, and where it doesn't

The execution stream parser is `parse_stream_line` at
`src-tauri/engine/src/parser.rs:167+`: one stdout line of the CLI's
stream-json format in, a `(StreamLineType, Option<display_string>)` out.
`StreamLineType` (in `personas_core::types`) is the typed event vocabulary;
`protocol.rs` names the pipeline stages (`StreamOutput` → `FinalizeStatus`)
as a formal trait boundary between the runtime and its side effects. Framing
is line-oriented (`cli_process::read_line_within`), and `safe_json.rs` shows
the bounded-parse discipline (16 MiB size cap + depth-128 nesting scan before
deserialization) plus a deliberate strict/lenient split for machine-protocol
vs model-generated payloads.

## Confirmed against the technique

- **Framing separated from payload parsing**: the process reader cuts lines;
  the parser consumes one complete line. Chunk boundaries never reach the
  payload parser.
- **Tolerant fields, defensive shapes**: `parser.rs` reads every field with
  `.get(...).and_then(...)` and survives both shapes of `plugin_errors`
  observed in the wild (`:198-227`) — tolerant-in-shape as prescribed.
- **Bounded parse**: `safe_json::validate_limits` (`safe_json.rs:33-76`) is a
  fast pre-scan enforcing size and depth caps before `serde_json` allocates —
  the "bound the frame" rule at the payload level.
- **Attribution keys carried through**: `parent_tool_use_id` (`parser.rs:59-69`)
  attributes subagent messages to their spawning tool call — event-level
  attribution as the technique requires.

## Deviations, measured by the legacy census (2,998 logs / 268,482 lines)

The legacy composition `docs/concepts/golden-paths/model-output-streaming.md`
measured this parser against every byte it ever received. Its findings map
one-to-one onto the technique's rules:

1. **"Count the unknown; never drop it" — violated.** Unrecognized envelope
   types fall to `_ =>` and return `(Unknown, None)` with no counter, no
   sample, no diagnostic event. Cost, measured: 3,483 `rate_limit_event`
   lines (1,274 of them quota warnings/rejections) and 7 of 10 `system`
   subtypes — including 107,501 `thinking_tokens` lines, 40% of the stream —
   invisible because "unhandled" and "absent" share a code path.
2. **"Route, never mutate, at the size cap" — violated.**
   `cli_process::read_line_within` truncates oversized lines at ~64 KiB and
   appends `...[truncated]`, producing invalid frames; the parser's non-JSON
   arm (`parser.rs:174-182`) — written to suppress plain-text *duplicates* —
   then eats them silently. Measured: 68 tool-result envelopes vanished this
   way, 38 hard against the cap. This is the exact mutate-then-parse failure
   the technique forbids.
3. **"Fixtures from captured bytes" — violated, twice.** The parser's own
   fixture (`parser.rs:1672`) puts token counts at the top level of the
   `result` envelope — a shape the CLI has sent 0 times in 2,811 observed
   result lines (they live under `usage`, 2,811/2,811). A second
   independently written copy of the same wrong fixture sits in
   `engine/src/provider/claude.rs:402`. Both are green; both assert the
   author's belief, which was the thing under test.
4. **"Data, not prose" — the primary channel is a display string.** The
   runner's main output event carries the formatted `display` string; the
   typed `StructuredExecutionEvent` channel exists beside it for a subset of
   variants only. Downstream (see `useStructuredStream.ts`'s 11-variant
   union) can act on what was typed and nothing else.
5. **Outcome discriminator** (cancellation-and-finalization's rule, surfaced
   here because the parser owns the field reads): `is_error` is never read,
   so 82 failed result lines rendered as "Completed in Ns"; meanwhile
   `subtype` and `terminal_reason` — constant across all 2,811 lines — are
   the fields the code shape suggests checking.

The correct reader for the terminal envelope already exists one directory
away: `src-tauri/engine/src/build_session/parser.rs:142-170`
(`extract_result_usage`) reads `usage.input_tokens`/`output_tokens` from
where the wire puts them. The capability was built for one of the repo's two
streams and never carried to the other — the fix is a transplant within the
repo, not an invention.

Re-checked 2026-10-31 at personas@22260d77c9: two of the five deviations are
resolved in the tree. **Deviation 2** — `cli_process` now reports a clip out of
band (`Clip`, `read_line_within_oob`, `cli_process.rs:253-298`); the in-band
`...[truncated]` marker is kept only for display sinks, and the runner hands a
clipped line to `parse_stream_line_bounded` (`parser.rs:140-162`), which surfaces
it as a `[clipped]` display instead of letting the non-JSON arm eat it — the
route-don't-mutate rule now holds on the runner path. **Deviation 5** — the
`result` arm reads `is_error`, `subtype` and a bounded `error_text`
(`parser.rs:482-506`) and displays "Turn ended with error: …" rather than
"Completed in Ns". Deviations 1, 3 and 4 still stand as written: there is still no
`rate_limit_event` arm and no counter on `Unknown`; the `result` arm still reads
`total_input_tokens`/`total_output_tokens` from the top level (`parser.rs:443-444`,
only the cache fields consult `usage`), and both fixtures (`parser.rs:1672`,
`provider/claude.rs:402`) still put them there.
