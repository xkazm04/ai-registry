---
domain: software-engineering
subject: media-playback
last_touched: 2026-09-15
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

## 2026-09-15 - /intake run (youtube: MotionBricks.cpp real-time animation)

- **A technique written ten days ago was refuted by its own regime.** `generated-supply-margin` says the consumer "cannot be asked to wait" and that "there is no idle state". Both are true for independent units on a clock the viewer owns. Both are false for a producer conditioned on its own committed output, on a clock the system owns. A motion planner's streaming server holds its reference clock before a reserved seam instead of discarding a late plan, and holds a settled rest instead of replanning it. The server has a test for each. New `self-conditioned-supply` carries three rules: the reserved seam, late-versus-stale split by clock ownership, and the stationary fixed point.
- **Found by asking what the producer reads, not what it writes.** Both existing techniques model the producer as instruction -> unit. The port's controller reads the previous four frames before every replan, which puts the timeline's committed past into the request. That one fact generates all three rules, and it is why they landed as one technique rather than three amendments.
- **The discard-and-retry livelock is the reusable sentence.** A cold plan misses the lookahead every time, so re-planning from a later snapshot never catches up. The fix depends on who owns the clock: wait at the boundary if the system owns it, derive the lookahead from cold plan time if it does not.
- **Applied `simulation`, verdict `unmeasurable`.** The fleet runs no live self-conditioned producer. The closest real incident is a game project's combo clip spliced from three separately generated clips, which exploded on retarget. That project recorded the row in its own ledger. The instrument that would measure it is a local autoregressive motion model producing a one-take arm B.
- **Owed:** the direction pass was not run for this subject's new entries.
- Source: [[2026-09-15-motionbricks-cpp-realtime-animation]].

## Touch log

- 2026-09-04 - /intake - two techniques, one golden-path section, two applications, one shipped project commit.
- 2026-09-15 - /intake - one technique (self-conditioned-supply), one golden-path paragraph, one source-tree application, one project ledger commit.
