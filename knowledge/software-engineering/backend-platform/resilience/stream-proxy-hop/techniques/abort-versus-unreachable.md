---
layer: technique
type: technique
subject: stream-proxy-hop
technique: abort-versus-unreachable
status: forged
laws: [failure-not-empty-success, creation-names-reaper]
shared_with: []
use_when: [error dashboards spike whenever traffic does, a real outage was hidden inside navigation noise, deciding what a hop returns when the client disappears]
---

# Abort versus unreachable

A long-lived stream ends in two categorically different ways that arrive at the
hop looking almost identical: **the client went away**, and **the origin
failed**. Both present as a connection that stopped mid-flight. Only one of
them is a problem. The technique is telling them apart at the point they occur
and answering each with a response and a telemetry posture that fits — because
conflating them destroys the operator's signal in whichever direction the
conflation runs.

## Why this pair specifically

On an ordinary request the ambiguity barely exists: requests are short, clients
rarely abandon them, and a mid-flight failure is almost always real. On a
stream held open for minutes, abandonment is the **dominant** exit. Users
navigate, views unmount, tabs are discarded and reclaimed, and the client's own
reconnect logic deliberately aborts in order to re-open. A busy surface will
see many benign aborts for every genuine upstream failure, and that ratio is
what makes the conflation so damaging:

- **Count aborts as errors** and the error rate becomes a traffic metric. It
  rises during the day, falls at night, spikes when a popular page ships — and
  a real outage adds a bump that no threshold can find, because the baseline
  already moves more than the incident does. The dashboard is not merely noisy;
  it is actively misleading, and the standard response — raising the alert
  threshold until the noise stops — raises it above the incident too.
- **Treat real failures as aborts** and the outage produces no signal at all:
  failure spelled as empty success
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)),
  with the hop doing the spelling on purpose.

## Detecting the abort

The abort is knowable, and it is knowable *first* — before any attempt to
interpret an upstream error. The request carries a cancellation signal that the
runtime raises when the downstream connection goes away, and the hop's error
handling asks that signal before it asks anything else. Two rules keep the
detection honest:

- **Check the signal, not the exception's shape.** A cancelled read often
  surfaces as an exception whose type or message resembles a network error, and
  matching on that text is a classifier that silently changes behaviour when a
  runtime rewords its errors. The signal is the authority; the exception is
  evidence.
- **Ask at every catch site on the request path.** An abort can land while
  connecting upstream, while awaiting the first byte, in the middle of the
  stream, or inside the heartbeat's own write. Each of those is a separate
  handler, and any one of them that skips the check will report a navigation as
  an outage.

## The two answers

**Client abort** — a distinct status, **no body**, and **no error telemetry**.
No body, because there is nobody left to read it and serializing one is work
performed for a closed socket. A distinct status, because logs and access
records still capture the request and the whole point is that it be
recognizable there at a glance. No telemetry, because nothing went wrong: an
abort is a normal termination of a normal stream, and recording it as an
incident is what creates the baseline described above. If aborts are worth
counting at all — and a sharp change in the abort rate is genuinely
interesting — they are counted as **their own metric**, never folded into
errors.

**Origin unreachable or failing** — the structured, branchable error the hop's
vocabulary defines: a stable machine-readable code, an explicit retryability
flag, a message safe to display, and a correlation handle. This is counted, by
cause, and the operator-side record carries what the client's copy must not
(see [origin-non-disclosure](./origin-non-disclosure.md)). Distinguish the
causes while you have them: refused connect, resolution failure, upstream
timeout, upstream error status, and mid-stream drop are five diagnoses, and a
single total supports none of them.

The mid-stream drop deserves its own note, because it is the case that most
often falls between the two answers: the response headers are already sent and
the status is already committed, so there is no status left to change. What the
hop can still do is **emit a terminal error event into the stream itself**
before closing — a message from the same closed vocabulary — so the client
learns the stream ended abnormally rather than inferring a clean finish. A hop
that silently closes a stream mid-flight recreates, at its own hands, exactly
the green-over-dead failure the heartbeat exists to prevent.

## The abort is also a reaping trigger

Detecting the abort is half the obligation; the other half is that everything
the hop created for that request dies with it
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)). On the abort
path, in one handler, written together:

- **the heartbeat timer is cleared** — otherwise it ticks forever against a
  closed stream;
- **the upstream reader is cancelled** — otherwise the hop keeps draining the
  origin's response for a client that left, holding a connection from a pool
  and paying transfer costs for bytes nobody will see;
- **the upstream connection is released**, and any per-request state the hop
  registered is removed.

Splitting these across separate handlers is how one of them gets forgotten. The
symptom of forgetting the reader cancellation in particular is subtle and slow:
the hop's upstream connection count tracks *cumulative* client departures
rather than current clients, and nothing in any log names a responsible
request, because the responsible request already ended successfully from the
runtime's point of view.

## When not to use it

- **When the surface has no long-lived requests.** For short requests the abort
  rate is a rounding error and the distinction costs more code than it earns —
  though the cheap version (ask the signal before classifying the error) is
  nearly free and worth keeping.
- **When the abort itself is the anomaly you are hunting.** A client that
  aborts because it crashed is a real defect, and a surface investigating one
  legitimately wants aborts loud. Make that a deliberate, temporary,
  separately-named measurement — not a merge of the two categories, which is
  the thing this technique exists to prevent.
