---
layer: technique
type: technique
subject: positioning-and-pricing-transparency
technique: lead-claim-currency
status: forged
laws: [a-gate-before-money-and-copy, never-invent-proof]
shared_with: []
use_when: [reviewing landing variants after the product's lead claim moved, deciding whether to iterate or retire a page, briefing a new landing direction]
---

# Lead-claim currency

A landing page is a claim about what the product does first for a stranger.
When that changes - when the product learns that the stranger who has never
bought a click wants the free path before the paid one - every page built
around the old lead claim becomes a period piece: not slightly wrong, but a
picture of a product that no longer exists in that shape. The technique is a
single test applied to every public page, and a disposition for the pages
that fail it.

## The test

**Can this page state the current lead claim on its first screen?** Not "could
it be edited to"; does it, now, in its own words. A page that cannot is not a
candidate for iteration. The reason is that a lead claim is not a headline
swap: the section order, the proof band, the walkthrough and the call to
action were all composed as an argument for the old claim, and a new headline
on the old argument is a page that contradicts itself by the second screen.

Two further checks ride on the same pass:

- **Reachability.** A page absent from navigation, sitemap, footer and
  quick-nav has no audience and no measurement. It cannot become current by
  accident and it cannot teach anything about conversion, because nothing
  renders it. It is retired with the period pieces.
- **Provenance of the brief.** A variant built from a library of other
  people's patterns, without the owner's own references and inputs, is a
  period piece on arrival: it tells a story nobody asked for in those terms.
  The lesson learned the expensive way is that a pattern library is a
  reading, not a brief; the owner's specifics come before any build.

## Procedure

1. **Write down the current lead claim** in one sentence, dated. It is the
   thing the product does first for a visitor who arrives with nothing.
2. **List every public page and variant**, including experiment arms and
   research variants behind non-indexed routes.
3. **Apply the test to each.** Record: states the claim / could be re-argued /
   cannot state it. Record reachability beside it.
4. **Propose retirement** for "cannot state it" and for unreachable pages, as
   a recommendation awaiting the owner's yes
   ([a gate before money and copy](../../../_laws.md#a-gate-before-money-and-copy)
   - a deleted route loses its links and rankings permanently, so the
   deletion is proposed, not performed).
5. **Keep the reading, discard the pages.** The pattern document or the design
   notes that came out of a retired variant survive as record; the components
   do not, because three unreachable monoliths kept "for harvesting" are how
   a component-debt table stops being a plan.
6. **Re-run the test whenever the lead claim moves**, on the day it moves,
   not when someone notices a stale page.

## Decision rules

- When the lead claim moves, retire before iterating, because a re-headlined
  page argues for the old claim from its second screen down.
- When a page is unreachable, retire it regardless of quality, because a page
  nobody can reach has no conversion data and cannot earn a place.
- When a variant was built without the owner's references, do not build
  another from the same library, because the library was the problem, not
  the variant.
- When a proof line on a page describes the old lead claim's evidence, it is a
  stale proof and comes down with the claim
  ([never invent proof](../../../_laws.md#never-invent-proof) - a proof for
  a claim no longer made is an invented one).

## What survives retirement

A record: the route, the component, its size, what it explored, and the
reason it was retired in the owner's words. That record is what stops the
next session rebuilding the same variant from the same instinct. It is
short, dated, and lives beside the roadmap rather than in a commit message.

## When NOT to use

- A page whose job is historical by design - a changelog, a launch post, an
  archived case study - is meant to be a period piece and is not retired for
  being one.
- A product whose lead claim has not moved; the test passes trivially and the
  pass is not worth a review cycle.
- Experiment arms inside a running, measured test; they are retired by the
  experiment's own rules, in `landing-page-experiment-statistics`, not by
  this one.
