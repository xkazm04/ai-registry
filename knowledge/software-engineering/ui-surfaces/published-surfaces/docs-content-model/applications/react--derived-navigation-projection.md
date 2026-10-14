---
layer: application
type: application
subject: docs-content-model
technique: derived-navigation-projection
stack: react
status: forged
verified_on: 2026-10-14
verified_against: react@19
applied: code
ab_verdict: better
---

# Derived navigation projection - a Next.js guide surface, as built here

The projection half of the technique was already built: the sidebar tree is a
`.map()` over the topic table in a server-only module, handed to the client
sidebar as props, with a header saying why the client must not import it. The
tree was not the defect. The counts were.

## What A and B were

A: the guide index page's structured data and the layout's meta description
counted the raw length of the topic table. That table includes dev-only topics
the sidebar, sitemap and category lists hide through one visibility predicate,
so the machine-readable count (109) named a different population than the tree
(108). This is the count-carries-predicate failure the technique names, in a
repository that had already fixed the sibling failure (a typed "10 categories")
and derived the number from the table without deriving it from the visible set.

B: one helper, `countVisibleTopics()`, filters the table with the same
predicate the tree uses; the meta description floor and both structured-data
fields read it. A test asserts the helper equals the total of the sidebar
projection, so the count and the tree cannot drift apart again.

## Reading

Target: the machine-readable topic count against the sidebar total, A 109 vs
108 (disagree), B 108 vs 108 (equal, asserted). Floor: the full unit suite
(2,150 tests), type check and lint stayed green. Seam chosen to falsify the
claim that a derived count is automatically honest: it found a derived count
over the wrong population. Not changed: the translated search placeholders
still type "100+" by hand in every locale, a floor that stays true under growth
but is not derived.
