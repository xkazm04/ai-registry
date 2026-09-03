---
layer: application
type: application
subject: realtime-events
technique: capacity-packed-subscription-pool
stack: cpp
status: forged
verified_on: 2026-09-03
verified_against: cpp@23
---

# Capacity-packed subscription pool - two pools in one desktop chat client, each holding half the technique

How the Chatterino 2 desktop client realizes, and where it falls short of,
[capacity-packed-subscription-pool](../techniques/capacity-packed-subscription-pool.md),
read at 2.5.5, Qt 6 required (`CMakeLists.txt:71`, `:30,100`), commit
fda51f0d. The C++ standard the tree compiles against is what
`verified_against` names (`CMakeLists.txt:281`, `CMAKE_CXX_STANDARD 23`).
The finding that organises this record: the technique's two halves - the
capacity-packed connection pool and the per-topic state machine - both
exist in this tree, but in **two different pools that never meet**. The
generic live-updates pool packs and never counts references; the EventSub
controller counts references and never checks capacity.

## The generic pool: packing, pending queue, one connection at a time

`src/providers/liveupdates/BasicPubSubManager.hpp` is a CRTP template over
a client type; two providers instantiate it - the third-party emote
service's event API (`src/providers/seventv/eventapi/Client.cpp:21`, cap
100) and the chat provider's legacy push channel
(`src/providers/twitch/PubSubClient.hpp:49`, `MAX_LISTENS = 50`, passed at
`PubSubClient.cpp:25`). The cap lives on the client
(`BasicPubSubClient.hpp:33-38`, default 100) and is enforced at the one
place a topic enters a socket: `subscribe` refuses when the set is full
(`:94-97`), absorbs a duplicate as success (`:99-105`), otherwise records
and sends (`:107-114`).

The manager's `subscribe` (`BasicPubSubManager.hpp:121-133`) is the
technique's "first connection with room" rule: `trySubscribe` walks the
open clients and returns on the first that accepts (`:276-286`); only when
none does is a client added and the topic pushed onto
`pendingSubscriptions_` (`:130-132`, the ledger at `:298`). `addClient`
opens **one socket at a time** - the `addingClient_` guard at `:253`
returns while a handshake is in flight - which is exactly the burst rule
the technique states: a hundred subscribes open one socket, and
`onConnectionOpen` (`:146-186`) drains up to `maxSubscriptions` pending
topics into it (`:157-158`, `:164-177`) before asking for the next socket
only if anything remains (`:179-185`).

The drop handler makes the technique's two distinctions verbatim.
`onConnectionClose` (`:188-247`) takes the dead client's topic set as a
unit (`:205`) and reads `wasOpen` (`:206`): failed-before-open re-queues
the topics and schedules the next attempt on `ExponentialBackoff<5>` from
one second (`:225-241`, ladder at `:299`, so 1-2-4-8-16 s); dropped-after-
open re-submits each topic through the normal `subscribe` path (`:243-246`),
which packs it into a surviving sibling or a fresh socket, and the backoff
resets on the next successful open (`:153`). Shutdown skips re-subscribe
entirely (`:220-223`), and the manager's destructor asserts the derived
class called `stop` (`:82-86`). Beneath it, `WebSocketHandle`
(`src/common/websockets/WebSocketPool.hpp:20-45`) makes the socket's
lifetime the handle's: dropping the handle closes the connection, so a
client that goes away cannot leak its socket. Every listener callback
arrives on the socket thread (`:50-71`), and the manager re-asserts the GUI
thread at each entry (`:110,123,148,190,251`).

The pending count is exported (`DebugCount` at `:132,175,230-231`) - a debug
counter, not an operator surface, but the honesty ledger exists.

## The tests

`tests/src/BasicPubSub.cpp:180-222` (`SubLimits`) is the technique's first
test in a weaker form: a pool with capacity 1 receives five subscribes and
opens exactly five connections against a stand-in server, each acking its
one topic. `tests/src/TwitchPubSubClient.cpp:219-262`
(`ExceedTopicLimit`) is the same test at the real cap: `MAX_LISTENS` topics
open one connection, `MAX_LISTENS` more open a second. Neither asserts the
serial-open property - that the second socket opened only after the first
reported open, with the pending count reading K+1-K in between - because
the diagnostics count opens, not their order. `tests/src/WebSocketPool.cpp`
(`tcpEcho :56`, `tlsEcho :122`) exercise only the transport. The
technique's third test, the release-during-reconnect race, appears
nowhere.

## The other pool: the state machine without the capacity check

`src/providers/twitch/eventsub/Controller.hpp:124-156` carries the per-topic
state the technique prescribes: a `State` enum of `Unsubscribed, Failed,
Subscribing, Retrying, Subscribed, Unsubscribing` (`:125-144`), a
`refCount` (`:146`), the topic's own `retryTimer` (`:153`) and its own
`ExponentialBackoff<6>` from 500 ms (`:155`, so up to 16 s). The transitions
are the technique's rules, one for one. Subscribe under any in-flight state
is a reference increment and nothing else (`Controller.cpp:222-256`, the
switch at `:222-241`, the increment at `:255`); only `Unsubscribed` and
`Failed` start a new attempt, and a fresh attempt resets the ladder
(`:243-252`). Release to zero cancels the retry first (`:165`), returns
without a wire unsubscribe if no subscription id was ever granted
(`:166-173`), else enters `Unsubscribing` and deletes (`:177-190`). When the
unsubscribe completes and someone subscribed in the meantime, the topic
re-enters `Subscribing` rather than stranding the new holder
(`:744-755`). Retry is per topic, on that topic's timer, with jitter
(`:610-655`, jitter at `:618`, arming at `:620-622`). And the provider's
reconnect address is honoured over a fresh dial (`:273-296`, the URL branch
at `:284-293`); only when none is offered does every affected topic reset to
`Subscribing` with its ladder cleared and re-run (`:300-314`). The holder's
handle is the reaper: `IController::removeRef` is documented as called from
the handle's destructor (`Controller.hpp:36-39`), and a quitting controller
ignores releases because the sockets are about to close anyway
(`Controller.cpp:140-144`).

What this controller does not have is the pool. `getViableConnection`
(`:495-533`) returns the first ready connection owned by the same user and
carries, at `:528`, the line `// TODO: Check if this listener has room for
another subscription`. A new connection is created only when no connection
is viable and none is mid-handshake (`:480-490`, with a warning if more than
one is opening). So this pool packs everything onto one socket per user and
would learn of the provider's per-socket cap only as a refused subscribe,
handled by the per-topic retry ladder - a retry that cannot succeed until a
topic elsewhere is released.

## What the realization cannot do

The generic pool **does not track subscriptions at all** - its own doc
comment says so (`BasicPubSubManager.hpp:50-52`) - so it has no reference
count and no per-topic state: a second holder's subscribe is absorbed as a
duplicate (`BasicPubSubClient.hpp:99-105`) and the first holder's
unsubscribe removes the topic from under it. The chat provider's legacy
manager confirms the consequence in its header: it never unsubscribes when
a channel closes, and `stop` is never called
(`src/providers/twitch/PubSubManager.hpp:29-31`). The pending queue drains
**last-in-first-out** (`BasicPubSubManager.hpp:166-167`, `pop_back`), so a
burst subscribes in reverse arrival order - harmless for correctness,
wrong for the technique's "drain in order" expectation. The connection
backoff has no jitter (`src/util/ExponentialBackoff.hpp:35-47`); only the
EventSub per-topic ladder adds one. On the other side, the EventSub
controller has the whole state machine and no capacity check
(`Controller.cpp:528`), and its cancelled-retry path leaves the topic's
state undecided by the code's own admission (`:636-642`). The technique's
decisive test - release a topic's last handle while its connection is
reconnecting - is written for neither pool. A reader looking for the
technique whole will find its two halves here, in two files, each missing
what the other has.
