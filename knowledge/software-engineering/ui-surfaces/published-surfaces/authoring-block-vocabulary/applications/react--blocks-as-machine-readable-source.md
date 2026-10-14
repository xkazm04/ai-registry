---
layer: application
type: application
subject: authoring-block-vocabulary
technique: blocks-as-machine-readable-source
stack: react
status: forged
verified_on: 2026-10-14
verified_against: react@19
applied: code
ab_verdict: better
---

# One parse tree feeds the how-to emitter, and the emitter still leaked markup

`personas-web` is close to the textbook shape of this technique. One grammar
module (`parseGuide`) builds a plain-data tree; the renderer, the content gate,
the table of contents, the search sections, the agent-readable markdown export
and the HowTo structured data all read that tree. The reduced-parse hazard the
technique warns about does not exist there, and a corpus test parses all 1,526
bodies (English plus thirteen locales) with zero diagnostics.

## The seam chosen to falsify

The technique says emitted structure must describe what the reader sees. The
tree conformed on every structural rule, so the seam was the one rule a shared
parser does not enforce by itself: **text.** The grammar returns step titles and
bodies as authored, inline markup included, because the renderer turns that
markup into elements. The emitter took those strings verbatim.

## A and B

Measurable: steps whose emitted `name` or `text` carries raw inline markup.
Floor: step count, order and wording unchanged, parse diagnostics at zero, type
check, lint and the content gate green.

- **A (as shipped):** 1,262 steps in 238 topic bodies across fourteen content
  sets; **101 steps in 85 bodies emitted markup** (99 code spans, 2 link
  targets), for example a step telling the reader to run a command in backticks,
  and a step whose text was a bracketed link with its URL.
- **B:** strip inline markup at emission with the grammar module's own
  stripper, now exported. Same 1,262 steps and order; markup in emitted text
  0 of 1,262. A corpus test pins it across all fourteen content sets.

Verdict `better`, `ab-paired` on one corpus. The defect is also invisible to a
subset check ("extracted structure is a subset of rendered structure") because
the strings are equal; the page shows the words and the emitter shows the words
plus the syntax around them.

## Condition the technique gains

Sharing the parser fixes structure, not text. A consumer that cannot render
inline markup must be handed the reader-visible form of every string, and that
conversion belongs in the one grammar module beside the parser, exported, so the
second consumer cannot grow its own.

Limit: only English is served in production here, so the live exposure was the
English bodies (the locale sets were measured because the builder accepts any
unit).
