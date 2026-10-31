---
subject: long-form-reading-surface
domain: software-engineering
last_touched: 2026-08-22
dry_streak: 0
---

# long-form-reading-surface

First touch: [[2026-08-22-4]] — the 2026-08-22 harvest wave. Class: NEW.

## State

5 techniques, 2 react applications. Golden path 239 lines.

## Open leads (banked, with return conditions)

- **the shared authority must carry the stateful half** (proposed law, not added). Extracting the pure function and leaving the counters duplicated is the near-miss refactor; seen in the id assigner and the offset module. Two sightings, both in one subject. Return on a third from another subject.

## Declines

- Did not link the sibling `public-claim-provenance` even after spotting a broken relative link in it — a sibling's file is not this worker's to edit. The sibling fixed it itself. The rule held.

## Architecture review - 2026-10-31

First architecture review. The State line above says 2 react applications; there
are 3 (a focus-transfer remount-guard application was added 2026-10-14). The
techniques' platform claims were checked against primary sources: sticky
positioning, scroll padding and scroll margin, tabindex, and one router's route
announcer. Two techniques owe small clarifications. The consumer tree behind all
three applications is private and was not reopened, so they stay `reverify`, and
no verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/long-form-reading-surface",
  "date": "2026-10-31",
  "baseline": "3784043b8",
  "digest": "sha256-b2:ee082e781491937e",
  "disposition": "clarify",
  "coverage": "All 9 documents read in full: golden path, 5 techniques, 3 react applications. Four primary sources opened (MDN position, MDN scroll-padding, CSS Scroll Snap 1 editor's draft, MDN tabindex) plus the Next.js accessibility page. Not evaluated: the private consumer tree and its tests, any runtime behaviour, and the reading-time rate (the text names no number).",
  "counterexamples": [
    "An ancestor with overflow:hidden or overflow:auto and no constrained height never scrolls, yet it still captures position:sticky descendants. MDN: a sticky element 'sticks' to its nearest ancestor that has a 'scrolling mechanism' ... even if that ancestor isn't the nearest actually scrolling ancestor. 'Introduce a scroll container' reads as 'make something scroll', which undersells the trap.",
    "A single scroll-padding-top on the root scroll container keeps fragment jumps clear of a fixed header without any per-heading margin, so 'the correction is a per-heading scroll margin' is not the only shape that covers every entry point.",
    "A router that announces the page title on client-side transitions (Next.js does) means a screen-reader user is not 'told nothing at all'. Focus is still left on the activated link, so the technique's rule stands.",
    "With the last-landed identity held at module scope, a reader who leaves the article surface for another route and comes back by client-side navigation to the same article arrives with an unchanged identity, so the guard does not hand off focus even though this was a real in-place navigation."
  ],
  "sources": [
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/position",
      "result": "Supports the scrolling-ancestor constraint and sharpens it: 'a sticky element \"sticks\" to its nearest ancestor that has a \"scrolling mechanism\" (created when overflow is hidden, scroll, auto, or overlay), even if that ancestor isn't the nearest actually scrolling ancestor.' Matches the react offset-budget application's incident, where an overflow value with no constrained height disabled sticky."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding",
      "result": "'This allows you to create insets in the scrollport to make room for objects that might obscure the content, such as fixed-positioned toolbars'; worked example 'Preventing content from being hidden by a fixed header' sets scroll-padding on the root element. A one-declaration alternative to per-heading scroll margins."
    },
    {
      "url": "https://drafts.csswg.org/css-scroll-snap-1/#scroll-padding",
      "result": "Scroll padding adjusts the optimal viewing region 'for the purpose of paging and scroll-into-view operations'. For fragment navigation and scrollIntoView the UA 'should use the element's scroll snap area' (border box plus scroll-margin), 'even when snapping is off'. Confirms that both mechanisms reach every entry point, as the technique says of the margin."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/tabindex",
      "result": "Supports 'programmatically focusable without becoming a tab stop': a negative value 'means that the element is not reachable via sequential keyboard navigation', and any valid tabindex lets the element 'be focused with JavaScript'. tabindex=0 makes it tabbable, which is the one-value-apart wrong answer."
    },
    {
      "url": "https://nextjs.org/docs/architecture/accessibility",
      "result": "'Next.js includes a route announcer by default' that announces document.title, then the h1, then the pathname on client-side transitions. Qualifies 'told nothing at all'. The page says nothing about moving focus, which is consistent with the technique's point that an announcement leaves focus in place."
    },
    {
      "source": "Arithmetic in applications/react--fixed-chrome-offset-budget.md",
      "result": "76+2=78, 78+44=122, 86+16=102 and scroll-mt-24=96px all check. CHROME_PAD_TOPIC is described as 'pt-12 lg:pt-0 = 122 - 76', but pt-12 is 48px and 122-76 is 46. Either the quoted code or the description is off by 2px; the private tree was not reopened to tell which."
    }
  ],
  "documents": {
    "long-form-reading-surface.md": {
      "disposition": "keep",
      "reason": "Three authorities and one definition is a coherent frame, and the seams with app-shell, chat-transcript and accessibility are explicit. Its one-line statement of the sticky trap is accurate at golden-path grain; the sharper form belongs in the technique."
    },
    "techniques/anchor-id-single-assigner.md": {
      "disposition": "keep",
      "reason": "The stateful-instance argument, the deterministic namespaced fallback, the 'inclusion is a filter after assignment' rule and the both-consumers test that also asserts its own instrument are sound. The positional-fragility caveat is stated, not hidden."
    },
    "techniques/fixed-chrome-offset-budget.md": {
      "disposition": "clarify",
      "reason": "(1) The scrolling-ancestor section should say that any ancestor with overflow hidden/auto/scroll captures sticky even if it never scrolls (MDN). (2) The anchored-heading clearance names only a per-heading scroll margin; a single top scroll padding on the scroll container is an equivalent that the platform honors for scroll-into-view and fragment navigation (Scroll Snap 1, MDN). Say to pick one, because stacking both double-counts the chrome."
    },
    "techniques/scroll-spy-reading-band.md": {
      "disposition": "keep",
      "reason": "Topmost-intersecting wins and the empty band leaving the answer unchanged give a stable definition. Not-yet-computed and arrived-by-anchor are spelled separately. The band top equalling the scroll clearance is held through the offset budget. The intersection-observer and stable-input cautions are correct."
    },
    "techniques/server-parsed-once-reused.md": {
      "disposition": "keep",
      "reason": "Re-parse on measured divergence, with an empty list explicitly not treated as a failure signal. It carries depth and leaves filtering downstream, and reading numbers carry their predicate. Its when-not section correctly treats client-only authoring as the single authority."
    },
    "techniques/focus-transfer-on-in-place-navigation.md": {
      "disposition": "clarify",
      "reason": "(1) 'A screen-reader reader has been told nothing at all' should allow that some routers announce the new page title on client transitions (Next.js docs), while focus still stays put. (2) Owed, not confirmed: the module-scope identity counterexample (leave the article surface, return to the same article) needs a stated reset point, such as clearing the identity when the surface is left. The remedy is a design choice not settled by any source read this run."
    },
    "applications/react--anchor-id-single-assigner.md": {
      "disposition": "reverify",
      "reason": "It matches the technique closely and records two honest deviations (the duplicated depth filter, positional fallback ids). The cited files, lines and test were not reopened; the private tree is not available here."
    },
    "applications/react--fixed-chrome-offset-budget.md": {
      "disposition": "reverify",
      "reason": "The measurement, diagram, literal-class constraint and both deviations are internally coherent, and the sticky incident agrees with MDN. The CHROME_PAD_TOPIC line reads 'pt-12 = 122 - 76' (48 against 46); which side is wrong needs the private source. Nothing was re-run."
    },
    "applications/react--focus-transfer-on-in-place-navigation--remount-guard.md": {
      "disposition": "reverify",
      "reason": "The A/B account is coherent and adds the remount lesson to the technique. The remount behaviour, the Playwright arms and the 19-of-21 floor rest on a private tree that was not reopened."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the three confirmed clarify items from the record above, against
`f74433542`: two in fixed-chrome-offset-budget and one in
focus-transfer-on-in-place-navigation. The subject's bytes did not change between
the two baselines apart from these edits. The focus technique keeps `clarify` for
the module-scope identity reset point, which is still owed. The applications keep
`reverify`, which is now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/long-form-reading-surface",
  "date": "2026-10-31",
  "baseline": "f74433542",
  "digest": "sha256-b2:9c268ad3f6d2e0e1",
  "disposition": "reverify",
  "coverage": "All 9 documents decided. The three clarify changes this run could confirm against a primary source were applied to two techniques and the edited passages re-read. The other 7 documents are byte-unchanged and keep their dispositions. Still owed: the focus-transfer reset point for the module-scope identity (no source settles it). No private tree or runtime was reopened and no verification date was refreshed.",
  "counterexamples": [
    "An ancestor with overflow:hidden or overflow:auto and no constrained height never scrolls, yet it still captures position:sticky descendants. MDN: a sticky element 'sticks' to its nearest ancestor that has a 'scrolling mechanism' ... even if that ancestor isn't the nearest actually scrolling ancestor. 'Introduce a scroll container' reads as 'make something scroll', which undersells the trap.",
    "A single scroll-padding-top on the root scroll container keeps fragment jumps clear of a fixed header without any per-heading margin, so 'the correction is a per-heading scroll margin' is not the only shape that covers every entry point.",
    "A router that announces the page title on client-side transitions (Next.js does) means a screen-reader user is not 'told nothing at all'. Focus is still left on the activated link, so the technique's rule stands.",
    "With the last-landed identity held at module scope, a reader who leaves the article surface for another route and comes back by client-side navigation to the same article arrives with an unchanged identity, so the guard does not hand off focus even though this was a real in-place navigation."
  ],
  "sources": [
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/position",
      "result": "Supports the scrolling-ancestor constraint and sharpens it: 'a sticky element \"sticks\" to its nearest ancestor that has a \"scrolling mechanism\" (created when overflow is hidden, scroll, auto, or overlay), even if that ancestor isn't the nearest actually scrolling ancestor.' Matches the react offset-budget application's incident, where an overflow value with no constrained height disabled sticky."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding",
      "result": "'This allows you to create insets in the scrollport to make room for objects that might obscure the content, such as fixed-positioned toolbars'; worked example 'Preventing content from being hidden by a fixed header' sets scroll-padding on the root element. A one-declaration alternative to per-heading scroll margins."
    },
    {
      "url": "https://drafts.csswg.org/css-scroll-snap-1/#scroll-padding",
      "result": "Scroll padding adjusts the optimal viewing region 'for the purpose of paging and scroll-into-view operations'. For fragment navigation and scrollIntoView the UA 'should use the element's scroll snap area' (border box plus scroll-margin), 'even when snapping is off'. Confirms that both mechanisms reach every entry point, as the technique says of the margin."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/tabindex",
      "result": "Supports 'programmatically focusable without becoming a tab stop': a negative value 'means that the element is not reachable via sequential keyboard navigation', and any valid tabindex lets the element 'be focused with JavaScript'. tabindex=0 makes it tabbable, which is the one-value-apart wrong answer."
    },
    {
      "url": "https://nextjs.org/docs/architecture/accessibility",
      "result": "'Next.js includes a route announcer by default' that announces document.title, then the h1, then the pathname on client-side transitions. Qualifies 'told nothing at all'. The page says nothing about moving focus, which is consistent with the technique's point that an announcement leaves focus in place."
    },
    {
      "source": "Arithmetic in applications/react--fixed-chrome-offset-budget.md",
      "result": "76+2=78, 78+44=122, 86+16=102 and scroll-mt-24=96px all check. CHROME_PAD_TOPIC is described as 'pt-12 lg:pt-0 = 122 - 76', but pt-12 is 48px and 122-76 is 46. Either the quoted code or the description is off by 2px; the private tree was not reopened to tell which."
    }
  ],
  "documents": {
    "long-form-reading-surface.md": {
      "disposition": "keep",
      "reason": "Three authorities and one definition is a coherent frame, and the seams with app-shell, chat-transcript and accessibility are explicit. Its one-line statement of the sticky trap is accurate at golden-path grain; the sharper form belongs in the technique."
    },
    "techniques/anchor-id-single-assigner.md": {
      "disposition": "keep",
      "reason": "The stateful-instance argument, the deterministic namespaced fallback, the 'inclusion is a filter after assignment' rule and the both-consumers test that also asserts its own instrument are sound. The positional-fragility caveat is stated, not hidden."
    },
    "techniques/fixed-chrome-offset-budget.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the scrolling-ancestor section now says any ancestor whose overflow is hidden, auto or scroll captures sticky even if it never scrolls (MDN position); the anchored-heading clearance now names a single top scroll padding on the scroll container as the equivalent alternative to per-heading scroll margins, honored for scroll-into-view (CSS Scroll Snap 1, MDN scroll-padding), with 'pick one; stacking both double-counts the chrome'."
    },
    "techniques/scroll-spy-reading-band.md": {
      "disposition": "keep",
      "reason": "Topmost-intersecting wins and the empty band leaving the answer unchanged give a stable definition. Not-yet-computed and arrived-by-anchor are spelled separately. The band top equalling the scroll clearance is held through the offset budget. The intersection-observer and stable-input cautions are correct."
    },
    "techniques/server-parsed-once-reused.md": {
      "disposition": "keep",
      "reason": "Re-parse on measured divergence, with an empty list explicitly not treated as a failure signal. It carries depth and leaves filtering downstream, and reading numbers carry their predicate. Its when-not section correctly treats client-only authoring as the single authority."
    },
    "techniques/focus-transfer-on-in-place-navigation.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: 'told nothing at all' is now followed by 'Some routers do announce the new page's title on a client-side transition; an announcement still leaves focus where it was' (Next.js accessibility docs). Still owed: a stated reset point for the module-scope last-landed identity, so that leaving the article surface and returning to the same article by client-side navigation still hands off focus. Not applied because the remedy is a design choice no source read this run settles."
    },
    "applications/react--anchor-id-single-assigner.md": {
      "disposition": "reverify",
      "reason": "It matches the technique closely and records two honest deviations (the duplicated depth filter, positional fallback ids). The cited files, lines and test were not reopened; the private tree is not available here."
    },
    "applications/react--fixed-chrome-offset-budget.md": {
      "disposition": "reverify",
      "reason": "The measurement, diagram, literal-class constraint and both deviations are internally coherent, and the sticky incident agrees with MDN. The CHROME_PAD_TOPIC line reads 'pt-12 = 122 - 76' (48 against 46); which side is wrong needs the private source. Nothing was re-run."
    },
    "applications/react--focus-transfer-on-in-place-navigation--remount-guard.md": {
      "disposition": "reverify",
      "reason": "The A/B account is coherent and adds the remount lesson to the technique. The remount behaviour, the Playwright arms and the 19-of-21 floor rest on a private tree that was not reopened."
    }
  }
}
```
