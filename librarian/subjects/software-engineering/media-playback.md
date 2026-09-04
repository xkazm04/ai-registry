---
domain: software-engineering
subject: media-playback
last_touched: 2026-09-04
touched_by: intake
dry_streak: 0
---

# media-playback

Subject note. Part of [[index]]; graded against [[standard]].

## 2026-09-04 - /intake run (youtube: infinite AI stream, MiniMax H3-fast)

- **The subject had a missing regime, not a missing opinion.** Every technique here assumed the content exists and the only question is *when to start it* - `timeline-scheduling`'s lookahead window is explicitly a residency/seek tradeoff, and its "a failed piece converts to a gap of its own duration" rule only makes sense because the composition is **authored**. A timeline whose tail is produced just ahead of the playhead breaks both assumptions: there is no model to derive a schedule from, and a unit that misses has no interval to leave blank. Two techniques landed for it: `generated-supply-margin` and `committed-buffer-steering`.
- **The neighbouring subject stated the boundary out loud, which is what made the gap findable.** `streaming-output/buffering-and-backpressure` opens with "The producer being faster is not an edge case - it is the operating condition", and enumerates "exactly two honest responses" when the consumer falls behind. Both are true and both are the *opposite* regime: here the consumer is a clock that cannot be slowed, the failure is underflow, head-eviction is nonsense because every unit is needed in order, and neither backpressure nor shedding is available. An enumeration that scopes itself honestly is the cheapest place to find a hole.
- **The instrument agreed and nearly hid it.** `research-map "buffer underflow continuity"` matched **11 of 413 subjects**, top hit scoring 6 on a spurious slug overlap. A near-empty over a mature corpus, and the method's rule held: it was a hole, not a seam, but only reading both candidate homes settled which.
- **Applied `code` to a fleet speech-synthesis service, verdict `better`, shipped.** Its certification gate compared a *mean* realtime factor against exactly `1.0` while the p95 and p50 sat unread in the same result row. The structural fact is better evidence than the fix: **the same repository already applies the rule one file away**, widening a single-request deadline promise by the measured p95/p50 spread and refusing to widen it from an unmeasured one - while the durable, signed capacity certificate applied none of that rigour. Nobody designed that asymmetry; two layers were written at different times to answer different questions. Admitted-but-unsustainable band was the entire declared certification range.
- **Applied `simulation` to the same service's scheduler for `committed-buffer-steering`, verdict `not-better`, and the technique is better for it.** The project expresses priority as a **deadline** (`t_enqueue + horizon` per class) rather than as a class, which collapses preemption and a starvation bound into a single number, and floors caller-supplied urgency per class because a request-body priority field is "a starvation weapon costing one JSON field". Both are now in the technique. The technique's *central* claim - buffer depth is simultaneously stall protection and reaction latency - has **no seam in this fleet** and is recorded unapplied. Seam class, so a later run does not re-run it: **a request scheduler is not a committed-buffer timeline.**
- **Cross-bundle boundary, named not linked.** `media-generation/visual-generation/resolution-as-stage-property` ladders fidelity by *stage*, with spend rising as certainty rises. Under a real-time deadline there are no stages and nothing is discarded, so fidelity is pinned by the deadline and the ladder has no rung to promote to. The discriminating question is whether a unit of output can be reviewed before it is delivered; stated in prose on this side, and the amendment on the other side is banked untriaged in the source note.
- Source: [[2026-09-04-infinite-ai-stream]].

## Touch log

- 2026-09-04 - /intake - two techniques, one golden-path section, two applications, one shipped project commit.
