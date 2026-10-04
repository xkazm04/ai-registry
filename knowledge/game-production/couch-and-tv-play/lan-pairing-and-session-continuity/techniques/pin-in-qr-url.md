---
layer: technique
type: technique
subject: lan-pairing-and-session-continuity
technique: pin-in-qr-url
status: forged
laws: []
shared_with: []
use_when: [designing how a phone first reaches a television game, a pairing code is typed by hand and people get it wrong, deciding what a pairing secret is allowed to protect]
---

# PIN in the QR URL

The television shows one scannable code. The address inside it carries the short pairing
secret as a query parameter. A phone that scans it opens the controller page already
holding the secret, and the page uses it in its first message without asking the person
to type anything. The same screen also prints the plain address and the digits, so a
phone without a usable camera app can reach the same place by typing, and the page shows a
numeric entry box only when it arrived without a secret.

## Why the secret rides in the address

Pairing succeeds or fails on the number of gestures between "I want to play" and "I am a
seat". Reading an address off a screen across a room, typing it, then reading and typing a
separate code is two transcriptions with two chances to fail, done while a friend waits.
Folding the secret into the address collapses it to one gesture, and the typed route stays
only as the degraded path. This is a decision about who bears the cost: the host can
format a longer address for free; the person cannot.

## What the secret is, and what it is not

It is a short numeric room key. Its job is to stop a phone that is merely on the same
network, or a scan of a photograph of the screen taken elsewhere, from claiming a seat. It
is not authentication of a person and must not be asked to be. Four digits is ten thousand
values at most; against a client that may guess without limit that is seconds of work.
Everything else in the design assumes this: it is acceptable only because the network is a
room, the secret rotates by a deliberate act, and a seat, once held, is carried by a
different, longer token (see the reclaim technique), so the short secret protects only the
brief window of admission.

## Procedure

1. Generate the secret from a cryptographically sound source, not a clock or a counter, in
   a range that never starts with zero so it survives being read aloud and being stored as
   a number.
2. Build the pairing address from the host's current reachable address, the port and the
   secret. Choose the address deliberately: among the interfaces that are up, drop loopback
   and link-local ones, prefer a private-range address, and re-poll on a slow timer (every
   few seconds is enough) because a television can change network while the lobby is open.
   Regenerate the code whenever either the address or the secret changes, and not on every
   frame; skip the regeneration when both are unchanged. If no usable address exists, show
   "no network" instead of a code. A fallback to the loopback address draws a perfectly
   scannable code that can only ever reach the television itself.
3. Render the code large with a generous quiet margin, dark modules on a light ground,
   because a camera across a room and a television's colour processing both punish low
   contrast. Show the readable address and digits beside it as fallback.
4. On the phone, read the secret from the address on load, then immediately remove it from
   the visible address and the history entry so it is not left in the address bar, in a
   shared screenshot or in a bookmark. Keep it only in memory for the first message.
5. If the page opens without a secret and holds no seat token, show the entry box with
   one line of instruction. If it holds a token, skip the box entirely.
6. Rotate the secret by an explicit host-side act, and clear every seat claim when you do,
   so the room can be reset from the couch with the television remote.

## Decision rules

- When the phone already holds a seat token, never prompt for the secret; the token
  carries the seat. Prompting a returning player is the bug.
- When the secret is refused, tell the person what to do in the room (look at the screen
  again, or rescan), not a protocol phrase, and stop the client from retrying the same
  value on a timer. A refused secret replayed every second is a guessing loop.
- When the secret is rotated, a phone that stored the old one must discard it on the first
  refusal rather than keep presenting it.
- Keep the host's attempt count visible to the host. Rate-limit or lock after a handful of
  wrong guesses within a short window, because the key space is small. The interval and
  count are tuning, not law.
- When the address embeds the secret, treat the address as sensitive within the room only;
  do not log it anywhere that leaves the device, and never put it in a link a phone would
  follow off the local network.

## What the scanner does that you do not control

A camera app may open the address in an in-app browser rather than the phone's default
browser. That view has a different capability set and storage from the real browser,
including where a seat token will be stored. If a seat token matters across a reload, check
that the page still holds it after being opened from the scan route and again after being
reopened from the browser's history, and offer a single line telling the person to open
the address in the browser if it does not. The query string can also be dropped by an
over-eager intermediary; the typed fallback is what covers it.

## When not to use it

When the room is not trusted: a shared office network, a venue with many players, a
guest network that bridges strangers. A short key in the address defends against casual
neighbours and no one else; those settings need a per-session cryptographic exchange or a
host that is not on the open network. When the pairing screen could be photographed by an
audience and broadcast, the secret in the code is public the moment it is shown, so rotate
it per session and do not treat it as private.

## Evidence grade

That the secret rides in the address and that the typed fallback exists is authored and
was exercised with a scripted browser and a scripted client, not by people scanning from a
couch. The comfort of the scan gesture, the camera's success rate at a real viewing
distance and whether an in-app browser keeps the seat token are all unmeasured; treat
those as open until a person has done them.
