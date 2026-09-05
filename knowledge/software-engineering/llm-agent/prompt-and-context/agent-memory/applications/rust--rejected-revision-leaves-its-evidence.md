---
layer: application
type: application
subject: agent-memory
technique: rejected-revision-leaves-its-evidence
stack: rust
verified_on: 2026-09-04
verified_against: rust@1.80
applied: task
ab_verdict: better
proof: ab-paired
---

# A prompt-evolution loop that kept the count and lost the candidates (Rust)

The witness for the version above is the tree's own declared floor —
`rust-version = "1.80.0"` in `src-tauri/Cargo.toml:115` — not the toolchain that
happened to be installed when this was written. Storage is `rusqlite` 0.38 with
the bundled SQLite, declared at `:237`.

The tree runs a real instance of the loop this technique is about: a desktop
agent host that breeds variants of a persona's system prompt, scores them, and
promotes a winner. It is the cleanest available test of the technique's central
split, and it comes out on the technique's side — but the more useful half is
*where* the tree disagrees with itself.

## The record a completed cycle leaves

`evolution_cycles` (`src-tauri/db/src/migrations/schema.rs:1573-1587`) is
written by `complete_cycle`
(`src-tauri/db/src/repos/lab/evolution.rs:294-349`), and it is careful work:
both `UPDATE`s land in one transaction, with a comment explaining that a crash
between them would leave a cycle marked completed while the policy counters
never increment. The columns are `variants_tested INTEGER`, `winner_fitness`,
`incumbent_fitness`, `promoted`, and `summary TEXT`.

Against the technique's four required fields, that is:

| Technique asks for | Tree has |
| --- | --- |
| the target, by identity | yes — `policy_id`, `persona_id` |
| **the diff** | **no — nothing stores a tested candidate** |
| the score, with its predicate | the two fitness numbers; the split is implicit |
| the outcome, as a value | yes — `promoted` |
| *(explicitly not)* a reason | `summary TEXT` |

So the loop keeps three of four and adds the one the technique argues against.
A cycle that bred five variants and promoted none records that five *somethings*
were tried and that the best scored 0.61 against an incumbent 0.66. This is the
technique's `count-carries-predicate` clause biting on a real column:
`variants_tested = 5` cannot be joined to a candidate, a score, or an outcome.

## The structural fact: the tree already holds the opposite design

This is the part no reading of the standard would predict, and it is better
evidence than the gap itself. The project has a *second*, newer revision surface
— `LabAbExperiment`, `src-tauri/core/src/models/lab.rs:271-290` — and that one
carries `variant_prompt`, `variant_source`, and a `provenance_json` snapshot,
under a doc comment saying every row "carries its provenance ... so the
experiment is auditable back to the observation that motivated it." Its status
vocabulary is documented member by member.

But its `running` and `concluded` states are marked *"reserved for the deferred
canary-fitness loop"*. So:

- the surface that **keeps the diff** does not run;
- the surface that **runs, scores, and rejects** keeps no diff.

Nobody designed that. It fell out of two features landing at different times,
and it means the technique's rule is not a foreign import here — the tree
reached the same conclusion on its newer surface and has not carried it back.
That makes this coverage of an existing context rather than a new capability,
which is the whole of why it was shippable.

## The paired proof

Measurable: **candidate texts recoverable for a completed, not-promoted cycle
that reported `variants_tested = 3`.**

Both arms' DDL was applied to a scratch SQLite database with
`PRAGMA foreign_keys = ON`, the same three candidate prompts offered to each,
with arm A's schema read out of `git show HEAD:` rather than from a hand-edited
copy:

| arm | schema applies | recoverable |
| --- | --- | --- |
| A — as shipped | yes | **0 of 3** |
| B — with a variants child table | yes | **3 of 3** |

and the new table's constraints checked rather than assumed: the `outcome`
`CHECK` rejects an unknown value, the foreign key rejects an orphan,
`UNIQUE(cycle_id, variant_index)` rejects a duplicate, and `ON DELETE CASCADE`
reaps the children when the cycle is deleted.

**Arm A applying is the load-bearing part of that table.** An earlier run of the
same instrument returned 0 on *both* arms, because the schema's
`{{TRIGGER_TYPE_CHECK}}` placeholder — a `CHECK` member list, substituted at
bootstrap from the trigger enum — had been filled in as though it were a whole
predicate, so neither arm's DDL parsed. Two identical numbers meant the
operation had not run. A paired reading needs its arms proven live before its
difference means anything.

## What was shipped, and what was not

Step 1 only, on a branch: the child table, holding the candidate, its source,
its fitness, and an `outcome` stored as a value rather than inferred from
whether the incumbent changed — **with no `reason` column**, which is this
technique's specific prescription and the one place the design deliberately
declines to follow the existing surface's `summary`.

Two steps are unstarted and named in the project's own plan: a recording
function inside `complete_cycle`'s existing transaction, so a cycle cannot reach
`completed` while its variants are missing; and the breeding loop handing its
scored candidates to it, which is the only step that touches behaviour.

**The gate reached was the DDL, paired. `cargo check` was not run** — the change
sits inside a `const &str` in a worktree, so no Rust was compiled. That is why
step 1 stayed on a branch rather than merging: a table nothing writes to is half
a feature, and the honest place for it is behind the two steps that fill it.

## What this realization cannot show

Nothing here tests the technique's *consequence*. The claim that a loop without
a rejection record re-proposes what it already tried needs two cycles run
against an unchanged genome with their candidate sets diffed — which is only
possible after the write path exists. The tree's own falsifier is stated with the
plan: if the breeder is stateless by design and re-derives an identical set every
cycle regardless of history, persisting the variants buys auditability and not
convergence.
