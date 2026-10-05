---
layer: technique
type: technique
subject: medium-format-fidelity
technique: target-platform-capability-map
status: forged
laws: [check-the-page-where-it-is-read]
shared_with: []
use_when: [preparing an authored article for a hosted publishing platform, building a paste-ready or importable package, deciding how tables, figures and code survive a platform's editor]
---

# Target platform capability map

The concern: an article authored as a full web page is published through a platform that
renders only a subset of it. Pasted unexamined, tables collapse, a third heading level turns
into bold text, inline vector figures disappear, captions detach, and code loses its
highlighting or gains the wrong one. **Before packaging, write down what the target platform
renders and how each element of the authored page maps onto it; build the package from that
map; check it in the platform's own preview.**
([check the page where it is read](../../../_laws.md#check-the-page-where-it-is-read))

## The map

One row per element of the authored page, with what the platform does and the decision
taken:

| Authored element | Questions for the platform | Typical decisions |
|---|---|---|
| Title, subtitle, headings | How many heading levels? Which line becomes the title? | Keep sections at one level under the title; demote deeper levels to bold lead-ins |
| Paragraphs, emphasis, links | Which inline marks survive? | Usually all; check footnote-style anchors |
| Tables | Native tables? | If none: an image of the designed table with a full text alternative and the data linked, or a small fixed-width block |
| Vector figures | Inline vector graphics allowed? | If not: export to a raster image at twice the display width, on a background that works in both schemes |
| Captions | Image captions? Captions on other blocks? | Caption text with source numbers under each image |
| Code | Native code blocks? Highlighting? Language detection or selection? | Plain text in the native block with the language selected |
| Interactive elements | Scripts? Embeds from which hosts? | Replace with a static figure; link the interactive version |
| Citations | Anchor links inside the post? | Keep numbered citations and the sources list even if the numbers cannot link |
| Read time | Platform-computed? | Reconcile with the preview's computed figure; state what the preview counts |

## Procedure

1. Fill the map from the platform's current help pages and a test post, and date it.
   Platforms change their editors; a map is a dated source like any other.
2. Generate the package from the authored page by rule: each element converted per its row.
   Hand conversion at paste time is where tables become mush.
3. Keep the authored page as the source of truth. Edits go to the page and the package is
   regenerated; editing in the platform's editor forks the article.
4. Import or paste the package into a draft on the platform, and check the draft in its
   preview at both viewports and both schemes before publishing.
5. Record in the package what was lost in translation (an interactive viewer, a table's
   heat tint) so a reviewer can judge whether the published version still makes the point.

## Decision rules

- **When an element cannot survive the platform, change its carrier, not its role.** A
  table becomes an image of a table, not a paragraph.
- **When the platform offers import from a URL**, prefer it to pasting where it preserves
  structure and records the canonical origin; check what it drops.
- **Do not automate posting through an unofficial interface.** A package a person pastes or
  imports is slower and does not break when the platform changes its front end.

## When not to use it

Self-hosted publication of the authored page itself, where the page is the medium; the
other techniques of this subject then cover everything.
