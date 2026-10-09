---
layer: technique
type: technique
subject: lan-pairing-and-session-continuity
technique: capability-detect-insecure-origin
status: forged
laws: [unmeasured-is-not-a-pass]
shared_with: []
use_when: [a controller page served from a bare local address uses wake lock, sensors, fullscreen or clipboard, a feature works on a developer machine and is silently absent on a phone, deciding whether to upgrade the page to a trusted certificate]
---

# Capability detection on an insecure origin

A controller page that is served from a numeric local address over plain HTTP is not in a
secure context. Browsers withhold a family of features from such pages. The page treats
every optional capability as possibly absent, tests for each one before use, reports the
real state in its interface, and keeps working without it. The controller's core
function, a socket and touch input, requires none of them.

## What is withheld, and what is not

Gated to secure contexts, so absent or inert on a plain local address: the screen wake
lock, the motion and orientation sensors and their permission prompt, clipboard access,
camera and microphone capture, the subtle cryptography interface and random-identifier
helper that depends on it, service workers and with them offline caching and
installability in most browsers, and some sharing and notification interfaces. Not gated:
plain sockets from a plain page, pointer and touch events, the vibration interface where
the platform supports it, local persistent storage, and the fullscreen and orientation-lock
requests, although those last two are further gated by needing a user gesture and by the
platform. The set changes between browser versions; test, do not recall.

Two traps sit inside the list. The page's own address starting with a loopback name is
treated as secure, so everything works on the developer's machine and nowhere else; test
from the real local address on a separate device. And the sensor permission prompt that some
platforms require before motion events flow can only be requested from a secure context,
so a tilt-steering mode is not simply "ask nicely"; on an insecure origin it is
unavailable, and the design should either not depend on it or say so.

## Procedure

1. Enumerate the optional capabilities the controller would like. For each, write down the
   fallback behaviour and the instruction the person is given. A capability with no
   stated fallback is a capability the core depends on and should be re-examined.
2. Detect by presence of the interface, then by a guarded attempt. Presence is necessary
   and not sufficient: wrap the real call in a try/catch, treat a rejection as absence, and
   only then record the capability as active.
3. Request gesture-gated capabilities (fullscreen, orientation lock, wake lock) from the
   first real touch on the page, not on load, and do it once. A request on load fails on
   most platforms for want of a gesture and teaches the page the wrong thing.
4. Re-acquire on return. Several capabilities, notably the wake lock, are released by the
   browser when the page is hidden. Release on hide, request again on show, and neutralise
   held controls when the page is hidden so a stuck thumb is not a stuck throttle.
5. Wrap every storage read and write in a try/catch with a harmless default. Storage can be
   disabled in private modes and can throw on access; a page whose first line reads storage
   without a guard fails to start on those phones.
6. Reflect the truth. If the wake lock was not obtained, do not show an "awake" state and
   do show one line of instruction: set the phone's own display timeout longer for the
   evening. A control that claims a state it did not achieve is worse than no control,
   because the person trusts it.
7. Put the limits in the host's published notes beside the feature list, saying which
   features need a trusted origin and which origin was tested.

## Mixed content and the temptation to upgrade

The cure people reach for is a certificate, and on a bare local address it is rarely
available: a public authority will not issue one for a private numeric address, and a
self-signed one makes every phone show a warning to a person who has never heard of the
game. Upgrading also changes the socket: a secure page may not open an unencrypted socket,
so the socket must be secure as well, and the host must serve both with a certificate the
phone trusts. Some browsers are building exemptions for requests to private addresses and a
permission prompt for local-network access, but those are moving, they are not uniform,
and a game that depends on one has a compatibility matrix it cannot test from a couch.
Treat the upgrade as a separate project with its own cost, and ship the degraded page
first.

Conversely, never let a page loaded over a secure origin open an unencrypted socket to the
host and expect it to work. If the page is secure, the socket must be, and the failure is
silent at the interface level (a connection that never opens) until the console says why.

## Decision rules

- When a capability is missing, degrade and tell the person; never throw, never show a
  blank control.
- When the capability is part of what makes the game playable for a long session (the screen
  staying awake), the instruction for the fallback belongs on the screen the person sees at
  pairing, not buried in documentation.
- When a feature must be exercised in test, test from the real numeric address on a second
  device or an emulation of it, never from the loopback name on the developer's machine.
- When a library offers a polyfill, check what it does on an insecure origin; many fall
  back to a hidden video or audio element that holds a screen awake at a battery cost, and
  that is a decision to make on purpose.
- Detect once at start-up into a small record, and read the record everywhere; scattered
  checks drift.

## When not to use it

When the controller is delivered from a native app with its own platform capabilities, the
browser's secure-context rules do not apply; use the platform's permission model.

## Evidence grade

The statement that a mainstream mobile browser exposes no wake lock on a plain local
address is a measurement made in a scripted desktop browser session against a real local
address and agrees with the specification; it was not observed on a physical phone, and
phone browsers, in-app scan viewers and vendor browsers may differ. That the page still
works without the optional features was exercised by a scripted browser. Whether people
read and follow the fallback line is unmeasured.
