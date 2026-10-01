---
layer: technique
type: technique
subject: fire-tv-device-realities
technique: server-socket-portability-hedge
status: forged
laws: [unmeasured-is-not-a-pass, one-authority-per-quantity]
shared_with: []
use_when: [a design depends on the device listening on a network socket, a platform generation is changing the runtime under the game, a capability the whole control scheme depends on is undocumented]
---

# Server-socket portability hedge

## The concern

A game on a TV with no keyboard often takes its input from a phone. The usual shape has the
game host a small server that the phone connects to: the device listens, the phone is the
client. That shape rests on a capability that general-purpose platforms grant freely and
restricted ones may not: that an application may open a listening socket and be reached by
another device on the local network.

A platform that replaces its general runtime with a constrained one, a sandboxed scripting
environment or a locked-down native layer, may forbid listening, limit it to loopback, require
a declared permission, or leave the question undocumented. When it is undocumented it is an
unknown with the largest possible blast radius: the whole control scheme, and with it the
game, depends on it. Discovering the answer after the game is built is the expensive way to
learn it.

## Procedure

1. **Name the dependency.** Write down, in the design, that the control path requires the
   device to accept inbound connections, and mark it as unverified for every platform
   generation on which it has not been demonstrated.
2. **Separate the transport from the game.** The game consumes an input stream through one
   interface, with a message format and a connection state. It does not know whether the
   device is listening or connecting. That interface is the single authority for input; the
   transport is replaceable behind it.
3. **Design the relay variant now.** In the relay shape, neither the game nor the phone listens.
   Both connect outbound to a small relay on a machine the developer controls - a cloud
   function, a home server - which pairs them by a short code and forwards messages. Outbound
   connections are permitted on nearly every platform, because that is what applications are
   for. The device becomes a client, which is the position restricted platforms allow.
4. **Keep the direct path as the default where it works.** The relay adds latency, an
   internet dependency and a service to run. On a local network, with the capability
   present, the direct path is better on every axis the player feels.
5. **Select the transport at runtime by capability, not by platform name.** Try the bind; on
   success, advertise the direct address; on failure or refusal, fall back to the relay and
   say so on screen. A platform name in the selection logic is a prediction; the bind result
   is a fact.
6. **Schedule the measurement.** Put a small spike on the plan: on the new platform, open a
   listening socket, connect to it from another device on the network, and record the result,
   with the platform version. The hedge buys time to do this before the design is committed,
   not permission to skip it.
7. **Write the result into the unknown's entry** and retire the hedge or promote it. An
   unknown that was measured is a finding; one that stayed a hedge for a year is a fork nobody
   maintains.

## Decision rules

- **When the capability is documented as present and has been demonstrated on a device, use the
  direct path and keep the interface.** The seam costs a layer of indirection and is paid
  once.
- **When it is documented as absent, build the relay.** Do not build a work-around inside the
  platform's restrictions.
- **When it is undocumented, plan as though it is absent until proven otherwise.** Build to
  the interface, ship the direct transport where it is known to work, and make the relay a
  first-class path with an owner and a date for the measurement, not an afterthought.
- **When the relay carries player input, treat it as an exposed service.** Pair by short-lived
  code, expire the pairing, and rate-limit; a relay that anyone can connect to with a guessable
  code is an input injector.
- **When latency is part of the game's feel, measure the relay's round trip** before
  promising the experience. An input path that adds a hundred milliseconds changes what the
  game is, and the number must be stated with its unit and the network it was taken on.

## What it does not prove

A hedge that has been designed has not been built, and one that has been built has not
been felt. It proves nothing about whether the platform permits listening, and nothing about
whether the relay's added latency is acceptable to a player. Both remain open until measured
on the real device by a person.

## When not to use this

When the game targets only platforms on which listening is established and the control
scheme has a second input path, the hedge is overhead. When the control scheme needs no
network at all - a remote with directional input is the whole interface - the entire question
disappears. Do not build a relay for a capability the game does not use.

## Evidence status

The unknown was named and a relay was designed as a hedge; neither the capability on the new
platform nor the relay was measured. This technique is authored reasoning about a risk, and
nothing in it is a result.
