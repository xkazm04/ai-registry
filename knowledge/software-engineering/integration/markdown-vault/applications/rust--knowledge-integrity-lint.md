---
layer: application
type: application
subject: markdown-vault
technique: knowledge-integrity-lint
stack: rust
verified_on: 2026-08-30
verified_against: rust@1.97
---

# Knowledge integrity lint over the Obsidian vault (Rust)

*Re-verified against the project tree at `a2ef6400e`. Two of the three tiers are
where they were; the third has been deleted from the product, and that is the
finding.*

The repo runs a deterministic syntactic pass
(`src-tauri/src/commands/obsidian_brain/lint.rs`) and a bounded repair pass
(`revitalize.rs`) against the operator's vault. Detection never mutates; repair
is a separate command with its own budget.

## The syntactic pass

`lint_vault` (`lint.rs:29`) is read-only by module contract ("Pure
read-only — never mutates the vault", `:6`) and emits a `VaultLintReport`
with the three defect classes:

- **Broken wikilinks** — a lowercased basename index is built at `:43`, and
  every link is resolved against it through the shared `extract_wikilinks` +
  `strip_alias_and_section` (`:91-94`), reported with source path and **line
  number** (`BrokenWikilink::line`, `:107`) — compiler-error ergonomics. Both
  extractor functions now live in `vault_fs.rs` (imported at `lint.rs:17`);
  the July extraction that unified the walkers took the link scanner with it,
  and `lint.rs:191-192` records that its unit tests moved to exercise the
  shared function directly.
- **Orphans** — notes never referenced, minus a declared exemption
  predicate: `is_likely_entry_point` (`:156-171`) exempts top-level notes
  and `README`/`index`/`00 `/`_index` names, and the heuristic is one
  named function beside the check, not scattered special cases.
- **Staleness** — mtime older than `DEFAULT_STALE_DAYS` (180, `:23`;
  `0` disables), reported with `days_stale` so the consumer sees the
  predicate's output, not a verdict.

The walk aborts on the first unreadable directory
(`collect_markdown_files`, `:142-150`) — `ErrorPolicy::Abort`, unbounded
depth — with the false-clean rationale written at the call site.

## The semantic pass was deleted, and the reason is the technique's

The 2026-08-18 pass of this file documented `semantic_lint.rs` as the judgment
tier: opt-in, token-billed, propose-only, input bounded three ways
(`MAX_NOTES_IN_PROMPT = 120`, `MAX_SNIPPET_CHARS = 320`,
`MAX_PROMPT_CHARS = 140_000`), finding types `Inconsistency`,
`MissingPageCandidate`, `ProposedLink`, `KnowledgeGap`. Every one of those
details was accurate, and the file is gone.

It was removed on 2026-08-21 in `4bf1845d7`, "delete 72 unreachable IPC commands
and everything they held up" — a sweep that deleted every `#[tauri::command]`
function that was defined but never registered, never called from the frontend,
and never called from Rust. `semantic_lint.rs` was one of six files the sweep
emptied entirely. The tier had been written correctly and never wired to
anything a human could press.

This is the strongest evidence available for the technique's claim that an
opt-in judgment tier's real failure mode is not a bad finding but never being
reached. The syntactic pass survived because a surface invokes it. The repair
pass survived because a surface invokes it. The tier with the most careful
operating contract in the module — bounded input, metered cost, propose-only
output — is the one that got deleted, correctly, on the evidence available to
the person deleting it. The correction has been carried upstairs as the
`absent-guard-is-loud` reading of the two-tier design; nothing about the tier's
*contract* was wrong.

## The repair pass

`revitalize.rs` runs an agentic CLI session *inside* the vault with the
technique's full repair contract:

- **Bounded**: `NOTES_PER_PASS = 40` soft budget in the prompt (`:43`);
  `REVITALIZE_TIMEOUT_SECS = 540` hard cap (`:39`), sized to stay under the job
  manager's ~10.5-minute stale-running sweep, with that reasoning at `:36-38`;
  one pass at a time app-wide ("A revitalize pass is already running", `:389`).
- **Goal-declared**: `RevitalizeOptions { prune_stale, merge_duplicates,
  refresh_structure }` (`:75-79`) — the pass refuses to start with zero goals
  (`:355`).
- **Fact-preserving rules in the prompt** (`build_revitalize_prompt`, `:121`):
  "Never invent facts. When merging, preserve every distinct fact from the
  source notes" (`:178`); user-authored daily/meeting notes kept intact unless
  exact duplicates; only `.md` inside the vault, never dot-directories.
- **Measured regardless of outcome**: `scan_vault_notes` (`:104`) runs before
  the pass and again after — explicitly "Measured regardless of outcome — a
  failed/cancelled pass may still have modified notes before it stopped"
  (`:460-462`) — and the run record stores both the model's self-reported
  `REVITALIZE_SUMMARY` counts and the measured before/after note/byte
  deltas, so self-report is reconciled against measurement.

## A predicate divergence worth naming

`graph.rs` computes its own orphan set (`obsidian_graph_list_orphans`,
`graph.rs:418`; `VaultStats::orphan_count`, `:482-495`) as "no
backlinks" with **no entry-point exemption**, while `lint.rs` exempts entry
points. Two features, two orphan counts, predicates differing by an
exemption policy — exactly the count-carries-predicate hazard the technique
warns about. Twelve days on, the divergence is unchanged: the counts are
internally consistent per surface and will still disagree with each other on
any vault with top-level index notes.
