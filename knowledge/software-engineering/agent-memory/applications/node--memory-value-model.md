---
layer: application
type: application
subject: agent-memory
technique: memory-value-model
stack: node
status: forged
verified_on: 2026-08-20
---

# One value model behind recall, forgetting and coverage (Node/TypeScript)

A second repo realizes this subject as a **shared, multi-writer org memory
store** rather than a single agent's brain, and it puts the value model in one
pure module that three other modules import. The whole standard's "one model,
two callers" rule is visible as an import graph.

## The score and its argument

`src/lib/memory/recall.ts:4-18` states the problem and the formula in the file
header, before any code:

    score = confidence × 0.5^(ageDays / halfLife(kind)) × (1 + 0.25·ln(1 + accessCount))
            └ trust ──┘  └──── exponential decay ─────┘  └──── proven usefulness ─────┘

with the rejected alternatives named: "ordering by `updatedAt` hands it the
most recently *edited* memory, which is not the same as the most VALUABLE one;
ordering by confidence hands it a year-old certainty." The sub-linear usage
term is justified in the same breath — "so a hot memory can't dominate."

`KIND_HALF_LIFE_DAYS` (`:66-77`) is the half-life table the standard asks for,
in one place, each entry carrying its claim: episodic 30 ("context for weeks,
not quarters"), semantic 180, procedural 365 ("the longest-lived thing here"),
summary 120 ("a rollup outlives its members but should yield to a newer
rollup"). `DEFAULT_HALF_LIFE_DAYS` (`:80`) is the declared fallback for an
unknown kind — the open-vocabulary safety valve, present.

Purity is enforced by construction: the header states the module is
framework-agnostic with **no `Date.now()`** — "`now` is always injected, so a
scoring assertion is a fixed number rather than a moving target" (`:16-18`).
`ageInDays` (`:94-102`) clamps at zero so "clock skew (a future timestamp)
can't BOOST a memory above its confidence ceiling", and treats an unparseable
date as brand new "rather than NaN-poisoning the whole ranking".
`memoryValue` (`:108-115`) rounds to 4dp because "float noise must never
reorder two otherwise-equal memories between two calls", and `scoreMemories`
(`:131-139`) breaks ties on id for a total, stable order.

## Packing, and what the result admits

`packByBudget` (`:142-169`) is the whole-item greedy pack, with both rules
argued in the comment: an item is never truncated because "half a memory is
worse than no memory: it reads as a complete fact to the model consuming it,
and a clipped conditional ('…unless the repo is public') inverts meaning";
and an oversized item is skipped rather than ending the loop, "so a 300-char
memory ranked #9 still lands when the 8000-char memory ranked #3 could not…
not optimal, but deterministic and explainable, which matters more here".

`RecallResult` (`:44-56`) returns `omitted` and `consideredCount` alongside
`selected` — the latter documented as "so a caller never implies it saw
everything".

## The access-count contract — and a deviation

`recallMemories` (`:188-195`) states the caller's remaining duty: "only the
memories in `selected` may have their accessCount bumped. 'Recalled' means
'actually reached the agent', otherwise the usage term in the value model
degenerates into a count of how often the store was queried, and every memory
drifts upward together."

This is the mechanism the standard now names, and the repo teaches it. Note
also where the repo sits **below** the standard: the counted event is
*delivered*, not *used* — an item injected and ignored is reinforced exactly
like one the agent acted on. The standard's stricter bar (cited, acted on,
confirmed) stays; the repo's contract is the floor beneath it, and the floor
is where most systems fail.

## Forgetting reads the same score

`src/lib/memory/decay.ts` imports `memoryValue` and `isRecallable` from
`recall.ts` (`:27`) — the import *is* the one-model rule — and its header
(`:1-25`) names the four conjunctive conditions with a reason each:
`DECAY_SCORE_FLOOR` 0.15 ("the same value model recall ranks by, so forgetting
and remembering can never disagree"), `DECAY_MIN_AGE_DAYS` 60 ("a hunch typed
this morning (confidence 0.3) must survive long enough to be confirmed"),
`DECAY_MAX_CONFIDENCE` 0.3 ("old and TRUE is the normal state of a semantic
memory, and letting decay touch it would quietly erase the org's history"),
and `DECAY_EXEMPT_KINDS = ["procedural"]` ("the most expensive to lose…
exempt from automatic forgetting, full stop").

The header then drew an implication that read as a feature and was in fact the
defect: "conditions 1+3 imply together: an old, low-confidence memory that is
still RECALLED often keeps a score above the floor via the usage term, and
survives. **Usage is a veto on forgetting.**"

**Corrected in this codebase after the standard was written, and the standard
moved with it.** Two errors, one enabling the other. The term counted
*deliveries* — rows packed into a recall result — while being named for proven
usefulness; nothing in this system flows back from the agent to say a delivered
memory was read, cited or used. And because it was unbounded while the decay
sweep scored with the same function, the veto was literal: rank high, get
delivered, rank higher, never be archived. A stale low-trust row could finance
its own survival forever, and the janitor was the mechanism.

The fix caps the bonus at x2 (`MAX_DELIVERY_BONUS`, reached near 54
deliveries), which makes the floor reachable again — a confidence-0.3 row is
archived after two half-lives whatever its count — and renames the term for
what it measures, recording the two honest ways to close the gap (an
evidence-bearing counter fed by an act that proves use, or nothing). A test
pins archival at an absurd delivery count. `sparedBy` and the blast radius are
unchanged; the conjunction was never the problem.

Forgetting is `archived = true`, never a delete (`:4-7`), and
`DECAY_MAX_PER_PASS = 50` (`:37-38`) is the declared blast radius — "a bad
policy edit can't empty a store in one call… and a human sees the count in
between". `DecayVerdict.sparedBy` (`:50-51`) records *which* clause spared an
item, "for the audit line".

## Where the same model shows up again

- `src/lib/memory/reflection.ts:254-270` caps a rollup's confidence at its
  members' maximum — the value model's trust axis defended at the write path:
  "a rollup may never be more certain than the most certain thing it
  consolidates."
- `src/lib/memory/scan-feed.ts:10-25` stamps machine-observed memories with
  `confidence 1.0` — "these are OBSERVED facts, not inferences. The high band,
  honestly" — plus a fixed `source: "scan-pipeline"` provenance so "a reader
  must always be able to tell a machine observation from a colleague's claim".
- `src/lib/memory/coverage.ts:1-27` keys freshness on the *same* liveness
  predicate the recall path uses (non-archived, non-superseded, unexpired), so
  the coverage instrument cannot report as covered what recall would never
  serve.
