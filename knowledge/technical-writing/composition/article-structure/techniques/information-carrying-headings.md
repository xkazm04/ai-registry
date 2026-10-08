---
layer: technique
type: technique
subject: article-structure
technique: information-carrying-headings
status: forged
laws: [the-opening-promises-the-close-settles]
shared_with: []
use_when: [writing section headings for a long post, building the outline a content preview links to, reviewing a post that a scanning reader cannot navigate]
---

# Information-carrying headings

The concern: most readers of a long page scan before they read, looking at headings and the
first words under them. Eye-tracking research on web reading describes the resulting
pattern and its remedy: put the most important points in the first two paragraphs, and
start headings and subheadings with the words that carry the most information (Nielsen
Norman Group, 2017, reviewed 2026). **A section heading states the section's claim, front-
loaded, so the sequence of headings is itself a summary of the argument.**

## The rule, by example of its failure

| Topic heading (fails) | Claim heading (works) |
|---|---|
| Caching | A cache keyed on unnormalized text misses in every locale that composes differently |
| Quality | Paying more per token did not buy accuracy in the one study that tested it |
| Background | Merge order decides which scripts get whole words |

The topic heading tells the scanning reader where they are. The claim heading tells them
what is true, which is what they were scanning for, and it lets the expert decide that a
section is the one they came for.

## Procedure

- Write each heading as a short declarative claim that the section proves. If it cannot be
  written, the section has no claim yet, and that is a drafting problem the heading has
  exposed rather than caused.
- Put the information-carrying words first. "Normalization changes the cache key" beats
  "Why you should care about how normalization changes the cache key".
- Keep headings at one level under the title where the target platform allows only two
  heading levels; a third level that the platform flattens becomes bold text and breaks
  the outline.
- Generate the content preview's outline from the headings, never by hand, so the preview
  and the body cannot disagree. The outline is the preview's promise of a route
  ([the opening promises, the close settles](../../../_laws.md#the-opening-promises-the-close-settles)).

## Decision rules

- **When a claim heading runs past about twelve words, split the claim or cut the
  qualifier.** The qualification belongs in the section's first paragraph.
- **When two headings make the same claim, merge the sections.** Repetition in headings is
  repetition in the argument.
- **Keep the closing chapter's heading a claim too** ("What the refund message showed"),
  not a label ("Conclusion"). A reader skimming to the end to decide whether the post was
  worth it reads that heading first.
- **Clever headings fail the scan.** A pun or an allusion carries no information to a
  reader who has not read the section yet; scanning research recommends straightforward
  headings for exactly this reason.

## When not to use it

Reference pages whose readers navigate by name ("Configuration", "Errors") need topic
headings, because the reader is looking up a known place, not following an argument.
