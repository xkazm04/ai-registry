---
layer: technique
type: technique
subject: voice-and-register
technique: house-style-consistency
status: forged
laws: [a-check-names-a-property-and-a-span]
shared_with: []
use_when: [setting up the style rules a drafting agent and a checker share, resolving a register choice that has no single right answer, reviewing a post that mixes conventions]
---

# House style consistency

The concern: many register choices in a technical post have no single right answer, and a
post that makes them inconsistently reads as stitched together from several drafts.
Addressing the reader as "you" in one section and "the reader" in the next, numerals in one
table and words in the next paragraph, em dashes in the opening and none after: each is
defensible alone and jarring together. **Make each such choice once, write it into a short
house sheet that the drafter and the checker both read, and check it mechanically.**

## What belongs on the sheet

Choices that are conventions rather than craft, each stated as a rule a check can apply:

- **Person.** Whether the reader is "you"; that the author is not narrated (see
  impersonal-results-reporting); where exceptions are allowed (preview outcomes, the close's
  changed actions).
- **Punctuation marks the house restricts**, for example dashes, with the reason recorded.
  This house bans the em dash and the en dash as sentence punctuation (owner rule,
  2026-10-06: it is the first visible sign a model wrote the page); ranges use "to".
  If the reason is "a drafting model overuses it", say so; the restriction is then a house
  rule, and a later editor can lift it without arguing about grammar.
- **Numbers.** Numerals for measured quantities always; the multiplication sign or "times"
  for ratios; a fixed number of significant figures for each kind of measurement; units
  spelled or abbreviated, once.
- **Headings.** Sentence case or title case; claim headings (see the `article-structure`
  subject).
- **Names.** How systems, versions and standards are written on first and later mention.
- **Dates.** One format for page dates and measurement dates in the sources list.

## Procedure

1. Keep the sheet short enough to be read in full by a drafting agent on every run: a
   dozen rules, not a style manual. A long manual is skimmed, and a skimmed rule is not
   followed.
2. For each rule, write the check that detects a violation and the span it reports
   ([a check names a property and a span](../../../_laws.md#a-check-names-a-property-and-a-span)).
   A rule with no possible check is advice; keep it off the sheet or rephrase it.
3. Run the checks over the article and its companion files (notes, captions, alt text, the
   sources list). Captions and alt text are where house rules leak most often, because they
   are written last.
4. When a rule produces false positives on legitimate text, add the exception to the rule
   rather than editing the text to satisfy the checker. Run punctuation checks on the text
   the reader sees, not the raw markup: a checker that collapses newlines reads Markdown
   list bullets as spaced hyphens, and a product site's copy gate carried that warning on
   five of its ten blog posts.
5. Know the checker's unit. Where a whole post is one string to the gate, editing one word
   re-gates the post, and the post's baselined debt is owed in the same edit. On that site
   the blog file's banned em dashes went from 61 to 16 in four commits, one a language
   review and three claim corrections that touched the posts for other reasons. 852 remain
   in the guide.

## Decision rules

- **When two authorities disagree, the sheet decides and records which side it took.** A
  developer style guide that prefers "you" and a science publisher that prefers "we" are
  both right for their genres; the house picks one for its genre.
- **A rule that exists to curb a model habit is labelled as such.** It can be revisited when
  the drafting model changes; a rule presented as grammar cannot. The em dash shows why:
  a 2026 report relays that only one major chatbot still uses the mark as much as people
  do, and the crowd-written field guide now dates its em dash section as ending September
  2026. A ban recorded only as a dated decision, with no reason, cannot tell a later
  editor whether it has outlived its cause.
- **Person is a sheet rule, not only a technique.** Who speaks (the author, the
  organization, nobody) and who is addressed belong on the sheet with a check. A product
  site's five-rule sheet covered spelling, dashes, quotes, ellipsis and case and said
  nothing about person; its blog addresses the reader throughout and in one post the
  organization reports an unsourced observation as "we've seen".
- **Consistency beats preference within one post.** When editing someone else's post to a
  house that lacks a rule for some choice, follow the post's own majority usage rather than
  the editor's taste.

## When not to use it

One-off guest posts published under their author's own conventions, where imposing the
house sheet would erase a voice the publication chose to host; check only the rules that
protect the reader (dated numbers, working citations), not the conventions.
