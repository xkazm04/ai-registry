---
layer: technique
type: technique
subject: article-structure
technique: opening-scene-hook
status: forged
laws: [the-opening-promises-the-close-settles, every-number-has-a-source-and-a-date]
shared_with: []
use_when: [writing the first lines of a technical article, choosing between several candidate openings, reviewing an opening that announces a topic instead of showing one]
---

# Opening scene hook

The concern: the first lines of a technical post decide whether a reader continues, and
most drafts spend them announcing the topic ("This article explores...") or setting an era
("In today's landscape..."). **Open on the smallest concrete instance of the problem the
post explains, with its numbers, so the opening is already evidence.**

## What a working opening scene is

1. **One object.** A message, a request, an invoice line, a failing query, a single word
   in two scripts. One, so the reader can hold it; concrete, so it can be measured.
2. **A surprising number about that object, in the first three sentences.** The number is
   the hook: the same short sentence measured at seventeen tokens in one language and
   thirty in another on the same current tokenizer; the same request timed warm and cold
   on one cache. The
   surprise must be real and sourced like every other number in the post
   ([every number has a source and a date](../../../_laws.md#every-number-has-a-source-and-a-date)).
3. **The question the number raises, stated or left plainly open.** Why does it cost
   more? Who pays? Is it shrinking? That question is the promise the closing chapter must
   settle ([the opening promises, the close settles](../../../_laws.md#the-opening-promises-the-close-settles)).
4. **Reusability.** The object can be followed through every later section. An opening
   whose object cannot recur is an anecdote; one that can is the start of the through-line.

## Procedure

- Write three candidate openings, each a different object. Keep the one whose object
  recurs in the most planned sections and whose number is most surprising to an expert,
  not to a newcomer. Newcomers are surprised by everything; an expert surprised by the
  opening keeps reading.
- Place the newest information at the end of each opening sentence, where readers put
  their emphasis ("...and forty-two of them cannot be printed on their own"). See the
  `voice-and-register` subject for the stress-position rule this borrows.
- Re-measure the opening's numbers last, after the body is final. Openings are written
  first and go stale first: a model, a price or a version changes during drafting, and the
  opening is the one place a stale number is read by everyone.

## Decision rules

- **When the scene needs a paragraph of setup before its number, it is the wrong scene.**
  Pick an object the reader recognizes without explanation.
- **When the most surprising number is historical, it is not the opening number.** An
  opening built on last generation's figures leads with a world the reader no longer lives
  in; re-base it on current systems and mention the old figure only as history if it
  earns a line.
- **When a round of review praises the opening, keep its structure and rhythm and
  re-measure its numbers.** Praise for an opening is praise for its shape, and the shape
  survives a change of data; rewriting it from scratch to fix a stale figure throws away
  the part that worked.

## When not to use it

Reference documentation, release notes and how-to guides open with what the reader needs
to do, not with a scene: the reader arrived with a task. The scene opening is for the
explanatory article, where the reader arrived with curiosity and has to be given a reason
to stay. A post that answers one practical question in its first fifty words belongs to a
search-driven composition standard, not this one.
