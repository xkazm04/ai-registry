---
layer: application
type: application
subject: medium-format-fidelity
technique: highlighted-code-blocks
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16
applied: simulation
ab_verdict: better
---

# Nine prompts for a model, set as italic prose on a blog that has no code block

Read against the `personas-web` repository at `01eaee60` (origin/master) on 2026-10-10.
Anchors are relative to that tree. The version is witnessed by package.json:48 "^16.3.8".
The blog and guide are those of the `reading-column-and-type-scale` application beside this
file.

## What the two renderers offer

- **The blog has no block element for code.** Its line renderer knows headings, lists, a
  one-line italic block, and inline bold and code. Its feature doc says so,
  docs/features/content/blog.md:65 "No links, images, nested lists, tables, code fences".
  Inline code is monospace at 14 pixels inside 16-pixel text (line 16 of the post's
  BlogArticleContent.tsx under src/app/blog/[slug]/blog-article/). The blog has no copy
  affordance anywhere.
- **The guide has three.** A highlighted fence with a copy button,
  src/components/guide/blocks/CodeFence.tsx:145 "<CopyButton text={text} />", and two plain
  blocks for commands and before-and-after code. Each one scrolls inside itself.

## The prompts

The tutorials ask the reader to paste text into an agent's instructions. There are nine
such prompts.

- **Five are whole-line italic blocks.** They are at src/data/blog.ts lines 140, 298, 422,
  425 and 428, for example src/data/blog.ts:422 "Search the web for recent information about [topic]".
  They render as an italic paragraph with a left rule (lines 83 to 85 of
  BlogArticleContent.tsx), with the source's straight quotes kept inside the text and no
  copy affordance. No asterisk leaks from these.
- **Four are inline, inside a list item or a paragraph.** They are at lines 319, 320, 483
  and 495, for example src/data/blog.ts:319 "Adjust the prompt:" and
  src/data/blog.ts:483 "Create an agent with these instructions:". The inline parser splits
  only on double asterisks and backticks (line 2 of BlogArticleContent.tsx), so each
  prompt's single asterisks show on the page as literal characters. Two of the four are in a
  use-case post (`no-code-ai-agents-for-teams`), not a tutorial.

This corrects the `figures-and-tables` note's banked lead, which had the asterisks on four
of the five italic blocks.

## Simulation

Policy A is the technique before 2026-10-10. Every code block is monospaced and
highlighted; inline code only for literal identifiers; when the platform has no
highlighting, choose deliberately. Policy B adds two things:
- text the reader is meant to copy is a block, labelled as plain text, even when it is
  English;
- where the renderer has no block element, the defect is the renderer's, recorded as
  such.

- **The research prompt** (line 422, a whole-line block). A does not reach it: it is
  English, not code. B: a plain-text block with the placeholder `[topic]` marked, so the
  reader replaces it rather than pasting it.
- **The tuning prompts** (lines 319 and 320, inline in list items). A does not reach
  them. B moves each out of the list item into its own block. That also removes the
  leaking asterisks.
- **The setup instructions** (line 483, inline after a bold lead). A does not reach it.
  B: a block, and a renderer defect logged, because the blog cannot draw one. Restyling
  the prompt as a quotation would keep it uncopyable.

On all three B gives a change and A gives none. This is judgment on the text and the
renderer; no reader was tested. A copy button is not claimed as a measured gain: no study
of one was found by either research lane.

**Falsifier:** readers who paste the italic prompts with no edits and no stray characters
as reliably as from a block. Nothing was changed on the site: the project's map does not
join this bundle, and the copy and the renderer are the owner's.
