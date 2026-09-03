---
layer: technique
type: technique
subject: fault-signal-propagation
technique: no-synthetic-terminal
status: forged
laws: [unknown-is-not-a-value, verdict-survives-boundary, failure-not-empty-success]
shared_with: []
use_when: [a producer restarted with requests in flight against it, deciding whether a runtime should fabricate an error reply to keep a code path uniform, a wait needs to distinguish a dead peer from a slow one]
---

# No synthetic terminal

When a producer restarts, every exchange in flight against it is orphaned. The
correlation state lived in the two endpoints; one of them no longer exists; the
reply that would have closed the exchange will never be sent. The supervision
layer, which knows all of this, faces a choice that looks like a kindness and is
not: it could **manufacture** a terminal — an error reply, a cancellation, an
empty result — so that every consumer's wait ends the same way it always does.

It must not. This technique is the refusal and the contract that replaces it.

## Why the fabrication is worse than the gap

A synthesised terminal is, at the consumer's branch point, indistinguishable from
a real one. The consumer's code says "the request failed" and records that. The
truth was "nobody ever answered, and the peer I was waiting on has been replaced
by a new instance that never saw my request." Those two facts lead to different
next actions — the first suggests inspecting the request, the second suggests
re-establishing the relationship and re-issuing the work — and the fabrication
destroys the distinction at exactly the boundary that needed it
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

The damage compounds through records. An operations dashboard counting error
replies now counts fabrications alongside genuine rejections, and the ratio of
"requests this producer refused" is polluted by requests it never received. Every
downstream statistic derived from the terminal vocabulary is measuring the
supervision layer's imagination.

And it compounds through trust. Once a runtime is willing to invent one outcome
to keep a code path uniform, the argument for inventing the next one is already
made. A layer that has never synthesised anything can be believed unconditionally
by everything above it; that is a property worth more than the uniformity it
costs.

## Three outcomes, not two

Replace the fabrication with an honest vocabulary. A wait against a peer ends in
one of exactly three states, and they must be spelled differently
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)):

- **Answered** — the peer replied, whatever the reply says. Success and refusal
  are both answers; both prove the exchange completed.
- **Timed out** — the wait's own bound expired with no reply and no other
  information. This is a *hypothesis about a live peer*: it may still be working,
  it may have dropped the request, the caller does not know.
- **Abandoned by restart** — the peer the wait was against was replaced. This is
  a *fact about a dead one*: the request is definitively gone, no reply is coming,
  and no amount of further waiting changes that.

A wait can also end for a reason that is about neither the peer nor the clock:
the graph is shutting down, or the caller's own stream failed. Those are further
distinct ends, and folding them into "timed out" is the same error one level out —
a caller that reports a timeout when it was actually told to stop sends an
operator hunting a latency problem in a clean shutdown.

Collapsing abandonment into timeout is the common shortcut and it is a real loss.
It costs the caller the full timeout it no longer needs to serve, and it costs the
operator a diagnosis — a graph full of timeouts reads as a slow dependency and
sends people to look at latency, when the actual condition is a producer that has
restarted eleven times in a minute.

The verdict must reach the outermost layer that acts on it as a typed value
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)). A
correlation outcome erased into a generic error at the binding's edge has failed
in the same way the fabrication does, one layer later.

## What the runtime provides instead

Three things, and together they are sufficient:

1. **The restart signal**, delivered to exactly the consumers of that producer,
   ahead of the new instance's first message. That is what allows a caller to end
   its waits deliberately rather than by expiry.
2. **The caller's own bound**, per outstanding request. Correlations are
   request-shaped, so their deadlines are per-request, never a channel-wide
   staleness timer — the edge deadline technique states why.
3. **A written contract that correlation state is endpoint-local and does not
   survive a restart.** This is the part most implementations omit, and it is the
   part that turns a footgun into a design. A system that silently loses in-flight
   exchanges and does not say so has an undocumented failure mode; one that says
   so plainly has a stated boundary that callers can build against.

## The neighbouring temptation: retrying on the caller's behalf

If the runtime knows the request was orphaned, and knows the new instance is
alive, why not re-issue it?

Because idempotence is a property of the operation, and the runtime does not know
the operation. Re-issuing a query is harmless; re-issuing a goal that the old
instance had already accepted and partially executed commits the same action
twice, against a world that has already changed. The caller alone knows the shape
of what it asked for, whether the work was durable, and whether repeating it is
safe. The runtime gives it the fact and the caller makes the decision — and if the
caller decides to re-issue, the disciplines of that decision (classification,
budgets, spacing) belong to the retry subject, not to this one.

## Decision rules

- **Never synthesise an outcome the peer did not produce.** Not an error, not a
  cancellation, not an empty success.
- **Spell abandonment differently from timeout,** and carry the distinction to the
  caller's branch and into every record derived from it.
- **End waits on the signal, not on the clock, when the signal is available.** A
  caller that has been told its peer was replaced should not serve out a
  thirty-second timeout it now knows the answer to.
- **State the endpoint-local correlation contract in the interface's own
  documentation.** A limitation that lives only in a maintainer's head is
  rediscovered by every integrator, at cost.
- **Do not auto-retry.** Hand the fact up.

## When not to use this

Where the exchange layer itself holds durable state — a persisted request log, a
broker with at-least-once delivery and a replay path — a restarted producer can
legitimately complete an exchange after coming back. That is not a synthetic
terminal; it is a real answer, delivered late, and the whole point of paying for
durability. The refusal in this technique applies to the ordinary case, where
correlation state is memory in two processes and one of them is gone.

The line between the two is a question worth asking explicitly at design time,
because the answer decides what a caller may assume: **is an in-flight request
recoverable after the peer restarts, or not?** Both answers are defensible.
Neither is safe to leave unstated.
