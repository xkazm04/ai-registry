---
layer: technique
type: technique
subject: voice-and-register
technique: sentence-rhythm-and-stress
status: forged
laws: [report-the-topic-not-the-author]
shared_with: []
use_when: [editing sentences so findings land with emphasis, revising prose that reads as monotonous or machine-uniform, placing numbers inside sentences]
---

# Sentence rhythm and stress

The concern: two drafts can contain the same facts and read completely differently, because
emphasis in a sentence is positional and attention across a paragraph is rhythmic. A draft
that puts its number in the middle of a clause and runs every sentence at the same length
buries its findings. **Put old information at the start of a sentence and the new finding at
the end; vary sentence length so the important sentence can be short.**

## Stress and topic position

Readers emphasize what arrives at the end of a sentence, and they read its beginning as the
link to what came before and the perspective for what follows. Two writing teachers' essay
on scientific prose named these the stress position and the topic position (Gopen and
Swan, 1990). It argues from "a linguistic commonplace" and runs no experiment, and it says
none of its principles should be considered rules. The experimental record is narrower:
a sentence whose given information has a direct antecedent is understood faster (Haviland
and Clark, 1974), and given-before-new order speeds reading in double-object sentences but
not in their prepositional counterparts, so the preference "is not general" (Clifton and
Frazier, 2004). Treat the positions as a strong default, not a law. Three rules follow:

1. **The topic position holds the topic.** The thing the paragraph is about (the running
   example, the system, the measurement) opens the sentence, which is also where the
   impersonal subject lives
   ([report the topic, not the author](../../../_laws.md#report-the-topic-not-the-author)).
2. **The stress position holds the new number or claim.** "Hindi takes 85 tokens on that
   tokenizer, and 42 of them cannot be printed on their own" ends on the surprise. "42 of
   the 85 tokens Hindi takes on that tokenizer are unprintable" spends the stress position on
   the tokenizer.
3. **One stress per sentence.** Two new findings in one sentence compete for the end; split
   the sentence.

## Rhythm

A paragraph of sentences of similar length and shape reads as monotonous, and is one of
the habits readers now associate with generated text. Edited prose varies: a long sentence
that builds the mechanism, a medium one that applies it, a short one that lands the
consequence. The short sentence after several long ones is a strong emphasis, which is why
it should be spent on the finding and not on a slogan.

What is measured and what is craft differ here. No controlled study found varied length
improving comprehension or attention; readability research models average length, not its
spread. The corpus difference is measured: human news text scatters its sentence lengths
more than model text (Muñoz-Ortiz and others, 2023), and a 2026 comparison found 2025
models writing sentences 15 to 30 percent longer than human news writers, with short
sentences 9 to 30 times rarer. So the machine-uniform paragraph is long sentences and few
short ones, in that genre. Sentence-length spread is not a detector: the tool that
popularized it as one replaced it with a trained classifier in 2023.

## Procedure

1. Read each paragraph and mark the one new thing it says. Move that thing to the end of the
   sentence that carries it.
2. Check the first words of each sentence: do they link back (old information) or jump to
   something new? A sentence that opens on new information makes the reader hold it without
   context.
3. Scan sentence lengths per paragraph. Where four or more consecutive sentences sit in the
   same narrow band, combine two or split one. Scope the run to one paragraph, and set the
   band relative to the run's mean (within 20 percent), not in absolute words: at a mean
   of four words, a band of three words either side is 75 percent. Do not count across a
   heading, a list item or a colon lead-in ("Strengths:"). A deliberate parallel run
   (question, answer, question, answer) is structure, not monotony. On a ten-post product
   blog, a three-word band across paragraphs flagged 12 runs, mostly spurious; within
   paragraphs it flagged 2, one real; a 20 percent band flagged none.
4. Read the paragraph aloud or with a text-to-speech pass. Monotony that the eye misses, the
   ear catches.

## Decision rules

- **Do not manufacture rhythm with fragments.** A run of short verbless fragments for effect
  is a recognized generated-prose habit; one per post at most, and only where it carries a
  real finding.
- **A short sentence is earned by the long ones before it.** A paragraph of short sentences
  has no emphasis left to give.
- **Numbers at the stress position, units with them.** "...costs 1.76 times as much" lands;
  "...costs, at 1.76, more" does not. A check for this counts quantities, not digits: on
  the same blog, 4 of the 26 sentences with a numeral held it only in a cipher name.
  Across all 26, the last numeral sat in the final third 11 times and mid-sentence 12.

## When not to use it

Reference prose and step-by-step instructions, where predictability is the point and the
reader is scanning for the next action rather than following an argument.
