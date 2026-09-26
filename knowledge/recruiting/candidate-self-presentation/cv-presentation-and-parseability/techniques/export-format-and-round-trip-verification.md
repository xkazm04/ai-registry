---
layer: technique
type: technique
subject: cv-presentation-and-parseability
technique: export-format-and-round-trip-verification
status: forged
laws: [absence-of-evidence-is-not-evidence, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [generating a CV file for download or upload, adding or changing a CV template, deciding between a fixed-layout and a word-processor format for a CV]
---

# Export format and round-trip verification

The file that leaves the tool is the document every reader receives. It has properties the
on-screen preview never shows - a text layer or none, embedded fonts or substitutes, an
internal reading order, metadata, a size, a name - and each one decides what a machine
reader gets. A builder that renders a beautiful preview and never extracts its own file has
never seen the document it ships.

## The format

- **A fixed-layout file with a real text layer is the default.** It preserves the design
  and every mainstream hiring system accepts it. It must have selectable, extractable text
  in the right order, embedded fonts with full character coverage for the document's
  language, and a title in the metadata (the person's name and "CV").
- **A word-processor file on request.** Agencies and some employers ask for an editable
  file to reformat or annotate; offer it as a second export, generated from the same source
  model, never as a conversion of the fixed-layout file. No general "one format parses
  better" claim survives scrutiny; vendor documentation accepts both.
- **Never an image.** A scanned or image-only file is the one format failure every vendor
  documents; image-only output is a defect, not a style.
- **Size well under common upload caps** (a few hundred kilobytes is typical; some systems
  refuse or fail to parse above a couple of megabytes). Subset fonts, avoid embedded
  high-resolution images, never embed a photo at camera resolution.
- **Accessible structure where the format allows it** - tagged headings, list structure,
  document language, reading order matching visual order. It is what screen readers use;
  there is no evidence it helps applicant-tracking parsers, which work from geometry or
  content order, but it costs nothing when the layout is already a single flow.
- **A human-readable file name:** the person's name, the document kind, optionally the
  target, in the document's script without special characters that break upload forms -
  "Jana-Novakova-CV" plus the format suffix. This is courtesy and findability in a recruiter's downloads
  folder, not a ranking factor; claims that file names affect screening are unsupported.

## Round-trip verification

Every export, not just every template, is checked:

1. **Extract** the exported file's text with at least two extractors of different kinds
   (content-order and positional).
2. **Compare against the source model** the document was rendered from:
   - the name appears, early;
   - every contact value appears exactly as a readable string;
   - every role's title, employer and dates appear, adjacent and in order;
   - every bullet appears once and uninterleaved;
   - every heading appears as its conventional label;
   - no text appears that the model does not hold (a hidden level word, a template
     placeholder, a leftover sample line).
3. **Report the result** as a pass, or as the list of fields lost or reordered.

**Decision rules:**

- **When a field in the model is missing from the extraction, the export is failing** -
  report it to the owner and offer the plain template; never ship silently. A field the
  reader cannot extract is, to that reader, a field the candidate does not have; [absence
  of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence) is
  a rule for readers, and the writer's job is to not create the absence.
- **When text is visually hidden but present in the text layer** (an accessibility label,
  a level word behind a graphic), it must say exactly what the visible page says. Text a
  parser sees and a person does not is the pattern reading-side screens flag as smuggling,
  whatever the intent.
- **When a template or layout engine changes, re-run the round trip on a fixed set of
  reference documents** - short, long, career change, non-Latin diacritics, two pages - and
  fail the change on any regression.
- **A verification result is bound to the exact file it checked.** A re-render, a changed
  template or a changed font invalidates it; [a verdict is bound to what it
  judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged).
- **The owner sees what a machine will see.** Offering a "plain text view" of the
  extraction next to the preview is the cheapest honesty available and the fastest way for
  a candidate to catch a lost line.

## When not to use this

A document produced for printing and handing over in person needs only the legibility
rules. Everything that will be uploaded, emailed or stored needs the full check.
