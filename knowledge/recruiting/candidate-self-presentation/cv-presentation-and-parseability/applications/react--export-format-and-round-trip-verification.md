---
layer: application
type: application
subject: cv-presentation-and-parseability
technique: export-format-and-round-trip-verification
stack: react
status: forged
verified_on: 2026-10-14
verified_against: react@19.3
applied: code
ab_verdict: better
---

# The CV export: a round trip that checks the text and, now, the file

Pinned at `kp@a73922bac`, changed at `kp@f344c73d1`. The earlier application of the reading-order
technique recorded "no round-trip test exists". That has since been fixed in the tree, and this
one records what the technique asks of the export and where the tree stood when it was opened.

## What conforms

- **One option set shared by route and check.** The PDF route and the round-trip script print with
  the same constant (`CV_PDF_OPTIONS`: stylesheet page size, backgrounds, tagged), so the file the
  check reads is made the way the route makes it.
- **File name and metadata title** come from the person's name and the document kind, ASCII-folded
  for the name, in their own script for the title, each with a unit test.
- **Two extractors of different kinds** (content order and positional) run over five reference CVs
  (short, long, career change, diacritics, two pages) in every template, against the document model:
  name first, entry head together, bullets whole, nothing missing, diacritics, nothing foreign.
  The pure checker is held by the keyless unit job.
- **Static faces** replaced variable subset fonts after the check showed the latter print as
  unnamed Type 3 faces that split words mid-letter.

## The gap the seam was chosen to expose

The technique lists file properties (title, structure, embedded fonts, size) beside the text
checks. The script measured all four and printed them, but its exit code and verdict line read only
the text checks. Rendered with tagging switched off, the unmodified script printed `tagged NO` and
exited 0.

## A and B

A: the script as it was. B: a pure `checkExportProperties` (title equals the expected string,
structure tree present, no named font without an embedded file, size under 2 MB) folded into the
verdict and the exit code.

- Target: a defect that drops tagging. A exits 0, B exits 1 with a finding.
- Floor: every reference CV in the studio and classic templates still passes under B with the real
  options (45 to 64 KB, six embedded fonts, title correct); typecheck, lint and 17 related unit tests green.
- Verdict: `better`. Not measured: the same defect through the live route, which does not run the
  round trip on the user's own export (below).

## Still open

- **No per-export check at runtime.** The technique says every export is verified and a failing one
  is reported to the owner with the plain template offered. The route hands back whatever Chromium
  printed; the check is a dev tool, deliberately outside the keyless job because it needs a browser
  and Python. A runtime extractor in the server's own language would be the instrument.
- **No file hash binds a result to a file**, so a verdict is bound to a template and reference set,
  not to the bytes the user downloads.
