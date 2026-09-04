---
layer: application
type: application
subject: agent-memory
technique: memory-value-model
stack: rust
status: forged
verified_on: 2026-09-04
verified_against: rust@1.97
applied: experiment
ab_verdict: unmeasurable
---

# One value model, two timestamp parsers, and the row nobody can date (Rust)

The persona memory store in this desktop app carries the technique's score as
one pure function that two consumers share, and it is the store the technique's
"unparseable instant" clause was rewritten against on 2026-09-04. This document
records what the live store actually holds, because the clause's premise — rows
in two timestamp formats — turned out to be a tolerance in the parser, not a
condition in the data.

## The score and its two callers

`decay_score` (`src-tauri/db/src/memory_recall.rs:155-172`) is

    importance × 0.5^(age / half_life(category)) × (1 + 0.25·ln(1 + accesses)) × dispute_penalty

with the half-life table at `:118-129` (`constraint` 365 days, `fact` 90,
`learned` 60, `context` 21, unknown kind → 60 — the technique's "unknown kind
gets a declared default" realized). Age anchors on `last_accessed_at` when set,
else `created_at` (`:159-162`), clamped at zero for a future instant (`:164`).
The two callers are `pack_by_budget` for recall and `run_decay_forgetting` for
the sweep (`:437-460`), which is the one-model rule the technique asks for; the
tier cap in `repos/core/memories.rs:2017-2027` is the exception, recorded in
[rust--decay-and-forgetting](rust--decay-and-forgetting.md).

## The parser tolerates two formats; the defaults are the pair the technique now rejects

`parse_ts` (`:131-140`) accepts RFC3339 and then SQLite's
`YYYY-MM-DD HH:MM:SS`, with the comment "tolerating both forms present in the
table (`create` writes RFC3339; SQLite defaults write the other)". When neither
parses, `decay_score` takes age 0 (`:165`, doc comment `:153-154`: "never
punish a row for a malformed timestamp") and `should_forget` (`:428-434`)
returns `false` for a row whose `created_at` it cannot read. That is exactly
the score-as-new plus sweep-exempt pair the technique's amended clause names.

The companion brain beside it has a second `parse_ts` of the same shape
(`src-tauri/src/companion/brain/sleep_cycle/parse.rs:105-112`), used by the
sleep cycle's admission gate (`admission.rs:18`) rather than by a score; its
comment gives the same reason ("a `companion_cycle` row can carry either").

## The A/B on the live store (2026-09-04)

**Seam.** The two defaults above, over the app's own database files
(`personas.db` for `persona_memories`, `personas_data.db` for `companion_node`
and `companion_cycle`), copied and read with the app untouched.

**Measurable, chosen before running.** Rows per timestamp format per table;
rows that would take the default under each arm; and where a row taking the
default would rank in the active set under each arm.

**Arms.** A: the tree as it stands — unparseable → age 0, exempt from the
sweep. B: the amended clause — age = one half-life of the row's kind, counted,
swept like any other row.

**n and result.** `persona_memories`: 42 rows, 42 `created_at` in RFC3339, 28
non-null `last_accessed_at` all RFC3339, 0 in the SQLite form, 0 unparseable.
`companion_node`: 762 rows, 762 RFC3339. `companion_cycle`: 3 rows, 3 RFC3339.
The `DEFAULT (datetime('now'))` clauses exist in the DDL
(`src-tauri/db/src/lib.rs:888-1024`, companion tables), but every production
writer binds an RFC3339 string; the only `datetime('now')` writes into
`persona_memories` sit inside the test module (`memories.rs:3554`, `:3588`,
after the `#[cfg(test)]` at `:2487`). Rows taking the default: **0 under A, 0
under B.** The two arms produce the same order on every row, so the flipped
clause cannot be told from the old one on this store today — the condition it
corrects is a parser tolerance with no rows behind it.

**Placement, walked on the real active set** (40 rows of one persona, ages 0.5
to 5.4 days against half-lives of 60-90 days). A row that lost its timestamp
would score under A at `importance × access_boost`: an importance-4 `fact` with
no accesses at 4.00, rank 24 of 41; importance 5 at 5.00, rank 21; importance 3
at 3.00, rank 33. Under B, halved: 2.00 → rank 40, 2.50 → rank 36, 1.50 → rank
41. The technique's "ranks above every correctly dated row" holds against an
*aged* store; in a five-day-old store every dated row is itself at age ~0 and
the malformed row lands mid-pack. What B changes here is the sweep exemption,
not the recall order.

**Verdict: `unmeasurable`.** The instrument is the one B adds and A
structurally lacks — a count of rows that took the default age. With it
reading zero, both arms are the same store. **Return condition:** that counter
reading nonzero (a writer emitting the SQLite form or a malformed instant into
either store), or the persona store ageing past one half-life, at which point
the placement walk above becomes a measurement.

## What this cannot show

The 42-row persona store is five days old and single-persona; the companion
store's 762 nodes are dated by one writer. Neither exercises a multi-writer
condition, and the "two formats" the parser guards against may well be real on
another machine's database that this reading did not see.
