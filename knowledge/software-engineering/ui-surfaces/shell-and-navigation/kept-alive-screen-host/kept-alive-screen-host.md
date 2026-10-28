---
layer: golden-path
type: golden-path
subject: kept-alive-screen-host
status: forged
use_when: [in-app navigation waits on the server before anything moves, screens remount cold on every visit, a loading skeleton flashes on each screen switch, hydration mismatches on a client-owned shell]
techniques:
  - sliced-screen-stream
  - hidden-but-alive-screens
  - frame-first-no-skeleton
  - host-click-delegation
  - server-client-first-frame-agreement
---

# Kept-alive screen host

A kept-alive screen host is one client-side component that owns every in-app
navigation of a multi-screen product. It makes three promises, and the subject
is the machinery that keeps them at once. The first is that a click paints the
target screen's *real frame* in the same frame as the click: its title, its
toolbar, its columns and its sections, with no round-trip in between. The
second is that a screen the person has visited stays mounted but hidden, so
returning to it is a visibility change and not a rebuild. The third is that
each screen's data arrives over one request per screen, streamed as named
slices, and every value not yet read shows as a dash in geometry that was
reserved for it. Nothing ever shows a skeleton.

The naive architecture fails all three in the same place. When navigation goes
through a server round-trip and the screen is a fresh tree each time, the click
waits on the network before anything moves, the previous screen's scroll, open
rows and half-typed filter are discarded, and the gap is filled by a loading
silhouette that matches the real layout only approximately. Each of those is
reasonable on its own. Together they make a dense product feel as though it is
being reassembled on every click. The host treats the gap itself as the defect.
It does not try to decorate the gap. It removes the round-trip from the paint
path, removes the rebuild from the return path, and removes the decoration from
the wait.

## The host owns navigation, and the URL follows the person

Exactly one component decides which screen is shown. It holds the current
screen identity, the set of kept screens, and the per-screen data state. It
hears every plain in-app link click in one place, by delegation at the document
in the capture phase, so no screen has to remember to route through it. Clicks
the browser should keep pass through untouched: a modifier key, a non-primary
button, a download, a new-tab target, an external origin, an explicit opt-out
marker on the link. Every other click is prevented and turned into a host
transition. That transition changes the visible screen first. It writes the
address second, and only because a person moved. A redirect the server
answered, a restore on load, or a programmatic correction replaces or leaves
the history entry instead of pushing one. Whatever the framework keeps in
history state is preserved and not overwritten, because the framework's own
back and forward handling depends on it. See
[host-click-delegation](./techniques/host-click-delegation.md).

## Kept screens are hidden, not unmounted, and hidden means stopped

A visited screen is kept in a bounded, least-recently-used set. Its state and
its document nodes survive, its effects are torn down while hidden, and they
are re-run when it is shown again. That last property is what makes keeping
alive affordable. A hidden screen that kept polling, kept its hotkeys bound or
kept its registrations in the shell's slots would be a second screen
competing with the visible one. So the host's primitive must stop effects on
hide. A plain visibility toggle does not stop them; a hidden-but-alive boundary
does. The consequence cuts the other way too, and it is the one teams learn by
incident: anything that must outlive a visit cannot hang off a view effect.
A long-running job, a subscription that feeds a badge, or a timer whose result
another screen reads belongs to a shell-hosted service. If it is left in an
effect, it stops the moment the person looks elsewhere. See
[hidden-but-alive-screens](./techniques/hidden-but-alive-screens.md).

## The frame is static, and a dash is the only placeholder

The screen's frame is everything the screen knows without data: its heading,
its controls, its column headers, its section titles, the rows it reserves for
a fixed set of measures. The host renders that frame on the click, and each
value that has not been read renders as a dash in the cell, line or tile it
will occupy. The geometry is reserved, so arrival replaces a dash with a value
of the same box, and nothing reflows. A dash is not a decoration of loading.
It states something narrower and truer: *this value has not been read*. That is
also why it survives into the settled state. A slice that came back with
nothing, or never came back, leaves its dash in place under an honest label
([law: unknown is not a value](../../../_laws.md#unknown-is-not-a-value)), never
a zero and never a blank. The ban on skeletons is enforced by a test that
fails on any skeleton component or class in the screen tree, because a
placeholder style that only reviewers enforce comes back with the next screen.
See [frame-first-no-skeleton](./techniques/frame-first-no-skeleton.md).

## One request per screen, streamed as named slices

A screen's data is a fixed set of named slices: the summary strip, the list,
the side panel, the counts. The host asks for all of them in one request and
the server answers as newline-delimited JSON, one line per slice as each one
resolves, then a terminator line. Each line carries a status: `ok` with a
value, `notFound`, `redirect` with a target, or `error`. A slice the server never
answered before the terminator, or before the stream broke, becomes *not
served* on the client. That is a stated state with its own rendering, not a
dash that waits forever. The payload is plain JSON and nothing else, so no class
instances, dates or undefined values cross the wire pretending to be types, and
an absent optional field is an omitted key rather than a null that reads as a
value. The client reconciles each line into the slice it names and leaves the
others alone, so a slow slice delays only its own cells. See
[sliced-screen-stream](./techniques/sliced-screen-stream.md).

## The server and the client paint the same first frame

The host is a client component, but its first frame is still rendered on the
server for the cold load. Every branch that depends on something only the
client knows can then produce a mismatch: a viewport, a stored preference, a
clock, a mode decided after hydration. The rule is that the first client frame
equals the server frame, and client-only branches open one frame later behind
a hydrated flag read through an external-store subscription. That flag is false
on the server and during hydration and true after it, and no effect sets state
to get it. Kept screens that are hidden are not rendered on the server at all,
so the server sends only the visible screen. The server also passes its notion
of *now* into the first frame, so every relative age ("4 minutes ago") renders
the same text on both sides and only then starts ticking. See
[server-client-first-frame-agreement](./techniques/server-client-first-frame-agreement.md).

## Boundaries with the neighbours

This subject sits between three others, and the rule for choosing among them
is the question being asked. The
[app-shell](../app-shell/app-shell.md) subject owns frame continuity as a
property: the shell does not unmount, the nav is one owned vocabulary, and its
lazy-section-loading technique already names keep-alive as a bounded
optimisation over restore and lists the hazards of keeping a section. This
subject is that optimisation built as a mechanism: who hears the click, what
the kept set evicts, what stops on hide and what must therefore live elsewhere.
When the question is *should the frame survive*, read the shell; when it is
*how does one host keep many screens alive without them fighting*, read this.
[async-ui-states](../../feedback-and-style/async-ui-states/async-ui-states.md)
owns how a region settles: the state model, empty and failed states, and the
placeholder-design and arrival-choreography techniques for products that do
draw ghosts and cascades. This subject owns a stricter guarantee that replaces
the ghost: the real frame is the placeholder and a dash marks every unread
value. Where the two disagree, a host that has made this guarantee follows it,
and everything about empty, failure and refresh still comes from the neighbour.
The client-fetch-cache subject's warm-remount-caches technique keeps *data*
alive beyond the view that read it. This subject keeps *view instances* alive
beyond the visit. A screen evicted from the kept set comes back through the
data cache warm, not cold, so the two compose rather than compete.

## What the naive reading gets wrong

The tempting reading of "keep screens alive" is a map of mounted screens with
the hidden ones styled invisible. That keeps every poll, every key binding and
every registration running on screens nobody is looking at, and it grows until
memory complains. The tempting reading of "stream the data" is a stream with no
terminator and no per-slice status. Then a dropped connection and a slow slice
look identical, and the screen waits forever on a value that is never coming.
The tempting reading of "no skeleton" is a blank region, which shifts layout on
arrival exactly as a skeleton was meant to prevent. And the tempting reading of
"own navigation" is a click handler on each link, which is right until the
first link someone adds without it, and which then rewrites the URL on
redirects and restores until back no longer goes back. Each technique below is
the guard against one of those readings.

## The techniques

- [sliced-screen-stream](./techniques/sliced-screen-stream.md) — one request
  per screen, NDJSON lines per named slice with a status, a terminator, and an
  unanswered slice resolved as not served.
- [hidden-but-alive-screens](./techniques/hidden-but-alive-screens.md) — the
  bounded kept set, effects stopped on hide, and what must not hang off a view
  effect.
- [frame-first-no-skeleton](./techniques/frame-first-no-skeleton.md) — the
  static frame on the click, dashes in reserved geometry, and the gate test that
  forbids skeletons.
- [host-click-delegation](./techniques/host-click-delegation.md) —
  capture-phase delegation of plain clicks, the opt-outs, history state kept
  intact, and the URL written only for a person's move.
- [server-client-first-frame-agreement](./techniques/server-client-first-frame-agreement.md)
  — the hydrated flag, hidden screens skipped on the server, and the server's
  clock passed into the first frame.
