---
layer: technique
type: technique
subject: article-structure
technique: content-preview-block
status: forged
laws: [the-opening-promises-the-close-settles]
shared_with: []
use_when: [adding a preview after an article's opening, computing an honest read time, reviewing a post whose reader cannot tell what to expect]
---

# Content preview block

The concern: a reader who reaches the end of the opening has to decide whether to spend
the next ten or fifteen minutes, and without a preview they decide blind. A newcomer gives
up on a post that would have rewarded them; an expert scrolls past the section they came
for. **Directly after the opening, before the first section, state what the post is, what
it costs to read, how it is organized and what the reader will be able to do afterwards.**

## The four parts, in this order

1. **What the post is**, in one sentence that names the thesis, not the topic.
2. **An honest read time**, computed, with what it includes ("14 min including figure and
   table text"). Count prose, captions, table cells and code; add image time per figure on
   a declining scale; state the words-per-minute rate used. A read time guessed from prose
   alone under-states a figure-heavy post, and the reader notices by the third table.
3. **The structure**: the section headings as a linked outline, optionally with the counts
   of figures, tables and sources. Because the headings carry each section's claim (see
   information-carrying-headings), the outline is itself a summary.
4. **The benefit**: two or three outcomes phrased as capabilities ("after reading you will
   be able to estimate a request's cost per language from a parallel corpus"). Each one is
   a promise, and the closing chapter must settle it
   ([the opening promises, the close settles](../../../_laws.md#the-opening-promises-the-close-settles)).

## Procedure

- Write the outcomes before the body is drafted and check them against the body after.
  An outcome with no section that delivers it is cut or the section is written; an outcome
  that needs a whole extra post is a sequel, not a bullet.
- Compute the read time from the final text, never from the outline. Re-compute it after
  every round of edits that moves material between prose and figures.
- Keep the preview short enough to fit in one screen at the narrow viewport. A preview
  that itself needs scrolling has become an abstract.
- Address the reader as "you" in the outcomes if the house voice allows it; the rest of the
  preview, like the rest of the post, reports the topic (see the `voice-and-register`
  subject).

## Decision rules

- **When the platform shows its own read time, compute yours anyway and reconcile.**
  Platforms estimate from words and images with fixed rates; a post with dense tables or
  code reads slower than that estimate. Where they disagree, the preview states the
  computed figure and what it counts.
- **When an outcome is a feeling ("understand X better"), rewrite it as an action.** A
  capability can be checked at the close; a feeling cannot.
- **When the post is under about five minutes, shorten the preview to one line** with the
  thesis and the read time. The full block is for posts long enough to need a map.

## When not to use it

Short news items and announcements, where the first paragraph already is the whole
content. And never as a substitute for the opening scene: a post that opens on its preview
has spent its first lines on logistics.
