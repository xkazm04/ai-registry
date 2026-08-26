---
layer: application
type: application
subject: agent-memory
technique: decay-and-forgetting
stack: rust
verified_on: 2026-08-26
verified_against: rust@1.97
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
