---
layer: application
type: application
subject: figures-and-tables
technique: designed-comparison-tables
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16
applied: simulation
ab_verdict: better
---

# A product blog that cannot render a table, and a guide whose table component cannot align one

Read against the `personas-web` repository at `01eaee60` (origin/master) on 2026-10-10.
Anchors are relative to that tree. The version is witnessed by package.json:48 "^16.3.8".
The witness is the ten-post blog of the `article-structure` and `evidence-and-sources`
applications, plus the guide pages of the same site.

## What the two renderers can carry

The blog body goes through a line-based renderer that knows headings, `- ` and `1. ` lists,
a one-line italic block, and inline bold and code. Its own feature doc says what it lacks:
docs/features/content/blog.md:65 "No links, images, nested lists, tables, code fences".
So neither carrier the technique names for a platform without tables (an image with a text
alternative, a fixed-width code block) exists on the blog.

The guide renders markdown pipe tables through its own component. It sets the header apart
and uses hairline dividers, which are rules 1 and 2. It left-aligns every cell, header and
body, src/components/guide/blocks/MarkdownTable.tsx:26 "px-4 py-2.5 text-left text-base",
and takes only headers and rows,
src/components/guide/blocks/MarkdownTable.tsx:12 "headers: ReactNode[];", so a caption
has nowhere to go. The one numeric column in the guide's five tables renders left-aligned:
src/data/guide/content/memories.ts:71 "| 1 | Routine | Low |".

## Simulation

Mode `simulation`. Policy A is the technique as it stood before 2026-10-10: make the table,
and where the platform cannot render it, change its carrier to an image or a code block,
never back to prose. Policy B adds two rules: where neither carrier exists, the carrier is
a parallel list (same attributes, same order, same labels); and check that a table
renderer honours alignment and has a caption slot before relying on it.

- **Desktop versus cloud** (src/data/blog.ts:346 "Zero setup: works from any browser",
  src/data/blog.ts:363 "Zero recurring cost for local execution"). Four lists, strengths
  and trade-offs for each model, of 4, 4, 5 and 2 items. Six attributes pair across them
  (setup, always-on, data path, cost, lock-in, control of the environment), for example
  src/data/blog.ts:349 "Always-on execution without keeping a machine running" against
  src/data/blog.ts:369 "Requires a machine running for scheduled tasks". The reader does
  the pairing. A says make it a table and finds no carrier; it also does not flag the
  lists, because they are not prose. B names the defect (two lists per option leave the
  pairing to the reader) and gives the move: one item per attribute with both models in
  it, six items.
- **Three DevOps workflows** (src/data/blog.ts:224 "Your team opens 20+ pull requests",
  src/data/blog.ts:232 "**Trigger**: Webhook from GitHub"). Each workflow carries
  the same attributes (problem, agent, trigger, connectors), and the trigger and
  connector lines are already a parallel list without list markers, rendered as separate
  paragraphs. A has no carrier. B: mark them as list items, same labels in each workflow.
- **The guide's numeric table** (the memories table above). A, read as written, applies rule 3
  (right-align numbers) to the markdown, and the alignment would be lost in rendering. B's
  renderer check catches it before the table is written: no alignment, no caption, so the
  fix is the component.

On all three B produces a change a writer can make today, and A produces either nothing or
a change the page would not show. This is judgment on the text and the code; no reader was
tested.

## Notice (not a writing finding)

By the code, the guide's table parser renders every separator row as a body row: the test
src/components/guide/guide-markdown/parseBlocks.tsx:232 "const dataStart =" strips every
separator character and then asks a one-or-more pattern to match the empty string, which it
cannot. Read in the code and reproduced by the field lane in node, not seen in a browser.

**Falsifier:** a rendered guide page showing a right-aligned numeric column or no dash row,
which would mean another layer handles alignment and separators. The blog and the guide were
not changed: the project's map does not join this bundle, and the copy and the components
are the owner's.
