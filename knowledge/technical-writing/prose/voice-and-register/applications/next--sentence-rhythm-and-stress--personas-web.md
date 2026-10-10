---
layer: application
type: application
subject: voice-and-register
technique: sentence-rhythm-and-stress
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16
applied: simulation
ab_verdict: better
---

# A monotony check on ten posts: twelve runs flagged, none of them monotony

Read against the `personas-web` repository at `01eaee60` (origin/master) on 2026-10-10.
Anchors are relative to that tree. The version is witnessed by package.json:48 "^16.3.8".
The posts are the ten Markdown strings in src/data/blog.ts.

## What was measured

The post prose was split into sentences after a full stop, question mark or exclamation
mark followed by a capital, a digit or an opening quote, with "e.g.", "i.e.", "etc." and
"vs." protected. The split was hand-checked on six paragraphs. It still treats a colon
lead-in such as "Strengths:" as a sentence.

- 238 sentences, mean 11.1 words, standard deviation 7.2, coefficient of variation 0.65. Per
  post it runs from 0.38 to 1.11. The blog is not uniform.
- Runs of four or more consecutive sentences within three words of the run's mean: 12 when
  counted across paragraphs, 2 within a paragraph. Within 20 percent of the mean, inside a
  paragraph: none.
- 26 sentences hold a numeral. In 4 of them the only numeral is the cipher name "AES-256".

## The runs, read

- **Across a heading and through lead-ins.** Most of the 12 cross-paragraph runs join
  sentences on either side of a heading, or chain colon lead-ins,
  src/data/blog.ts:361 "**Strengths:**". These are artifacts of where the count ran.
- **A question-and-answer run.** src/data/blog.ts:565 "Need a custom model endpoint? Check if it's supported."
  runs 7, 5, 4, 7, 4, 8 and 3 words. At a mean near five, three words either side is a
  band of about 60 percent, so the rule fires on a deliberate parallel structure.
- **An anaphora run.** src/data/blog.ts:555 "Your credentials are encrypted in your OS keyring."
  sits in four sentences of 10, 6, 8 and 9 words, three of them opening on "Your". This is a
  list set as sentences, a rhetorical choice. A reader may still find it flat; the length
  check is not the instrument that decides it.
- **Numbers.** One lands at the stress position, src/data/blog.ts:105 "to under 30 seconds.",
  and one opens its clause, src/data/blog.ts:576 "Run 50 agents on hourly schedules".

## Simulation

Policy A is the technique before 2026-10-10: four or more consecutive sentences in the same
narrow band are a finding; combine two or split one. Policy B scopes the run to a
paragraph, sets the band at 20 percent of the run's mean, skips headings, list items and
colon lead-ins, and treats a deliberate parallel run as structure.

- **The 12 cross-paragraph runs.** A, read with a three-word band, edits sentences that are
  not adjacent prose. B raises none of them.
- **The two runs inside a paragraph.** A asks for a split or a merge in both parallel
  structures. B exempts both and leaves the choice to the writer.
- **A control.** A paragraph of five sentences of 17, 19, 21, 18 and 20 words falls inside
  both bands (16 to 22 words, and 15.2 to 22.8), so both policies flag it. The narrowing
  loses no uniform run of that shape.

B removes every flag on this blog and keeps the case the rule was written for. The blog's
measured spread says there was little to find. This is arithmetic on the split text and a
reading of each run; no edit was made.

**Falsifier:** a paragraph readers call monotonous whose sentences vary by more than 20
percent, which would mean the band is too narrow. The project's map does not join this
bundle, so the seam was not applied.
