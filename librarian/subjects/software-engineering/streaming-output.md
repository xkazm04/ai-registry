---
domain: software-engineering
subject: streaming-output
last_touched: 2026-08-22
touched_by: research
dry_streak: 0
---

# streaming-output

Subject note. Part of [[index]]; graded against [[standard]].

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
