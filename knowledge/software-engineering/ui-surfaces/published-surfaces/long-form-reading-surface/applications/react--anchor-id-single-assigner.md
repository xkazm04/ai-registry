---
layer: application
type: application
subject: long-form-reading-surface
technique: anchor-id-single-assigner
stack: react
status: forged
verified_on: 2026-08-22
verified_against: react@19
---

# One heading-id assigner, shared by the TOC and the renderer

The guide in `personas-web` renders long markdown topics with an "on this page"
panel, per-heading copy-link anchors, and deep links from search. Two separate
walks of the same markdown produce heading ids: `extractHeadings` for the panel
and `parseBlocks` for the rendered body. They now share one stateful assigner.

## The assigner

`src/components/guide/guide-markdown/headingId.ts:17` is the whole authority —
a closure over the two pieces of state that cannot be shared by sharing a pure
function:

```ts
export function createHeadingIdAssigner(): (rawText: string) => string {
  const usedSlugs = new Map<string, number>();
  let fallback = 0;
  return function assignHeadingId(rawText: string): string {
    const baseSlug = slugifyHeading(rawText) || `section-${fallback++}`;
    const count = usedSlugs.get(baseSlug) ?? 0;
    usedSlugs.set(baseSlug, count + 1);
    return count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
  };
}
```

The docblock above it (`headingId.ts:3`) names the exact past divergence, and it
is the reason the file exists: the two sides "used to reimplement slugify +
dedup + fallback independently, and their fallbacks disagreed (a heading-local
counter vs the global emitted-element counter) so any unslugifiable heading
(emoji-only, CJK, punctuation-only) got different ids on each side." That is the
technique's central claim — the two consumers count different populations —
observed in production rather than reasoned about.

Both consumers construct one instance per document and call it in document
order: `extractHeadings.ts:13` and `parseBlocks.tsx:28`. Nothing else in the
tree computes an id.

`slugify.ts:1` is the deterministic half: strip inline markup, `NFKD`-normalize,
drop combining marks, lowercase, then `replace(/[^a-z0-9]+/g, "-")`. That last
rule is why the fallback path is not exotic — any heading with no Latin
alphanumerics at all (`## 日本語`, `## 🚀`) slugifies to the empty string and
falls through to `section-N`.

## The test that renders both consumers

`src/components/guide/guide-markdown/headingId.test.ts:17` is the pin. It builds
one markdown fixture containing a duplicate heading, an emoji-only heading, a
CJK heading, a heading inside a fenced code block, and a heading inside a custom
`:::note` block, then compares the two id lists:

```ts
const tocIds = extractHeadings(md).map((h) => h.id);
const domIds = renderedHeadingIds(md);
expect(domIds).toEqual(tocIds);
```

`renderedHeadingIds` (`:10`) is the part that makes this a real observation
rather than a unit test of the slugifier: it calls `parseBlocks` and reads the
`id` prop off the returned elements, so the assertion is over what the renderer
actually emits.

Lines `:48`–`:50` assert the instrument, and they matter more than they look:

```ts
expect(tocIds).toContain("setup");
expect(tocIds).toContain("setup-2");
expect(tocIds.filter((id) => id.startsWith("section-")).length).toBe(2);
```

Without these, a parser change that stopped emitting the pathological headings
entirely would leave two equal lists and a green test.

## Inclusion is a filter applied downstream

`extractHeadings.ts:41` states the exclusion rule and its single exception:
headings inside `:::`-delimited custom blocks produce no outline entries, except
inside `:::tabs`, where tab-label headings are attached to the parent heading as
`tabLabels` (`:45`–`:48`). `TopicTOC.tsx:44` renders those as `aria-hidden`
italic chips under the parent entry — a visual scent, deliberately not a link,
because the tab panel is not an address.

Depth filtering is likewise downstream and not in the extractor: `TopicTOC.tsx:14`
keeps `depth === 2 || depth === 3`. Ids are still assigned at every depth, so a
deep link into a level-4 heading resolves even though the panel does not list
it.

**Deviation.** That same filter is duplicated verbatim in `MobileTopicTOC.tsx:28`.
The two agree today; nothing makes them agree tomorrow, and they are two panels
over one document — the same shape of duplication the assigner was created to
eliminate, one layer up. The filter belongs beside the extractor's output as a
named selector both panels call.

**Deviation.** The fallback `section-N` is positional, so inserting a section
above an unslugifiable heading silently re-addresses every unslugifiable heading
below it. The corpus has few such headings and no author-declared id syntax to
fall back on; the standard's guidance — treat an unslugifiable heading as a
documentation smell and give externally-linked headings an explicit id — is not
yet enforced anywhere.
