---
layer: application
type: application
subject: rate-limiting
technique: algorithm-selection
stack: cpp
status: forged
verified_on: 2026-09-03
verified_against: cpp@23
---

# An egress bucket provisioned below the ceiling, refilling one token per cooldown

How the Chatterino 2 desktop client realizes, and where it falls short of,
[algorithm-selection](../techniques/algorithm-selection.md) and the golden
path's citizen posture, read at 2.5.5, Qt 6 required (`CMakeLists.txt:71`,
`:30,100`), commit fda51f0d. The C++ standard the tree compiles against is
what `verified_against` names (`CMakeLists.txt:281`, `CMAKE_CXX_STANDARD
23`). This is a catch: the technique and the golden path already state the
rules the tree follows, and the tree is read against them.

## The bucket

`src/util/RatelimitBucket.hpp:18-19` takes a `budget`, a `cooldown` in
milliseconds and a callback. The header's own doc comments name the
family: `budget_` is "the amount of calls that can be handled before we
need to wait" (`:24-27`) and `cooldown_` is "the time it takes for one used
up budget to be put back into the bucket" (`:29-32`). The implementation is
twenty lines. `send` appends to a queue and, if any budget remains, drains
one item at once (`RatelimitBucket.cpp:21-29`); `handleOne` takes the
oldest queued item, spends a token, runs the callback synchronously, and
arms a single-shot timer that returns exactly one token after the cooldown
and drains one more (`:31-47`). `tests/src/RatelimitBucket.cpp:18-51`
(`BatchTwoParts`) pins the burst semantic: five sends with a budget of five
fire immediately, the sixth waits in the queue and fires only after one
cooldown has elapsed.

By the technique's families this is a **token bucket with two explicit
numbers** - burst capacity 18 and a refill of one token per cooldown - but
the refill is not the continuous one the technique describes. A token
returns exactly one cooldown after the spend that consumed it, which makes
this the technique's own composition note made concrete: a bucket whose
capacity equals its per-window allowance is a sliding-window log with
timers standing in for timestamps. The burst policy is stated as a number,
the average is enforced by the timers, and the boundary artifact of a
fixed window never appears.

## Provisioned below the published limit

`src/providers/twitch/TwitchIrcServer.cpp:51-52` sets
`JOIN_RATELIMIT_BUDGET = 18` and `JOIN_RATELIMIT_COOLDOWN = 12500`;
`TwitchIrcServer.hpp:200-202` names the provider's published per-connection
join limit as the authority the bucket models. That limit is twenty joins
per ten seconds. Eighteen per twelve and a half seconds is below it on
both axes - a smaller burst and a slower sustained rate (1.44 per second
against 2) - which is the golden path's "runs slightly conservative" for
an egress limiter, chosen because the local model of a remote authority
drifts and the provider's refusal of a join is silent: the join simply
never happens. The bucket is wired at `TwitchIrcServer.cpp:155-164`, and
the callback it drains into re-checks that the channel is still open
before sending (`:157-160`) - a queued join whose channel was closed while
it waited is dropped at drain time, so the queue never sends stale work.
Two producers feed it: the reconnect path re-queues every active channel
(`:509`), and a single new channel join goes through the same door
(`:1221`). The comment at `:155` calls this a leaky bucket; by the
technique's vocabulary it is a token bucket with a queue in front, and the
distinction matters for the next section.

## Where it falls short

The bucket **never refuses** - `queue_` is unbounded (`RatelimitBucket.hpp:35`)
and `send` always appends (`RatelimitBucket.cpp:23`), so the technique's
central invariant, that a refusal consumes no allowance, has no line to
check: there is no refusing branch, and retry-after is implicit in queue
position. That is the right shape for joins, where the caller wants the
work done eventually and never wants an error, but it means a flood of
joins is absorbed into memory rather than answered. The egress model is
also **never corrected**: the golden path says an egress limiter treats the
provider's refusals as corrections, and this client handles the provider's
notices about sends being too fast (`src/providers/twitch/IrcMessageHandler.cpp:1005-1014`)
but has no handler for a refused join, because the provider sends none -
the conservative provisioning is the whole defence. Refill is a
**background timer per spend** (`RatelimitBucket.cpp:43-46`) rather than
lazy arithmetic on access, which the technique's decision rules rank
second; with one bucket in the process it costs nothing, and a suspend
that delays the timers errs on the safe side. The class is used exactly
once in the tree (the join bucket is its only instantiation), and the send
side of the write connection carries no local model at all - it relies on
the provider's slow-mode notices after the fact. Nothing here contradicts
the technique; the tree confirms the family choice, the explicit burst
number and the conservative provisioning, and shows the one thing a
queue-fronted egress bucket gives up, which is the ability to say no.
