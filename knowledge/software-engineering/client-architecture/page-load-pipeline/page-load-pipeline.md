---
layer: golden-path
type: golden-path
subject: page-load-pipeline
status: forged
use_when: [a document's first render is slow and nobody can say which resource it waited on, deciding what a route may ship in its first load and what must wait, adding a font, a third-party tag, a hero image or a heavy client-only section to a public page, choosing which load metrics to gate before merge and which only real visits can judge]
techniques:
  - discoverable-critical-resources
  - render-blocking-budget
  - priority-is-declared-not-hoped
  - font-loading-discipline
  - script-cost-is-main-thread-time
  - layout-stability-by-reservation
  - field-measured-load-budget
  - navigation-reuse
---

# Page load pipeline

A page load is not one event. It is a pipeline the browser runs on every
document navigation, and every stage of it has a rule the page either works
with or works against. The browser receives markup and parses it; a look-ahead
scanner reads ahead of the parser for anything it can start fetching early;
stylesheets hold back the first render until they arrive; classic scripts hold
back the parser; fonts decide whether text is invisible, borrowed or final; the
first render happens; script then downloads, compiles, executes and attaches
behaviour to what is already painted; late content arrives and has to find
room. The reader experiences three things out of all of that: when the main
content appeared, whether the page moved under them, and whether it answered
when they touched it.

The naive reading treats load time as a property of the server and the network,
and optimizes the bytes on the wire. Most slow pages are not slow for that
reason. They are slow because the resource the first render needed was found
late, waited behind resources it did not need, arrived at the wrong priority,
or was followed by so much main-thread work that the painted page could not
respond. Those are decisions the page made, usually without anyone deciding.
This subject makes them explicit.

## What this subject owns, and what it does not

It owns what the browser fetches, blocks on, prioritizes and paints for a
document, from the navigation request until the page is stable and responsive,
and the reuse of that work on the next navigation. That includes the document's
subresources — styles, scripts, fonts, images — their discoverability, their
blocking behaviour, their priority, their caching as static assets, and the
main-thread cost of the script the page ships.

The seams are close and each is stated here once.
[render-mount-pipeline](../render-mount-pipeline/render-mount-pipeline.md) owns
code that decides which elements exist; a virtualized list's mount cost is
theirs, and the script that ships the virtualizer is this subject's.
[client-fetch-cache](../client-fetch-cache/client-fetch-cache.md) owns
application data after the application runs — keys, freshness, dedup, and its
[prefetch-and-defer](../client-fetch-cache/techniques/prefetch-and-defer.md) for
data. HTTP caching of static assets and the navigation request itself are here;
the query cache is not. The shell's
[lazy-section-loading](../../ui-surfaces/shell-and-navigation/app-shell/techniques/lazy-section-loading.md)
owns how a section's code is split and what occupies the viewport while it
arrives;
[lazy-section-addressability](../../ui-surfaces/published-surfaces/lazy-section-addressability/lazy-section-addressability.md)
owns what a name resolves to before that section has mounted. This subject owns
the load economics that motivated the deferral in the first place and the rule
that deferral must never touch what the first render needs. The motion
system's
[performance-discipline](../../ui-surfaces/feedback-and-style/motion/techniques/performance-discipline.md)
owns the frame budget of an animation that is running; load-time main-thread
cost and responsiveness to input are here.
[adaptive-fidelity-tiers](../../ui-surfaces/feedback-and-style/adaptive-fidelity-tiers/adaptive-fidelity-tiers.md)
owns choosing a quality tier for a device; this subject cites it for "ship less
to weak devices" and does not restate the tier model.
[build-economics](../../engineering-process/build-and-release/build-economics/build-economics.md)
owns what the build costs the developer; what the build's output costs the
reader is here. And
[metric-gates](../../engineering-process/standards-and-gates/metric-gates/metric-gates.md)
owns how any number becomes a gate; this subject owns only which load numbers
are worth gating and where each can be measured honestly.

The rule a reader uses to pick: if the question is *what does the browser do
with this document and its subresources before the reader can use it*, it is
here. If it is *which elements should exist*, *what data should be fetched*, or
*what does a section name resolve to*, it is next door.

## Discovery is decided by the markup

The browser starts fetching a resource when it learns the resource exists, and
it learns early only from served markup: the look-ahead scanner reads markup
and nothing else. A resource created by script, referenced only from a
stylesheet, named in an attribute the scanner does not read, or rendered by a
client-side shell is discovered late by construction, however small it is.
Late discovery is invisible in a waterfall that nobody reads and obvious in one
that somebody does: the largest element's request starts after a stylesheet
and a script have finished, with the network idle before it. The rule, the
blind spots, and the cost of fixing discovery by declaring everything are
[discoverable-critical-resources](./techniques/discoverable-critical-resources.md).

## Blocking is a budget, not a default

Stylesheets block the first render because a page painted without them is
unusable, and classic scripts block the parser because they may write to the
document. Both behaviours are correct and both are expensive. Every resource
that blocks the critical path should be there for a reason someone could say
out loud; everything else is deferred, loaded asynchronously, or scoped by a
media condition so it stops blocking. The distinction a team most often gets
wrong is that asynchronous and deferred scripts differ in *ordering*, not only
in blocking: deferred scripts run in document order after parsing, while an
asynchronous script runs whenever it lands, which is fine for an independent
tag and a race for anything with a dependency. See
[render-blocking-budget](./techniques/render-blocking-budget.md).

## Priority is a guess the page can correct

Once discovered, resources compete for one connection's bandwidth in an order
the browser infers from type and position: early stylesheets very high, images
low until layout shows them in the viewport, asynchronous scripts low. The
inference is good on average and wrong for exactly the resource each page cares
about most — typically the largest image above the fold, which starts low and
is promoted late. Priority hints correct the guess in both directions, and
connection warm-up removes a round trip to an origin the page will certainly
use. Declaring priority is distinct from declaring discovery; each fixes a
different delay and neither substitutes for the other. See
[priority-is-declared-not-hoped](./techniques/priority-is-declared-not-hoped.md).

## Fonts choose their own failure

A web font cannot be both instant and final. Until it arrives, text is either
invisible, drawn in a fallback that will be replaced, or drawn in a fallback
that stays — and each replacement is a potential layout shift. The page picks
the failure it prefers, then shrinks the window in which it can happen: fewer
families and weights, subsets that match the content, the font's declarations
served from the document's own origin or with the connection warmed, and a
fallback whose metrics are adjusted to match. See
[font-loading-discipline](./techniques/font-loading-discipline.md).

## Script is paid for on the main thread

The byte count of shipped script is the least of its cost. Script is
downloaded, then parsed and compiled, then executed, and on a server-rendered
page it then re-attaches behaviour to markup that is already painted. All but
the download happen on the main thread the reader's input needs. A page can
look finished and still be unable to respond, because the painted markup is
waiting for a task that will not yield. The cost is judged on a weak device,
split by route and by interaction, and broken into tasks that yield. See
[script-cost-is-main-thread-time](./techniques/script-cost-is-main-thread-time.md).

## What arrives late arrives into reserved space

Every resource that lands after the first render is a candidate to move what
the reader is already looking at: an image without dimensions, an embed without
a slot, a banner inserted above the content, a font swap with different
metrics, a lazily mounted section that is taller than its placeholder. The
rule is reservation — the space is claimed before the content exists — and it
is cheaper than any repair. See
[layout-stability-by-reservation](./techniques/layout-stability-by-reservation.md).

## The field is the verdict; the lab is the instrument

The three load metrics that describe the reader's experience — when the largest
content painted, how quickly the page responded to interactions, and how much
the layout moved — are judged at the 75th percentile of real visits, segmented
by device class. A lab run on a developer machine is a diagnosis and a pre-merge
proxy, never the verdict: it has one device, one network, one cache state and
usually no interactions at all. What to gate before merge, what only the field
can answer, and who owns the budget are
[field-measured-load-budget](./techniques/field-measured-load-budget.md).

## The cheapest load is the one not repeated

A large share of navigations go back or forward to a page the reader has just
seen. The browser can restore such a page whole from memory, with its script
state intact, in the time it takes to paint — unless the page made itself
ineligible, which it usually did by accident: an unload handler, a blanket
no-store header on a document that holds nothing sensitive, a connection left
open. A page can also be prepared before the reader commits to it. Keeping the
page eligible, and when speculative preparation pays, are
[navigation-reuse](./techniques/navigation-reuse.md).

## A packaged shell has the same pipeline and different forces

An application that runs its interface in an embedded web view and loads its
assets from local disk still runs this pipeline, but the network half of it
nearly vanishes. Discovery and connection warm-up stop mattering when a fetch
is a disk read; font hosting stops mattering when fonts are packaged. What
remains is everything on the main thread — render-blocking stylesheets and
scripts in the entry document, the cost of parsing and executing the shipped
script, the first render's long tasks — and it matters more, not less, because
the reader is watching a window that claims to be ready. For a packaged shell,
read this subject for the blocking and script-cost techniques; measuring its
boot is [startup-phasing](../../operations/service-operations/perf-instrumentation/techniques/startup-phasing.md),
because the field metrics here are defined for document navigations and a shell
launch is not one.

## Failure modes of the naive reading

- **Optimizing bytes while discovery is broken.** The hero image is compressed
  twice and still requested after the script that renders it.
- **Preloading everything.** Every declaration competes with every other; when
  everything is prioritized nothing is, and the resource that mattered now
  waits behind a font the first screen never draws.
- **Lazy-loading the largest element.** A blanket lazy policy delays exactly the
  image the load metric measures.
- **Priority on decoration.** A decorative backdrop marked high priority steals
  bandwidth from the text that is the largest element.
- **Measuring bytes and calling it speed.** A route under its byte ceiling still
  blocks input for a second while a large tree re-attaches behaviour.
- **Judging from the lab.** A fast developer machine on a warm cache produces a
  score that describes nobody who visits.
- **Deferral that shifts the page.** A section loaded later into a placeholder of
  the wrong height moves everything below it, and a reader who arrived by deep
  link watches the page slide away.

## The techniques

- [discoverable-critical-resources](./techniques/discoverable-critical-resources.md)
  — the look-ahead scanner reads markup only; the blind spots; moving a reference
  into markup before declaring a preload; the cost of over-declaring.
- [render-blocking-budget](./techniques/render-blocking-budget.md) — every
  blocking stylesheet and parser-blocking script as a named budget line;
  deferred versus asynchronous ordering; third-party tags; critical styles.
- [priority-is-declared-not-hoped](./techniques/priority-is-declared-not-hoped.md)
  — find the largest element first, then raise it, demote the competitors, warm
  only connections the page will use.
- [font-loading-discipline](./techniques/font-loading-discipline.md) — the
  display strategy as a chosen failure, family and weight as a budget, subsets,
  origin, and metric-matched fallbacks.
- [script-cost-is-main-thread-time](./techniques/script-cost-is-main-thread-time.md)
  — cost measured as main-thread time on a weak device; splitting by route and
  by interaction; server-rendered parts that ship no script; yielding.
- [layout-stability-by-reservation](./techniques/layout-stability-by-reservation.md)
  — intrinsic dimensions, reserved slots, placeholders that match the loaded
  geometry, no insertion above the reader.
- [field-measured-load-budget](./techniques/field-measured-load-budget.md) — the
  three field metrics at the 75th percentile, what a pre-merge gate can hold,
  and the named owner.
- [navigation-reuse](./techniques/navigation-reuse.md) — back/forward
  restoration eligibility, connections reaped on hide, and when speculative
  preparation of the next document pays.
