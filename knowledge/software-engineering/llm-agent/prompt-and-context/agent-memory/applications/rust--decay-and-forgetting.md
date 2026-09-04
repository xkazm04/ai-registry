---
layer: application
type: application
subject: agent-memory
technique: decay-and-forgetting
stack: rust
verified_on: 2026-09-04
verified_against: rust@1.97
applied: simulation
ab_verdict: better
proof: structural-only
---

# Decay, forgetting, and the third exit in the companion brain (Rust)

The repo runs the technique's importance model and its cap machinery over one
SQLite-backed belief store, and — as of the change this document was written
against — a third retirement path that the other two structurally could not
see.

## What existed: two axes, and the enumeration that was short by one

Before this change the store had exactly the two exits the technique names,
and no more:

- **Time-decay.** `decay_unused_facts`
  (`src-tauri/src/companion/brain/consolidation.rs:469`) decrements
  `importance` by `DECAY_DECREMENT` (`:49`) with a floor of 1, for facts whose
  `last_seen_at` is older than `DECAY_THRESHOLD_DAYS = 30` (`:48`), guarded on
  `last_decayed_at` so a re-run inside the window is a no-op.
- **Size caps.** `prune_low_value_facts` (`:716`) demotes to importance 0 —
  retrieval-ineligible, row and markdown retained — for rows above
  `MAX_FACTS_PER_SCOPE = 500` (`:62`), per scope, exactly as the technique's
  "caps are per category" section requires. The criteria live in one place
  (`low_value_prune_candidates`, `:664`) because the sleep cycle *reports* the
  same list it enforces, so "what we said we'd forget" cannot drift from "what
  we forgot".

Both read staleness. Neither can see a fact that named its own end date, and
the store had nowhere to record one: `companion_fact` carried `confidence`,
`supersedes_id`, `contradicts_id`, `last_seen_at`, `last_decayed_at` — and no
expiry column at all.

## The structural fact the tree reported back

The interesting confirmation is not that the column was missing. It is **which
signal was keeping expired claims alive.**

Decay keys on `last_seen_at`, which is bumped by *use*. A time-boxed claim is
maximally retrievable during precisely the window in which it is true — a fact
about the current quarter is what queries about the current quarter match — so
it accumulates recency exactly while it is valid, and then spends that recency
surviving the sweep after it stops being valid. The 30-day threshold does not
merely fail to catch these; it is *fed* by the mechanism that makes them wrong.
The golden path names the general form of this loop and requires the retrieval
bonus be bounded so the retirement floor stays reachable. This is the same loop
arriving through a different door — one where no bound helps, because the item
is not low-trust and never falls under any floor. Only a boundary read from the
claim itself can retire it.

That is a defect the code's shape produced without anyone designing it, and it
is better evidence for the amendment than the vendor schema that occasioned it.

## What the realization added

`retire_expired_facts` (`:550`) is the third exit, and it is deliberately the
dumbest of the three: no score, no threshold, no conjunction, because the item
already answered. It runs **first** in `maybe_run_lifecycle_sweep` (`:598`),
ahead of decay, so a self-dated fact cannot spend another window's recency.

- **Storage.** `companion_fact.expires_at` (`src-tauri/db/src/lib.rs:898`),
  `YYYY-MM-DD`, additive via the defensive ALTER block (`:654`) plus a partial
  index (`:670`). Pre-existing rows backfill to NULL, which is not a filler
  value — it is correct for every one of them, since none ever declared a
  boundary.
- **Extraction at capture, not at recall.** The compress prompt gains rule 2b
  (`sleep_cycle/prompts.rs:74`) separating *durable* from *forever*, and is
  told the current date (`:62`) — a relative boundary the model has to guess at
  is a boundary it will guess wrong.
- **Refusal over coercion.** `parse_expiry` (`sleep_cycle/apply.rs:326`)
  accepts an exact `YYYY-MM-DD` and nothing else; a bare month, a prose date
  and a full timestamp are all refused rather than rounded. This is
  [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) with
  unusually sharp teeth: an invented boundary silently deletes a true fact on a
  date nobody chose.
- **Demotion, not deletion.** Importance 0, with the SQL row, the markdown body
  and the provenance rows intact — the same posture the cap pass takes, so the
  store keeps one demotion semantics rather than two.

Comparison is `expires_at < today`, so a claim survives through the whole of
the last day it named.

## The distinction the tree forced

The technique says forgetting leaves a tombstone. This store shows that
"forgetting" is not one operation, and that the difference matters more than
the record does: **a deliberate, operator-issued forget must suppress
re-derivation of that key** — otherwise the next distillation pass reads the
same episodes and reverses the correction, silently, every night — **and an
expiry must do the opposite.** "On leave until October" closing is precisely
the moment a fresh fact under that key becomes learnable again. A store with a
single forget operation cannot express both, and collapsing them makes every
expiry permanent. The expiry lane here is written to stay clear of any
re-derivation block for that reason (`consolidation.rs:538` states the rule for
whoever adds the operator-issued lane).

## Confirmed, not added: decay must run on a path that actually runs

The technique's "decay runs on a path that actually runs" section is realized
here, and the comment on `maybe_run_lifecycle_sweep` records why it had to be:
both halves existed and neither had ever executed, reachable only from manual
commands and the tail of a consolidation run that had not happened in 77 days.
Every fact carried `last_decayed_at = NULL` and 70-day-old statistics were
being recited as current. The sweep is therefore invoked from the **recall**
path, throttled to once per `LIFECYCLE_SWEEP_MIN_INTERVAL_SECS = 6h` (`:573`)
with the slot claimed by compare-exchange before the work. Forgetting that only
happens when a human presses a button is not forgetting.

## What this realization cannot do

**It judges; it does not measure.** The whole lane is downstream of one
question — did the distiller notice that a claim carried a boundary? — and
nothing counts the times it did not. A fact that should have expired and was
written without a date is indistinguishable, in every table and every report,
from a fact that correctly has no boundary. That is an absence, and per
[coverage-instrumentation](../techniques/coverage-instrumentation.md) a listing
surface structurally cannot show one. Anyone copying this should expect the
recall improvement to be real and the *coverage* of it to be unknown until
something samples expired-eligible claims independently.

Two smaller bounds worth stating: the boundary is a date, so anything whose
validity ends on an event rather than a day ("until the migration ships") is
either mapped to a guessed date or, correctly, left unbounded — the prompt asks
for the latter. And the sweep is best-effort inside a recall turn: a failure is
logged and never blocks the turn, so an expiry can be late, never blocking.

## Verification standing

Written against commit `63c46ec97`, which is the change described here.

`cargo check` and `cargo fmt` clean. The DDL, the migration's
duplicate-column-is-success contract, and the sweep's row selection were
exercised against SQLite directly — unbounded, future-dated and same-day rows
survive, only the closed one retires, and a second sweep is a no-op.
`parse_expiry` was compiled standalone and is green on fifteen cases including
every refusal. The crate's test profile did not finish compiling inside the
run's time budget, so the committed unit tests are **unrun**; their assertions
are the ones proven standalone.

## The review window, tested against the tree's second store (2026-09-02)

The tree holds a second belief store beside the companion brain above: the
persona memory store, with tiers, a lifecycle pass and an LLM review pass —
and no per-item deadline. The technique's "a review window is not an expiry"
amendment was simulated against that store.

**What the tree has.** Candidates for the reviewer's "won't-use" pass come
from `get_archivable_candidates` (`src-tauri/db/src/repos/core/memories.rs:1392`):
`active` and `working` tiers, never `core` or `archive`, ordered
most-archivable first — low importance, low access, oldest — and bounded
by a limit. The reviewer's verdicts are `delete | keep | update_importance`
for curation and `synthesize | archive` for the reflection pass
(`memory_review_proposal.rs:32-34`). The lifecycle pass (`memories.rs:1991`)
promotes and archives by tier with a fixed thirty-day cutoff, and the
injection ranking (`memories.rs:1864-1870`) is the decay-aware score in
which importance strictly dominates a capped, hyperbolically fading access
term. The `core` tier is user-pinned and never decays — the protected
category, built. A separate claims table records `helpful | wrong |
outdated` verdicts on a memory and resolves them as `reverified |
deprecated | dismissed`. There is no column naming when a memory should be
asked about again; "aged" is a rank, not a deadline.

**Policy A** (as shipped): the reviewer sees the top of the archivability
rank each cycle. **Policy B** (the amendment): each memory carries an
expected-valid window assigned when written, clamped; the reviewer sees
memories past their own window; verdicts gain `extend` with an absolute
ceiling; a synthesized memory inherits the earliest source deadline and the
newest source's creation time.

1. *A time-scoped fact at high importance and fresh access* — the shape the
   technique's expiry section already names as invisible to score-based
   decay. Under A its rank keeps it out of every review batch for as long
   as it is being injected, which is exactly while it is stale. Under B its
   short window surfaces it at the deadline regardless of rank, and the
   verdict is a question, not a removal.
2. *A stable, low-access fact in `active`.* Under A it heads the
   archivability rank and is re-asked every cycle the batch reaches it;
   under B a long window means one question, then `extend`, then silence
   until the ceiling. The reviewer's per-cycle budget stops being spent
   confirming the same durable fact.
3. *A synthesized insight from the reflection pass.* Under A the new row's
   `created_at` is the synthesis time, so its age — and therefore its
   staleness rank — restarts at zero on merge, and a volatile detail folded
   into a stable insight is unreachable by review for the longest window in
   the store. Under B the merged row carries the newest source's creation
   time and the earliest source deadline. This is the case where the tree's
   structure argues for the amendment on its own: the merge already exists,
   and nothing about the merge preserves the sources' clocks.

**What would falsify the prediction:** the reviewer's keep-rate on
rank-selected candidates being no worse than on window-selected ones — that
is, the rank already surfacing the removable memories and case 1 never
occurring in practice. The tree's proposal rows carry `action` per
candidate, so both rates are measurable from history once a window column
exists for the comparison.

**Verdict:** `better`, filed as the project's next change — an
`expected_valid_days` column with a write-time clamp, a selector clause on
it beside the rank, `extend` as a proposal action, and the reflection pass
carrying the sources' clocks through `synthesize`. Return: the first two
review cycles under both selectors, compared on keep-rate.

## The operator-forget lane landed, in both stores (2026-09-04)

The distinction section above was written against a tree that had the expiry
exit and no operator-issued forget, and it left a note at
`consolidation.rs:538` for whoever added one. Both stores now have it, and
they converged on the same shape without sharing code.

**Companion brain.** `src-tauri/src/companion/brain/semantic.rs` deletes a
fact and writes a row into `companion_fact_tombstone (scope, fact_key,
value_excerpt)` inside the same transaction (`:450-482`); the doc comment
states the reason in the technique's words — the deletion removes the fact
but not the episodes, so the next cycle re-derives what was just deleted "and
the correction looks ignored." Consolidation consults the bar before it
re-derives (`:427-437`), and `sleep_cycle::apply` refuses first. A deliberate
explicit write under the key clears the bar as part of its own transaction
(`:184-188`), and there is no separate un-forget entry point, "deliberately
so: an unused one would be a second door" (`:422-423`). The test module
(`:621-790`) pins the contract: a deleted fact leaves a tombstone on its key;
a tombstone is scoped; an explicit write lifts it; forgetting twice refreshes
one row rather than duplicating; and the recorded value excerpt "is never
matched against — forgetting a key forgets the subject, and matching on the
value would let the next cycle re-derive the same fact."

**Persona memory store.** `src-tauri/db/src/repos/core/memories.rs` reaches
the same design from its own door: `delete` (`:1416`) tombstones the
`(persona_id, fact_key)` with the reason "memory deleted by user" as a
best-effort side effect that never fails the delete (`:1427-1444`);
`create_consolidated` (`:549`) counts a barred key as `skipped_tombstoned`
(`:600-612`) instead of writing, and the outcome vocabulary is
`created | updated | skipped_tombstoned | rejected`, so the skip is a counted
state rather than an absence. Two tests (`:3711`, `:3833`) assert that a
tombstoned key is skipped and counted and that a user delete tombstones the
key.

The technique's new section is the two stores' shared rule stated once. The
one place they differ is worth recording: the companion brain writes the bar
in the delete's transaction; the persona store writes it best-effort after
the row is gone, which is the ordering the technique's tombstone rule warns
about — a delete that commits and a bar that does not leaves the silent
relearn reachable for exactly one cycle.

## The cap ranks by a second model (2026-09-04)

`run_lifecycle` (`memories.rs:1987`) enforces `ACTIVE_CAP = 60` by keeping
the top rows under `ORDER BY importance DESC, access_count DESC, created_at
DESC` (`:2017-2027`) and archiving the rest, while recall and the decay
sweep in `src-tauri/db/src/memory_recall.rs` rank by `decay_score` (`:157`):
`importance × 0.5^(age/half_life) × (1 + 0.25·ln(1 + accesses)) ×
dispute_penalty`. Worked on the tree's own half-life table (`:118-129`):
a `fact` of importance 4, created 300 days ago and never accessed, scores
4 × 0.5^(300/90) ≈ 0.40; a `fact` of importance 3, twenty days old with ten
accesses, scores 3 × 0.86 × 1.60 ≈ 4.1. Under the cap's order the first
survives and the second is archived; under the store's own value model the
second is worth ten times the first. The cap is a janitor with a private
importance score, and the technique's cap clause now names it. A fourth
ordering, `get_archivable_candidates` (`:1391`), selects the reviewer's
batch by `importance ASC, access_count ASC, created_at ASC` — the same
disagreement on the review path, already recorded above as case 1.

Also read on this pass: `decay_score` treats an unparseable timestamp as age
zero (`:155-156`, `:165`), and `should_forget` (`:428-434`) returns `false`
for a row it cannot date. Together that is the pair the value-model technique
now corrects: a malformed instant ranks first and is exempt from the sweep.
The tree tolerates two timestamp formats (`parse_ts`, `:131-140`) precisely
because the table holds both, which is the condition under which a stricter
parser would pin a whole writer's rows to the top.

## Verification standing (2026-09-04)

Re-read against the checkout on `master` at `bf95ffb4b`, toolchain `rustc
1.97.1` (`Cargo.toml` declares `rust-version = "1.80.0"` as the floor). Every
citation above resolves; no code was changed and no gate was run. The
`expected_valid_days` column, the `extend` action and the source clocks through
`synthesize` filed on 2026-09-02 are not in `HEAD`; that return condition is
still open.
