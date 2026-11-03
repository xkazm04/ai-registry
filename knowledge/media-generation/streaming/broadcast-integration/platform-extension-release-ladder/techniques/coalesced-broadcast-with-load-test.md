---
layer: technique
type: technique
subject: platform-extension-release-ladder
technique: coalesced-broadcast-with-load-test
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [sending live state such as vote shares from a backend to every viewer's extension, sizing a backend for a channel's audience before review, a broadcast budget exhausted at a busy moment]
stage: team
---

# Coalesced broadcast with load test

Live state reaches viewers' extensions through the platform's per-channel broadcast: one
message from the backend, delivered to every viewer of the channel. That channel is small
and slow on purpose — a message of a few kilobytes, on the order of one per second per
channel, with a shared budget the platform enforces. So the backend never forwards
events. It folds them into the current state and broadcasts a whole snapshot on a fixed
cadence, and the team measures the full path at the expected audience size before the
version goes to review.

## Why events fail

The naive build broadcasts each vote, click or contribution as it happens. On a quiet
channel it works, which is why it ships. At a busy moment the event rate passes the
budget in seconds; the platform starts refusing messages; the backend queues them; and
viewers receive the picture of thirty seconds ago, late, while the vote has already
closed. Events also make every viewer a reconciler: a viewer who joined mid-vote has
missed the earlier events and draws a wrong total until something resets it.

A snapshot fixes both. Its size is bounded by the state, not the traffic, and the latest
snapshot is complete, so a viewer who joins, reloads or misses a message is correct on
the next one.

## Procedure

1. **Define the snapshot.** It carries what the extension draws — phase, shares, totals,
   remaining time, a sequence number — and nothing else. Viewer identities and raw
   inputs stay on the backend, for the same reasons an overlay payload stays aggregate.
2. **Broadcast on a cadence below the budget.** Pick an interval with headroom under the
   platform's rate, and send the current snapshot when it changed. A burst of a thousand
   votes in one interval is one message. A cadence equal to the rate has no headroom.
   Where the budget behaves as a bucket that refills at that rate, as developers have
   measured it doing, a steady sender at the rate never refills, and one retry or one
   second feature drains the burst allowance until messages are refused.
3. **Check size before sending.** Serialise, measure against the message limit, and
   refuse on the backend if it is over. Bound every list and string so the snapshot
   cannot grow with the audience.
4. **Read the budget the platform reports, and count your own.** Where the response
   carries a remaining-budget signal, honour it. Developers have read one from response
   headers, but the platform's reference does not document it, so the broadcaster also
   counts its own sends against the documented figure and treats a refusal as the
   signal. When the budget is short, lengthen the interval instead of queuing.
5. **Never let viewers make up the difference by polling.** A late-joining viewer may
   fetch the current snapshot once from the backend, with jitter, and then listen. A
   viewer that polls on a timer multiplies backend load by the audience.
6. **Mind other consumers of the same channel.** The per-channel budget is shared by
   everything that broadcasts for that extension on that channel. Two backend features,
   or two instances of one, that each think they own the budget will together exceed it;
   one broadcaster process owns the channel.
7. **Test the coalescer offline first.** Drive the broadcaster with an input rate far
   above the budget — a hundred updates a second for one channel — and assert that its
   output never exceeds the chosen cadence and that the last state in each interval is
   the one sent. It is a cheap, deterministic test that runs on every build, long before
   any platform rung.
8. **When the platform's own documents disagree on the limit**, design to the stricter
   figure and measure the real behaviour on the hosted test rung, where the platform's
   budget actually applies. Record which figure held.
9. **Load-test the whole path.** Simulate the target audience: the expected viewer count
   joining in a spike, the expected peak input rate, every viewer receiving every
   broadcast, and the late-joiner fetch at the same time. Record the backend's latency and
   error figures and the broadcast budget's headroom at that size. A version whose path
   was never run at size has an unmeasured capacity, not a sufficient one.

## Decision rules

- **When state changes faster than the cadence**, coalesce; the last snapshot in an
  interval wins.
- **When a snapshot would exceed the size limit**, cut what is drawn, not the bound.
- **When the budget is refused**, drop to a longer interval and resume; never replay the
  queue.
- **When a viewer needs data only they should see**, it is not a broadcast; it is a
  per-viewer request to the backend, authenticated by the platform's viewer token.
- **When the audience target changes by an order of magnitude**, run the load test again
  before the event, not after.

## When not to use it

An extension with no live state — a static panel of links and copy — needs no broadcast
path. One whose state changes a few times an hour can broadcast on change without a
cadence, but still sends whole snapshots.
