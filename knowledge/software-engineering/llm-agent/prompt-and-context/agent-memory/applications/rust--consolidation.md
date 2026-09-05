---
layer: application
type: application
subject: agent-memory
technique: consolidation
stack: rust
verified_on: 2026-08-30
verified_against: rust@1.97
applied: simulation
ab_verdict: not-better
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

## Recency in code, tested on the memory-year store (2026-09-04)

The technique's contradiction rule now inverts for a state-valued claim
restated by its own authority: compare instants in code, never weigh. This
tree has the seam and, unusually, has the data to test it — the simulated-year
harness under `evals/memory-year/` drove the sleep cycle through its production
legs for 102 cycles on 2026-09-03, and the store it built (536 facts, 128
supersede links) survived in the harness's working directory, beside the run's
per-probe verdicts.

**Seam.** The reconcile leg (`sleep_cycle/phases.rs`, `phase_reconcile`) lists
the live facts as `` `id` [scope/key] value `` with **no instant** in the
prompt (`prompts.rs:181-189`) and asks the model for a winner that "says it
better or more currently" (`:158-159`); `apply_supersedes` (`apply.rs:30-93`)
demotes whichever loser the model named. The compress leg lets the model set
`supersedes_id` on a new candidate (`prompts.rs:87`). Nothing in either leg
compares `created_at`.

**Measurable, chosen before running.** Three counts on the real rows: (1) of
the supersede links the model wrote, how many have a winner created *before*
its loser, and of those how many pair different values — the older state
beating the newer one; (2) of the reversal probes the run answered with the
old value, how many had the new value distilled into the store by probe time,
and of those how many hold it under a `fact_key` shared with a live old-value
row; (3) at year end, in every key group holding two or more live rows with
two or more values, whether the row each arm serves holds the ground truth.

**Arms.** A: the tree as run — the model weighs, the store keeps what it
demotes. B: for two live rows under one `(scope, fact_key)`, code closes the
older by `created_at`; the model is not asked.

**n and result.**

1. 128 links; 59 winners older than their losers; **0** of the 59 pair
   different values — every one is a restatement folded onto its first
   sighting (a heuristic flagged 10; each read by eye says the same thing
   twice). The reconcile leg never inverted a state change.
2. 11 wrong-old answers on 95 reversal and preference probes, 10 of them
   three days after the update. In **5** the store held no row asserting the
   new value at probe time — the update had not been distilled yet. In **6**
   it had; **4** of those share a `fact_key` with a live old-value row (host,
   two databases, a framework: old-value rows outnumber new 8:2 and 10:3) and
   B would close them; 2 do not (`atlas_db_migrated_to_mongodb` beside
   `atlas_database`; `communication_language_english` beside
   `language_preference_czech`) and B has nothing to join on.
3. 14 groups; the row A serves and the row B serves hold the year-end truth in
   all 14 — later rows carry higher importance in this store, so the column
   order and the instant order agree once the cycle has caught up.

**What the rows say about the rule.** The failure the flip describes — a
reinforced old value outweighing the authority's newer statement — did not
occur in this store's judgments (0/128). The wrong-olds are distillation
latency first (5 of 11, all within three days of the update) and recall
serving a majority of same-value rows second (6 of 11). B reaches the second
class only under a key the code owns, and the compress leg does not give it
one: the world's 44 state keys became **160** `fact_key`s (mean 3.6 per state,
max 9 — `atlas_database`, `atlas_db_postgres16`, `project_atlas_database`,
`atlas_database_postgres16`, `atlas_db_migrated_to_mongodb` for one column of
one project). A same-key instant comparison would have fired on 4 of 11
wrong-olds and stayed silent on 7.

**Verdict: `not-better`** as the rule reads. The condition it gains: *compare
instants in code* presupposes a key the code owns, and a distiller that mints
the key per cycle has to canonicalize it before any comparison exists to run;
and the rule does not touch the larger cause here, which is that the newer
statement is not yet a fact when the question arrives. **Falsifier:** re-run
the four shared-key probes (`p0029`, `p0030`, `p0047`, `p0048`) with the older
same-key rows demoted by instant and the answers still wrong-old — then the
majority is coming through the episode tier, not the fact tier, and B was the
wrong lever entirely. **Return condition:** a canonical-key step landing in
the compress leg, at which point count (2) becomes a code A/B on the harness.
