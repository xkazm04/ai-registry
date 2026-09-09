---
layer: technique
type: technique
subject: content-brief-and-article-composition
technique: article-block-budget-one-callout-one-cta
status: forged
laws: [never-invent-proof, a-gate-before-money-and-copy]
shared_with: []
use_when: [prompting a model to draft an article as typed blocks, designing an article content model, deciding what a draft validator should reject]
---

# The article block budget: one callout, one call to action

An article that a model or a templated writer produces is a sequence of typed blocks -
paragraph, heading, list, callout, call to action, figure - and a generator given no
budget produces either a listicle of fragments or a wall. The budget is a small set of
exactly-one and at-most-one rules that are easy to state, easy to obey and, crucially,
easy to check: exactly one callout, exactly one closing call to action, at most one
figure placeholder, paragraphs of two to four sentences, and a total block count in the
mid-teens for a standard post.

## The budget for a standard post

| Block | Budget | Why |
| --- | --- | --- |
| Opening paragraph | Exactly one, continuing the meta description | The reader who clicked on the meta description arrives expecting its promise kept; the opening is where it is kept |
| Section heading | One per outline section | The outline is the contract; a draft that adds or drops sections broke it |
| Paragraphs under a heading | One or two, each two to four sentences | Scanner pacing; a second idea in a paragraph is skipped |
| List | Optional per section, genuinely parallel items only | Lists fragment prose when the items are not parallel |
| Callout (tip, note, warning) | Exactly one | A second callout is a paragraph the writer wanted to shout; a fifth is a page of boxes |
| Call to action | Exactly one, closing | The closing action is for the highest-intent reader; the in-body link is a different device (see the mid-body technique) |
| Figure | At most one placeholder, described by what it should show | The generator never invents an image source; a human fills it from the library, and an unfilled placeholder is dropped at export |
| Total blocks | About sixteen | Convention; the number that keeps a five-to-seven section post inside a scanner's tolerance |

Every number here is convention except the figure rule, which is a fabrication guard
and follows from the proof law: a made-up image path is invented proof of an asset that
does not exist.

## Procedure

1. **State the budget in the prompt or the style guide as exact counts, not adjectives.**
   "Exactly one callout" is checkable; "use callouts sparingly" is not.
2. **Have the figure block carry a description and no source.** The description is
   what a human or a library search uses to find the real image; the source field is
   filled by the system, never by the writer.
3. **Normalise strictly and drop what is malformed** - a paragraph with no text, a list
   with no items, a heading with no text, a figure with no description. Correctness
   over coverage: a dropped block is visible in review; a malformed block that renders
   as an empty box is not.
4. **Validate the budget, not just the presence.** A validator that checks "at least
   one block" and "the FAQ exists" passes a draft with three callouts and no call to
   action. Count callouts, count calls to action, count figures, count total blocks,
   and fail loudly on each.
5. **Keep the repaired half honest.** When a model returns the body and not the FAQ,
   or the FAQ and not the body, the missing half is backfilled with a neutral marker
   that says generation failed - never with demo copy that reads as content, and never
   silently, because a placeholder answer that looks real is a fabricated answer.
6. **Make headings addressable.** Every section heading gets a stable identifier
   derived from its text so a table of contents and deep links resolve; a positional
   fallback guarantees one always exists.

## Decision rules

- **When a draft exceeds the budget, cut blocks rather than shorten all of them,
  because the budget exists to bound the number of decisions a scanner makes, and
  sixteen short blocks are still sixteen decisions.**
- **When the outline has more sections than the budget allows, the brief is wrong,
  not the draft; send it back, because a draft that silently merges two sections has
  changed the contract the brief was.**
- **When a composition rule lives only in the prompt, add it to the validator the same
  day, because a prompt is a request and a validator is a gate, and the gate is what
  stops the second callout reaching the editor.**
- **When the figure placeholder stays empty at export, drop it; when a source is
  present, require description, width and height, because a figure without those is
  either an accessibility failure or a layout shift.**

## When NOT to use

- **A pillar page.** Its shape is a short router: an orientation, a section per spoke
  with a passage and a link, a table of contents. The standard-post budget would make
  it a long article competing with its own spokes.
- **A long-form investigation or a data study the business publishes as its
  information gain.** Multiple tables and figures are the point; the budget there is
  set by the material, and the rhythm rules still apply.
- **A money page.** Its block model is hero, proof, offer, form; a callout-and-CTA
  budget written for articles produces a blog post with a form bolted on.
