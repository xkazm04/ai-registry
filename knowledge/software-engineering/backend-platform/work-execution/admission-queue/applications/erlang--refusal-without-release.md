---
layer: application
type: application
subject: admission-queue
technique: refusal-without-release
stack: erlang
verified_on: 2026-09-04
verified_against: erlang@28
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# Erlang — thirteen admission failures sorted into close and hold

How the real-time gateway of an open-source chat platform stands against
[refusal-without-release](../techniques/refusal-without-release.md). The
version witness is the OTP release the tree's CI installs for the gateway job
(`28`).

## The classification exists, and it is one function

When a client identifies, the gateway must decide whether to admit a session.
Admission can fail thirteen enumerated ways, and the tree sorts every one of
them into two actions rather than closing uniformly:

**Closed** — invalid token, invalid shard, sharding required, too many
sessions for this user. Each is a property of *the caller*, and coming back
unchanged will not help.

**Held** — draining, at capacity, not eligible under the rollout percentage,
timeout, retries exhausted, network error, and 5xx from the internal service
the gate consults. Each is a property of *the server*, and will change without
the caller doing anything.

For the held class the socket is not closed. The identify request is parked,
retried on a timer with jitter, and — the part that matters — retried
immediately when a new rollout configuration is published over the message bus.

This is the technique's strong form: recovery tracks the operator's fix rather
than a polling interval. Setting the session rollout percentage to zero and
back to a hundred drains the held population with no client involvement,
because the server chose the order in which they were admitted.

## Why the split is drawn where it is

The forces are visible in which failures went where. Every entry in the held
column is **fleet-wide correlated by construction**: cordoning a node, closing
a valve, or reaching a ceiling during a traffic shift rejects every arriving
identify in the same instant. Releasing those clients hands the whole
population back at once to a gateway that is already at capacity or
deliberately draining — and the reconnect is not cheap, because it is a fresh
socket, a handshake, authentication, and a session with replayable state behind
it.

Every entry in the closed column is per-caller and uncorrelated. Holding those
would be unkind as well as wasteful: the caller must do something different,
and a hold hides that from them.

## The structural fact: the connection was already the state

The technique argues that a held caller is state and must name its exits, and
warns that "hold" without a ceiling re-creates the unbounded queue wearing a
different noun.

What this tree shows is that the objection is weaker than it looks for a
*connection-oriented* gate, and the reason is structural rather than clever.
The parked thing is not a new allocation the gate chose to make — the socket
already exists, the client is already holding it open, and its resources are
already accounted against the per-IP connection cap (256) and the identify rate
limit (300 per IP per minute) that ran *before* admission. So the parked
population is bounded by limits that were enforced upstream for other reasons,
and holding costs the difference between an idle socket and a closed one.

That is the asymmetry the technique is built on, made concrete: this gate
cannot cheaply refuse, because refusing is the expensive operation and holding
is the cheap one. A request-oriented gate has it the other way around, and
would need the explicit bounded parked set the technique specifies.

The generalizable half: **whether refusal or holding is the expensive act is
decided by whether the caller's context survives the refusal.** Where it does
not — a connection, a session, a warmed cache, hydrated state — a refusal is a
demand that all of it be rebuilt, and the gate should hold. Where the caller
carries no context, refusal is free and holding is a leak.

## What this realization cannot show

The reading establishes the classification and the push-driven recovery; it
cannot show what the held population costs at scale, because the gateway's
memory per parked socket under a real identify storm is not derivable from the
source. Nor can it show whether the default arm is right: an admission failure
the enumeration does not name has to fall somewhere, and reading did not
establish which side the tree defaults to — which is the question the technique
says matters more than the named arms.

The instrument is a load test that opens sockets against a gateway with the
rollout valve closed, holds them, and records resident memory per parked
connection against the per-IP cap — the number that says how large a hold this
design can actually afford.
