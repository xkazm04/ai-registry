---
layer: application
type: application
subject: import-normalization
technique: import-validation
stack: rust
verified_on: 2026-10-31
---

# The workflow-import backend — caps with one authority, nonce fencing, and a staged commit door

The service half of the workflow-import pipeline:
`src-tauri/src/commands/design/n8n_limits.rs` (bounds),
`src-tauri/src/commands/design/n8n_transform/prompt_sanitizer.rs`
(sink sanitization for the model-transformation stage), and
`src-tauri/src/commands/design/n8n_transform/confirmation.rs` (the commit
door). Together they are the repo's fullest rendition of "an imported
definition is untrusted input".

## Confirmed against the technique

- **Caps defined once, enforced server-side, mirrored by codegen**
  (`n8n_limits.rs`): `MAX_WORKFLOW_JSON_BYTES` (5 MB, single raw export)
  and `MAX_TRANSFORM_PAYLOAD_BYTES` (10 MB, combined transform payload)
  live as Rust consts, exported to the client via ts-rs plus
  `scripts/generate-n8n-limits.mjs` → `src/lib/n8nLimits.generated.ts` —
  the one-authority pattern for a cross-boundary bound. The generator's
  header says CI verifies the generated file; no CI step does.
  `.github/workflows/ci.yml` checks drift only for
  `commandNames.generated.ts` (`:1404`) and the ts-rs bindings (`:1490`).
  What keeps the mirror honest is the `n8n-limits` task in the
  `predev`/`prebuild` codegen (`scripts/run-codegen.mjs:50`, `:100-101`),
  which regenerates the file before every build, CI's included. So the
  shipped bound cannot drift, but a stale committed copy is never flagged. The module doc *derives* both numbers (realistic
  exports under 200 KB; the transform cap must be ≥ 2× the session cap
  with headroom) and a unit test pins the 2× relationship
  (`transform_cap_must_exceed_workflow_cap`). A cap with its rationale
  recorded and its invariant tested.
- **Sink-aware sanitization at the model boundary**
  (`prompt_sanitizer.rs`): imported workflow text bound for a
  model-transformation prompt passes seven layers — length truncation
  (name 200 / JSON 50k / free text 10k), zero-width and non-BMP Unicode
  stripping (homoglyph defence), section-delimiter and role-override
  stripping, dangerous-tag removal via a single precompiled
  case-insensitive regex (the doc comment records that the previous
  per-tag loop was quadratic and "exploitable as a CPU DoS vector"), then
  **structural isolation**: XML boundary tags with a random 16-byte
  nonce, plus a canary instruction asking the model to report
  manipulation attempts. Structure over blocklists, per the module's own
  OWASP citation — the prompt-safety subject's doctrine landing as
  import machinery.
- **The client-side twin declares its purpose**
  (`src/lib/utils/sanitizers/workflowSanitizer.ts`): allowlist name
  characters, per-field length caps, and injection-pattern stripping
  shared with the variable sanitizer through one module "so the two
  sanitizers can't drift apart again" — a one-authority fix applied
  after a measured drift.
- **A staged receipt, and one transaction per import** (`confirmation.rs`):
  `create_persona_atomically` first inserts an `import_transactions` row
  in status `'staged'` (`:94-97`), then opens the real transaction for the
  persona plus its triggers, tools, and connector rows. Per-entity errors
  are collected into `EntityError { entity_type, entity_name, error }` so
  the frontend can render "3 of 5 tools failed: X, Y, Z — fix and retry".
  The receipt is written once at the end, `committed` (`:449-466`) or
  `rolled_back` (`:416-428`), with `entity_results` and `error_summary`.
- **Credentials as requirements, not values**: the commit returns
  `connectors_needing_setup: Vec<String>` — named, valueless slots the
  user fulfills through the credential flow afterwards. No secret-shaped
  value from the foreign file rides the import into the store.

## Where it diverges from the technique — honestly

- **The commit door is atomic only against total failure.** The doc comment
  on `create_persona_atomically` (`confirmation.rs:78-83`) says "If ANY
  entity fails, the entire transaction is rolled back and no partial
  persona exists." The code rolls back only when entities were requested,
  none were created, and errors were collected (`:406-437`, receipt
  `rolled_back`, "All N entities failed to create"). A partial failure
  commits the persona with the entities that succeeded, and the receipt is
  `committed` with `"N of M entities failed"` as its `error_summary`
  (`:449-466`). The per-entity error list is what a partial import
  reports, not what a rollback reports. Whether a half-built persona is the
  right outcome is a product choice; the comment that promises the
  opposite is the defect, because the next author will reason from it.

- **The receipt does not enumerate what was created.** `entity_results`
  stores only the *error* list, so every fully-successful import writes
  `'[]'` — measured on a live install at 155 of 155 rows
  (`docs/concepts/golden-paths/untrusted-definition-validation.md:590`;
  `portable-export-bundle.md:221` counts the same 155 as 145 committed and
  10 rolled back). The staged→committed skeleton is exactly right; the
  enumeration the technique demands (entities created, source, grades) has
  a column and no writer. Because partial imports commit, the gap is wider
  than an empty column: a committed partial import records which entities
  failed and never records which were created.
- **No loss ledger reaches this layer at all.** Nothing in the commit
  door knows which foreign nodes failed to map upstream, so the durable
  record cannot answer "why is this import missing behavior" — the
  disclosure chain ends at the wizard UI.
- **Draft normalization fills gaps silently but harmlessly**
  (`types.rs:63-77`): empty name/color/icon get defaults. Display-only
  fields, so this stays on the right side of the default-construction
  line — but it is the pattern to watch if semantic fields ever join the
  list.

## Re-checked 2026-10-31

Re-checked 2026-10-31 at personas@61029d7ae0. The caps, the derivation, the
2x test, the seven sanitizer layers with their limits, nonce and canary, the
client twin's drift comment, the `'staged'` receipt, `connectors_needing_setup`
and the draft defaults all read as described. Earlier versions of this
document called the commit door atomic, quoting the doc comment, and said CI
verifies `n8nLimits.generated.ts`, quoting the generator's header. Neither
held on 2026-08-18 either: the tree then (`fd720f929c`) had the same
rollback-only-on-total-failure branch and the same CI drift steps. Both are
corrected above.
