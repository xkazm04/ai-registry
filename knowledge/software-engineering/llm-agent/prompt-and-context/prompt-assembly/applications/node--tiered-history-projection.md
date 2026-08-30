---
layer: application
type: application
subject: prompt-assembly
technique: tiered-history-projection
stack: node
verified_on: 2026-08-30
verified_against: node@24
applied: simulation
ab_verdict: not-better
---

# A flat eight-turn tail that has not yet earned a staircase

`ascent` — a Next.js 16 fleet-monitoring product whose companion rebuilds
her prompt per call from a durable store. Paths are relative to the repo
root; citations resolved 2026-08-30 at commit `0e1f0b30` on the active
branch. The tree sits squarely in the technique's regime — the record
outlives the prompt, the history layer is a projection already — and the
verdict is still **do not build the pyramid here yet**. The reasons are the
useful part.

## Where the seam is

History enters the prompt as a flat recent tail: the last eight turns,
excerpted to a ceiling (`src/lib/athena/prompt.ts:43-45`,
`prompt.ts:151-158`), trimmed again at the caller
(`src/lib/athena/turn.ts:190`). Everything older than eight turns is
invisible to the model. That is precisely the "fixed recent-window" opening
the technique exists for — and the walk below is why the opening does not
yet bind.

## The paired comparison (simulation — three cases from this tree)

A is the shipped flat tail; B is the staircase with drill-down.

- **The follow-up** ("and the other one?" — the documented reason the
  history section exists, `prompt.ts:14`): resolves within the tail under
  both. Identical.
- **An operator referencing a conversation older than eight turns**: A has
  nothing; B would show a coarse pointer — but the technique's own
  load-bearing core is *recency plus fetch-by-identifier*, and this tree has
  no fetch affordance: the model cannot pull a raw span back by id. B is
  therefore not "add tiers", it is "build retrieval, then tiers" — a larger
  investment than the seam's traffic justifies. Falsifier: conversations
  routinely outgrowing eight turns, countable from the stored record.
- **Cycle-to-cycle continuity** (the daily briefing not repeating itself):
  already served by the boundary's *other* half — the cycle writes exactly
  one episode of its own and recall reads that store
  (`src/lib/athena/cycle.ts:24`), a curated semantic memory of the shape the
  technique's boundary section defers to. The pyramid would duplicate this
  coverage at a lower trust grade.

Verdict: **not-better** for this tree today. The condition under which the
technique did not hold, stated from the seam: per-conversation histories fit
inside the tail, and long-range continuity is already carried by a semantic
store — the pyramid's payoff condition (arcs outgrowing the window) is
unmet, and its precondition (a fetch-by-identifier affordance) is unbuilt.

## What this realization cannot do

Nothing here measures whether operators *try* to reach beyond the tail and
fail; the flat window fails silently. The instrument that would revisit this
verdict is a count of stored conversations exceeding the tail length —
cheap, since the turns are already persisted. Until that number is real, the
eight-turn constant is a defensible budget, not a defect.
