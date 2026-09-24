---
layer: technique
type: technique
subject: page-load-pipeline
technique: discoverable-critical-resources
status: forged
laws: []
shared_with: []
use_when: [the largest element's request starts late in the waterfall with the network idle before it, a first-render resource is referenced from a stylesheet or created by script, deciding whether to add a preload declaration]
---

# Discoverable critical resources

A browser can only fetch what it knows about. While the parser is held up by a
stylesheet or a synchronous script, a second, speculative parser — the
look-ahead scanner — reads the raw markup ahead of it and starts fetching every
resource it can name. That scanner is the reason a well-formed page downloads
its hero image in parallel with its stylesheet instead of after it. It is also
the whole of the page's early discovery: **the scanner reads served markup, and
nothing else.** It does not run script, does not evaluate stylesheets, and does
not read attributes that script will later turn into real ones.

The rule follows directly. A resource the first render needs must be nameable
from the served markup, in an attribute the scanner reads. Everything else is
discovered late by construction, and no amount of compression shortens the
time the request spent not having started.

## The blind spots

These recur on every stack, and each has a fixed cost shape:

- **Script-inserted elements.** An element created by script exists only after
  that script has downloaded and run. A tag loader that injects a script
  element, a component that renders an image only on the client, a carousel
  that builds its first slide at runtime — each delays discovery by the whole
  script chain that creates it.
- **Stylesheet-only references.** A background image, a font file, or an
  imported stylesheet named only inside a stylesheet is found when that
  stylesheet has been fetched and parsed, and for images only when layout shows
  the element needs it. A hero drawn as a background image is two round trips
  behind the same image drawn as an element.
- **Deferred-source attributes.** The lazy-loading idiom that parks the real
  address in a custom data attribute and lets script copy it into the real one
  hides the address from the scanner entirely. Applied to an image above the
  fold, it delays the load metric by the full cost of the loading script.
- **The lazily loaded element above the fold.** Native lazy loading is
  discovered but deliberately deferred until layout confirms the element is
  near the viewport. On an element that is always in the first viewport, that
  deferral buys nothing and costs a layout's worth of delay.
- **The client-rendered shell.** When the markup of the first screen is produced
  by script in the browser, every resource in it is invisible to the scanner;
  the whole first screen is one blind spot.
- **Resources behind excessive inlining.** Very large inline blocks early in the
  document delay the scanner reaching the references after them. Inline what
  is small and critical, never what is large and cacheable.

## The procedure

1. **Name the first render's needs.** For each key route: the largest element in
   the first viewport, the stylesheets it paints with, the fonts its text uses,
   and any script without which the first screen is wrong.
2. **Check each against the served markup** — the response body, not the
   inspected live document, which already contains everything script added.
3. **Move the reference into markup first.** Render the image as an element
   with its real address on the server; render the first screen's markup on the
   server; drop lazy loading from anything always in the first viewport; load a
   tag through a markup element with the asynchronous attribute instead of an
   injection snippet.
4. **Declare a preload only where the reference cannot move** — a font named in
   a stylesheet, a background image that must stay one, a module the entry
   imports several levels down. A preload is a promise that the resource will be
   used on this page soon; a preload that is not used is wasted bandwidth and
   usually a console warning.

## The cost of declaring too much

Discovery declarations compete. A preload is fetched at a high priority
alongside everything else of that priority, so each one added dilutes the rest.
"Preload everything important" converges on preloading everything, and when
everything is prioritized nothing is. Preloads also have sharp edges: a font
preload without the anonymous cross-origin mode is fetched twice; a preload
bypasses the negotiation a stylesheet would have done over which subset or
format to use; a preload for a resource used only on some viewports is paid on
all of them. Priority within the discovered set is
[priority-is-declared-not-hoped](./priority-is-declared-not-hoped.md), and
discovery is not a way to express it.

## Decision rules

- When a first-render resource is not in the served markup, move it there
  before anything else, because markup discovery is free and every other fix
  has a cost.
- When the reference cannot move, declare a preload for it and for nothing it
  does not need, because each declaration dilutes the others.
- Never lazy-load, by attribute or by script, an element that is in the first
  viewport on the device class that dominates traffic.
- Judge discovery from the response body and a waterfall, never from the live
  document, because the live document contains what script added.
- Keep every preload paired with a use on the same page, and treat a
  preload-unused warning as a defect.

## When not to use this

- **Below-the-fold and interaction-gated resources.** Late discovery is the
  goal for them; this technique applies to what the first render needs.
- **A packaged shell reading from local disk.** Discovery latency is a disk read;
  the blocking and script-cost rules still apply, this one mostly does not.
- **Responses already served from the page's own cache on every visit.** Repeat
  visits are dominated by blocking and script cost; fix discovery for the cold
  visit, which is the one the field sees most on public pages.

## How to test for the property

- Fetch each key route's response body and assert that the largest element's
  resource address appears in a scanner-readable attribute.
- In a throttled waterfall of a cold load, the largest element's request starts
  before the first stylesheet has finished.
- Count preload declarations per route and assert each maps to a resource used
  on that route.
