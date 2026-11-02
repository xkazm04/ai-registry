---
layer: golden-path
type: golden-path
subject: broadcast-software-control
status: forged
use_when: [building a tool that creates or removes sources and scenes in a streamer's own broadcasting software over its control socket, deciding what a tool may delete when it cleans up after itself, handling a dropped or re-established control connection mid-stream, storing and scoping the password for the broadcasting software's remote-control interface]
techniques:
  - owned-source-ledger-by-identity
  - claim-only-what-you-created
  - verify-absence-not-acknowledgement
  - read-the-peer-not-the-ledger
  - no-mutation-replay-on-reconnect
  - credential-custody-for-the-control-socket
---

# Broadcast software control

A streamer's broadcasting software is the most personal configuration they own. Its scenes
were arranged by hand over months, its sources carry names the streamer chose, its layout
is what their audience recognises as the channel. A tool that drives that software over its
remote-control socket - adding an overlay, creating a scene for a segment, tidying up at the
end of the night - is a guest in someone else's workshop. **The tool owns only what it
created, identifies what it created by the identity the software assigned rather than by
anything a human can type, treats the software as the truth about what exists, and never
calls a removal done until it has read the software and seen the thing gone.**

The naive reading treats the control socket as an API like any other: send a request, get
"success", update your own bookkeeping, move on. That reading fails in three ways at once.
It trusts names, so a tool that "cleans up its overlay" deletes the streamer's own source of
the same name. It trusts its own bookkeeping over the peer, so a scene the streamer deleted
by hand is still "there" in the tool's view and every action built on it misfires. And it
trusts the acknowledgement, so a removal that the software accepted but did not complete -
or completed for the input and not for a placement in another scene - is reported to the
streamer as clean. Each failure lands on air, in front of the audience, in the one piece of
software the streamer cannot afford to have rearranged under them.

## The software is the peer that holds the truth

The control socket is a thin, request-shaped window onto a state machine the tool does not
own. A human is editing the same state at the same time through the software's own
interface: renaming sources, deleting scenes, switching scene collections, restarting the
program between segments. Other tools may be connected too. So every fact a tool holds about
the software - this scene exists, this source is ours, this item sits in that scene - is a
claim with a timestamp, true when it was read and unknown after.

The discipline that follows is simple to state. **Keep a ledger, but use it only for what
the peer cannot tell you.** The peer cannot tell you which objects *you* created; that is
the ledger's job, and it is the only job the ledger does well. The peer *can* tell you what
exists right now, and on that question the ledger is always the weaker witness. Before a
decision that depends on existence - may I create, must I remove, is my overlay on air - the
tool reads the peer. The ledger answers "is this mine?", never "is this there?".

## Identity, not names

Every object the broadcasting software creates carries an identity it assigns: an opaque
unique identifier for each input and scene, and a numeric item identifier for each placement
of a source inside a scene. Names are display labels the streamer can edit at any moment and
the software lets collide across kinds. A tool that keys its ownership on a name has handed
the decision of what it may delete to whatever the streamer typed last.

So the tool records, at the moment of creation, the identity the response returned - and
from then on every claim, every update and every removal is addressed by that identity. A
name prefix that marks the tool's objects is still worth having, because it tells the
streamer at a glance which sources a tool put there; but a prefix is a courtesy to the
human, not proof to the machine. The moment a name and an identity disagree, the identity
wins and the disagreement is a finding, not something to resolve by guessing.

The mirror rule is the one that protects the streamer: **the tool never adopts an object it
did not create.** If the tool goes to create its overlay and finds a source of that name
already present without a matching ledger entry, it does not take it over, rewrite its
settings or delete it to make room. That source might be a stale leftover of the tool's own
crashed session; it might equally be the streamer's hand-built copy. The tool cannot tell
the two apart from the socket, so it refuses and says so, and the human decides.

Scenes follow the same rule with one concession. A tool that needs a scene for its sources
ensures one exists: it reads the scene list, creates the scene only on observed absence, and
records only the scenes it created. A scene the streamer already had may receive the tool's
placements, because a placement is reversible, but it is never recorded as the tool's and
never removed. Even an owned scene is removed only when it is empty - the streamer may have
dropped their own sources into it - and since the software offers no conditional removal,
the emptiness check and the removal are two requests with a window between them, which the
tool names rather than pretends away. And ensuring a scene never switches to it: what is on
air is the streamer's decision, and a tool that cuts the program to its own scene has taken
the stream.

## An acknowledgement is not a post-state

The software's success status says the request was accepted and executed without error. It
does not say the world now looks the way the tool intended. The sharpest case is the one the
protocol documentation itself gets wrong: a removed input is documented as taking its
placements with it immediately, but the program may only *mark* the input for removal and
prune its placements the next time each scene renders - and a scene that is not on air may
never render. An acknowledged removal can therefore leave the tool's source sitting in an
off-air scene indefinitely, waiting to appear the moment the streamer cuts to it. The reverse
also happens: removing the last placement can release the input, so the removal that follows
answers "not found". A removal of a placement leaves the input behind in every other scene
that uses it; a scene removed from under a placement reports no placement removal at all.
Some requests answer "not ready" while the software changes scene collections; a success
status is only a success when both its result flag and its success code say so. None of
these statuses, read alone, proves that the streamer's canvas is now free of the tool's
objects.

So a tool that promises "cleared" detaches its placements explicitly, by identity, before it
removes the input, then reads the inventory back and checks for each identity it owned, in
every scene where it may have placed it. Only absence observed is reported as absence, and
only an object observed before the removal is counted as removed - a "not found" on something
that was already gone contributes nothing to the tally. Anything the tool cannot see - a read
that timed out, a scene it could not list - is reported as unverified, not as clean, and the
ledger entry stays so a later pass still has the authority to finish the job, because the
streamer will act on the word "cleared" by going live.

The test double that stands in for the software in a tool's own suite has to model this, or
it will hide it. A fake peer that deletes inputs and placements synchronously on every
removal request is a kinder program than the real one, and a cleanup routine that passes
against it can still leave the streamer's off-air scenes full of leftovers. The fake retains
placements until they are explicitly detached; the test that matters asserts the tool
detached them.

## Connections drop; mutations do not replay

Control connections drop for ordinary reasons: the program restarts, the machine sleeps, the
streamer reloads a profile, a network hiccup on a second machine. The tempting design queues
the requests that were in flight and resends them when the socket returns. For reads that is
harmless. For mutations it is wrong, because a request whose response was lost may already
have executed: replaying "create overlay" makes a second overlay, replaying "remove item"
may hit an identity the software has since reused, and replaying a scene switch yanks the
stream to wherever the tool was an hour ago.

**On reconnect, the tool re-reads and reconciles; it never re-sends.** It authenticates
again, reads the inventory, compares it to its ledger, and recomputes what still needs doing
from the present state. A mutation whose outcome was unknown is resolved by looking, not by
repeating. If the session was invalidated deliberately - the software said, in effect, "do
not come back" - the tool does not reconnect automatically at all.

The simplest shape that honours this has no reconnect machinery at all: any failed operation
discards the connection, and the next operation opens a fresh one, authenticates, and starts
from a read. There is no queue to replay because nothing was queued.

All mutations go through one serialised channel with a bounded time budget per request. The
software processes requests in order; a tool that fires them from several tasks at once
interleaves a create with a removal of the same object and learns the outcome from whichever
response arrives first.

## The password is a key to the stream

The control socket can switch scenes, start and stop the broadcast and recording, change
source settings and point a browser source at any address. Whoever holds its password can do
all of that on the streamer's live channel. The password is therefore a credential of the
same rank as the platform login, and it is kept accordingly: in the operating system's secret
store, never in a settings file, a log line, an error message or a crash report; addressed by
a fixed service and label so the tool can find and delete exactly its own entry. It is
written to that store only after it has been proven - after the handshake authenticated and
a first request succeeded - so a mistyped password never becomes the remembered one. Text
the peer authors, such as the free-form comment attached to a rejected request, is never
surfaced or logged verbatim either: the tool maps every rejection to its own fixed message,
because a hostile or merely chatty peer can echo anything back. The socket is reached on the
streamer's own machine or private network only - a tool that will happily connect to a
public address is one configuration mistake from handing the stream to a stranger - and the
check refuses the numeric shorthands that resolvers expand into addresses nobody typed. And the tool never writes an address it did not originate into a source the
audience will see: a browser source pointed at a foreign URL is an injection onto the stream.

## Where this subject stops

Overlay composition and safe area is the nearest neighbour. It owns *where* the tool's
objects sit and how they look: the placement declared at provisioning, the scale cap, the
safe area, the provenance badge, the verification that the rendered scene reads on a real
stream. This subject owns *which* objects the tool may touch at all, how it knows they are
its own, and how it proves they are gone. The rule a reader uses is to ask whether the
question would survive the overlay being invisible: "may I delete this source" and "did the
removal happen" are here; "will viewers be able to read it" is there. A provisioning call
crosses both - its placement is composition's, its identity record is this subject's.

The isolated broadcast-software test lane owns automated tests that need the real
broadcasting software, and its whole craft is running a second instance that cannot reach
the streamer's own. This subject governs the opposite case: the tool talking to the
streamer's real, live instance in production, where there is no sandbox and every rule here
is the only thing between the tool and the streamer's configuration. When the instance is
one the test harness launched and will throw away, the test lane's rules apply; when it is
the one the streamer goes live from, these do.

Serving the pages that browser sources render - their origin, headers and payloads - belongs
to on-stream overlay delivery; this subject only decides whether the tool may point a source
at such a page, and refuses any address the tool did not mint.
