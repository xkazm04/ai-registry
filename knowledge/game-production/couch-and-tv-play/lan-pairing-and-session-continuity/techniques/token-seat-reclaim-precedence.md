---
layer: technique
type: technique
subject: lan-pairing-and-session-continuity
technique: token-seat-reclaim-precedence
status: forged
laws: [refuse-rather-than-destroy]
shared_with: []
use_when: [a phone drops or reloads mid-session and must keep its seat, ordering the checks that admit a connection to a shared game, deciding what to tell a refused phone]
---

# Token seat reclaim precedence

Admission to a seat is a short ordered list of checks, and the order is the technique.
A phone presenting a seat token the host minted earlier is looked up first. If the token
matches a seat, that phone is the seat's owner again and the remaining checks do not run.
Only a phone with no matching token falls through to the checks that govern strangers: is a
session in progress, does the pairing secret match, is a seat free, is the requested
profile already in use. A stranger who fails any of them is refused with a stated reason.

## The ordering, and why each step sits where it does

1. **Token match, first.** The seat belongs to whoever holds its token. This beats the
   secret, because the secret may have been rotated since; it beats the room-is-full
   check, because the room is full of the very person returning; and it beats the
   session-in-progress check, because the point of the token is to survive exactly the
   interruptions that happen during play.
2. **Session in progress, second.** A new phone is turned away while the game is running.
   Letting a stranger take a seat in the middle of a race changes the game for the people
   in it and, worse, would require evicting someone to do so. This step comes before the
   secret so that a person who guesses or reads the secret mid-race learns nothing about
   whether it was right.
3. **Pairing secret, third.** Cheap, and the part a person can fix by looking at the screen.
4. **A free seat, fourth.** Seats are a fixed small number; none free means refuse.
5. **A profile not already seated, last.** Two phones claiming the same persistent
   identity would corrupt that identity's saved progress, so the second is refused.

Every refusal returns a result with a message, closes the connection, and changes nothing
on the host. This is the refusal rule applied to seats: the host never clears the way for a
newcomer by removing a live occupant, and a refusal is a better outcome than a seat
silently taken from someone who is playing.

## What a reclaim does to the host's state

A reclaim is not a no-op. The host must bump a per-seat generation counter, mark the seat
connected, discard any clock-alignment the old connection had established, and reset the
input channel so a held button from before the drop cannot be replayed as a fresh press.
The previous connection, if it is still half-open, must be told it has been replaced and
closed. The generation counter is what makes the old connection's late cleanup harmless:
when its handler finally unwinds, it clears the seat's connected flag only if its own
generation is still current, so a delayed disconnect from the old socket cannot disconnect
the new one that replaced it. Without that comparison, the reclaim works in testing and
fails in the room, in the one case where the old connection takes a few seconds to notice
it is dead.

## Token properties

- **Opaque and unguessable.** A random identifier from a sound source, long enough that it
  cannot be enumerated. It carries no meaning and no seat number the client could edit.
- **Issued once, at admission, in the welcome reply**, and stored by the phone in
  persistent per-origin storage with a try/catch around every access, because storage can
  be unavailable in private modes. Without storage the technique degrades to "the player
  must rescan after a reload", which is acceptable and should be stated.
- **Cleared only by an explicit reset or by the host refusing it.** A phone that receives
  a refusal drops its stored token so it does not present a dead one forever.
- **A bearer secret.** Anyone who holds the token holds the seat. On a plain unencrypted
  local connection that is a risk accepted knowingly for the room; say so rather than
  implying more.

## Seat lifetime is a separate decision

Binding a seat to a token raises the question the technique does not answer for you: how
long does an abandoned seat stay reserved? A reservation that lasts until the host resets
it is simple and safe for a living room, and is also the reason a returning-but-different
group finds "all seats taken". Decide it on purpose. The choices are: reserved until an
explicit reset by the host, reserved for a stated interval after the last connection, or
released when the session returns to its lobby. Whichever you pick, the refusal message
for "no free seat" must say how the host resets it, because a person standing with a phone
cannot guess.

## Decision rules

- When a token matches, admit and skip the stranger checks, always, including during a
  live session.
- When a stranger arrives during a live session, refuse; never evict.
- When more than one phone presents the same token at once, the later wins and the earlier
  is closed as replaced; this is the same operation as a normal reclaim.
- When the refusal has several distinct causes (wrong secret, session running, no free
  seat, profile taken), prefer a distinct message per cause. One catch-all message forces
  the person to guess which of four things to fix.
- Compare tokens with a constant-time comparison if the host's network is not a private
  room; in a private room an ordinary comparison is acceptable.

## When not to use it

When there is no continuity requirement: a one-shot kiosk where a dropped phone simply
rejoins as a new player. When seats carry money or an irreversible entitlement, a bearer
token over an unauthenticated local socket is too weak and the seat needs a real
authenticated session.

## Evidence grade

The precedence, the refusal during a live session and the rejoin after a listener restart
were exercised by scripted socket clients and checked by automated tests; the browser path
was exercised by a scripted browser. No human locked a phone, waited, and came back. The
interval a real radio takes to notice a dead connection, and therefore how often the
half-open-socket case occurs in practice, is unmeasured, and the wording of the refusal
messages is authored, not tested with people.
