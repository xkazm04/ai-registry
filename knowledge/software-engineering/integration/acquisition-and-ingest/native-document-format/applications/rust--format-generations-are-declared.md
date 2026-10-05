---
layer: application
type: application
subject: native-document-format
technique: format-generations-are-declared
stack: rust
verified_on: 2026-10-05
verified_against: rust@1.96.1
applied: code
ab_verdict: better
proof: ab-paired
---

# Two importers in one tree, one gate in the right place

The desktop app writes two document formats of its own, and both carry a
generation stamp, so the first half of the technique (the stamp goes in the
document) was already true. The version witness is the tree's own
`rust-toolchain.toml` pin, `channel = "1.96.1"`.

The single-agent export (`.persona.json`) is read the way the technique asks.
`src-tauri/src/commands/core/import_export.rs` reads `version` from the untyped
JSON value, refuses a version above its own, walks one up-migrator per
generation, and only then deserializes into the typed struct
(`src-tauri/src/commands/core/import_export.rs:89 "if version > u64::from(CURRENT_SCHEMA_VERSION) {"`,
then `src-tauri/src/commands/core/import_export.rs:107 "serde_json::from_value(value)"`).
A test fails CI if the constant is bumped without a real migrator for the
generation below it.

The full portability bundle was read in the opposite order. Up to personas
`787fd2bd08`, `src-tauri/src/commands/core/data_portability/flow.rs`
deserialized the whole typed bundle first and checked `format_version`
afterwards. Both readers belong to one team, and the rule was written correctly
once and in the wrong order once. The fix (personas `48f47dd4d`) moves the
gate ahead of the parse
(`src-tauri/src/commands/core/data_portability/flow.rs:149 "check_bundle_generation(&raw)?;"`)
over a declared list
(`src-tauri/src/commands/core/data_portability/flow.rs:93 "const READABLE_FORMAT_VERSIONS: [u64; 2] = [2, 3];"`).

## The structural fact

A generation bump is a shape change by the format's own contract. The persona
importer's header lists what forces a bump: removed or renamed fields, changed
meaning, new required fields, changed nested shapes. So a version gate that runs
after the typed parse only ever sees the newer documents that did not need a new
generation. Every bundle that really is from a newer release fails earlier, at
whichever field its new shape breaks first, and the user reads a serializer
message. The gate existed and looked correct, and it could not fire in the case
it was written for. No test could tell this order from the right one, because
every existing test fed it a bundle of a generation it reads.

## The paired comparison

The target is how many newer-generation bundles are refused with a message that
names the version and says a newer release wrote the file. The floor is the
module's existing test suite, which must stay green. The input was four
newer-generation fixtures and one unstamped file, fed to the real import entry
point in both arms.

| fixture | A: gate after the typed parse | B: gate over the untyped value |
|---|---|---|
| v4, same shape as v3 | `Unsupported format version: 4 (expected 2 or 3)` | refused: written by a newer version (4) |
| v4, a section renamed | `missing field 'personas'` | refused: written by a newer version (4) |
| v4, scope restructured | `unknown variant 'kind'` | refused: written by a newer version (4) |
| v99, envelope only | `missing field 'exported_at'` | refused: written by a newer version (99) |
| no stamp | `missing field 'format_version'` | named: no format version, not a bundle |

Target: 0 of 4 in A, 4 of 4 in B. Arm A reached the gate for only one fixture,
the one that did not change shape, and even that message did not tell the user
what to do. Floor: 55 of 55 module tests green in B (53 existing plus the two
new ones). The v2 and v3 round trips are unchanged. The message reaches the
screen as-is: the import hook shows the error string, with a generic "import
failed" only as the fallback.

## What the realization does and does not do

The change is one function over the untyped value with the three refusals the
technique names (no stamp, newer, older and no longer read) and an explicit list
of readable generations (2 and 3). The typed parse then runs over the same value.

It does not add an upgrade path. Generation 1 portability bundles are refused,
as before, by an explicit statement rather than a migrator, and the technique
allows that: "we read 2 and 3" is a stated limit. It does not add a corpus of
real bundles from each generation opened on every build. The fixtures are
hand-written envelopes, so the support claim for 2 and 3 still rests on
round-trip tests of bundles this build writes, not on bundles older builds
wrote. That corpus is the technique's operator instrument and the tree does not
have one yet. Inside the readable range the reader does not branch on 2 versus
3. Generation 3 only adds optional sealed sections, which the reader treats as
content. The stamp matters at the boundary of what a build can read, not as a
branch inside it.

The persona importer has the right order but only half of the refusal. Its
message gives the number and the importer's ceiling, and it does not say that a
newer release wrote the file
(`src-tauri/src/commands/core/import_export.rs:91 "Unsupported bundle version: {version}. Current importer supports up to {CURRENT_SCHEMA_VERSION}"`).
That message cannot reach a user yet. The single-agent format is still at
generation 1, so no newer file of it exists. It becomes a seam at the first
bump.
