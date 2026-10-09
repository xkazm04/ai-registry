---
layer: golden-path
type: golden-path
subject: lan-pairing-and-session-continuity
status: forged
use_when: [a phone must join a living-room game over the local network in seconds, a player's phone locked or dropped mid-session and must get its seat back, the host app is backgrounded and the next launch finds its port taken, a controller page leans on a browser feature that may not exist on a plain local address]
techniques:
  - pin-in-qr-url
  - token-seat-reclaim-precedence
  - bounded-hello-timeout
  - port-preflight-with-reuseaddress
  - listener-release-on-pause-rebind-on-resume
  - capability-detect-insecure-origin
---

# LAN pairing and session continuity

A couch game that uses phones as controllers has a front door and a hallway. The front
door is pairing: a person who has never seen this game holds a phone, points it at the
television, and is a player inside a few seconds. The hallway is continuity: that phone
will lock, lose its radio for a moment, be put down and picked up, and the television
app itself will be backgrounded by its operating system and brought back. Both are
networking problems only in their plumbing. In substance they are questions about trust
and identity between two devices that share a room and nothing else: who is allowed in,
who is already in, and what happens to a seat when its owner vanishes for nine seconds.

The subject is the lifecycle of that relationship, from the first scan to the last
reclaim. It is deliberately not about what flows once the phone is a player. The shape of
the input messages, their ordering, their age and their staleness belong to the
controller-protocol subject next door, and the entries in the incident corpus that record
a particular platform's traps belong to the pitfall-corpus subject. This subject owns the
moments before the first input frame and after the last one: admission, seat identity,
refusal, the listener's own lifetime, and the honesty of the page that the phone loads
when the origin gives it fewer capabilities than a normal website has.

## Boundary, and the rule for choosing

The input-protocol subject owns the wire after admission: frame schema, sequence numbers,
clock alignment, how stale a held input may become, what a dropped packet means. This
subject owns everything up to and around that: the pairing credential, the seat, the
handshake that precedes the first frame, the host's listener, and the controller page's
relationship to its origin. The pitfall-corpus subject owns how an incident is
compressed into a routable entry and how a corpus is scoped and trusted; this subject is
a body of domain craft whose individual traps might each become such an entry, and it
says what to do about them rather than how to file them. The rule for choosing: if the
question is about a message that carries steering, throttle or a button, it is the
protocol's; if it is about whether this phone may speak at all, which seat it holds, why
the host will not start, or why a page feature is silently missing, it is here; if it is
about how to write down what a past failure taught, it is the corpus's.

## Pairing is a credential problem, not a typing problem

The naive reading treats pairing as a user-interface task: make the PIN box large, make
the address short. The practitioner reading starts from the cost of every extra gesture.
A person reading an address off a television across a room, typing it into a browser, and
then typing four digits into a second field does two error-prone transcriptions in a
setting where a friend is already holding out a hand for the next turn. The credential
should travel in the same act that carries the address, which is why the address a
television shows as a scannable code contains the credential inside it, and why the typed
route remains only as the fallback for a phone whose camera is not at hand. A short
numeric secret is not strong authentication and is not asked to be: it exists so that a
neighbour's phone on the same network, or a stray scan of a photograph of the screen, does
not claim a seat in a room it is not in. Its job is bounded to that, and it is rotated by
an explicit act of the people in the room.

The corollary people miss is that the credential is a one-time key to a seat and should
not be the thing that holds the seat afterwards. A phone that has been admitted is handed
a second, longer secret and the short one stops mattering for that phone. This is the
whole point of the seat token and the reason the token is checked first.

## Continuity: the seat belongs to the token, not to the socket

A connection is the least stable thing in the system. A phone screen locks and the radio
sleeps; a browser tab is discarded and reloaded; a router drops a flow. If seat ownership
is tied to a live connection, each of those events is an eviction, and the person who was
winning a race comes back to find a stranger's phone in their seat, or the seat refusing
them because the room is full of their own ghost. So the seat is bound to an opaque token
the host minted at admission and the phone keeps, and a returning token wins over every
other check: the PIN, the seat count, even the rule against joining mid-session. A
returning player is not a new admission, and refusing them for the reasons that refuse a
stranger is the most common continuity bug in this class of game.

The same precedence has a second half that is easy to forget. A *new* phone must be
refused while a session is live, because letting a stranger take a seat in the middle of a
race changes the game under the players who are in it. The refusal is a result, not an
error: it names the reason in words a person can act on, and it never evicts a live seat
to make room.

## The handshake must be bounded

Anything that accepts a connection and waits for a first message owns a resource that a
silent peer will hold forever. A phone that connects and never speaks, a scanner probing
the port, a half-open flow from a radio that went away between the connection and the
first byte: each occupies a handler. The first message gets a deadline, long enough for a
slow radio and short enough that a dead peer cannot accumulate, and the deadline applies
only to the wait for that message. Side effects of admission, such as minting a token or
marking a seat taken, must not sit inside the part the deadline can cancel, or a
cancellation lands halfway through a claim and leaves a seat owned by nobody. That
includes the last line of the deadline's scope. At least one common runtime documents
that its timeout can fire after the block has finished, so a claim placed last inside it
is still exposed. Read the message under the deadline, and admit after it.

Before any of that, the host should know which page is speaking. A phone's browser will
open a socket to the host for any page it loads, and a page from another origin can
present a guessed or photographed secret as well as the controller can. A browser declares
the page's origin when it opens the socket. The host closes a socket whose declared origin
is not its own address. A client that declares no origin is a tool, not a page, and goes
on to the ordinary checks.

## The host's listener has a lifetime, and the operating system does not respect it

The television application is not a server in a rack. It is foregrounded and
backgrounded by a system that may start the next launch before the last process has let
go of its sockets. Three failures follow, and they are the ones that cost the most
debugging time because they look like something else. A listener that fails to bind can
take the whole process down in a way the platform reports with a generic activity-launch
error, nothing about a port. A preflight that checks whether the port is free, but checks
it more strictly than the real listener will bind, reports "busy" for a port nobody is
listening on. The cause is the connections the host itself closed: they linger in a wait
state on its own port for a minute on the kernels these devices run. And a listener that
stays bound while the application is in the background blocks every other variant of the
same game, or the next launch of this one, from using the port.

The remedies are one idea applied three times: treat the port as a resource with an
owner and a lifetime.
- Bind the real listener with address reuse set explicitly. The wait states a pause leaves
  behind block the next bind on those kernels unless the listener that accepted them
  carried the flag. A probe that sets it cannot make up for a listener that did not.
- Probe the port the way you will really bind it, retry a bounded number of times with a
  visible status, and turn a failure into text on the screen rather than a dead process.
- Release the listener when the application is paused, so that resuming is a fresh bind
  that preserves the seats rather than a fight with your own previous run.

Resume on the same port. A phone's stored seat and its page's socket address both belong
to the page's origin, and the origin includes the port. A host that walks to the next free
port, which is a sound habit for tools that advertise a fresh address and credential every
run, orphans every seated phone.

Development machines hide part of this. On one common desktop system a wait state does not
block a bind at all, so the "busy" failure can only be reproduced on the device's own
system family.

## The page is served from an origin that browsers distrust

A controller page loaded from a bare local address over plain HTTP is not a secure
context, and browsers hand such pages a smaller set of capabilities than a normal website
gets. The screen wake lock, the motion and orientation sensors with their permission
prompts, clipboard access, camera capture, the crypto subtle interface, service workers
and several others are simply absent or inert there. Pages that assume them throw on first
use, or worse, do nothing and render as though they had worked. A screen that is supposed
to stay awake and doesn't, on a phone held in a hand for twenty minutes, is a game that
ends by itself.

The practitioner posture is to design the controller as if every optional capability
were missing, detect each one by feature and by outcome, offer it when present, and say
plainly when it is not. The honest fallback is a line of instruction (keep the display
awake in the phone's own settings), not a pretence. Upgrading the origin to a trusted
certificate is usually not available on a bare local address, and it introduces its own
mixed-content constraint between page and socket; treat it as a separate decision with its
own costs, not as the default cure.

A page served by the host and talking back to the host stays outside the local-network
permission prompts that browsers began shipping in 2025 and 2026. Those prompts govern
public pages reaching into the room. Some optional features also fail on a phone for
reasons unrelated to the origin, because the platform does not offer them; fullscreen and
orientation lock on one major phone line are examples. Missing for want of a secure origin
and missing on that phone are different causes. The design rule is the same for both:
degrade, and say so.

## What has been shown, and what has not

The honest summary of evidence for this subject matters, because it shapes how hard each
rule may be pushed. Port-binding behaviour, the listener release and rebind, the token
precedence and the refusals were exercised with scripted clients and a scripted browser,
and the binding failure and its fix were reproduced on a real television stick by
occupying the port deliberately. The claim that a particular browser exposes no wake lock
on a plain local address was observed in a scripted desktop browser session and agrees
with the specification's secure-context requirement; it was not seen on a physical phone.
A 2026-10-09 pass added three measurements.
- **Wait states:** outside any project, the operating-system difference behind the wait
  states (one run per case, with a live listener as the control).
- **Foreign page:** in the source host's own suite, an A/B in which a foreign page with
  the right secret was seated before an origin check and refused after it.
- **The source's engine:** its reuse default and start-path behaviour, read from the
  engine's shipped artifacts.

Nobody has watched a human walk the room, scan the code, lock their phone mid-race and
come back. The seat-recovery timing, the comfort of the ten-second handshake bound and the
clarity of the refusal wording are authored judgements, not measured human outcomes, and
each technique labels its own claims accordingly.

## Failure modes of the naive reading

- Seat identity is stored on the connection, so every reconnect is a new person.
- The returning-player path runs the same checks as a stranger, and a full room or a
  rotated short code locks out the person who was winning.
- The short secret stays in the address bar, in history, and in the phone's storage, and
  is replayed forever after the host has rotated it.
- A client that is refused reconnects on a fixed timer, which turns a refusal into a
  steady stream of guesses.
- The preflight is stricter than the bind, so a clean restart reports a busy port.
- The preflight is a probe, and a probe is not a lock: between its release and the real
  bind another process can take the port, so the real start must handle failure too.
- The address shown to phones silently falls back to the loopback address when no network
  is found, so the screen displays a code that can only ever reach the television itself.
- A feature test is satisfied by the presence of a name rather than by a working
  capability, and the interface claims a state, such as awake, that was never achieved.
- The socket accepts any page's connection, so a page from another origin with the right
  short secret takes a seat.
- The listener's reuse setting is left to the platform. The next start after a pause cannot
  bind over the wait states the pause created, and a few seconds of retries cannot outlast
  them.
- The host walks to a free port on resume, and every stored seat belongs to the old
  origin.
- One refusal message serves every cause. The page then either replays a stale secret
  forever, or forgets a good one that would have joined when the race ended.

## Techniques

`pin-in-qr-url` carries the short credential inside the scannable address and keeps the
typed route as fallback. `token-seat-reclaim-precedence` orders the admission checks so a
held token beats everything and a newcomer is refused during a live session.
`bounded-hello-timeout` puts a deadline on the first message and keeps side effects out of
its reach. `port-preflight-with-reuseaddress` probes the port the way the real listener
will bind it, retries with a visible status, and treats the probe as advisory.
`listener-release-on-pause-rebind-on-resume` makes the listener's lifetime follow the
application's, with seats surviving the gap. `capability-detect-insecure-origin` makes the
controller page honest about what a distrusted origin withholds.
