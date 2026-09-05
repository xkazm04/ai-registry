---
layer: technique
type: technique
subject: stream-proxy-hop
technique: lifetime-cap-rotation
status: forged
laws: [failure-not-empty-success, creation-names-reaper]
shared_with: []
use_when: [a stream dies at the same age every time regardless of traffic, a heartbeat is running and the stream still drops, deploying a streaming route on a function platform with a maximum duration, an error handler that never runs on the failures it was written for]
---

# Lifetime cap rotation

A heartbeat keeps a connection out of the *idle* state. It does nothing
against a timer that never asked whether the connection was idle: a
**total-duration cap**, counted from the first byte, that terminates the
stream — or the process serving it — when it expires, however busy the lane
was. Function platforms carry one as the maximum invocation time; some
gateways carry one as a whole-response budget; some content networks as the
maximum a single fetch to the origin may take. The technique is to treat that
cap as a design input rather than an incident: **end every stream on purpose
before the cap, with a marker the client can resume from, and let the client
reconnect through the ordinary path.**

## Why this is a different timer

The two classes of timer fail in different shapes, and the difference is what
makes the cap the more dangerous one:

- **An idle timeout closes a connection.** The hop is still running, its
  `finally` executes, the heartbeat is cleared, the upstream reader is
  cancelled, telemetry records an end. What the client sees may be wrong, but
  the hop's own accounting is intact.
- **A duration cap kills the hop.** On a function platform the invocation is
  terminated: no exception is raised inside the stream, the `catch` that would
  have emitted a terminal error event never runs, the `finally` that reaps the
  timer never runs, and the client sees a socket die mid-answer with no
  in-band explanation. The error contract the hop was built around is
  unreachable by exactly the failure the clock guarantees will eventually
  occur. It is failure spelled as empty success
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success))
  with the platform, not the transport, doing the spelling.

The diagnostic signature is precise and worth teaching to the on-call reader:
**streams die at the same age**, to within a second, regardless of how much
traffic they carried. An idle reap correlates with quiet stretches; a cap
correlates with the clock. A hop that logs stream age at close, as the subject's
operator obligations ask, distinguishes the two in one query.

## The rotation

- **Know the cap, and declare the route's own.** Platforms expose the cap as a
  per-route setting with a default that is frequently shorter than a streaming
  route needs; a route that does not declare its own runs on the default, and
  the default is what an unrelated cost-control decision set it to. Declare it
  beside the heartbeat constants, because the three numbers — heartbeat period,
  reconnect backoff, lifetime — are read together or misread separately.
- **Close before the cap, not at it.** The hop's own deadline is the cap minus
  a margin large enough to flush and close cleanly: it stops reading upstream,
  emits a terminal event from its closed vocabulary that says *rotated, resume
  from here* rather than *failed*, and closes the response. The client's
  reconnect logic — which the hop already forces on the client — reopens, and
  the standard stream client does so on its own.
- **Carry the resume cursor across.** A rotation is lossless only if the
  reopened stream continues where the closed one stopped. The standard client
  sends the last event identifier it saw on every reconnect; the origin, if it
  keeps a replay window, fills the gap from it. The hop's job is to **forward
  that header upstream** — it is the header an explicit allowlist most reliably
  drops, and the whole rotation is silent data loss without it (see
  [credential-attachment-at-the-hop](./credential-attachment-at-the-hop.md)).
  Where the origin keeps no replay window, the rotation is still better than
  the kill — the client learns it must refetch — but it is not lossless, and
  the terminal event should say so.
- **Reap on the deadline path too.** The rotation is a third exit beside abort
  and upstream end, and it clears the heartbeat and cancels the upstream reader
  like the other two, in the same handler
  ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)).

## The rotation does not replace the heartbeat

The two techniques stack. A stream under both a sixty-second idle timer and a
five-minute cap needs the heartbeat to survive the first and the rotation to
survive the second; each alone leaves the other failure in place, and the
symptom of the missing one is what the previous section's signature tells
apart. Nor does the rotation license a short cap: every rotation is a
reconnect, a replay, and a moment of double-delivery risk on the client, so the
declared lifetime is the longest the platform allows, not the shortest that
works.

## When not to use it

- **When the path has no duration cap** — a long-running process behind
  intermediaries that carry only idle timers. Rotation then adds reconnects for
  nothing; the heartbeat is the whole answer.
- **When the stream is bounded by construction** — a job's output stream that
  closes at a terminal state well inside any cap. Then the cap is a bug budget
  for a stuck job rather than a lifetime, and the right declaration is a cap
  generous enough for a slow legitimate run plus a watchdog on the job.
- **When the client cannot resume.** A one-shot consumer with no reconnect
  logic gains nothing from a rotation it will not follow; for it the cap is a
  hard ceiling on the stream's useful length, and that ceiling belongs in the
  product's contract rather than in a silent kill.
