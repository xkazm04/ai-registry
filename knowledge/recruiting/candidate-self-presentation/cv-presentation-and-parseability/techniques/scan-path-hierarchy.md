---
layer: technique
type: technique
subject: cv-presentation-and-parseability
technique: scan-path-hierarchy
status: forged
laws: [meaning-does-not-live-in-a-label]
shared_with: []
use_when: [laying out the header and entry pattern of a CV template, deciding what goes in the first third of page one, choosing what to bold or colour on a CV]
---

# Scan-path hierarchy

The first pass over a CV is short and targeted. Whatever the true number of seconds - the
widely quoted figure comes from one commercial study, and independent measurements are
longer and more variable - attention concentrates on a small set of items: the name, the
current title and employer, the previous title and employer, the dates of both, and
education. The rest is a skim for recognisable terms. A layout either puts those targets
where the eye already goes, or makes the reader hunt; a hunt costs the first pass.

## The first third of page one

In reading order, and visually in the top third:

1. **Name** - the largest type on the page.
2. **Target or headline line** - what the person is, or is seeking, in one line. The
   held title where it describes them; a labelled target ("Seeking: ...") where it does
   not. Never a sought title set where a held one would be.
3. **Contact line** - location at city level, email, phone, one or two links. On a
   single line or two, as text.
4. **Summary**, when the content subject says it earns its place - three lines.
5. **The most recent relevant role**, fully visible.

A header that consumes a third of the page with a band, a photo and a large monogram has
spent the first pass on decoration.

## The entry pattern

Every dated entry - roles, education, projects - repeats one pattern:

- **Line 1: title** (bold, the entry's strongest weight) **- employer or institution**
  (regular or accent) **- dates** (right-aligned or at the line end, same text line).
- **Line 2 (optional): context** - location, employment type, a one-phrase description
  of an unfamiliar employer.
- **Bullets**, left-aligned under the title, with a consistent marker.

**Decision rules:**

- **When dates sit on a separate line, in a separate column or in a margin gutter, the
  pattern is weaker for both readers.** Same-line dates keep title and interval together
  for a skimming eye and for a parser pairing a title with the nearest date; a hanging
  date column is acceptable only when the extracted order still yields "title, employer,
  dates" together.
- **When the pattern varies between entries** (a bold employer here, a bold title there;
  dates left in one role, right in the next), fix it. Consistency is the hierarchy - the
  eye learns the pattern from the first entry and reads the rest by position.
- **Use one date format throughout**, the market's own (month and year, numeric or
  abbreviated), with a proper range dash and the market's word for "present".
- **Bold is for the entry head, not for the body.** Bolding terms inside bullets
  competes with the entry head; if emphasis is used at all, one lead phrase per bullet or
  none, never every matching keyword.
- **Colour is an accent, never a carrier.** One accent colour for the name, section rules
  or employer names is fine. Meaning must survive greyscale printing and extraction -
  nothing may be distinguishable only by colour.
- **Section headings are words the reader and the parser both know**, in the document's
  language, set as real headings. A decorative or invented heading is one neither
  recognises; [meaning does not live in a
  label](../../../_laws.md#meaning-does-not-live-in-a-label) cuts both ways - a stable
  internal section vocabulary rendered as the conventional local label.

## Levels

Four typographic levels are enough and more is noise: the name; section headings; entry
heads; body. Distinguish them by size step and weight. Small caps, letter-spacing,
colour and rules may reinforce a level but must not *be* the level - letter-spaced text
in particular extracts as separated characters in many extractors, which is why the
reading side has a repair for it.

## When not to use this

A portfolio-led document for a visual role is judged partly *as* design and may break the
pattern deliberately - but it still carries a plain, parseable version for the system that
receives it. And an employer's mandated form fixes its own order; follow it.
