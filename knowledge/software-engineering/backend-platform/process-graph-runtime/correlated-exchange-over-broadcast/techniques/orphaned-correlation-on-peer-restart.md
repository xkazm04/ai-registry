---
layer: technique
type: technique
subject: correlated-exchange-over-broadcast
technique: orphaned-correlation-on-peer-restart
status: forged
laws: [unknown-is-not-a-value, verdict-survives-boundary]
shared_with: []
use_when: [a caller hangs after a peer crashes and restarts, deciding whether to reissue a request, designing the outcome type of a correlated wait]
---

# Orphaned correlations on peer restart

Correlation state lives in the endpoints and nowhere else. The requester
remembers the identifier it is waiting for; the responder remembers, for the
duration of the work, that it owes an answer to that identifier. Neither
memory is on the wire, neither is in a broker, and neither survives the
process that holds it.

So when a responder crashes and its supervisor restarts it, the new instance
begins with an empty table. It does not know what requests were in flight. It
cannot synthesize the terminal replies it never learned it owed. **Nothing in
the system will ever complete those exchanges**, and every requester waiting
on one is waiting on a message that no longer has an author. This is the
single most important consequence of building exchanges as endpoint
conventions, and it is the one a delivery guarantee does not fix: a guarantee
concerns the fate of a message, and here the message was never composed.

## Two exits besides the match

Every correlated wait therefore has three ways to end, not one:

1. **The match** — a terminal message carrying the identifier arrives.
2. **The deadline** — a bound the caller set, expiring with no terminal
   message. The exchange may still be live at the far end.
3. **The restart signal** — the supervisor reports that the specific peer
   this exchange was addressed to went down and came back. The exchange is
   definitively dead.

A wait built with only the first two is the common half-measure, and it is
worse than it looks. The deadline eventually fires, so the caller does not
hang forever; but it hangs for the *whole* deadline, which on a
long-running goal is measured in minutes, and it reports the outcome that
fits the symptom rather than the cause. Meanwhile the peer has been healthy
and idle for most of that window.

## Restarted and timed out are different outcomes

They call for opposite actions, so they must be different values in the
outcome type the wait returns
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).

**Restarted** means the peer exists again, holds no state from before, and is
ready now. The correct response is to reissue the request against the new
instance, immediately, with a fresh identifier — the old one is dead and must
not be reused. Reissuing is safe with respect to load, because the peer just
proved it has no queue: it has no memory at all.

**Timed out** means the peer is unresponsive and its state is unknown. The
work may be running. Reissuing may double it, and a caller that reissues on
timeout under load is the mechanism by which a slow system becomes an
overloaded one. The correct response is to back off, and — if the exchange
supports it — to cancel the identifier that was abandoned so that a late
terminal message is not delivered to a wait that has moved on.

Collapsing them into one error, or worse into a boolean, converts a decision
the caller could have made correctly into a guess
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). The
outcome type is enumerated and complete: matched, peer restarted, deadline
expired, stream ended (the node itself is shutting down and no reply will
ever come), stream error (the transport failed and the exchange's fate is
genuinely unknown), and argument rejected (a malformed peer identifier or an
impossible bound — nothing was ever awaited). Six values, each with a
different caller action. The last three are not merged into the timeout,
because "I am stopping", "the wire broke" and "your call was never made" are
not slow answers; and the last one in particular must be distinguishable at
the call site rather than raised as a process-level fault, since a bad
argument crossing a language boundary that cannot carry exceptions otherwise
takes the node down.

## The watch is per peer, not global

A node with several outstanding exchanges against several peers must not fail
all of them when any peer restarts. The restart signal names which peer
restarted; the wait compares that against the peer it addressed and ignores
the rest. Getting this wrong is a small blast radius made large: one flaky
sensor driver restarting takes down every in-flight exchange in the node,
including ones to healthy peers, and the fault looks like a bus problem.

This is also the seam with supervision. The signal — which peer restarted,
which input closed, which recovered — is produced and propagated by the
supervision subject, delivered into the consumer's ordinary event stream
beside its data. This technique owns only what the *waiting endpoint* does
with that signal, and the passthrough discipline is what makes both possible:
the signal is consumed by the wait as a terminating condition **and**
buffered for the caller's main loop, because the main loop usually also needs
to know that an upstream went away.

## Every wait carries a deadline anyway

The restart watch does not replace the deadline; it shortens the common case.
A peer can stop answering without restarting — a hang inside a third-party
library, a deadlock, a wedged device — and in that state the supervisor may
have nothing to report until a health check fires, which is itself a
deadline somewhere else. So the deadline stays, and it is **mandatory**: a
correlated wait with no bound is a process that can be parked forever by one
misbehaving peer, and it will be.

Choose the bound from the exchange's own physics rather than a house default.
A request/reply against a computation with a known cost gets a bound near
that cost; a goal that runs until a robot finishes moving gets a bound on
*feedback silence* rather than on total duration, because total duration is
unknown by design and feedback silence is exactly what "stopped working"
looks like.

## Do not build a durable correlation table to fix this

The tempting repair is to make correlation state survive: persist in-flight
identifiers, have the restarted responder read them back, synthesize an
aborted reply for each. It is a large change with a poor return. The restarted
process does not know whether the work completed before the crash, so its
synthesized reply is a guess dressed as a verdict; the store becomes a new
availability dependency on the hot path of every request; and the pattern
stops being a metadata convention, which was the property the whole posture
was bought for.

The proportionate answer is the one above: the caller notices quickly, learns
*why*, and decides. If an exchange genuinely needs the guarantee that it will
be answered exactly once even across a crash, that exchange is not a
correlated conversation over a broadcast bus — it is a durable work item, and
it belongs in a queue with claiming, acknowledgement and replay.

## When not to use this

Nothing here is optional for a wait against a separate process. Inside one
process, where a crash takes the requester down with the responder, the
restart exit is unreachable and only the deadline applies.
