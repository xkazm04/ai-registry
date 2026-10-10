---
layer: technique
type: technique
subject: voice-and-register
technique: impersonal-results-reporting
status: forged
laws: [report-the-topic-not-the-author, a-check-names-a-property-and-a-span]
shared_with: []
use_when: [rewriting first-person narration in a technical post, reporting the article's own measurements, writing a voice check for a drafting pipeline]
---

# Impersonal results reporting

The concern: a post that narrates its author ("I counted", "my reading is", "we were
surprised") turns findings into an account of someone's afternoon. The reader's attention
goes to the person, the claim sounds provisional, and every result needs the reader to trust
the narrator. **Report results as facts about the topic, with the system, the data or the
measurement as the grammatical subject; state how they were obtained impersonally, and log
the full method where a reader can repeat it.**
([report the topic, not the author](../../../_laws.md#report-the-topic-not-the-author))

## Rewrites, by pattern

| Author-centred | Topic-centred |
|---|---|
| I counted the tokens on five tokenizers. | Counted on five current tokenizers, the Hindi sentence takes 23 to 56 tokens. |
| My reading of the evidence is that quality does not track cost. | The evidence does not show quality tracking cost: one study finds no correlation, another finds the reverse. |
| We found that the cache misses. | The cache misses whenever the prefix bytes differ, and normalization changes them. |
| I would repeat this measurement on every upgrade. | The measurement is cheap enough to repeat on every model upgrade. |

## The passive trap

The reflex fix for "I measured" is "it was measured", and it is the wrong one. Here the
agentless passive hides exactly the information a technical reader wants: what did the
measuring and under what conditions. Change the subject instead of the voice. "The
measurement shows", "a tokenizer trained mostly on English splits", "the parallel corpus
gives" are active and impersonal.

The defect is the hidden agent, not the passive. A grammarian's review of the case against
the passive (Pullum, 2014) finds its stylistic charges "entirely baseless" and says critics
confuse the grammar with a rhetorical failure to attribute agency. The passive is right
where the agent is irrelevant ("the vocabulary is built by repeated merging"), and where it
keeps the known thing in subject position so the new agent lands at the end. The essay that
named the stress position models its own best revision as a passive, and warns against
"slavish adherence" to the active voice. The passive is not a machine tell either: one
corpus study measured an instruction-tuned model using the agentless passive at roughly half
the human rate (Reinhart et al., 2025).

## Own measurements

When the article measured something itself, say so once, impersonally and specifically,
where the number first appears: "measured for this article with a tokenizer library at a
stated version, on a stated date, over a stated corpus". The commands, versions and corpus
go into the run's research log or a methods note, not into the prose. The measurement then
becomes source number one in the article's sources list (see the `evidence-and-sources`
subject), and later uses cite it like any other source.

## Procedure

1. Search the draft's prose for first-person pronouns and possessives as whole words.
   Strip first what is not the author's voice: quoted text, including prompts or commands
   the reader is meant to type; UI labels; code, code comments and directive blocks. Match
   a capital "I" case-sensitively, so "i.e." and loop variables do not hit. Add the forms a
   bare pronoun list misses: "let's", "mine", "myself", "ours", "ourselves". Each remaining
   hit is a candidate with its span
   ([a check names a property and a span](../../../_laws.md#a-check-names-a-property-and-a-span)).
   On a product blog of ten posts, the unstripped search returned 8 hits and 2 were the
   author's voice.
2. Classify each candidate before rewriting: author narration, the organization speaking
   as author, a reader-inclusive "we" ("we can see that x doubles"), or quoted speech.
   Only narration is this technique's defect. An organization "we" is a house decision (see
   house-style-consistency); when it reports an observation ("workflows we've seen users
   build"), the defect is the missing source, not the pronoun.
3. For each narration hit, ask what the sentence is about, make that the subject, and
   rewrite. Delete the sentence if it is only about the author. Never swap "I" for "the
   author": the APA style guidance says not to use the third person to refer to yourself,
   and the swap keeps the author as the subject.
4. Re-run the search over the article's companion files too (notes, source logs): a
   research log written in the first person tends to leak phrasing back into the page.
5. Allow "you" where the house voice addresses the reader (preview outcomes, a changed
   action in the close); see house-style-consistency. Reader address and author narration
   are separate axes: the same blog addressed its reader 152 times and narrated its author
   once.

## Decision rules

- **Quoted speech is exempt.** A quoted source's "I" or "we" stays; it is theirs.
- **A disclosure is not narration.** A conflict of interest or a limitation of the author's
  own setup may need a first-person sentence to be honest; prefer the impersonal form ("the
  measurement ran on one machine") and keep the first person only where the impersonal form
  would hide responsibility.
- **Counter-evidence about the rule itself.** Major style authorities do not ban the first
  person. One developer documentation guide accepts first-person plural "to refer to the
  organization that's represented as the author". The APA's guidance says to use first-person
  pronouns "to describe your work", and a leading science journal family recommends the
  active voice with "we performed the experiment". The long argument for active verbs in
  scientific writing usually ends, in a methods section, at "we".
  The rule here is a register choice for the reported technical article, adopted because
  author narration was the defect a reviewer named. A house that publishes first-person
  essays should record the opposite rule and check for that instead.

## When not to use it

Personal essays, retrospectives and post-mortems written as accounts of what a team did,
where the people are the subject. And first-person reflection a post explicitly labels as
opinion, which some houses prefer to state as "the author's position" rather than hide.
