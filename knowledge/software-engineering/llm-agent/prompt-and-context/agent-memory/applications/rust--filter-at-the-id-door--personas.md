---
layer: application
type: application
subject: agent-memory
technique: filter-at-the-id-door
stack: rust
status: forged
verified_on: 2026-09-29
verified_against: rust@1.96
applied: simulation
ab_verdict: unmeasurable
---

# The retirement predicate re-imposed at the shared join (Rust, desktop companion)

This is the second tree, and the one that already does what the technique asks. A local
companion keeps episodes, facts and procedures in a graph table with an `importance`
column, retrieves through a keyword lane and a vector lane, and unions the two. The
keyword lane filters retired rows in its own SQL. The vector lane cannot: its embedding
table has no such column, so its ids arrive from a similarity search that has never heard
of retirement.

## The predicate lives at the join, and the comment says why

`src-tauri/src/companion/brain/retrieval.rs:734 "SELECT id, kind FROM companion_node WHERE id IN ({placeholders}) AND importance > 0"`

The code above it is the technique's argument in one paragraph
(`src-tauri/src/companion/brain/retrieval.rs:723 "`AND importance > 0` is the retirement predicate re-imposed on the vector"`):
without the predicate the union "re-admits exactly what supersedence, the decay floor and
cap enforcement demoted ... by the one lane that never asked." It also states the
placement rule: dropping the row at this join rather than in each lane's query is
deliberate, because a row with no kind is skipped by every lane, so **one predicate here
covers the episode, fact and procedural lanes and every lane added after them.** That is
"the door, not the shortlist" reached independently, from a defect the tree had to find.

The write side carries the same rule for a model's output: an id a model emits when it
asks to supersede a fact is resolved against live facts before anything is written
(`src-tauri/src/companion/brain/sleep_cycle/apply.rs:53 "live_fact_scope(pool, &winner)?,"`),
so a model that names a retired or unknown id changes nothing.

## The residual gap

The doctrine loader beside it takes ids from the same union and applies no retirement
predicate (`src-tauri/src/companion/brain/retrieval.rs:836 "WHERE kind = 'doctrine' AND id IN ({placeholders})"`).
That is harmless for exactly as long as doctrine rows are never demoted, which was not
checked here; the loader is also the one door in this file whose comment does not say why
it has no predicate. The technique's test, handing the loader a retired id directly, would
settle it in one fixture.

## What was and was not tested

Verdict: `unmeasurable`, mode `simulation`. The three cases are the tree's own three
lanes read for whether a retired id can arrive by that lane: keyword (filtered in the
query), vector (filtered at the join), doctrine (not filtered; retirement of doctrine
unknown). Nothing was run against a fixture. The instrument that would measure it is the
technique's own probe, a loader handed a retired id, a wrong-tier id and an off-shortlist
id, counting what reaches the assembled context. Return condition: the doctrine lane's
loader gains a retired-row case, or a doctrine demotion path is found.

## Cannot say

Whether the tree's retrieval measures a stale-served rate anywhere. It has the guard and
the reasoning, and not, so far as this read found, the counter that would show the guard
being exercised.
