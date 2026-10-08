---
layer: technique
type: technique
subject: stream-proxy-hop
technique: progress-lease-not-wall-clock
status: forged
laws: [failure-not-empty-success, limits-are-derived]
shared_with: []
use_when: [a long transfer is killed by an absolute timeout while still moving bytes, a keep-alive answered by the peer is keeping a stalled write alive, choosing what a liveness deadline measures, a slow uplink makes healthy sessions reconnect]
stage: multi-service
---

# Progress lease, not wall clock

A deadline answers one question: *has this session stopped?* There are two
ways to get the answer wrong, and a single absolute number gets both. A
**total-duration cap** kills a transfer that is slow but moving, so the slow
link the system most needs to serve is the one it keeps cutting off and
restarting. A **reply-based liveness check** (ping, pong, any inbound frame)
keeps a stalled write alive, because the peer can answer a keep-alive while it
is still waiting for the rest of the message you are trying to send. The
technique is to bound **time since the byte stream last moved**, measured at
the lowest layer that can see bytes, and to decide separately which direction's
movement counts as evidence of what.

This is the endpoint-side counterpart to
[idle-heartbeat-injection](idle-heartbeat-injection.md). That technique keeps a
connection out of the idle state so a middlebox does not reap it. This one
decides when the *endpoint itself* should give up. The two meet at the
keep-alive: it is the right tool against an idle reaper and the wrong evidence
that a blocked write is progressing.

## The rule

1. **The lease renews on byte movement, not on elapsed time.** Hook the
   transport beneath message framing: a slow frame is healthy while its bytes
   move, even though the call that sends or receives it has not returned.
   Record a monotonic timestamp on every successful read and write of the
   underlying stream; the deadline is `last_progress + lease`, recomputed
   whenever the watchdog wakes. The cost is one relaxed store per I/O, no extra
   frames, no wake broadcast.
2. **A blocked write is judged on write progress only, and replies do not
   renew it.** While a send is pending, extend the read side's grace by the
   write's byte progress (the peer cannot answer a frame it has not finished
   receiving), but let the write's own deadline see only write progress. A pong
   or echo that arrives during a stalled write must not extend it, and a
   buffered ping that the local stack accepted immediately is not peer
   liveness either. Give a slow *completed* send a lease to receive its reply;
   do not let that grace apply to sends that never blocked.
3. **Each direction owns its own await point.** A full send buffer must not
   stop reads or silence detection; a full consumer queue must not stop the
   writer's deadline. Run the two halves as independent futures under one
   `select` and give the hand-off to the consumer its own bounded wait.
4. **Expiry closes the whole session and never resumes a partial send.** A
   cancelled write may have put half a frame on the wire. Recovery belongs to
   the protocol above the socket: replay from a durable cursor with the
   existing deduplication ids, and fail uncertain mutations instead of
   replaying them.
5. **Make slow drains observable to the peer, then to you.** A message that
   fits the local send buffer completes locally while the remote uplink takes a
   minute, so nothing on this side distinguishes "sent" from "stuck". Split large
   messages into small fragments with a control ping between them; the peer's
   answers then arrive as the drain progresses and the progress clock sees
   them. Small messages and idle cadence stay unchanged, and the framing cost
   is a fraction of a percent. Fragmentation is a visibility device, not
   compression.

## Why not a longer timeout

A tuned total timeout moves along the same tension in both directions: raise
it and a dead peer is detected late; lower it and a slow healthy transfer is
killed. Two trips through that parameter is the diagnostic that it is the
wrong control surface (the same shape as
[renewal-beats-a-tuned-timeout](../../../inference-serving/cross-instance-cache-lease/techniques/renewal-beats-a-tuned-timeout.md) in another subject: replace the number with renewal on evidence of
life). What differs here is the evidence. Renewal on *any* inbound traffic is
the reply-based check from the opening, and rule 2 exists because it fails the
other way.

## Tests that carry the rule

Time-dependent liveness logic is tested with a paused virtual clock and a
fake peer, never with real sleeps. The cases worth having are the failure
modes this technique prevents, one test each:

- the peer sends only echo traffic and never answers keep-alives: the session
  must still expire at the lease;
- a write stalls while the peer's pongs keep arriving: the session must still
  expire;
- a write stalls: inbound frames must still be delivered meanwhile;
- the consumer is dropped during a stalled write: the writer must release at
  once, not at the lease;
- the consumer queue is full: the hand-off has its own deadline;
- a slow but healthy link: text and binary order are preserved and nothing
  expires.

## Boundary

This is not a statement about HTTP idle reaping (that is the heartbeat
technique) and not a retry policy (the reconnect side is
[reconnect-storm-hygiene](reconnect-storm-hygiene.md)). It decides only what
a liveness deadline measures. A transfer with a known hard ceiling (a billing
window, a lifetime cap) keeps that ceiling in addition; the lease is for the
open-ended case.
