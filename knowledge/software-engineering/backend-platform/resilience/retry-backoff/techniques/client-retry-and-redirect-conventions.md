---
layer: technique
type: technique
subject: retry-backoff
technique: client-retry-and-redirect-conventions
status: forged
laws:
  - verdict-survives-boundary
  - failure-not-empty-success
  - unknown-is-not-a-value
shared_with: []
use_when: [writing the client library for a replicated or redirecting server, a client follows a redirect chain into a loop or onto plaintext, a not-found response carried data the client threw away, deciding whether a precondition-failed response is retryable, choosing where fatal-versus-retry lives in a client]
---

# Client retry and redirect conventions

A server that is replicated, that redirects callers between its nodes, and
that rate-limits them is a server whose *client library* carries half the
resilience contract. The server can say "not the leader", "not caught up yet",
"too many", "gone" — but every one of those is only as useful as the client's
reading of it, and a client library is where a thousand applications inherit
one reading. The naive client, a loop around a transport with a status check,
misreads all of them: it retries a permanent precondition, follows a redirect
into a loop or onto an unencrypted scheme, discards a not-found that carried
the answer, and treats every too-many-requests as the same limiter. This
technique is the set of conventions a client library states once so that no
application has to.

## The retry set is stated, and precondition-failed joins it conditionally

The client retries on a **stated status set**, not on "anything above five
hundred". The set names the server-side transients — internal error,
unavailable, gateway timeout, overload — and, with one condition attached,
*precondition failed*. The condition is that the client carries a
**consistency index**: an opaque monotone token the server handed back with a
prior write, which the client echoes on subsequent reads so that a replica can
tell whether it has caught up to that write. A replica that has not answers
precondition-failed, and in that reading the status means *not yet* — the
replica is healthy, the write is real, the client is early — which is
transient by every definition the golden path uses. Without the index the same
status means what it always meant: a real precondition the request did not
satisfy, permanent, never retried. The status is the same; the class depends
on what the client sent, and the classifier must know it.

The naive reading — precondition-failed is a client error, client errors are
never retried — silently turns read-your-writes into read-your-writes-sometimes:
the application writes, reads on a lagging replica, receives a refusal it does
not retry, and reports the write lost. The opposite naive reading — retry every
precondition-failed — hammers a server over a request that will never succeed.
The condition is what separates the two, and the classification happens at the
transport boundary where the request's headers are still in hand
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).

## Exactly one redirect, and never a downgrade

A replicated server redirects a client that reached the wrong node — a
follower that cannot serve the request, a node that has just stepped down. The
client **follows exactly one redirect**. One hop covers the legitimate case
completely (the node that redirected knows who the leader is); a second hop
means the leader has changed under the client, and the honest move is to
re-issue the original request on the ordinary retry ladder, not to chase
leadership through a chain. A client that follows redirects without a bound
converts a leadership flap into an infinite loop with no backoff, and every
such client in a fleet does it at once.

The redirect logic lives **in the same layer as the retry logic**, and the
transport underneath is told not to follow redirects on its own. The reason
is a counting error that is easy to ship: a transport that follows redirects
and reports the follow as an error to the retry loop above it makes every
redirect cost a full ladder of retries, so a client fleet hitting a follower
that redirects to the leader retries three times per hop against a server that
did nothing wrong. One layer decides what a redirect means; the other layers
see a final response.

The one hop is also **refused when it would downgrade the scheme**. A redirect
from an encrypted endpoint to a plaintext one is not a topology hint; it is
either misconfiguration or an attack, and a client that follows it has sent a
bearer credential in the clear on the server's say-so. The check is on the
redirect target's scheme against the original request's, before any header is
copied, and a downgrade is a permanent error with the two schemes in the
message.

## A not-found that carries content is an answer

Not-found is the status the naive client treats as the purest absence — no
body, no meaning, an empty result. Servers that serve secrets and leases have a
second use for it: the path exists, the object at it is gone or was never
written, but the response carries **data or warnings** — a deprecation notice,
a lease that has no secret left, a soft-deleted entry's metadata, a hint that
the caller asked for the wrong version. The client's rule is that **a not-found
whose body carries data or warnings is a response, returned to the caller as
one; only a not-found with an empty body is an absence**. Discarding the body
because the status said not-found converts a message from the server into
silence, and the warning it carried — often the only explanation the caller
will ever get — dies at the transport
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
The distinction is made at the response parser, which reads the body before
deciding what the status means.

## Too-many-requests is disambiguated by the path that raised it

A single status covers several speakers who mean different things. A rate
quota on a data path says *slow down and come back*; a per-tenant lease-count
ceiling says *you are at a limit no backoff will lift*; and a replicated
server's **health path** uses the same status to report a *role* — this node
is a follower, or is sealed, or is not initialised — because operators want a
load balancer to read node state from the status line without parsing a body.
The third speaker is the one that breaks a naive client: a health probe that
returns too-many-requests to mean *I am a healthy follower* is parsed as a
quota error, and the client's own status report becomes an error report about
a node that is fine. The client library **classifies the status by the path
that raised it** — the request path is known to the client, which makes the
disambiguation free — and attaches a distinct class to each: a response to be
parsed as data for the health path, retry-at-stated-time for the quota,
permanent-with-limit-named for the ceiling. Where the server lets the caller
choose which status each role reports, the client asks for codes that its own
error rule will not intercept, so the health report always arrives as a body.
Treating all of these as one rate-limited class is the naive reading; it fails
either by backing off against a node that was never limiting anyone, or — for
a lockout window that a server may also surface through this status — by
retrying against a window that retries extend.

## Linear backoff, jittered, with the stop as a configuration

The client's ladder is **linear** — a minimum plus a step per attempt, capped —
rather than exponential, because a client speaking to a server it *trusts to
be nearly always up* wants bounded worst-case latency more than aggressive
shedding; the exponential ladder is the right shape for the server's own
background work against remotes it does not trust (the revocation loop is the
paired technique). What the linear ladder must not lose is **jitter**: a fleet
of clients that all failed on the same leader change and all sleep the same
linear schedule return in lockstep, and a linear ladder synchronises a herd
exactly as well as an exponential one. Every rung is randomised within a band;
the band is proportional to the rung, and the draw is per client, per attempt.

The last convention is structural. **Whether an error is fatal or retried is
a property of the backoff's configuration — a stop value returned by the
schedule — not a branch in the request loop.** The loop asks the schedule for
the next delay; the schedule answers with a duration or with *stop*; and the
loop's only decision is whether it received a duration. A client configured
with zero retries, or a maximum elapsed time already spent, receives *stop* on
the first ask, and the request fails exactly once with no special case. This
is what lets an application choose "fail fast" or "retry for a minute" by
configuration alone, and it is what keeps the request loop free of the
accreting `if err is X then return` ladder that every naive client grows,
each branch a classification decision made where the structured error is no
longer in hand. Fatal is a schedule that stops now; retry is a schedule that
has not stopped yet; the loop cannot tell them apart and should not be able
to.

## Decision rules

- **When the response is precondition-failed and the request carried a
  consistency index, retry on the ladder; when it carried none, fail
  permanently.** Because the status is transient only relative to a write
  the client is waiting to see.
- **When redirected, follow one hop with the scheme checked; on a second
  redirect, re-issue the original request through the ordinary ladder.**
  Because one hop is topology and two is a flap, and a chain has no backoff.
- **When a not-found carries data or warnings, return it as the response.**
  Because the server said something and absence is a claim the body must
  support ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
- **When too-many-requests arrives, classify by the raising path before
  choosing a delay.** Because a lockout retried is a lockout extended.
- **Put fatal-versus-retry in the schedule's stop value, never in the loop.**
  Because a loop with fatal branches is a second classifier, and it drifts
  from the first the day someone adds a status.

## Where the conventions end

The reasons a replica redirects, refuses a write, or answers precondition-
failed belong to the subject that owns read-serving replicas and the
client-carried index; this technique owns only what the client does on
receipt. The server-side quota ladder that produces too-many-requests belongs
to rate-limiting; the client's reading of it is here.
