---
layer: application
type: application
subject: canvas-graph
technique: canvas-accessibility
stack: react
status: forged
verified_on: 2026-09-20
verified_against: react@19.2
---

# Two drawn fields in one repo — the twin, and the tab-stop wall

Ascent draws two read-only fields, and between them they hold both halves of
this technique: the Observatory (`src/features/inflight/live/observatory/`)
takes the twin route and takes it completely; the launch constellation
(`src/components/launch/ConstellationField.tsx`) reaches the tab-stop wall
by the route that always leads there. Neither is an editor, which is the
point — the model is inherited unearned, and only one of them paid it.

## The Observatory: the drawing hides, the list is the surface

`ObservatoryField.tsx:87` marks the whole SVG `aria-hidden`, and the header
comment (`:5-7`) states the contract: "an SVG scatter of 40 circles is not
navigable, and every body it draws is also a real `<button>` in
`<ObservatoryList>`, which is the accessible twin. Selection state is owned
by the PARENT and shared by both, so a lasso here checks the rows there and
vice versa."

That last clause is what makes the twin honest rather than parallel: one
selection set, two renderings, so the list cannot go stale against the
picture. `ObservatoryList.tsx` is a roving-tabindex listbox — one tab stop
for the whole list, arrows and Home/End moving focus inside it
(`tabIndex={i === cursor ? 0 : -1}`, `:73`) — built from real
`<button aria-pressed>` rows so activation needs no invented semantics.

And it carries what the drawing structurally cannot. `observatoryModel.ts`
refuses to plot a repository that has never been scanned — it has no
coordinates (`:6-9`), and refuses to back-derive one from its posture
label, which "would place a body at a quadrant centroid it was never
measured at" (`:10-14`). Those repositories still exist, and the list is
where they are nameable and selectable. The file's own words: "that is the whole reason the twin is a
list and not a caption" (`ObservatoryList.tsx:3-6`).

## The launch constellation: the name was fixed, the tab order was not

The same repo's other field went the other way, and the accessible name is
where it got the technique exactly right.

Each star is drawn inside an SVG `<a href>` to that repository's report, so
the container cannot announce itself as a single image. The comment at
`:154-156` is the role decision made from operability rather than from
appearance: `role="img"` "collapses the whole SVG to one image and makes
every star link (+ its aria-label) unreachable to screen readers. A group
keeps the label AND exposes the links." The surface uses `role="group"` with
`aria-label={fieldLabel}` (`:157`).

`fieldLabel` (`:70-73`) is the counted-name rule, and its comment records
the defect that produced it (`:65-69`): the name used to count the
*rendered* stars, which the `MAX_STARS = 80` slice truncates, so a 100-repo
organization announced "80 repositories" while the line above it read
"56/100 scanned" and the line below read "+20 more stars". The fix names the
real total and, only when the two differ, what is drawn — the organization's
name, then "constellation: 100 repositories, 80 brightest shown". Three
readings of one card now agree.

Per-star naming is the technique's "announce as themselves" clause, with the
degree slot replaced by the state that matters here:
each star's `aria-label` is "Open report for" plus the repository's full
name plus a detail suffix (`:205-208`), and that suffix carries level, score
and 30-day movement, or "not scanned" (`:200`). The hit target is separated from the mark — an invisible circle at
`max(look.r + 3, 6)` units (`:214`) so the ~2.1–2.9 px/unit rendering on a
phone still clears a 24px tap target that the visible 1.1–3.4 unit star
never could.

### Where it falls short of the standard

Every star being a link means every star is a tab stop, styled and focusable
(`src/app/globals.css:751`, `.launch-star-link:focus-visible`), and
`FleetMap.tsx:266-268` renders one `ConstellationField` per organization in
a grid — so the page's
tab order is up to 80 stops per organization, times the number of
organizations, between the filter controls and everything below the map.
This is the wall the focus model exists to prevent, arrived at by the usual
route: making each node a link is the cheap way to make a read-only diagram
operable, and it reinstates the wall as a side effect.

The repo already contains the answer it did not apply here. The Observatory
pattern — hide the drawing, put the contract in a twin list with one tab
stop and roving focus, share one selection model — would retire the wall and
would also solve a second problem the constellation currently has no answer
for: the `+20 more stars` that the cap leaves undrawn are, for a keyboard or
screen-reader user, simply not on the page. The counted name tells them
those twenty exist. Nothing lets them reach one.

## One note on the mover ring

A repository that moved in the window gets a thin directional ring, emerald
up and orange down, and the ring is *dashed* for a faller (`:224-227`) —
because "the emerald/orange pair converges under deuteranopia/protanopia",
so the mark carries a shape channel as well as a hue one. The rule behind
that redundancy is the encoding vocabulary of the data-viz subject rather
than this one; what belongs here is that a per-node state mark on a drawn
field is subject to it exactly like a chart mark, and that the canvas is
where it is easiest to forget.
