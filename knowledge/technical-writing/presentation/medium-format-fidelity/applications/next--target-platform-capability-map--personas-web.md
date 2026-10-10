---
layer: application
type: application
subject: medium-format-fidelity
technique: target-platform-capability-map
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16
applied: simulation
ab_verdict: better
---

# A self-hosted blog whose feed and link cards carry only the description

Read against the `personas-web` repository at `01eaee60` (origin/master) on 2026-10-10.
Anchors are relative to that tree. The version is witnessed by package.json:48 "^16.3.8".
The blog is the one in the `reading-column-and-type-scale` application beside this file.
It is self-hosted, with no cross-posting to any publishing platform at this commit.

## The surfaces a post reaches

- **The page.** The authored post, covered by the other applications beside this file.
- **The feed.** It is linked from the blog index, with no feed entry in the page metadata,
  so readers find it by the link. Each item carries a title, a link, a category, a date and
  the post's description:
  src/app/blog/feed.xml/route.ts:30 "<description>${escapeXml(p.description)}</description>".
  No item carries the body.
- **A link card.** Each post has its own social image and a canonical address (line 38 of
  src/app/blog/[slug]/page.tsx). Where a link is shared, the card shows a title, the
  description and that image.

## Simulation

Policy A is the technique before 2026-10-10. It maps a hosted platform, and calls
self-hosted publication of the page out of scope. Policy B makes two changes:
- a feed is a second platform, to be mapped;
- the map gains a feed row: full content or summary, and what survives a reader's
  sanitizer.

- **The feed as built.** A has nothing to say: the site is self-hosted. B's row asks the
  feed question and gets a plain answer: a summary feed, so nothing in the body reaches a
  feed reader. That is a defensible choice, and B records it as a choice.
- **The feed with bodies, if the owner adds them.** A still says nothing. B's row predicts
  what arrives, from the renderer's own code. The prompts are italic through a class, not
  an emphasis element (lines 83 to 85 of BlogArticleContent.tsx under the post route's
  blog-article folder), and the inline code chips are styled by class. A reader that drops
  classes delivers the five prompt blocks as ordinary paragraphs. So the change belongs
  in the renderer's markup (an emphasis or code element), not in the feed.
- **The link card.** A does not reach it. B, reading a self-hosted site as several
  surfaces, sees the description as the only body text on two of the three. A description
  that reads as a teaser rather than a summary is then the article for those readers.

B gives a usable answer on all three cases, and A gives none. This is judgment on the code;
no feed reader or chat client was tested.

**Falsifier:** a feed reader that keeps the site's classes and styles, which would empty
the second case. The feed and the renderer were not changed: the project's map does not
join this bundle.
