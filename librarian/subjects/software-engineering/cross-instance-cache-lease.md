---
subject: cross-instance-cache-lease
domain: software-engineering
last_touched: 2026-09-03
touched_by: intake
dry_streak: 0
---

# cross-instance-cache-lease

First touch: [[2026-09-03-vllm]]. NEW subject, 4 techniques, 4 applications (one of
them a fleet application written the same session).

## What the gap actually was

One process holds an expensive resource for another that will come and take it - later,
maybe never. The corpus had heartbeats keeping a STREAM alive and a batch lease for mutual
EXCLUSION; neither is retention against unilateral reclaim. The discriminating question is
now written into the golden path: would two parties collide, or would one throw away what
another needs?

The spine is that the two failures pull a single timeout in opposite directions - a dead
consumer strands gigabytes, a merely queued one loses work - so the parameter is the wrong
control surface and the fix is to key on the signal that separates the cases.

## Still open

This subject GAINED from a fleet project rather than from the source, the same session it
was forged. A tree with a fenced relay lease supplied two refinements: renewal and progress
must be separate doors (a holder alive but stuck computing something to say reads as dead -
and the failure is load-correlated), and the renewal carries a generation token the source
lacks. The forging worker had already recorded the missing fence as a deviation and refused
to lower the standard; the fleet tree is the second independent sighting that says the
shortfall is real.

A defect was found in the source and is unreported upstream: the expiry sweep early-exits on
an insertion-ordered map while renewal writes through an existing key without reordering it,
so a renewed head shields expired entries. Safe direction (over-retention) but worst-case
retention stops being bounded by the sweep period.
