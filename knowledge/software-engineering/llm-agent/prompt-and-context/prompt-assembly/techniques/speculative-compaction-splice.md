---
layer: technique
type: technique
subject: prompt-assembly
technique: speculative-compaction-splice
status: forged
laws: [derivation-names-recomputation, record-precedes-effect]
shared_with: []
use_when: [a session stalls for one long summarization at the moment the window fills, the per-turn cache break of a rolling summary costs more than the stall it removes, a compacted session resumes as if the work had just started, deciding whether compaction latency has to sit on the user's critical path]
---

# Speculative compaction splice

[amortized-compaction-cadence](./amortized-compaction-cadence.md) prices two
schedules against each other: batch, which keeps the cached prefix intact and
pays for it with one visible stall at the threshold, and amortized, which
removes the stall and pays for it by breaking the prefix every turn. It
presents these as a trade decided by the deployment, and within its own frame
that is correct — both schedules do the work **in the turn's path**, so the
only variable left is how the bill is distributed across turns.

There is a third schedule, and it is available because that shared assumption
is not a law. **Start the compaction before it is needed, run it beside the
conversation rather than inside it, and splice the result in when it lands.**
The trigger moves from *the window is full* to *the window is nearly full* —
a stated margin below the threshold, wide enough that a compaction request
typically completes within it. The distribution of cost is then neither one
stall nor N small ones: it is off the critical path entirely, paid in
concurrency and in the risk of occasional wasted work.

## Two branches, one of which is thrown away

At the margin the session forks logically. One branch continues taking turns
with the full history. The other issues the summarization request against the
history **as of the fork point** and does nothing else. Neither branch waits
for the other.

When the summarization returns, its result is spliced into the live branch:
the turns that happened during the fork are retained after the summary,
because they were never part of what was summarized. The summary covers a
prefix, the live turns are a suffix, and the join is by construction rather
than by reconciliation — which is what makes this safe to do concurrently.
Nothing needs to merge two versions of the same region, because the two
branches never wrote the same region.

Two consequences follow, and the second is the one teams underestimate.

**The prefix breaks exactly as often as batch.** One rewrite per compaction,
not one per turn. This schedule takes amortized's stall-free property without
taking its cadence cost — in
[cache-breakpoint-allocation](./cache-breakpoint-allocation.md)'s arithmetic,
the cadence term for the transcript block is unchanged from batch.

**The model keeps its momentum.** A threshold-triggered compaction commonly
leaves the model looking at a summary as the newest thing in its history,
which reads as a handoff from someone else and produces a turn spent
re-establishing what was already underway. Under the splice the live turns
sit *after* the summary, so the most recent context is still the work in
progress. The summary is background; the last thing the model did is still
the last thing in the transcript.

## The margin is a measurement, not a constant

The margin has to cover a summarization round trip at the session's own
traffic, or the fork is pointless: the live branch crosses the real threshold
before the result arrives and the stall happens anyway, now with a wasted
request beside it. Derive it — measure the summarization latency
distribution and the tokens the session adds per turn, and set the margin so
the expected completion lands with room to spare
([limits-are-derived](../../../../_laws.md#limits-are-derived)). A margin
picked as a round percentage and never revisited is a threshold trigger with
extra steps.

**Say what happens when the speculation loses.** Two outcomes need a defined
answer before this ships: the live branch crosses the hard threshold while
the summarization is still in flight, and the summarization fails. Neither
may silently become "no compaction". The honest fallback is to block on the
in-flight request rather than to start a second one — the run degrades to the
batch schedule, which is the behaviour the system had before, and the record
says the speculation lost so the margin can be re-derived rather than
guessed at.

## What it does not solve

The splice changes *when* compaction runs and *what the model sees
afterwards*. It does not change what a summary loses, and it is not a licence
to summarize more aggressively because the latency stopped hurting. The
selection rules in [history-compaction](./history-compaction.md) — what is
protected, what is foldable, what must survive verbatim — are unchanged, and
so is the caution that a summarizer's errors are not transient. Cheap
compaction that runs off the critical path invites running it more often;
each pass is still a lossy rewrite of the record the session reasons from.
