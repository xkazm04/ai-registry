---
layer: application
type: application
subject: narrative-scroll-surface
technique: no-orientation-tax
stack: react
status: forged
verified_on: 2026-09-08
verified_against: react@19
---

# No orientation tax — a shared section rail across two published pages

How `kp` (at `3394deb2`) realizes
[no-orientation-tax](../techniques/no-orientation-tax.md) in
`app/landing/spark/SectionRail.tsx`, the component both the marketing home and
the eight-station `/about` page render, plus the phone-width substitute at
`app/landing/spark/sections/MobileNav.tsx`.

## The rail is a readout that also navigates, and it says so

`SectionRail.tsx:8-13` records the move that created it: in-page anchors used
to sit in the topbar "next to the real destinations … anchors into the page
you are already on, competing with the links that actually go somewhere. They
live here instead: a right-hand rail that stays out of the way until you have
scrolled past the hero, then rides along as a you-are-here readout."

`active` starts `null` and `aria-current` is set only on a match
(`:87`, `:180`), so before the reader has reached the first station the rail
highlights nothing rather than pre-lighting entry one — the technique's
"none yet" state, and
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) held
literally.

## Legible at rest — stated as an incident

The header comment is the technique's legibility rule with the defect that
produced it (`SectionRail.tsx:20-25`):

> Every label is legible at rest. The rail used to collapse to a column of
> bare dots with only the active label pinned, which made it a scroll-position
> READOUT rather than a nav: you cannot choose a destination you cannot read,
> so the five inactive entries were dead weight until you happened to hover
> them.

The resolution is at `:191-200`, and the reason attached to it is the refinement
the technique now carries: "Inactive labels stay readable at 55% — a
destination you can't read isn't one you can choose. Opacity alone carries the
state, so nothing reflows as you scroll."

## The reserved band, and the page content measured against it

`SectionRail.tsx:169` positions the rail with
`left: min(calc(50% + 40rem + 0.5rem), calc(100% - ${width}))`, and the
comment above it (`:156-167`) explains why a plain viewport-edge pin was
wrong — an open-label rail "put that straight over the third feature card on a
1440px laptop" — and that on that same laptop the clamp is the winning branch,
"so `width` is the rail's real right-edge position, not a fallback. A caller
with longer labels than the homepage's must say so or have them cut off at the
viewport edge." `/about` does say so, passing `width="12.5rem"` against the
homepage's `9.25rem` because "the widest label here is a translated phase name
('05 Pracovní ukázka', '05 Travail pratique')" (`AboutCurve.tsx:276-279`).

The other half of the rule — that the page's own content is laid out against
that band — appears at `AboutCurve.tsx:248-256`, and it is the clearest
instance of the measurement the technique asks for:

> `xl` and not `lg`, because the viewport is not the only limit: the `fixed`
> SectionRail below reserves the rightmost 200px from `lg` up, and a centred
> 771px line clears it only from vw ≥ 1171 — at 1024 its tail runs under the
> rail. 1280 gives 55px of clearance, 1440 gives 135px.

The 771px is the German string, measured per locale at this page's own type
size (`:238-242`) — the collision surfacing first in the longest-translating
language, exactly as the technique predicts.

## Arrival mechanics

**Scroll position is read as live external state**, not mirrored by an effect
(`SectionRail.tsx:58-63`): "It is genuinely external (the browser owns it), so
this reads the live value on every render — including the first, which matters
for a restored scroll position or a deep link into `#pricing`, where an
effect-based mirror would paint the rail hidden and then pop it in."
`serverSnapshot` returns `false` (`:73-74`), so the served document and the
first client render agree.

**A jump replaces rather than pushes** (`:133-136`): "`history.replaceState`
rather than pushState: the rail is a scrubber, not a trail of destinations —
six entries would otherwise bury the page the visitor arrived from under six
back-presses. The hash still updates, so the URL stays shareable mid-page."

**The anchor is the no-JS fallback.** Each entry keeps a real `href="#id"`
(`:178`) and the handler declines when the target is absent (`:139`), letting
the browser try the anchor; the glide is an enhancement over a link that works
without it (`:126-132`). `/about`'s stations carry a landing offset for the
case where the glide does not run — `scroll-mt-6` on the row, "keeps the row's
own top clear of the topbar when a `#step-07` deep link lands without the
rail's smooth glide" (`AboutCurve.tsx:99-105`).

## One vocabulary, spent twice

`AboutCurve.tsx:156-165` builds the eight destinations once from the station
list and hands the same array to the rail and to the phone disclosure. The
comment names the failure it removes (`:150-153`): "/about is one 8-step
scroll-drawn line and used to be walkable only by scrolling it: a visitor who
came to see what happens at Offer had six phases to get through before finding
out it exists."

The homepage's own list carries the same rule for the same reason
(`SectionRail.tsx:43-46`): exported "so the phone-width disclosure … offers
the SAME five destinations: the rail is `lg:block`, so below that breakpoint
this list is the only in-page navigation there is, and two copies of it would
drift the moment a band is added."

The observer is re-armed on the destinations, not on their labels
(`:93-97`, `:124`): "a locale switch re-renders every label and must not tear
down the scroll-spy."

## Where the rail cannot fit

Below `lg` the rail is gone (`:170`), and the substitute is a disclosure
carrying the same ordered destinations first, sibling pages after
(`AboutCurve.tsx:160-165`, `:188-194`). `MobileNav.tsx:12-31` records what its
absence cost: "Below `sm` the landing had NO navigation at all … Five bands of
page and no way to jump to the one you came for. /about had the same hole for
the same reason." Its keyboard contract is the app's shared non-modal
disclosure behaviour — focus into the panel, Escape closes, focus returns
(`:23-27`) — and its section links keep the same real anchor and glide as the
rail's (`:29-31`).

## Where the repo falls short

**The you-are-here readout does not survive to phone width.** The disclosure
offers the destinations but shows no current station, so the viewport class
whose readers can see least of the page at once is the one with no position
indicator. The technique permits removing the rail; it asks that losing the
readout be a decision, and no comment in either file records making it.

**A jump moves scroll, not focus.** `scrollToSection`
(`SectionRail.tsx:137-143`) calls `scrollIntoView` and updates the hash; the
station never takes programmatic focus, so a keyboard reader who activates an
entry is left in the rail while the visual reader is at the station.
`MobileNav`'s section handler is the same shape. The page's stations are
plain containers with an id (`AboutCurve.tsx:102-106`) and no focus target,
so the fix is a change to both ends.

**The offset budget is stated twice.** The station carries `scroll-mt-6` for
an anchor landing (`AboutCurve.tsx:105`); the rail's glide passes
`block: "start"` (`:141` in `SectionRail.tsx`) and inherits whatever the
element declares. Those agree today because one number governs both paths, but
nothing states the topbar's height as the single measurement they are derived
from — the sibling reading surface's offset-budget discipline, unmet on a page
that has exactly the same fixed chrome.
