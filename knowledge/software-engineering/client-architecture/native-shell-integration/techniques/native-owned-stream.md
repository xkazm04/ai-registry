---
layer: technique
type: technique
subject: native-shell-integration
technique: native-owned-stream
status: forged
laws: [limits-are-derived, failure-not-empty-success, creation-names-reaper]
shared_with: []
use_when: [a long-lived stream stops delivering whenever the window is hidden or backgrounded, adding reconnect logic has not fixed a stream that dies silently, choosing an idle timeout for a subscriber that never sees an error, a reconnect loop spins because the connection succeeds and then goes quiet, deciding which streams move to the native process and which stay in the view]
---

# Native-owned stream

A long-lived stream — a server-push channel, a websocket, any connection whose
value is that it stays open — owned by a presentation context the host is
entitled to throttle is **unreliable by construction**. Hidden views,
backgrounded surfaces and inactive tabs have their network suspended by policy.
Nothing errors. The connection is not closed; it is starved, and every retry
mechanism the client has is built to observe failures that do not occur. This
is the one class of streaming defect that reconnect logic cannot fix, and the
reason it is worth its own technique is that the symptom — "events sometimes
don't arrive" — reads as flaky infrastructure and sends teams to harden the
wrong layer for weeks.

## Relocate ownership; do not harden the client

The native process is not throttled by the host's presentation policy. It holds
the stream, and it fans the events out over the local bus, which the host does
deliver to hidden views — that asymmetry is the entire mechanism, and it is
worth verifying on the target host before building on it: find one channel that
already reaches a hidden view reliably and one that does not, and the boundary
is established by observation rather than by assumption.

After the move the view is a **pure renderer**. It subscribes to a local event
name and paints. It holds no connection, no reconnect state, no backoff timer,
and — importantly — no opinion about whether the producer is healthy, because
it can no longer observe that. Health belongs to the owner. A view that keeps a
"disconnected" indicator wired to a stream it no longer owns will show a state
it is not entitled to know.

## The split is deliberate and partial

Moving every stream is over-correction. The question per stream is: **must this
arrive when nobody is looking?**

- **Yes** — anything that changes what the product will do, surfaces a window,
  fires a notification, or must be acted on regardless of attention. It moves.
- **No** — a progress meter, a live preview, a log tail that only exists while
  a view is open. Suspension while the view is hidden is the *correct*
  behaviour: the work saved is real and the data missed is data nobody wanted.
  It stays, with a hard cap as its backstop so a view left open overnight does
  not accumulate an unbounded subscription.

Write the answer down per stream. An undocumented split becomes "streams are in
the native process now" within two quarters, and the progress meters follow the
notifications across for no reason.

## The idle timeout is derived from the producer's heartbeat

A relocated stream inherits the worst silent failure in the class: the producer
accepts the connection and then stops producing. The read blocks forever, the
task never notices, and no error is available anywhere
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).
The only defence is an idle timeout on the read, and the number is not a taste
question:

> **Idle timeout = producer heartbeat interval × (missed beats tolerated + 1),
> with the tolerance chosen and written down.**

Tolerating exactly one missed beat is the usual right answer: it absorbs a
pause, a brief stall, a scheduling hiccup, and it detects a genuinely dead
stream in a bounded time the product can state. Which makes the producer's
heartbeat a **contract term**, not an implementation detail of the producer —
if the producer changes its interval, the consumer's timeout is wrong in one
direction or the other, so the derivation is written beside the constant and
names the interval it came from
([limits-are-derived](../../../_laws.md#limits-are-derived)). A timeout picked
by feel gets raised by feel the first time it fires spuriously, and nobody can
then say what it is supposed to detect.

A stream with **no heartbeat at all** cannot be given a correct idle timeout —
any value is a guess about the quietest legitimate period. Add the heartbeat to
the producer first. That is a smaller change than it sounds and it is the only
one that makes the consumer's silence legible.

## Backoff resets on a productive round, not a connected one

The reconnect loop has one subtle rule and it is the one most implementations
get wrong. A round is **successful only if it produced at least one frame**.
Resetting the backoff on a round that merely connected turns the exact failure
the idle timeout detects — a producer that accepts connections and delivers
nothing — into a tight reconnect loop at the minimum interval, hammering a sick
producer and filling logs with identical lines.

So the loop carries three states, not two: produced frames and then closed
(reset the backoff and reconnect promptly — this is the ordinary "the producer
restarted" case and the user should not wait); connected but produced nothing;
and failed to connect. The last two escalate, doubling to a stated ceiling —
tens of seconds is the usual right order, long enough that a multi-hour outage
does not fill a log, short enough that recovery is noticed within one human
attention span. Each escalation logs once, with the attempt count and the next
delay, so an outage reads as a converging sequence rather than as noise.

The stream's own lifetime is named at the point it is spawned: what stops it,
what happens to it when the process is asked to quit, and whether a
reconnecting task outlives the surface it feeds
([creation-names-reaper](../../../_laws.md#creation-names-reaper)).

## Decision rules

- If a stream must arrive while the view is hidden, the native process owns it.
- The view keeps no connection state and displays no health it cannot observe.
- Idle timeout = heartbeat × (tolerated misses + 1); write the derivation next
  to the constant.
- No heartbeat on the producer means no correct timeout — add the heartbeat.
- Reset the backoff only for a round that produced a frame.
- Escalate to a stated ceiling; log once per escalation with attempt and delay.

## When not to use this

- **The stream serves only a visible surface.** Suspension is correct; move it
  and you pay for events nobody consumes.
- **The host does not throttle the presentation layer.** Then the view is a
  legitimate owner and the relocation buys a boundary crossing per event for
  nothing. Verify rather than assume — the throttling policy differs per host
  and per window state.
- **The event is rare and pollable.** A once-a-day change is served better by
  a poll on wake than by a connection held open all day for it.
