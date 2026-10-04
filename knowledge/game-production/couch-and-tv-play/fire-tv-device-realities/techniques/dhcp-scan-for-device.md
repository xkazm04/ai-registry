---
layer: technique
type: technique
subject: fire-tv-device-realities
technique: dhcp-scan-for-device
status: forged
laws: [unmeasured-is-not-a-pass, an-instrument-proves-it-had-input]
shared_with: []
use_when: [a debug connection that worked yesterday is refused today, scripting a connect to a streaming stick on a home network, a remembered device address is about to be trusted]
---

# DHCP scan for the device

## The concern

A stick holds its network address by lease. When the lease lapses, when the router restarts,
or when the device slept long enough to lose its place, the router may hand out a different
address. Everything that remembered the old one now points at nothing, or worse, at another
device that happens to have inherited it. The symptom is a connection that was healthy
yesterday and is refused today, diagnosed as a broken cable, a broken tool or a broken
build, when the only change is a number.

A reserved address on the router fixes it where the router is the developer's own. Many are
not - a shared flat, a hotel, an office guest network, a house with a router the developer
may not configure - so the procedure has to work without that.

## Procedure

1. **Treat a remembered address as a hint.** Try it first, quickly, with a short timeout:
   most days it is still right and the scan is skipped.
2. **On failure, scan the local subnet for the debug-bridge port.** A home network is almost
   always a /24; the host's own address gives the prefix. Probe all 254 candidates for the one
   port the bridge listens on, in parallel, with a short connect timeout, so the whole scan is
   a few seconds and not a few minutes.
3. **Verify every hit as the right device.** An open port is not an identity. Connect and ask
   the device for something that names it - a model property, a serial, a build fingerprint -
   and compare with what was expected. Two devices on one network, or an unrelated box that
   also listens on the port, are the reason this step exists.
4. **Handle zero, one and many explicitly.** Zero hits means the device is off, asleep with its
   network down, on another network or with the bridge disabled; say that list and stop. One
   verified hit is the answer. Several verified hits are a choice that belongs to the
   operator, or to a stored serial, never to the first one to answer.
5. **Persist the new address with its verification time**, as a hint again and not as truth:
   the next run tries it first, and the scan stays a fallback.
6. **Wake the device before scanning if it is the likely cause.** A sleeping stick may have
   its network interface parked; the wake step belongs ahead of the scan so that "no answer"
   means no device.
7. **Say how the address was found in the report.** A run that connected by scan and one that
   connected by remembered address have different failure surfaces.

## Decision rules

- **When the remembered address answers and verifies, do not scan.** A scan is a probe of
  every host on the network, which a managed network may notice and object to.
- **When the subnet is not a /24, derive the range from the interface's mask**, and cap it. A
  /16 scan is sixty-five thousand probes and a poor use of a lunch break; refuse it and ask for
  the address.
- **When the network separates clients - a guest network that isolates devices - the scan
  finds nothing and means nothing.** Report that the scan could not see the device, not that
  the device is absent. An instrument that saw no input has no verdict.
- **When several devices match, require a serial.** Do not let the order of replies choose
  the target of an install.
- **When the router can reserve an address for the device, do that too.** The scan is the
  fallback for networks you do not control, not a reason to leave the ones you do.

## What it does not prove

A verified address proves a device with that identity answers now. It does not prove the
device is awake, that the game is installed, or that the address will be the same in an hour.
Nor does it prove the right thing when two physically different devices report the same
model; the serial is the identity, and it must be read, not assumed.

## When not to use this

When the connection is over a cable, or the device has a stable, reserved address, the scan
adds a failure surface for nothing. Do not scan on a network where active probing is
prohibited; ask for the address instead, and note that the device was identified by hand.

## Evidence status

The address change was observed on a home network and the scan-for-the-port remedy was
planned from it. The scan's duration and its behaviour on managed or isolating networks were
not measured; the numbers above are properties of a typical /24, not of a test.
