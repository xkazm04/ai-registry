---
layer: application
type: application
subject: article-structure
technique: content-preview-block
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16
applied: simulation
ab_verdict: better
---

# A product blog whose read time is a typed number, four times too long

Read against the `personas-web` repository at `01eaee60` (origin/master) on 2026-10-10.
Anchors are relative to that tree. The version is witnessed by
package.json:48 "^16.3.8". The witness is ten posts on a product's marketing blog, all of
them in one static data file and rendered by the site itself. No CMS computes anything.

## Where the number comes from

Every post carries its read time as a typed field, src/data/blog.ts:12 "readingTime: number;",
filled by hand, for example src/data/blog.ts:78 "readingTime: 8,". The index card prints it,
src/app/blog/BlogPostCard.tsx:67 "{post.readingTime} {t.blogPage.min}", and so do the featured card, src/app/blog/FeaturedPost.tsx:64 "{post.readingTime} {t.blogPage.minRead}",
the article header beside a clock icon, the 404 page's suggestions and the social-preview
image (the last three under the `[slug]` route). Nothing derives it from the text.

## What the ten posts measure

Words in each post body (headings, lists and prose, with markup stripped), divided by 238
words per minute, the meta-analytic adult silent-reading rate for non-fiction (Brysbaert,
Journal of Memory and Language, 2019). The renderer has no image, table or code-block
support, so there is no image time to add.

| Post | Words | Stated | At 238 wpm | Implied wpm |
|---|---|---|---|---|
| introducing-personas | 251 | 5 | 1.1 | 50 |
| self-healing-execution-engine | 229 | 8 | 1.0 | 29 |
| building-slack-triage-bot | 330 | 6 | 1.4 | 55 |
| credential-vault-security | 283 | 7 | 1.2 | 40 |
| devops-automation-agents | 396 | 6 | 1.7 | 66 |
| email-triage-agent-tutorial | 426 | 6 | 1.8 | 71 |
| desktop-first-vs-cloud-agents | 329 | 8 | 1.4 | 41 |
| multi-agent-pipeline-tutorial | 510 | 7 | 2.1 | 73 |
| no-code-ai-agents-for-teams | 507 | 6 | 2.1 | 85 |
| why-local-first-ai-matters | 504 | 7 | 2.1 | 72 |

n = 10. The stated figures sum to 66 minutes and the computed ones to 15.8, so the header
overstates by 4.2x. Every post implies a reading rate between 29 and 85 words per minute,
below even slow oral reading. The figures were wrong from the start: at the commit that added
the second five posts (`1ef528f5`, 2026-04-11) the ratio was already 4.15x. Nine later
commits edited the bodies, and the per-post word counts moved by up to 65 words, but no
`readingTime` value changed.

## What the old rule would have said

The content-preview rule as written on 2026-10-06 says that when the platform shows a read
time, leave it to the platform. Here the "platform" figure is the author's own claim, typed
into the same file as the prose. Leaving it alone keeps a number that is wrong on all ten
posts, in five places per post. The rule needs a condition: it holds where the platform
computes the figure. Where the figure is a field someone types, it is part of the post, and
it should be derived from the final text at build time.

A second consequence follows from the same table. The preview rule scales the block by length
("under about five minutes, one line"), and by the stated figures every post here is five to
eight minutes long and would get the full block. By the text, every post is about two minutes
or less, and one line is the right preview. A length rule has to read the computed length.

## Simulation

Mode `simulation`, three or more real cases walked under both policies. Policy A: leave the
displayed figure to the platform. Policy B: derive it from the text wherever it is a typed
field. Cases: all ten posts. A displays 10 of 10 figures outside any plausible reading rate.
B displays 1 or 2 minutes for each, within the reading-rate literature's range. **Falsifier:**
a reader study on this kind of post that finds 5 to 8 minutes of reading for 230 to 510 words,
or a measured dwell time of that order. The site's analytics were not read. The fix was not
applied: the project's map does not join this bundle, and the number is public copy the owner
has not reviewed.

## What this witness does not show

It does not show that the inflated figure costs readers. A displayed read time's effect on
whether people start or finish a post was not measured here. It shows that a typed read
time drifts from the text with no instrument to notice, and that a rule that defers to "the
platform" cannot tell a computed figure from a typed one.
