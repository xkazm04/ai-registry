---
layer: technique
type: technique
subject: stream-proxy-hop
technique: reconnect-storm-hygiene
status: forged
laws: [creation-names-reaper, count-carries-predicate]
shared_with: []
use_when: [every event arrives twice after a reconnect, an outage is amplified by clients retrying in lockstep, deciding what a view shows while its stream is down]
---

# Reconnect storm hygiene

This technique is the client half of the hop's contract, and it is scoped
deliberately: it covers only what **the hop forces on the client**. The
subscription's own lifecycle — attaching and detaching, the cancelled-flag
discipline, singleton listeners fanned out to consumers, what a pushed event
means to local state — belongs to
[subscription-lifecycle](../../../../client-architecture/realtime-events/techniques/subscription-lifecycle.md)
and its siblings, and is not restated here. What is here is the consequence of
sitting behind an intermediary: the hop's errors instruct a machine that
retries, and an unhygienic retrier converts one upstream outage into a
self-inflicted second one.

## The single-socket guard

**Close the previous connection before opening the next one.** Unconditionally,
defensively, even where the code path "cannot" have left one open.

The reason is specific rather than general tidiness. A stream client that
reconnects on its own, plus application-level reconnection, plus a view that
re-runs its setup on a dependency change, produce interleavings where a connect
is issued while a previous socket is still live. The result is two sockets from
one view to the hop. Both receive every event, so the application sees each
event **twice** — which is not a cosmetic bug: duplicated increments,
duplicated appends, duplicated side effects. And on the hop's side it is two
long-lived upstream connections where one was budgeted, at whatever multiple
of the intended connection count the thrash produces.

The guard is one line at the top of the connect path and it is the cheapest
insurance in this subject. Its absence is invisible in testing, because a
single well-behaved reconnect never produces the interleaving; it appears in
production, under exactly the flaky-network conditions the reconnect logic
exists for.

## One pending timer, cleared before it is replaced

**Clear the pending reconnect timer before scheduling another**, on the same
unconditional basis ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)).

The situation that produces the orphan is worth naming because it surprises
people: a stream client can fire its error handler **more than once** for a
single failure — once when the connection attempt fails, again as the
underlying state settles, and again if the client's own internal retry also
gives up. Each invocation of a naive handler schedules a reconnect. Now two or
three timers are pending, each will connect, and each connection's failure
schedules more. What began as one outage is now an exponentially growing
population of timers on a single client, all of them aimed at an origin that is
already unwell.

So the handler must be **idempotent with respect to scheduling**: clearing the
prior timer, and refusing to schedule at all when a connection attempt is
already in flight. The teardown path clears it too, or a view that unmounts
during an outage reconnects after it is gone.

## Backoff with a ceiling, and jitter

Delay grows exponentially from a small base to a stated ceiling — the ceiling
matters as much as the growth, because unbounded doubling eventually means a
client that will not recover for an hour after a thirty-second blip.

Add **jitter**. Every client that lost its connection lost it at the same
instant, because they all lost it to the same event; without jitter they all
return at the same instant too, and the origin that just came back is knocked
over by a synchronized wave from the entire population. Randomizing each delay
within a window spreads the return across it. This is the one place where the
client's politeness is load-bearing for someone else's availability, and it is
cheap.

The base, the ceiling, the multiplier and the attempt limit belong in **named
constants, together, beside the heartbeat period** — see
[idle-heartbeat-injection](./idle-heartbeat-injection.md). Read separately they
each look reasonable; read together they reveal the pathologies, and the
pathologies are always in the relationship between them, never in one value.

## Retryability comes from the hop, not from a guess

The client's decision to come back at all should be a function of what the hop
said, not of the client's optimism. A retryable error is retried with backoff; a
non-retryable one — an authorization failure, a request the origin will refuse
identically forever — stops the loop and surfaces a state the user can act on.
A client that retries everything will hammer an origin over a condition that
retrying cannot fix; a client that retries nothing gives up on a redeploy.

The uncomfortable part is that **the reconnect handler usually cannot read the
answer.** The standard stream client's error callback carries no status and no
body — it reports only that the connection is not up — so a loop built on that
callback alone is structurally blind and will retry a permanent failure
forever. The repair is not to wish the callback were richer; it is to give the
loop a sighted companion. The fallback read path (below) is an ordinary
request: it *can* see a status and a body, and it is the natural place to
learn that the condition is non-retryable and to stop the loop. Wire that
explicitly. A design that assumes the blind callback branches on the hop's
error code has an error vocabulary
([upstream-status-normalization](./upstream-status-normalization.md)) that
nothing on the retry path consumes.

There is also an attempt limit. After it, the client stops and says so: a
visible, honest **disconnected** state with a manual retry the user can press.
Retrying forever with a friendly indicator is the green-over-dead failure
reproduced at the client's own hands.

## Fallback polling runs *while* reconnecting, not instead of it

The instinct on repeated failure is to give up on the stream and switch to
polling. That is one option too many: run **both**.

Polling starts when the stream is known to be down and continues alongside the
reconnect attempts, so the surface keeps showing fresh — if less timely — data
throughout the outage, and picks up live updates the moment a reconnect
succeeds. Three rules keep the pair coherent:

- **The poll and the stream must not double-apply.** They deliver the same
  facts by different roads, so the surface reconciles them by identity, exactly
  as it would reconcile any two sources — which is the neighbour's ground
  ([push-vs-refetch-reconciliation](../../../../client-architecture/realtime-events/techniques/push-vs-refetch-reconciliation.md)),
  and is much easier if pushed events invalidate rather than replace.
- **The poll is stopped by the reconnect's success**, in the connect handler,
  not left running because nobody owned its ending. It is another resource whose
  creation names its reaper.
- **The poll interval is not the stream's cadence.** It is a degraded mode; a
  poll fast enough to imitate the stream turns a partial outage into a load
  problem across the whole client population.

Switching *instead* of reconnecting has a failure mode that outlasts the
outage: nothing ever tries the stream again, the polling mode becomes
permanent, and the system quietly runs at degraded cost and latency for weeks
because no alert distinguishes "polling because streaming failed" from "working
normally".

## What the client owes the surface

The connection indicator reflects **the last thing that actually arrived**, not
the fact that a connect once succeeded. Distinguish live, reconnecting
(with the attempt count), degraded-but-polling, and failed — four states,
because the user's correct reaction differs in each, and because an indicator
with two states will be showing the wrong one during every interesting moment.
Where a count is shown or logged, it carries what it counts
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
"reconnect attempt 4 of 10" is actionable, "reconnecting" is wallpaper.

## When not to use it

- **When the stream is not auto-reconnecting.** A deliberately one-shot stream
  whose end is meaningful needs none of this; adding reconnection to it changes
  the contract.
- **When a connection is genuinely single-instance by construction** — a client
  that provably holds one at a time, enforced structurally. The guard is still
  nearly free, and "provably" is a claim that survives fewer refactors than
  people expect.
