---
layer: technique
type: technique
subject: page-load-pipeline
technique: priority-is-declared-not-hoped
status: forged
laws: []
shared_with: []
use_when: [the largest element is discovered early but still finishes late, marking an image or script as high priority, adding connection warm-up hints for other origins]
---

# Priority is declared, not hoped

Discovered resources do not load in the order they were found. The browser
assigns each a priority from its type and position — stylesheets early in the
head very high, images low until layout shows them in the viewport, asynchronous
scripts low — and schedules the connection's bandwidth accordingly. The guess is
good on average. It is systematically wrong for the one resource most pages care
about most: the image that becomes the largest element in the first viewport
starts at low priority and is promoted only after layout, by which time it has
already queued behind resources the first screen does not draw.

The page can correct the guess. A priority hint raises or lowers one resource
within its type; a connection hint opens a connection to an origin before any
request to it is known. Neither makes a resource discoverable — that is
[discoverable-critical-resources](./discoverable-critical-resources.md) — and
discovery does not set priority. A resource that is found late needs discovery;
a resource that is found early and still finishes late needs priority.

## Find the largest element before raising anything

Priority spent on the wrong resource is worse than none, because it takes
bandwidth from the right one. So the procedure starts with identification, per
key route and per device class: which element is the largest content painted in
the first viewport? It is frequently **text**, not an image — a headline set in
a large type size over a decorative backdrop. On such a page the backdrop is not
the metric's element, and marking it high priority lets a decorative texture
compete with the font and styles the headline is waiting on. Decoration earns
no priority by being big or being first in the markup.

Two further traps recur. A component that renders **two variants of one image**
— light and dark, narrow and wide — and marks both high priority preloads two
full images while exactly one is painted; mark the variant the server-rendered
state will paint, and recognise that a pre-paint script that can choose a
different variant makes even that a guess. And a **shared component** that
marks its image high priority — a logo in a header present on every route —
spends the page's priority on every route whether or not it is that route's
largest element.

## Raise one, demote the rest

- **Raise the largest element's resource**, and only it, with a high priority
  hint on the element that loads it, never through a blanket policy.
- **Demote what competes in the first moments**: images in the first viewport
  that are not the largest element, off-screen slides of a carousel,
  below-the-fold media that the scanner will otherwise find early. A low hint is
  as useful as a high one and rarely used.
- **Never lazy-load the largest element.** A lazy policy applied to every image
  by default delays exactly the one the load metric measures.
- **Priority is a hint.** The browser may resolve conflicts its own way, and a
  server or intermediary that does not honour stream priority can flatten it.
  Verify the effect in a waterfall rather than assuming it.

## Bytes are part of priority

Raising priority reorders the queue; it does not shorten the largest element's
own download. For images the cheapest priority win is often fewer bytes: sources
sized to the rendered width, a size declaration that tells the truth about the
layout slot, and the most compressed image format the browser advertises, with a
fallback. A size declaration that claims the full viewport width for an image
drawn at a third of it fetches three times the pixels at whatever priority it
was given.

## Warm only the connections you will use

A connection hint to another origin saves a name lookup, a connection and a
secure handshake — often hundreds of milliseconds on a mobile network — when the
page will certainly request from that origin early. It costs a socket and
handshake work when it will not. Hint only origins used on this page in the
first seconds; hint a font origin with the anonymous cross-origin mode or the
warmed connection goes unused; and treat a long list of warmed origins as a
sign that the page depends on too many origins, not as an optimization.

## Decision rules

- Identify the largest first-viewport element per route and device class before
  touching any hint, because a raised decoration steals from the real element.
- Raise exactly that element's resource; demote first-viewport competitors
  explicitly.
- When an element has variants, raise only the variant the server-rendered state
  paints, and flag the case where a pre-paint choice can override it.
- Never put a high hint on a component rendered on every route unless it is the
  largest element on every route.
- Warm connections only to origins the page requests within its first seconds.

## When not to use this

- **Pages where the network is not contended.** On a fast connection with few
  resources, hints change little; measure before assuming a win.
- **Resources discovered late.** Raising priority on a resource the browser has
  not yet seen does nothing; fix discovery first.

## How to test for the property

- On each key route, assert at most one high-priority image, and that it is the
  element the field reports as largest for the dominant device class.
- In a throttled cold waterfall, the largest element's resource finishes before
  any below-the-fold image starts.
- Remove every connection hint and compare: any hint whose removal changes
  nothing is a candidate for deletion.
