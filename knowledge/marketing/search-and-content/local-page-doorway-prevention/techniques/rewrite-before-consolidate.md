---
layer: technique
type: technique
subject: local-page-doorway-prevention
technique: rewrite-before-consolidate
status: forged
laws: [a-gate-before-money-and-copy, label-convention-as-convention]
shared_with: []
use_when: [an audit has flagged area pages as clones, choosing between a canonical, a noindex, a redirect and a rewrite, a client wants to delete a city page set]
---

# Rewrite before consolidate

Five situations, five fixes. The order in the name is the default: a legitimate area
page under templated copy is rewritten, and consolidation is reserved for pages that
never had a reason to exist apart. Pairing the wrong fix with the situation deletes
pages that deserved to live or leaves the pattern intact while looking tidy.

## The table

| Situation | Fix | Why this and not the others |
|---|---|---|
| Near-identical pages for the same query, no real differentiation, no distinct area served | **Consolidate**: permanently redirect the clones into one strong page | Doorway territory. A canonical or a noindex leaves the crawl waste and the pattern in place |
| Real distinct service areas, templated body copy | **Rewrite the body; do not touch the tags.** Target the unique-phrase count | The pages deserve to exist and have nothing unique in them. Canonicalizing them away destroys legitimate local pages |
| True technical duplicates - parameters, print views, trailing slashes | **The canonical tag** | Its documented use case |
| Needed for users, zero organic value - paid landing pages, campaign arms | **noindex, follow** | Keeps them live and out of the index. Never a canonical to an unrelated page |
| The engine chose a different canonical and you disagree | **Differentiate the content, then realign every signal** | No tag beats "the page is genuinely a duplicate" |

## Procedure

1. **Classify each flagged page by situation**, using the material gate's answer (does
   the area have real material or not) and the inspection read (what did the engine
   choose). The similarity score alone cannot classify: a clone of a legitimate area
   and a clone of an imaginary one score the same.
2. **For rewrite candidates**, send the page back through the material gate. Passed:
   rewrite the body from the material, leave title, heading, canonical and URL alone,
   measure the unique-phrase count before and after. Held: it becomes a consolidation
   candidate, because there is nothing to rewrite it with.
3. **For consolidation candidates**, name the surviving page, list every inbound link
   to each clone, and write the recommendation. It waits for approval
   ([a gate before money and copy](../../../_laws.md#a-gate-before-money-and-copy)):
   a deleted or redirected URL loses its own links and rankings permanently, and the
   owner decides.
4. **Redirect, do not just remove.** Each clone redirects permanently to the survivor
   so its links carry; the redirect is one hop and the survivor is the final URL.
5. **Do not expect the rankings to stack.** Fifty area pages redirected into one do not
   become a page with fifty pages' rankings. Consolidation is pruning: the survivor
   keeps its own standing plus whatever link equity the clones held, and the queries
   the clones targeted are now targeted by the survivor's content or not at all.
6. **Re-read the verdict** on the survivor and the rewritten pages after the recrawl
   interval, and compare state to state.

## Anti-patterns, each a documented error

- **Blocking a duplicate in the crawl-directives file to "canonicalize" it.** The
  engine cannot fetch the page, so it cannot see the canonical tag, and may index the
  blocked URL anyway on the strength of links to it. The directives file governs
  crawling, never indexing.
- **noindex combined with a canonical pointing elsewhere.** Two contradictory signals -
  "do not index me" and "I am that page" - and the engine may propagate the noindex to
  the canonical target.
- **A blanket canonical from every area page to the hub.** Solves the audit finding by
  deleting the set from the index, including the pages a rewrite would have saved.
- **Re-declaring a canonical the engine has already overridden.** The override was
  caused by the content; the tag was already there and was ignored.
- **Padding a thin page to a word count.** The engine set no minimum; adding words to
  hit one is the behaviour its helpful-content guidance names.
- **An audit's fix pass rewriting the copy.** Fix passes change the mechanical layer -
  tags, metadata, markup, links. Body copy that fixes a doorway is written under the
  voice and proof material and approved by a person; a doorway finding routes out of
  the audit to the writing step.

## Decision rules

- When a page has real material and a bad body, rewrite; because deleting a legitimate
  local page to satisfy a similarity score trades a fixable content problem for a
  permanent loss of the URL.
- When a page has no material and no distinct area, consolidate; because a rewrite
  without material produces a better-written clone.
- When a page must stay live for a campaign or a paid landing but has no organic
  reason to exist, noindex with follow; because a canonical to an unrelated page is a
  lie the engine may punish by ignoring the canonical and indexing the page.
- When the engine has chosen a sibling as canonical, change the content first and the
  signals second; because the signals were already aligned when the engine overrode
  them.
- When a client asks to delete the whole set, present the classification instead;
  because a set usually contains both kinds, and deleting the rewrite candidates is the
  costliest version of the fix.
- When the audit's similarity bands are folklore percentages, replace them before
  choosing fixes ([label convention as convention](../../../_laws.md#label-convention-as-convention));
  a fix chosen from a number that never stripped the boilerplate is a fix chosen for
  the template.

## When not to use this

Do not apply the table to pages that failed the doorway funnel test on structure rather
than content. A set of genuinely distinct pages that all funnel to one form is fixed by
giving each page its own destination and its own reason to be the destination, not by
rewriting body copy that is already distinct.

Do not use consolidation as the response to a "discovered - not indexed" set. Those
pages have not been read; redirecting them removes URLs the engine had not yet judged.
Fix the set's pattern and inclusion first, then read the verdict.

Do not redirect a held area page that has real inbound links into an unrelated
survivor merely to keep the links. A redirect to a page that does not serve the
original query is treated as a soft error; the links are kept honestly only when the
survivor genuinely covers the area.
