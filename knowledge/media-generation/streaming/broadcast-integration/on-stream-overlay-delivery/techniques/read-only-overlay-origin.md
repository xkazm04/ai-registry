---
layer: technique
type: technique
subject: on-stream-overlay-delivery
technique: read-only-overlay-origin
status: forged
laws: []
shared_with: []
use_when: [standing up the server that serves browser-source pages, adding a route next to an overlay page, reviewing the headers an overlay page ships with]
---

# Read-only overlay origin

Overlay pages and their data stream are served from an origin that exists only to be
watched. It has no route that changes anything, it answers only to the exact host name it
expects, and every response carries a policy that confines the page to its own origin.

## Why a separate origin

The tool almost always has a second interface — a desktop shell talking to a local core,
an admin panel, a control API. The tempting build mounts the overlay pages on that same
server, under a path like `/overlay/`. That puts a page that the streamer will paste into
a third-party program, share with moderators and leak in screenshots on the same origin as
every route that changes state. Same-origin script can call those routes with whatever
ambient trust the origin carries, and a single injection in the overlay becomes a full
compromise of the tool.

A separate origin — its own port, or its own host on the loopback or private interface —
removes that whole class at the browser level. Nothing on the overlay origin can write,
so nothing a page on it does can write either.

## Procedure

1. **Bind narrowly.** Listen on the loopback interface, or on a private-network address
   when the broadcasting software runs on a second machine. Never on all interfaces by
   default; a public bind turns the overlay into an internet-facing view of the stream's
   private state.
2. **Serve GET only, and stream one way.** Pages, their bundled static assets, and a
   read stream per overlay kind. The page has nothing to send, so the stream is one-way
   (server-sent events) rather than a bidirectional socket that would need its own
   inbound handling. Every other method answers with a refusal. No proxy, no redirect, no
   forwarding route. Do not "temporarily" add a POST for a test button.
3. **Check the exact host.** Accept a request only when its `Host` header is exactly the
   name and port the tool handed out. A host name the attacker controls can be made to
   resolve to the loopback address (DNS rebinding); a server that accepts any host serves
   its pages, and its stream, to that origin.
4. **Ship a strict content policy on every page.** Script, style, images, fonts and
   connections from the page's own origin only; no inline script and no evaluated
   strings; default deny for every other resource class; base and form targets
   forbidden; framing forbidden. The connection directive is the important one: it is
   what stops an injected script from opening a socket to the broadcasting software's
   control port on the same machine. Narrow it below "own origin" to the exact
   stream addresses, with the actual bound port, so that even a same-origin route added
   later is not reachable from script by default.
5. **Put the headers on every response.** The policy, no-sniff and no-store go on
   errors, not-found answers and wrong-host refusals too. A refusal without the policy is
   a page an attacker can choose to be shown.
6. **Refuse sniffing and caching.** Send the no-sniff header so a data response cannot be
   reinterpreted as script, and a no-store cache directive on pages and stream, because the
   embedded browser keeps a disk cache across restarts and a cached overlay repaints
   yesterday's state.
7. **Run with the lowest page permission.** Where the embedded browser grants pages graded
   access to the broadcasting software, the streamer's set-up instructions say to leave
   overlay sources at the lowest level. The overlay needs none of it.

## Decision rules

- **When a feature needs the overlay to trigger something**, the trigger lives in the
  tool's control interface, and the overlay sees the result in its next snapshot.
- **When the policy blocks a library the page wants**, bundle the library and serve it
  from the origin. Do not widen the policy to a content-delivery host; that host's
  compromise becomes your broadcast's.
- **When the policy's measured cost is questioned**, measure it — header bytes and the
  page's time to first paint inside the embedded browser — and keep the number with the
  decision. A strict policy that has not been measured inside the real embedded browser is
  a claim, not a result.
- **When styling needs an exception**, allow the narrowest thing that works and write the
  exception down where the policy is defined, with its reason. The common one is forced on
  you: the broadcasting software injects the streamer's custom stylesheet into every
  browser source as an inline style element with no nonce, so a nonce- or hash-based style
  policy breaks the streamer's own customisation. Inline style is then allowed, and only
  inline style — no style hosts, no imports, no remote fonts — because style is the one
  resource class whose worst case is a bad look rather than running code.
- **When the control interface sits on the same machine**, it grants the overlay origin
  nothing: no cross-origin permission, no allowance in its origin check, even for a
  request that carries an otherwise valid credential. Origin separation that the other
  side does not enforce is a convention, not a boundary.

## When not to use it

A page the streamer opens only in their own browser, as a control panel, is not an
overlay and does not belong on this origin; it needs authentication and a write path, and
it should never be pasted into the broadcasting software. Do not stretch the read-only
origin to serve it with a token "for convenience" — the two have opposite trust models and
must not share an origin.
