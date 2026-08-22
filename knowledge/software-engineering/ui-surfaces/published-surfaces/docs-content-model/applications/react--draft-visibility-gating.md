---
layer: application
type: application
subject: docs-content-model
technique: draft-visibility-gating
stack: react
status: forged
verified_on: 2026-08-22
verified_against: react@19
---

# Draft visibility gating — a Next.js guide surface, as built here

This is the most completely realized technique in the surface: one predicate,
nine call sites, every consumer the technique enumerates — including the one
that lives in another part of the product entirely.

## The predicate and its flag

`src/lib/guide-utils.ts:31-38`, two functions and no third:

```ts
export function isDevTopicsVisible(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_DEV_GUIDE_TOPICS === "true";
}
/** Whether a topic is visible — honors the devOnly flag. */
export function isTopicVisible(topic: GuideTopic): boolean {
  return !topic.devOnly || isDevTopicsVisible();
}
```

The flag is a `NEXT_PUBLIC_` variable, inlined at build time — the technique's
build-time requirement, satisfied by the bundler rather than by discipline.
The docblock above it (`:25-30`) enumerates the consumers in prose exactly
where the technique says to put the list: "the sidebar, category lists, search
results, and direct URL access." The record side declares its half in
`src/data/guide/types.ts:20-28`, including the preview marker the technique
asks for — dev-visible entries render "with a golden left border as a reminder
they won't ship."

## Every consumer, called

Nine call sites, and the interesting ones are the ones nobody remembers:

| consumer | site |
|---|---|
| navigation projection | `src/data/guide/topics-nav.ts:50` |
| guide landing page | `src/app/guide/page.tsx:28` |
| category page — list and count | `src/app/guide/[category]/page.tsx:21,38` |
| **direct address resolution** | `src/app/guide/[category]/[topic]/page.tsx:101` — `if (!isTopicVisible(topic)) notFound();` |
| **prev/next sequence** | `.../[topic]/page.tsx:110` |
| search, metadata pass | `src/lib/guide-search.ts:89` |
| search, body index pass | `src/lib/guide-search.ts:246` |
| sitemap | `src/app/sitemap.ts:39` — `GUIDE_TOPICS.filter(isTopicVisible)` |
| related-topics strip | `src/lib/guide-utils.ts:60` |

The prev/next site carries the technique's rule as a comment
(`[topic]/page.tsx:107-109`): "Prev/next must walk only topics this build
actually serves — an unfiltered neighbour would link straight into a
`notFound()` for a devOnly topic." The filter is applied to build
`categoryTopics` and the index is found *within* the filtered array
(`:110-113`) — filtered first, positioned second, which is the order the
technique insists on. `getRelatedTopics` states the same reason in its own
docblock (`guide-utils.ts:47-52`): "topics hidden from this build (devOnly) —
linking to one would render a 404."

## The consumer that lives outside the surface

`src/lib/guide-refs.test.ts` is the inbound-link gate, and it is the upward
lesson this tree taught the technique. Marketing surfaces deep-link into guide
topics by hand — `features/data.ts`, `vision-grid/data.ts` — and `guideHref`
"does zero validation — it is pure string interpolation" (`:7-15`). The test
collects every hand-authored `GuideTopicRef` with a source label and asserts
three things per ref (`:33-54`): the topic id exists, its `categoryId` matches
the category in the link, and `devOnly` is false, because "dev-only topics 404
in production because the topic page calls `notFound()`". Each assertion
carries a message naming the authoring file and the repair.

It also asserts its own instrument first (`:28-31`): *"has refs to validate
(guards against an empty collection silently passing)"* —
`expect(HAND_AUTHORED_REFS.length).toBeGreaterThan(0)`. A refactor that
renames `guideTopics` on the feature records would otherwise leave a suite of
zero passing cases.

## The second axis, kept separate

`guide-utils.ts:5-23` holds three more functions — `getTopicMode`,
`isTopicVisibleForMode`, `isCategoryVisibleForMode` — over a
`"simple" | "power" | "both"` vocabulary with a topic-level override above a
category default. They are the technique's audience axis, and the separation
holds where it matters: `isTopicVisibleForMode` takes a runtime
`modeFilter: GuideMode | null` and is called only by the landing page
(`app/guide/page.tsx:29`), never by the route handler. `[topic]/page.tsx:101`
gates on `isTopicVisible` alone. A power-mode topic keeps its address for a
reader who arrives by link; a `devOnly` topic does not.

## Deviation: one count skipped the door

`src/app/guide/layout.tsx:9-15` is the technique's rule applied and the
predicate omitted:

```ts
// Counts are derived from the guide data, not typed by hand — the description
// used to claim "10 categories" after an 11th (companion) had shipped.
const TOPIC_FLOOR = Math.floor(GUIDE_TOPICS.length / 10) * 10;
… `Browse ${TOPIC_FLOOR}+ topics across ${GUIDE_CATEGORIES.length} categories.`
```

`GUIDE_TOPICS.length` is the unfiltered population — the one enumeration in the
surface that does not pass through `isTopicVisible`. Today the tree carries a
single `devOnly` topic and the floor-to-ten hedge absorbs the difference (116
raw, 115 visible, both flooring to `110+`), which is the hedge doing exactly
the work the technique credits it with — and also the reason the omission has
never been visible. Ten more drafts and the page description advertises a
population no reader can find.

The category number has the same shape without the hedge:
`GUIDE_CATEGORIES.length` counts categories whether or not any visible topic
remains in them.
