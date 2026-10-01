---
layer: technique
type: technique
subject: phone-controller-input-protocol
technique: reconnect-by-token-seat-recovery
status: forged
laws: [one-authority-per-quantity, structural-proof-is-never-sufficient]
shared_with: []
use_when: [a controller reconnects after a radio blink or a page reload, a player loses their seat mid-session, a late close event from an old connection marks the new one dead]
---

# Reconnect by token: seat recovery

The named concern: a player's seat survives the loss of their connection. The seat is bound
to a secret the host issued at first pairing and the phone remembers, not to the connection
that carried it. The defect this prevents is forfeiture by blink: a one-second radio drop
ends the player's race.

## The claim protocol

On first contact a controller proves it was shown the pairing code (a short number on the
shared screen). The host picks a free seat, issues an unguessable token for it, and returns
the token and the seat number. The phone stores the token in its own durable storage.

On every later connection the phone's first message carries the stored token. The host
looks the token up. A hit is a *returning* controller: it gets its seat back, without the
pairing code, and it gets it even in phases when a new controller would be refused (a race
in progress, a countdown), because the seat is already the player's. A miss falls through to
the first-contact path, where the pairing code, the phase and the free seats decide. The
rule that returning players are admitted when strangers are not is the whole point; a
protocol that applies the same admission test to both has made reconnection harder than
joining.

On a successful reclaim the host resets everything that belonged to the previous connection
and nothing that belonged to the seat: the input mailbox goes neutral with its sequence
expectation cleared, the clock-offset estimate is marked unsynchronised, and the phone
restarts its own numbering at zero on receipt of the welcome message. The seat's identity,
progress and any per-seat state stay.

## The generation fence

The subtle defect is a late close. The old connection is gone, but its close event arrives
after the new connection has claimed the seat, and a handler that marks the seat
disconnected on every close marks the *reclaimed* seat dead. The cure is a counter on the
seat, incremented at every claim. Each connection handler captures the value at its own
claim and checks it before every effect: before reading the next frame, before each
periodic push to the phone, and before the final cleanup that marks the seat disconnected.
A handler whose captured value differs from the seat's is a retired connection: it stops
sending, stops reading, and leaves the seat's state alone. The old connection's periodic
sender, if it is not fenced the same way, keeps pushing to a socket that the new owner has
no relation to.

The same fence handles two phones claiming one seat: the later claim wins, the earlier
connection is told it was replaced and closed.

## What the token is, and is not

The token is a bearer secret over a local network. It is long and random so it cannot be
guessed, issued by the host and never derived from the profile, and replaced when the host
resets pairing. It is not strong authentication, and nothing here needs it to be: the
threat is a stranger on the same Wi-Fi joining a living-room game, and the cost of that is
a prank. State the stance rather than imply more security than exists. If the game stores
anything of value against a seat, such as progress or purchases, bind that to a separate
profile identifier that the host also verifies on each action, so that a stolen seat cannot
spend another player's credits.

## Decision rules

- **When a token matches, reclaim regardless of phase.** Admission rules are for strangers.
- **When a token does not match, treat the controller as new and apply the full admission
  test.** A stale token from a previous session is not a credential.
- **On reclaim, reset the connection's state and keep the seat's.** Both halves matter:
  keeping the mailbox lets a stale throttle come back; resetting the seat loses progress.
- **Every handler effect is checked against the connection's generation.** No exceptions
  for cleanup paths; cleanup is where the late close lives.
- **On reset of pairing, bump every seat's generation and clear every token.** Existing
  connections retire; the next claim starts clean.
- **After a reclaim the phone resets its sequence and shows a neutral pad.** Its pressed
  state belongs to the connection that died.

## Evidence status

Measured by scripted checks: a scripted client's first message with a valid token on a real
host regains the seat and the mailbox is neutral; the mailbox clears on a new connection.
Authored, and read from the code but not exercised by a script: the generation fence under
a genuinely racing old close and new claim, since producing that race deterministically
needs a harness this subject has not built. No physical phone has been reloaded or put
through a radio drop; whether a real browser holds its storage across the interruptions a
player causes (a swiped-away tab, a private window) is unmeasured.

## When not to use this

- **For a game with spectators or throwaway controllers.** If a seat has no continuity worth
  protecting, a fresh claim per connection is simpler and loses nothing.
- **When the token must be a real credential.** A game that handles payments or personal
  data needs authentication, not a bearer seat token.
- **When the seat is deliberately forfeit on disconnect**, as in a ranked match with a
  forfeit rule. Then the policy is a game rule and reclaim is an explicit exception.
