---
layer: technique
type: technique
subject: lan-pairing-and-session-continuity
technique: listener-release-on-pause-rebind-on-resume
status: forged
laws: [refuse-rather-than-destroy]
shared_with: []
use_when: [the host app is backgrounded while phones are paired, two builds of the same game fight for one port, seats and the pairing secret must survive a pause]
---

# Listener release on pause, rebind on resume

When the host application is paused, it stops its network listener, closes the phones'
connections and frees the port. When it resumes, it starts the listener again on the same
port and the same secret. The seat table, the tokens and the secret are state that belongs
to the host's process, not to the listener, so they survive the gap; the phones reconnect
with their tokens through the ordinary reclaim path and are seated as they were.

## Why not simply keep listening

A backgrounded application on a television or a phone is not necessarily suspended. It can
keep a bound port while the user has moved on to another variant of the same game, a
sibling build, or a reinstalled copy of itself, and that second instance then fails to
bind. Keeping the listener also keeps accepting phones into a game nobody is looking at, so
a phone can sit "connected" to a frozen screen. Releasing the port at pause makes the
background state honest: nobody is hosting. It also bounds the lingering-connection
problem, because the close happens by choice at a known moment rather than as a side effect
of the process being killed.

## What the pause does

1. Mark the host paused so state broadcasts to phones show it, if any phone is still
   connected for the instant before the close.
2. Mark the link not running, cancel the network job and stop the server engine with a
   short grace period for in-flight requests, then drop the engine reference.
3. For every seat, bump its generation counter, mark it disconnected and reset its input
   channel. The seat keeps its token, its profile and its claimed state. The generation
   bump is what ensures a stale handler from before the pause cannot later mark a rebound
   seat disconnected.
4. Leave the pairing secret unchanged. A rotated secret on resume would invalidate the
   address already on someone's phone and the code on the screen they walk back to.

## What the resume does

1. Clear the paused flag and start the listener through the same path as a first start,
   including the port preflight and its retries. Resume is the moment the port is most
   likely to be still lingering, so it must not take a shortcut around that path.
2. Make start idempotent: if the listener is already running or a start is in progress, do
   nothing. Pause and resume events can arrive in bursts, and a second start must not
   produce a second engine.
3. Refresh the advertised address on resume, because the network may have changed while
   the application was away. Regenerate the pairing code only if the address or secret
   differs from what was last drawn.
4. Let phones find their own way back. Their pages already retry on a short timer; the
   token path seats them with no action from the people holding them.

## The phone's side of the gap

The phone sees the socket close and must not treat that as a verdict. Its page keeps its
token and retries, shows a "reconnecting" state rather than the pairing form, and resets
any held input to neutral on the way down so a thumb that was down is not a stuck pedal
after the return. If it is refused when the host comes back, it drops the stored token and
shows the form. It must not retry a refusal on a tight loop; a client that was told no
should back off, because the host is unlikely to change its mind in a second.

## Decision rules

- When the pause is brief, the same technique applies; the cost of a rebind is low enough
  that no threshold is worth tuning. Do not keep the listener for "short" pauses.
- When the process is killed, not paused, seats are lost with it: tokens live in memory.
  State this plainly to players, and decide separately whether seats ought to persist
  across a kill. Persisting them raises the question of which saved state counts as the
  session, and is a bigger decision than this technique.
- When the application must remain visible and serve phones while backgrounded, as a
  second screen would, this technique does not apply; you need a foreground service of the
  platform's kind, with its own lifecycle and user-visible notice.
- When two builds of the game coexist, release-on-pause is what lets either of them be the
  foreground one. It is not a substitute for giving each variant its own port.

## When not to use it

When the host is the only application the device ever runs and nothing else could contend
for the port, and a pause is a rare error rather than a normal event. Even then the
reconnect path should be exercised, since an operating system may reclaim a paused process
and the first launch afterwards faces the same port.

## Evidence grade

Stop, restart and token-based rejoin were exercised by a scripted client against the host
on a development machine, including that a reconnect after the restart is seated in the same
seat and reported connected. The pause and resume hooks are wired in the shipped build and
the behaviour is described as working on the reference television stick; the stated purpose,
that another variant can then bind the port, was not separately measured. Nobody timed how
long a real phone takes to reconnect after a long background, and whether a phone's
browser throttles its retry timer while its screen is off is unmeasured and probably
platform-dependent.
