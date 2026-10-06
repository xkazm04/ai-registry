---
layer: golden-path
type: golden-path
subject: voice-and-register
status: forged
use_when: [drafting or editing the prose of a technical article, reviewing a model-drafted post before publication, writing the voice section of a brief or a deterministic prose check, deciding a house rule such as person or punctuation]
techniques:
  - impersonal-results-reporting
  - sentence-rhythm-and-stress
  - machine-prose-tell-removal
  - house-style-consistency
---

# Voice and register

The voice of a technical article is the set of choices that decide what a reader attends
to in each sentence: who or what is the grammatical subject, what lands at the end where
emphasis falls, how long the sentences run and how that length varies, and which habits of
generated or careless prose are allowed through. Readers rarely name these choices. They
name their effect: a post "reads like a lab notebook", "reads like a press release", "reads
like a chatbot", or simply reads.

A principal practitioner holds three things true about register in this genre.

**The topic is the protagonist.** A technical article reports what a system does and what a
measurement showed. When the author becomes the grammatical subject ("I ran", "my
reading", "we found"), the reader's attention moves from the finding to the finder, and the
result acquires the tone of an anecdote
([report the topic, not the author](../../_laws.md#report-the-topic-not-the-author)). The
fix is not the passive voice. A classic rule set for clear English says never use the
passive where the active will do, and a sentence that hides its agent behind "it was
found" is worse than the first person. The fix is a different subject: the mechanism, the
system, the data, the measurement. "A tokenizer trained mostly on English text splits the
word into eight pieces" is active, impersonal and about the topic. See
impersonal-results-reporting.

**Emphasis is positional.** Readers stress the end of a sentence and read its beginning as
the link to what came before. A writing study of scientific prose named these the stress
position and the topic position, and the craft rule follows directly: old information
first, new information last, so the number or the finding lands where the reader is already
leaning. Rhythm is the paragraph-level version of the same control: varied sentence length
keeps attention, uniform length lulls it, and a short sentence after long ones is the
strongest emphasis prose has. See sentence-rhythm-and-stress.

**Tells are properties, not provenance.** Generated drafts carry recurring habits:
importance narrated instead of shown, sentence-final participial commentary, triads whose
third item adds nothing, false contrasts, chat residue, vague attribution. A crowd-written
field guide to these habits says, of its own list, that the patterns are "only potential
signs of a problem, not the problem itself". The editor's question is therefore never "was
this generated?" but "does this span do work?", and a finding names the span and the
property ([a check names a property and a span](../../_laws.md#a-check-names-a-property-and-a-span)).
The English construction rules for these habits live in the `localization` bundle's
`english` subject, under its generated-prose patterns; this subject cites them and owns
what long-form reporting adds. See machine-prose-tell-removal.

## House decisions are decisions

Some register choices are not right or wrong but must be made once and held: whether the
reader is addressed as "you", whether em dashes are used, numerals versus words, how
measured quantities are formatted, whether section headings are sentence case. A post that
mixes them reads as assembled from parts. These belong in a short house sheet that both the
drafter and a deterministic check read. See house-style-consistency.

The em dash is the instructive case. It appears on every list of generated-prose tells,
and an editors' trade publication reported in 2026 that editors had started cutting it on
sight for that reason, while quoting editors who call that a loss of meaning: the dash is
legitimate punctuation, and removing it to avoid suspicion damages the sentence. Both are
true. A house may ban it to stop a drafting model's overuse; it should record that as a
house rule, not as a law of good prose, and the check should cite the house rule.

## What this subject does not own

- The construction-level English rules (puffery, participial tails, triads, copulas, vague
  attribution, false contrast) and their exceptions: the `localization` bundle's `english`
  subject.
- Brand voice and persuasive register for marketing posts: the `marketing` bundle.
- What counts as a source and how numbers are cited: the `evidence-and-sources` subject.

## Failure modes of the naive reading

- **Passive as a cure for the first person.** "It was measured that..." trades a voice
  problem for a clarity problem. Change the subject, not the voice.
- **Synonym swapping.** Replacing a flagged word with its synonym keeps the empty claim and
  defeats every later check. Remove the claim or supply the fact.
- **Detector-driven editing.** Rewriting until a detector score drops optimizes for the
  detector. Detectors misfire on non-native writers, and the score points at no span.
- **Uniformity as polish.** Every sentence the same length and shape reads as machine
  output even when a human wrote it; varied length is a feature of edited prose.
- **Banning every tell regardless of context.** A real three-item list is not a triad
  defect; a single dash is not a tell. Density and function decide, not presence.

## Sources this subject rests on

- George Orwell, "Politics and the English Language", 1946, rules i to vi, read at
  https://www.orwellfoundation.com/the-orwell-foundation/orwell/essays-and-other-works/politics-and-the-english-language/
- George D. Gopen and Judith A. Swan, "The Science of Scientific Writing", American
  Scientist 78 (1990), read at https://www.cs.tufts.edu/comp/105-2015s/readings/sci.html:
  stress position and topic position.
- "Wikipedia:Signs of AI writing", https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing,
  read 2026-10-05: categories of signs, the caveat that they are signs and not the problem,
  and that a detector percentage is not a valid criterion on its own.
- Poynter, editors and the em dash, 2026-09-28,
  https://www.poynter.org/reporting-editing/2026/ai-changing-human-writing-editors-em-dash/
- Google developer documentation style guide, "Person", updated 2025-04-10,
  https://developers.google.com/style/person: address the reader as "you"; first-person
  plural is acceptable for the organization as author. Counter-evidence to a blanket
  third-person rule, recorded in impersonal-results-reporting.
