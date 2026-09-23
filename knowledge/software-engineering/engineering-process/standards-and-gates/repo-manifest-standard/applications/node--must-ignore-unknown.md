---
layer: application
type: application
subject: repo-manifest-standard
technique: must-ignore-unknown
stack: node
verified_against: node@24
verified_on: 2026-09-23
---

# Two in-place writers that carried every foreign key forward, and rewrote the ones shaped like their own

The Ascent repo ships two zero-dependency scripts into every adopting repository
that write back into the open manifest (`.ai/manifest.yaml`) rather than
regenerating it. The upkeep script's `project` command renders the declared
guidance projections and writes the source hash into each projection row. The
doctor's `--run` flag executes the declared capabilities and writes each result
into that capability's `verified` flag. Neither rebuilds the file from a model,
so neither committed the accident the technique's writer half is built around:
every key they had no opinion about was still there after the write.

Both still wrote into foreign rows. On 2026-09-10 four commits repaired them
(`212ae1a51`, `fbae1b0ea`, `428df63a7`, `996de52d0`).

## Where the targeting went wide

- **The projection writer selected by shape.** The hash write-back rewrote every
  line matching an agent-shaped flow map (`- { agent: …`) anywhere in the
  manifest. An extension block that happened to list agents the same way — before
  the guidance block, nested inside it under another key, or after it — had its
  human-owned `hash` overwritten with the projection's source hash.
- **The doctor selected by name, then by the last match on the line.** The
  write-back was a multiline pattern anchored on a two-space-indented capability
  name followed by a flow map, with a greedy run up to `verified:`. A same-named
  row in an extension block earlier in the file matched first. Within the right
  row, the greedy run landed on the *last* `verified:` on the line — a nested
  map's field, or the text `verified: false` inside a quoted command.

## The repair: the write is bound to what the parse owned

- The guidance parser records the line index of every row it accepts from
  `guidance.projections`, and the hash write-back touches those indices and no
  others (`maintain.ts`, `projectionRows`). The parser is one source inlined into
  both emitted scripts (`guidance-parser-source.ts`), so the writer and the
  doctor cannot disagree about which rows are the projections.
- The doctor resolves the `capabilities` block's line range first, matches a
  capability by name only inside it, and rewrites only the direct `verified`
  field of the flow map — a small scanner tracks quote state and nesting depth
  and changes the field only at depth one, outside quotes (`doctor.ts`,
  `setVerified`).
- Both read the block boundaries with LF and CRLF endings, including a block at
  the very start of the file, and write the file back with its own line endings.

## The guards, and why they are the test the technique asks for

The technique's writer test places a foreign key, regenerates, and asserts it
survives. Both writers passed that test before the repair, because a foreign key
with a foreign name is exactly what a shape-selected write never touches. The
regression tests (`maintain.execution.test.ts`) place a foreign row *built to
look owned*:

- an agent-shaped extension row before, inside and after the guidance block,
  asserting all three survive byte-for-byte, no file is generated for the foreign
  path, and exactly one projection is written;
- a same-named capability in an extension block on either side of
  `capabilities`, plus an owned row carrying a nested `verified`, a quoted
  `verified: false` inside its command and an extension string field — run under
  both `\n` and `\r\n` — asserting the whole file equals the original with only
  the two owned direct flags flipped, one to `true` for a passing command and one
  to `false` for a failing one.

The assertion is whole-file equality after a real run of the emitted script,
not a check of the owned field alone, which is what lets it see a write that
landed somewhere else.
