---
layer: application
type: application
subject: agent-memory
technique: consolidation
stack: rust
verified_on: 2026-08-30
verified_against: rust@1.97
---

# Consolidation in the companion brain (Rust)

The repo runs the technique twice over one belief store: a **manual,
review-gated pass** (`src-tauri/src/companion/brain/consolidation.rs`) and a
**pressure-triggered sleep cycle** (`src-tauri/src/companion/brain/sleep_cycle/`,
a module directory since this application was first written — `mod.rs` holds
the header quoted below, with `admission.rs`, `pressure.rs`, `phases.rs`,
`apply.rs`, `limits.rs` and `prompts.rs` splitting the phases out).
Both distill episodes from `src-tauri/src/companion/brain/episodic.rs` into
facts via the same writers in `src-tauri/src/companion/brain/semantic.rs` —
the one-door property realized as shared functions, not shared discipline.

## The batch pass and its window

`run_consolidation` (`consolidation.rs:144`) reads an 80-episode window
(`EPISODE_WINDOW`, `:40`) plus up to 200 existing facts, and asks an ephemeral
reasoning session for a JSON envelope of proposals. Every structural rule the
standard states appears literally in the prompt (`:840-860`):

- provenance is mandatory — "Every proposal must cite at least one source
  episode_id … If you can't cite, you can't propose" (rule 1), enforced again
  in code: `raw.sources.is_empty()` skips the proposal with a warn
  (`:217-220`) — and, re-checked 2026-08-30, the contract has since **become a
  door**: `semantic::write_fact` now *returns an error* on empty sources
  ("semantic fact rejected: at least one source episode_id is required",
  `semantic.rs:92-95`) rather than merely documenting the requirement on
  `FactInput` (`:79-80`). Prompt rule, caller check, and writer rejection —
  three layers, with the innermost one no longer advisory;
- supersede-don't-overwrite — rule 3 requires `supersedes_id` on updates and
  says "Don't silently overwrite"; rule 4 makes an unresolved conflict its own
  proposal kind (`contradict`) with the probable direction argued in
  `rationale`, rather than a silent pick;
- transcript-altitude refusal — rule 5: "Do NOT include conversational
  ephemera as facts. 'User asked X today' is an episode, not a fact." The
  sleep cycle states the same rule in its own prompt
  (`sleep_cycle/prompts.rs:61`) — the one place the two passes duplicate
  wording instead of sharing it.

The window deliberately reads **conversation only**
(`list_recent_conversation`, `:172`): fleet correlator rows were 57% of
episodic memory, and feeding them in produced "30 'facts' that are 70-day-old
fleet statistics" (`:167-171`) — the transcript-is-not-memory failure measured
on a live brain.

## The distiller's output is untrusted

`validate_supersedes` (`:276-303`) is the standard's untrusted-output rule in
one function: a model-proposed `supersedes_id` must resolve to a live fact
(`kind='fact'`, `importance>0`) in the same scope before `apply_item` may
demote anything — "a hallucinated or unrelated id would silently zero out an
arbitrary fact's importance, defeating the human-review step" (`:271-275`). The
scope clause is enforced separately and reported separately (`:295`, `:298`),
so "wrong scope" and "not a live fact" are two distinct refusals rather than
one opaque one.

The sleep cycle applies the same posture wholesale: episode bodies ride inside
nonce-tagged untrusted fences, and every id the model hands back is checked
against the database before any write (`sleep_cycle/mod.rs:77-82`,
`sleep_cycle/prompts.rs:1-15`), the nonce mirroring the engine's own
`generate_runtime_nonce` rather than inventing a second fence.

## Dedup as reinforcement

`apply_item`'s ml arm (`:304-397`; the non-ml build is a separate `apply_item`
at `:399`) runs `semantic::find_near_duplicate` (`:350`) before writing; a close match folds the new evidence into the existing fact via
`reinforce_fact` (importance +1 capped, `last_seen_at` bumped, sources
appended — `reinforce_fact`, `semantic.rs:300-320`, whose doc states the
provenance contract it must not break: "every reinforce path adds at least one
source") instead of minting a duplicate row. Skipped when the user marked
supersedes (deliberate replacement ≠ duplicate), and
best-effort — a dedup failure falls through to a normal write rather than
breaking the pass (`:350-357`).

## Pressure, not the clock

The sleep cycle's header (`sleep_cycle/mod.rs:23-56`) is the cadence section of
the standard with measurements attached: trigger on accumulated conversation
volume (`PRESSURE_THRESHOLD_CHARS`), clock only as floor (`MIN_INTERVAL_HOURS`)
and staleness release (`STALENESS_HOURS`); "one boundary, one predicate, one
read" — admission measurement and compress window are literally the same
`Vec<Episode>`; and drain-forward — compress consumes oldest-first and records
`consumed_through`, so a truncated heavy day becomes the next cycle's oldest
material instead of orphaned residue (the predecessor took newest-N and had
exactly that bug, `:48-56`).

## The review lanes

Manual proposals land as `companion_consolidation_item` rows in `pending`;
nothing touches the belief store until `apply_item` (with operator edits,
`:304`, `:399`) or `reject_item` (`:447`) resolves them, each guarded by an
explicit `status != "pending"` refusal (`:311`, `:405`, `:453`) so a
double-apply is an error rather than a second write. **Drift found on
re-verification: `discard_run` is gone** — the run-level "reject this whole
pass" affordance no longer exists anywhere in `brain/`, leaving per-item
resolution as the only lane. The standard does not require the bulk door, but
its removal means a bad pass is now retired one row at a time.

The sleep cycle auto-applies its capped compress output (≤12 facts/cycle)
through the same writers — the auto-commit lane — but keeps forgetting
**report-only** and taxonomy expansion **propose-only**
(`sleep_cycle/mod.rs:60-75`), matching the governance tiering: observations
flow, vocabulary and forgetting wait for a human. The report-only half is
computed through the *same* selection the enforcing prune uses
(`consolidation::low_value_prune_candidates`), so the preview cannot disagree
with the enforcer; and the caps are declared with their accounting — "every
drop appears in `stats_json` and in the report", because "a cycle that does
less but reports truthfully beats one that does more silently", which the
header ties directly to the 30 stale facts recited as current for 70 days
"while no instrument noticed".
