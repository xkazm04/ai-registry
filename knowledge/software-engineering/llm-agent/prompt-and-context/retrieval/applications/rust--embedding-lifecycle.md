---
layer: application
type: application
subject: retrieval
technique: embedding-lifecycle
stack: rust
verified_on: 2026-10-31
verified_against: rust@1
---

# Embedding lifecycle: stamps, guards, and the backfill that closed the loop

Two vector corpora live in the repo — the companion brain
(`src-tauri/src/companion/brain/embeddings.rs`) and the knowledge bases
(`src-tauri/src/commands/credentials/vector_kb.rs`) — and they implement the
same lifecycle with two different guard shapes, both compliant.

## Stamping at the single write door

`embed_and_store` (`embeddings.rs:127-156`) is the companion's one vector
write path: embed, assert dimensions (`:135-140` — a vector of the wrong
width is an error, not a coercion), insert the blob, then stamp
`embedding_model` + `embedding_dims` on the owning node (`:151-154`). The
comment records why the stamp lives *here*: one kind used to stamp at insert
and another didn't; stamping at the shared door "covers ALL callers
uniformly" and is an idempotent no-op when already stamped. Knowledge bases
stamp at *corpus* granularity instead — `embedding_model`/`embedding_dims`
recorded on the KB row at create time — because a KB is single-model by
construction.

## Guard on read — two shapes

**Per-row exclusion (companion).** `apply_model_guard`
(`embeddings.rs:69-101`) runs inside `search_similar` (`:374`): look up the
stamps of the actual hit rows, drop mismatches via the pure
`filter_by_model` (`core/src/retrieval/mod.rs:96-110`), count and `warn`
every exclusion — never silent — and feed a process-cumulative counter
(`MODEL_GUARD_EXCLUDED`, `:52`) so drift is a queryable number, not a vibe.

**Whole-corpus refusal (KB).** `kb_search` (`vector_kb.rs:933-955`) compares
the KB's recorded model *and dimensions* against the loaded embedder and
refuses with an instruction naming both models and the remedy ("Re-index the
knowledge base to search it"). The comment carries the provenance of the
bug that earned it: the stamps "were never re-read on search", so a default-
model change "silently embedded queries with the wrong model — either a hard
dimension error or, worse, plausible-but-wrong neighbours" (bug-hunt
2026-06-07). The guard now reads the stored stamp on every search — the gate
sees its target, not a config flag.

**Grandfathering, documented and tested.** `filter_by_model`'s doc
(`core/src/retrieval/mod.rs:83-90`) states the dated historical claim that
justifies keeping unstamped legacy rows: "the app has only ever shipped one
embedder... so an unstamped row IS a current-model row", making the guard's
introduction zero-behavior-change. The test
`model_guard_excludes_foreign_model_but_keeps_null_and_current`
(`embeddings.rs:479-514`) pins all three cases: current kept, foreign
dropped and counted, legacy-NULL kept.

## The backfill that made the guard's advice executable

`reembed_missing` (`embeddings.rs:278-343`) exists because the guard's
warning said "re-embed the brain to restore them" while, as its doc admits,
that was "an instruction nothing in the codebase could carry out until this
function existed" — vectors were written exactly once, at live-write time,
so imports, restores, and embedder-outage writes degraded recall
*permanently and silently*. The backfill:

- selects candidates by the same two predicates the guard enforces — no
  vector, or a stamp ≠ current model (`reembed_candidates`,
  `embeddings.rs:205-246`), and deliberately leaves grandfathered NULL-stamp
  rows alone ("re-embedding it would be churn rather than repair");
- deletes any existing vector row before inserting (`:311-318`) so a re-run
  stacks nothing — "a second run finds nothing to do and reports
  `embedded: 0`", the idempotence test at `:523-538`;
- reads "no vector table has ever existed" as *nothing is vectored* rather
  than as an error (`:211-218`, test at `:473-481`) — the import/fresh-box
  state is a backfill trigger, not a crash;
- logs progress per batch and a final embedded/skipped count with the model
  name (`:290`, `:326-341`).

The selection rule is compiled and tested under both feature sets even
though only the ml build can act on it (`:205-215`) — "the part with actual
room to be wrong" stays testable without the model dependency.

## Absence as a mode

The non-ml build compiles `search_similar` to an honest empty
(`embeddings.rs:389-396`) and the whole recall path falls back to the
keyword + always-include lanes (`retrieval.rs:468-600`) — the labeled
degraded mode, not an exception. `ensure_vec_table` (`embeddings.rs:105-120`)
latches readiness only on *success* (an atomic, not a run-once), after a
run-once variant cached a transient failure as done and "silently broke all
vector recall" for the process lifetime.

## Where it stops short of the standard (kept as standard; noted)

- **The kind-scoped scan bypasses the model guard.** `search_similar_kind`
  (`embeddings.rs:389-413`) returns its rows directly — `apply_model_guard`
  is called only from `search_similar` (`:374`). After a model swap, the
  dedicated doctrine lane would keep serving foreign-model neighbours that
  the main lane correctly excludes.
- **The companion's degraded mode is unlabeled at the consumer.** The
  fallback runs and logs, but the recall bundle handed to the prompt builder
  does not say which lanes produced it — lexical-only output is priced as
  full-hybrid by the consumer.
- **No steady-state drift surface.** `model_guard_excluded_total`
  (`embeddings.rs:55-59`) is written but exposed nowhere (`#[allow(dead_code)]`);
  the exclusion count reaches an operator only if they read logs at the
  moment of exclusion.

## Re-checked 2026-10-31

Re-checked 2026-10-31 at personas@61029d7ae0, against the 2026-08-18 state
(b72f6914bd), where every anchor above held. The stamping door, both guard
shapes, the grandfathering doc and its three-case test, the backfill's
selection, delete-before-insert and logging, and the success-latched
`ensure_vec_table` are unchanged; their anchors above are updated to HEAD.
What changed:

- **The non-ml stubs are gone.** The 2026-08-21 purge of unreachable commands
  (4bf1845d70) removed the `#[cfg(not(feature = "ml"))]` twins, including the
  empty `search_similar` cited at `embeddings.rs:389-396`; every item in the
  module is now `ml`-only. Absence is still a mode, one frame up: the non-ml
  `retrieve` delegates to `retrieve_keyword` (`retrieval.rs:468-475`).
- **The selection rule is no longer compiled and tested under both feature
  sets.** `reembed_candidates` is now `#[cfg(feature = "ml")]`
  (`embeddings.rs:204`), and the three selection tests the backfill section
  cites (the missing-table case at `:473-481`, the idempotence case at
  `:523-538`, and the foreign-model case at `:484-521`) were deleted in the same purge. The
  doc comment still says "Compiled under both feature sets" (`:195-197`), so
  the code now contradicts its own comment, and the selection rule has no test
  in any build.
- **The second deviation is resolved.** Since 2026-08-26 (b41f6f4bc7) the
  recall carries a `RecallTrace` that labels each item's lane, and the keyword
  path reports `floor: None` (`retrieval.rs:580-588`), so lexical-only output
  is no longer indistinguishable from full-hybrid at the consumer.
- **The third deviation is resolved.** The `#[allow(dead_code)]` is gone and the
  brain health snapshot reports `model_guard_excluded` (`health.rs:212`,
  `:217-226`), with a degraded stage when it is non-zero (`health.rs:446-453`).
- **The first deviation still holds.** `search_similar_kind`
  (`embeddings.rs:389-413`) still returns its rows without `apply_model_guard`.
