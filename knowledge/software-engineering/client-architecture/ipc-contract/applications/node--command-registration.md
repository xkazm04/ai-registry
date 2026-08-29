---
layer: application
type: application
subject: ipc-contract
technique: command-registration
stack: node
verified_on: 2026-08-29
verified_against: node@24
---

# Registration parity gates over a Tauri dispatch table (Node tooling)

The repo's dispatch table is one `generate_handler![]` block, ~1,900 lines
inside `src-tauri/src/lib.rs` (`lib.rs:177`, wrapped in
`ipc_auth::wrap_invoke_handler`). Three Node scripts and one Rust structural
test guard its parity with the other sets; between them they cover every
pairwise difference the technique names except the permitted set, which
this transport grants by default.

## D ≡ R and I ⊆ R: the contract checker

`scripts/check-command-contract.mjs` derives D from the generated name union,
R by parsing the registration block, and I from every wrapper call site, then
reports `missing from generated` / `stale in generated` (`:248-249`) and
invoked-but-unregistered names not covered by the forward-reference
overrides. The forward-reference list obeys both covenants: an override whose
handler is *implemented* but unregistered fails (`:260`, `:283-286`), and
`scripts/generate-command-names.mjs:265-290` auto-prunes overrides the
moment they appear in R. Parameter parity — payload keys versus the
handler's required, non-injected parameters — runs in the same pass
(`:290-311`), with dynamic payloads counted as unanalyzable rather than
guessed at.

## The direction nobody guarded: defined but never registered

`scripts/check-command-registration.mjs` (`:1-15`) records the hole its own
existence closed. The Rust structural test in `lib.rs` (`:2217`) guarded
*one* direction — a registration naming a function that does not exist —
and by 2026-08-21 the tree held **73 `#[tauri::command]` functions defined
and never registered**: "an IPC surface each one advertises and none of them
has. Zero were reachable from the frontend, so nothing was broken at
runtime; that is precisely why it went unnoticed." This is the technique's
D − R class, caught from the definition side rather than the generated side.

The gate's shape is worth copying:

- **Both sets come from walks, not files.** Definitions via
  `discoverCommandDefinitions` (`scripts/lib/rustCommandDefs.mjs:142`),
  registrations via `discoverCommandNames` — both walk `src-tauri/src/`
  rather than naming `lib.rs`, because `lib.rs` "is about to be decomposed"
  and a file-anchored parser dies with the split (`:19-26`).
- **Extract once and share.** The registration walk is *imported* from the
  generator (`:41`), not re-implemented — the technique's "one authority per
  derivation" corollary, stated in the header as "Writing a third parser in
  Rust would be the third parser."
- **Instrument floor.** `MIN_DEFINITIONS = 1400` (`:56-59`) against 1,656 at
  the commit that added it; below the floor the run fails as "matcher
  broken", because "an empty definition set makes EVERY orphan disappear,
  which is a green run that means nothing" — the same floor the generator
  carries as `MIN_COMMANDS` (`generate-command-names.mjs:85`, `:231`).
- **Two-sided allowlist.** `scripts/command-registration-allowlist.txt` fails
  on a new orphan *and* on a listed name that stopped being one (`:29-36`,
  `stale` at `:97`). The file is now **empty on purpose** (allowlist header):
  of the 73, 12 carried a false `#[tauri::command]` attribute and were
  stripped, 60 were deleted outright, and exactly one was registered —
  the only entry with a live consumer, a test-automation spec invoking it by
  name. The empty baseline is kept because it *states* "zero orphans is the
  standard", and removing it would make the next orphan a silent first.

## The generator's parser, un-accidented

`generate-command-names.mjs:15-40` documents the three things wrong with the
single-regex, single-file parser the sibling drift application recorded as a
live deviation: it hard-coded the file, it hard-coded the call shape (matching
`wrap_invoke_handler(` only because it happens to end in `invoke_handler(`),
and it assumed one list — so a registration split across two
`generate_handler!` blocks would have emitted a *shorter* file that still
type-checked. The rewrite scans every non-test `.rs` file, bracket-matches
each block, unions them, and pairs the union with the `MIN_COMMANDS` floor
so a dropped block fails loudly instead of shrinking the vocabulary.

## Registration is not the last gate on this transport

Tauri 2 puts a capability list in front of the dispatch table. This app's
own commands are allowed by default (no `allow-<command>` entries in
`src-tauri/capabilities/default.json`; the eight grants there are plugin and
window permissions), so R − P is empty by regime rather than by check — and
the moment the app narrows its grant, the parity gates above will stay green
over a set the transport refuses. The near side already met the other half
of this: `src/lib/network/p2pCapability.ts:1-36` records that feature
sensing used to substring-match `"not found"` / `"not allowed by the scope"`
and was "wrong in both directions"; its replacement classifies
*structurally* — an `AppError` envelope means the handler ran, a bare-string
rejection means it did not (`classifyProbeRejection`, `:54-60`). That is the
technique's "not enveloped, therefore not a domain error" test, and it
deliberately stops there: unregistered and ungranted still land in one
verdict (`unsupported`), which is correct for a feature probe and would not
be for a diagnostic.
