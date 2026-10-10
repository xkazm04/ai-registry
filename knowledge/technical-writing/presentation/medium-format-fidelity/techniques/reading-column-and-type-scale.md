---
layer: technique
type: technique
subject: medium-format-fidelity
technique: reading-column-and-type-scale
status: forged
laws: [check-the-page-where-it-is-read]
shared_with: []
use_when: [setting the column width and body type of an article page, reviewing a page that is tiring to read, sizing captions, tables and code relative to body text]
---

# Reading column and type scale

The concern: line length and type size are the two typographic choices most studied for
screen reading, and both are usually left at whatever the template or the author's screen
produced. Neither is established as the single largest factor; they are the two an author
most often gets wrong without seeing it. **Set a
reading column that holds lines between about 45 and 80 characters, body type large enough
that the column rather than the font limits the line, generous line spacing, and a small,
consistent scale for everything that is not body text.**

## The numbers and their authority

| Property | Working value | Authority |
|---|---|---|
| Line length | 45 to 80 characters (40 for CJK at most), toward 55 to 75 for text read to be understood | A typography reference gives 45 to 90. Studies split by measure: about 55 characters gave the best comprehension in one (n = 36) and was preferred; 95 to 100 were read as fast or faster. Accessibility guidance (Level AAA) asks that a mechanism can give at most 80, 40 for CJK; it does not bind the author's default |
| Line spacing | 1.5 to 1.65 within paragraphs | Accessibility guidance (AAA, a mechanism): at least 1.5 within paragraphs, paragraph spacing at least 1.5 times line spacing. A 104-reader study found large effects of size and recommended default line spacing, so this is accessibility, not a measured reading gain |
| Justification | Ragged right | Accessibility guidance: text not justified |
| Body size | Near 20 px for a serif reading face on screen | Convention of long-form reading surfaces. A 104-reader study found large effects of font size on readability and comprehension, but its line length was fixed in the window, so size and length moved together. Choose by measuring the resulting line length |
| Secondary text | Captions, table cells and code one or two steps smaller than body, never below about 13 px | Convention; legibility at the narrow viewport decides |

## Procedure

1. Choose the body face and size, then set the column's maximum width so a typical line
   holds 60 to 75 characters. Count characters on a real paragraph, in the page's own face
   at body size, not on a sample string. A width class or a pixel cap is not a count: a
   768-pixel column at 16 pixels held a median of 99 characters per line of real text in
   one sans face.
2. Add side padding so the column never touches the screen edge at the narrow viewport.
3. Define the scale as a handful of named steps (title, section heading, body, caption,
   code, table) and use only those. Ad hoc sizes are how a page drifts.
4. Let wide elements (figures, tables, code) break out of the column only when their
   content needs it, and give them their own horizontal scroll.
5. Check the result where it is read: at both viewports and both colour schemes
   ([check the page where it is read](../../../_laws.md#check-the-page-where-it-is-read)).

## Decision rules

- **When the platform fixes the column and type, accept them** and design figures and
  tables for that column; fighting the platform's typography produces pages that break on
  its next redesign.
- **When lines exceed about 90 characters at the wide viewport, narrow the column or raise
  the body size**, measuring again after either. A larger body size shortens the line only
  when the column's maximum is fixed in pixels. A column set in `ch` or `em` grows with the
  type, and a column that grows with the screen moves the problem to a wider screen.
- **When the column grows with the viewport** (a layout that gains space beside a sidebar),
  measure it at the widest common screen, not at the width where it was designed.
- **When the text is skimmed rather than studied** (news, reference), longer lines cost
  little speed; the moderate range is for text read to be understood.
- **Numerals in tables use lining, tabular figures** where the face offers them, so
  columns of numbers align.
- **Never set body text in a light weight or low-contrast grey to look refined.** It fails
  contrast in one colour scheme and tires the reader in both.

## When not to use it

Reference documentation with wide code samples and tables as its main content may use a
wider main area; even there, prose paragraphs keep the reading column.
