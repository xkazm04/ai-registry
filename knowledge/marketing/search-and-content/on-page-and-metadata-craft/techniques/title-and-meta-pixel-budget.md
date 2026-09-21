---
layer: technique
type: technique
subject: on-page-and-metadata-craft
technique: title-and-meta-pixel-budget
status: forged
laws: [label-convention-as-convention, not-measured-is-not-zero]
shared_with: []
use_when: [checking whether a title or description will be cut on the results page, building or reviewing a snippet preview tool, choosing a character limit for a prompt or a checklist]
---

# Title and meta pixel budget

The results page truncates a title or a description when its rendered width exceeds the
column, not when its character count exceeds a number. The honest budget is a width in
pixels at the results page's approximate font; the character limit every checklist
carries is a portable proxy for that width and is labelled as one.

## What the engine does

The engine renders the title in its own typeface at roughly 20 pixels on the desktop
results page and the description at roughly 14, then clips with an ellipsis where the
column ends. Practitioner measurement puts the desktop title column around 600 pixels
(some 2025 measurements found the cut nearer 525-535 on the current layout), the
desktop description around 920 pixels, and the mobile column much narrower for the title
and around 680 pixels for the description, where the description may wrap to a second
line instead. A 2026 analysis across a hundred thousand results pages put the average
advance width at about 5.7 pixels per character for the typical result fonts. Those
widths drift whenever the layout changes; every figure here is approximate and dated.

The consequence is that character count is a biased instrument. A title of narrow
letters - i, l, t, punctuation - fits at 65 characters; a title of capitals, m and w
overflows at 52. A language with diacritics changes the mix again, and an uppercase
title in such a language is systematically under-measured by any per-character average
that ignores the base glyph. Character limits are therefore set to be safe for a
mid-width string: 50-60 for the title, 140-160 for the description, with the important
part inside the first 120 characters because the mobile cut comes first. Those bands are
convention; the width is the behaviour.

## Procedure

1. Prefer a width estimate over a count wherever text is generated or graded by a
   machine. A per-character advance table sampled from a common sans-serif at one pixel,
   scaled by the results page font size, is accurate to a few percent and is honest
   about wide glyphs; map any accented character to its base letter before falling back
   to an average width.
2. Truncate the way the engine does - drop characters until the text plus an ellipsis
   fits, then strip the trailing space - and show the reader the clipped string, not a
   count. The preview is the argument.
3. Offer a desktop and a mobile budget and grade against both; a title that fits desktop
   and clips on mobile has lost the half of its readers most local searches come from.
4. Where only a character limit can be enforced - a prompt, a schema, a checklist for a
   writer - set it at the safe band, say "slightly under" rather than "up to", and state
   beside it that the engine cuts by width.
5. Front-load. If the title will clip, the part that survives must be the keyword and
   the promise; the brand and the year go last because they are the parts a reader can
   lose.

## Decision rules

- When a title passes the character check and the width estimate says it clips, trust
  the width, because the count is the proxy and the width is the mechanism.
- When a prompt or a schema enforces a character cap on a model's output and the model
  overruns it, repair the overrun deterministically (clip at a word boundary) rather
  than re-prompting, because length is a platform contract and a re-prompt spends a call
  to fix arithmetic; re-prompt only for a missing field.
- When a description is shorter than the band, grade it as a warning, not a fail,
  because a short description is shown as written while a long one is rewritten - a
  2025 analysis of half a million results found descriptions of 150-160 characters were
  used verbatim in about 82 percent of cases, and the rewrite risk is on the long side.
- When the text to measure is empty, report the width as not measurable, never as zero
  pixels passing, because an empty title is a fail of a different check.

## Conventions, labelled

The 50-60 and 140-160 character bands, the 120-character mobile guidance and the
"slightly under" preference are practitioner convention. The desktop and mobile widths
are practitioner measurements of a layout the engine changes without notice; the font
sizes are read off the rendered page. The engine has never published a pixel budget.

## When NOT to use

- Share-preview titles and descriptions: social and messaging platforms clip by their
  own rules and a results-page budget is the wrong instrument.
- Headline tags inside the body: an H1 is not truncated by anyone and a width rule there
  is a copy constraint in disguise.
- Deciding what the title should *say*: width tells you where the cut falls, not which
  variant earns the click; that is `ctr-lifts-as-tie-breakers-not-a-stack`.
