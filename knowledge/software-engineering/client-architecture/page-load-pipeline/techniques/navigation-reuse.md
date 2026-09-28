---
layer: technique
type: technique
subject: page-load-pipeline
technique: navigation-reuse
status: forged
laws: [creation-names-reaper]
shared_with: []
use_when: [going back to a page reloads it from scratch, adding an unload handler, a cache header or a long-lived connection to a document, deciding whether to prepare the next page before the reader commits]
---

# Navigation reuse

The fastest page load is the one the browser does not perform. A large share of
navigations — roughly one in ten on desktop and one in five on mobile — go back
or forward to a page the reader has just seen. A browser can keep such a page
whole in memory when the reader leaves, with its script heap paused, and restore
it on return in the time it takes to paint: no request, no parse, no re-attached
behaviour, the scroll position and every half-filled input intact. It can also
prepare a page the reader is about to open, so the navigation starts already
done.

Both are available to a page that does not opt out, and most pages that miss
them opted out by accident.

## Stay eligible for back/forward restoration

A page is excluded from restoration by things that were added for other reasons:

- **An unload handler.** Registering one makes the page ineligible on major
  engines. The work people put there — flushing a pending write, sending a final
  beacon — belongs in the page-hide event, which fires on every exit including
  one into the restoration cache.
- **A blanket no-store header on the document.** It forbids keeping the page, as
  intended for a page showing sensitive data and needlessly for everything else.
  Set it per document that holds something sensitive, not framework-wide, and do
  not confuse the document's header with an interface response's.
- **Open connections.** A live socket, an in-flight request, an open database
  transaction or a peer connection can make the page ineligible or be torn down
  unpredictably. Each connection the page opens names its reaper: closed on
  page-hide, reopened on page-show
  ([creation-names-reaper](../../../_laws.md#creation-names-reaper)).
- **A live opener reference.** A page opened by another window that keeps a
  handle to it cannot be safely paused; open cross-context links without one
  unless the handle is needed.

## Restoration is a lifecycle, not a reload

A restored page resumes; nothing that runs on load runs again. So the page must
treat restoration as its own event:

- **Listen for the page-show event and check whether the page was restored.**
  Data that may have changed while the page slept is revalidated then — through
  the page's own cache, which owns freshness; this technique only supplies the
  trigger.
- **Analytics count the view.** A restored page is a page view the load-time
  beacon will not send.
- **Session-sensitive pages re-check the session.** A page restored after the
  reader signed out in another tab must not show their data.

## Prepare the next document when intent is strong

A page can declare that the browser should fetch, or fully prepare, a likely
next document — on hover, on a rule, or when a link enters the viewport. Full
preparation makes the navigation near-instant and costs the reader bandwidth,
memory and battery for every page prepared and not visited, and it runs the
prepared page's script, which must not count a view or perform side effects
before it is shown. The rule is proportionality: prepare on strong intent
(pointer resting on a link, a primary next step), fetch-only on weaker intent,
nothing on bulk rules over every link. A same-document router that prefetches
route code and data is a different mechanism with the same trade, owned by the
shell's lazy-section loading and the fetch cache.

## Decision rules

- Never register an unload handler; do exit work on page-hide.
- Put no-store only on documents that carry sensitive data.
- Close every long-lived connection on page-hide and reopen on page-show.
- Handle restoration explicitly: revalidate, count the view, re-check the
  session.
- Fully prepare a next document only on strong intent, and make prepared pages
  side-effect free until shown.

## When not to use this

- **Documents that must never be restored** — a payment confirmation, a page
  showing secrets — opt out deliberately with no-store and say so.
- **Single-document applications whose navigations never leave the document.**
  Restoration applies only when the reader leaves and returns to the document
  itself, such as returning from an external site; within the document, warm
  return is the shell's concern.

## How to test for the property

- Navigate away and back on each key route and assert the page-show event reports
  a restoration; where it does not, the browser's not-restored reasons name the
  blocker.
- Grep the shipped script for unload handler registration: none.
- Hold a connection open, navigate away and back, and assert it was closed on
  hide and reopened on show.
