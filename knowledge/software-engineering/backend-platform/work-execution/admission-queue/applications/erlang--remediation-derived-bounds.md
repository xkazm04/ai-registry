---
layer: application
type: application
subject: admission-queue
technique: remediation-derived-bounds
stack: erlang
verified_on: 2026-09-04
verified_against: erlang@28
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# Erlang — the queue bound is the kill threshold, and a test says so

How the real-time gateway of an open-source chat platform stands against
[remediation-derived-bounds](../techniques/remediation-derived-bounds.md). The
version witness is the OTP release the tree's CI installs for the gateway job
(`28`), not the rebar manifest's floor.

This is the tree the technique was written from, and it is the strongest form
of the pattern found: the derivation exists, it is computed, and it is
asserted.

## The two numbers

The gateway fans events out through a fixed pool of relay workers. Because a
message send to an Erlang process is unconditionally successful and unbounded,
a slow socket cannot exert backpressure, so a fan-out burst in a large
community converts directly into unbounded mailbox growth on the relay. The
tree bounds it with a credit claim in a shared atomic counter: a producer must
claim a slot before enqueuing, and blocks with a 1 ms backoff for up to 5 s if
none is free.

Separately, a health watchdog samples every monitored process every 10 s and
escalates — warn at 1,000 queued messages, forced major collection at 10,000,
and termination at 50,000. That last rung is the destructive remediation: it
kills the process, and everything in its mailbox dies with it.

These are exactly the two points on one axis the technique describes, and the
tree does not let them be configured independently. The relay's maximum queue
is `min(configured, watchdog_kill_threshold)`.

## Why this is the pattern rather than an instance of it

Three properties the technique asks for are all present, and the third is the
one that is usually missing:

- **It is computed, not commented.** The clamp is evaluated where the bound is
  read, so an operator who raises the configured value past the kill threshold
  gets the threshold.
- **The direction is the safe one.** The producer is throttled strictly before
  the watchdog would fire, so overload is backpressure rather than a kill —
  which means the shed path stays alive in the condition it exists for.
- **There is a test named for the relationship**, asserting the maximum queue
  is capped by the watchdog's kill threshold. Not a test of the bound and a
  separate test of the watchdog — a test of the *coupling*, which is the only
  thing that fails when someone makes the two knobs independent again.

## The structural fact: the remediation is hysteretic, and that is why the derivation is safe

The technique warns that a derived bound is only as good as the threshold it is
derived from, and that a sampled remediator needs headroom for one sampling
interval of arrivals.

This tree buys that headroom a different way, and it is worth recording because
it changes the margin calculation. The watchdog does not kill on crossing
50,000. It kills only after **three consecutive samples** above the threshold
that are also still growing; a single spike, however large, degrades to a
forced collection instead. The unit tests pin the boundary precisely — a
falling series does not kill, a series shorter than three does not kill, and
only sustained monotone growth does.

So the remediation's effective threshold is not a level but a level held for
30 seconds against a rising trend, which is a far weaker claim on the producer
than an instantaneous 50,000 would be. The derivation is conservative by
exactly that margin, and nobody had to pick a percentage.

The generalizable half is the pairing: **a destructive remediation that a flow
control is derived from should be hysteretic, because the derivation makes the
flow control's correctness depend on the remediator not firing spuriously.** A
twitchy killer plus a derived bound is a system that throttles its producers
against noise.

## What this realization cannot show

Reading establishes that the two numbers cannot disagree; it does not establish
that either is *right* for a real fan-out. The mailbox depth at which a socket
process actually becomes unrecoverable is a property of message size and
scheduler pressure, and the tree's own bound is a count of messages, not of
bytes — the unit question
[resource-denominated-bounds](../techniques/resource-denominated-bounds.md)
owns, and one this reading cannot answer.

The instrument would be a load test that drives a guild fan-out at rising rates
while recording relay mailbox depth in bytes alongside the message count, and
finding the depth at which the process stops draining. Until that exists,
50,000 is a number chosen by feel with a derivation hung off it — which is
better than two numbers chosen by feel, and is not the same as a measured one.
