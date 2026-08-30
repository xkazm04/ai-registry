---
layer: application
type: application
subject: agent-memory
technique: recall-injection
stack: rust
verified_on: 2026-08-30
verified_against: rust@1.97
---

# Recall injection in the companion brain and persona engine (Rust)

Two recall systems realize the technique at different scales: the companion's
per-turn bundle (`src-tauri/src/companion/brain/retrieval.rs`) and the persona
engine's decay-scored packer (`src-tauri/db/src/memory_recall.rs`).

## The tiers, literally

`retrieval.rs` builds each turn's `Recall` from exactly the standard's three
tiers (module header, `:1-24`):

- **Relevance** — a keyword (BM25) lane that runs in every build plus an
  ml-gated vector lane. The header records why the keyword lane exists: before
  it, the shipping build "returned the same N most-recent episodes and the
  same top-N facts on every single turn" — recall that did not depend on the
  question at all.
- **Always-include** — top facts, procedurals, active goals, open backlog by
  importance, "query-independent" by design (`:11`, `:131`), recorded last in
  the assembly "so they never displace" a query-matched hit (`:424`), each
  with its own small cap (`ALWAYS_INCLUDE_TOP_FACTS = 6`, `:80`) — the
  jealously-guarded constitutional tier.
- **Recency** — a tail with a floor: `RECENCY_FLOOR = 6` (`:70`), because
  "losing the immediately-preceding turn to a well-matched older one would be
  a worse failure than a slightly oversized window."

The budget discipline is the doc's own headline (`:15-17`): the episode window
is "a budget, not a per-lane quota" — all lanes converge on
`RECALL_EPISODE_TARGET = 20` (`:65`), with the recency tail sized from what the
other lanes actually returned (`:499-501`, `:592-594`). The old hard-coded
split delivered *fewer* memories in the richer build when the vector lane came
up empty — per-tier arithmetic drifting from the total is exactly what a
single declared budget prevents.

## Labeled, not smuggled

`format_facts` (`src-tauri/src/companion/prompt/memory.rs:31-75`) renders each
recalled fact as `**key** (importance N, conf NN%) — value [from sources]`
(`:64-71`) under a header that names the epistemic status: "facts you've
distilled — every entry is cited". Procedurals carry the same annotation
(`format_procedurals`, `:110`). The consumer sees grade and grounds, not bare
world-state. (Age/last-confirmed is still not rendered — re-checked
2026-08-30, and still the one element of the standard's label this surface
omits.)

**A placeholder in a citation slot is worse than an omission**, and this
codebase paid for the lesson between verifications. `format_facts` now skips a
zero-source fact and logs loudly rather than rendering it (`:47-59`); the
comment records what it replaced — "the old fallback rendered the literal
string `no-sources` as if it were a real citation, teaching the model that
uncited memory is a legitimate shape". The write path already refuses such a
fact, so the render is defence in depth for an invariant "bypassed somewhere",
and it deliberately matches consolidation's `continue` on the same check
rather than inventing a second policy. This is the standard's labeling rule
pushed one step further than the standard states it: the label must fail
*visibly*, because a filled-in citation slot reads at full strength no matter
what is in it.

## Value-ranked packing under a character budget

`memory_recall.rs` is the packer half: `decay_score` (`:144-170`) computes
`importance × 0.5^(age/half_life(category)) × access_boost × dispute_penalty`
— with the two modifier terms spelled out in the header,
`access_boost = 1 + 0.25·ln(1 + access_count)` and
`dispute_penalty = 1 − 0.35·tanh(open_claims / 2)` (`:148-150`) — and
`pack_by_budget` (`:204`) greedy-packs whole entries by that score into a
character budget, replacing a blind "importance DESC then truncate" that could
drop a fresh high-importance memory "because an old, often-accessed one padded
the budget first" (`:7-12`). Task-relevant recall blends the same value score
with semantic similarity (`pack_by_budget_relevance`, `:301`;
`pack_by_budget_task_aware`, `:359`), with SQL scoping still deciding
*eligibility* — the header's own phrasing is that the packer "re-ranks the
active-tier candidate set" (`:7`); relevance never widens it.

The sub-linear `access_boost` carries **no cap** here — the gap the standard's
bounded-retrieval-bonus rule closes and the Node sibling has already fixed.
Re-checked 2026-08-30: still uncapped, and `should_forget` (`:428-441`) scores
with the same `decay_score`, so this store has the shape the standard warns
about — delivery buys a stay of execution from the janitor that reads the
delivery count. What keeps it survivable is the *conjunction* around it, not
the term: retirement additionally requires `importance ≤ FORGET_MAX_IMPORTANCE`
(3) and `age ≥ FORGET_MIN_AGE_DAYS` (21), and the logarithm grows slowly
enough that a thousand deliveries buy under 3x. So the veto is real but weak
here rather than literal — the standard's stated fix (bound the bonus so a
low-trust item falls under the floor after a stated number of half-lives
*regardless* of deliveries) is the one thing not present, and it is the
deviation to watch.

## The loop back into retention

Recall feeds decay from both directions, as the standard's closing loop
requires: `access_boost` in `decay_score` makes used memories decay slower,
and the companion's lifecycle sweep is *triggered from the recall path* —
`maybe_run_lifecycle_sweep`
(`src-tauri/src/companion/brain/consolidation.rs:546-575`), throttled to
`LIFECYCLE_SWEEP_MIN_INTERVAL_SECS`, best-effort, hooked there precisely
because it is "the path that actually runs". It now claims its slot with a
`compare_exchange` before doing the work "so two concurrent turns can't both
run the sweep" (`:557-564`) — the recall-triggered janitor inheriting the
recall path's concurrency, and paying for it once. Its two actions stay
demotions, not deletes: decay decrements importance with a floor of 1 and
"never makes a fact retrieval-ineligible"; prune demotes to 0 only above the
per-scope cap and "keeps the markdown and the SQL row for provenance"
(`:539-545`). Forgetting on the persona side likewise archives rather than
deletes (`run_decay_forgetting`, `memory_recall.rs:447-475`) — reversible
demotion, with vector cleanup trailing as incremental GC.
