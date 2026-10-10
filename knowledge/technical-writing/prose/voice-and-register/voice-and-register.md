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
fix is not a passive that hides its agent: "it was found" leaves out what did the finding,
which is worse than the first person. The fix is a different subject: the mechanism, the
system, the data, the measurement. "A tokenizer trained mostly on English text splits the
word into eight pieces" is active, impersonal and about the topic. The passive itself is
not the defect. A grammarian's review of the case against it calls the stylistic charges
"entirely baseless", and the passive is right where it keeps the known thing first. See
impersonal-results-reporting.

**Emphasis is positional, as a reader expectation.** Two writing teachers' essay on
scientific prose (Gopen and Swan, 1990) named the stress position at the end of a sentence
and the topic position at its start. Their ground is "a linguistic commonplace", not an
experiment, and they warn that none of their principles should be treated as rules. The
measured part is narrower. A sentence is understood faster when its given information has
a clear antecedent in what came before (Haviland and Clark, 1974). Given-before-new order
speeds reading in some constructions and not others (Clifton and Frazier, 2004). The craft
rule still holds as a default: old information first, the new number or finding last.
Rhythm is the paragraph-level version. That varied length holds attention is craft
judgement with no controlled study behind it. What is measured is a difference: human news
text scatters its sentence lengths more than model text does, and one 2026 comparison found
current instruction-tuned models writing longer sentences than human news writers, with
far fewer short ones. See sentence-rhythm-and-stress.

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

The em dash is the instructive case. It appears on every list of generated-prose tells.
A journalism-training publication reported in 2026 that writers were scrubbing em dashes
to avoid being mistaken for machines. At an editing society's conference it reported on, a
content-marketing speaker said that taking out a well-placed dash loses its meaning. Both
are true. The tell is also dated: the crowd-written field guide now heads its em dash
section with a date range ending September 2026, and the same report relays that only one
major chatbot still uses the mark as much as people do. A house may ban it to stop a
drafting model's overuse. It should record that as a house rule tied to a model habit, not
as a law of good prose, so the rule can be lifted when the habit fades, and the check
should cite the house rule.

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
  detector. Early detectors misfired on non-native writers. A 2026 test of thirteen, on
  non-native manuscripts and their professionally edited versions, found false-positive
  rates from 0 to 100 percent, and the same edit raised the score on some detectors and
  lowered it on others. The error depends on the tool, and whatever the tool, the score
  points at no span.
- **Uniformity as polish.** Every sentence the same length and shape reads as machine
  output even when a human wrote it; varied length is a feature of edited prose.
- **A pronoun count as a voice verdict.** A whole-word search for first-person pronouns
  over a real product blog flagged quoted prompts the reader is meant to type, bold UI
  labels and a code comment more often than author narration. A hit is a candidate to
  classify, not a finding.
- **Banning every tell regardless of context.** A real three-item list is not a triad
  defect; a single dash is not a tell. Density and function decide, not presence.

## Sources this subject rests on

- George Orwell, "Politics and the English Language", 1946, rules i to vi, read at
  https://www.orwellfoundation.com/the-orwell-foundation/orwell/essays-and-other-works/politics-and-the-english-language/
- George D. Gopen and Judith A. Swan, "The Science of Scientific Writing", American
  Scientist 78 (1990), read at https://www.cs.tufts.edu/comp/105-2015s/readings/sci.html
  and re-read 2026-10-10 at https://cseweb.ucsd.edu/~swanson/papers/science-of-writing.pdf:
  stress position and topic position, argued, with no experiment.
- Susan E. Haviland and Herbert H. Clark, "What's new? Acquiring new information as a
  process in comprehension", Journal of Verbal Learning and Verbal Behavior 13 (1974),
  doi:10.1016/S0022-5371(74)80003-4: given information with a direct antecedent is
  comprehended faster.
- Charles Clifton Jr. and Lyn Frazier, "Should given information come before new? Yes and
  no", Memory and Cognition (2004), doi:10.3758/BF03196867, abstract read 2026-10-10: the
  given-before-new preference "is not general".
- Geoffrey K. Pullum, "Fear and loathing of the English passive", Language and
  Communication (2014), doi:10.1016/j.langcom.2013.08.009, read 2026-10-10 at
  https://www.lel.ed.ac.uk/~gpullum/passive_loathing.pdf
- Alberto Muñoz-Ortiz, Carlos Gómez-Rodríguez and David Vilares, "Contrasting Linguistic
  Patterns in Human and LLM-Generated News Text", https://arxiv.org/abs/2308.09067 (2023),
  and Adrián Gude and others, "More Aligned, Less Diverse? Analyzing the Grammar and Lexicon
  of Two Generations of LLMs", https://arxiv.org/abs/2605.06030 (2026), both read
  2026-10-10: sentence-length spread, and the 2025 models' sentences 15 to 30 percent longer
  than human ones with 9 to 30 times fewer short sentences, each in English news text.
- "Wikipedia:Signs of AI writing", https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing,
  raw wikitext re-read 2026-10-10: categories of signs, the caveat that they are signs and
  not the problem, "do not solely rely on" detection tools, and that a detector percentage
  is not a valid criterion for speedy deletion (the page's own scope).
- Poynter, writers, editors and the em dash, 2026-09-28,
  https://www.poynter.org/reporting-editing/2026/ai-changing-human-writing-editors-em-dash/,
  re-read 2026-10-10: writers scrubbing dashes; a conference speaker calling the cut a loss.
- Hyeonchu Park, Gahye Jeong and Bugeun Kim, "Style as a Confound: False Positives in AI
  Detection of Non-Native Academic Writing", https://arxiv.org/abs/2608.26710 (2026-08-27),
  abstract read 2026-10-10: 135,389 manuscript pairs, thirteen detectors, false-positive
  rates on human-written text from 0 to 100 percent.
- Google developer documentation style guide, "Person", updated 2025-04-10,
  https://developers.google.com/style/person: address the reader as "you"; first-person
  plural is acceptable for the organization as author. Counter-evidence to a blanket
  third-person rule, recorded in impersonal-results-reporting.
