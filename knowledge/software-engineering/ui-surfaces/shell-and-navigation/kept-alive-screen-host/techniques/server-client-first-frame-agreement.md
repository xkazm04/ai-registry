---
layer: technique
type: technique
subject: kept-alive-screen-host
technique: server-client-first-frame-agreement
status: forged
laws: []
shared_with: []
use_when: [hydration mismatch warnings on a client-owned shell, relative ages differ between server HTML and the hydrated page, a mode-dependent branch flickers on load]
---

# Server–client first-frame agreement

A client host still has a server-rendered first frame. A hard load or a reload
prerenders the shell and the visible screen's frame, with every value a dash,
and the client then hydrates that HTML. Hydration requires the client's first
render to produce the same tree the server did. Every branch that reads
something only one side knows breaks that requirement: a viewport, a stored
preference, the clock, a mode that is known only after data arrives, the
address bar's query on a statically prerendered route. The rule is simple to
state. The first client frame equals the server frame, and client-only
knowledge opens one frame later.

## A hydrated flag, without an effect

Gate client-only branches on a hydrated flag read through an external-store
subscription whose server snapshot is `false` and whose client snapshot is
`true`, with a subscribe function that never fires. During hydration the
framework uses the server snapshot, so the flag is `false` on both sides. Right
after hydration it reads the client snapshot, so it is `true`, and it is `true`
from the very first render of anything mounted later. Compared with the
familiar "set state in a mount effect" flag, this costs no extra render pass
and no state, and a component mounted after hydration does not flash its
server branch first.

Use it for branches whose input is null on the server: shell data that is
read after the static frame paints, the demo or live mode that data decides,
the address bar read while rendering. The pattern is "hydrated *and* the
condition", so the server and hydration render agree on the condition's
false side.

## Hidden kept screens are not on the server

Only the visible screen is in the server's HTML. A hidden-but-alive boundary is
skipped by the server renderer, and its content is rendered on the client
after hydration. Two consequences follow:

- **Content that must be in the first response cannot sit behind a hidden
  boundary.** The address decides which screen is visible on the server. Make
  sure the server and the hydrating client compute the same visible screen
  from the same input, and the input is the address, not client state.
- **A wrapper that hides the framework's own route page must not hide it
  during the server render or hydration.** If it does, the framework expects a
  page segment that never rendered and reports it. Hide the route's page only
  after the host has installed itself, on the first effect, so that on the
  server and in hydration it renders as it is: a thin shell that draws nothing.

## The server passes "now"

Relative time is the most common silent mismatch. "4 minutes ago" computed
on the server at render time and again on the client at hydration time differs
whenever a minute boundary falls between them. Some ages differ every time.
The server reads the clock once, when it reads the view, and passes that `now`
with the data. Every age in the first frame is computed from it on both sides.
Only after hydration does the client start a ticking clock of its own. The same
discipline applies to anything locale- or timezone-dependent. Format with an
explicit zone, or format on the server and send the text.

An age whose start is unknown is left out or shown as an unknown marker,
never as "0d". An unknown start is not a start of now.

## Suspense around request data, with no fallback shape

Where the host reads request data (the path on a dynamic route, the query),
it sits behind a suspense boundary whose fallback is nothing. On a static route
the read resolves while prerendering, so the screen's frame is in the static
shell. On a dynamic route the frame renders at request time. In neither case
is there a stand-in shape for the client to replace, which is the
frame-first rule meeting the hydration rule.

## Development doubles

A development mode that mounts every component twice also opens the host's
stream twice on a hard load. Abort the first read on the first unmount. Never
work around it by caching the stream, or production behaviour diverges from
the behaviour you test.

## When not to use it

A surface that is never server-rendered (a desktop renderer that loads a
local bundle, or a route explicitly rendered only on the client) has no
hydration to agree with. There the hydrated flag is noise. Do not add one by
reflex.
