---
layer: application
type: application
subject: on-page-and-metadata-craft
technique: structured-data-by-page-kind
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Two graphs built from one validated source: an article page and a proof microsite

The Czech-first adtech marketing workspace (commit
`2893314930546ed3a314a19a155bcf2f8841a0ea`, 2026-09-08; engines pin node 24) emits two
linked-data graphs, one per page kind, and both are built from the same objects that
render the visible page after a validator has already refused anything the graph would
have to fabricate. That is the technique's one-source rule realised as code: the graph
cannot drift from the page because there is no second copy to drift.

## The validator runs first

`src/lib/article-validate.ts:52-104` - `validateArticle` throws on exactly the things a
graph would otherwise paper over: a figure without `src`, `alt`, `width` and `height`
(`:65-66`), a heading without an id (`:67`), a table whose rows do not match its header
(`:68-73`), an FAQ with no items - the comment cites the engine's requirement of at
least one question for the page type (`:75`) - duplicate heading ids (`:81`), FAQ ids
that are empty or shadow a heading id (`:88-93`), and any body anchor that resolves to
no heading or FAQ id (`:99-102`). Every field the article graph needs is therefore
either present or the build fails; the graph never sees a placeholder.

## The article page: kind-typed graph from render data

`src/app/clanek/page.tsx:62-71` - the head: title, description from the perex, the
canonical, and a `text/markdown` alternate declared as the "machine-readable twin for AI
crawlers / answer engines" - the technique's twin, built from the same article object.

`:73-81` - the author as a person node with name and role, and bio and url "included
only when present" - the absent-key rule, not an empty string.

`:100-164` - the graph, with the comment "so the page is rich-result ready":
- article node (`:105-129`) with headline, description, author, dates, section,
  keywords, `mainEntityOfPage`, `inLanguage: "cs"` with the comment that the body is
  Czech regardless of UI locale, a publisher organisation from shared site constants "so
  they can't drift from the rest of the app", and an `image` array only when figures
  exist;
- one image node per figure (`:132-140`) with absolute URLs, the alt as description,
  caption and dimensions when present - the figures that already passed the validator;
- breadcrumb list (`:141-151`) mapped from the *same* `breadcrumbs` array that renders
  the visible trail (`:91-98`, "reused for both ... so they never drift"), the trailing
  crumb resolving to the article's own canonical;
- question-and-answer node (`:152-162`) mapped from the same `faq` list that renders the
  accordion, each question carrying `url: articleUrl#<id>` so "a FAQ rich result can
  land the user on the exact answer" - the id namespace the validator made unique.

The comment at `:154` still says "FAQ rich result"; the engine withdrew that result in
May 2026. The markup stays correct under the technique - the page has real questions,
each deep-linked - and the comment's reason has expired, which is the shelf-life the
technique tells a team to date.

## The proof microsite: dataset node coupled to provenance

`src/components/microsite/PerformanceMicrosite.tsx:47-74` - a white-label performance
page emits an article node (author and publisher are the agency organisation, `about`
is the client organisation) and a dataset node whose `variableMeasured` is four
property-value pairs - revenue, cost, conversions and the cost-share ratio - taken from
`snapshot.current`, the same object the page's body renders.

`:99-103` - the disclosure banner renders only on the sample branch, with the comment
that "a live view IS the client's real synced series, so the banner would be the
opposite lie". Indexability is decided per request from live sync state elsewhere in
the microsite module (the surfaces scout's anchor 20-21), so the dataset node is only
crawled when its numbers are the client's own. The technique's coupling - real branch
gets the node and no disclosure, sample branch gets the disclosure and no index - is
present in the tree.

## Deviations

- The dataset node is emitted on both branches; only indexability separates them. The
  technique says emit no dataset node when the numbers are illustrative, because a
  crawler that reaches the page by a shared link reads the graph and not the banner.
- The article graph exists on one article; there is no cluster, so the breadcrumb's
  category hub is the only structural link the graph carries.
- Neither graph is validated against the vocabulary at build time; the validator
  guards the page data, and the graph's own shape is trusted.
