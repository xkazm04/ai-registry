---
layer: golden-path
type: golden-path
subject: on-stream-overlay-delivery
status: forged
use_when: [serving a page the broadcasting software renders as a browser source, deciding what data an on-stream overlay may receive, an overlay that froze or showed stale numbers on air, handing a streamer the address to paste into their broadcasting software]
techniques:
  - read-only-overlay-origin
  - aggregate-only-payloads
  - full-replacement-snapshots
  - clear-on-disconnect
  - no-source-url-without-a-valid-read
  - consented-data-only-packages
---

# On-stream overlay delivery

A streamer tool that wants to put something on the broadcast — a vote bar, a giveaway
plate, a reacting visual — rarely draws into the video itself. It serves a web page, and
the streamer pastes that page's address into their broadcasting software as a browser
source. The broadcasting software runs an embedded browser, renders the page with a
transparent background, and composites the result onto every frame it sends to the
streaming platform. From that moment the page is not a web page any more. It is a layer of
a live broadcast that is recorded, clipped and replayed by strangers, and it is running
inside the most sensitive program on the streamer's machine.

This subject is the craft of serving those pages. It rests on one sentence:

> **An overlay page is a public, read-only view of a fact the tool already holds. It
> receives only what it draws, it draws only what is current, and it can change nothing.**

Each half of that sentence is a place where the naive build fails, and the failures are
not cosmetic. A page that receives more than it draws leaks it to anyone who can open the
same address. A page that draws what is no longer current lies on air in the tool's name.
A page that can change something is an unauthenticated control surface that the
broadcasting software will happily load for anyone who can get a URL into it.

## Why the overlay is its own threat surface

Three properties of a browser source make the ordinary web-app defaults wrong.

**The page runs inside the streamer's broadcasting software.** The embedded browser is a
full browser engine, and a page loaded into it can usually reach the loopback interface —
including the broadcasting software's own control socket, which sits on a well-known local
port. Published security research has shown pages of arbitrary origin in a browser source
opening a socket to that port; whether that socket then accepts commands depends only on
whether the streamer set a password. The embedded browser also tends to lag the upstream
engine by releases, and some versions expose a page-level bridge with graded permission
levels. A script injected into an overlay page is therefore not a defaced banner. It is
code running next to the controls of a live broadcast. The page's own policy is the cheap
fence: it may talk only to its own origin, run only its own bundled script, and be
framed by nothing.

**The page's address is a credential that does not feel like one.** The streamer copies
it into a settings dialog, a shared scene collection, a screenshot for a moderator, a
support ticket. Anyone holding it sees what the overlay sees. So the address must grant
only the right to *watch*, and what is watched must be safe to show to anyone who might
hold it. That is why the payload is aggregate and the origin is read-only, rather than
either being protected by an unguessable token alone.

**Whatever the page draws is broadcast, and the broadcast does not refresh.** A dashboard
that shows a stale number is a minor bug, because the operator reloads it. An overlay that
shows a stale number is a claim the stream makes to every viewer, and nobody watching it is
in a position to reload anything. The broadcasting software keeps the last frame a page
painted for as long as the page is loaded; an overlay that loses its data feed and does
nothing looks, on stream, exactly like an overlay whose number has stopped moving.

## The shape: a separate door, a closed payload, a whole picture

The delivery architecture has three parts, and the load-bearing property is that the
overlay side holds no authority at all.

1. **A read-only origin.** The overlay pages and their data stream are served from their
   own origin — its own port or host, bound to the loopback or private interface — that
   carries no mutating route of any kind. It checks the exact host name it expects, so a
   rebinding hostname cannot borrow it; it ships a strict content policy on every
   response, refusals included (own bundled script only, connections only to its own
   stream addresses, no framing, no inline script); it refuses content-type sniffing; and
   it forbids caching, because a cached overlay is a stale overlay that survives a
   restart. The tool's control interface lives somewhere else and grants this origin
   nothing. That is
   [read-only-overlay-origin](./techniques/read-only-overlay-origin.md).
2. **A closed payload.** What crosses to the page is a typed message whose every field is
   something the page draws, whose strings and lists have hard limits, and which contains
   shares, counts and states — never the identities, raw messages or internal records the
   count was made from. That is [aggregate-only-payloads](./techniques/aggregate-only-payloads.md).
   The look travels the same way: a design package is data the overlay's own renderer
   draws, and a package that wants to run its own script gets that only from an explicit
   streamer grant bound to its exact bytes. That is
   [consented-data-only-packages](./techniques/consented-data-only-packages.md).
3. **A whole picture per message.** Every message the page receives is a complete
   snapshot of what its layers should show, replacing the previous one wholesale. The page
   accumulates nothing, so a page that joins late, reloads, or reconnects after a gap is
   correct on its first message. That is
   [full-replacement-snapshots](./techniques/full-replacement-snapshots.md).

The failure mode to design out is the overlay that "helps": a page that posts a vote,
dismisses a plate, acknowledges an alert, or fetches a viewer's avatar from the platform on
its own. Each one turns the read-only door into a write door or turns the page into a
second integration with its own credentials. If the overlay needs something new, the tool
computes it and puts it in the snapshot.

## Never frozen on air

The broadcast's default for a broken page is to keep painting the last frame, and the last
frame is usually the most misleading one available: a vote bar at 61 percent, a "drawing…"
plate, a countdown stuck at four seconds. So the page treats loss of its feed as a state
to render, not an error to log. When the stream breaks it clears its data-bearing layers
to transparent and reconnects on a capped backoff; when the stream returns, the first
snapshot repaints everything. A snapshot the page cannot parse is treated the same way: a
newer state exists and the page cannot read it, so the frame it is still showing is known
to be wrong. A blank overlay is a visible, honest absence — the streamer
sees it on their preview and the audience sees nothing — while a frozen one is a confident
falsehood. That is [clear-on-disconnect](./techniques/clear-on-disconnect.md).

The same discipline applies at set-up time, before anything is on air. The tool hands the
streamer a browser-source address only after it has successfully read the state that
address will show. If the read fails — the vote has no window, the draw has no record, the
store is locked — the tool refuses the address and says why, rather than giving out a URL
that will load into a blank page the streamer only discovers mid-stream. The page route
applies the same rule when the broadcasting software loads it: no readable state, no page. That is
[no-source-url-without-a-valid-read](./techniques/no-source-url-without-a-valid-read.md).

## What the page may know

An overlay is a broadcast surface, so the question "may the page receive this?" is the
same question as "may this be shown to the whole audience and to anyone who later holds
the address?". Most of what a streamer tool holds fails that test: viewer identities,
individual ballots, chat text, moderation verdicts, internal ids, the streamer's own
settings. The answer is not to send them and rely on the page not to draw them, because a
page's data is visible to anyone who opens the address in an ordinary browser and its
developer tools. It is to never put them in the message.

Two consequences surprise teams. The first is that even the option labels of a chat vote
are viewer text, and a vote bar that shows numbered options and lets the streamer say what
each one means has removed a moderation problem rather than solved it. The second is that
the on-stream aggregate is a fixed projection — one window, one filter — that does not
follow the streamer's own view. A streamer who narrows their screen to inspect one slice of
chat, or replays an earlier minute, has changed what they see, not what the audience sees.

A snapshot also carries where its numbers came from. When a tool runs in rehearsal or on
simulated input, the overlay says so on stream, because a rehearsal number without its
label is a fabricated number on air. The narrow exception for individuals is a viewer who
put themselves on stream by a deliberate act whose stated consequence was being shown — a
drawn winner of a giveaway that announces winners — and then only what that act licenses.

## Decision rules

- **When adding any overlay**, serve it from the read-only origin, give it its own typed
  snapshot, and check that every field is something the page draws. A field kept "for
  later" is a leak waiting for its feature.
- **When the overlay needs to react to an action**, the action happens in the tool and the
  overlay sees its consequence in the next snapshot. The page never acts.
- **When the feed breaks**, clear, reconnect with capped backoff, and repaint from the next
  full snapshot. Never interpolate, extrapolate or keep counting locally.
- **When showing a person on stream**, name the viewer's own act that put them there. No
  act, no name.
- **When a design package wants script**, the streamer grants it per entry point against
  the package's exact bytes; a wider update waits for a new grant, and revocation reloads
  the page.
- **When handing out an address**, read first; on a failed read, refuse with the reason.

## The boundary of the subject

[overlay-composition-and-safe-area](../overlay-composition-and-safe-area/overlay-composition-and-safe-area.md)
owns how overlays sit together on the canvas: where each is placed, how it scales into its
envelope, how it reads against a real stream background and how the rendered scene is
verified. This subject owns the page and its feed: what origin serves it, what the page
receives, how it behaves when the feed breaks. The pick rule is the layer: if the question
is "where is it and can it be read", it is composition; if it is "what does the page get
and what does it show when nothing arrives", it is delivery.

[broadcast-software-control](../broadcast-software-control/broadcast-software-control.md)
owns driving the broadcasting software over its control socket — creating the browser
source, owning it, removing it and proving the removal. This subject produces the address
that source points at and stops there. A tool that both serves a page and creates the
source for it does both jobs, and the seam between them is the address: delivery
guarantees the address is valid and read-only before control is allowed to place it.

[path-independent-output-gate](../../trust-and-evaluation/live-chat-moderation-and-anti-bait/techniques/path-independent-output-gate.md),
in live chat moderation, owns screening text before it reaches air, including a chat lane
drawn on the canvas. Overlay delivery does not screen content; it treats anything textual
in a snapshot as already past that gate, and the aggregate-only rule keeps most text out of
the snapshot in the first place. When an overlay must draw viewer text, the gate decides
whether a line may be drawn; this subject decides how that already-approved line reaches
the page and how it is cleared.
