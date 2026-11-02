---
layer: technique
type: technique
subject: streaming-platform-api-custody
technique: event-stream-gaps-not-guesses
status: forged
laws: [unmeasured-is-not-pass, output-never-outruns-evidence]
shared_with: []
use_when: [handling a dropped or migrated connection to the platform's event subscription, deciding what a tally or moderation queue reports for a period the tool did not observe, sizing internal event queues]
---

# Event-stream gaps, not guesses

When the tool loses events - a dropped connection, a missed keepalive, an internal queue that
overflowed - it records a gap with both edges and carries it into every consumer. It never
interpolates across the gap, never estimates what probably arrived, and never reports a
verdict for a message it did not receive.

## Why the platform's stream has holes

The platform's event subscription is a push stream with no replay: events delivered while the
client was disconnected are gone. A reconnect restores the future, not the past. The tool's
consumers - a vote window, a giveaway's entry pool, a contribution meter, the moderation
queue - all assume they saw everything, and nothing in a resumed stream tells them otherwise.
Unless the tool says so, a tally across a ninety-second drop is presented with the same
confidence as a complete one, and a moderation pass that never saw the messages from that
interval reads as "nothing to act on".

## The procedure

1. **Keep the connection honestly.** Treat a missed keepalive inside the negotiated timeout as
   a lost connection; do not wait for the socket to error. On a planned migration notice, open
   the new connection at the address given - after checking it is on the platform's expected
   host - and keep the old one open until the new one is welcomed, so a planned move loses
   nothing.
2. **Record the gap with edges.** When the stream is lost, note the timestamp of the last event
   actually received; keep that edge across however many failed reconnect attempts follow.
   When coverage is restored - the new session welcomed and its subscriptions recreated -
   note that moment. The gap is the interval between them, emitted as a first-class event in
   the same stream consumers read. It marks missing coverage; it never claims a replay.
3. **Resubscribe deliberately.** A new session after a drop needs its subscriptions recreated,
   within the platform's subscribe deadline, within its per-connection and per-grant limits -
   pack topics into connections before opening any, and give each connection its own state
   machine, keepalive deadline and reconnect backoff. Keep reading the socket while
   subscribing, or a long batch starves the keepalives. A subscription that fails to come back
   is another kind of gap: open-ended for that event type until it does.
4. **Bound internal queues and make overflow a gap.** Events flow from the socket into a bounded
   buffer, and the producer never awaits the consumer. When the buffer overflows, a gap is
   recorded from the last event the consumer actually processed - not from the moment it
   noticed, which can be seconds later and would hide the loss - to the moment it resumed. An
   unbounded buffer only moves the failure to memory; back-pressure onto the socket only moves
   it to the platform, which closes a connection that stops reading.
5. **A failed item is a gap, not the end of intake.** When processing one event fails, mark it
   and continue; only a lost grant ends the intake lane.
6. **Propagate to consumers.** Each consumer states how it handles a gap: a tally is marked
   incomplete for the interval; an entry window names the interval in its fairness statement;
   a moderation verdict for that interval is "unseen". Displays that summarise carry the mark.

## Decision rules

- **When a gap falls inside a vote or entry window**, the result is published with the gap
  stated, or the window is voided and rerun; it is never published as complete.
- **When the platform offers a read endpoint for the missed state** (current follower count,
  a list of bans), a fresh read may replace the guess for state, but not for events: a count
  read afterwards is a count, not the missing events.
- **When a duplicate arrives after reconnect**, de-duplicate by message identifier; do not
  shrink the recorded gap on that basis.

## When not to use it

A purely cosmetic consumer - an ambient visual that reacts to chat activity - may simply
resume after a gap without marking it, provided nothing it shows is a count or a claim.
