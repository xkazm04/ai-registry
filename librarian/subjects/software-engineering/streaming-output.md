---
domain: software-engineering
subject: streaming-output
last_touched: 2026-09-04
touched_by: intake
dry_streak: 0
---

# streaming-output

Subject note. Part of [[index]]; graded against [[standard]].

## 2026-09-04 - /intake run (microsoft/VibeVoice @ 1541f59)

- New technique `emit-behind-the-revision-window`, found by the **refutation hunt** on this subject's own "when *not* to stream" list. The bullet on a non-monotone producer closes with two remedies - render checkpoints, or wait - and both are answers to a question the bullet never asks: **how far back can the revision reach?** They are correct for an unbounded reach. Where the reach is bounded and nameable (a detector's lookback, a resume point, an unterminated element), a third remedy keeps the live tail AND monotonicity: hold the emission cursor at `frontier - reach`, snap to a semantic boundary, and the stream is append-only by construction.
- **The load-bearing half inverts this subject's usual posture.** Everywhere else the live region is the weak tier and the settled record binds; here the emitted prefix is the strongest thing in the system, because it is the only part that has already left. So a retry must resume from **what was shown**, not from what the corrector thinks is the best cut - and before the first emission nothing is binding, which makes a clean restart strictly better than any resume, available only in that window.
- The bullet was edited as an **append, not a rewrite**: it never claimed exhaustiveness, so both prior remedies stay true and gain a scoping clause. `voice-io` cites this same denial for partial transcripts, and a denial repeated across two subjects is what proved it load-bearing rather than incidental.
- **Applied `simulation` to a fleet voice service, verdict `not-better`, and it improved the technique.** That project solves the same problem with a different instrument - the prefix two successive decodes agree on, under the rule that a speculation is invisible until the turn is confirmed, with a normalized continuation check before anything speculative may be heard. Agreement needs **no knowledge of the corrector's reach**, which is exactly the case the cursor cannot serve. The technique had conflated two questions that project separates: *what may be shown* (needs the guarantee) and *what may be acted on* (a heuristic plus a gate, because unshown work is discardable). A section was added for it.
- Return condition for a real apply: a fleet seam whose revision reach is **bounded**. The one tested is unknown-reach, so the cursor mechanism has no home in this fleet yet.

## Touch log

### 2026-08-22 - `/research`, from a practitioner codebase

Gained `mid-turn-steering` (6 -> 7 techniques) from
[[../../sources/2026-08-22-onecli-repo]]: steer as a declared capability,
queue as the caller-owned degrade, refuse-between-turns, the observable join
event. Home was contested (input to a live turn, in an output-named subject);
placed as cancellation's constructive sibling. If the subject is ever split
into input/output halves, this technique is the first to move.

## Declines

None.

## 2026-08-27 - /intake, from a coding-agent harness tree ([[2026-08-27-whip-coding-agent-harness]])

`mid-turn-steering` gained "The channel has more than one producer". Found by the asymmetry
hunt: the technique models the injection mechanism **completely** - capability declaration,
the queue degrade, the join event, redirect-not-restart - and models exactly **one**
producer. Its vocabulary is "the user", "the caller", "a message arrives while the turn is
still running", throughout.

The source unifies them: one wakeup channel serving scheduled fires, webhooks, inbound
external messages, post-restart notices and background worker reports alike, all arriving
as machine-authored messages injected at loop boundaries, distinguishable from a human turn
only by prompt content.

**The technique's sharpest edge inverts for machine producers, and its own justification is
the reason.** It rules that a steer with no turn in flight must refuse loudly rather than
queue, because "the caller will also submit the message through the normal next-turn path -
its own degrade - and the quiet acceptance now delivers it twice." That argument rests on a
property only a human caller has: **a second door.** Nothing will re-offer a worker's report
or a scheduled wakeup. So machine sources start a turn or are held durably, never refused;
and delivery is recorded before it is attempted, because the gap between "fact produced" and
"turn began" is where a crash eats work with nothing left behind to reconcile against.

Provenance obligation added in the other direction: the surface renders the source (so a
human never attributes a scheduler's instruction to themselves), and the assembler classifies
the span by its true origin - an inbound external message is untrusted input wearing the
user's clothes. Cross-referenced in prose to `prompt-assembly`'s trust classes rather than
duplicating them.

## 2026-09-02 - lead placed by [[2026-09-02-1]]

- **Multi-consumer buffering rule**, from terminal-multiplexing's new
  `multi-client-fan-out`: a shared buffer drains to the slowest *un-paused*
  reader's offset, so the bound is conditional on pausing or disconnecting the
  laggard, with the gap disclosed (failure-not-empty-success). Generic, not
  terminal-shaped; belongs beside buffering-and-backpressure with the terminal
  subject deferring. Return when this subject is next opened.

## 2026-09-04 - /intake run (youtube: infinite AI stream) - boundary note

- A sibling subject now holds the **inverse regime** of this subject's buffering model. `buffering-and-backpressure` states, correctly and as its operating condition, that the producer is faster than the consumer; `media-playback/generated-supply-margin` owns the case where the consumer is a clock that cannot be slowed and the producer is nearly as slow, so the failure is underflow, head-eviction is wrong (every unit is needed in order) and neither backpressure nor shedding is available. **Nothing here needed correcting** - the honest scope statement is what made the neighbouring hole findable, and it is recorded in both notes rather than written twice.
- `mid-turn-steering`'s contract is cited from `media-playback/committed-buffer-steering` for the two rules that carry over (steering is a declared capability; an accepted steer needs an observable join). What does not carry over is the steer-or-queue binary: on a continuous timeline there is no turn to be inside or outside of, and the question is how far the commitment already extends and what buying it back would cost.
