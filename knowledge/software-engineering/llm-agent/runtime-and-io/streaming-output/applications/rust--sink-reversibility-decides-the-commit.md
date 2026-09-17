---
layer: application
type: application
subject: streaming-output
technique: sink-reversibility-decides-the-commit
stack: rust
project: personas
status: forged
applied: code
ab_verdict: better
verified_on: 2026-09-17
verified_against: rust@1.80
---

# A bounded line reader that spoke in band, and the 222 records it cost

The seam is a bounded stdout reader shared by three consumers: a verbatim
append-only execution log, a line channel feeding a re-renderable view, and a
parser that turns each line into typed stream events. One producer, sinks of
two different reversibility classes.

`cli_process.rs:213-287` said "this is only a prefix" the cheap way — it
appended `...[truncated]` when the 64 KiB per-line cap fired and
`...[timeout]` when the silence window expired with bytes buffered. Correct
for the log. Fatal for the parser: `parser.rs:88-96`'s non-JSON arm, whose
comment says it exists to suppress the plain-text duplicates the child also
emits, was unremarked the arm that ate every clipped envelope, returning
`Unknown` with no display at all.

**Measured on the 397 execution logs present on 2026-09-17** (182,095,845
bytes, 80,919 `[STDOUT]` lines): 222 lines end in the reader's own marker and
**all 222 fail to parse** — 220 `user` tool_result envelopes and 2
`assistant`, lengths 63,266 / 65,057 / 65,533 (min / median / max), hard
against the cap. Each one is a record the child produced, the user watched
arrive, and no sink retained.

Two findings the seam gave up that the technique did not predict:

- **The instrument had to be corrected before it could be trusted.** The
  first pass reported that 80,689 of 80,696 unmarked brace-leading lines also
  failed to parse, which would have been a far bigger number and a wrong one.
  The cause is a *second* in-band mutation, in the same irreversible sink from
  a different stage: a log redactor rewrites `"k":"v"` to `"k: [secret]"`,
  producing a bare string where an object member belongs. So the repository's
  own claim that these files are "the exact bytes the parser was handed" no
  longer holds, and any measurement taken off them must undo the redaction
  first. The count above is post-normalization.
- **The correct policy already exists in this tree, at one site.**
  `credentials.rs:640-648` runs the same redactor over structured metadata,
  checks that the result still parses, and keeps the original when it does
  not — with a doc comment explaining that the unguarded version silently
  wipes a ledger. The rule was known, written down, and never generalized to
  the two sinks that needed it.

## What shipped

`backlog/6-003`, commit `d7954757e`, `personas-engine` only:
`read_line_within_oob` returns the received prefix untouched with the clip
beside it (`Clip::SizeCap` / `Clip::SilenceWindow`, each carrying
`at_bytes`); `read_line_within` is kept as the in-band form for display-only
callers so no existing caller changes; `parse_stream_line_bounded` refuses to
hand a clipped prefix to the deserializer and surfaces
`[clipped] a <kind> record was cut at N bytes` instead.

The runner's own call site still uses the in-band form — it lives in the
desktop crate and is left for its own change, so the 222 are not yet
recovered in production. What shipped is the mechanism plus the assertion
pair that keeps it honest.

## Gates

`node scripts/build/run-rust-tests.mjs --crates`, private `CARGO_TARGET_DIR`
and `TMP`: `personas-engine` **1337 passed / 3 failed** against a baseline of
1330 / 3 (the three — `responsibility`, `serving_overrides` ×2 — are
pre-existing at `4108feaa7`). `personas-db` 1047 / 10 and `personas-core`
915 / 0, both unchanged. `cargo clippy -p personas-engine --lib --features
personas-engine/desktop -- -D warnings` clean; `cargo fmt --check` clean.
Lefthook is absent from a worktree's PATH, so both were run by hand.

The floor was shown to be a real floor rather than assumed: reporting every
line as a prefix turns the new opposing assertion **and** the pre-existing
`chunks_arriving_slowly_keep_resetting_the_window` red, and dropping the
legacy marker turns the pre-existing
`a_partial_line_at_the_window_still_returns_its_prefix` red.
