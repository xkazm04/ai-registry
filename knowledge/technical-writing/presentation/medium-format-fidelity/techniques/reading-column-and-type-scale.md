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

The concern: long-form reading comfort is decided mostly by line length and type size, and
both are usually left at whatever the template or the author's screen produced. **Set a
reading column that holds lines between about 45 and 80 characters, body type large enough
that the column rather than the font limits the line, generous line spacing, and a small,
consistent scale for everything that is not body text.**

## The numbers and their authority

| Property | Working value | Authority |
|---|---|---|
| Line length | 45 to 80 characters (40 for CJK at most) | A typography reference gives 45 to 90; accessibility guidance for enhanced presentation gives at most 80, 40 for CJK |
| Line spacing | 1.5 to 1.65 within paragraphs | Accessibility guidance: at least 1.5 within paragraphs, paragraph spacing at least 1.5 times line spacing |
| Justification | Ragged right | Accessibility guidance: text not justified |
| Body size | Near 20 px for a serif reading face on screen | Convention of long-form reading surfaces, not a standard; choose by measuring the resulting line length |
| Secondary text | Captions, table cells and code one or two steps smaller than body, never below about 13 px | Convention; legibility at the narrow viewport decides |

## Procedure

1. Choose the body face and size, then set the column's maximum width so a typical line
   holds 60 to 75 characters. Count characters on a real paragraph, not on a sample string.
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
- **When lines exceed about 90 characters at the wide viewport, narrow the column**, do
  not enlarge the font. Larger type in a wide column still yields long lines on wider
  screens.
- **Numerals in tables use lining, tabular figures** where the face offers them, so
  columns of numbers align.
- **Never set body text in a light weight or low-contrast grey to look refined.** It fails
  contrast in one colour scheme and tires the reader in both.

## When not to use it

Reference documentation with wide code samples and tables as its main content may use a
wider main area; even there, prose paragraphs keep the reading column.
