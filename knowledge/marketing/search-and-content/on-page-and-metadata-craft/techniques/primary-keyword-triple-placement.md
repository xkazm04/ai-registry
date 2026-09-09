---
layer: technique
type: technique
subject: on-page-and-metadata-craft
technique: primary-keyword-triple-placement
status: forged
laws: [the-results-page-is-the-verdict, label-convention-as-convention]
shared_with: []
use_when: [writing a brief or a page head for one primary keyword, grading keyword coverage in a generated brief, deciding whether a heading needs the keyword inserted]
---

# Primary keyword triple placement

One page, one primary keyword, and that keyword - in the exact phrasing the searcher
types, not a synonym the writer prefers - appears once in each of three slots: the
title tag, the meta description, and the first heading or opening passage of the body.
The H1 is a fourth slot when the page has one distinct from the title. Once per slot.
Nowhere else by obligation.

## Why three slots and why once

The slots are the places the engine reads to decide what a page is *about* before it
weighs the body: the title is the proposal for the results page, the description is the
proposal for the snippet, the opening heading is the first thing the body commits to.
When all three agree on one phrasing, the engine has one proposal and the published
rewrite studies say it keeps it far more often - a title that matches the H1 was
rewritten about a fifth as often as one that did not. When they disagree, the engine
picks its own phrasing and the writer has spent three slots to say nothing.

Once, because presence is the signal and repetition is not a vote. A second occurrence
in the title costs width the reader needed; a keyword stuffed into every H2 reads as
written for the crawler, which the published rater guidelines score down explicitly. The
snippet bolds the query terms where they occur in the description, so one early
occurrence draws the eye; two do not draw it twice.

## Procedure

1. Take the primary keyword from the keyword map in the phrasing the map recorded, which
   is the phrasing the results page was checked against. Do not "improve" it: "boiler
   service prices" and "boiler servicing cost" are two proposals.
2. Write the title with the keyword in the first one or two words where the language
   allows, then the specific promise, then the brand if width remains. Check the width
   under `title-and-meta-pixel-budget`.
3. Write the description with the keyword in the first clause and one concrete
   deliverable; the front-loaded keyword is the part that gets bolded and the part that
   survives mobile truncation.
4. Put the keyword in the H1 (or make the title the H1) and in the first heading or the
   first hundred words of the body, once, inside a sentence that would have carried it
   anyway.
5. Let cluster variants and synonyms fall where the prose puts them. If a variant would
   only appear by forcing it into a heading, the heading stays as written.
6. Grade coverage as three booleans - in title, in description, in opening - and treat a
   missing slot as a mechanical fail and a doubled slot as a warning, never the reverse.

## Decision rules

- When the keyword is missing from a slot on a page somebody else wrote, insert it into
  the existing sentence only where that sentence already has a place for it, because a
  rewritten sentence is a copy change and leaves `mechanical-layer-only-never-the-copy`.
- When the keyword's natural phrasing is grammatically awkward in the language of the
  page (inflected languages will decline it), use the inflected form the searcher would
  type, because the map's phrasing was verified on a results page that shows the engine
  already conflates the forms; label the choice in the brief.
- When the title and the H1 differ in phrasing, align them to the keyword, because the
  agreement is the strongest documented defence against a title rewrite.
- When a grader has no primary keyword to test against, report the three coverage
  checks as not measurable, not as failed, because a fail here triggers an edit pass.

## Conventions, labelled

"Once per slot" and "first hundred words" are practitioner convention with no published
threshold; they are chosen because a stricter rule stuffs and a looser one leaves the
opening ambiguous. The three-slot set is convention shaped by the engine's documented
use of the title, description and headings; the engine has never published a placement
rule. The H1-agreement effect and the rewrite rates are published measurement.

## When NOT to use

- A homepage or a tagline landing where the H1 is a brand line: the keyword lives in the
  title and description and the H1 rule is waived with a stated reason.
- A page that is deliberately targeting no keyword - a thank-you page, an experiment
  arm, a legal page - where placement would invent a target the map does not have.
- A page whose keyword map row is not yet verified on the results page: placement
  before intent is verified bakes an unread guess into three slots.
