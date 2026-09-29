---
layer: technique
type: technique
subject: prompt-assembly
technique: pinned-prompt-clock
status: forged
laws: [derivation-names-recomputation, count-carries-predicate]
shared_with: []
use_when: [a system prompt carries today's date or the time, a long-running session crosses midnight, a prompt cache hits at noon and misses after midnight, a budget probe assembles the prompt without sending it, a volatile value is declared as a variable but read fresh on every request]
---

# The pinned prompt clock

[variable-interpolation](./variable-interpolation.md) says the date enters the prompt
as a declared variable, and [cache-breakpoint-allocation](./cache-breakpoint-allocation.md)
asks of every block whether its value can change before the block expires. The date
answers the second question badly: **a date read on every request changes at midnight
for every session that is still open**, and a time that carries minutes or seconds
changes on every request. Both sit in the system layer, the layer the provider's
cache hierarchy puts *upstream of everything else*, so one changed character
invalidates the system block and every message after it.

The cost lands where it hurts least visibly. A session that has been cheap all
afternoon becomes expensive at 00:00, once, and never again that day, so the
regression has no deploy to blame and shows up as a spend spike in a dashboard nobody
correlates with the clock.

## The rule

**Give the clock a session lifetime, not a request lifetime.** Three parts:

1. **Freeze at first assembly.** The first request of a session reads the date once
   and stores it with the session. Every later request renders the same text. The
   stored value is a declared input to the fingerprint, so a session opened yesterday
   is still built from yesterday's date today — and that is the point.
2. **Deliver change at the tail.** When the calendar day moves under a live session,
   append one small message at the tail — *the date is now …* — at the position it
   arrived. Keep it at that position on every later request, so the prefix grows by
   appending and each earlier request's bytes remain a prefix of the next. A notice
   that is moved, rewritten or regenerated per request is the same mutation the
   freeze prevented, one layer down.
3. **Refresh only where the prefix is being rewritten anyway.** A full compaction
   checkpoint replaces the head of the history, so the cache is gone regardless. That
   is the one moment the frozen date may be replaced by the current one, and the old
   notices are dropped with the history they sat in. Lighter operations that prune
   tool output leave the system layer alone and must not refresh the clock.

## Probes must not consume the refresh

A budget check assembles the prompt to count it and then discards it. If that assembly
is allowed to observe a compaction checkpoint and refresh the frozen date, the probe
has advanced the session's state and the real request that follows renders a different
system layer from the one it was priced on. **A preview assembles with the same inputs
and changes no state.** Test it: run a preview across the moment the refresh would
fire, then the real request, and require the real request to be the one that refreshes.

## Granularity

Date only. If the model needs the time of day for a decision, the decision belongs to
a turn, and the time belongs in that turn's message at the tail. A timestamp with
seconds in the system layer is not a rare event; it is a permanent miss, and it is a
common thing to add "for grounding" without measuring what it does to the cache.

Do not compute the date with the process's clock at render time and call it pinned:
the pin is a stored session field. Two sessions opened a day apart keep two dates, and
a process restart that resumes a session reads the stored one.

## The test

Fix the clock and drive one session across midnight:

- the system text is byte-identical before and after;
- exactly one date notice is appended, and earlier messages are unchanged;
- a retry, and an ordinary appended turn, add no further notice;
- a second session created after midnight carries the new date in its own system text.

One more assertion belongs beside them: the fingerprint of the system layer is equal
across the crossing. That is the property the provider's cache actually reads.

## Boundaries

- What else may sit upstream of the first volatile byte is
  [layered-composition](./layered-composition.md)'s question; this technique settles
  one volatile input that every deployment carries.
- A deliberately per-turn value (a deadline, a remaining budget) belongs at the tail by
  construction and needs no pin. The trap is the value everyone thinks of as constant.
- The notice is a message, and it arrives at the tail — which is where every consumer
  of "the last user message" looks. A classifier, a title generator or a router that
  reads the last user turn will read *the date notice* as the task on the first request
  after midnight. Mark the notice as synthetic with a purpose, and have those readers
  skip it. The failure is silent and time-triggered: one tree found it as a routing
  judge classifying "the date is now …" and sending the real request to the wrong tier.
