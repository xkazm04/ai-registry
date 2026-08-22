---
layer: application
type: application
subject: lazy-section-addressability
technique: always-present-anchor-wrappers
stack: react
status: forged
verified_on: 2026-08-22
verified_against: react@19
---

# Always-present anchor wrappers — React/Next.js implementation (Personas marketing site)

How the `personas-web` tree implements
[always-present-anchor-wrappers](../techniques/always-present-anchor-wrappers.md)
across its landing and features pages, and the three places where the
implementation stops short of the technique.

## The two-namespace section registry

`src/app/page.tsx:32-51` declares a `SectionConfig` carrying both identifiers
per stage, and its comment states the rule the technique abstracts:

- `wrapperId` — optional, and the external contract. Seven of the ten stages
  have one (`tools`, `playground`, `get-started`, `pipelines`, `vision`,
  `pricing`, `download-section`); three do not, so they have no published
  address at all.
- `anchorId` — required, emitted as `data-scroll-anchor`, and the handle the
  page's own scroll map tracks.

The comment at `page.tsx:40-46` gives both halves of the reason: several of
the tracked ids "live inside `ssr: false` + gated components and are simply
not in the DOM on first paint", and the wrapper ids are "external anchor
targets (`#tools`, `#download-section`) that must not change". The
`tools`/`use-cases` pair is the clearest specimen of the technique's
history-owns-the-external-name rule: the published address still says
*tools*, while the section and everything internal moved to *use-cases*.

## The render shape

`page.tsx:104-125` maps the registry into the shape the technique prescribes —
the page renders the wrapper, the section is its child, and the wrapper is
outside every conditional:

```tsx
<div id={wrapperId} data-scroll-anchor={anchorId}>
  <StageSection …>
    {gate ? <LazyMount minHeight={640}><Component /></LazyMount> : <Component />}
  </StageSection>
</div>
```

`gate` is set on exactly the `ssr: false` sections
(`src/components/sections/lazy.tsx`), which is coherent: a section that
contributes nothing to the server render loses nothing by also deferring its
client mount.

`src/components/LazyMount.tsx` is the reserved-geometry half. Its header
comment names three of the technique's rules explicitly — it is "SSR-safe:
renders the same placeholder on the server and the first client render (no
hydration mismatch)", the reserved `minHeight` "prevents layout shift and
keeps scroll-map anchors meaningful", and it is mount-once (`io.disconnect()`
at `LazyMount.tsx:48`, and the effect short-circuits on `shown`). The
`rootMargin` default of `800px 0px` is the approach lead: mounting starts
roughly a viewport early so a section is usually ready by the time a jump
arrives.

`src/app/features/page.tsx:38-41` applies the same idea one level up, hosting
the anchor on `StageSection` (always rendered) with `LazyMount` inside it, and
keeping the first section eager "for LCP + SEO".

## Consumers resolving wrapper-first

`src/components/ScrollMap.tsx:19-35` is the resolution order, with the
incident that produced it recorded in place — on first paint `getElementById`
"returned null and the click was a silent no-op":

```ts
const el =
  document.getElementById(id) ??
  document.querySelector(`[data-scroll-anchor="${CSS.escape(id)}"]`);
```

Precise target when mounted, wrapper when not. `CSS.escape` is the
validation-at-the-door detail that keeps a malformed id from throwing inside
the selector.

`src/components/sections/HeroClient.tsx:139-143` is the same move from the
call-to-action side, and its comment is the technique in one sentence: the
fallback targets `#download-section` "not the inner `id="download"` which
lives inside a lazy, gated section that isn't in the DOM on first paint.
Scrolling to the wrapper brings it into view and mounts the section."

The tracking direction resolves the other way, and correctly:
`src/contexts/SectionObserverContext.tsx:129` observes
`document.getElementById(id)` — the real section, never the wrapper — because
reserved space is not what "the reader is in this section" means.

## Where the repo stops short

**The landing offset is on the inner stage, not on the wrapper.**
`scroll-mt-24` sits on `StageSection` (`src/components/StageSection.tsx:32`)
and on `<main>` (`src/components/PageShell.tsx:31`), but the anchor-carrying
`<div id={wrapperId}>` at `page.tsx:120` has none. A link that resolves to the
wrapper therefore lands flush at the viewport top under the fixed navbar,
while one resolving to the mounted section lands correctly — the subtle
split-behaviour the technique warns about. One class on the wrapper closes it.

**No cold deep-link handler exists.** A tree-wide search for `location.hash`
finds only unrelated uses (`src/app/legal/LegalContent.tsx:40`,
`src/components/flow-composer/use-flow-composer.ts:25`); nothing re-resolves a
fragment after lazy sections mount. External links survive only because the
externally-published namespace happens to be the wrapper ids, which the server
renders. Any link into an `anchorId` — and `#faq`, `#pricing`, `#vision` are
natural things for a person to copy out of the scroll map — is at the mercy of
the section's current render mode.

**Three addressed sections rely on their own server-rendered id.** `Vision`,
`Pricing` and `FAQ` are `ssr: true` in `lazy.tsx`, so their inner ids are in
the first-paint markup and work as external addresses today. Flipping any one
of them to `ssr: false` for an unrelated reason removes an address from the
document with no error anywhere — precisely the coupling the technique's
"every addressed location gets a wrapper regardless of how it currently
renders" rule exists to break. `vision` and `pricing` do have wrapper ids;
`faq` does not.
