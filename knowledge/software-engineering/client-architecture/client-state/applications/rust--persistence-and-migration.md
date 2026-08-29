---
layer: application
type: application
subject: client-state
technique: persistence-and-migration
stack: rust
status: forged
verified_on: 2026-08-29
verified_against: rust@1.97
---

# Persistence and migration — a desktop backend's file contract

*Verified against the project tree at `58cf9557f` (the Tauri backend of a
React desktop application; `rustc 1.97.1`, `rust-version = "1.80.0"` in
`src-tauri/Cargo.toml:115`).*

The technique is written from the browser's side of the boundary, where the
payload is a preferences blob and the storage is a profile. This tree
realizes the same contract one process over: a Rust backend that owns three
independently versioned artifact families on disk, and a frontend that
receives the payload after the backend has already decided whether it is
allowed to mean anything. The interesting findings are where the file-shaped
case disagrees with the technique's default, and where the two sides of the
IPC boundary each assume the other validated.

## One classifier, four families

`src-tauri/src/commands/artist/schema_policy.rs` is the technique's "the
contract has one author" rule applied to the *policy* rather than to the
storage code. Its module comment (`:1-44`) names the artifact families —
saved compositions, autosaves, transcript sidecars, a fetched roadmap payload
— and the incident that produced the module: "bumping the version on one
surface could brick another, with no shared vocabulary for 'is this drift
safe to accept?'". The whole policy is a three-arm enum
(`SchemaCompatibility`, `:51-62`) and a nine-line comparison (`classify`,
`:74-81`) that every reader is required to call; `transcribe.rs:34-40`
restates the obligation at the writer ("MUST call
`super::schema_policy::classify` rather than rolling its own version check").

The numeric scheme is a monotonic `u32` per family — "we don't encode semver
here because the artifacts are local files, not a public API" (`:66-72`) —
which is the technique's "one version for one payload, separate payloads
with separate chains" rule chosen deliberately rather than inherited.

## The versioned shape, in the file

`persistence.rs:30-45` is the wrapper: `schema_version` written **inside**
the payload beside the data, a `saved_by` build stamp marked "diagnostic
only" (`:37`), and the composition itself held as a raw JSON value so that
"older payloads that don't parse as the current shape can still be loaded
and inspected before a migration step" (`:41-44`). The version travels with
the data, the storage key (the user's own file path) is the address, and the
two evolve independently — the technique's central clause, realized in a
struct definition.

Write-path hygiene is complete on the atomicity axis. `atomic_write`
(`:305-321`) is write-then-rename, and its comment (`:296-304`) adds a
clause the technique does not state: the temporary file's suffix is
per-call (a fresh UUID), because "an explicit `save_composition` racing the
autosave timer over the same file" would otherwise collide on one staging
path — "the atomic-rename guarantee only protects against crash-mid-write,
not against concurrent staging." Two writers of one file need distinct
staging names before the rename buys anything; that is an upward lesson
for any tree where a user save and a debounced autosave share a target.

Both write commands (`:76-102`, `:151-176`) parse the incoming payload as
the current shape and re-serialize it rather than writing the caller's
string, "so corrupt payloads can't reach disk" (`:81-83`). Validation at
the write door, once, for both surfaces.

## Where this tree disagrees with the technique — and is right

The technique says of a payload from the future that "preserve-and-default
is usually right". `schema_policy.rs:27-30` says the opposite: "Newer than
current → reject." Both are correct, and the disagreement is about payload
class, which the technique did not name before this tree was read.

A user's composition file (`artist_load_composition`, `:107-147`) is a
**document**: there is no default state to run on instead — an editor that
opened a newer file "on defaults" would present an empty composition under
the user's filename. The correct move is the one at `:130-135`: refuse, and
say so with both versions in the message ("saved by a newer app version
(schema v{}, this app supports up to v{})"). Crucially, refusal never
writes: the newer file stays byte-identical for the build that can read it.

The autosave (`artist_load_autosave`, `:181-230`) is **state**, and there
the tree takes the preserve-and-default path the technique describes: a
newer autosave is ignored with a warning (`:211-218`), and the session starts
fresh. What it does not do is protect the newer payload from the next
debounced write — the older build's first composition change overwrites
`autosave.json` with its own version. The file declares this acceptable
("best-effort", "the user just loses the autosave once", `:8-10`,
`:197-200`), which is an honest recording of a deliberate loss; the
sibling React application of this technique found the same overwrite in a
layout store where it was *not* declared, and had to make the write-through
inert. The difference between the two is not the code, it is whether the
loss was chosen and written down. Resolved 2026-08-29 (personas commit
`3ed7a9675`): the autosave write path now checks the on-disk version first,
so an older build no longer overwrites a newer autosave — the declared
loss is withdrawn rather than merely documented.

## Gaps against the technique

- **The migration chain has zero steps.** Every reader's
  `OlderNeedsMigration` arm (`persistence.rs:120-129`, `:204-210`) loads
  the raw value permissively and logs the drift; `schema_policy.rs:32-37`
  says as much ("until a migration step lands ... loaded permissively as
  raw `serde_json::Value`"). The seam is right — the value is kept raw
  precisely so a step can be inserted — but "each step is total over its
  input version" is currently vacuous, and the first bump of
  `CURRENT_SCHEMA_VERSION` (`:47`) will ship a v1 file into a v2 parser
  with no transformation between them.
- **The narrowing happens on the wrong side of the boundary.** The backend
  validates on *write* and hands the frontend a string; the frontend
  adopts it with a type assertion —
  `src/features/plugins/artist/sub_media_studio/hooks/useMediaStudioPersistence.ts:171`
  and `:281`, `JSON.parse(...) as Composition`. For a `Match` payload that
  is redundant with the write-side check; for an `OlderNeedsMigration`
  payload it is the only check, and it observes nothing — a gate over a
  proxy, which the sibling rehydration-narrowing technique names as the
  failure. The permissive load is safe only because the chain has never
  needed a step. Resolved 2026-08-29 (personas commit `e52dc8e02`): the
  frontend now runs a membership guard over the parsed value instead of
  the bare `as Composition` cast.
- **A corrupt autosave and no autosave are the same value.** `:190-195`
  returns `Ok(None)` for an unparseable file after a `tracing::warn!`, and
  the command's own doc says the frontend "uses that as the 'fresh session'
  signal" (`:178-179`). The diagnostic exists in the backend log; across
  the IPC boundary "your last session could not be restored" and "nothing
  to restore" have collapsed into one value, which is the distinction the
  technique's "loudly" clause exists to keep.
- **One family's reader is not yet under the policy.** `schema_policy.rs:12-15`
  records that the transcript sidecar has no consumer-side version check —
  callers "accept any shape that happens to deserialize" — so the obligation
  written at `transcribe.rs:38` is a promise to future readers, not a fact
  about current ones.
