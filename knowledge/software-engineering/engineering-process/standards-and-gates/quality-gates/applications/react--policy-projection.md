---
layer: application
type: application
subject: quality-gates
technique: policy-projection
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
---

# Display caps as a house habit, not a postmortem

*Verified against the project tree at `2b5e24223`.*

The sibling `node` document for this technique carries the display-cap rule
the way the corpus usually gets it: as an incident. A card's list was
consumed as the population, an enforcement artifact came out two-fifths of
the size it claimed, and the naming discipline was retrofitted onto the
wreckage. This tree is the other kind of evidence — the same rule showing up
four times, in four unrelated features, written by different hands, in a
shape close enough that it reads as a convention rather than a fix.
A rule that only ever appears next to the bug it caused has not been
adopted. This one has.

## Named at the definition, and again at the boundary

`src/hooks/design/template/useDesignReviews.ts:18-27` defines the cap and
spends nine lines saying what kind of cap it is:

> This is a DELIBERATE cap, stated here rather than inherited by accident:
> `listDesignReviews()` with no argument silently took the backend's
> `limit.unwrap_or(50)`, which is how `reviews.length` came to be rendered as
> a total for a catalog of 124+ seeded templates. The cap stays — nothing
> renders this array, it only feeds derived facts — but the TOTAL now comes
> from a dedicated count query (`totalCount`), never from `reviews.length`.

`REVIEW_LIST_LIMIT = 50` is then passed explicitly into the fetcher
(`:29-31`) rather than left to the backend default — the accident the comment
names was that an *implicit* cap has no definition site to name it at.

The technique's second rule, the repeat at the consumption boundary, is the
hook's return shape (`:336-350`). `totalCount` carries "NEVER use
`reviews.length` as a total: that array is capped at {@link
REVIEW_LIST_LIMIT}", and beside it sits a derived field whose entire purpose
is to make the truncation impossible to consume silently:

```ts
isTruncated: totalCount !== null && reviews.length < totalCount,
```

The naming lands a third time at the actual render site
(`src/features/templates/components/DesignReviewsPage.tsx:49-55`), where the
header count is chosen with the same warning restated inline — "It is
deliberately NOT `reviews.length` — that array is a capped page
(REVIEW_LIST_LIMIT), so using it printed '50' for a catalog of 124+
templates." Three statements of one bound, at definition, at export, and at
use. The technique argues the repeat is necessary because the consumer is
where the mistake gets made; here the consumer is where it *was* made, and
the comment is a marker left on the grave.

## The population-sensitive test exists, with the right fixture

The technique's third rule is the one almost nobody writes: build the
artifact for a population *larger* than the cap and assert the count matches.
`src/hooks/design/__tests__/useDesignReviews.test.ts:45-65` is that test,
titled "reports the TRUE total from the count query, not the length of the
capped page", and its fixture is deliberately over the bound — a 50-row page
against a count of 124:

```ts
const page = Array.from({ length: 50 }, (_, i) => makeReview({ id: `r-${i}` }));
mockInvokeMap({ list_design_reviews: page, count_design_reviews: 124 });
```

It then asserts all three things separately: `totalCount` is 124, the page is
still 50, and `totalCount` is not equal to `reviews.length` (`:56-62`). That
last assertion is the one that matters — it is the only form that fails when
someone reverts the count query and re-derives the total from the array,
because a fixture whose page happens to equal its total passes either way.
The suite's next case (`:67-75`) closes the neighbouring hole with the same
instrument: an unanswered count is `null`, never `0`, "or the header flashes
a confident wrong number on every cold load."

## The same shape, arrived at independently, twice more

**A clamp that keeps the fact it clamped.**
`src/features/home/sub_cockpit/widgets/personaStats.ts:173-177` returns a
pair rather than a number:

```ts
return { pct: Math.round(Math.min(100, asPercent)), overflow: asPercent > 100 };
```

The interface names both halves — `pct` is "Rounded, clamped percentage in
[0, 100] — ready to render as `${pct}%`", `overflow` is "True when the source
value exceeded 100% after ratio interpretation" (`:166-171`) — and the doc
comment states the purpose in the technique's own terms: the caller can show
"an explicit 'clamped' treatment + tooltip rather than a silently wrong
number" (`:159-162`). The consumer honours it:
`widgets/PersonaOverviewWidget.tsx:240-241` switches the tile's tone to
`warn` and attaches a "clamped" hint whenever `trust.overflow` is set. The
bar is bounded because a bar has a width; the *claim* it makes about the data
is not. `__tests__/personaStats.test.ts:21-22` pins the overflow branch with
values that can only come from a broken source (`8311`, `101`).

**A cap that belongs to someone else, disclosed anyway.**
`src/features/plugins/dev-tools/sub_overview/adapters.ts:23-33` is the
interesting one, because the bound is not a layout decision at all — it is a
remote API's page size, and the tree treats it identically:

> True when a value below was derived from a single `per_page=100` page that
> came back full — the true count is >= the reported number, not exact. (A
> page-length fetch can't distinguish "exactly 100" from "1000+"; callers
> should render e.g. "100+" rather than treating these as precise.)

`openPrsCapped = openPrs === 100` (`:109`), `commitsLastWeekCapped` (`:121`),
and — the part that shows the reasoning was actually followed rather than
copied — `openIssuesCapped: openPrsCapped` (`:136`), because the issue count
is derived by subtracting the possibly-capped PR count, so the uncertainty
propagates through the arithmetic (`:134-135`). The render site spends the
flag as a suffix on the number itself
(`sub_overview/ProjectOverviewPage.tsx:325-327`):

```tsx
value: repoStats ? `${repoStats.openIssues}${repoStats.openIssuesCapped ? '+' : ''}` : '—',
```

A fourth instance sits in the triage deck, where the same fact is spent on a
*verdict* rather than a number:
`src/features/agents/quick-answer/triage/__tests__/deckHonestEndings.test.tsx:197-215` asserts
that a queue whose source "came back full" refuses the cleared headline —
"nothing is waiting on you" must not be printed over a population nobody
measured — and that it offers "Check for more" instead of "Deal the next
batch", because a batch that exists only because a fixed-limit ledger was
full has no cursor to page.

## The structural fact

The technique's display-cap section is written as a *rule*, which means its
adoption is measured by whether unrelated authors reach for it unprompted.
Four features here — a template catalog, a persona tile, a repository stats
adapter, and a triage deck — carry the same three-part shape: the bound is a
named constant or a named boolean, the truncation is exported as its own
field beside the value, and the render site restates the distinction in a
comment written to the next author rather than to the reviewer. None of them
share a helper. Two of them (`isTruncated`, `overflow`) invented a field that
exists for no other reason. That is what a rule looks like after it has been
internalized: not one abstraction, but the same decision made four times.

The negative evidence is equally structural. The `null`-not-`0` treatment
appears twice independently — `MonitoringStats.unresolvedIssues` is typed
`number | null` "so a project with real unresolved errors doesn't read as
healthy" (`adapters.ts:36-43`), and `totalCount` starts `null` for the same
reason — which is the same instinct one layer over: a bound and an unknown
are both facts about the *measurement*, and both have to survive into the
projection or the surface lies confidently.

## What this realization cannot do or prove

- **No enforcement artifact is generated here, so the expensive half of the
  rule is untested.** The technique's sharpest clause is that a projection
  which is *itself* an enforcement artifact — a snippet, a config, a work
  list driven to zero — must be built from the full population. Every capped
  list in this tree feeds a header, a tile, or a headline. Nothing copies a
  truncated list into something another system will execute, so this tree
  demonstrates the naming discipline and demonstrates nothing about the
  failure mode that makes the discipline worth having.
- **Nothing gates it.** The convention is carried entirely by comments and by
  authors reading nearby code. There is no lint rule that flags
  `someCappedArray.length` rendered as a total, no type that makes a capped
  array structurally distinct from a complete one, and no test that would
  catch a fifth feature introducing the bug tomorrow. Four hand-written
  instances of a rule are evidence of a habit and evidence of the absence of
  a mechanism; the technique's own economics say the habit decays at the rate
  of the busiest deadline.
- **The disclosure is not always reachable.** `isTruncated` is exported and,
  at HEAD, is read by the test that motivated it more assertively than by any
  surface — the page header consumes `totalCount` (`DesignReviewsPage.tsx:55`)
  but does not render the truncation state. A field that exists so a surface
  *can* disclose is one surface away from being a channel with no message.
- **One projection axis is missing entirely.** This technique is about a
  policy described in many places; what is verified here is only the
  *population* half. There is no single enumeration of a condition list with
  all its projections attached anywhere in this tree — the structural remedy
  the technique's first half prescribes. That half remains demonstrated only
  by the `node` sibling.
- **The cap correctness itself is unverified.** `openPrs === 100` infers
  "there may be more" from a full page; it cannot distinguish a population of
  exactly 100 from one of 1000, and it silently becomes wrong the day the
  request's `per_page` changes without the literal `100` beside it changing
  too. The comparison and the query string are two copies of one number
  (`adapters.ts:102` and `:109`), which is the drift this bundle's
  one-authority law exists to name.
